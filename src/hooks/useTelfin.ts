import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from './useOrganization';
import { useToast } from './use-toast';
import { initTelfinOAuthAPI, TelfinOAuthAPI } from '@/services/telfinOAuthApi';
import { Database } from '@/integrations/supabase/types';

type TelfinConnection = Database['public']['Tables']['telfin_connections']['Row'];
type UpsertTelfinConnection = Database['public']['Tables']['telfin_connections']['Insert'];

const getTelfinConnection = async (orgId: string) => {
  const { data, error } = await supabase
    .from('telfin_connections')
    .select('*')
    .eq('org_id', orgId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116: no rows found
    throw error;
  }
  return data;
};

const saveTelfinConnection = async (connection: UpsertTelfinConnection) => {
  const { data, error } = await supabase
    .from('telfin_connections')
    .upsert(connection)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
};


export const useTelfin = () => {
  const { organization } = useOrganization();
  const orgId = organization?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [localConfig, setLocalConfig] = useState({
    hostname: '',
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/settings?tab=integrations&oauth_callback=true`
  });

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [apiInstance, setApiInstance] = useState<TelfinOAuthAPI | null>(null);
  const [isCallbackLoading, setIsCallbackLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: connection, isLoading: isLoadingConnection } = useQuery({
    queryKey: ['telfin_connection', orgId],
    queryFn: () => getTelfinConnection(orgId!),
    enabled: !!orgId,
  });

  const saveMutation = useMutation({
    mutationFn: saveTelfinConnection,
    onSuccess: () => {
      toast({ title: "Настройки сохранены", description: "Конфигурация Телфин OAuth успешно сохранена" });
      queryClient.invalidateQueries({ queryKey: ['telfin_connection', orgId] });
    },
    onError: (error: any) => {
      toast({ title: "Ошибка сохранения", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    if (orgId) {
      const storedHostname = localStorage.getItem(`telfin_oauth_hostname_${orgId}`) || '';
      let apiConfig: any = {
        hostname: storedHostname,
        redirectUri: localConfig.redirectUri,
      };

      if (connection) {
        setLocalConfig(prev => ({
          ...prev,
          hostname: storedHostname,
          clientId: connection.client_id || '',
          clientSecret: connection.client_secret || '',
        }));
        
        apiConfig = {
          ...apiConfig,
          clientId: connection.client_id,
          clientSecret: connection.client_secret,
          accessToken: connection.access_token || undefined,
          refreshToken: connection.refresh_token || undefined,
          tokenExpiry: connection.token_expiry ? new Date(connection.token_expiry).getTime() : undefined,
        };
      } else {
        setLocalConfig(prev => ({ ...prev, hostname: storedHostname, clientId: '', clientSecret: '' }));
      }
      
      if (apiConfig.hostname && apiConfig.clientId && apiConfig.clientSecret) {
        const api = initTelfinOAuthAPI(apiConfig);
        setApiInstance(api);
        setIsAuthorized(api.hasValidToken());
        if(api.hasValidToken()) {
            loadUserInfo(api);
        }
      } else {
        setApiInstance(null);
        setIsAuthorized(false);
      }
    }
  }, [connection, orgId]);


  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const oauthCallback = urlParams.get('oauth_callback');
    
    if (code && oauthCallback && apiInstance) {
      handleOAuthCallback(code);
    }
  }, [apiInstance]);

  const loadUserInfo = async (api: TelfinOAuthAPI) => {
    try {
      const info = await api.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error loading user info:', error);
      toast({ title: 'Ошибка загрузки данных', description: 'Не удалось получить информацию о пользователе Телфин.', variant: "destructive" });
    }
  };

  const handleSaveConfig = () => {
    if (!orgId || !localConfig.hostname || !localConfig.clientId || !localConfig.clientSecret) {
      toast({ title: "Ошибка конфигурации", description: "Заполните все поля для настройки Телфин OAuth", variant: "destructive" });
      return;
    }
    localStorage.setItem(`telfin_oauth_hostname_${orgId}`, localConfig.hostname);
    
    saveMutation.mutate({
      org_id: orgId,
      client_id: localConfig.clientId,
      client_secret: localConfig.clientSecret,
    });
  };

  const handleStartOAuth = () => {
    if (!apiInstance) {
      toast({ title: "Ошибка", description: "Сначала сохраните настройки OAuth", variant: "destructive" });
      return;
    }

    try {
      const authUrl = apiInstance.getAuthorizationUrl();
      window.open(authUrl, 'telfin_oauth', 'width=600,height=700,scrollbars=yes,resizable=yes');
    } catch (error) {
      toast({ title: "Ошибка авторизации", description: "Не удалось начать процесс OAuth авторизации", variant: "destructive" });
    }
  };

  const handleOAuthCallback = async (code: string) => {
    if (!apiInstance || !orgId) return;
    setIsCallbackLoading(true);
    try {
      await apiInstance.exchangeCodeForToken(code);
      const tokens = apiInstance.getTokens();
      
      await saveTelfinConnection({
        org_id: orgId,
        client_id: localConfig.clientId,
        client_secret: localConfig.clientSecret,
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        token_expiry: tokens.tokenExpiry ? new Date(tokens.tokenExpiry).toISOString() : null,
      });

      await apiInstance.createTrustedApplication('CallControl Integration');
      
      setIsAuthorized(true);
      await loadUserInfo(apiInstance);
      
      toast({ title: "Авторизация успешна", description: "OAuth авторизация с Телфин выполнена успешно" });

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('code');
      newUrl.searchParams.delete('oauth_callback');
      window.history.replaceState({}, document.title, newUrl.toString());

      queryClient.invalidateQueries({ queryKey: ['telfin_connection', orgId] });
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({ title: "Ошибка авторизации", description: "Не удалось завершить OAuth авторизацию", variant: "destructive" });
    } finally {
      setIsCallbackLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!apiInstance || !orgId || !connection) return;

    try {
        apiInstance.clearTokens();
        await saveTelfinConnection({
            ...connection,
            access_token: null,
            refresh_token: null,
            token_expiry: null
        });
        setIsAuthorized(false);
        setUserInfo(null);
        queryClient.invalidateQueries({ queryKey: ['telfin_connection', orgId] });
        toast({ title: "Выход выполнен", description: "OAuth токены очищены" });
    } catch (error) {
        console.error('Error during logout:', error);
        toast({ title: "Ошибка выхода", description: "Не удалось очистить токены", variant: "destructive" });
    }
  };

  const handleSyncCallHistory = async () => {
    if (!apiInstance || !orgId) {
      toast({ title: "Ошибка", description: "API не инициализировано или не выбрана организация.", variant: "destructive" });
      return;
    }
    setIsSyncing(true);
    try {
      const dateTo = new Date();
      const dateFrom = new Date();
      dateFrom.setDate(dateTo.getDate() - 7); // Синхронизация за последние 7 дней

      const dateToString = dateTo.toISOString().split('T')[0];
      const dateFromString = dateFrom.toISOString().split('T')[0];

      toast({ title: "Синхронизация запущена", description: `Загрузка истории звонков с ${dateFromString} по ${dateToString}`});

      const callHistory = await apiInstance.getCallHistory(dateFromString, dateToString);

      if (callHistory.length === 0) {
        toast({ title: "Нет новых звонков", description: "За выбранный период нет звонков для синхронизации." });
        setIsSyncing(false);
        return;
      }

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

    } catch (error: any) {
      console.error('Error syncing call history:', error);
      toast({ title: "Ошибка синхронизации", description: error.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const testConnection = async () => {
    if (!isAuthorized || !apiInstance) {
        toast({ title: "Ошибка", description: "Сначала авторизуйтесь", variant: "destructive" });
        return;
    }
    setIsCallbackLoading(true);
    try {
        await loadUserInfo(apiInstance);
        toast({ title: "Тест прошел успешно", description: "Подключение к Телфин OAuth API работает корректно" });
    } catch (error) {
        toast({ title: "Ошибка подключения", description: "Не удалось подключиться к Телфин API", variant: "destructive" });
    } finally {
        setIsCallbackLoading(false);
    }
  };

  return {
    config: localConfig,
    setConfig: setLocalConfig,
    isAuthorized,
    userInfo,
    isLoading: isLoadingConnection || saveMutation.isPending || isCallbackLoading || isSyncing,
    handleSaveConfig,
    handleStartOAuth,
    testConnection,
    handleLogout,
    handleSyncCallHistory,
  }
}
