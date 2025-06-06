
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/notificationService';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Подписываемся на изменения в таблице calls
    const callsChannel = supabase
      .channel('calls-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calls'
        },
        async (payload) => {
          console.log('Call update:', payload);
          
          // Обновляем все связанные запросы
          queryClient.invalidateQueries({ queryKey: ['calls'] });
          queryClient.invalidateQueries({ queryKey: ['recent-calls'] });
          queryClient.invalidateQueries({ queryKey: ['processing-calls'] });
          queryClient.invalidateQueries({ queryKey: ['call-stats'] });

          // Создаем уведомления при изменении статуса обработки
          if (payload.eventType === 'UPDATE' && payload.new?.processing_status === 'completed') {
            try {
              await NotificationService.notifyCallProcessed(
                payload.new.id,
                payload.new.manager_id,
                true
              );
            } catch (error) {
              console.error('Failed to create completion notification:', error);
            }
          }

          if (payload.eventType === 'UPDATE' && payload.new?.processing_status === 'failed') {
            try {
              await NotificationService.notifyCallProcessed(
                payload.new.id,
                payload.new.manager_id,
                false
              );
            } catch (error) {
              console.error('Failed to create failure notification:', error);
            }
          }
        }
      )
      .subscribe();

    // Подписываемся на изменения в таблице exports
    const exportsChannel = supabase
      .channel('exports-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'exports'
        },
        async (payload) => {
          console.log('Export update:', payload);
          queryClient.invalidateQueries({ queryKey: ['exports'] });

          if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
            try {
              await NotificationService.notifyExportComplete(
                payload.new.id,
                payload.new.user_id,
                true
              );
            } catch (error) {
              console.error('Failed to create export notification:', error);
            }
          }

          if (payload.eventType === 'UPDATE' && payload.new?.status === 'failed') {
            try {
              await NotificationService.notifyExportComplete(
                payload.new.id,
                payload.new.user_id,
                false
              );
            } catch (error) {
              console.error('Failed to create export failure notification:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(exportsChannel);
    };
  }, [queryClient]);
};
