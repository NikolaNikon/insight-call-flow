
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, Save, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initTelfinAPI } from '@/services/telfinApi';
import { useTelfinIntegration } from '@/hooks/useTelfinIntegration';

export const TelfinSettings = () => {
  const [config, setConfig] = useState({
    hostname: localStorage.getItem('telfin_hostname') || '',
    username: localStorage.getItem('telfin_username') || '',
    password: localStorage.getItem('telfin_password') || ''
  });
  const [testClientId, setTestClientId] = useState('');
  const [testRecordUuid, setTestRecordUuid] = useState('');
  
  const { toast } = useToast();
  const { isLoading, getAudioUrl } = useTelfinIntegration();

  const handleSaveConfig = () => {
    if (!config.hostname || !config.username || !config.password) {
      toast({
        title: "Ошибка конфигурации",
        description: "Заполните все поля для настройки Телфин API",
        variant: "destructive"
      });
      return;
    }

    // Сохраняем конфигурацию в localStorage
    localStorage.setItem('telfin_hostname', config.hostname);
    localStorage.setItem('telfin_username', config.username);
    localStorage.setItem('telfin_password', config.password);

    // Инициализируем API
    initTelfinAPI(config);

    toast({
      title: "Настройки сохранены",
      description: "Конфигурация Телфин API успешно сохранена",
    });
  };

  const handleTestConnection = async () => {
    if (!testClientId || !testRecordUuid) {
      toast({
        title: "Ошибка тестирования",
        description: "Заполните ID клиента и UUID записи для тестирования",
        variant: "destructive"
      });
      return;
    }

    if (!config.hostname) {
      toast({
        title: "Ошибка тестирования",
        description: "Сначала сохраните настройки Телфин API",
        variant: "destructive"
      });
      return;
    }

    const audioUrl = await getAudioUrl(testClientId, testRecordUuid);
    if (audioUrl) {
      toast({
        title: "Тест прошел успешно",
        description: "Подключение к Телфин API работает корректно",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-blue-600" />
          Настройки интеграции Телфин
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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
        </div>

        <Button onClick={handleSaveConfig} className="gap-2">
          <Save className="h-4 w-4" />
          Сохранить настройки
        </Button>

        <div className="border-t pt-6">
          <h3 className="font-medium mb-4">Тестирование подключения</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <Label htmlFor="test-client-id">ID клиента (для теста)</Label>
              <Input
                id="test-client-id"
                placeholder="client_id"
                value={testClientId}
                onChange={(e) => setTestClientId(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="test-record-uuid">UUID записи (для теста)</Label>
              <Input
                id="test-record-uuid"
                placeholder="record_uuid"
                value={testRecordUuid}
                onChange={(e) => setTestRecordUuid(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleTestConnection} 
            variant="outline" 
            className="gap-2"
            disabled={isLoading}
          >
            <TestTube className="h-4 w-4" />
            {isLoading ? 'Тестируем...' : 'Тест подключения'}
          </Button>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Информация:</strong> Настройки сохраняются в локальном хранилище браузера. 
          Для безопасности рекомендуется использовать Supabase Edge Functions для хранения 
          конфиденциальных данных в production среде.
        </div>
      </CardContent>
    </Card>
  );
};
