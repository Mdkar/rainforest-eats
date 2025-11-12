import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Building } from '../types';

const BuildingSelection: React.FC = () => {
  const { 
    buildings, 
    selectedBuildingIds, 
    toggleBuildingSelection 
  } = useAppContext();
  
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  if (buildings.length === 0) {
    return null;
  }

  return (
    <div className="building-selection">
      <h2 onClick={() => setIsCollapsed(!isCollapsed)}>
        <span className="building-toggle-icon">{isCollapsed ? '⊕' : '⊖'}</span>
        Select Buildings
      </h2>
      {!isCollapsed && (
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
      )}
    </div>
  );
};

export default BuildingSelection;
