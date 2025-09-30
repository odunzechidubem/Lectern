// src/utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter using Mailchimp (Mandrill) SMTP credentials
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       // smtp.mandrillapp.com
    port: process.env.EMAIL_PORT,       // 587 or 465
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,     // Mailchimp username (or "anystring" if API key is enough)
      pass: process.env.EMAIL_PASS,     // Mandrill API key
    },
  });

  // 2. Define the email options
  const mailOptions = {
    from: `"${options.siteName || 'Lectern'}" <${process.env.EMAIL_FROM}>`, 
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
