import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import Course from '../models/courseModel.js';

const getCourseMessages = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isLecturer = course.lecturer.toString() === req.user._id.toString();
  const isEnrolled = course.students.some(s => s.toString() === req.user._id.toString());
  if (!isLecturer && !isEnrolled) {
    res.status(403);
    throw new Error('Not authorized to view messages for this course');
  }

  const messages = await Message.find({ course: req.params.courseId })
    .populate('sender', 'name profileImage')
    .sort({ createdAt: 'asc' });

  res.status(200).json(messages);
});

export { getCourseMessages };