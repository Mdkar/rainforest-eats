import React from 'react';

interface CacheIndicatorProps {
  cacheDate: Date;
}

const CacheIndicator: React.FC<CacheIndicatorProps> = ({ cacheDate }) => {
  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="cache-indicator">
      You're viewing cached menu data from {formatDate(cacheDate)}. 
      Menu data is only available live between 11:00 AM and 2:00 PM.
    </div>
  );
};

export default CacheIndicator;
