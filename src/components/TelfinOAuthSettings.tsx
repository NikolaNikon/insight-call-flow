import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { initTelfinOAuthAPI, getTelfinOAuthAPI } from '@/services/telfinOAuthApi';
import { TelfinConfigForm } from './telfin/TelfinConfigForm';
import { TelfinStatusDisplay } from './telfin/TelfinStatusDisplay';

export const TelfinOAuthSettings = () => {
  const [config, setConfig] = useState({
    hostname: localStorage.getItem('telfin_oauth_hostname') || '',
    clientId: localStorage.getItem('telfin_oauth_client_id') || '',
    clientSecret: localStorage.getItem('telfin_oauth_client_secret') || '',
    redirectUri: `${window.location.origin}/settings?tab=integrations&oauth_callback=true`
  });
  
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    // Проверяем, есть ли действующий токен
    try {
      if (config.hostname && config.clientId && config.clientSecret) {
        initTelfinOAuthAPI(config);
        const api = getTelfinOAuthAPI();
        setIsAuthorized(api.hasValidToken());
        
        if (api.hasValidToken()) {
          loadUserInfo();
        }
      }
    } catch (error) {
      console.error('Error checking OAuth status:', error);
    }

    // Обрабатываем callback от OAuth
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const oauthCallback = urlParams.get('oauth_callback');
    
    if (code && oauthCallback) {
      handleOAuthCallback(code);
    }
  }, []);

  const handleSaveConfig = () => {
    if (!config.hostname || !config.clientId || !config.clientSecret) {
      toast({
        title: "Ошибка конфигурации",
        description: "Заполните все поля для настройки Телфин OAuth",
        variant: "destructive"
      });
      return;
    }

    // Сохраняем конфигурацию в localStorage
    localStorage.setItem('telfin_oauth_hostname', config.hostname);
    localStorage.setItem('telfin_oauth_client_id', config.clientId);
    localStorage.setItem('telfin_oauth_client_secret', config.clientSecret);

    // Инициализируем OAuth API
    initTelfinOAuthAPI(config);

    toast({
      title: "Настройки сохранены",
      description: "Конфигурация Телфин OAuth успешно сохранена",
    });
  };

  const handleStartOAuth = () => {
    if (!config.hostname || !config.clientId) {
      toast({
        title: "Ошибка авторизации",
        description: "Сначала сохраните настройки OAuth",
        variant: "destructive"
      });
      return;
    }

    try {
      initTelfinOAuthAPI(config);
      const api = getTelfinOAuthAPI();
      const authUrl = api.getAuthorizationUrl();
      
      // Открываем окно авторизации
      const popup = window.open(
        authUrl,
        'telfin_oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      // Следим за закрытием окна
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          // Проверяем, получили ли мы токен
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }, 1000);

    } catch (error) {
      toast({
        title: "Ошибка авторизации",
        description: "Не удалось начать процесс OAuth авторизации",
        variant: "destructive"
      });
    }
  };

  const handleOAuthCallback = async (code: string) => {
    setIsLoading(true);
    try {
      initTelfinOAuthAPI(config);
      const api = getTelfinOAuthAPI();
      
      await api.exchangeCodeForToken(code);
      
      // Создаем доверенное приложение
      await api.createTrustedApplication('CallControl Integration');
      
      setIsAuthorized(true);
      await loadUserInfo();
      
      toast({
        title: "Авторизация успешна",
        description: "OAuth авторизация с Телфин выполнена успешно",
      });

      // Очищаем URL от параметров
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('code');
      newUrl.searchParams.delete('oauth_callback');
      window.history.replaceState({}, document.title, newUrl.toString());
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      toast({
        title: "Ошибка авторизации",
        description: "Не удалось завершить OAuth авторизацию",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserInfo = async () => {
    try {
      const api = getTelfinOAuthAPI();
      const info = await api.getUserInfo();
      setUserInfo(info);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const handleLogout = () => {
    try {
      const api = getTelfinOAuthAPI();
      api.clearTokens();
      setIsAuthorized(false);
      setUserInfo(null);
      
      toast({
        title: "Выход выполнен",
        description: "OAuth токены очищены",
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const testConnection = async () => {
    if (!isAuthorized) {
      toast({
        title: "Ошибка тестирования",
        description: "Сначала выполните OAuth авторизацию",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await loadUserInfo();
      toast({
        title: "Тест прошел успешно",
        description: "Подключение к Телфин OAuth API работает корректно",
      });
    } catch (error) {
      toast({
        title: "Ошибка подключения",
        description: "Не удалось подключиться к Телфин API",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">Настройки</TabsTrigger>
          <TabsTrigger value="status">Статус</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
           <TelfinConfigForm 
            config={config} 
            setConfig={setConfig} 
            handleSaveConfig={handleSaveConfig} 
          />
        </TabsContent>

        <TabsContent value="status">
          <TelfinStatusDisplay
            isAuthorized={isAuthorized}
            userInfo={userInfo}
            isLoading={isLoading}
            handleStartOAuth={handleStartOAuth}
            testConnection={testConnection}
            handleLogout={handleLogout}
          />
        </TabsContent>
      </Tabs>

      <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg mt-4">
        <strong>Схема OAuth 2.0:</strong> Для полноценной интеграции необходимо создать OAuth приложение 
        в системе Телфин с указанным выше Redirect URI. После авторизации система автоматически создаст 
        доверенное приложение для постоянного доступа к API.
      </div>
    </>
  );
};
