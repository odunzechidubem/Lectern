import mongoose from 'mongoose';

// --- Lecture Sub-document Schema ---
// This defines the structure for individual lectures within a course.
// It's not a standalone model but will be embedded as an array in the main course schema.
const lectureSchema = mongoose.Schema({
  title: { type: String, required: true },
  videoUrl: { type: String, required: true },
  notesUrl: { type: String, required: false }, // PDF notes are optional
});


// --- Main Course Schema ---
const courseSchema = mongoose.Schema(
  {
    // Title of the course (e.g., "Introduction to Web Development")
    title: {
      type: String,
      required: [true, 'Please add a course title'],
      trim: true, // Removes whitespace from both ends
    },

    // A brief summary of what the course is about.
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },

    // A reference to the user who created this course.
    // This connects the Course model to the User model.
    lecturer: {
      type: mongoose.Schema.Types.ObjectId, // Stores the unique ID of a document
      required: true,
      ref: 'User', // The 'ref' tells Mongoose which model to link to ('User')
    },

    // An array to hold all the lecture sub-documents for this course.
    // We will add to this array later.
    lectures: [lectureSchema],

    // An array to hold references to all students enrolled in the course.
    // We will implement this feature later.
    // students: [{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    // }],

  },
  {
    // Mongoose automatically adds `createdAt` and `updatedAt` fields
    // to track when the document was created and last modified.
    timestamps: true,
  }
);

// Create the model from the schema.
// Mongoose will create a collection named 'courses' in the database.
const Course = mongoose.model('Course', courseSchema);

export default Course;