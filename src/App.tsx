import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import CityPage from './pages/CityPage';
import About from './components/About';
import storageService from './services/storage';
import { CITY_NAME_TO_SLUG, DEFAULT_CITY_SLUG } from './utils/cityRoutes';
import './styles/App.css';

/**
 * Redirects / to /{citySlug} based on the user's stored city preference.
 * Falls back to the default city if nothing is stored or the stored city
 * doesn't have a known slug.
 */
const RootRedirect: React.FC = () => {
  const prefs = storageService.getUserPreferences();
  const storedCity = prefs.selectedCity;
  const slug = (storedCity && CITY_NAME_TO_SLUG[storedCity]) ?? DEFAULT_CITY_SLUG;
  return <Navigate to={`/${slug}`} replace />;
};

const App: React.FC = () => {
  return (
    <Router>
      <NotificationProvider>
        <AppProvider>
          <NotificationContainer />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/about" element={<About />} />
            <Route path="/:citySlug" element={<CityPage />} />
          </Routes>
        </AppProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;
