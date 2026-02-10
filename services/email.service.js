const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD
  }
});

async function sendEmail(to, subject, text) {
  await transporter.sendMail({
    from: `"FloodSense Alerts" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    text
  });
}


module.exports = { sendEmail };
