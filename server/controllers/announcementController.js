import asyncHandler from "express-async-handler";
import Announcement from "../models/announcementModel.js";
import Course from "../models/courseModel.js";
import Notification from "../models/notificationModel.js";

const createAnnouncement = asyncHandler(async (req, res) => {
  const { content, courseId } = req.body;

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

  try {
    const message = `New announcement in "${course.title}": ${content.substring(0, 50)}...`;
    const link = `/course/${course._id}`;

    const notificationDocs = course.students.map((studentId) => ({
      user: studentId,
      message,
      link,
    }));

    if (notificationDocs.length > 0) {
      const createdNotifications = await Notification.insertMany(notificationDocs);

      const { io, userSocketMap } = req;

      createdNotifications.forEach(notification => {
        const socketId = userSocketMap.get(notification.user.toString());
        if (socketId) {
          io.to(socketId).emit("new_notification_data", notification);
        }
      });
      console.log(`Created and Pushed ${createdNotifications.length} announcement notifications.`);
    }
  } catch (error) {
    console.error("Failed to create notifications for new announcement:", error);
  }

  res.status(201).json(announcement);
});

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

const deleteAnnouncement = asyncHandler(async (req, res) => {
  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) {
    res.status(404);
    throw new Error("Announcement not found");
  }

  const course = await Course.findById(announcement.course);
  if (!course || course.lecturer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("User not authorized to delete this announcement");
  }

  await announcement.deleteOne();
  res.status(200).json({ message: "Announcement deleted" });
});

export { createAnnouncement, getAnnouncementsForCourse, deleteAnnouncement };