function floodAlertTemplate(data) {
  return {
    subject: `⚠ Flood Alert – ${data.riskLevel} Risk`,
    text: `
Flood Alert

Location: ${data.location}
Risk Level: ${data.riskLevel}
Rainfall (24h): ${data.rainfall24h} mm

Please take necessary precautions.

– FloodSense
    `
  };
}

module.exports = { floodAlertTemplate };
