import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       
    port: process.env.EMAIL_PORT,        
    secure: false,                      
    auth: {
      user: process.env.EMAIL_USER,      
      pass: process.env.EMAIL_PASS,      
    },
  });

  const mailOptions = {
    from: `"${options.siteName || "Lectern"}" <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("ERROR SENDING EMAIL:", error);
    throw new Error("Email could not be sent.");
  }
};

export default sendEmail;