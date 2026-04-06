import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import apiClient from '../api/api-client';

export interface NotificationItem {
  id: string;
  recipient_id: string;
  recipient_role: string;
  sender_id: string;
  class_id?: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    // Initial Fetch
    const fetchNotifications = async () => {
      try {
        // Fetch via your existing backend to respect RLS or policies
        // Alternatively, since we have the supabase client, we can query directly
        const res = await apiClient.get('/notifications');
        const data = res.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n: NotificationItem) => !n.is_read).length);
      } catch (err) {
        console.error('Failed to fetch initial notifications:', err);
      }
    };
    fetchNotifications();

    // Supabase Realtime Listener Setup
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as NotificationItem;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  return { notifications, unreadCount, markAsRead };
}
