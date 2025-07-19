import mongoose from 'mongoose';

const assignmentSchema = mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
    title: { type: String, required: true },
    description: { type: String, required: false },
    dueDate: { type: Date, required: true },
    // --- THIS IS THE NEW FIELD ---
    instructionFileUrl: { type: String, required: false }, // Optional link to a PDF
  },
  { timestamps: true }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;