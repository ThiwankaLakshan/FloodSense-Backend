const { sendEmail } = require("./email.service");
const { floodAlertTemplate } = require("./emailTemplates.service");

async function triggerEmailAlert(userEmail, data) {
  const email = floodAlertTemplate(data);
  await sendEmail(userEmail, email.subject, email.text);
}

module.exports = { triggerEmailAlert };
