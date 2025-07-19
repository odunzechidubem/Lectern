import asyncHandler from 'express-async-handler';
import Assignment from '../models/assignmentModel.js';
import Submission from '../models/submissionModel.js';
import Course from '../models/courseModel.js';
import Notification from '../models/notificationModel.js';

// CREATE assignment
const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, dueDate, courseId, instructionFileUrl } = req.body;
  const course = await Course.findById(courseId);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  const assignment = await Assignment.create({ course: courseId, title, description, dueDate, instructionFileUrl });
  course.assignments.push(assignment._id);
  await course.save();
  try {
    const message = `A new assignment "${title}" was added to the course "${course.title}".`;
    const link = `/course/${course._id}/assignment/${assignment._id}`;
    const notifications = course.students.map(studentId => ({ user: studentId, message, link }));
    if (notifications.length > 0) { await Notification.insertMany(notifications); }
  } catch (error) { console.error('Failed to create notifications for new assignment:', error); }
  res.status(201).json(assignment);
});

// DELETE assignment
const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (assignment) {
    const course = await Course.findById(assignment.course);
    if (!course || course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
    course.assignments.pull(assignment._id);
    await course.save();
    await assignment.deleteOne();
    res.json({ message: 'Assignment deleted' });
  } else {
    res.status(404); throw new Error('Assignment not found');
  }
});

// GET assignment details
const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (assignment) {
    const submission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
    res.json({ assignment, submission });
  } else {
    res.status(404); throw new Error('Assignment not found');
  }
});

// SUBMIT assignment
const submitAssignment = asyncHandler(async (req, res) => {
  const { fileUrl } = req.body;
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const course = await Course.findById(assignment.course);
  if (!course.students.includes(req.user._id)) { res.status(403); throw new Error('Not enrolled'); }
  if (await Submission.findOne({ assignment: req.params.id, student: req.user._id })) { res.status(400); throw new Error('Already submitted'); }
  const submission = await Submission.create({ assignment: req.params.id, course: assignment.course, student: req.user._id, fileUrl });
  res.status(201).json(submission);
});

// GET all submissions for an assignment
const getSubmissionsForAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) { res.status(404); throw new Error('Assignment not found'); }
  const course = await Course.findById(assignment.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) { res.status(403); throw new Error('Not authorized'); }
  const submissions = await Submission.find({ assignment: req.params.id }).populate('student', 'name email');
  res.json(submissions);
});

export { createAssignment, deleteAssignment, getAssignmentById, submitAssignment, getSubmissionsForAssignment };