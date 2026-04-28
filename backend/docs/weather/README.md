# Weather Module

Fetches daily weather data for a given location and date using the [Open-Meteo API](https://open-meteo.com/). Results are cached in Redis for 6 hours.

---

## Endpoint

```
GET /weather?city=&latitude=&longitude=&date=
```

### Query Parameters

| Parameter   | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| `city`      | string | ✅       | City name (used as cache key)            |
| `latitude`  | number | ✅       | Latitude coordinate                      |
| `longitude` | number | ✅       | Longitude coordinate                     |
| `date`      | string | ❌       | Target date in `YYYY-MM-DD` format. Defaults to today. |

### Rate Limit

`MODERATE` — applied via `rateLimiter` middleware.

---

## Response

```json
{
  "success": true,
  "data": {
    "temperature": 32.1,
    "windSpeed": 14.5,
    "humidity": 78.3,
    "precipitation": 0.0,
    "weatherCode": 2,
    "weatherType": "Partly cloudy"
  }
}
```

### `WeatherData` Fields

| Field         | Type           | Description                          |
|---------------|----------------|--------------------------------------|
| `temperature` | `number\|null` | Max temperature for the day (°C)     |
| `windSpeed`   | `number\|null` | Max wind speed (km/h)                |
| `humidity`    | `number\|null` | Average relative humidity (%)        |
| `precipitation`| `number\|null`| Total precipitation (mm)             |
| `weatherCode` | `number\|null` | WMO weather interpretation code      |
| `weatherType` | `string\|null` | Human-readable weather description   |

On error, `success` is `false` and all `data` fields are `null`.

---

## Caching

Redis key format: `weather:<city_lowercase>:<YYYY-MM-DD>`  
TTL: **6 hours**

---

## Weather Codes

A subset of supported WMO codes:

| Code | Description            |
|------|------------------------|
| 0    | Clear sky              |
| 1–3  | Clear to Cloudy        |
| 45, 48 | Fog               |
| 51–67 | Drizzle / Rain       |
| 71–77 | Snow                 |
| 80–82 | Rain showers         |
| 95, 96, 99 | Thunderstorm  |

Full mapping is defined in `weather.service.ts`.