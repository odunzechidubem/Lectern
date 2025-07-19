import asyncHandler from 'express-async-handler';
import Announcement from '../models/announcementModel.js';
import Course from '../models/courseModel.js';

// @desc    Create an announcement for a course
// @route   POST /api/announcements
// @access  Private/Lecturer
const createAnnouncement = asyncHandler(async (req, res) => {
  const { content, courseId } = req.body;
  if (!content || !courseId) {
    res.status(400);
    throw new Error('Content and Course ID are required');
  }

  const course = await Course.findById(courseId);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to make announcements for this course');
  }

  const announcement = await Announcement.create({
    course: courseId,
    content,
    lecturer: req.user._id,
  });

  course.announcements.push(announcement._id);
  await course.save();

  res.status(201).json(announcement);
});

// @desc    Get all announcements for a specific course
// @route   GET /api/announcements/:courseId
// @access  Private/Enrolled Users
const getAnnouncementsForCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error('Course not found');
  }

  const isLecturer = course.lecturer.toString() === req.user._id.toString();
  const isEnrolled = course.students.includes(req.user._id);

  if (!isLecturer && !isEnrolled) {
    res.status(403);
    throw new Error('User not authorized to view these announcements');
  }

  const announcements = await Announcement.find({ course: req.params.courseId })
    .populate('lecturer', 'name')
    .sort({ createdAt: -1 }); // Sort by newest first

  res.status(200).json(announcements);
});

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private/Lecturer
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);

  if (!announcement) {
    res.status(404);
    throw new Error('Announcement not found');
  }
  
  if (announcement.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('User not authorized to delete this announcement');
  }

  // Also remove the reference from the course
  await Course.findByIdAndUpdate(announcement.course, {
    $pull: { announcements: announcement._id },
  });

  await announcement.deleteOne();

  res.status(200).json({ message: 'Announcement deleted' });
});


export { createAnnouncement, getAnnouncementsForCourse, deleteAnnouncement };