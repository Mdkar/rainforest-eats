import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAppContext } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
import { calculateDistance, calculateMapCenter } from '../utils/mapUtils';
import apiService from '../services/api';

// Fix Leaflet default marker icon issue with webpack
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to create a custom pane for user location marker
const UserLocationPane: React.FC = () => {
  const map = useMap();
  
  useEffect(() => {
    if (!map.getPane('userLocationPane')) {
      const pane = map.createPane('userLocationPane');
      pane.style.zIndex = '650'; // Higher than marker pane (600) but lower than popup pane (700)
    }
  }, [map]);
  
  return null;
};

// Component to update map center when state changes
const MapCenterUpdater: React.FC<{ center: [number, number]; zoom: number; recenterVersion: number }> = ({ center, zoom, recenterVersion }) => {
  const map = useMap();
  const lastRecenterVersion = useRef(-1);
  
  useEffect(() => {
    if (recenterVersion > lastRecenterVersion.current) {
      map.setView(center, zoom);
      lastRecenterVersion.current = recenterVersion;
    }
  }, [map, center, zoom, recenterVersion]);
  
  return null;
};

// Custom marker icons for selected/unselected/non-Amazon buildings using SVG
const createCustomIcon = (isSelected: boolean, isAmazon: boolean) => {
  let color: string;
  if (!isAmazon) {
    color = '#9ca3af'; // gray
  } else if (isSelected) {
    color = '#22c55e'; // green
  } else {
    color = '#ef4444'; // red
  }
  
  const svg = `
    <svg width="25" height="30" viewBox="0 0 25 30" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M12.5 0 C5.596 0 0 5.596 0 12.5 C0 15.5 1.5 18.5 4 21.5 L12.5 30 L21 21.5 C23.5 18.5 25 15.5 25 12.5 C25 5.596 19.404 0 12.5 0 Z" 
            fill="${color}" 
            stroke="white" 
            stroke-width="1.5"
            filter="url(#shadow)"/>
      <circle cx="12.5" cy="11" r="4.5" fill="white" opacity="0.9"/>
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-marker-svg',
    html: svg,
    iconSize: [25, 30],
    iconAnchor: [12.5, 30],
    popupAnchor: [0, -30]
  });
};

interface MapViewState {
  userLocation: { lat: number; lng: number } | null;
  mapCenter: { lat: number; lng: number };
  mapZoom: number;
  showUserMarker: boolean;
  recenterVersion: number;
}

const MapView: React.FC = () => {
  const { buildings, selectedBuildingIds, toggleBuildingSelection } = useAppContext();
  const { addNotification } = useNotifications();
  
  // Use ref to track if we've already shown the location notification
  const hasShownLocationNotification = useRef(false);
  
  // Track which marker tooltip is currently open (for mobile - shows for 2 seconds after tap)
  const [openTooltipId, setOpenTooltipId] = useState<string | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchDevice = useRef(false);
  
  // Detect if device is touch-enabled
  useEffect(() => {
    isTouchDevice.current = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }, []);
  
  // Memoize validBuildings to prevent unnecessary recalculations
  const validBuildings = useMemo(() => 
    buildings.filter(building => 
      building.address?.coordinates?.latitude != null && 
      building.address?.coordinates?.longitude != null
    ),
    [buildings]
  );
  
  const [state, setState] = useState<MapViewState>({
    userLocation: null,
    mapCenter: calculateMapCenter(validBuildings),
    mapZoom: 16,
    showUserMarker: false,
    recenterVersion: 0
  });

  const MAX_DISTANCE_KM = 50; // For showing user marker
  const RECENTER_DISTANCE_MILES = 20;
  const RECENTER_DISTANCE_KM = RECENTER_DISTANCE_MILES * 1.60934; // Convert miles to km

  // Geolocation logic - runs only once on component mount
  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      setState(prev => ({
        ...prev,
        mapCenter: calculateMapCenter(validBuildings),
        showUserMarker: false
      }));
      return;
    }

    // Request user location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Find the nearest building and its distance
        let nearestDistance = Infinity;
        validBuildings.forEach(building => {
          const distance = calculateDistance(
            { latitude: userLoc.lat, longitude: userLoc.lng },
            building.address.coordinates
          );
          if (distance < nearestDistance) {
            nearestDistance = distance;
          }
        });

        const isNearby = nearestDistance <= MAX_DISTANCE_KM;
        const shouldRecenter = nearestDistance <= RECENTER_DISTANCE_KM;

        // If user is too far away, show notification and don't recenter
        if (!shouldRecenter && nearestDistance !== Infinity) {
          // Only show notification once
          if (!hasShownLocationNotification.current) {
            hasShownLocationNotification.current = true;
            addNotification({
              title: '📍 Location Notice',
              content: (
                <div>
                  <p>You appear to be more than {RECENTER_DISTANCE_MILES} miles from the nearest location.</p>
                  <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    You can change your city in the Settings menu to view buildings in other areas.
                  </p>
                </div>
              ),
              duration: 8000,
            });
          }

          // Don't recenter map, keep it on the buildings
          setState(prev => ({
            ...prev,
            userLocation: userLoc,
            mapCenter: calculateMapCenter(validBuildings),
            showUserMarker: isNearby,
            recenterVersion: prev.recenterVersion + 1
          }));
        } else {
          // User is close enough, center on their location
          setState(prev => ({
            ...prev,
            userLocation: userLoc,
            mapCenter: userLoc,
            showUserMarker: isNearby,
            recenterVersion: prev.recenterVersion + 1
          }));
        }
      },
      (error) => {
        // Handle geolocation errors
        console.warn('Geolocation error:', error.message);
        setState(prev => ({
          ...prev,
          mapCenter: calculateMapCenter(validBuildings),
          showUserMarker: false
        }));
      },
      {
        timeout: 5000,
        enableHighAccuracy: false
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  return (
    <div className="map-view">
      <MapContainer
        center={[state.mapCenter.lat, state.mapCenter.lng]}
        zoom={state.mapZoom}
        minZoom={10}
        maxZoom={18}
        style={{ height: '400px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <UserLocationPane />
        <MapCenterUpdater 
          center={[state.mapCenter.lat, state.mapCenter.lng]} 
          zoom={state.mapZoom} 
          recenterVersion={state.recenterVersion}
        />

        {/* Building markers */}
        {buildings
          .filter((building) => {
            const coords = building.address.coordinates;
            return coords && 
                   typeof coords.latitude === 'number' && 
                   typeof coords.longitude === 'number' &&
                   !isNaN(coords.latitude) &&
                   !isNaN(coords.longitude);
          })
          .map((building) => {
            const isSelected = selectedBuildingIds.includes(building.id);
            const isAmazon = building.name.toLowerCase().includes('amazon');
            const coords = building.address.coordinates;
            
            return (
              <Marker
                key={building.id}
                position={[coords.latitude, coords.longitude]}
                icon={createCustomIcon(isSelected, isAmazon)}
                eventHandlers={{
                  click: () => {
                    toggleBuildingSelection(building.id);
                    
                    // Show tooltip for 2 seconds after selection
                    setOpenTooltipId(building.id);
                    
                    // Clear any existing timeout
                    if (tooltipTimeoutRef.current) {
                      clearTimeout(tooltipTimeoutRef.current);
                    }
                    
                    // Auto-hide tooltip after 2 seconds
                    tooltipTimeoutRef.current = setTimeout(() => {
                      apiService.debugLog('Hiding tooltip for', building.id);
                      setOpenTooltipId(null);
                      tooltipTimeoutRef.current = null;
                    }, 2000);
                  },
                  mouseover: () => {
                    // On desktop, show tooltip on hover (only if not touch device)
                    if (!isTouchDevice.current && !tooltipTimeoutRef.current) {
                      setOpenTooltipId(building.id);
                    }
                  },
                  mouseout: () => {
                    // On desktop, hide tooltip when mouse leaves (only if no active timeout)
                    if (!isTouchDevice.current && !tooltipTimeoutRef.current) {
                      setOpenTooltipId(null);
                    }
                  }
                }}
              >
                {openTooltipId === building.id && (
                  <Tooltip 
                    permanent={true} 
                    direction="top"
                    offset={[0, -30]}
                    className="custom-marker-tooltip"
                  >
                    {building.name}
                  </Tooltip>
                )}
              </Marker>
            );
          })}
        
        {/* User location marker - uses custom pane to appear on top */}
        {state.showUserMarker && state.userLocation && (
          <CircleMarker
            center={[state.userLocation.lat, state.userLocation.lng]}
            radius={8}
            pane="userLocationPane"
            pathOptions={{
              fillColor: '#3b82f6',
              fillOpacity: 0.8,
              color: 'white',
              weight: 2
            }}
          >
            <Tooltip>Your Location</Tooltip>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
};

export default MapView;
