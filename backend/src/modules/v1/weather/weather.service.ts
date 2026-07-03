import fetch from 'node-fetch';
import { WeatherData, OpenMeteoDailyResponse } from './weather.types';
import redis from '../../../config/redis';
import { t } from '../localization/localization.service'; // 1. add import

const weatherCodeKeyMap: Record<number, string> = {  // 2. rename map + swap values to keys
  0:  'weather.conditions.clear_sky',
  1:  'weather.conditions.mainly_clear',
  2:  'weather.conditions.partly_cloudy',
  3:  'weather.conditions.cloudy',
  45: 'weather.conditions.fog',
  48: 'weather.conditions.depositing_rime_fog',
  51: 'weather.conditions.light_drizzle',
  53: 'weather.conditions.moderate_drizzle',
  55: 'weather.conditions.heavy_drizzle',
  56: 'weather.conditions.light_freezing_drizzle',
  57: 'weather.conditions.heavy_freezing_drizzle',
  61: 'weather.conditions.slight_rain',
  63: 'weather.conditions.moderate_rain',
  65: 'weather.conditions.heavy_rain',
  66: 'weather.conditions.light_freezing_rain',
  67: 'weather.conditions.heavy_freezing_rain',
  71: 'weather.conditions.slight_snow_fall',
  73: 'weather.conditions.moderate_snow_fall',
  75: 'weather.conditions.heavy_snow_fall',
  77: 'weather.conditions.snow_grains',
  80: 'weather.conditions.slight_rain_showers',
  81: 'weather.conditions.moderate_rain_showers',
  82: 'weather.conditions.violent_rain_showers',
  85: 'weather.conditions.slight_snow_showers',
  86: 'weather.conditions.heavy_snow_showers',
  95: 'weather.conditions.thunderstorm',
  96: 'weather.conditions.thunderstorm_slight_hail',
  99: 'weather.conditions.thunderstorm_heavy_hail',
};

export async function getWeather(
  city: string,
  latitude: number,
  longitude: number,
  date?: string,
  lang: string = 'en',
) {
  try {
    const today = new Date();
    const targetDate = date || today.toISOString().split('T')[0];

    const normalizedCity = city.toLowerCase();
    const key = `weather:${normalizedCity}:${targetDate}:${lang}`;

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
      weatherType:                                    // 3b. wrap with t()
        data.daily.weathercode[dayIndex] != null
          ? t(weatherCodeKeyMap[data.daily.weathercode[dayIndex]], lang) ?? null
          : null,
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
        weatherType: null,
      },
    };
  }
}

export async function getAIWeather(
  prompt: string,
  lang: string = 'en',
) {
  try {
    const today = new Date();
    return { success: true };
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
        weatherType: null,
      },
    };
  }
}
