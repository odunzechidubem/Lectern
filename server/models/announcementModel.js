import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Course',
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    content: {
      type: String,
      required: [true, 'Announcement content cannot be empty.'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;