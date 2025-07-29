import { 
  Building,
  BuildingDetail,
  BuildingGroup, 
  Menu,
  MenuItem,
  MenuGroup
} from '../types';

// Mock guest token response
export const mockGuestTokenResponse = {
  token: 'mock-token-12345',
  access: {
    token: 'mock-access-token-12345',
    expires: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
  }
};

// Define IDs that match what's automatically selected in the UI
const SEA44_ID = 'AMAZON - SEA44 FRONTIER';
const SEA113_ID = 'AMAZON - SEA113 DYNAMO';

// Seattle buildings with correct IDs to match our app's auto-selection
export const mockSeattleBuildings: Building[] = [
  {
    id: SEA44_ID,
    name: 'AMAZON - SEA44 FRONTIER',
    label: { en: 'AMAZON - SEA44 FRONTIER' },
    date: { created: '2024-08-26T20:12:07.081Z', modified: '2024-09-24T19:24:40.632Z' },
    meta: { sector_name: 'Eurest' },
    address: {
      state: 'WA',
      zip: '98121',
      country: 'US',
      address: '2205 7th Ave',
      city: 'Seattle',
      coordinates: {
        latitude: 47.6165414,
        longitude: -122.3408971
      }
    }
  },
  {
    id: SEA113_ID,
    name: 'AMAZON - SEA113 DYNAMO',
    label: { en: 'AMAZON - SEA113 DYNAMO' },
    date: { created: '2024-08-27T13:05:34.880Z', modified: '2024-09-12T00:12:44.507Z' },
    meta: { sector_name: 'Eurest' },
    address: {
      state: 'WA',
      zip: '98004',
      country: 'US',
      address: '85 106th Ave NE',
      city: 'Seattle',
      coordinates: {
        latitude: 47.6103683,
        longitude: -122.1991578
      }
    }
  }
];

// Mock building group response
export const mockBuildingGroup: BuildingGroup = {
  id: 'mock-building-group-id',
  groups: [
    ...mockSeattleBuildings,
    {
      id: 'aus13-id',
      name: 'AMAZON - AUS13 DOMAIN 8',
      label: { en: 'AMAZON - AUS13 DOMAIN 8' },
      date: { created: '2023-08-16T13:52:48.815Z', modified: '2025-06-04T13:59:59.780Z' },
      meta: { sector_name: 'Eurest' },
      address: {
        state: 'TX',
        zip: '78758',
        country: 'US',
        address: '11601 Alterra Pkwy',
        city: 'Austin',
        coordinates: {
          latitude: 30.40174799999999,
          longitude: -97.7187575
        }
      }
    }
  ]
};

// Mock menu items
const mockMenuItems: MenuItem[] = [
  {
    id: 'item1',
    label: { en: 'Classic Cheeseburger' },
    name: 'Classic Cheeseburger',
    description: { en: 'Beef patty with cheddar cheese, lettuce, tomato, and house sauce on a brioche bun.' },
    price: { amount: 9.99 },
    meta: {
      menu_sort_number: 0,
      plu: '123456',
      unique_id: 1
    }
  },
  {
    id: 'item2',
    label: { en: 'Veggie Burger' },
    name: 'Veggie Burger',
    description: { en: 'House-made veggie patty with lettuce, tomato, and vegan aioli on a whole grain bun.' },
    price: { amount: 8.99 },
    meta: {
      menu_sort_number: 1,
      plu: '123457',
      unique_id: 2
    }
  },
  {
    id: 'item3',
    label: { en: 'Caesar Salad' },
    name: 'Caesar Salad',
    description: { en: 'Crisp romaine, garlic croutons, parmesan, and house-made Caesar dressing.' },
    price: { amount: 7.99 },
    meta: {
      menu_sort_number: 0,
      plu: '123458',
      unique_id: 3
    }
  },
  {
    id: 'item4',
    label: { en: 'Quinoa Bowl' },
    name: 'Quinoa Bowl',
    description: { en: 'Organic quinoa with roasted vegetables, avocado, and cilantro lime dressing.' },
    price: { amount: 11.99 },
    meta: {
      menu_sort_number: 1,
      plu: '123459',
      unique_id: 4
    }
  },
  {
    id: 'item5',
    label: { en: 'Pepperoni Pizza' },
    name: 'Pepperoni Pizza',
    description: { en: 'Hand-tossed pizza with marinara, mozzarella, and pepperoni.' },
    price: { amount: 12.99 },
    meta: {
      menu_sort_number: 0,
      plu: '123460',
      unique_id: 5
    }
  },
  {
    id: 'item6',
    label: { en: 'Garlic Fries' },
    name: 'Garlic Fries',
    description: { en: 'Crispy fries tossed with garlic, parsley, and parmesan.' },
    price: { amount: 4.99 },
    meta: {
      menu_sort_number: 1,
      plu: '123461',
      unique_id: 6
    }
  }
];

// Mock menu groups
const mockMenuGroups: MenuGroup[] = [
  {
    id: 'group1',
    name: 'Burgers',
    label: { en: 'Burgers' },
    items: [mockMenuItems[0], mockMenuItems[1]]
  },
  {
    id: 'group2',
    name: 'Salads & Bowls',
    label: { en: 'Salads & Bowls' },
    items: [mockMenuItems[2], mockMenuItems[3]]
  },
  {
    id: 'group3',
    name: 'Pizza',
    label: { en: 'Pizza' },
    items: [mockMenuItems[4]]
  },
  {
    id: 'group4',
    name: 'Sides',
    label: { en: 'Sides' },
    items: [mockMenuItems[5]]
  }
];

// Define consistent menu IDs that will be used in both menus and building details
const CAFE_MENU_ID = 'cafe-menu-id';
const DELI_MENU_ID = 'deli-menu-id';

// Mock menus
export const mockMenus: Record<string, Menu> = {
  [CAFE_MENU_ID]: {
    id: CAFE_MENU_ID,
    label: { en: 'Café Menu' },
    groups: mockMenuGroups,
    date: {
      created: '2025-01-01T12:00:00Z',
      modified: '2025-06-11T14:00:00Z',
      published: '2025-06-11T14:05:00Z'
    }
  },
  [DELI_MENU_ID]: {
    id: DELI_MENU_ID,
    label: { en: 'Deli Menu' },
    groups: [mockMenuGroups[0], mockMenuGroups[3]],
    date: {
      created: '2025-01-01T12:00:00Z',
      modified: '2025-06-11T14:00:00Z',
      published: '2025-06-11T14:05:00Z'
    }
  }
};

// Mock building details
export const mockBuildingDetails: Record<string, BuildingDetail> = {
  [SEA44_ID]: {
    id: SEA44_ID,
    name: 'AMAZON - SEA44 FRONTIER',
    locations: [
      {
        id: 'cafe-location-id',
        name: 'L3 CAFE',
        label: { en: 'L3 CAFE' },
        meta: { unit: 53166, unit_id: 53166 },
        address: mockSeattleBuildings[0].address,
        brands: [
          {
            id: 'cafe-brand-id',
            name: 'L3 CAFE',
            label: { en: 'L3 CAFE' },
            location: 'cafe-location-id',
            menus: [
              {
                id: CAFE_MENU_ID,
                label: { en: 'Café Menu' },
                state: 'open'
              }
            ]
          }
        ],
      },
      {
        id: 'deli-location-id',
        name: 'L2 DELI',
        label: { en: 'L2 DELI' },
        meta: { unit: 53167, unit_id: 53167 },
        address: mockSeattleBuildings[0].address,
        brands: [
          {
            id: 'deli-brand-id',
            name: 'L2 DELI',
            label: { en: 'L2 DELI' },
            location: 'deli-location-id',
            menus: [
              {
                id: DELI_MENU_ID,
                label: { en: 'Deli Menu' },
                state: 'open'
              }
            ]
          }
        ],
      }
    ]
  },
  [SEA113_ID]: {
    id: SEA113_ID,
    name: 'AMAZON - SEA113 DYNAMO',
    locations: [
      {
        id: 'cafe-location-id-2',
        name: 'MAIN CAFE',
        label: { en: 'MAIN CAFE' },
        meta: { unit: 53168, unit_id: 53168 },
        address: mockSeattleBuildings[1].address,
        brands: [
          {
            id: 'cafe-brand-id-2',
            name: 'MAIN CAFE',
            label: { en: 'MAIN CAFE' },
            location: 'cafe-location-id-2',
            menus: [
              {
                id: CAFE_MENU_ID,
                label: { en: 'Café Menu' },
                state: 'open'
              }
            ]
          }
        ]
      }
    ]
  }
};

/**
 * Service to get mock data
 */
const mockDataService = {
  getGuestToken: () => mockGuestTokenResponse,
  getBuildingGroup: () => mockBuildingGroup,
  getBuildingDetail: (id: string) => mockBuildingDetails[id] || null,
  getMenu: (id: string) => mockMenus[id] || null,
  getSeattleBuildings: () => mockSeattleBuildings
};

export default mockDataService;
