import asyncHandler from 'express-async-handler';
import Assignment from '../models/assignmentModel.js';
import Submission from '../models/submissionModel.js';
import Course from '../models/courseModel.js';

// @desc    Create an assignment for a course
// @route   POST /api/assignments
// @access  Private/Lecturer
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, courseId } = req.body;
  const course = await Course.findById(courseId);

  // Check if user is the course lecturer
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to add assignments to this course');
  }

  const assignment = await Assignment.create({
    course: courseId,
    title,
    description,
    dueDate,
  });

  // Add assignment reference to the course
  course.assignments.push(assignment._id);
  await course.save();

  res.status(201).json(assignment);
});

// @desc    Submit a file for an assignment
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
const submitAssignment = asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  const assignment = await Assignment.findById(req.params.id);

  if (!assignment) {
    res.status(404);
    throw new Error('Assignment not found');
  }

  // A student can only submit to a course they are enrolled in
  const course = await Course.findById(assignment.course);
  const isEnrolled = course.students.some(
    (s) => s.toString() === req.user._id.toString()
  );
  if (!isEnrolled) {
    res.status(403);
    throw new Error('You must be enrolled in the course to submit this assignment');
  }

  // Check if already submitted
  const existingSubmission = await Submission.findOne({
    assignment: req.params.id,
    student: req.user._id,
  });
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

// We will add more controllers here for grading later
export { createAssignment, submitAssignment };