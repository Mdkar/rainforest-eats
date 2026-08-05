import { 
  GuestTokenResponse,
  BuildingGroup, 
  BuildingDetail,
  Menu,
} from '../types';
import mockDataService from './mockData';
import storageService from './storage';

// Flag to control whether to use mock data or real API
export const USE_MOCK_DATA = false;

const API_BASE_URL = 'https://api.compassdigital.org';
const REALM = 'Kq8m4B8GNRCgjlRL9A3rsYj0YBNGP3SLOKgg';
const MULTIGROUP_ID = 'Ym7By6oy1dTOBE5P880jTamr9022GqCD7BB2y1vOIlgk1B16Y7hzOGjMXNMoh1oQRojae9T8JqBXJ8llt9d';

// Hours during which restaurants are typically open (11:00 AM - 2:00 PM)
const SERVICE_START_HOUR = 11;
const SERVICE_END_HOUR = 14; // 2:00 PM

class ApiService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  private tokenPromise: Promise<string> | null = null;
  // In-memory debug flag — updated by setDebugMode, avoids a localStorage read on every log call
  private _debugMode: boolean = storageService.getUserPreferences().debugMode ?? false;

  // In-flight request caches — keyed by ID so concurrent callers for the same
  // resource share one request instead of each firing their own
  private buildingsPromise: Promise<BuildingGroup> | null = null;
  private buildingDetailPromises: Map<string, Promise<BuildingDetail>> = new Map();
  private menuPromises: Map<string, Promise<Menu>> = new Map();
  // IDs that returned a non-retryable error (e.g. 404) — skip these permanently
  private failedMenuIds: Set<string> = new Set();

  setDebugMode(enabled: boolean): void {
    this._debugMode = enabled;
  }

  /**
   * Check if the current local time is outside normal service hours (11am–2pm)
   */
  isOutsideServiceHours(): boolean {
    const now = new Date();
    const hour = now.getHours();
    return hour < SERVICE_START_HOUR || hour >= SERVICE_END_HOUR;
  }

  debugLog(...args: any[]) {
    if (this._debugMode) {
      console.log(...args);
    }
  }
  
  /**
   * Get a guest token for API authentication
   */
  async getGuestToken(): Promise<string> {
    // If using mock data, return mock token
    if (USE_MOCK_DATA) {
      const mockResponse = mockDataService.getGuestToken();
      this.token = mockResponse.token;
      this.tokenExpiry = new Date(mockResponse.access.expires);
      return this.token;
    }
    
    // If we have a valid cached token, return it immediately
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }

    // If a token fetch is already in flight, reuse that promise so concurrent
    // callers don't each fire their own request
    if (this.tokenPromise) {
      return this.tokenPromise;
    }

    this.tokenPromise = fetch(`${API_BASE_URL}/user/guest/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ realm: REALM }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to get guest token: ${response.status}`);
        }
        return response.json() as Promise<GuestTokenResponse>;
      })
      .then(data => {
        this.token = data.token;
        this.tokenExpiry = new Date(data.access.expires);
        return this.token!;
      })
      .catch(error => {
        console.error('Error getting guest token:', error);
        throw error;
      })
      .finally(() => {
        // Clear the in-flight promise so future calls after this one completes
        // go through the normal cached-token path
        this.tokenPromise = null;
      });

    return this.tokenPromise;
  }
  
  /**
   * Get the list of all buildings in the group
   */
  async getBuildings(): Promise<BuildingGroup> {
    if (USE_MOCK_DATA) {
      return mockDataService.getBuildingGroup();
    }

    // If a fetch is already in flight, reuse it
    if (this.buildingsPromise) {
      return this.buildingsPromise;
    }

    const token = await this.getGuestToken();

    this.buildingsPromise = fetch(`${API_BASE_URL}/location/multigroup/${MULTIGROUP_ID}`, {
      headers: { 'Authorization': token },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to get buildings: ${response.status}`);
        }
        return response.json() as Promise<BuildingGroup>;
      })
      .catch(error => {
        console.error('Error getting buildings:', error);
        throw error;
      })
      .finally(() => {
        this.buildingsPromise = null;
      });

    return this.buildingsPromise;
  }
  
  /**
   * Get details for a specific building including dining locations
   */
  async getBuildingDetail(buildingId: string): Promise<BuildingDetail> {
    if (USE_MOCK_DATA) {
      const detail = mockDataService.getBuildingDetail(buildingId);
      if (!detail) {
        throw new Error(`Building detail not found for ID: ${buildingId}`);
      }
      return detail;
    }

    // If a fetch for this building is already in flight, reuse it
    if (this.buildingDetailPromises.has(buildingId)) {
      return this.buildingDetailPromises.get(buildingId)!;
    }

    const token = await this.getGuestToken();

    const promise = fetch(`${API_BASE_URL}/location/group/${buildingId}`, {
      headers: { 'Authorization': token },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to get building details: ${response.status}`);
        }
        return response.json() as Promise<BuildingDetail>;
      })
      .catch(error => {
        console.error(`Error getting building detail for ${buildingId}:`, error);
        throw error;
      })
      .finally(() => {
        this.buildingDetailPromises.delete(buildingId);
      });

    this.buildingDetailPromises.set(buildingId, promise);
    return promise;
  }
  
  /**
   * Get the menu for a specific dining location
   */
  async getMenu(menuId: string): Promise<Menu> {
    if (USE_MOCK_DATA) {
      const menu = mockDataService.getMenu(menuId);
      if (!menu) {
        throw new Error(`Menu not found for ID: ${menuId}`);
      }
      return menu;
    }

    // Skip IDs that have already permanently failed (e.g. 404)
    if (this.failedMenuIds.has(menuId)) {
      throw new Error(`Menu ${menuId} previously returned a permanent error, skipping`);
    }

    // If a fetch for this menu is already in flight, reuse it
    if (this.menuPromises.has(menuId)) {
      return this.menuPromises.get(menuId)!;
    }

    const token = await this.getGuestToken();

    const promise = fetch(`${API_BASE_URL}/menu/${menuId}`, {
      headers: { 'Authorization': token },
    })
      .then(response => {
        if (!response.ok) {
          // 404 and other client errors won't resolve on retry — mark permanently failed
          if (response.status === 404 || (response.status >= 400 && response.status < 500)) {
            this.failedMenuIds.add(menuId);
          }
          throw new Error(`Failed to get menu: ${response.status}`);
        }
        return response.json() as Promise<Menu>;
      })
      .catch(error => {
        console.error(`Error getting menu for ${menuId}:`, error);
        throw error;
      })
      .finally(() => {
        this.menuPromises.delete(menuId);
      });

    this.menuPromises.set(menuId, promise);
    return promise;
  }
}

export default new ApiService();
