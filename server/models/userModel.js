import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { USER_ROLES } from '../utils/constants.js';

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true }, // ensure email is stored lowercase
  password: { type: String, required: true, minlength: 8 }, // Added minlength validation
  role: {
    type: String,
    required: true,
    enum: Object.values(USER_ROLES), // Use constants for enum
    default: USER_ROLES.STUDENT,
  },
  profileImage: { type: String, required: false, default: '' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  newEmail: { type: String, lowercase: true },
  emailChangeToken: String,
  emailChangeTokenExpires: Date,
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate email verification token
userSchema.methods.createVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return token;
};

// Generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

// Generate email change token
userSchema.methods.createEmailChangeToken = function () {
  const changeToken = crypto.randomBytes(32).toString('hex');
  this.emailChangeToken = crypto.createHash('sha256').update(changeToken).digest('hex');
  this.emailChangeTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return changeToken;
};

const User = mongoose.model('User', userSchema);

export default User;