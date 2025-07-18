// server/models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto'; // Node.js built-in crypto module

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['student', 'lecturer'],
      default: 'student',
    },
    // --- New fields for email verification ---
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
  },
  {
    timestamps: true,
  }
);

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password in DB
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- Method to generate the verification token ---
// This is the function that was likely causing the crash.
userSchema.methods.createVerificationToken = function () {
  // 1. Create a random, simple token
  const token = crypto.randomBytes(32).toString('hex');

  // 2. Encrypt the token before saving it to the database
  this.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  // 3. Set an expiration date for the token (10 minutes from now)
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

  // 4. Return the *un-encrypted* token to be used in the email link
  return token;
};

const User = mongoose.model('User', userSchema);
export default User;