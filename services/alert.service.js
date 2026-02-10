const { sendEmail } = require("./emailService");
const { floodAlertTemplate } = require("./emailTemplates");

async function triggerEmailAlert(userEmail, data) {
  const email = floodAlertTemplate(data);
  await sendEmail(userEmail, email.subject, email.text);
}
