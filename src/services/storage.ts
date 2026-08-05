import { UserPreferences } from '../types';

// Local storage keys
const USER_PREFERENCES_KEY = 'rainforest-eats-preferences';

// Note: menu caching was removed. The old keys (rainforest-eats-cached-menus-meta
// and rainforest-eats-cached-menus-chunk-*) are no longer written and can be ignored.

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  selectedBuildings: [],
  ignoredBrands: ['Barcoded Items', 'SCAN & PAY', 'Barcoder', 'Scan & Pay'],
  minPrice: 0,
  selectedCity: 'Seattle',
  debugMode: false
};

class StorageService {
  // In-memory cache — all reads come from here after first load, preventing
  // read-modify-write races when multiple saves happen in the same tick
  private cache: UserPreferences | null = null;

  /**
   * Get user preferences — returns the in-memory cache if available,
   * otherwise reads from localStorage once and caches the result
   */
  getUserPreferences(): UserPreferences {
    if (this.cache) return this.cache;
    try {
      const storedPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
      if (storedPrefs) {
        this.cache = JSON.parse(storedPrefs);
        return this.cache!;
      }
    } catch (error) {
      console.error('Error reading user preferences from local storage:', error);
    }
    this.cache = { ...DEFAULT_PREFERENCES };
    return this.cache;
  }

  /**
   * Save user preferences to local storage and update the in-memory cache
   */
  saveUserPreferences(preferences: UserPreferences): void {
    this.cache = preferences;
    try {
      localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences to local storage:', error);
    }
  }

  /**
   * Update selected buildings in user preferences
   */
  saveSelectedBuildings(buildingIds: string[]): void {
    const preferences = this.getUserPreferences();
    preferences.selectedBuildings = buildingIds;
    this.saveUserPreferences(preferences);
  }

  /**
   * Save last search query
   */
  saveLastSearch(searchQuery: string): void {
    const preferences = this.getUserPreferences();
    preferences.lastSearch = searchQuery;
    this.saveUserPreferences(preferences);
  }

  /**
   * Save ignored brands list
   */
  saveIgnoredBrands(ignoredBrands: string[]): void {
    const preferences = this.getUserPreferences();
    preferences.ignoredBrands = ignoredBrands;
    this.saveUserPreferences(preferences);
  }

  /**
   * Save minimum price filter
   */
  saveMinPrice(minPrice: number): void {
    const preferences = this.getUserPreferences();
    preferences.minPrice = minPrice;
    this.saveUserPreferences(preferences);
  }

  /**
   * Save selected city
   */
  saveSelectedCity(selectedCity: string): void {
    const preferences = this.getUserPreferences();
    preferences.selectedCity = selectedCity;
    this.saveUserPreferences(preferences);
  }

  /**
   * Save debug mode
   */
  saveDebugMode(debugMode: boolean): void {
    const preferences = this.getUserPreferences();
    preferences.debugMode = debugMode;
    this.saveUserPreferences(preferences);
  }
}

const storageService = new StorageService();
export default storageService;
