import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import changelogData from '../data/changelog.json';

const STORAGE_KEY = 'lastViewedChangelogDate';

const ChangelogNotification: React.FC = () => {
  const { addNotification } = useNotifications();

  useEffect(() => {
    // Get the latest changelog entry
    if (changelogData.length === 0) return;
    
    const latest = changelogData[0];
    const lastViewedDate = localStorage.getItem(STORAGE_KEY);

    // Show notification if user hasn't seen this changelog entry
    if (!lastViewedDate || lastViewedDate !== latest.date) {
      addNotification({
        title: "What's New",
        content: (
          <div className="changelog-notification">
            <div className="changelog-notification-date">{latest.date}</div>
            <ul className="changelog-notification-list">
              {latest.changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
            <Link 
              to="/about" 
              className="changelog-notification-link"
              onClick={() => {
                localStorage.setItem(STORAGE_KEY, latest.date);
              }}
            >
              View Full Changelog →
            </Link>
          </div>
        ),
      });

      // Mark as viewed when component unmounts
      return () => {
        localStorage.setItem(STORAGE_KEY, latest.date);
      };
    }
  }, [addNotification]);

  return null;
};

export default ChangelogNotification;
