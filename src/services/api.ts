import { 
  GuestTokenResponse,
  BuildingGroup, 
  BuildingDetail,
  Menu,
  CachedMenus,
  Building
} from '../types';
import mockDataService from './mockData';

// Flag to control whether to use mock data or real API
export const USE_MOCK_DATA = false;

const API_BASE_URL = 'https://api.compassdigital.org';
const REALM = 'Kq8m4B8GNRCgjlRL9A3rsYj0YBNGP3SLOKgg';
const MULTIGROUP_ID = 'Ym7By6oy1dTOBE5P880jTamr9022GqCD7BB2y1vOIlgk1B16Y7hzOGjMXNMoh1oQRojae9T8JqBXJ8llt9d';

// Hours during which the API is active (11:00 AM - 2:00 PM)
const API_ACTIVE_START_HOUR = 11;
const API_ACTIVE_END_HOUR = 16; // 2:00 PM

class ApiService {
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
  /**
   * Check if the API is likely to be active based on current time
   */
  isApiActive(): boolean {
    // For mock data, we'll say it's always active
    if (USE_MOCK_DATA) {
      return true;
    }    
    const now = new Date();
    const hour = now.getHours();
    return hour >= API_ACTIVE_START_HOUR && hour < API_ACTIVE_END_HOUR;
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
    
    // If we have a valid token that hasn't expired, return it
    if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.token;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/guest/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ realm: REALM }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get guest token: ${response.status}`);
      }
      
      const data: GuestTokenResponse = await response.json();
      this.token = data.token;
      this.tokenExpiry = new Date(data.access.expires);
      
      return this.token;
    } catch (error) {
      console.error('Error getting guest token:', error);
      throw error;
    }
  }
  
  /**
   * Get the list of all buildings in the group
   */
  async getBuildings(): Promise<BuildingGroup> {
    if (USE_MOCK_DATA) {
      return mockDataService.getBuildingGroup();
    }
    
    const token = await this.getGuestToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/location/multigroup/${MULTIGROUP_ID}`, {
        headers: {
          'Authorization': token,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get buildings: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting buildings:', error);
      throw error;
    }
  }
  
  /**
   * Get details for a specific building including dining locations
   */
  async getBuildingDetail(buildingId: string): Promise<BuildingDetail> {
    if (USE_MOCK_DATA) {
      const detail = mockDataService.getBuildingDetail(buildingId);
      console.log("hello, this is the detail", detail);
      if (!detail) {
        throw new Error(`Building detail not found for ID: ${buildingId}`);
      }
      return detail;
    }
    
    const token = await this.getGuestToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/location/group/${buildingId}`, {
        headers: {
          'Authorization': token,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get building details: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting building detail for ${buildingId}:`, error);
      throw error;
    }
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
    
    const token = await this.getGuestToken();
    
    try {
      const response = await fetch(`${API_BASE_URL}/menu/${menuId}`, {
        headers: {
          'Authorization': token,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get menu: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error getting menu for ${menuId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a menu, either from the API or from cache if the API is not active
   */
  async getMenuWithFallback(menuId: string, cachedMenus: CachedMenus): Promise<{ menu: Menu; isCached: boolean; cacheDate?: Date }> {
    // Try to get from API if it's active time
    if (this.isApiActive()) {
      try {
        const menu = await this.getMenu(menuId);
        return { menu, isCached: false };
      } catch (error) {
        console.warn(`API call failed, falling back to cache for menu ${menuId}`);
      }
    }
    
    // Fall back to cached menu if available
    const cachedMenu = cachedMenus[menuId];
    if (cachedMenu) {
      return { 
        menu: cachedMenu.menu, 
        isCached: true, 
        cacheDate: new Date(cachedMenu.timestamp)
      };
    }
    
    // If no cache available and API failed, propagate the failure
    throw new Error(`Menu ${menuId} is not available from API and no cache exists`);
  }
}

export default new ApiService();
