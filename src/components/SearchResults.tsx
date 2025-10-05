import React from 'react';
import { useAppContext } from '../context/AppContext';
import MenuItem from './MenuItem';

const SearchResults: React.FC = () => {
  const { searchResults, searchQuery } = useAppContext();
  
  // Don't display anything if there's no search query
  if (!searchQuery) {
    return null;
  }
  
  return (
    <div className="search-results">
      <h2>
        {searchResults.length > 0 
          ? `Search Results (${searchResults.length})` 
          : 'Search Results'}
      </h2>
      
      {searchResults.length > 0 ? (
        <div className="results-list">
          {searchResults.map((result, index) => (
            <MenuItem
              key={`${result.item.id}-${index}`}
              item={result.item}
              buildingId={result.buildingId}
              brandId={result.brandId}
              locationName={result.locationName}
              buildingName={result.buildingName}
            />
          ))}
        </div>
      ) : (
        <div className="no-results">
          No results found for "{searchQuery}". Try a different search term.
        </div>
      )}
    </div>
  );
};

export default SearchResults;
