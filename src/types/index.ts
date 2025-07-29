// API Response Types
export interface GuestTokenResponse {
  token: string;
  access: {
    token: string;
    expires: string;
  };
}

export interface Address {
  state: string;
  zip: string;
  country: string;
  address: string;
  city: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Building {
  id: string;
  name: string;
  label: {
    en: string;
  };
  date: {
    created: string;
    modified: string;
  };
  meta: {
    sector_name: string;
  };
  address: Address;
}

export interface BuildingGroup {
  id: string;
  groups: Building[];
}

export interface MenuItem {
  id: string;
  label: {
    en: string;
  };
  name: string;
  description: {
    en: string;
  };
  price: {
    amount: number;
  };
  meta: {
    menu_sort_number: number;
    plu: string;
    unique_id: number;
    [key: string]: any;
  };
}

export interface MenuGroup {
  id: string;
  name: string;
  label: {
    en: string;
  };
  items: MenuItem[];
}

export interface Menu {
  id: string;
  groups: MenuGroup[];
  label: {
    en: string;
  };
  date: {
    created: string;
    modified: string;
    published: string;
  };
}

export interface DiningLocation {
  brands: DiningBrand[];
  id: string;
  name: string;
  label: {
    en: string;
  };
  meta: any;
  address: Address;
}

export interface DiningBrand {
  id: string;
  name: string;
  label: {
    en: string;
  };
  menus: {
    id: string;
    label: {
      en: string;
    };
    state: string;
  }[];
  location: string;
}

export interface BuildingDetail {
  id: string;
  name: string;
  locations: DiningLocation[];
}

// User Preferences
export interface UserPreferences {
  selectedBuildings: string[];
  lastSearch?: string;
}

// Cache Types
export interface CachedMenu {
  menu: Menu;
  timestamp: number;
}

export interface CachedMenus {
  [menuId: string]: CachedMenu;
}
