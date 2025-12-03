import React from 'react';
import { useNotifications } from '../context/NotificationContext';
import NotificationPopup from './NotificationPopup';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="notification-container">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id} 
          className="notification-wrapper"
          style={{ 
            top: `${80 + index * 10}px`,
            zIndex: 999 - index 
          }}
        >
          <NotificationPopup
            isVisible={true}
            onDismiss={() => {
              notification.onDismiss?.();
              removeNotification(notification.id);
            }}
            title={notification.title}
          >
            {notification.content}
          </NotificationPopup>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;
