import fetch from 'node-fetch';
import { WeatherData, OpenMeteoDailyResponse } from './weather.types';
import redis from '../../../config/redis';

export async function getWeather(
  city: string,
  latitude: number,
  longitude: number,
  date?: string,
) {
  try {
    const today = new Date();
    const targetDate = date || today.toISOString().split('T')[0];

    const normalizedCity = city.toLowerCase();
    const key = `weather:${normalizedCity}:${targetDate}`;

    // Check Redis cache first
    const cached = await redis.get(key);
    if (cached) {
      console.log('🟡 Weather cache hit for:', key);
      return { success: true, data: JSON.parse(cached) };
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,weathercode&hourly=relativehumidity_2m&timezone=auto`;
    const res = await fetch(url);
    const data = (await res.json()) as OpenMeteoDailyResponse;
    

    const dayIndex = data.daily.time.findIndex((d) => d === targetDate);
    if (dayIndex === -1) throw new Error('Weather data for the given date not available');

    const hourIndices = data.hourly.time
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => t.startsWith(targetDate))
      .map(({ i }) => i);

    const humidityValues = hourIndices.map((i) => data.hourly.relativehumidity_2m[i]);
    const averageHumidity =
      humidityValues.length > 0
        ? humidityValues.reduce((a, b) => a + b, 0) / humidityValues.length
        : null;

    const weather: WeatherData = {
      temperature: data.daily.temperature_2m_max[dayIndex] ?? null,
      windSpeed: data.daily.windspeed_10m_max[dayIndex] ?? null,
      humidity: averageHumidity,
      precipitation: data.daily.precipitation_sum[dayIndex] ?? null,
      weatherCode: data.daily.weathercode[dayIndex] ?? null,
    };

    await redis.setex(key, 60 * 60 * 6, JSON.stringify(weather));
    console.log('✅ Cached weather in Redis for:', key);

    return { success: true, data: weather };
  } catch (err) {
    console.error('Weather service error:', err);
    return {
      success: false,
      data: {
        temperature: null,
        windSpeed: null,
        humidity: null,
        precipitation: null,
        weatherCode: null,
      },
    };
  }
}