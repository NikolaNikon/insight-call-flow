import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, TestTube, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initTelfinOAuthAPI, getTelfinOAuthAPI } from '@/services/telfinOAuthApi';

export const TelfinOAuthSettings = () => {
  const [config, setConfig] = useState({
    hostname: localStorage.getItem('telfin_oauth_hostname') || '',
    clientId: localStorage.getItem('telfin_oauth_client_id') || '',
    clientSecret: localStorage.getItem('telfin_oauth_client_secret') || '',
    redirectUri: `${window.location.origin}/settings?tab=telfin&oauth_callback=true`
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
      window.history.replaceState({}, document.title, window.location.pathname);
      
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
        
        <TabsContent value="config" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="hostname">Hostname Телфин</Label>
              <Input
                id="hostname"
                placeholder="example.telfin.ru"
                value={config.hostname}
                onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="client-id">Client ID (App ID)</Label>
              <Input
                id="client-id"
                placeholder="a80f1e618ddd4d4584e2bd48fd404194"
                value={config.clientId}
                onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="client-secret">Client Secret (App Secret)</Label>
              <Input
                id="client-secret"
                type="password"
                placeholder="a2423941f5be408c998d5f7207570990"
                value={config.clientSecret}
                onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="redirect-uri">Redirect URI</Label>
              <Input
                id="redirect-uri"
                value={config.redirectUri}
                readOnly
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Укажите этот URI при создании OAuth приложения в Телфин
              </p>
            </div>
          </div>

          <Button onClick={handleSaveConfig} className="gap-2">
            <Save className="h-4 w-4" />
            Сохранить настройки
          </Button>
        </TabsContent>

        <TabsContent value="status" className="space-y-4 pt-4">
          <div className="flex items-center gap-3 p-4 border rounded-lg">
            <div className="flex items-center gap-2">
              {isAuthorized ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <span className="font-medium">
                {isAuthorized ? 'Авторизован' : 'Не авторизован'}
              </span>
            </div>
            
            <Badge variant={isAuthorized ? 'default' : 'destructive'}>
              {isAuthorized ? 'Активно' : 'Неактивно'}
            </Badge>
          </div>

          {userInfo && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">Информация о пользователе:</h4>
              <div className="text-sm space-y-1">
                <p><strong>Логин:</strong> {userInfo.login}</p>
                <p><strong>ID:</strong> {userInfo.id}</p>
                <p><strong>Client ID:</strong> {userInfo.client_id}</p>
                <p><strong>Администратор:</strong> {userInfo.admin ? 'Да' : 'Нет'}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!isAuthorized ? (
              <Button onClick={handleStartOAuth} className="gap-2" disabled={isLoading}>
                <ExternalLink className="h-4 w-4" />
                {isLoading ? 'Авторизация...' : 'Начать OAuth авторизацию'}
              </Button>
            ) : (
              <>
                <Button onClick={testConnection} variant="outline" className="gap-2" disabled={isLoading}>
                  <TestTube className="h-4 w-4" />
                  {isLoading ? 'Тестируем...' : 'Тест подключения'}
                </Button>
                <Button onClick={handleLogout} variant="destructive" className="gap-2">
                  <XCircle className="h-4 w-4" />
                  Отозвать доступ
                </Button>
              </>
            )}
          </div>
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
