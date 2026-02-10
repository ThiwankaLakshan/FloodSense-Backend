require("dotenv").config();
const { sendEmail } = require("../services/email.service");

sendEmail(
  "thiwankalakshanbandara2003@gmail.com",
  "FloodSense Test Email",
  "This is a test email from FloodSense."
)
.then(() => console.log("Email sent"))
.catch(err => console.error(err));
