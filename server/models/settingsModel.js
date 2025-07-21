import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  singleton: { type: String, default: 'system_settings', unique: true },
  isStudentRegistrationEnabled: { type: Boolean, required: true, default: true },
  isLecturerRegistrationEnabled: { type: Boolean, required: true, default: true },
  siteName: { type: String, default: 'LMS Platform' },
  logoUrl: { type: String, default: '/logo.png' },
  heroTitle: { type: String, default: 'Welcome to the LMS Platform' },
  heroText: { type: String, default: 'Your central hub for accessing course materials, submitting assignments, and tracking your learning progress. Whether you are a student or a lecturer, we have the tools you need to succeed.' },
  heroImageUrl: { type: String, default: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80' },
  footerAboutText: { type: String, default: 'Providing a seamless and intuitive learning experience for students and lecturers.' },
  footerContactEmail: { type: String, default: 'contact@lmsplatform.com' },
  footerContactPhone: { type: String, default: '(123) 456-7890' },
  
  // --- NEW FIELD FOR EDITABLE FOOTER LINKS ---
  footerLinks: [
    {
      linkName: { type: String, required: true },
      linkUrl: { type: String, required: true },
    },
  ],
});

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;