import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Header from '../components/Header';
import CacheIndicator from '../components/CacheIndicator';
import BuildingSelection from '../components/BuildingSelection';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import MenuDisplay from '../components/MenuDisplay';
import Footer from '../components/Footer';
import Settings from '../components/Settings';
import ChangelogNotification from '../components/ChangelogNotification';
import NotificationDemo from '../components/NotificationDemo';

const HomePage: React.FC = () => {
  const { 
    isLoading, 
    error, 
    isShowingCachedData, 
    cacheDate,
    fetchBuildings
  } = useAppContext();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  return (
    <div className="app">
      <Header onSettingsClick={handleSettingsClick} />
      
      {isShowingCachedData && cacheDate && (
        <CacheIndicator cacheDate={cacheDate} />
      )}
      
      <ChangelogNotification />
      {/* <NotificationDemo /> */}
      
      <main className="container">
        {error && (
          <div className="error">
            {error}
            <button 
              onClick={fetchBuildings}
              style={{ marginLeft: '1rem' }}
            >
              Try Again
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="loading">Loading menu data...</div>
        ) : (
          <>
            <BuildingSelection />
            <SearchBar />
            <SearchResults />
            <MenuDisplay />
          </>
        )}
      </main>
      
      <Footer />
      
      <Settings 
        isOpen={isSettingsOpen} 
        onClose={handleSettingsClose}
      />
    </div>
  );
};

export default HomePage;
