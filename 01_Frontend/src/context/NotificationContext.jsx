import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationsAPI, API_BASE_URL } from '../services/api';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const { user, isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!isAuthenticated || !user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        // 1. Fetch historical notifications
        const fetchNotifications = async () => {
            try {
                const res = await notificationsAPI.getAll();
                const list = res.data.notifications || [];
                setNotifications(list);
                setUnreadCount(list.filter(n => !n.isRead).length);
            } catch (err) {
                console.error('Failed to fetch notifications:', err);
            }
        };

        fetchNotifications();

        // 2. Establish Server-Sent Events (SSE) Stream
        const token = localStorage.getItem('careerflux_token');
        if (!token) return;

        // In local development we point directly to backend to bypass Vite proxy buffering
        const apiBase = API_BASE_URL;
        
        const streamUrl = `${apiBase}/notifications/stream?token=${token}`;
        
        let eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            try {
                const newNotification = JSON.parse(event.data);
                
                // Add to state list
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                // Show modern animated Toast
                toast.custom((t) => (
                    <div
                        onClick={() => {
                            toast.dismiss(t.id);
                            // Navigate the user
                            window.location.href = newNotification.link;
                        }}
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            padding: '14px 16px',
                            background: 'var(--surface)',
                            border: '1.5px solid var(--green-border)',
                            boxShadow: 'var(--card-shadow)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            maxWidth: '360px',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--card-hover)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = 'var(--card-shadow)';
                        }}
                    >
                        <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: 'var(--green-bg)',
                            color: 'var(--green)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.2rem',
                            flexShrink: 0
                        }}>
                            🔔
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text)', marginBottom: '3px' }}>
                                {newNotification.title}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                                {newNotification.message}
                            </div>
                        </div>
                    </div>
                ), { duration: 5000 });

            } catch (err) {
                console.error('Error parsing notification event payload:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.warn('SSE stream disconnected or encountered error. Reconnecting...', err);
            eventSource.close();
            // Automatically tries to reconnect via standard browser EventSource logic or effect re-run
        };

        return () => {
            eventSource.close();
        };
    }, [isAuthenticated, user]);

    const markAsRead = async (id) => {
        try {
            await notificationsAPI.markAsRead(id);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (err) {
            console.error('Failed to mark all notifications as read:', err);
        }
    };

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                markAsRead,
                markAllAsRead
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
    return ctx;
};
