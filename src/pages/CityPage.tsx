import React, { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { CITY_SLUG_TO_NAME } from '../utils/cityRoutes';
import { useAppContext } from '../context/AppContext';
import HomePage from './HomePage';

/**
 * Renders the normal HomePage but first ensures the app context is using
 * the city that matches the URL slug (e.g. /new-york → "New York").
 *
 * If the slug is unknown we render a 404-style redirect back to /.
 */
const CityPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const { selectedCity, updateSelectedCity } = useAppContext();

  const cityName = citySlug ? CITY_SLUG_TO_NAME[citySlug] : undefined;

  // Sync URL city → context/localStorage whenever the slug changes
  useEffect(() => {
    if (cityName && cityName !== selectedCity) {
      updateSelectedCity(cityName);
    }
  // We only want to run this when the URL slug changes, not on every selectedCity change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityName]);

  // Unknown slug → send back to root (which will redirect to a valid city)
  if (!cityName) {
    return <Navigate to="/" replace />;
  }

  return <HomePage />;
};

export default CityPage;
