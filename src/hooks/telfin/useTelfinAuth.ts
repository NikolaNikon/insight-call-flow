
import { useState, useEffect } from 'react';
import { useToast } from '../use-toast';
import { TelfinClientCredentialsAPI, TelfinClientInfo, initTelfinAPI } from '@/services/telfinOAuthApi';
import { extractErrorCode } from './telfinErrorUtils';

export const useTelfinAuth = (connection: any, localConfig: any, orgId: string | undefined, saveConnectionAsync: any) => {
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userInfo, setUserInfo] = useState<TelfinClientInfo | null>(null);
  const [apiInstance, setApiInstance] = useState<TelfinClientCredentialsAPI | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (connection && localConfig.clientId && localConfig.clientSecret) {
      const api = initTelfinAPI({
        ...localConfig,
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
    } else if (orgId) {
      setApiInstance(null);
      setIsAuthorized(false);
      setUserInfo(null);
    }
  }, [connection, orgId, localConfig]);

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
    isAuthorized,
    userInfo,
    apiInstance,
    isConnecting,
    handleConnect,
    handleLogout,
    testConnection,
    loadUserInfo,
  };
};
