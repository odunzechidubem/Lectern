import mongoose from 'mongoose';

// --- THIS IS THE FIX ---
// The schema for lectures must include fields for the Cloudinary public_ids.
const lectureSchema = mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  videoPublicId: { type: String, required: true }, // Was missing
  notesUrl: { type: String },
  notesPublicId: { type: String }, // Was missing
});
// --- END FIX ---

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
    lectures: [lectureSchema], // This now uses the corrected schema above
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