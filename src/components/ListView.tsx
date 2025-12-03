import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Building } from '../types';

const ListView: React.FC = () => {
  const { 
    buildings, 
    selectedBuildingIds, 
    toggleBuildingSelection 
  } = useAppContext();

  if (buildings.length === 0) {
    return null;
  }

  return (
    <div className="building-options">
      {buildings.map((building: Building) => {
        const isAmazon = building.name.toLowerCase().includes('amazon');
        
        return (
          <label 
            key={building.id} 
            className={`building-checkbox ${!isAmazon ? 'non-amazon' : ''}`}
          >
            <input 
              type="checkbox"
              checked={selectedBuildingIds.includes(building.id)}
              onChange={() => toggleBuildingSelection(building.id)}
            />
            {building.name}
          </label>
        );
      })}
    </div>
  );
};

export default ListView;
