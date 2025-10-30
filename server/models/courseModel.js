// /server/models/courseModel.js

import mongoose from 'mongoose';

const lectureSchema = mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  videoPublicId: { type: String, required: true },
  notesUrl: { type: String },
  notesPublicId: { type: String },
});

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true,
    },
    lectures: [lectureSchema],
    students: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);

export default Course;