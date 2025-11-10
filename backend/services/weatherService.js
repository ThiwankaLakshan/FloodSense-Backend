const axios = require('axios');
const pool = require('../config/database');
require('dotenv').config();

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

class WeatherService {
  // Function 1: Single location
  async fetchWeatherForLocation(latitude, longitude, locationId) {
        try {
            const response = await axios.get(BASE_URL, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    appid: API_KEY,
                    units: 'metric'
                }
            });

            const data = response.data;

            //extract relevant data
            const weatherData = {
                locationId,
                timestamp : new Date(),
                temperature: data.main.temp,
                humidity: data.main.humidity,
                rainfall_1h: data.rain ? data.rain['1h'] || 0 : 0,
                windSpeed: data.wind.speed,
                pressure : data.main.pressure,
                weatherCondition: data.weather[0].description 
            };

            //save to database
            await this.saveWeatherData(weatherData);

            console.log(`weather data fetched for location ${locationId}`);
            return weatherData;
        } catch (error) {
            console.error(`Error fetching weather for location ${locationId}: `,error);
            throw error;
        }
    }

  // Function 2: ALL locations ← ADD THIS!
  async fetchWeatherForAllLocations() {
        try {
            //get all locations
            const locationsResult = await pool.query('SELECT id, latitude, longitude, name FROM locations');
            const locations = locationsResult.rows;

            console.log(`Fetching weather for ${locations.length} locations...`);

            //fetch weather for each location
            const promises = locations.map(loc =>
                this.fetchWeatherForLocation(loc.latitude, loc.longitude, loc.id)
            );

            await Promise.all(promises);

            console.log('Weather data fetch for all locations');

        } catch (error) {
            console.error('Error fetching weather for all locations:' , error)
            throw error;
        }
    }

  // Function 3: Save data
  async saveWeatherData(data) {
        const query = `
        INSERT INTO weather_data
        (location_id, timestamp, temperature, humidity, rainfall_1h, wind_speed, pressure, weather_condition)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
        `;

        const values = [
            data.locationId,
            data.timestamp,
            data.temperature,
            data.humidity,
            data.rainfall_1h,
            data.windSpeed,
            data.pressure,
            data.weatherCondition
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0].id;
        } catch (error) {
            console.error('Error saving weather data:', error)
            throw error;
        }
    }

  // Function 4: Helper
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new WeatherService();