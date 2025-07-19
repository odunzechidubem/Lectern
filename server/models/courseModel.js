import mongoose from 'mongoose';

const lectureSchema = mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  notesUrl: { type: String, required: false },
});

// --- NEW SUB-DOCUMENT SCHEMA FOR ANNOUNCEMENTS ---
const announcementSchema = mongoose.Schema(
  {
    content: { type: String, required: true },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

const courseSchema = mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    lectures: [lectureSchema],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    assignments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    // --- THIS IS THE NEW FIELD ---
    announcements: [announcementSchema],
  },
  { timestamps: true }
);

const Course = mongoose.model('Course', courseSchema);
export default Course;