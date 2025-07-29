import { 
  UserPreferences, 
  CachedMenus, 
  Menu,
  CachedMenu
} from '../types';

// Local storage keys
const USER_PREFERENCES_KEY = 'rainforest-eats-preferences';
const CACHED_MENUS_KEY = 'rainforest-eats-cached-menus';

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  selectedBuildings: []
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
   * Get cached menus from local storage
   */
  getCachedMenus(): CachedMenus {
    try {
      const cachedMenusString = localStorage.getItem(CACHED_MENUS_KEY);
      if (cachedMenusString) {
        return JSON.parse(cachedMenusString);
      }
    } catch (error) {
      console.error('Error reading cached menus from local storage:', error);
    }
    return {};
  }
  
  /**
   * Save a menu to the cache
   */
  cacheMenu(menuId: string, menu: Menu): void {
    try {
      const cachedMenus = this.getCachedMenus();
      const cachedMenu: CachedMenu = {
        menu,
        timestamp: Date.now()
      };
      
      cachedMenus[menuId] = cachedMenu;
      localStorage.setItem(CACHED_MENUS_KEY, JSON.stringify(cachedMenus));
    } catch (error) {
      console.error(`Error caching menu ${menuId}:`, error);
    }
  }
  
  /**
   * Batch cache multiple menus
   */
  cacheMenus(menuMap: { [menuId: string]: Menu }): void {
    try {
      const cachedMenus = this.getCachedMenus();
      const timestamp = Date.now();
      
      Object.entries(menuMap).forEach(([menuId, menu]) => {
        cachedMenus[menuId] = {
          menu,
          timestamp
        };
      });
      
      localStorage.setItem(CACHED_MENUS_KEY, JSON.stringify(cachedMenus));
    } catch (error) {
      console.error('Error batch caching menus:', error);
    }
  }
  
  /**
   * Check if a cached menu exists and is not too old
   * @param menuId The menu ID to check
   * @param maxAgeHours Maximum age in hours for a cached menu to be valid
   */
  isCachedMenuValid(menuId: string, maxAgeHours: number = 24): boolean {
    const cachedMenus = this.getCachedMenus();
    const cachedMenu = cachedMenus[menuId];
    
    if (!cachedMenu) {
      return false;
    }
    
    const cachedTime = new Date(cachedMenu.timestamp);
    const now = new Date();
    const diffMs = now.getTime() - cachedTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    return diffHours <= maxAgeHours;
  }
}

export default new StorageService();
