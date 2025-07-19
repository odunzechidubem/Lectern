import asyncHandler from 'express-async-handler';
import Announcement from '../models/announcementModel.js';
import Course from '../models/courseModel.js';

const createAnnouncement = asyncHandler(async (req, res) => {
  const { content, courseId } = req.body;
  if (!content) {
    res.status(400);
    throw new Error('Announcement content cannot be empty');
  }
  const course = await Course.findById(courseId);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to make announcements for this course');
  }
  const announcement = await Announcement.create({
    course: courseId,
    lecturer: req.user._id,
    content,
  });
  res.status(201).json(announcement);
});

const getAnnouncementsForCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }
  const isLecturer = course.lecturer.toString() === req.user._id.toString();
  const isEnrolled = course.students.some(s => s.toString() === req.user._id.toString());
  if (!isLecturer && !isEnrolled) {
    res.status(403);
    throw new Error('User not authorized to view these announcements');
  }
  const announcements = await Announcement.find({ course: req.params.courseId })
    .sort({ createdAt: -1 });
  res.status(200).json(announcements);
});

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  const course = await Course.findById(announcement.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to delete this announcement');
  }
  await announcement.deleteOne();
  res.status(200).json({ message: 'Announcement deleted' });
});

export { createAnnouncement, getAnnouncementsForCourse, deleteAnnouncement };