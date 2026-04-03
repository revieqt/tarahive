import { AIItineraryRequest, AIItineraryResponse } from "./ai.types";
import axios from "axios";
import { AI_CONFIG } from "./ai.config";
import { geocodeService } from "../places/places.service";

export const generateAIItinerary = async (
  payload: AIItineraryRequest
): Promise<AIItineraryResponse> => {

  const prompt = `
Create a travel itinerary.

Destination: ${payload.destination}
Start Date: ${payload.startDate}
End Date: ${payload.endDate}
Daily planning: ${payload.planDaily}

Interests: ${payload.interests?.join(", ") || "general travel"}

Important rules:
- Do NOT pair locations that are very far from each other on the same day.
- Group locations that are geographically close.
- Prefer places within the same city, district, or area per day.
- Avoid travel that would require more than 1–2 hours between locations in a single day.
- Maximum of 4–5 locations per day.
- Plan a logical travel flow (north to south, city center outward, etc).
- Popular tourist attractions should be prioritized.
-If the destination is large, group locations by area (north, south, city center, etc).

Location rules:
- Use real tourist attractions in the destination.
- Provide approximate latitude and longitude if possible.
- Avoid fictional or unknown places.

Return ONLY valid JSON.

Schema:
{
  "title": string,
  "type": string,
  "description": string,
  "startDate": string,
  "endDate": string,
  "planDaily": boolean,
  "locations": []
}

If planDaily is true:
locations = [
 {
   "date": string,
   "locations": [
     {
       "latitude": number,
       "longitude": number,
       "locationName": string,
       "note": string
     }
   ]
 }
]

If planDaily is false:
locations = [
 {
   "latitude": number,
   "longitude": number,
   "locationName": string,
   "note": string
 }
]

Return JSON only. No explanations.
`;

  const response = await axios.post(
    AI_CONFIG.apiUrl,
    {
      model: AI_CONFIG.models.itinerary,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${AI_CONFIG.apiKey}`,
      },
    }
  );

  const content = response.data.choices[0].message.content;

  return JSON.parse(content);
};

/**
 * Sanitize itinerary locations by validating them via geocoding
 * - Checks if each location exists
 * - Updates coordinates from geocoded data
 * - Removes locations that don't exist
 * - Handles both planDaily and non-planDaily schemas
 */
export const sanitizeLocations = async (
  itinerary: AIItineraryResponse
): Promise<AIItineraryResponse> => {
  try {
    console.log('🟡 Sanitizing locations for itinerary:', { 
      title: itinerary.title, 
      planDaily: itinerary.planDaily,
      locationsCount: itinerary.locations?.length || 0 
    });

    if (!itinerary.locations || itinerary.locations.length === 0) {
      console.log('⚠️ No locations to sanitize');
      return itinerary;
    }

    if (itinerary.planDaily) {
      // Handle planDaily schema: locations is array of AIDailyItinerary objects
      const sanitizedDays: typeof itinerary.locations = [];

      for (const dayObj of itinerary.locations as any[]) {
        // Check if this is a daily itinerary (has 'date' field)
        if (dayObj.date && dayObj.locations) {
          const sanitizedDay: any = { date: dayObj.date, locations: [] };

          for (const location of dayObj.locations) {
            try {
              console.log('🟡 Geocoding location:', location.locationName);
              const geocodeResult = await geocodeService(location.locationName);

              if (geocodeResult.results && geocodeResult.results.length > 0) {
                const geocodedLocation = geocodeResult.results[0];
                // Override with actual geocoded coordinates
                location.latitude = geocodedLocation.latitude;
                location.longitude = geocodedLocation.longitude;
                // Add address from geocoded result
                location.address = geocodedLocation.address;
                console.log('✅ Location validated:', { 
                  name: location.locationName, 
                  lat: location.latitude, 
                  lon: location.longitude,
                  address: location.address
                });
                sanitizedDay.locations.push(location);
              } else {
                console.warn('⚠️ Location not found:', location.locationName);
                // Skip this location - removed from itinerary
              }
            } catch (error) {
              console.error('❌ Error geocoding location:', location.locationName, error);
              // Skip on error
            }
          }

          if (sanitizedDay.locations.length > 0) {
            sanitizedDays.push(sanitizedDay);
          }
        }
      }

      itinerary.locations = sanitizedDays;
    } else {
      // Handle non-planDaily schema: locations is array of AILocation objects directly
      const sanitizedLocations: typeof itinerary.locations = [];

      for (const location of itinerary.locations as any[]) {
        // Check if this is a location object (has latitude, longitude)
        if (typeof location.latitude === 'number' && typeof location.longitude === 'number') {
          try {
            console.log('🟡 Geocoding location:', location.locationName);
            const geocodeResult = await geocodeService(location.locationName);

            if (geocodeResult.results && geocodeResult.results.length > 0) {
              const geocodedLocation = geocodeResult.results[0];
              // Override with actual geocoded coordinates
              location.latitude = geocodedLocation.latitude;
              location.longitude = geocodedLocation.longitude;
              // Add address from geocoded result
              location.address = geocodedLocation.address;
              console.log('✅ Location validated:', { 
                name: location.locationName, 
                lat: location.latitude, 
                lon: location.longitude,
                address: location.address
              });
              sanitizedLocations.push(location);
            } else {
              console.warn('⚠️ Location not found:', location.locationName);
              // Skip this location - removed from itinerary
            }
          } catch (error) {
            console.error('❌ Error geocoding location:', location.locationName, error);
            // Skip on error
          }
        }
      }

      itinerary.locations = sanitizedLocations;
    }

    console.log('✅ Location sanitization complete:', { 
      remainingLocations: itinerary.locations.length 
    });
    return itinerary;
  } catch (error) {
    console.error('❌ Error sanitizing locations:', error);
    return itinerary; // Return unsanitized if something goes wrong
  }
};