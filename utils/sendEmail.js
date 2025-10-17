const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const port = Number(process.env.SMTP_PORT) || 587;
  const isSecure = port === 465; // true for 465, false for 587/25

  // Create transporter (correct API: createTransport)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port,
    secure: isSecure,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    await transporter.verify();
    console.log('SMTP connection verified:', process.env.SMTP_HOST, 'as', process.env.SMTP_EMAIL);
  } catch (e) {
    console.log('SMTP verification failed:', e.message);
  }

  // Define email options with safe fallbacks
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_EMAIL;
  const fromName = process.env.FROM_NAME || 'Goodluck Fashion';

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // Send email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent to', options.email, 'subject:', options.subject, 'id:', info.messageId);
    return info;
  } catch (e) {
    console.log('Email sending failed:', e.message);
    throw e;
  }
};

module.exports = sendEmail;
