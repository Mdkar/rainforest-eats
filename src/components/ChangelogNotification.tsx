import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import changelogData from '../data/changelog.json';

const STORAGE_KEY = 'lastViewedChangelogDate';

const ChangelogNotification: React.FC = () => {
  const { addNotification, removeNotification } = useNotifications();
  const notificationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Get the latest changelog entry
    if (changelogData.length === 0) return;
    
    const latest = changelogData[0];
    const lastViewedDate = localStorage.getItem(STORAGE_KEY);

    // Show notification if user hasn't seen this changelog entry
    if (!lastViewedDate || lastViewedDate !== latest.date) {
      const notificationId = addNotification({
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
        onDismiss: () => {
          // Mark as read when dismissed via X button
          localStorage.setItem(STORAGE_KEY, latest.date);
        },
      });

      notificationIdRef.current = notificationId;

      // Cleanup: remove notification if component unmounts
      return () => {
        if (notificationIdRef.current) {
          removeNotification(notificationIdRef.current);
          notificationIdRef.current = null;
        }
      };
    }
  }, [addNotification, removeNotification]);

  return null;
};

export default ChangelogNotification;
