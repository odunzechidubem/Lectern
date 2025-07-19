import asyncHandler from 'express-async-handler';
import Submission from '../models/submissionModel.js';
import Course from '../models/courseModel.js';

// @desc    Grade a student's submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Lecturer
const gradeSubmission = asyncHandler(async (req, res) => {
  const { grade, feedback } = req.body;
  
  // Ensure grade is a valid number
  if (grade === undefined || grade === null || isNaN(parseInt(grade))) {
    res.status(400);
    throw new Error('Grade is a required numerical field');
  }

  const submission = await Submission.findById(req.params.id);

  if (!submission) {
    res.status(404);
    throw new Error('Submission not found');
  }

  // Verify the user grading the submission is the lecturer of the course
  const course = await Course.findById(submission.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to grade submissions for this course');
  }

  submission.grade = Number(grade);
  submission.feedback = feedback || ''; // Set feedback, default to empty string
  
  const updatedSubmission = await submission.save();
  
  res.status(200).json(updatedSubmission);
});

export { gradeSubmission };