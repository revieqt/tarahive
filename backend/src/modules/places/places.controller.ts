import { Request, Response } from 'express';
import {
  reverseGeocodeService,
  geocodeService,
} from './places.service';

interface AuthRequest extends Request {
  user?: any;
  processedImagePath?: string;
}


/**
 * Reverse geocode coordinates to get address information
 * GET /api/locations/reverse-geocode
 */
export const reverseGeocode = async (req: AuthRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    const latStr = (typeof latitude === 'string' ? latitude : Array.isArray(latitude) ? latitude[0] : '') as string;
    const lonStr = (typeof longitude === 'string' ? longitude : Array.isArray(longitude) ? longitude[0] : '') as string;

    // Validate required parameters
    if (!latStr || !lonStr) {
      return res
        .status(400)
        .json({ message: 'Missing required parameters: latitude and longitude' });
    }

    // Validate user
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized. User ID not found in token.' });
    }

    const lat = parseFloat(latitude as string);
    const lon = parseFloat(longitude as string);

    // Validate coordinates
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ message: 'Latitude and longitude must be valid numbers' });
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ message: 'Invalid coordinate values' });
    }

    console.log('🟡 reverseGeocode - User:', req.user.userId, 'Coordinates:', { lat, lon });

    const result = await reverseGeocodeService(lat, lon);

    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error reverse geocoding:', error);
    res.status(500).json({ message: 'Failed to retrieve address information' });
  }
};

/**
 * Geocode a location query with caching
 * POST /api/locations/geocode
 * Query: ?query=search_term&bare=true/false
 * Headers: { Authorization: Bearer <accessToken> }
 * 
 * The service always saves FULL LocationPoint data to MongoDB
 * If bare=true, returns only: { latitude, longitude, address }
 * If bare=false/omitted, returns full LocationPoint data
 */
export const geocode = async (req: AuthRequest, res: Response) => {
  try {
    const { query, bare } = req.query;

    const queryStr = (typeof query === 'string' ? query : Array.isArray(query) ? query[0] : '') as string;
    const bareStr = (typeof bare === 'string' ? bare : Array.isArray(bare) ? bare[0] : undefined) as string | undefined;

    // Validate user
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'Unauthorized. User ID not found in token.' });
    }

    // Validate required parameters
    if (!queryStr || typeof queryStr !== 'string' || queryStr.trim().length === 0) {
      return res
        .status(400)
        .json({ message: 'Missing or invalid required parameter: query' });
    }

    const isBareMode = bareStr === 'true' || bareStr === '1';
    console.log('🟡 geocode - User:', req.user.userId, 'Query:', queryStr, 'Bare mode:', isBareMode);

    const result = await geocodeService(queryStr.trim());

    // Filter response based on bare mode
    let responseData = result.results;
    if (isBareMode && result.results && result.results.length > 0) {
      console.log('🟡 Filtering to bare mode - only latitude, longitude, address');
      responseData = result.results.map((item: any) => ({
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address,
      }));
    }

    console.log('🟡 Returning response:', { count: responseData.length, bare: isBareMode });

    const success = responseData.length > 0;
    const message = success 
      ? `Results fetched from ${result.source}`
      : `Cannot find ${queryStr}`;

    res.status(200).json({
      success,
      data: responseData,
      source: result.source,
      message,
    });
  } catch (error) {
    console.error('❌ Error geocoding:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to geocode location',
      data: [],
    });
  }
};

/**
 * Debug endpoint - test API response structure
 * GET /api/locations/geocode-debug?query=SM Seaside Cebu
 */
export const geocodeDebug = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.query;

    const queryStr = (typeof query === 'string' ? query : Array.isArray(query) ? query[0] : '') as string;

    if (!queryStr || typeof queryStr !== 'string') {
      return res.status(400).json({ message: 'Missing query parameter' });
    }

    const axios = require('axios');
    const apiKey = process.env.GEOCODE_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ message: 'GEOCODE_API_KEY not set' });
    }

    console.log('🟡 Debug: Calling API for query:', queryStr);

    const geocodeResponse = await axios.get(
      `https://geocode.maps.co/search?q=${encodeURIComponent(queryStr)}&api_key=${apiKey}`,
      {
        headers: {
          'User-Agent': 'TaraG-App/1.0',
        },
        timeout: 5000,
      }
    );

    console.log('🟡 Debug: API Response status:', geocodeResponse.status);
    console.log('🟡 Debug: API Response data:', JSON.stringify(geocodeResponse.data, null, 2));

    res.status(200).json({
      status: geocodeResponse.status,
      dataLength: geocodeResponse.data?.length || 0,
      firstItem: geocodeResponse.data?.[0] || null,
      allData: geocodeResponse.data || [],
    });
  } catch (error: any) {
    console.error('❌ Debug: Error:', error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data || null,
    });
  }
};
