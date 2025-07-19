import asyncHandler from 'express-async-handler';
import Course from '../models/courseModel.js';
import User from '../models/userModel.js';
import Assignment from '../models/assignmentModel.js';

const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({});
  const populatedCourses = await Promise.all(
    courses.map(async (course) => {
      const lecturer = await User.findById(course.lecturer).select('name email');
      const courseObject = course.toObject();
      courseObject.lecturer = lecturer;
      return courseObject;
    })
  );
  res.json(populatedCourses);
});

const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    const [lecturer, students, assignments] = await Promise.all([
      User.findById(course.lecturer).select('name email'),
      User.find({ '_id': { $in: course.students } }).select('name email'),
      Assignment.find({ '_id': { $in: course.assignments } }),
    ]);
    const courseObject = course.toObject();
    courseObject.lecturer = lecturer;
    courseObject.students = students;
    courseObject.assignments = assignments;
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
  if (!title || !description) { res.status(400); throw new Error('Title and description are required'); }
  const course = new Course({ title, description, lecturer: req.user._id });
  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

const updateCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
    course.title = title || course.title;
    course.description = description || course.description;
    await course.save();
    res.json(course);
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
    await course.deleteOne();
    res.json({ message: 'Course deleted' });
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

const addLectureToCourse = asyncHandler(async (req, res) => {
  const { title, videoUrl, notesUrl } = req.body;
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
    course.lectures.push({ title, videoUrl, notesUrl });
    await course.save();
    res.status(201).json(course);
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

const deleteLectureFromCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
    course.lectures.pull({ _id: req.params.lectureId });
    await course.save();
    res.json({ message: 'Lecture deleted' });
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

const enrollInCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.students.includes(req.user._id)) { res.status(400); throw new Error('Already enrolled'); }
    course.students.push(req.user._id);
    await course.save();
    res.json({ message: 'Enrolled successfully' });
  } else {
    res.status(404); throw new Error('Course not found');
  }
});

const createAnnouncement = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    res.status(400);
    throw new Error('Announcement content cannot be empty');
  }
  const course = await Course.findById(req.params.id);
  if (course) {
    if (course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized to make announcements for this course');
    }
    course.announcements.push({ content });
    await course.save();
    res.status(201).json(course.announcements);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

export {
  createCourse, addLectureToCourse, getCourses, getCourseById, getMyCourses,
  updateCourse, enrollInCourse, deleteLectureFromCourse, deleteCourse,
  createAnnouncement,
};