import React from 'react';
import { MenuItem as MenuItemType } from '../types';

interface MenuItemProps {
  item: MenuItemType;
  buildingId?: string;
  brandId?: string;
  locationName?: string;
  buildingName?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ 
  item, 
  buildingId,
  brandId,
  locationName, 
  buildingName 
}) => {
  // Format price to always show 2 decimal places
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };

  // Handle click to navigate to thrive app
  const handleClick = () => {
    if (buildingId && brandId) {
      const url = `https://thriveapp.io/site/${buildingId}/brand/${brandId}`;
      window.open(url, '_blank');
    }
  };
  
  return (
    <div 
      className={`menu-item ${buildingId && brandId ? 'clickable' : ''}`}
      onClick={handleClick}
      style={{ cursor: buildingId && brandId ? 'pointer' : 'default' }}
    >
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
