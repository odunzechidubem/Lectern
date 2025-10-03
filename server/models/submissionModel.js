import mongoose from 'mongoose';

const submissionSchema = mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Assignment' },
    course: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Course' },
    student: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    fileUrl: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    grade: { type: Number, min: 0, max: 100 },
    feedback: { type: String, trim: true },
  },
  { timestamps: true }
);

// A unique compound index to prevent duplicate submissions and speed up lookups.
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;