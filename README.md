# FloodSense Backend API

Real-time flood monitoring and alert system backend for Sri Lanka's Western Province. Built with Node.js, Express, and PostgreSQL.

## 🌊 Overview

FloodSense Backend is a REST API that powers a flood early warning system. It collects weather data every 30 minutes, calculates flood risk scores using a rule-based algorithm, and sends automated email alerts to subscribed users when risk levels reach critical thresholds.

### Key Features

- 🔄 **Automated Weather Collection** - Fetches data from OpenWeatherMap API every 30 minutes
- 📊 **Multi-Factor Risk Assessment** - 0-15 scoring system using rainfall, elevation, historical floods, and seasons
- 📧 **Email Alerts** - Automated Gmail notifications for HIGH/CRITICAL risk levels
- 🗺️ **Location Management** - Track multiple locations with GPS coordinates and elevation data
- 📈 **Historical Analysis** - Store and retrieve weather/risk trends over 24h/7d/30d/90d periods
- 🔒 **Admin Authentication** - JWT-protected admin routes for system management
- 📝 **Comprehensive Logging** - Winston logger with error tracking to database

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Server](#running-the-server)
- [API Documentation](#api-documentation)
- [Risk Scoring System](#risk-scoring-system)
- [Project Structure](#project-structure)
- [Scheduled Tasks](#scheduled-tasks)
- [Testing](#testing)
- [Deployment](#deployment)

## 🛠️ Tech Stack

- **Runtime:** Node.js 18+
- **Framework:** Express 4.18.2
- **Database:** PostgreSQL 14+ with PostGIS
- **Authentication:** JWT + bcrypt
- **Scheduling:** node-cron 3.0.3
- **Email:** Nodemailer 7.0.13
- **Logging:** Winston 3.18.3
- **Weather API:** OpenWeatherMap

### Dependencies

```json
{
  "axios": "^1.6.0",
  "bcrypt": "^6.0.0",
  "cors": "^2.8.5",
  "dotenv": "^16.6.1",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "node-cron": "^3.0.3",
  "nodemailer": "^7.0.13",
  "pg": "^8.11.3",
  "winston": "^3.18.3"
}
```

## 📦 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher with PostGIS extension
- **OpenWeatherMap API Key** (free tier available)
- **Gmail Account** with App Password enabled

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/ThiwankaLakshan/FloodSense-Backend.git
cd FloodSense-Backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create environment file**
```bash
cp .env.example .env
```

4. **Configure environment variables** (see next section)

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=floodsense_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# OpenWeatherMap API
OPENWEATHER_API_KEY=your_openweather_api_key

# Gmail SMTP (for email alerts)
GMAIL_USER=your_email@gmail.com
GMAIL_PASSWORD=your_gmail_app_password

# JWT Secret (generate random string)
JWT_SECRET=your_super_secret_jwt_key_here
```

### Getting API Keys

**OpenWeatherMap:**
1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Navigate to API Keys section
3. Copy your API key (free tier: 60 calls/min, 1M calls/month)

**Gmail App Password:**
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account Settings → Security → App Passwords
3. Generate app password for "Mail"
4. Use this 16-character password (not your regular password)

## 🗄️ Database Setup

1. **Create PostgreSQL database**
```bash
psql -U postgres
CREATE DATABASE floodsense_db;
\c floodsense_db
CREATE EXTENSION postgis;
\q
```

2. **Run schema migration**
```bash
psql -U your_db_user -d floodsense_db -f db/seeds/schema.sql
```

3. **Seed initial data** (locations and historical floods)
```bash
psql -U your_db_user -d floodsense_db -f db/seeds/seed.sql
```

4. **Create admin user**
```bash
node scripts/createAdmin.js
```

### Database Schema

The system uses 7 core tables:

- **locations** - Monitored locations with GPS coordinates, elevation
- **weather_data** - Timestamped weather readings (temp, humidity, rainfall)
- **risk_assessments** - Calculated risk scores with contributing factors
- **alerts** - Log of sent alert notifications
- **alert_subscriptions** - User subscriptions for location-based alerts
- **historical_floods** - Past flood events for risk calculation
- **system_logs** - Application logs and errors

## ▶️ Running the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

### Health Check

Verify the server is running:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-02-13T05:30:00.000Z",
  "uptime": 123.456
}
```

## 📡 API Documentation

### Public Endpoints

#### Get All Locations
```http
GET /api/locations
```
Returns list of all monitored locations with latest risk levels.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Colombo",
    "district": "Colombo",
    "latitude": 6.9271,
    "longitude": 79.8612,
    "elevation": 7,
    "latest_risk": {
      "risk_level": "MODERATE",
      "risk_score": 4,
      "timestamp": "2026-02-13T05:00:00Z"
    }
  }
]
```

#### Get Location Details
```http
GET /api/locations/:id
```

#### Get Weather History
```http
GET /api/locations/:id/weather-history?period=24h
```
Query params: `period` = 24h | 7d | 30d | 90d

#### Get Risk History
```http
GET /api/risk/:id/history?period=7d
```

#### Subscribe to Alerts
```http
POST /api/subscriptions
Content-Type: application/json

{
  "location_id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "min_risk_level": "HIGH"
}
```

### Admin Endpoints (JWT Required)

#### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "your_password"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

#### Dashboard Overview
```http
GET /api/dashboard/overview
Authorization: Bearer <token>
```

#### Manage Subscriptions
```http
GET /api/subscriptions
Authorization: Bearer <token>
```

#### View Alert History
```http
GET /api/alerts
Authorization: Bearer <token>
```

### Authentication

Protected routes require JWT token in Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🎯 Risk Scoring System

FloodSense uses a **0-15 point scoring system** with 5 weighted factors:

### Scoring Factors

| Factor | Weight | Max Points | Description |
|--------|--------|------------|-------------|
| **24h Rainfall** | High | 4 | Recent precipitation intensity |
| **72h Rainfall** | High | 4 | Cumulative saturation effect |
| **Elevation** | Medium | 3 | Lower areas = higher risk |
| **Historical Floods** | Low | 2 | Past 5-year flood frequency |
| **Monsoon Season** | Low | 2 | SW/NE monsoon periods |
| **TOTAL** | - | **15** | Combined risk score |

### Risk Level Thresholds

```javascript
CRITICAL  (9-15 pts) → RED    → "Evacuate immediately to higher ground"
HIGH      (6-8 pts)  → ORANGE → "Prepare to evacuate - secure property"
MODERATE  (3-5 pts)  → YELLOW → "Stay alert - monitor updates"
LOW       (0-2 pts)  → GREEN  → "Normal conditions"
```

### Example Calculation

**Wellampitiya during heavy monsoon:**
```
24h Rainfall: 180mm  → 3 points (very heavy)
72h Rainfall: 350mm  → 3 points (very heavy)
Elevation: 3m        → 3 points (extremely low)
Historical: 5 floods → 2 points (frequently flooded)
Season: June (SW)    → 2 points (monsoon)
─────────────────────────────────────────────
TOTAL:               = 13 points → CRITICAL ⚠️
```

Risk calculation runs automatically every 30 minutes via cron scheduler.

## 📁 Project Structure

```
FloodSense-Backend/
├── config/
│   ├── config.js              # Environment configuration
│   └── riskRules.js           # Risk scoring rules (0-15 scale)
├── controllers/
│   ├── admin.controller.js    # Admin authentication
│   ├── alert.controller.js    # Alert management
│   ├── dashboard.controller.js
│   ├── locations.controller.js
│   ├── riskAssessment.controller.js
│   ├── subscription.controller.js
│   └── weather.controller.js
├── db/
│   ├── db.js                  # PostgreSQL connection pool
│   └── seeds/
│       ├── schema.sql         # Database schema
│       └── seed.sql           # Initial data
├── middleware/
│   ├── auth.middleware.js     # JWT verification
│   └── errorHandler.middleware.js
├── models/
│   ├── admin.model.js
│   ├── alert.model.js
│   ├── dashboard.model.js
│   ├── locations.model.js
│   ├── riskAssessment.model.js
│   ├── subscription.model.js
│   └── weather.model.js
├── routes/
│   ├── admin.route.js
│   ├── alert.route.js
│   ├── dashboard.route.js
│   ├── location.route.js
│   ├── riskAssessment.route.js
│   ├── subscription.route.js
│   └── weather.route.js
├── services/
│   ├── alert.service.js       # Email alert dispatcher
│   ├── email.service.js       # Gmail SMTP transporter
│   ├── emailTemplates.service.js
│   ├── riskCalculator.service.js  # Risk scoring engine
│   ├── riskService.service.js
│   ├── scheduler.service.js   # Cron job manager
│   └── weather.service.js     # OpenWeatherMap integration
├── scripts/
│   └── createAdmin.js         # Admin user creation script
├── utils/
│   ├── jwt.util.js            # JWT token helpers
│   └── logger.util.js         # Winston logger
├── tests/
│   └── *.test.js              # Unit tests
├── server.js                  # Express server entry point
├── package.json
└── .env                       # Environment variables (gitignored)
```

## ⏰ Scheduled Tasks

The system uses **node-cron** for automated tasks that run every 30 minutes:

### Cron Schedule
```javascript
'*/30 * * * *'  // Every 30 minutes
```

### Automated Workflow

1. **Weather Data Collection**
   - Fetches current weather for all locations from OpenWeatherMap
   - Stores temperature, humidity, rainfall, wind speed, pressure
   - 1-second delay between API calls to respect rate limits

2. **Rainfall Aggregation**
   - Calculates rolling 24h rainfall totals
   - Calculates rolling 72h rainfall totals
   - Updates weather_data table with aggregates

3. **Risk Calculation**
   - Runs risk scoring algorithm for each location
   - Combines 5 factors into 0-15 score
   - Saves risk assessment to database

4. **Alert Dispatch** (if needed)
   - Checks if risk level crossed HIGH/CRITICAL threshold
   - Queries subscriptions for affected locations
   - Sends email alerts via Gmail SMTP
   - Logs sent alerts to alerts table

### Monitoring Scheduler

View scheduler logs:
```bash
# If using PM2
pm2 logs

# Otherwise check Winston logs
tail -f logs/combined.log
```

## 🧪 Testing

Run test suite:
```bash
npm test
```

Tests cover:
- Database connection
- Admin authentication
- Weather service API calls
- Risk calculation logic
- Email service
- Route handlers

## 🚀 Deployment

### Using PM2 (Recommended)

1. **Install PM2 globally**
```bash
npm install -g pm2
```

2. **Start application**
```bash
pm2 start server.js --name floodsense-backend
```

3. **Enable auto-restart on server reboot**
```bash
pm2 startup
pm2 save
```

4. **Monitor application**
```bash
pm2 status
pm2 logs floodsense-backend
pm2 monit
```

### Environment-Specific Configurations

**Production checklist:**
- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (64+ characters)
- [ ] Configure PostgreSQL with SSL
- [ ] Set up database backups
- [ ] Enable HTTPS on reverse proxy (nginx/Apache)
- [ ] Configure firewall (allow only 5000 from proxy)
- [ ] Set up monitoring (PM2/New Relic/DataDog)
- [ ] Configure log rotation
- [ ] Review Gmail sending limits (500/day)

### Database Backups

Automated daily backup:
```bash
# Add to crontab
0 2 * * * pg_dump floodsense_db > /backups/floodsense_$(date +\%Y\%m\%d).sql
```

## 📊 System Monitoring

### Health Endpoints

```bash
# Server health
curl http://localhost:5000/health

# Database connection
curl http://localhost:5000/api/dashboard/overview \
  -H "Authorization: Bearer <token>"
```

### Logs

Winston logs are stored in:
- `logs/combined.log` - All logs
- `logs/error.log` - Error logs only

### Performance Metrics

- API response time logged for each query
- Database query duration tracking
- Weather API call success/failure rates
- Alert delivery status tracking

## 🔒 Security Features

- **Password Hashing:** bcrypt with salt rounds (10)
- **JWT Authentication:** Stateless token-based auth for admin routes
- **SQL Injection Protection:** Parameterized queries via pg library
- **CORS:** Configured for frontend domain
- **Environment Variables:** Sensitive data never committed to git
- **Input Validation:** Request validation on all endpoints
- **Error Handling:** Generic error messages (no stack traces in production)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

ISC License - See LICENSE file for details

## 👨‍💻 Author

**Thiwanka Lakshan**

## 🐛 Troubleshooting

### Common Issues

**Database connection refused:**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Verify connection credentials
psql -U your_db_user -d floodsense_db
```

**OpenWeatherMap API rate limit:**
```bash
# Free tier: 60 calls/min
# If hitting limits, increase delay in weather.service.js sleep()
```

**Gmail authentication failed:**
```bash
# Ensure 2FA enabled + app password created
# Check GMAIL_USER and GMAIL_PASSWORD in .env
# Verify "Less secure app access" if using regular password (not recommended)
```

**Scheduler not running:**
```bash
# Check server logs for cron errors
# Verify node-cron initialized in server.js
# Ensure scheduler.start() is called
```

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
```

View detailed logs:
```bash
tail -f logs/combined.log | grep DEBUG
```

## 📞 Support

For issues or questions:
- Create an issue on GitHub
- Contact: thiwankalakshan@example.com

---

**Built with ❤️ for safer communities in Sri Lanka**
