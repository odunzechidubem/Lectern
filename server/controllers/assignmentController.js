// /server/controllers/assignmentController.js

import asyncHandler from 'express-async-handler';
import Assignment from '../models/assignmentModel.js';
import Course from '../models/courseModel.js';
import Submission from '../models/submissionModel.js';
import Notification from '../models/notificationModel.js';
import cloudinary from '../config/cloudinary.js';

const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, courseId, instructionFileUrl, instructionFilePublicId } = req.body;
  
  if (!title || !dueDate || !courseId) {
    res.status(400);
    throw new Error('Title, due date, and course ID are required.');
  }

  const course = await Course.findById(courseId);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized');
  }

  // --- THIS IS THE FIX ---
  const assignment = await Assignment.create({ 
    course: courseId, 
    title, 
    description, 
    dueDate, 
    instructionFileUrl, 
    instructionFilePublicId // Save the publicId
  });
  
  course.assignments.push(assignment._id);
  await course.save();

  try {
    const message = `A new assignment "${title}" was added to the course "${course.title}".`;
    const link = `/course/${course._id}/assignment/${assignment._id}`;
    const notificationDocs = course.students.map(studentId => ({ user: studentId, message, link }));

    if (notificationDocs.length > 0) {
      const createdNotifications = await Notification.insertMany(notificationDocs);
      const { io, userSocketMap } = req;
      
      createdNotifications.forEach(notification => {
        const socketId = userSocketMap.get(notification.user.toString());
        if (socketId) {
          io.to(socketId).emit('new_notification_data', notification);
        }
      });
    }
  } catch (error) {
    console.error('Failed to create assignment notifications:', error);
  }

  res.status(201).json(assignment);
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const { courseId, assignmentId } = req.body; // Assuming these are passed in the body for mutations
  const assignment = await Assignment.findById(assignmentId);

  if (assignment) {
    const course = await Course.findById(assignment.course);
    if (!course || course.lecturer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('User not authorized');
    }

    // --- THIS IS THE FIX ---
    if (assignment.instructionFilePublicId) {
      try {
        // Use 'raw' for non-image/video files like PDFs
        await cloudinary.uploader.destroy(assignment.instructionFilePublicId, { resource_type: 'raw' });
      } catch (err) {
        console.error("Failed to delete assignment instruction file from Cloudinary:", err);
      }
    }

    course.assignments.pull(assignment._id);
    await course.save();
    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } else {
    res.status(404);
    throw new Error('Assignment not found');
  }
});

const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (assignment) {
    const submission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
    res.json({ assignment, submission });
  } else {
    res.status(404);
    throw new Error('Assignment not found');
  }
});

const getSubmissionsForAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }
  const course = await Course.findById(assignment.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized');
  }
  const submissions = await Submission.find({ assignment: req.params.id }).populate('student', 'name email');
  res.json(submissions);
});

const submitAssignment = asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) {
    res.status(400);
    throw new Error('File URL is required for submission.');
  }

  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(assignment.dueDate);

  if (today > dueDate) {
    res.status(403);
    throw new Error('The deadline for this assignment has passed. Submissions are no longer accepted.');
  }

  const course = await Course.findById(assignment.course);
  const isEnrolled = course.students.some(s => s.toString() === req.user._id.toString());
  if (!isEnrolled) {
    res.status(403);
    throw new Error('You must be enrolled to submit');
  }

  const existingSubmission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
  if (existingSubmission) {
    res.status(400);
    throw new Error('You have already submitted this assignment');
  }

  const submission = await Submission.create({
    assignment: req.params.id,
    course: assignment.course,
    student: req.user._id,
    fileUrl,
  });
  res.status(201).json(submission);
});

export {
  createAssignment,
  deleteAssignment,
  getAssignmentById,
  submitAssignment,
  getSubmissionsForAssignment,
};