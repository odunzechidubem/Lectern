import mongoose from 'mongoose';
const assignmentSchema = mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
  title: { type: String, required: true },
  description: { type: String, required: false },
  dueDate: { type: Date, required: false },
}, { timestamps: true });
const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;