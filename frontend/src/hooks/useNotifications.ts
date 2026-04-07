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

export function useNotifications(userId: string | null, userRole?: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;

    const normalizedRole = userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1).toLowerCase() : null;

    // Initial Fetch
    const fetchNotifications = async () => {
      try {
        const res = await apiClient.get('/notifications');
        const data = res.data || [];
        setNotifications(data);
        setUnreadCount(data.filter((n: NotificationItem) => !n.is_read).length);
      } catch (err) {
        console.error('Failed to fetch initial notifications:', err);
      }
    };
    fetchNotifications();

    // 1. User-specific Channel
    const userChannel = supabase
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
          if (!newNotification.is_read) setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    // 2. Role-based Channel (if applicable)
    let roleChannel: any = null;
    if (normalizedRole) {
      roleChannel = supabase
        .channel(`role-notifications-${normalizedRole}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `recipient_role=eq.${normalizedRole}`
          },
          (payload) => {
            const newNotification = payload.new as NotificationItem;
            // Avoid duplicates if both are set (though shouldn't happen)
            setNotifications(prev => {
              if (prev.find(n => n.id === newNotification.id)) return prev;
              return [newNotification, ...prev];
            });
            if (!newNotification.is_read) setUnreadCount(prev => prev + 1);
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(userChannel);
      if (roleChannel) supabase.removeChannel(roleChannel);
    };
  }, [userId, userRole]);

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
