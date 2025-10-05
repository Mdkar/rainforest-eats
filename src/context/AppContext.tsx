import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { 
  Building, 
  BuildingDetail, 
  Menu,
  MenuItem,
  CachedMenus
} from '../types';
import apiService from '../services/api';
import storageService from '../services/storage';

interface SearchResult {
  item: MenuItem;
  buildingName: string;
  locationName: string;
  menuName: string;
}

interface AppContextType {
  // Data
  buildings: Building[];
  selectedBuildingIds: string[];
  buildingDetails: Record<string, BuildingDetail>;
  menus: Record<string, Menu>;
  cachedMenus: CachedMenus;
  isLoading: boolean;
  error: string | null;
  searchResults: SearchResult[];
  searchQuery: string;
  ignoredBrands: string[];
  minPrice: number;
  selectedCity: string;

  // Flag to indicate if we're showing cached data
  isShowingCachedData: boolean;
  cacheDate: Date | null;
  
  // Actions
  setSelectedBuildingIds: (ids: string[]) => void;
  toggleBuildingSelection: (id: string) => void;
  searchMenuItems: (query: string) => void;
  fetchBuildings: () => Promise<void>;
  updateIgnoredBrands: (brands: string[]) => void;
  updateMinPrice: (minPrice: number) => void;
  updateSelectedCity: (city: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State for buildings and user selection
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);
  const [buildingDetails, setBuildingDetails] = useState<Record<string, BuildingDetail>>({});
  const [menus, setMenus] = useState<Record<string, Menu>>({});
  const [cachedMenus, setCachedMenus] = useState<CachedMenus>({});
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  // Cache information
  const [isShowingCachedData, setIsShowingCachedData] = useState(false);
  const [cacheDate, setCacheDate] = useState<Date | null>(null);
  
  // Ignored brands state
  const [ignoredBrands, setIgnoredBrands] = useState<string[]>([]);
  
  // Minimum price filter state
  const [minPrice, setMinPrice] = useState<number>(0);
  
  // Selected city state
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Fetch buildings data
  const fetchBuildings = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!selectedCity) {
        return;
      }

      const buildingGroup = await apiService.getBuildings();
      console.log("Building group received:", buildingGroup);
      
      // Filter for selected city buildings
      const cityBuildings = buildingGroup.groups.filter(
        building => building.address.city === selectedCity
      );
      console.log(`${selectedCity} buildings filtered:`, cityBuildings);
      
      setBuildings(cityBuildings);
      
      // Fetch details for selected buildings
      await fetchSelectedBuildingDetails(selectedBuildingIds);

    } catch (err) {
      setError('Failed to load buildings');
      console.error('Error fetching buildings:', err);
    }

    setIsLoading(false);
  };

  // Fetch details for selected buildings
  const fetchSelectedBuildingDetails = async (buildingIds : string[]) => {
    if (buildingIds.length === 0) return;
    
    console.log("Fetching details for selected buildings:", buildingIds);

    try {
      const detailsPromises = buildingIds.map(async (buildingId) => {
        try {
          return await apiService.getBuildingDetail(buildingId);
        } catch (err) {
          console.error(`Failed to fetch details for building ${buildingId}:`, err);
          return null;
        }
      });

      const detailsArray = await Promise.all(detailsPromises);
      
      const newBuildingDetails: Record<string, BuildingDetail> = {};
      const menusToFetch: string[] = [];

      // Process building details and collect menu IDs
      detailsArray.forEach(detail => {
        if (!detail) return;
        
        newBuildingDetails[detail.id] = detail;
        
        // Collect menu IDs from locations
        detail.locations?.forEach(location => {
          location.brands.forEach(brand => {
            if (!ignoredBrands.includes(brand.name)){
              console.log(`Processing brand "${brand.name}" for building "${detail.name}"`);
            
              if (!brand.menus || brand.menus.length === 0) {
                console.log(`No menus found for location ${location.name}`);
              } else {
                brand.menus.forEach(menu => {
                  if (menu.id) {
                    console.log(`Found menu ID: ${menu.id} - ${menu.label.en}`);
                    menusToFetch.push(menu.id);
                  }
                });
              }

          }});
          
        });
      });

      console.log("Menu IDs to fetch:", menusToFetch);

      // Update building details
      setBuildingDetails(prev => {
        console.log("Setting building details:", newBuildingDetails);
        return { ...prev, ...newBuildingDetails };
      });
      
      // Fetch menus
      await fetchMenus(menusToFetch);
      
    } catch (err) {
      setError('Failed to load building details');
      console.error('Error fetching building details:', err);
    }
  };

  // Fetch menus by ID
  const fetchMenus = async (menuIds: string[]) => {
    if (menuIds.length === 0) return;

    const newMenus: Record<string, Menu> = {};
    let usingCachedData = false;
    let latestCacheDate: Date | null = null;

    try {
      await Promise.all(
        menuIds.map(async (menuId) => {
          try {
            const result = await apiService.getMenuWithFallback(menuId, cachedMenus);
            newMenus[menuId] = result.menu;
            
            // If we got fresh data, cache it
            if (!result.isCached) {
              storageService.cacheMenu(menuId, result.menu);
            } else {
              usingCachedData = true;
              if (result.cacheDate) {
                if (!latestCacheDate || result.cacheDate > latestCacheDate) {
                  latestCacheDate = result.cacheDate;
                }
              }
            }
          } catch (err) {
            console.error(`Failed to fetch menu ${menuId}:`, err);
          }
        })
      );
      setMenus(prevMenus => ({ ...prevMenus, ...newMenus }));
      setIsShowingCachedData(usingCachedData);
      setCacheDate(latestCacheDate);
      
    } catch (err) {
      console.error("Error while fetching menus:", err);
    }
  };

  // Toggle a building selection
  const toggleBuildingSelection = (buildingId: string) => {
    let newSelection: string[];
    
    if (selectedBuildingIds.includes(buildingId)) {
      newSelection = selectedBuildingIds.filter(id => id !== buildingId);
    } else {
      newSelection = [...selectedBuildingIds, buildingId];
    }
    
    setSelectedBuildingIds(newSelection);
    storageService.saveSelectedBuildings(newSelection);
  };

  // Create a reference to track when data is loaded
  const hasLoadedData = useRef(false);

    // Load user preferences and cached menus on initial mount
  useEffect(() => {
    console.log("Initial load of user preferences and cached menus");
    
    const userPrefs = storageService.getUserPreferences();
    setSelectedBuildingIds(userPrefs.selectedBuildings);
    setIgnoredBrands(userPrefs.ignoredBrands || []);
    setMinPrice(userPrefs.minPrice || 0);
    setSelectedCity(userPrefs.selectedCity || 'Seattle');
    
    const storedCachedMenus = storageService.getCachedMenus();
    setCachedMenus(storedCachedMenus);
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [selectedCity])

  useEffect(() => {
    console.log("Selected building IDs changed:", selectedBuildingIds);
    const newlySelectedIds = selectedBuildingIds.filter(
      id => !Object.keys(buildingDetails).includes(id)
    );
    fetchSelectedBuildingDetails(newlySelectedIds);
  }, [selectedBuildingIds]);

  useEffect(() => {
    console.log("Ignored brands changed:", ignoredBrands);
    fetchSelectedBuildingDetails(selectedBuildingIds);
  }, [ignoredBrands]);

  // Effect to check data loading state
  useEffect(() => {
    console.log("Building details or menus changed:", buildingDetails, menus);
    // If building details and menus exist, mark data as loaded
    if (Object.keys(buildingDetails).length > 0 && Object.keys(menus).length > 0) {
      hasLoadedData.current = true;
    }
  }, [buildingDetails, menus]);

  // Search for menu items
  const searchMenuItems = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setSearchQuery('');
      storageService.saveLastSearch('');
      return;
    }

    setSearchQuery(query);
    storageService.saveLastSearch(query);
    
    const normalizedQuery = query.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Log debugging info to help identify the issue
    console.log('Searching for:', normalizedQuery);
    console.log('Selected building IDs:', selectedBuildingIds);
    console.log('Building details:', buildingDetails);
    console.log('Available menus:', menus);
    
    // Only search in selected buildings
    selectedBuildingIds.forEach(buildingId => {
      const buildingDetail = buildingDetails[buildingId];
      if (!buildingDetail) {
        console.log(`No details found for building ${buildingId}`);
        return;
      }

      const buildingName = buildingDetail.name;
      
      // Search through all locations in the building
      buildingDetail.locations.forEach(location => location.brands.forEach(brand => {
        // Skip ignored brands in search results
        if (ignoredBrands.includes(brand.name)) return;
        
        const locationName = brand.name;
        
        // Search through all menus in the location
        brand.menus?.forEach(menuRef => {
          const menu = menus[menuRef.id];
          if (!menu) {
            console.log(`No menu found for ID ${menuRef.id}`);
            return;
          }
          
          const menuName = menu.label.en;
          
          // Search through all menu groups
          menu.groups?.forEach(group => {
            // Search through all items in the group
            group.items?.forEach(item => {
              const itemName = item.label.en.toLowerCase();
              const itemDescription = item.description?.en?.toLowerCase() || '';
              
              // Check if the item matches the search query and price filter
              if (
                (itemName.includes(normalizedQuery) || 
                itemDescription.includes(normalizedQuery)) &&
                (minPrice === 0 || item.price.amount >= minPrice)
              ) {
                console.log(`Found match: ${item.label.en} - $${item.price.amount}`);
                results.push({
                  item,
                  buildingName,
                  locationName,
                  menuName
                });
              }
            });
          });
        });
      }));
    });

    console.log(`Found ${results.length} results for "${query}"`);
    setSearchResults(results);
  };

  // Update ignored brands
  const updateIgnoredBrands = (brands: string[]) => {
    setIgnoredBrands(brands);
  };

  // Update minimum price filter
  const updateMinPrice = (newMinPrice: number) => {
    setMinPrice(newMinPrice);
    storageService.saveMinPrice(newMinPrice);
  };

  // Update selected city
  const updateSelectedCity = (city: string) => {
    // Clear existing data and refresh with new city only if city changes
    if (city !== selectedCity) {
      setSelectedCity(city);
      storageService.saveSelectedCity(city);
      setBuildings([]);
      setBuildingDetails({});
      setMenus({});
      setSelectedBuildingIds([]);
      setSearchResults([]);
      storageService.saveSelectedBuildings([]);
    }
  };

  const value: AppContextType = {
    buildings,
    selectedBuildingIds,
    buildingDetails,
    menus,
    cachedMenus,
    isLoading,
    error,
    searchResults,
    searchQuery,
    ignoredBrands,
    minPrice,
    selectedCity,
    isShowingCachedData,
    cacheDate,
    setSelectedBuildingIds,
    toggleBuildingSelection,
    searchMenuItems,
    fetchBuildings,
    updateIgnoredBrands,
    updateMinPrice,
    updateSelectedCity
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for using the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
