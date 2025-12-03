import React from 'react';

interface NotificationPopupProps {
  isVisible: boolean;
  onDismiss: () => void;
  title: string;
  children: React.ReactNode;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isVisible,
  onDismiss,
  title,
  children,
}) => {
  if (!isVisible) return null;

  return (
    <div className="notification-popup">
      <div className="notification-header">
        <h3>{title}</h3>
        <button 
          className="notification-close" 
          onClick={onDismiss}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
      <div className="notification-content">
        {children}
      </div>
    </div>
  );
};

export default NotificationPopup;
