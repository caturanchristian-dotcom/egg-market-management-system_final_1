import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Notification as NotificationType } from '../types';
import ToastNotification, { NotificationType as ToastType } from '../components/Notification';

/**
 * NotificationContext Interface
 * Defines the contract for providing real-time notifications and ephemeral toast messages across the app.
 */
interface NotificationContextType {
  notifications: NotificationType[]; // Array of persistent user notifications (e.g., "Order #123 delivered")
  unreadCount: number; // Count of notifications that haven't been opened yet
  fetchNotifications: () => Promise<void>; // Triggers a manual refresh from the server
  markAsRead: (id: number) => Promise<void>; // Logic to transition a notification to read state
  markAllAsRead: () => Promise<void>; // Bulk mark as read for current user
  showToast: (message: string, type: ToastType) => void; // Function to trigger a short-lived UI toast
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

/**
 * NotificationProvider Component
 * Manages notification state, ephemeral toasts, and implements background polling for new alerts.
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
  // State for persistent backend notifications
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  
  // State for the single-active-toast system
  const [toast, setToast] = useState<{ message: string; type: ToastType; isOpen: boolean }>({
    message: '',
    type: 'info',
    isOpen: false
  });

  /**
   * Universal toast trigger
   */
  const showToast = useCallback((message: string, type: ToastType) => {
    setToast({ message, type, isOpen: true });
  }, []);

  /**
   * Universal toast dismisser
   */
  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Background task to sync notifications with the database
   */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        
        // Use functional update to avoid stale closures and infinite effect loops
        setNotifications(prev => {
          // Logic: If new entries appear, notify the user immediately via toast
          if (prev.length > 0 && data.length > prev.length) {
            const newNotif = data[0];
            if (!newNotif.is_read) {
              showToast(newNotif.message, 'info');
            }
          }
          return data;
        });
      }
    } catch (err) {
      // Silent error: System remains functional if notification server is temporarily unreachable
    }
  }, [user, showToast]);

  /**
   * Syncs "Read" status to the server for a specific item
   */
  const markAsRead = async (id: number) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
        );
      }
    } catch (err) {
      // Logic: If server sync fails, UI reflects read state locally anyway
    }
  };

  /**
   * Batch update helper
   */
  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    await Promise.all(unread.map(n => markAsRead(n.id)));
  };

  /**
   * Lifecycle management: Polling
   * When a user is logged in, poll every 30 seconds for live updates.
   */
  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Implementation of fake-real-time via polling
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      // Reset state if no user is present
      setNotifications([]);
    }
  }, [user, fetchNotifications]);

  // Derived state for the badge counter
  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      fetchNotifications, 
      markAsRead,
      markAllAsRead,
      showToast
    }}>
      {children}
      {/* Global Toast portal component */}
      <ToastNotification 
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={hideToast}
      />
    </NotificationContext.Provider>
  );
}

/**
 * useNotifications Hook
 * Standardized interface to interact with the notification and toast system.
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
