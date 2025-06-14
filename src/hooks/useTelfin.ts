import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useOrganization } from './useOrganization';
import { useToast } from './use-toast';
import { initTelfinAPI, TelfinClientCredentialsAPI, TelfinClientInfo } from '@/services/telfinOAuthApi';
import { useTelfinConnection } from './useTelfinConnection';
import { supabase } from '@/integrations/supabase/client';
import { getPendingTelfinCalls } from '@/services/telfinService';

const extractErrorCode = (message: string): [string, string] => {
  const match = message.match(/\[([A-Z0-9-]+)\]/);
  if (match) {
    const code = match[1];
    const cleanMessage = message.replace(`[${code}] `, '').trim();
    return [code, cleanMessage];
  }
  return ["", message];
};

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
      const [errorCode, errorMessage] = extractErrorCode(error.message);
      const finalErrorCode = errorCode || 'TELFIN-HOOK-001';
      const description = `Не удалось получить информацию о пользователе Телфин: ${errorMessage}`;
      
      toast({ 
        title: `Ошибка загрузки данных [${finalErrorCode}]`, 
        description,
        variant: "destructive",
        copyableText: `Error Code: ${finalErrorCode}\nTitle: Ошибка загрузки данных\nDescription: ${description}\nDetails: ${JSON.stringify(error, null, 2)}`
      });

      setIsAuthorized(false);
      setUserInfo(null);
      return null;
    }
  };

  const handleSaveConfig = () => {
    if (!orgId || !localConfig.clientId || !localConfig.clientSecret) {
      const errorCode = "TELFIN-HOOK-002";
      const errorText = "Заполните Application ID и Application Secret.";
      toast({ 
        title: `Ошибка конфигурации [${errorCode}]`, 
        description: errorText, 
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка конфигурации\nDescription: ${errorText}`
      });
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
        const [errorCode, errorMessage] = extractErrorCode(error.message);
        const finalErrorCode = errorCode || 'TELFIN-HOOK-003';
        toast({ 
          title: `Ошибка сохранения [${finalErrorCode}]`,
          description: errorMessage, 
          variant: "destructive",
          copyableText: `Error Code: ${finalErrorCode}\nTitle: Ошибка сохранения\nDescription: ${errorMessage}\nDetails: ${JSON.stringify(error, null, 2)}`
        });
      }
    });
  };
  
  const handleConnect = async () => {
    if (!orgId || !localConfig.clientId || !localConfig.clientSecret) {
      const errorCode = "TELFIN-HOOK-004";
      const errorText = "Заполните Application ID и Application Secret.";
      toast({ 
        title: `Ошибка [${errorCode}]`, 
        description: errorText, 
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка\nDescription: ${errorText}`
      });
      return;
    }

    setIsConnecting(true);
    
    const tempApi = new TelfinClientCredentialsAPI({
      clientId: localConfig.clientId,
      clientSecret: localConfig.clientSecret,
    });
    
    try {
      console.log('Attempting to connect with clientId:', localConfig.clientId.substring(0, 5) + '...');
      await tempApi.getAccessToken();
      const loadedUserInfo = await tempApi.getUserInfo();

      const tokens = tempApi.getTokens();
      await saveConnectionAsync({
        org_id: orgId,
        client_id: localConfig.clientId,
        client_secret: localConfig.clientSecret,
        access_token: tokens.accessToken,
        refresh_token: null,
        token_expiry: tokens.tokenExpiry ? new Date(tokens.tokenExpiry).toISOString() : null,
      });

      setApiInstance(tempApi);
      setIsAuthorized(true);
      setUserInfo(loadedUserInfo);
      
      toast({ title: "Подключение успешно", description: `Авторизация для "${loadedUserInfo.name}" выполнена.` });

    } catch (error: any) {
      console.error('Connection error:', error);
      const [errorCode, errorMessage] = extractErrorCode(error.message);
      const finalErrorCode = errorCode || 'TELFIN-HOOK-006';
      
      toast({ 
        title: `Ошибка подключения [${finalErrorCode}]`, 
        description: errorMessage, 
        variant: "destructive",
        copyableText: `Error Code: ${finalErrorCode}\nTitle: Ошибка подключения\nDescription: ${errorMessage}\nDetails: ${JSON.stringify(error, null, 2)}`
      });
      setIsAuthorized(false);
      setUserInfo(null);
      setApiInstance(null);
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
        const errorCode = 'TELFIN-HOOK-007';
        const errorText = "Не удалось отозвать доступ";
        toast({ 
          title: `Ошибка [${errorCode}]`,
          description: errorText, 
          variant: "destructive",
          copyableText: `Error Code: ${errorCode}\nTitle: Ошибка\nDescription: ${errorText}\nDetails: ${JSON.stringify(error, null, 2)}`
        });
    }
  };

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
      const [errorCode, errorMessage] = extractErrorCode(error.message);
      const finalErrorCode = errorCode || 'TELFIN-HOOK-009';
      toast({ 
        title: `Ошибка [${finalErrorCode}]`, 
        description: errorMessage, 
        variant: "destructive",
        copyableText: `Error Code: ${finalErrorCode}\nTitle: Ошибка\nDescription: ${errorMessage}\nDetails: ${JSON.stringify(error, null, 2)}`
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const testConnection = async () => {
    if (!isAuthorized || !apiInstance) {
        const errorCode = "TELFIN-HOOK-010";
        const errorText = "Сначала подключитесь";
        toast({ 
          title: `Ошибка [${errorCode}]`, 
          description: errorText, 
          variant: "destructive",
          copyableText: `Error Code: ${errorCode}\nTitle: Ошибка\nDescription: ${errorText}`
        });
        return;
    }
    setIsConnecting(true);
    try {
        await loadUserInfo(apiInstance);
        toast({ title: "Тест прошел успешно", description: "Подключение к Телфин API работает корректно" });
    } catch (error: any) {
        const [errorCode, errorMessage] = extractErrorCode(error.message);
        const finalErrorCode = errorCode || 'TELFIN-HOOK-011';
        toast({ 
          title: `Ошибка подключения [${finalErrorCode}]`, 
          description: `Не удалось подключиться к Телфин API: ${errorMessage}`, 
          variant: "destructive",
          copyableText: `Error Code: ${finalErrorCode}\nTitle: Ошибка подключения\nDescription: Не удалось подключиться к Телфин API: ${errorMessage}\nDetails: ${JSON.stringify(error, null, 2)}`
        });
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
