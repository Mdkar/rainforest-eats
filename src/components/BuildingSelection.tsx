import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import MapView from './MapView';
import ListView from './ListView';

type ViewType = 'map' | 'list';

const BuildingSelection: React.FC = () => {
  const { buildings } = useAppContext();
  
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('map');
  
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
        <div className="building-selection-content">
          {/* Tab Controls */}
          <div className="tab-controls" role="tablist">
            <button
              role="tab"
              aria-selected={activeView === 'map'}
              aria-controls="map-view-panel"
              id="map-tab"
              className={`tab-button ${activeView === 'map' ? 'active' : ''}`}
              onClick={() => setActiveView('map')}
            >
              Map View
            </button>
            <button
              role="tab"
              aria-selected={activeView === 'list'}
              aria-controls="list-view-panel"
              id="list-tab"
              className={`tab-button ${activeView === 'list' ? 'active' : ''}`}
              onClick={() => setActiveView('list')}
            >
              List View
            </button>
          </div>

          {/* View Content */}
          <div className="tab-content">
            {activeView === 'map' ? <MapView /> : <ListView />}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildingSelection;
