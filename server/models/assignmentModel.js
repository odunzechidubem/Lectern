// /server/models/assignmentModel.js

import mongoose from 'mongoose';

const assignmentSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    instructionFileUrl: { type: String },
    instructionFilePublicId: { type: String }, // <-- ADDED THIS
  },
  { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;