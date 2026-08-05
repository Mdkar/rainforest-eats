import React, { createContext, useState, useEffect, useContext, ReactNode, useRef } from 'react';
import { 
  Building, 
  BuildingDetail, 
  Menu,
  MenuItem,
} from '../types';
import apiService from '../services/api';
import storageService from '../services/storage';

interface SearchResult {
  item: MenuItem;
  buildingId: string;
  buildingName: string;
  locationName: string;
  brandId: string;
  menuName: string;
}

interface AppContextType {
  debugMode: boolean;
  setDebugMode: (debug: boolean) => void;
  // Data
  buildings: Building[];
  selectedBuildingIds: string[];
  buildingDetails: Record<string, BuildingDetail>;
  menus: Record<string, Menu>;
  isLoading: boolean;
  error: string | null;
  searchResults: SearchResult[];
  searchQuery: string;
  ignoredBrands: string[];
  minPrice: number;
  selectedCity: string;

  // Whether to show the "restaurants may be closed" banner
  isOutsideServiceHours: boolean;
  
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
  // Debug mode state
  const [debugMode, setDebugModeState] = useState<boolean>(() => {
    const prefs = storageService.getUserPreferences();
    return prefs.debugMode ?? false;
  });

  const setDebugMode = (debug: boolean) => {
    setDebugModeState(debug);
    storageService.saveDebugMode(debug);
  };

  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuildingIds, setSelectedBuildingIds] = useState<string[]>([]);
  const [buildingDetails, setBuildingDetails] = useState<Record<string, BuildingDetail>>({});
  const [menus, setMenus] = useState<Record<string, Menu>>({});

  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);

  // Whether the current time is outside service hours (11am–2pm)
  const [isOutsideServiceHours, setIsOutsideServiceHours] = useState(false);

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
      apiService.debugLog("Building group received:", buildingGroup);

      // Filter for selected city buildings
      const cityBuildings = buildingGroup.groups.filter(
        building => building.address.city === selectedCity
      );
      apiService.debugLog(`${selectedCity} buildings filtered:`, cityBuildings);

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
  const fetchSelectedBuildingDetails = async (buildingIds: string[]) => {
    if (buildingIds.length === 0) return;

    apiService.debugLog("Fetching details for selected buildings:", buildingIds);

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
            if (!ignoredBrands.includes(brand.name)) {
              apiService.debugLog(`Processing brand "${brand.name}" for building "${detail.name}"`);

              if (!brand.menus || brand.menus.length === 0) {
                apiService.debugLog(`No menus found for location ${location.name}`);
              } else {
                brand.menus.forEach(menu => {
                  if (menu.id) {
                    apiService.debugLog(`Found menu ID: ${menu.id} - ${menu.label?.en}`);
                    menusToFetch.push(menu.id);
                  }
                });
              }
            }
          });
        });
      });

      apiService.debugLog("Menu IDs to fetch:", menusToFetch);

      // Update building details
      setBuildingDetails(prev => {
        apiService.debugLog("Setting building details:", newBuildingDetails);
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

    try {
      await Promise.all(
        menuIds.map(async (menuId) => {
          try {
            const menu = await apiService.getMenu(menuId);
            newMenus[menuId] = menu;
          } catch (err) {
            console.error(`Failed to fetch menu ${menuId}:`, err);
          }
        })
      );
      setMenus(prevMenus => ({ ...prevMenus, ...newMenus }));
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

  // Load user preferences on initial mount and clean up stale cache keys
  useEffect(() => {
    apiService.debugLog("Initial load of user preferences");

    const userPrefs = storageService.getUserPreferences();
    setSelectedBuildingIds(userPrefs.selectedBuildings);
    setIgnoredBrands(userPrefs.ignoredBrands || []);
    setMinPrice(userPrefs.minPrice || 0);
    setSelectedCity(userPrefs.selectedCity || 'Seattle');

    // Check service hours once on mount
    setIsOutsideServiceHours(apiService.isOutsideServiceHours());
  }, []);

  useEffect(() => {
    fetchBuildings();
  }, [selectedCity]);

  useEffect(() => {
    apiService.debugLog("Selected building IDs changed:", selectedBuildingIds);
    const newlySelectedIds = selectedBuildingIds.filter(
      id => !Object.keys(buildingDetails).includes(id)
    );
    fetchSelectedBuildingDetails(newlySelectedIds);
  }, [selectedBuildingIds]);

  useEffect(() => {
    apiService.debugLog("Ignored brands changed:", ignoredBrands);
    fetchSelectedBuildingDetails(selectedBuildingIds);
  }, [ignoredBrands]);

  // Effect to check data loading state
  useEffect(() => {
    apiService.debugLog("Building details or menus changed:", buildingDetails, menus);
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

    apiService.debugLog('Searching for:', normalizedQuery);
    apiService.debugLog('Selected building IDs:', selectedBuildingIds);
    apiService.debugLog('Building details:', buildingDetails);
    apiService.debugLog('Available menus:', menus);

    // Only search in selected buildings
    selectedBuildingIds.forEach(buildingId => {
      const buildingDetail = buildingDetails[buildingId];
      if (!buildingDetail) {
        apiService.debugLog(`No details found for building ${buildingId}`);
        return;
      }

      const buildingName = buildingDetail.name;

      buildingDetail.locations.forEach(location => location.brands.forEach(brand => {
        if (ignoredBrands.includes(brand.name)) return;

        const locationName = brand.name;

        brand.menus?.forEach(menuRef => {
          const menu = menus[menuRef.id];
          if (!menu) {
            apiService.debugLog(`No menu found for ID ${menuRef.id}`);
            return;
          }

          const menuName = menu.label?.en;

          menu.groups?.forEach(group => {
            group.items?.forEach(item => {
              const itemName = item.label?.en.toLowerCase();
              const itemDescription = item.description?.en?.toLowerCase() || '';

              if (
                (itemName.includes(normalizedQuery) ||
                itemDescription.includes(normalizedQuery)) &&
                (minPrice === 0 || item.price.amount >= minPrice)
              ) {
                apiService.debugLog(`Found match: ${item.label?.en} - $${item.price?.amount}`);
                results.push({
                  item,
                  buildingId,
                  buildingName,
                  locationName,
                  brandId: brand.id,
                  menuName
                });
              }
            });
          });
        });
      }));
    });

    apiService.debugLog(`Found ${results.length} results for "${query}"`);
    setSearchResults(results);
  };

  // Update ignored brands
  const updateIgnoredBrands = (brands: string[]) => {
    setIgnoredBrands(brands);
    storageService.saveIgnoredBrands(brands);
  };

  // Update minimum price filter
  const updateMinPrice = (newMinPrice: number) => {
    setMinPrice(newMinPrice);
    storageService.saveMinPrice(newMinPrice);
  };

  // Update selected city
  const updateSelectedCity = (city: string) => {
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
    isLoading,
    error,
    searchResults,
    searchQuery,
    ignoredBrands,
    minPrice,
    selectedCity,
    isOutsideServiceHours,
    setSelectedBuildingIds,
    toggleBuildingSelection,
    searchMenuItems,
    fetchBuildings,
    updateIgnoredBrands,
    updateMinPrice,
    updateSelectedCity,
    debugMode,
    setDebugMode
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
