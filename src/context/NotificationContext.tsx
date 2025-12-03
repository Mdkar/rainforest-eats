import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Notification system that handles multiple notifications gracefully.
 * 
 * When multiple notifications are active:
 * - They stack vertically with 10px spacing
 * - Each notification has its own z-index (newer ones appear on top)
 * - Notifications can be dismissed individually
 * - Optional auto-dismiss with duration parameter
 * 
 * Usage:
 * const { addNotification } = useNotifications();
 * addNotification({
 *   title: 'Title',
 *   content: <div>Content</div>,
 *   duration: 5000 // optional auto-dismiss in ms
 * });
 */

export interface Notification {
  id: string;
  title: string;
  content: React.ReactNode;
  duration?: number; // Auto-dismiss after X milliseconds (optional)
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => string;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);

    // Auto-dismiss if duration is specified
    if (notification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, notification.duration);
    }

    return id;
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
