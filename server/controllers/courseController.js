import asyncHandler from 'express-async-handler';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import Assignment from '../models/assignmentModel.js';
import Notification from '../models/notificationModel.js';
import cloudinary from '../config/cloudinary.js';

const getCourses = asyncHandler(async (req, res) => {
  const keyword = req.query.keyword ? { title: { $regex: req.query.keyword, $options: 'i' } } : {};
  const courses = await Course.find({ ...keyword }).populate('lecturer', 'name email');
  res.json(courses);
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('students', 'name email').populate('assignments');
  if (course) {
    const lecturer = await User.findById(course.lecturer).select('name email');
    const courseObject = course.toObject();
    courseObject.lecturer = lecturer;
    res.json(courseObject);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ lecturer: req.user._id });
  res.json(courses);
});

const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim() || !description || !description.trim()) {
    res.status(400); throw new Error('Title and description are required');
  }
  const course = new Course({ title, description, lecturer: req.user._id });
  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

const updateCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized');
    }
    course.title = title || course.title;
    course.description = description || course.description;
    const updatedCourse = await course.save();
    res.json(updatedCourse);
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

const addLectureToCourse = asyncHandler(async (req, res) => {
  const { title, videoUrl, videoPublicId, notesUrl, notesPublicId } = req.body;
  const course = await Course.findById(req.params.id);
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  
  course.lectures.push({ title, videoUrl, videoPublicId, notesUrl, notesPublicId });
  
  try {
    const updatedCourse = await course.save();
    try {
      const message = `A new lecture "${title}" was added to the course "${course.title}".`;
      const link = `/course/${course._id}`;
      if (course.students && course.students.length > 0) {
        const notificationDocs = course.students.map(studentId => ({ user: studentId, message, link }));
        const createdNotifications = await Notification.insertMany(notificationDocs);
        const { io, userSocketMap } = req;
        createdNotifications.forEach(notification => {
          const socketId = userSocketMap.get(notification.user.toString());
          if (socketId) { io.to(socketId).emit('new_notification_data', notification); }
        });
      }
    } catch (notificationError) {
      console.error('Failed to create notifications for new lecture:', notificationError);
    }
    res.status(201).json(updatedCourse);
  } catch (saveError) {
    console.error('FATAL ERROR ON course.save() in addLectureToCourse:', saveError);
    res.status(500);
    throw new Error('Database error while saving the lecture.');
  }
});

const deleteLectureFromCourse = asyncHandler(async (req, res) => {
  const { courseId, lectureId } = req.params;
  const course = await Course.findById(courseId);
  
  if (!course) { res.status(404); throw new Error('Course not found'); }
  if (course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }

  const lecture = course.lectures.id(lectureId);
  if (!lecture) { res.status(404); throw new Error('Lecture not found'); }

  const videoPublicId = lecture.videoPublicId;
  const notesPublicId = lecture.notesPublicId;

  course.lectures.pull(lectureId);
  await course.save();

  const deletionPromises = [];
  if (videoPublicId) {
    deletionPromises.push(cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' }));
  }
  if (notesPublicId) {
    deletionPromises.push(cloudinary.uploader.destroy(notesPublicId, { resource_type: 'raw' }));
  }
  
  try {
    if (deletionPromises.length > 0) {
      await Promise.all(deletionPromises);
    }
  } catch (err) {
    console.error("A non-critical error occurred during Cloudinary asset deletion:", err);
  }
  
  res.json({ message: 'Lecture deleted' });
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized');
    }

    const publicIdsToDelete = [];
    course.lectures.forEach(lecture => {
      if (lecture.videoPublicId) publicIdsToDelete.push({ id: lecture.videoPublicId, type: 'video' });
      if (lecture.notesPublicId) publicIdsToDelete.push({ id: lecture.notesPublicId, type: 'raw' });
    });
    
    const assignments = await Assignment.find({ '_id': { $in: course.assignments } });
    assignments.forEach(ass => {
        if (ass.instructionFilePublicId) {
            publicIdsToDelete.push({ id: ass.instructionFilePublicId, type: 'raw' });
        }
    });

    if (publicIdsToDelete.length > 0) {
      console.log(`[Lecturer] Deleting ${publicIdsToDelete.length} assets from Cloudinary for course ${course.title}.`);
      try {
        await Promise.all(publicIdsToDelete.map(asset => 
          cloudinary.uploader.destroy(asset.id, { resource_type: asset.type })
        ));
      } catch (err) {
        console.error("Error during bulk deletion of course assets by lecturer:", err);
      }
    }
    
    await Assignment.deleteMany({ course: course._id });
    await course.deleteOne();
    res.json({ message: 'Course and associated assets deleted' });
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.students.includes(req.user._id)) {
      res.status(400); throw new Error('Already enrolled');
    }
    course.students.push(req.user._id);
    await course.save();
    res.json({ message: 'Enrolled successfully' });
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

// New controller: Get all course users
const getCourseUsers = asyncHandler(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId)
    .populate('lecturer', 'name email role')
    .populate('students', 'name email role');

  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const users = [
    {
      _id: course.lecturer._id,
      name: course.lecturer.name,
      email: course.lecturer.email,
      role: 'lecturer'
    },
    ...course.students.map(student => ({
      _id: student._id,
      name: student.name,
      email: student.email,
      role: 'student'
    }))
  ];

  res.json(users);
});

export {
  createCourse,
  addLectureToCourse,
  getCourses,
  getCourseById,
  getMyCourses,
  updateCourse,
  enrollInCourse,
  deleteLectureFromCourse,
  deleteCourse,
  getCourseUsers,
};
