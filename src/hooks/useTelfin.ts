
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganization } from './useOrganization';
import { useToast } from './use-toast';
import { initTelfinAPI, TelfinClientCredentialsAPI, TelfinClientInfo } from '@/services/telfinOAuthApi';
import { useTelfinConnection } from './useTelfinConnection';
import { supabase } from '@/integrations/supabase/client';
import { getPendingTelfinCalls } from '@/services/telfinService';

export const useTelfin = () => {
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    connection,
    isLoadingConnection,
    saveConnection,
    saveConnectionAsync,
    isSavingConnection,
  } = useTelfinConnection(orgId);

  const [localConfig, setLocalConfig] = useState({
    clientId: '',
    clientSecret: '',
  });

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userInfo, setUserInfo] = useState<TelfinClientInfo | null>(null);
  const [apiInstance, setApiInstance] = useState<TelfinClientCredentialsAPI | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (connection) {
      const newLocalConfig = {
        clientId: connection.client_id || '',
        clientSecret: connection.client_secret || '',
      };
      setLocalConfig(newLocalConfig);

      if (newLocalConfig.clientId && newLocalConfig.clientSecret) {
        const api = initTelfinAPI({
          ...newLocalConfig,
          accessToken: connection.access_token,
          tokenExpiry: connection.token_expiry ? new Date(connection.token_expiry).getTime() : null,
        });
        setApiInstance(api);

        if (api.hasValidToken()) {
          setIsAuthorized(true);
          loadUserInfo(api);
        } else {
          setIsAuthorized(false);
          setUserInfo(null);
        }
      } else {
        setApiInstance(null);
        setIsAuthorized(false);
        setUserInfo(null);
      }
    } else if (orgId) {
      setLocalConfig({ clientId: '', clientSecret: '' });
      setApiInstance(null);
      setIsAuthorized(false);
      setUserInfo(null);
    }
  }, [connection, orgId]);


  const loadUserInfo = async (api: TelfinClientCredentialsAPI) => {
    try {
      const info = await api.getUserInfo();
      setUserInfo(info);
      return info;
    } catch (error: any) {
      console.error('Error loading user info:', error);
      toast({ title: 'Ошибка загрузки данных', description: `Не удалось получить информацию о пользователе Телфин: ${error.message}`, variant: "destructive" });
      setIsAuthorized(false);
      setUserInfo(null);
      return null;
    }
  };

  const handleSaveConfig = () => {
    if (!orgId || !localConfig.clientId || !localConfig.clientSecret) {
      toast({ title: "Ошибка конфигурации", description: "Заполните Application ID и Application Secret", variant: "destructive" });
      return;
    }
    
    saveConnection({
      org_id: orgId,
      client_id: localConfig.clientId,
      client_secret: localConfig.clientSecret,
      access_token: null,
      refresh_token: null,
      token_expiry: null,
    }, {
      onSuccess: () => {
        toast({ title: "Настройки сохранены", description: "Конфигурация Телфин успешно сохранена" });
      },
      onError: (error: any) => {
        toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
      }
    });
  };
  
  const handleConnect = async () => {
    if (!apiInstance || !orgId) {
      toast({ title: "Ошибка", description: "Сначала сохраните настройки", variant: "destructive" });
      return;
    }
    setIsConnecting(true);
    try {
      await apiInstance.getAccessToken();
      const loadedUserInfo = await loadUserInfo(apiInstance);

      if (loadedUserInfo) {
        const tokens = apiInstance.getTokens();
        await saveConnectionAsync({
          org_id: orgId,
          client_id: localConfig.clientId,
          client_secret: localConfig.clientSecret,
          access_token: tokens.accessToken,
          refresh_token: null, // refresh_token не используется в client_credentials
          token_expiry: tokens.tokenExpiry ? new Date(tokens.tokenExpiry).toISOString() : null,
        });
        
        setIsAuthorized(true);
        toast({ title: "Подключение успешно", description: "Авторизация с Телфин выполнена." });
      } else {
        throw new Error("Не удалось получить информацию о пользователе после получения токена.");
      }
    } catch (error: any) {
      console.error('Connection error:', error);
      toast({ title: "Ошибка подключения", description: error.message, variant: "destructive" });
      setIsAuthorized(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLogout = async () => {
    if (!apiInstance || !orgId || !connection) return;

    try {
        apiInstance.clearTokens();
        await saveConnectionAsync({
            ...connection,
            access_token: null,
            refresh_token: null,
            token_expiry: null
        });
        setIsAuthorized(false);
        setUserInfo(null);
        toast({ title: "Отключено", description: "Доступ к Телфин отозван" });
    } catch (error: any) {
        console.error('Error during logout:', error);
        toast({ title: "Ошибка", description: "Не удалось отозвать доступ", variant: "destructive" });
    }
  };

  const handleSyncCallHistory = async () => {
    if (!apiInstance || !orgId || !userInfo) {
      toast({ title: "Ошибка", description: "API не инициализировано, не выбрана организация или отсутствуют данные о пользователе.", variant: "destructive" });
      return;
    }
    setIsSyncing(true);
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateTo.getDate() - 7);

      const dateToString = dateTo.toISOString().split('T')[0];
      const dateFromString = dateFrom.toISOString().split('T')[0];

      toast({ title: "Синхронизация запущена", description: `Загрузка истории звонков с ${dateFromString} по ${dateToString}`});

      const callHistory = await apiInstance.getCallHistory(dateFromString, dateToString);

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
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const testConnection = async () => {
    if (!isAuthorized || !apiInstance) {
        toast({ title: "Ошибка", description: "Сначала подключитесь", variant: "destructive" });
        return;
    }
    setIsConnecting(true);
    try {
        await loadUserInfo(apiInstance);
        toast({ title: "Тест прошел успешно", description: "Подключение к Телфин API работает корректно" });
    } catch (error: any) {
        toast({ title: "Ошибка подключения", description: `Не удалось подключиться к Телфин API: ${error.message}`, variant: "destructive" });
    } finally {
        setIsConnecting(false);
    }
  };

  return {
    config: localConfig,
    setConfig: setLocalConfig,
    isAuthorized,
    userInfo,
    isLoading: isLoadingConnection || isSavingConnection || isConnecting || isSyncing,
    handleSaveConfig,
    handleConnect,
    testConnection,
    handleLogout,
    handleSyncCallHistory,
  }
}
