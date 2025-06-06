
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DatabaseNotification {
  id: string;
  user_id: string | null;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  entity_type?: string;
  entity_id?: string;
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

  // Загружаем уведомления
  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
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

      setNotifications(prev => [data, ...prev]);
      return data;
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
            setNotifications(prev => [payload.new as DatabaseNotification, ...prev]);
            
            // Показываем toast для новых уведомлений
            const newNotification = payload.new as DatabaseNotification;
            toast({
              title: newNotification.title,
              description: newNotification.message,
              variant: newNotification.type === 'error' ? 'destructive' : 'default'
            });
          } else if (payload.eventType === 'UPDATE') {
            setNotifications(prev => 
              prev.map(notification => 
                notification.id === payload.new.id 
                  ? payload.new as DatabaseNotification
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
