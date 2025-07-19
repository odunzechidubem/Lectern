import asyncHandler from 'express-async-handler';
import Assignment from '../models/assignmentModel.js';
import Submission from '../models/submissionModel.js';
import Course from '../models/courseModel.js';

const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, courseId, instructionFileUrl } = req.body;
  const course = await Course.findById(courseId);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('User not authorized'); }
  const assignment = await Assignment.create({ course: courseId, title, description, dueDate, instructionFileUrl });
  course.assignments.push(assignment._id);
  await course.save();
  res.status(201).json(assignment);
});

const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const course = await Course.findById(assignment.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('User not authorized'); }
  course.assignments.pull(req.params.id);
  await course.save();
  await assignment.deleteOne();
  res.status(200).json({ message: 'Assignment deleted' });
});

const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const submission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
  res.status(200).json({ assignment, submission });
});

const submitAssignment = asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const course = await Course.findById(assignment.course);
  const isEnrolled = course.students.some(s => s.toString() === req.user._id.toString());
  if (!isEnrolled) { res.status(403); throw new Error('You must be enrolled to submit'); }
  const existingSubmission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
  if (existingSubmission) { res.status(400); throw new Error('You have already submitted this assignment'); }
  const submission = await Submission.create({
    assignment: req.params.id, course: assignment.course, student: req.user._id, fileUrl,
  });
  res.status(201).json(submission);
});

const getSubmissionsForAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const course = await Course.findById(assignment.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized');
  }
  const submissions = await Submission.find({ assignment: req.params.id }).populate('student', 'name email');
  res.status(200).json(submissions);
});

export { createAssignment, deleteAssignment, getAssignmentById, submitAssignment, getSubmissionsForAssignment };