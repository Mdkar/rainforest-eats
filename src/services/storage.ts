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
  /**
   * Get user preferences from local storage
   */
  getUserPreferences(): UserPreferences {
    try {
      const storedPrefs = localStorage.getItem(USER_PREFERENCES_KEY);
      if (storedPrefs) {
        return JSON.parse(storedPrefs);
      }
    } catch (error) {
      console.error('Error reading user preferences from local storage:', error);
    }
    return DEFAULT_PREFERENCES;
  }

  /**
   * Save user preferences to local storage
   */
  saveUserPreferences(preferences: UserPreferences): void {
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
