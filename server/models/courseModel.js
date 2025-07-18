import mongoose from 'mongoose';

// The lecture sub-document schema must be fully defined
const lectureSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  videoUrl: {
    type: String,
    required: true,
  },
  notesUrl: {
    type: String,
    required: false,
  },
});

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: [true, 'Please add a course title'], trim: true },
    description: { type: String, required: [true, 'Please add a description'] },
    lecturer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    lectures: [lectureSchema], // Use the fully defined schema
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
  },
  {
    timestamps: true,
  }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;