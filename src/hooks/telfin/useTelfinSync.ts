
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getPendingTelfinCalls } from '@/services/telfinService';
import { TelfinClientCredentialsAPI, TelfinClientInfo } from '@/services/telfinOAuthApi';
import { extractErrorCode } from './telfinErrorUtils';

export const useTelfinSync = (apiInstance: TelfinClientCredentialsAPI | null, orgId: string | undefined, userInfo: TelfinClientInfo | null, localConfig: any) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncCallHistory = async () => {
    if (!apiInstance || !orgId || !userInfo) {
      const errorCode = "TELFIN-HOOK-008";
      const errorText = "API не инициализировано, не выбрана организация или отсутствуют данные о пользователе.";
      toast({ 
        title: `Ошибка [${errorCode}]`, 
        description: errorText, 
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка\nDescription: ${errorText}`
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateTo.getDate() - 7);

      const dateToString = dateTo.toISOString().split('T')[0];
      const dateFromString = dateFrom.toISOString().split('T')[0];

      console.log('Starting call history sync:', {
        dateFrom: dateFromString,
        dateTo: dateToString,
        clientId: userInfo.client_id,
        orgId
      });

      toast({ title: "Синхронизация запущена", description: `Загрузка истории звонков с ${dateFromString} по ${dateToString}`});

      // Передаем userInfo в getCallHistory
      const callHistory = await apiInstance.getCallHistory(dateFromString, dateToString, userInfo);

      console.log('Call history received:', {
        count: callHistory.length,
        hasData: callHistory.length > 0
      });

      if (callHistory.length > 0) {
        const { data, error } = await supabase.functions.invoke('telfin-integration', {
          body: {
            action: 'save_call_history',
            calls: callHistory,
            orgId: orgId,
          },
        });

        if (error) throw error;
        
        const result = data;
        if (!result.success) {
          throw new Error(result.error || 'Ошибка при сохранении истории звонков.');
        }
        
        queryClient.invalidateQueries({ queryKey: ['telfin_calls', orgId] });
        toast({ title: "Синхронизация завершена", description: `Найдено и сохранено звонков: ${result.saved_count}.` });
      } else {
        toast({ title: "Нет новых звонков", description: "За выбранный период нет звонков для синхронизации." });
      }

      // --- Process part ---
      toast({ title: "Обработка запущена", description: "Ищем звонки для обработки..." });
      
      const pendingCalls = await getPendingTelfinCalls(orgId);

      if (pendingCalls.length === 0) {
        toast({ title: "Нет звонков для обработки", description: "Все доступные звонки уже обработаны." });
        return; 
      }
      
      toast({ title: "Начинаем обработку", description: `Найдено звонков для обработки: ${pendingCalls.length}` });
      
      let successCount = 0;
      let errorCount = 0;

      const { clientId } = localConfig;
      const tokens = apiInstance.getTokens();
      const accessToken = tokens.accessToken;

      for (const call of pendingCalls) {
        try {
          const { data: processData, error: processError } = await supabase.functions.invoke('telfin-integration', {
            body: {
              action: 'process_call_record_and_create_call',
              orgId,
              telfinCall: call,
              clientId,
              accessToken,
            },
          });
          if (processError) throw processError;
          if (processData && !processData.success) throw new Error(processData.error || 'Неизвестная ошибка на сервере');
          successCount++;
        } catch (e: any) {
          errorCount++;
          console.error(`Ошибка обработки звонка ${call.id}: ${e.message}`);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['telfin_calls', orgId] });
      toast({
        title: "Обработка завершена",
        description: `Успешно: ${successCount}. Ошибки: ${errorCount}.`
      });

    } catch (error: any) {
      console.error('Error syncing or processing call history:', error);
      
      // Улучшенная обработка ошибок с диагностической информацией
      const [errorCode, errorMessage] = extractErrorCode(error.message);
      const finalErrorCode = errorCode || 'TELFIN-HOOK-009';
      
      // Добавляем дополнительную диагностическую информацию если доступна
      let copyableText = `Error Code: ${finalErrorCode}\nTitle: Ошибка\nDescription: ${errorMessage}`;
      
      if (error.diagnostics) {
        copyableText += `\n\nДиагностика:\n${JSON.stringify(error.diagnostics, null, 2)}`;
      } else {
        copyableText += `\n\nDetails: ${JSON.stringify(error, null, 2)}`;
      }
      
      toast({ 
        title: `Ошибка [${finalErrorCode}]`, 
        description: errorMessage, 
        variant: "destructive",
        copyableText
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isSyncing,
    handleSyncCallHistory,
  };
};
