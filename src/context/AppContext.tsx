import React, { createContext, useState, useEffect, useContext, ReactNode, useRef, useCallback } from 'react';
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
    // Keep the in-memory flag on the API service in sync
    apiService.setDebugMode(debug);
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

  // Fetch menus by ID — deduplicates IDs before fetching, skips already-cached menus
  const fetchMenus = useCallback(async (menuIds: string[], cachedMenus: Record<string, Menu>) => {
    // Deduplicate and skip already-cached menus
    const uniqueIds = Array.from(new Set(menuIds)).filter(id => !cachedMenus[id]);
    if (uniqueIds.length === 0) return;

    const newMenus: Record<string, Menu> = {};

    try {
      await Promise.all(
        uniqueIds.map(async (menuId) => {
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
  }, []);

  // Fetch details for selected buildings.
  // currentIgnoredBrands is passed explicitly so this function always sees
  // the latest value without needing to be recreated on every ignoredBrands change.
  const fetchSelectedBuildingDetails = useCallback(async (
    buildingIds: string[],
    currentIgnoredBrands: string[],
    currentBuildingDetails: Record<string, BuildingDetail>,
    currentMenus: Record<string, Menu>,
  ) => {
    // Only fetch buildings we don't already have details for
    const idsToFetch = buildingIds.filter(id => !currentBuildingDetails[id]);
    if (idsToFetch.length === 0) {
      // Building details are already cached — still need to resolve menus for
      // the current ignoredBrands set in case it changed
      const menusToFetch: string[] = [];
      buildingIds.forEach(buildingId => {
        const detail = currentBuildingDetails[buildingId];
        if (!detail) return;
        detail.locations?.forEach(location => {
          location.brands.forEach(brand => {
            if (!currentIgnoredBrands.includes(brand.name)) {
              brand.menus?.forEach(menu => {
                if (menu.id) menusToFetch.push(menu.id);
              });
            }
          });
        });
      });
      await fetchMenus(menusToFetch, currentMenus);
      return;
    }

    apiService.debugLog("Fetching details for selected buildings:", idsToFetch);

    try {
      const detailsPromises = idsToFetch.map(async (buildingId) => {
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

      detailsArray.forEach(detail => {
        if (!detail) return;

        newBuildingDetails[detail.id] = detail;

        detail.locations?.forEach(location => {
          location.brands.forEach(brand => {
            if (!currentIgnoredBrands.includes(brand.name)) {
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

      setBuildingDetails(prev => {
        apiService.debugLog("Setting building details:", newBuildingDetails);
        return { ...prev, ...newBuildingDetails };
      });

      await fetchMenus(menusToFetch, { ...currentMenus });

    } catch (err) {
      setError('Failed to load building details');
      console.error('Error fetching building details:', err);
    }
  }, [fetchMenus]);

  // Fetch buildings data
  const fetchBuildings = useCallback(async (
    city: string,
    buildingIds: string[],
    currentIgnoredBrands: string[],
    currentBuildingDetails: Record<string, BuildingDetail>,
    currentMenus: Record<string, Menu>,
  ) => {
    if (!city) return;

    setIsLoading(true);
    setError(null);

    try {
      const buildingGroup = await apiService.getBuildings();
      apiService.debugLog("Building group received:", buildingGroup);

      const cityBuildings = buildingGroup.groups.filter(
        building => building.address.city === city
      );
      apiService.debugLog(`${city} buildings filtered:`, cityBuildings);

      // Validate stored IDs against known buildings to avoid sending display
      // names or stale IDs to the API
      const validIds = new Set(cityBuildings.map(b => b.id));
      const validBuildingIds = buildingIds.filter(id => {
        const isValid = validIds.has(id);
        if (!isValid) console.warn(`Dropping invalid building ID from selection: "${id}"`);
        return isValid;
      });

      setBuildings(cityBuildings);

      // If stored IDs contained invalid entries, persist the cleaned list
      if (validBuildingIds.length !== buildingIds.length) {
        setSelectedBuildingIds(validBuildingIds);
        storageService.saveSelectedBuildings(validBuildingIds);
      }

      await fetchSelectedBuildingDetails(
        validBuildingIds,
        currentIgnoredBrands,
        currentBuildingDetails,
        currentMenus,
      );

    } catch (err) {
      setError('Failed to load buildings');
      console.error('Error fetching buildings:', err);
    }

    setIsLoading(false);
  }, [fetchSelectedBuildingDetails]);

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

  // Single init effect — loads all preferences at once, then triggers one fetch.
  // Using a ref to ensure this only runs once even in React strict mode double-invoke.
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    apiService.debugLog("Initial load of user preferences");

    const userPrefs = storageService.getUserPreferences();
    const initCity = userPrefs.selectedCity || 'Seattle';
    const initBuildings = userPrefs.selectedBuildings || [];
    const initIgnoredBrands = userPrefs.ignoredBrands || [];
    const initMinPrice = userPrefs.minPrice || 0;

    // Set all state synchronously before triggering any fetches
    setSelectedBuildingIds(initBuildings);
    setIgnoredBrands(initIgnoredBrands);
    setMinPrice(initMinPrice);
    setSelectedCity(initCity);
    setIsOutsideServiceHours(apiService.isOutsideServiceHours());

    // Single fetch using the values we just read — avoids waiting for React
    // to flush state and re-render before fetching
    fetchBuildings(initCity, initBuildings, initIgnoredBrands, {}, {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When the user changes which buildings are selected (after init), fetch any
  // newly selected buildings. Already-cached buildings are skipped inside
  // fetchSelectedBuildingDetails.
  const isFirstSelectedBuildingsRender = useRef(true);
  useEffect(() => {
    if (isFirstSelectedBuildingsRender.current) {
      isFirstSelectedBuildingsRender.current = false;
      return;
    }
    apiService.debugLog("Selected building IDs changed:", selectedBuildingIds);
    fetchSelectedBuildingDetails(selectedBuildingIds, ignoredBrands, buildingDetails, menus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBuildingIds]);

  // When ignoredBrands changes, we only need to re-resolve which menus to show
  // from already-cached building details — no network calls for buildings needed.
  // fetchSelectedBuildingDetails handles this: if all details are cached it goes
  // straight to the menu resolution path.
  const isFirstIgnoredBrandsRender = useRef(true);
  useEffect(() => {
    if (isFirstIgnoredBrandsRender.current) {
      isFirstIgnoredBrandsRender.current = false;
      return;
    }
    apiService.debugLog("Ignored brands changed:", ignoredBrands);
    fetchSelectedBuildingDetails(selectedBuildingIds, ignoredBrands, buildingDetails, menus);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // Fetch for new city with clean state — no carried-over buildings/menus
      fetchBuildings(city, [], ignoredBrands, {}, {});
    }
  };

  // Public wrapper so external callers (e.g. pull-to-refresh) don't need to pass state
  const fetchBuildingsPublic = useCallback(() => {
    return fetchBuildings(selectedCity, selectedBuildingIds, ignoredBrands, buildingDetails, menus);
  }, [fetchBuildings, selectedCity, selectedBuildingIds, ignoredBrands, buildingDetails, menus]);

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
    fetchBuildings: fetchBuildingsPublic,
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
