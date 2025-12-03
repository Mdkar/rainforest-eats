import React from 'react';
import { useNotifications } from '../context/NotificationContext';

/**
 * Demo component to test multiple notifications
 * This is for testing purposes only - you can remove it or use it to trigger notifications
 */
const NotificationDemo: React.FC = () => {
  const { addNotification } = useNotifications();

  const showTestNotification = () => {
    addNotification({
      title: 'Test Notification',
      content: (
        <div>
          <p>This is a test notification to demonstrate stacking behavior.</p>
          <p style={{ fontSize: '0.9rem', color: '#666' }}>
            Try clicking the button multiple times to see how notifications stack!
          </p>
        </div>
      ),
      duration: 5000, // Auto-dismiss after 5 seconds
    });
  };

  const showTipNotification = () => {
    addNotification({
      title: '💡 Pro Tip',
      content: (
        <div>
          <p>You can search for menu items across all buildings using the search bar!</p>
        </div>
      ),
      duration: 7000,
    });
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      left: '20px', 
      display: 'flex', 
      gap: '10px',
      zIndex: 1000 
    }}>
      <button 
        onClick={showTestNotification}
        style={{
          padding: '10px 15px',
          backgroundColor: '#ff9900',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show Test Notification
      </button>
      <button 
        onClick={showTipNotification}
        style={{
          padding: '10px 15px',
          backgroundColor: '#146eb4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show Tip
      </button>
    </div>
  );
};

export default NotificationDemo;
