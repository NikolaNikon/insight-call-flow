
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

// Используем типы из Supabase
type NotificationRow = Database['public']['Tables']['notifications']['Row'];

export interface DatabaseNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Функция для приведения типов из БД к нашему интерфейсу
  const mapNotificationFromDB = (dbNotification: NotificationRow): DatabaseNotification => {
    return {
      id: dbNotification.id,
      user_id: dbNotification.user_id,
      title: dbNotification.title,
      message: dbNotification.message,
      type: dbNotification.type as 'info' | 'success' | 'warning' | 'error',
      read: dbNotification.read,
      entity_type: dbNotification.entity_type,
      entity_id: dbNotification.entity_id,
      metadata: (dbNotification.metadata as Record<string, any>) || {},
      created_at: dbNotification.created_at,
      updated_at: dbNotification.updated_at,
    };
  };

  // Загружаем уведомления
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const mappedNotifications = (data || []).map(mapNotificationFromDB);
      setNotifications(mappedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Ошибка загрузки уведомлений",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Отмечаем как прочитанное
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, read: true }
            : notification
        )
      );

      toast({
        title: "Уведомление отмечено как прочитанное",
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Ошибка обновления уведомления",
        variant: "destructive"
      });
    }
  };

  // Отмечаем все как прочитанные
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.read)
        .map(n => n.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );

      toast({
        title: "Все уведомления отмечены как прочитанные",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Ошибка обновления уведомлений",
        variant: "destructive"
      });
    }
  };

  // Удаляем уведомление
  const removeNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== id));
      
      toast({
        title: "Уведомление удалено",
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: "Ошибка удаления уведомления",
        variant: "destructive"
      });
    }
  };

  // Создаем уведомление
  const createNotification = async (notification: Omit<DatabaseNotification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;

      const mappedNotification = mapNotificationFromDB(data);
      setNotifications(prev => [mappedNotification, ...prev]);
      return mappedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  };

  // Real-time подписка
  useEffect(() => {
    fetchNotifications();

    if (!user) return;

    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: user ? `user_id=eq.${user.id}` : 'user_id=is.null'
        },
        (payload) => {
          console.log('Notification update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const mappedNotification = mapNotificationFromDB(payload.new as NotificationRow);
            setNotifications(prev => [mappedNotification, ...prev]);
            
            // Показываем toast для новых уведомлений
            toast({
              title: mappedNotification.title,
              description: mappedNotification.message,
              variant: mappedNotification.type === 'error' ? 'destructive' : 'default'
            });
          } else if (payload.eventType === 'UPDATE') {
            const mappedNotification = mapNotificationFromDB(payload.new as NotificationRow);
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === mappedNotification.id 
                  ? mappedNotification
                  : notification
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => 
              prev.filter(notification => notification.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    createNotification,
    refetch: fetchNotifications
  };
};
