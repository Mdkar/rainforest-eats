import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAboutPage = location.pathname === '/about';
  const { selectedCity } = useAppContext();

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <span className="logo-icon">🍌</span>
          Rainforest Eats
          {selectedCity && (
            <span className="logo-city">{selectedCity}</span>
          )}
        </div>
        <div className="header-buttons">
          {!isAboutPage && (
            <button 
              className="settings-button"
              onClick={onSettingsClick}
              title="Location and Settings"
            >
              <span className="settings-text">Location and Settings</span>
              <span className="settings-icon">⚙️</span>
            </button>
          )}
          <button 
            className="about-header-button"
            onClick={() => navigate(isAboutPage ? '/' : '/about')}
            title={isAboutPage ? 'Back to Home' : 'About'}
          >
            <span className="about-text">{isAboutPage ? 'Home' : 'About'}</span>
            <span className="about-icon">{isAboutPage ? '🏠' : 'ℹ️'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
