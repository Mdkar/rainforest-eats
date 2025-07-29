import React from 'react';
import { MenuItem as MenuItemType } from '../types';

interface MenuItemProps {
  item: MenuItemType;
  locationName?: string;
  buildingName?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  locationName, 
  buildingName 
}) => {
  // Format price to always show 2 decimal places
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };
  
  return (
    <div className="menu-item">
      <div className="menu-item-header">
        <div className="menu-item-name">{item.label.en}</div>
        <div className="menu-item-price">{formatPrice(item.price.amount)}</div>
      </div>
      
      {item.description?.en && (
        <div className="menu-item-description">
          {item.description.en}
        </div>
      )}
      
      {(locationName || buildingName) && (
        <div className="menu-item-location">
          <span className="location-icon">📍</span>
          {locationName && buildingName 
            ? `${locationName} (${buildingName})`
            : locationName || buildingName
          }
        </div>
      )}
    </div>
  );
};

export default MenuItem;
