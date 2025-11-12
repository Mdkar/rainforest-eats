import React from 'react';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">🍌</span>
          Rainforest Eats
        </div>
        <button 
          className="settings-button"
          onClick={onSettingsClick}
          title="Location and Settings"
        >
          <span className="settings-text">Location and Settings</span>
          <span className="settings-icon">⚙️</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
