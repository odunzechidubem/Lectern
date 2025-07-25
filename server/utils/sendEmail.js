// server/utils/sendEmail.js

// ====== Using nodemailer from Mailtrap ======= 
import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  // 1. Create a transporter using the credentials from your .env file
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
    // IMPORTANT: For services like Brevo or SendGrid, the email in the angle brackets
    // MUST be the one you have verified in your account.
    // Replace 'your-verified-email@example.com' with the email you use to log in to Mailtrap/Brevo.
    from: `"${options.siteName || 'LMS Platform'}" <odunzemichael1273@gmail.com>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  // 3. Send the email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;



// =========== Alternative configuration using nodemailer with a different setup (Brevo.com) ===========
// Uncomment the following lines if you want to use a different email service or configuration ==========


// import nodemailer from 'nodemailer';

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: process.env.EMAIL_PORT,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   const mailOptions = {
//     from: `"${options.siteName || 'LMS Platform'}" odunzechidubem73@gmail.com`,
//     to: options.email,
//     subject: options.subject,
//     html: options.html,
//   };

//   await transporter.sendMail(mailOptions);
// };

// export default sendEmail;