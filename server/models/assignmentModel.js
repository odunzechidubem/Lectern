import mongoose from 'mongoose';

const assignmentSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
      index: true, // Add index for faster queries
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date, required: true }, 
    instructionFileUrl: { type: String },
  },
  { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;