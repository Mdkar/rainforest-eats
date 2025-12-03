import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import HomePage from './pages/HomePage';
import About from './components/About';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <Router>
      <NotificationProvider>
        <AppProvider>
          <NotificationContainer />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </AppProvider>
      </NotificationProvider>
    </Router>
  );
};

export default App;
