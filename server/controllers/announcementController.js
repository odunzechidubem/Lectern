// /server/controllers/announcementController.js

import asyncHandler from "express-async-handler";
import Announcement from "../models/announcementModel.js";
import Course from "../models/courseModel.js";
import Notification from "../models/notificationModel.js"; // <-- IMPORT Notification model

// @desc Create a new announcement for a course
// @route POST /api/announcements
// @access Private/Lecturer
const createAnnouncement = asyncHandler(async (req, res) => {
  const { content, courseId } = req.body;

  // Corrected: Add validation for content and courseId
  if (!content || !content.trim()) {
    res.status(400);
    throw new Error("Announcement content cannot be empty");
  }
  if (!courseId) {
    res.status(400);
    throw new Error("Course ID is required");
  }

  const course = await Course.findById(courseId);

  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("User not authorized to make announcements for this course");
  }

  const announcement = await Announcement.create({
    course: courseId,
    lecturer: req.user._id,
    content,
  });

  // Wrapped in try/catch to prevent request failure if notifications fail
  try {
    // 1. Create the notification message and link
    const message = `New announcement in "${course.title}": ${content.substring(0, 50)}...`;
    const link = `/course/${course._id}`;

    // 2. Create an array of notification documents for all enrolled students
    const notifications = course.students.map((studentId) => ({
      user: studentId,
      message,
      link,
    }));

    // 3. If there are students to notify, save the notifications to the database
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // 4. Use the socket map to find which of these students are currently online
      const { io, userSocketMap } = req;
      course.students.forEach((studentId) => {
        const socketId = userSocketMap.get(studentId.toString());
        if (socketId) {
          // 5. Send an instant "push" event to each online student
          io.to(socketId).emit("newNotification");
        }
      });
      console.log(`Created and Pushed ${notifications.length} announcement notifications.`);
    }
  } catch (error) {
    // Log the error but don't fail the main request
    console.error("Failed to create notifications for new announcement:", error);
  }

  res.status(201).json(announcement);
});

// @desc Get all announcements for a course
const getAnnouncementsForCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  const isLecturer = course.lecturer.toString() === req.user._id.toString();
  const isEnrolled = course.students.some(
    (s) => s.toString() === req.user._id.toString()
  );

  if (!isLecturer && !isEnrolled) {
    res.status(403);
    throw new Error("User not authorized to view these announcements");
  }

  const announcements = await Announcement.find({
    course: req.params.courseId,
  }).sort({ createdAt: -1 });

  res.status(200).json(announcements);
});

// @desc Delete an announcement
const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  // Authorization check
  const course = await Course.findById(announcement.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("User not authorized to delete this announcement");
  }

  await announcement.deleteOne();
  res.status(200).json({ message: "Announcement deleted" });
});

export { createAnnouncement, getAnnouncementsForCourse, deleteAnnouncement };