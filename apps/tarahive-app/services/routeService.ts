import { BACKEND_URL } from '@/constants/Config';

const API_URL = `${BACKEND_URL}/api/routes`;

export type RouteStep = {
  distance: number;        // meters for this step
  duration: number;        // seconds for this step
  instruction: string;     // "Turn left onto Main St"
  name?: string;           // street/POI name if available
  way_points: [number, number]; // indices in geometry polyline
};

export type RouteSegment = {
  distance: number;        // meters between two stops
  duration: number;        // seconds between two stops
  steps?: RouteStep[];     // turn-by-turn steps if requested
};

export type RouteData = {
  geometry: {
    coordinates: [number, number, number?][]; // [lon, lat, ele?] if elevation enabled
    type: string; // "LineString"
  };
  distance: number;   // total meters
  duration: number;   // total seconds
  bbox?: number[];
  segments: RouteSegment[]; // per-stop breakdown
};

export async function getRoutes(params: {
  location: { latitude: number; longitude: number }[];
  mode: string;
  accessToken: string;
}): Promise<RouteData[] | null> {
  try {
    console.log('🚀 Frontend getRoutes called with:', {
      locationCount: params.location.length,
      mode: params.mode,
      locations: params.location.map((loc, i) => `${i}: [${loc.latitude}, ${loc.longitude}]`)
    });

    const res = await fetch(`${API_URL}/get`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${params.accessToken}`
      },
      body: JSON.stringify({
        location: params.location,
        mode: params.mode,
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch routes: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    const routes: RouteData[] = data.routes || [];
    
    console.log('✅ Frontend received route data:', {
      totalRoutes: routes.length,
      routes: routes.map((r, i) => ({
        index: i + 1,
        distance: `${(r.distance / 1000).toFixed(2)} km`,
        duration: `${Math.round(r.duration / 60)} min`,
        segmentCount: r.segments?.length || 0,
        totalSteps: r.segments?.reduce((acc, seg) => acc + (seg.steps?.length || 0), 0) || 0,
        coordinateCount: r.geometry?.coordinates?.length || 0
      }))
    });
    
    return routes;
  } catch (err) {
    console.error('❌ Frontend getRoutes error:', err);
    return null;
  }
}

export async function generateRouteWithLocations(params: {
  startLocation: { latitude: number; longitude: number };
  endLocation: { latitude: number; longitude: number };
  waypoints: { latitude: number; longitude: number }[];
  mode: string;
  userID: string;
  accessToken: string;
}) {
  const { startLocation, endLocation, waypoints, mode, userID, accessToken } = params;
  
  if (!mode || !endLocation || !userID || !startLocation || !accessToken) {
    console.log('Missing required data for route generation');
    return null;
  }

  try {
    // Build location array: start -> waypoints -> end
    const locationArray = [
      startLocation, // Starting location
      ...waypoints, // Waypoints
      endLocation // End location
    ];

    const route = await getRoutes({
      location: locationArray,
      mode: mode,
      accessToken: accessToken
    });

    if (route) {
      console.log('Route generated:', route);
      return route;
    } else {
      console.log('Failed to generate route');
      return null;
    }
  } catch (error) {
    console.error('Error generating route:', error);
    return null;
  }
}

export async function createRoute(params: {
  userID: string;
  status: string;
  mode: string;
  location: { latitude: number; longitude: number; locationName: string }[];
}, accessToken: string) {
  try {
    const res = await fetch(`${API_URL}/create`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to create route');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('createRoute error:', err);
    return null;
  }
}