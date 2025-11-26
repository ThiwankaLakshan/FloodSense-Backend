// config.js
require('dotenv').config();

const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  database: {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  
  // API Keys
  openWeather: {
    apiKey: process.env.OPENWEATHER_API_KEY,
  },
  
  // Email (for later)
  gmail: {
    user: process.env.GMAIL_USER,
    password: process.env.GMAIL_PASSWORD,
  },
  
  // SMS (for later)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  
  // Auth
  jwtSecret: process.env.JWT_SECRET,
};


module.exports = config;