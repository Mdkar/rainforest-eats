import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import storageService from '../services/storage';
import { CITIES, CITY_NAME_TO_SLUG, DEFAULT_CITY_SLUG } from '../utils/cityRoutes';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { updateIgnoredBrands, updateMinPrice, updateSelectedCity, debugMode, setDebugMode } = useAppContext();
  const navigate = useNavigate();
  const [ignoredBrandsText, setIgnoredBrandsText] = useState('');
  const [minPriceText, setMinPriceText] = useState('');
  const [selectedCityValue, setSelectedCityValue] = useState('');
  const [debugModeValue, setDebugModeValue] = useState(debugMode);

  useEffect(() => {
    if (isOpen) {
      // Load current preferences when settings panel opens
      const preferences = storageService.getUserPreferences();
      const ignoredBrands = preferences.ignoredBrands || [];
      const selectedCity = preferences.selectedCity || 'Seattle';
      setIgnoredBrandsText(ignoredBrands.join(', '));
      setMinPriceText((preferences.minPrice || 0).toString());
      setSelectedCityValue(selectedCity);
      setDebugModeValue(preferences.debugMode ?? false);
    }
  }, [isOpen]);

  const handleSave = () => {
    // Parse the comma-separated list and trim whitespace
    const brandsList = ignoredBrandsText
      .split(',')
      .map(brand => brand.trim())
      .filter(brand => brand.length > 0);
    
    // Parse minimum price
    const minPriceValue = parseFloat(minPriceText) || 0;
    
    updateIgnoredBrands(brandsList);
    updateMinPrice(minPriceValue);
    updateSelectedCity(selectedCityValue);
    setDebugMode(debugModeValue);

    // Keep the URL in sync with the newly selected city
    const slug = CITY_NAME_TO_SLUG[selectedCityValue] ?? DEFAULT_CITY_SLUG;
    navigate(`/${slug}`, { replace: true });

    onClose();
  };

  const handleReset = () => {
    const defaultBrands = ['Barcoded Items', 'SCAN & PAY', 'Barcoder', 'Scan & Pay', 'Scan and Pay'];
    setIgnoredBrandsText(defaultBrands.join(', '));
    setMinPriceText('0');
    setSelectedCityValue('Seattle');
  };

  if (!isOpen) return null;

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="selected-city">
              <strong>City</strong>
              <span className="setting-description">
                Select the city to show buildings and menus from.
              </span>
            </label>
            <select
              id="selected-city"
              value={selectedCityValue}
              onChange={(e) => setSelectedCityValue(e.target.value)}
              className="city-select"
            >
              {CITIES.map(city => (
                <option key={city.name} value={city.name}>
                  {city.name} ({city.count})
                </option>
              ))}
            </select>
          </div>
          
          <div className="setting-group">
            <label htmlFor="ignored-brands">
              <strong>Ignored Brands</strong>
              <span className="setting-description">
                Enter brand names to ignore, separated by commas. These brands will not appear in search results or menu displays.
              </span>
            </label>
            <textarea
              id="ignored-brands"
              value={ignoredBrandsText}
              onChange={(e) => setIgnoredBrandsText(e.target.value)}
              placeholder="Barcoded Items, SCAN & PAY, Barcoder, Scan & Pay"
              rows={4}
              className="ignored-brands-input"
            />
          </div>
          
          <div className="setting-group">
            <label htmlFor="min-price">
              <strong>Minimum Price Filter</strong>
              <span className="setting-description">
                Filter out items selling for less than this amount. Set to 0 to disable price filtering.
              </span>
            </label>
            <input
              id="min-price"
              type="number"
              min="0"
              step="0.01"
              value={minPriceText}
              onChange={(e) => setMinPriceText(e.target.value)}
              placeholder="0.00"
              className="min-price-input"
            />
          </div>
          <div className="setting-group">
            <label htmlFor="debug-mode">
              <strong>Debug Mode</strong>
              <span className="setting-description">
                Enable debug mode to show extra console logs.
              </span>
            </label>
            <input
              id="debug-mode"
              type="checkbox"
              checked={debugModeValue}
              onChange={e => setDebugModeValue(e.target.checked)}
              className="debug-mode-checkbox"
            />
          </div>
        </div>
        
        <div className="settings-footer">
          <button className="reset-button" onClick={handleReset}>
            Reset to Default
          </button>
          <div className="button-group">
            <button className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button className="save-button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
