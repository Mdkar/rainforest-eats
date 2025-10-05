import { 
  UserPreferences, 
  CachedMenus, 
  Menu,
  CachedMenu
} from '../types';

// Local storage keys
const USER_PREFERENCES_KEY = 'rainforest-eats-preferences';
const CACHED_MENUS_META_KEY = 'rainforest-eats-cached-menus-meta';
const CACHED_MENUS_CHUNK_PREFIX = 'rainforest-eats-cached-menus-chunk-';

// Chunking configuration
const CHUNK_SIZE_LIMIT = 1024 * 1024; // 1MB per chunk
const MAX_CHUNKS = 50; // Safety limit

// Chunk metadata interface
interface ChunkMetadata {
  chunkCount: number;
  totalSize: number;
  timestamp: number;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  selectedBuildings: [],
  ignoredBrands: ['Barcoded Items', 'SCAN & PAY', 'Barcoder', 'Scan & Pay'],
  minPrice: 0,
  selectedCity: 'Seattle'
};

class StorageService {
  /**
   * Clear all cached menu chunks and metadata
   */
  private clearCachedMenuChunks(): void {
    try {
      // Clear metadata
      localStorage.removeItem(CACHED_MENUS_META_KEY);
      
      // Clear all possible chunk keys (up to MAX_CHUNKS)
      for (let i = 0; i < MAX_CHUNKS; i++) {
        const chunkKey = `${CACHED_MENUS_CHUNK_PREFIX}${i}`;
        localStorage.removeItem(chunkKey);
      }
    } catch (error) {
      console.error('Error clearing cached menu chunks:', error);
    }
  }

  /**
   * Get chunk metadata
   */
  private getChunkMetadata(): ChunkMetadata | null {
    try {
      const metadataString = localStorage.getItem(CACHED_MENUS_META_KEY);
      if (metadataString) {
        return JSON.parse(metadataString);
      }
    } catch (error) {
      console.error('Error reading chunk metadata:', error);
    }
    return null;
  }

  /**
   * Set chunk metadata
   */
  private setChunkMetadata(metadata: ChunkMetadata): void {
    try {
      localStorage.setItem(CACHED_MENUS_META_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving chunk metadata:', error);
    }
  }

  /**
   * Get cached menus from chunked local storage
   */
  private getCachedMenusChunked(): CachedMenus {
    try {
      const metadata = this.getChunkMetadata();
      if (!metadata) {
        return {};
      }

      // Read all chunks and reassemble
      let reassembledData = '';
      for (let i = 0; i < metadata.chunkCount; i++) {
        const chunkKey = `${CACHED_MENUS_CHUNK_PREFIX}${i}`;
        const chunkData = localStorage.getItem(chunkKey);
        if (!chunkData) {
          console.error(`Missing chunk ${i} of ${metadata.chunkCount}`);
          return {};
        }
        reassembledData += chunkData;
      }

      return JSON.parse(reassembledData);
    } catch (error) {
      console.error('Error reading cached menus from chunks:', error);
      return {};
    }
  }

  /**
   * Save cached menus to chunked local storage
   */
  private setCachedMenusChunked(cachedMenus: CachedMenus): void {
    try {
      // Clear existing chunks first
      this.clearCachedMenuChunks();

      const dataString = JSON.stringify(cachedMenus);
      const totalSize = dataString.length;

      // If data is small enough, store in single chunk
      if (totalSize <= CHUNK_SIZE_LIMIT) {
        localStorage.setItem(`${CACHED_MENUS_CHUNK_PREFIX}0`, dataString);
        this.setChunkMetadata({
          chunkCount: 1,
          totalSize,
          timestamp: Date.now()
        });
        return;
      }

      // Split into multiple chunks
      const chunkCount = Math.ceil(totalSize / CHUNK_SIZE_LIMIT);
      
      if (chunkCount > MAX_CHUNKS) {
        throw new Error(`Data too large: requires ${chunkCount} chunks, max is ${MAX_CHUNKS}`);
      }

      for (let i = 0; i < chunkCount; i++) {
        const start = i * CHUNK_SIZE_LIMIT;
        const end = Math.min(start + CHUNK_SIZE_LIMIT, totalSize);
        const chunkData = dataString.slice(start, end);
        const chunkKey = `${CACHED_MENUS_CHUNK_PREFIX}${i}`;
        
        localStorage.setItem(chunkKey, chunkData);
      }

      // Save metadata
      this.setChunkMetadata({
        chunkCount,
        totalSize,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error('Error saving cached menus to chunks:', error);
      // Clean up on error
      this.clearCachedMenuChunks();
    }
  }

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
   * Get cached menus from local storage
   */
  getCachedMenus(): CachedMenus {
    return this.getCachedMenusChunked();
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
      this.setCachedMenusChunked(cachedMenus);
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
      
      this.setCachedMenusChunked(cachedMenus);
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

const storageService = new StorageService();
export default storageService;
