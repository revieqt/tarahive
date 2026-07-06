import { Request, Response } from 'express';
import { getWeather } from './weather.service';

export async function getAIResponseController(req: Request, res: Response) {
  try {
    const { city, latitude, longitude, date } = req.query;

    const cityStr = (typeof city === 'string' ? city : Array.isArray(city) ? city[0] : '') as string;
    const latStr = (typeof latitude === 'string' ? latitude : Array.isArray(latitude) ? latitude[0] : '') as string;
    const lonStr = (typeof longitude === 'string' ? longitude : Array.isArray(longitude) ? longitude[0] : '') as string;
    const dateStr = (typeof date === 'string' ? date : Array.isArray(date) ? date[0] : undefined) as string | undefined;

    if (!cityStr || !latStr || !lonStr) {
      return res
        .status(400)
        .json({ success: false, data: null, message: 'Missing required params' });
    }

    const weather = await getWeather(
      cityStr,
      parseFloat(latStr),
      parseFloat(lonStr),
      dateStr,
      res.locals.lang,
    );

    return res.json(weather);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      data: {
        temperature: null,
        windSpeed: null,
        humidity: null,
        precipitation: null,
        weatherCode: null,
        weatherType: null,
        aiSuggestion: null,
      },
    });
  }
}
