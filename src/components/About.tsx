import React from 'react';
import { Link } from 'react-router-dom';
import changelogData from '../data/changelog.json';
import Header from './Header';
import Footer from './Footer';

const About: React.FC = () => {
  return (
    <div className="app">
      <Header onSettingsClick={() => {}} />
      
      <main className="container about-page">
        <div className="about-page-content">
          <Link to="/" className="back-link">← Back to Home</Link>
          
          <h1>About Rainforest Eats</h1>
          
          <div className="about-section">
            <h2>What is Rainforest Eats?</h2>
            <p>
              Rainforest Eats helps you discover and search through cafeteria menus 
              across multiple Thrive locations. Browse menus by building, search for specific 
              items, and find exactly what you're craving with our intuitive interface.
            </p>
          </div>

          <div className="about-section">
            <h2>Links</h2>
            <ul className="about-links">
              <li>
                <a 
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfqBJe0vw2nVdoDDYamnAS9c2DpZDxcEGwaJCy9ShyLoJ66UA/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report Bugs / Suggest Features / Provide Feedback
                </a>
              </li>
              <li>
                <a 
                  href="http://mdkar.github.io"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  My Website
                </a>
              </li>
            </ul>
          </div>

          <div className="about-section changelog-section">
            <h2>Changelog</h2>
            <div className="changelog">
              {changelogData.map((entry, index) => (
                <div key={index} className="changelog-entry">
                  <div className="changelog-date">{entry.date}</div>
                  <ul className="changelog-changes">
                    {entry.changes.map((change, changeIndex) => (
                      <li key={changeIndex}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
