# FloodSense - API Documentation

Base URL: `http://localhost:5000/api`

## Endpoints

### 1. Get All Locations
**GET** `/locations`

Returns list of all monitored locations with current risk level.

**Response:**
\`\`\`json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": 1,
      "name": "Wellampitiya",
      "district": "Colombo",
      "latitude": 6.9497,
      "longitude": 79.9258,
      "elevation": 3,
      "risk_level": "MODERATE",
      "risk_score": 4
    }
  ]
}
\`\`\`

### 2. Get Location Details
**GET** `/locations/:id`

Returns detailed information for specific location.

**Parameters:**
- `id` (path) - Location ID

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "location": { ... },
    "currentWeather": { ... },
    "currentRisk": { ... }
  }
}
\`\`\`

### 3. Get Weather History
**GET** `/locations/:id/weather-history`

Returns historical weather data for charts.

**Parameters:**
- `id` (path) - Location ID
- `period` (query) - Time period: `24h`, `7d`, `30d` (default: `7d`)

### 4. Get Risk History
**GET** `/locations/:id/risk-history`

Returns historical risk assessments.

**Parameters:**
- `id` (path) - Location ID
- `period` (query) - Time period: `24h`, `7d`, `30d` (default: `7d`)

### 5. Get Dashboard Summary
**GET** `/dashboard/summary`

Returns overview statistics for dashboard.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "totalLocations": 15,
    "riskDistribution": {
      "CRITICAL": 0,
      "HIGH": 2,
      "MODERATE": 5,
      "LOW": 8
    },
    "lastUpdate": "2025-11-10T14:30:00Z"
  }
}
\`\`\`

## Error Responses

All endpoints return errors in this format:

\`\`\`json
{
  "success": false,
  "error": "Error message here"
}
\`\`\`

**Status Codes:**
- `200` - Success
- `404` - Resource not found
- `500` - Server error