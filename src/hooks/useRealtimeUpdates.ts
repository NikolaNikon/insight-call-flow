
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
        (payload) => {
          console.log('Call update:', payload);
          
          // Обновляем все связанные запросы
          queryClient.invalidateQueries({ queryKey: ['calls'] });
          queryClient.invalidateQueries({ queryKey: ['recent-calls'] });
          queryClient.invalidateQueries({ queryKey: ['processing-calls'] });
          queryClient.invalidateQueries({ queryKey: ['call-stats'] });

          // Показываем уведомление при завершении обработки
          if (payload.eventType === 'UPDATE' && payload.new?.processing_status === 'completed') {
            toast({
              title: "Обработка завершена",
              description: "Аудиозапись успешно обработана и готова к просмотру",
            });
          }

          if (payload.eventType === 'UPDATE' && payload.new?.processing_status === 'failed') {
            toast({
              title: "Ошибка обработки",
              description: "Не удалось обработать аудиозапись",
              variant: "destructive"
            });
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
        (payload) => {
          console.log('Export update:', payload);
          queryClient.invalidateQueries({ queryKey: ['exports'] });

          if (payload.eventType === 'UPDATE' && payload.new?.status === 'completed') {
            toast({
              title: "Отчет готов",
              description: "Экспорт завершен, файл готов к скачиванию",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(callsChannel);
      supabase.removeChannel(exportsChannel);
    };
  }, [queryClient, toast]);
};
