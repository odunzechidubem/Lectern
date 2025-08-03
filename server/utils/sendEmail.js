import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter using the credentials from your environment variables
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 2. Define the email options
  const mailOptions = {
    // IMPORTANT: The email in the angle brackets MUST be the one you have
    // verified as a sender in your Brevo account (e.g., lectern.lms@gmail.com)
    from: `"${options.siteName || 'Lectern'}" <lectern.lms@gmail.com>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;