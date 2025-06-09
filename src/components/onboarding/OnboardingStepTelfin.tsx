
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ExternalLink, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelfinIntegration } from '@/hooks/useTelfinIntegration';

interface OnboardingStepTelfinProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export const OnboardingStepTelfin = ({ onComplete, isCompleted }: OnboardingStepTelfinProps) => {
  const [config, setConfig] = useState({
    hostname: localStorage.getItem('telfin_hostname') || '',
    username: localStorage.getItem('telfin_username') || '',
    password: localStorage.getItem('telfin_password') || ''
  });
  const [testData, setTestData] = useState({
    clientId: '',
    recordUuid: ''
  });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  
  const { toast } = useToast();
  const { isLoading, getAudioUrl } = useTelfinIntegration();

  useEffect(() => {
    // Проверяем, есть ли сохранённые настройки
    if (config.hostname && config.username && config.password) {
      setConnectionStatus('success');
      onComplete();
    }
  }, []);

  const handleSaveConfig = () => {
    if (!config.hostname || !config.username || !config.password) {
      toast({
        title: "Заполните все поля",
        description: "Для подключения к Телфин нужны все данные",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('telfin_hostname', config.hostname);
    localStorage.setItem('telfin_username', config.username);
    localStorage.setItem('telfin_password', config.password);

    setConnectionStatus('success');
    onComplete();

    toast({
      title: "Настройки сохранены",
      description: "Конфигурация Телфин успешно сохранена",
    });
  };

  const handleTestConnection = async () => {
    if (!testData.clientId || !testData.recordUuid) {
      toast({
        title: "Заполните тестовые данные",
        description: "Для тестирования нужны ID клиента и UUID записи",
        variant: "destructive"
      });
      return;
    }

    setConnectionStatus('testing');
    
    try {
      const audioUrl = await getAudioUrl(testData.clientId, testData.recordUuid);
      if (audioUrl) {
        setConnectionStatus('success');
        onComplete();
        toast({
          title: "Подключение успешно!",
          description: "Телфин API работает корректно",
        });
      }
    } catch (error) {
      setConnectionStatus('error');
      toast({
        title: "Ошибка подключения",
        description: "Проверьте настройки и тестовые данные",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-4 w-4 mr-1" />Подключено</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-4 w-4 mr-1" />Ошибка</Badge>;
      case 'testing':
        return <Badge variant="outline">Тестируем...</Badge>;
      default:
        return <Badge variant="outline">Не настроено</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">Подключение к Телфин API</h3>
          <p className="text-sm text-gray-600">
            Введите данные для доступа к вашей IP-телефонии
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Настройки подключения</CardTitle>
            <CardDescription>
              Основные параметры для доступа к API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="hostname">Hostname</Label>
              <Input
                id="hostname"
                placeholder="example.telfin.ru"
                value={config.hostname}
                onChange={(e) => setConfig({ ...config, hostname: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                placeholder="username"
                value={config.username}
                onChange={(e) => setConfig({ ...config, username: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                value={config.password}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
              />
            </div>

            <Button 
              onClick={handleSaveConfig} 
              className="w-full"
              disabled={!config.hostname || !config.username || !config.password}
            >
              Сохранить настройки
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Тест подключения</CardTitle>
            <CardDescription>
              Проверьте работу API с реальными данными
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="test-client-id">ID клиента (для теста)</Label>
              <Input
                id="test-client-id"
                placeholder="client_id"
                value={testData.clientId}
                onChange={(e) => setTestData({ ...testData, clientId: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="test-record-uuid">UUID записи (для теста)</Label>
              <Input
                id="test-record-uuid"
                placeholder="record_uuid"
                value={testData.recordUuid}
                onChange={(e) => setTestData({ ...testData, recordUuid: e.target.value })}
              />
            </div>

            <Button 
              onClick={handleTestConnection}
              variant="outline"
              className="w-full"
              disabled={isLoading || !testData.clientId || !testData.recordUuid}
            >
              <TestTube className="mr-2 h-4 w-4" />
              {isLoading ? 'Тестируем...' : 'Проверить подключение'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-1">💡</div>
          <div className="text-sm">
            <p className="font-medium text-blue-900 mb-1">Где найти эти данные?</p>
            <p className="text-blue-700">
              Обратитесь к администратору Телфин за данными для API доступа. 
              Обычно это те же логин и пароль, что используются для входа в панель управления.
            </p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-blue-600 mt-2"
              onClick={() => window.open('https://telfin.ru', '_blank')}
            >
              Документация Телфин <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
