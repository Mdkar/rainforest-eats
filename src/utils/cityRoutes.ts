export interface CityInfo {
  name: string;
  slug: string;
  lat: number;
  lng: number;
  /** Number of buildings in this city (shown in the Settings dropdown). */
  count: number;
  /** Optional emoji or icon identifier for future use (e.g. header, map pin). */
  icon?: string;
}

/**
 * All supported cities with their URL slugs, approximate center coordinates,
 * and building counts. This is the single source of truth — Settings.tsx,
 * MapView.tsx, and the router all derive their data from here.
 */
export const CITIES: CityInfo[] = [
  { name: 'Seattle',            slug: 'seattle',            lat: 47.6062,  lng: -122.3321, count: 29 },
  { name: 'Bellevue',           slug: 'bellevue',           lat: 47.6101,  lng: -122.2015, count: 7  },
  { name: 'New York',           slug: 'new-york',           lat: 40.7128,  lng: -74.0060,  count: 6  },
  { name: 'Redmond',            slug: 'redmond',            lat: 47.6740,  lng: -122.1215, count: 6  },
  { name: 'Sunnyvale',          slug: 'sunnyvale',          lat: 37.3688,  lng: -122.0363, count: 6  },
  { name: 'Austin',             slug: 'austin',             lat: 30.2672,  lng: -97.7431,  count: 4  },
  { name: 'Santa Clara',        slug: 'santa-clara',        lat: 37.3541,  lng: -121.9552, count: 3  },
  { name: 'Arlington',          slug: 'arlington',          lat: 38.8816,  lng: -77.0910,  count: 3  },
  { name: 'Vancouver',          slug: 'vancouver',          lat: 49.2827,  lng: -123.1207, count: 3  },
  { name: 'Boston',             slug: 'boston',             lat: 42.3601,  lng: -71.0589,  count: 2  },
  { name: 'Herndon',            slug: 'herndon',            lat: 38.9696,  lng: -77.3861,  count: 2  },
  { name: 'Culver City',        slug: 'culver-city',        lat: 34.0211,  lng: -118.3965, count: 2  },
  { name: 'Nashville',          slug: 'nashville',          lat: 36.1627,  lng: -86.7816,  count: 1  },
  { name: 'Annapolis Junction', slug: 'annapolis-junction', lat: 39.1218,  lng: -76.7791,  count: 1  },
  { name: 'Denver',             slug: 'denver',             lat: 39.7392,  lng: -104.9903, count: 1  },
  { name: 'Santa Monica',       slug: 'santa-monica',       lat: 34.0195,  lng: -118.4912, count: 1  },
  { name: 'San Diego',          slug: 'san-diego',          lat: 32.7157,  lng: -117.1611, count: 1  },
  { name: 'Kirkland',           slug: 'kirkland',           lat: 47.6815,  lng: -122.2087, count: 1  },
  { name: 'Palo Alto',          slug: 'palo-alto',          lat: 37.4419,  lng: -122.1430, count: 1  },
  { name: 'Irvine',             slug: 'irvine',             lat: 33.6846,  lng: -117.8265, count: 1  },
  { name: 'Toronto',            slug: 'toronto',            lat: 43.6532,  lng: -79.3832,  count: 1  },
  { name: 'Richmond Hill',      slug: 'richmond-hill',      lat: 43.8828,  lng: -79.4403,  count: 0  },
];

/**
 * Mapping between URL slugs and the city name strings used by the API.
 * Add new cities here and they'll automatically be available as routes.
 */
export const CITY_SLUG_TO_NAME: Record<string, string> = Object.fromEntries(
  CITIES.map(c => [c.slug, c.name])
);

/** Reverse map: city name → URL slug */
export const CITY_NAME_TO_SLUG: Record<string, string> = Object.fromEntries(
  CITIES.map(c => [c.name, c.slug])
);

/** All city slugs, in display order. */
export const CITY_SLUGS = CITIES.map(c => c.slug);

/** Default city slug when nothing is stored. */
export const DEFAULT_CITY_SLUG = 'seattle';
