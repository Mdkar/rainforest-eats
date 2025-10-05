# Rainforest Eats - AI Coding Assistant Instructions

## Project Overview
Rainforest Eats is a React TypeScript web app that aggregates Amazon Seattle office food menus using the Compass Digital API. It provides a unified search interface across multiple buildings' dining locations with intelligent caching for offline access.

## Architecture Patterns

### State Management via Context
- **Central state**: `AppContext.tsx` manages all application state using React Context
- **Single provider pattern**: `<AppProvider>` wraps the entire app, consumed via `useAppContext()`
- **Key state domains**: buildings selection, menu data, search results, cache status, user preferences
- **State persistence**: All user preferences automatically saved to localStorage via `storageService`

### API Service Layer
- **Centralized API logic**: `services/api.ts` handles all external API calls
- **Mock/live data toggle**: Set `USE_MOCK_DATA = true` for development with `mockData.ts`
- **Time-aware API**: API only active 11am-2pm PT; automatically falls back to cached data outside hours
- **Fallback pattern**: `getMenuWithFallback()` tries live API first, then cached data, with clear cache indicators

### Intelligent Caching System
- **Chunked storage**: Large menu data split into 1MB chunks to avoid localStorage limits
- **Cache metadata**: `storage.ts` manages chunk count, timestamps, and size tracking
- **Cache indicators**: `CacheIndicator` component shows when displaying cached data with timestamps
- **Auto-fallback**: Seamless transition to cached data when API unavailable

### Search Architecture
- **Multi-level search**: Searches across Buildings → Locations → Brands → Menus → Groups → Items
- **Context-aware filtering**: Only searches selected buildings, respects ignored brands and price filters  
- **Debounced input**: 300ms debounce in `SearchBar.tsx` prevents excessive API calls
- **Result structure**: `SearchResult[]` includes item + full location context (building/location/menu names)

## Development Workflows

### Running the App
```bash
npm start          # Development server on localhost:3000
npm run build      # Production build
npm test           # Jest test runner
```

### Data Source Toggle
- Change `USE_MOCK_DATA` in `services/api.ts` to switch between live API and mock data
- Mock data in `services/mockData.ts` provides realistic test scenarios
- Live API requires no authentication (uses guest tokens)

### Key Environment Constants
- **API Base**: `https://api.compassdigital.org`
- **Realm**: `Kq8m4B8GNRCgjlRL9A3rsYj0YBNGP3SLOKgg`
- **Multigroup ID**: `Ym7By6oy1dTOBE5P880jTamr9022GqCD7BB2y1vOIlgk1B16Y7hzOGjMXNMoh1oQRojae9T8JqBXJ8llt9d`
- **Active Hours**: 11am-2pm PT (when menus are available)

## Project-Specific Conventions

### Component Structure
- **Functional components only**: All components use React hooks, no class components
- **Context consumption**: Components get state via `useAppContext()`, never prop drilling
- **Service imports**: Import services as `import serviceClass from '../services/service'`
- **Type safety**: All props/state strictly typed with interfaces in `types/index.ts`

### State Update Patterns
- **Immutable updates**: Use spread operators for state updates: `setState(prev => ({ ...prev, newData }))`
- **Async data flow**: `fetchBuildings() → fetchBuildingDetails() → fetchMenus()` chain in AppContext
- **Selection persistence**: Building selections immediately saved to localStorage on toggle

### Brand Filtering System
- **Default ignored brands**: `['Barcoded Items', 'SCAN & PAY', 'Barcoder', 'Scan & Pay']`
- **Context filtering**: Ignored brands excluded from search results and menu display
- **Settings integration**: User can modify ignored brands via Settings component

### File Organization
- **Components**: Pure UI components in `components/` directory
- **Services**: External integrations (`api.ts`, `storage.ts`, `mockData.ts`) in `services/`
- **Types**: All TypeScript interfaces centralized in `types/index.ts`
- **Context**: State management in `context/AppContext.tsx`

## Critical Integration Points

### LocalStorage Schema
- **Preferences key**: `rainforest-eats-preferences` (selected buildings, ignored brands, last search, min price)
- **Cache metadata**: `rainforest-eats-cached-menus-meta` (chunk info)
- **Cache chunks**: `rainforest-eats-cached-menus-chunk-{N}` (actual menu data)

### API Data Flow
1. Get guest token → 2. Fetch building group → 3. Filter Seattle buildings → 4. Fetch building details → 5. Extract menu IDs → 6. Fetch individual menus → 7. Cache successful responses

### Search Implementation Details
- **Query normalization**: `toLowerCase().trim()` for consistent matching
- **Multi-field search**: Searches both item name and description fields
- **Price filtering**: `minPrice` filter applied during search (not post-processing)
- **Result context**: Each result includes building/location/menu path for user orientation