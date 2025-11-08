import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  singleton: { type: String, default: 'system_settings', unique: true },
  isStudentRegistrationEnabled: { type: Boolean, required: true, default: true },
  isLecturerRegistrationEnabled: { type: Boolean, required: true, default: true },
  siteName: { type: String, default: 'Lectern' },
  logoUrl: { type: String, default: '/logo.png' },
  faviconUrl: { type: String, default: '/vite.svg' },

  // --- DEFINITIVE FIX: Added fields to store Cloudinary metadata ---
  logoPublicId: { type: String },
  logoResourceType: { type: String }, // Crucial for correct deletion
  faviconPublicId: { type: String },
  faviconResourceType: { type: String }, // Crucial for correct deletion
  // -----------------------------------------------------------------

  heroTitle: { type: String, default: 'Welcome to the Lectern' },
  heroText: {
    type: String,
    default:
      'Your central hub for accessing course materials, submitting assignments, and tracking your learning progress. Whether you are a student or a lecturer, we have the tools you need to succeed.',
  },
  heroImageUrl: {
    type: String,
    default:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80',
  },
  footerAboutText: {
    type: String,
    default: 'Providing a seamless and intuitive learning experience for students and lecturers.',
  },
  footerContactEmail: { type: String, default: 'contact@lmsplatform.com' },
  footerContactPhone: { type: String, default: '(123) 456-7890' },
  aboutUsTitle: { type: String, default: 'About Our Platform' },
  aboutUsText: {
    type: String,
    default:
      'This is the default text for the About Us page. Please update this content in the admin dashboard. Our mission is to provide an accessible and powerful learning management system for lecturers and students. We believe in the power of education and technology to create a better future.',
  },
  aboutUsImageUrl: {
    type: String,
    default:
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80',
  },
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;