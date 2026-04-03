

/**
 * Reverse geocode coordinates to get address information
 * Uses Nominatim API (OpenStreetMap)
 */
export const reverseGeocodeService = async (
  latitude: number,
  longitude: number
): Promise<{
  latitude: number;
  longitude: number;
  address: {
    country: string;
    region: string;
    province: string;
    city: string;
    district: string;
    neighborhood: string;
    postal_code: string;
  };
}> => {
  try {
    const axios = require('axios');

    console.log('🟡 reverseGeocodeService - Fetching address for:', { latitude, longitude });

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'TaraG-App/1.0',
        },
        timeout: 5000,
      }
    );

    const nominatimData = response.data;
    const nominatimAddress = nominatimData.address || {};

    // Map Nominatim response to standard address format
    const standardAddress = {
      country: nominatimAddress.country || '',
      region:
        nominatimAddress.state ||
        nominatimAddress.region ||
        '',
      province:
        nominatimAddress.province ||
        nominatimAddress.county ||
        nominatimAddress.province ||
        '',
      city:
        nominatimAddress.city ||
        nominatimAddress.town ||
        nominatimAddress.village ||
        '',
      district:
        nominatimAddress.district ||
        nominatimAddress.suburb ||
        nominatimAddress.hamlet ||
        '',
      neighborhood: nominatimAddress.neighbourhood || '',
      postal_code: nominatimAddress.postcode || '',
    };

    const result = {
      latitude,
      longitude,
      address: standardAddress,
    };

    console.log('✅ Address fetched successfully:', result);
    return result;
  } catch (error) {
    console.error('❌ Error reverse geocoding:', error);
    throw error;
  }
};

/**
 * Normalize query string for caching and searching
 * Example: "SM Seaside Cebu" -> "sm_seaside_cebu"
 */
const normalizeQuery = (query: string): string => {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // replace spaces with underscores
    .replace(/[^a-z0-9_]/g, '') // remove special characters
    .replace(/_+/g, '_') // replace multiple underscores with single
    .replace(/^_|_$/g, ''); // remove leading/trailing underscores
};

/**
 * Geocode a location query with caching
 * Saves results as LocationPoint documents
 * 1. Check Redis cache first
 * 2. Check MongoDB LocationPoints if Redis misses
 * 3. Call geocoding API if MongoDB misses
 * 4. Save results as LocationPoints to both Redis and MongoDB
 * 5. Return results with source indicator
 */
export const geocodeService = async (
  query: string
): Promise<{
  results: any[];
  source: "redis" | "mongodb" | "api";
}> => {
  try {
    const axios = require('axios');
    const redis = require('../../config/redis').default;
    const { LocationPointModel } = require('./places.model');

    const normalizedQuery = normalizeQuery(query);
    console.log('🟡 geocodeService - Processing query:', { originalQuery: query, normalizedQuery });

    // 1. Check Redis cache (stores LocationPoint data)
    const redisKey = `locationpoint:${normalizedQuery}`;
    const cachedFromRedis = await redis.get(redisKey);
    if (cachedFromRedis) {
      const parsedCache = JSON.parse(cachedFromRedis);
      // Only return if cache has actual results
      if (Array.isArray(parsedCache) && parsedCache.length > 0) {
        console.log('✅ Found in Redis cache');
        return {
          results: parsedCache,
          source: 'redis',
        };
      }
    }

    // 2. Check MongoDB for LocationPoints with matching name
    const mongoLocationPoints = await LocationPointModel.find({
      locationName: { $regex: query, $options: 'i' },
    }).limit(10);

    if (mongoLocationPoints && mongoLocationPoints.length > 0) {
      console.log('✅ Found in MongoDB:', { count: mongoLocationPoints.length });
      // Also cache in Redis (24 hour TTL)
      const locationPointsData = mongoLocationPoints.map((doc: any) => ({
        _id: doc._id,
        locationName: doc.locationName,
        address: doc.address,
        latitude: doc.latitude,
        longitude: doc.longitude,
        category: doc.category,
        type: doc.type,
        description: doc.description,
        schedule: doc.schedule,
      }));

      // Only cache if we have results
      if (locationPointsData.length > 0) {
        await redis.setex(
          redisKey,
          24 * 60 * 60,
          JSON.stringify(locationPointsData)
        );
      }

      return {
        results: locationPointsData,
        source: 'mongodb',
      };
    }

    // 3. Call geocoding API
    console.log('🟡 Fetching from geocoding API:', query);
    const apiKey = process.env.GEOCODE_API_KEY;
    if (!apiKey) {
      throw new Error('GEOCODE_API_KEY not set in environment variables');
    }

    const geocodeResponse = await axios.get(
      `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=${apiKey}`,
      {
        headers: {
          'User-Agent': 'TaraG-App/1.0',
        },
        timeout: 5000,
      }
    );

    if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
      console.log('⚠️ No results from geocoding API');
      return {
        results: [],
        source: 'api',
      };
    }

    console.log('🟡 API Response received with', geocodeResponse.data.length, 'results');

    // 4. Map API response to LocationPoint format and save
    const locationPointsToSave = geocodeResponse.data.map((item: any) => {
      const apiAddress = item.address || {};
      
      console.log('🟡 Mapping item:', { name: item.name, type: item.type, address: apiAddress });

      return {
        locationName: item.name || query,
        address: {
          country: apiAddress.country || '',
          region: apiAddress.region || '',
          province: '', // Not provided by API
          city: apiAddress.city || '',
          district: apiAddress.road || '', // Use road as district
          neighborhood: '', // Not provided by API
          postal_code: apiAddress.postcode || '',
        },
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        category: item.class || 'location', // Use API class field
        type: item.type || 'point-of-interest', // Use API type field
        imageUrl: '',
        description: item.display_name || '',
        schedule: {
          opensOn: '00:00',
          closedOn: '23:59',
          days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        },
        createdBy: 'geocode-api',
        status: 'active',
        links: [],
        reviews: [],
      };
    });

    console.log('🟡 Mapped', locationPointsToSave.length, 'LocationPoints to save');
    console.log('🟡 Sample LocationPoint to save:', JSON.stringify(locationPointsToSave[0], null, 2));

    // 5. Save to MongoDB
    let savedLocationPoints: any[] = [];
    try {
      console.log('🟡 Attempting to insert LocationPoints into MongoDB...');
      console.log('🟡 First location to save:', JSON.stringify(locationPointsToSave[0], null, 2));

      // Validate each location before insert
      for (let i = 0; i < locationPointsToSave.length; i++) {
        const doc = locationPointsToSave[i];
        console.log(`🟡 Validating location ${i}:`, {
          locationName: !!doc.locationName,
          address: !!doc.address,
          latitude: doc.latitude,
          longitude: doc.longitude,
          category: doc.category,
          type: doc.type,
          description: !!doc.description,
          createdBy: doc.createdBy,
        });
      }

      const insertResult = await LocationPointModel.insertMany(locationPointsToSave, {
        ordered: false,
        validate: true,
      });

      console.log('🟡 insertMany completed');
      console.log('🟡 insertResult type:', typeof insertResult);
      console.log('🟡 insertResult is array:', Array.isArray(insertResult));
      console.log('🟡 insertResult length:', insertResult?.length);

      // Mongoose insertMany returns the saved documents
      if (Array.isArray(insertResult) && insertResult.length > 0) {
        savedLocationPoints = insertResult;
        console.log('✅ insertMany returned documents:', { 
          count: savedLocationPoints.length,
          ids: savedLocationPoints.map((doc: any) => doc._id)
        });
      } else {
        // If insertMany doesn't return documents, use the original data with generated IDs
        console.log('⚠️ insertMany returned empty array, using fallback');
        savedLocationPoints = locationPointsToSave;
      }
    } catch (mongoError: any) {
      console.error('❌ MongoDB insertMany error:', mongoError.message);
      console.error('❌ Error name:', mongoError.name);
      console.error('❌ Error code:', mongoError.code);
      
      if (mongoError.writeErrors) {
        console.error('❌ Write errors:', mongoError.writeErrors.map((e: any) => ({
          message: e.err.msg,
          code: e.err.code,
        })));
      }
      
      if (mongoError.insertedDocs) {
        console.log('✅ Some docs inserted before error:', mongoError.insertedDocs.length);
        savedLocationPoints = mongoError.insertedDocs;
      } else {
        console.log('🟡 Fallback: Using locationPointsToSave');
        savedLocationPoints = locationPointsToSave;
      }
    }

    // 6. Prepare response data with proper fields
    console.log('🟡 About to prepare response data, savedLocationPoints:', {
      length: savedLocationPoints.length,
      type: typeof savedLocationPoints,
      isArray: Array.isArray(savedLocationPoints),
    });

    // Prepare full response data (service always returns full data, controller handles bare mode)
    let responseData = savedLocationPoints.map((doc: any) => ({
      _id: doc._id || `temp_${Date.now()}_${Math.random()}`,
      locationName: doc.locationName,
      address: doc.address,
      latitude: doc.latitude,
      longitude: doc.longitude,
      category: doc.category,
      type: doc.type,
      imageUrl: doc.imageUrl || '',
      description: doc.description,
      schedule: doc.schedule,
      createdBy: doc.createdBy,
      status: doc.status,
      links: doc.links || [],
      reviews: doc.reviews || [],
    }));

    console.log('🟡 Response data prepared:', { count: responseData.length, first: responseData[0] });

    // 7. Cache in Redis (24 hour TTL)
    if (responseData.length > 0) {
      try {
        await redis.setex(
          redisKey,
          24 * 60 * 60,
          JSON.stringify(responseData)
        );
        console.log('✅ Cached in Redis');
      } catch (redisError) {
        console.error('⚠️ Failed to cache in Redis:', redisError);
        // Continue anyway - not critical
      }
    }

    console.log('🟡 Returning results:', { count: responseData.length, source: 'api' });
    return {
      results: responseData,
      source: 'api',
    };
  } catch (error) {
    console.error('❌ Error geocoding:', error);
    throw error;
  }
};
