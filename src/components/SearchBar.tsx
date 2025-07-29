import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import storageService from '../services/storage';

const SearchBar: React.FC = () => {
  const { searchMenuItems } = useAppContext();
  const [query, setQuery] = useState('');
  
  // Load the last search query from local storage on mount
  useEffect(() => {
    const userPrefs = storageService.getUserPreferences();
    if (userPrefs.lastSearch) {
      setQuery(userPrefs.lastSearch);
      searchMenuItems(userPrefs.lastSearch);
    }
  }, []);  // Remove searchMenuItems dependency to avoid re-running on every render
  
  // Debounced search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (query) {
        searchMenuItems(query);
      }
    }, 300);
    
    return () => {
      clearTimeout(handler);
    };
  }, [query]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchMenuItems(query);
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };
  
  return (
    <div className="search-container">
      <form onSubmit={handleSearch}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          className="search-bar"
          placeholder="Search for food (e.g. burger, salad, vegan)..."
          value={query}
          onChange={handleChange}
        />
      </form>
    </div>
  );
};

export default SearchBar;
