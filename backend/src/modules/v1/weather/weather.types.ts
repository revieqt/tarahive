export interface WeatherData {
  temperature: number | null;
  windSpeed: number | null;
  humidity: number | null;
  precipitation: number | null;
  weatherCode: number | null;
  weatherType: string | null;
  aiSuggestion: string | null;  // 1. add AI suggestion field
}

export interface WeatherResponse {
  success: boolean;
  data: WeatherData;
}

export interface OpenMeteoDailyResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    windspeed_10m_max: number[];
    precipitation_sum: number[];
    weathercode: number[];
  };
  hourly: {
    time: string[];
    relativehumidity_2m: number[];
  };
}