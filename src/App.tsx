import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import CacheIndicator from './components/CacheIndicator';
import BuildingSelection from './components/BuildingSelection';
import SearchBar from './components/SearchBar';
import SearchResults from './components/SearchResults';
import MenuDisplay from './components/MenuDisplay';
import Footer from './components/Footer';
import './styles/App.css';

// Main application content
const AppContent: React.FC = () => {
  const { 
    isLoading, 
    error, 
    isShowingCachedData, 
    cacheDate,
    refreshData
  } = useAppContext();

  return (
    <div className="app">
      <Header />
      
      {isShowingCachedData && cacheDate && (
        <CacheIndicator cacheDate={cacheDate} />
      )}
      
      <main className="container">
        {error && (
          <div className="error">
            {error}
            <button 
              onClick={refreshData}
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
    </div>
  );
};

// Root component with context provider
const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
