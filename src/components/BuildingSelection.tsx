import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Building } from '../types';

const BuildingSelection: React.FC = () => {
  const { 
    buildings, 
    selectedBuildingIds, 
    toggleBuildingSelection 
  } = useAppContext();
  
  if (buildings.length === 0) {
    return null;
  }

  return (
    <div className="building-selection">
      <h2>Select Buildings</h2>
      <div className="building-options">
        {buildings.map((building: Building) => (
          <label 
            key={building.id} 
            className="building-checkbox"
          >
            <input 
              type="checkbox"
              checked={selectedBuildingIds.includes(building.id)}
              onChange={() => toggleBuildingSelection(building.id)}
            />
            {building.name}
          </label>
        ))}
      </div>
    </div>
  );
};

export default BuildingSelection;
