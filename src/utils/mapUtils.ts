import { Building } from '../types';

/**
 * Calculates the distance between two geographic coordinates using the Haversine formula
 * @param coord1 First coordinate with latitude and longitude
 * @param coord2 Second coordinate with latitude and longitude
 * @returns Distance in kilometers
 */
export function calculateDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  
  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);
  
  const a = 
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

/**
 * Calculates the geographic center point from an array of buildings
 * @param buildings Array of buildings with coordinate information
 * @returns Center point with latitude and longitude, or default coordinates if array is empty
 */
export function calculateMapCenter(buildings: Building[]): { lat: number; lng: number } {
  // Handle edge case of empty buildings array
  if (buildings.length === 0) {
    // Return default center (Seattle area as fallback)
    return { lat: 47.6062, lng: -122.3321 };
  }
  
  // Calculate average latitude and longitude
  const sum = buildings.reduce(
    (acc, building) => ({
      lat: acc.lat + building.address.coordinates.latitude,
      lng: acc.lng + building.address.coordinates.longitude
    }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: sum.lat / buildings.length,
    lng: sum.lng / buildings.length
  };
}

/**
 * Helper function to convert degrees to radians
 * @param degrees Angle in degrees
 * @returns Angle in radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
