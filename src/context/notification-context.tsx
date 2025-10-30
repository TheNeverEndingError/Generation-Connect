
'use client';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './auth-context';

type Notification = {
    id: string;
    userId: string;
    message: string;
    link: string;
    read: boolean;
    timestamp: number;
};

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (notificationId: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const storedNotifications = localStorage.getItem('fakeNotifications');
        if (storedNotifications) {
            setNotifications(JSON.parse(storedNotifications));
        }
    }, []);

    useEffect(() => {
        // Only run this if notifications have been loaded
        if (notifications.length > 0) {
            localStorage.setItem('fakeNotifications', JSON.stringify(notifications));
        }
    }, [notifications]);

    const addNotification = (notificationData: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
        const newNotification: Notification = {
            ...notificationData,
            id: `notif-${Date.now()}`,
            read: false,
            timestamp: Date.now(),
        };

        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAsRead = (notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        );
    };

    // Filter notifications for the current user
    const userNotifications = user ? notifications.filter(n => n.userId === user.uid) : [];

    return (
        <NotificationContext.Provider value={{ notifications: userNotifications, addNotification, markAsRead }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}
