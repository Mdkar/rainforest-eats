import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import MenuItem from './MenuItem';
import { MenuGroup } from '../types';

const MenuDisplay: React.FC = () => {
  const { 
    buildingDetails,
    menus,
    selectedBuildingIds,
    searchQuery,
    isLoading,
    ignoredBrands,
    minPrice
  } = useAppContext();
  
  const [noMenusFound, setNoMenusFound] = useState(false);
  
  // Check if we have menus loaded after a certain time
  useEffect(() => {
    let menuCheckTimeout: NodeJS.Timeout;
    
    if (Object.keys(menus).length === 0 && !isLoading) {
      // After 3 seconds, if still no menus, show "no menus found" message
      menuCheckTimeout = setTimeout(() => {
        setNoMenusFound(true);
      }, 3000);
    } else {
      setNoMenusFound(false);
    }
    
    return () => {
      if (menuCheckTimeout) clearTimeout(menuCheckTimeout);
    };
  }, [menus, isLoading]);
  
  // Don't display menus if there's an active search query
  if (searchQuery) {
    return null;
  }
  
  // No buildings selected
  if (selectedBuildingIds.length === 0) {
    return (
      <div className="menu-display">
        <div className="no-results">
          Please select at least one building to view menus.
        </div>
      </div>
    );
  }
  
  // Check if we're still loading or if building details are missing
  if (isLoading) {
    return (
      <div className="menu-display">
        <div className="no-results">
          Loading menu data...
        </div>
      </div>
    );
  }
  
  // If no menus were found after waiting
  if (noMenusFound && Object.keys(menus).length === 0) {
    return (
      <div className="menu-display">
        <div className="no-results">
          No menu data available. This could be because the dining locations are closed or data is unavailable.
        </div>
      </div>
    );
  }
  
  // Check if we have building details to display
  const hasBuildings = selectedBuildingIds.some(id => buildingDetails[id]);
  
  if (!hasBuildings) {
    return (
      <div className="menu-display">
        <div className="no-results">
          No building details found. Please try refreshing the page.
        </div>
      </div>
    );
  }
  
  return (
    <div className="menu-display">
      <h2>Available Menu Items</h2>
      <div className="buildings-list">
        {selectedBuildingIds.map(buildingId => {
          const building = buildingDetails[buildingId];
          if (!building) return null;
          
          return (
            <div key={buildingId} className="building-section">
              <div className="building-header">
                <h3>{building.name}</h3>
              </div>
              <div className="locations-list">
                {building.locations.map(location => location.brands.map(brand => {
                  // Skip ignored brands
                  if (ignoredBrands.includes(brand.name)) return null;
                  
                  // Check if this brand has any menu groups with items that pass the price filter
                  const hasMenuGroups = brand.menus?.some(menuRef => {
                    const menu = menus[menuRef.id];
                    return menu && menu.groups?.some((group: MenuGroup) => 
                      group.items && group.items.some(item => minPrice === 0 || item.price.amount >= minPrice)
                    );
                  });
                  
                  // Hide location-section if no menu groups with items
                  if (!hasMenuGroups) return null;
                  
                  return (
                    <div key={brand.id} className="location-section">
                      <div className="location-header">
                        <div className="location-name">{location.name}</div>
                      </div>
                      
                      {brand.menus?.map(menuRef => {
                        const menu = menus[menuRef.id];
                        if (!menu) return null;
                        
                        return (
                          <div key={menuRef.id} className="menu-groups">
                            {menu.groups?.map((group: MenuGroup) => {
                              // Hide menu-group if menu group name is in ignored brands
                              if (ignoredBrands.includes(group.label.en)) return null;
                              // Hide menu-group if no items or no items pass the price filter
                              if (!group.items || group.items.length === 0) return null;
                              
                              const filteredItems = group.items.filter(item => minPrice === 0 || item.price.amount >= minPrice);
                              if (filteredItems.length === 0) return null;
                              
                              return (
                                <div key={group.id} className="menu-group">
                                  <div className="menu-group-name">{group.label.en}</div>
                                  <div className="menu-items">
                                    {filteredItems.map(item => (
                                      <MenuItem 
                                        key={item.id} 
                                        item={item} 
                                        buildingId={buildingId}
                                        brandId={brand.id}
                                        locationName={brand.name}
                                      />
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                }))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MenuDisplay;
