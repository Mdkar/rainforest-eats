import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <span>Rainforest Eats - A menu aggregator for Amazon offices</span>
        <Link to="/about" className="footer-link">About</Link>
      </div>
    </footer>
  );
};

export default Footer;
