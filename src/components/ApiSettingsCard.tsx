
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Key } from 'lucide-react';

export const ApiSettingsCard = () => {
  const [systemSettings, setSystemSettings] = useState({
    apiEnabled: true
  });

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-graphite">
          <Key className="h-5 w-5" />
          API настройки
        </CardTitle>
        <CardDescription>
          Конфигурация API для анализа звонков
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="ai-api-url" className="text-sm font-semibold text-graphite mb-2 block">
            URL API анализа
          </Label>
          <Input 
            id="ai-api-url"
            placeholder="https://api.ai-service.com"
          />
        </div>
        <div>
          <Label htmlFor="ai-api-key" className="text-sm font-semibold text-graphite mb-2 block">
            API ключ
          </Label>
          <Input 
            id="ai-api-key"
            type="password"
            placeholder="your-ai-api-key"
          />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="api-enabled" className="text-sm font-semibold text-graphite">
              API включен
            </Label>
            <p className="text-sm text-gray-500">
              Разрешить внешний доступ к API
            </p>
          </div>
          <Switch 
            id="api-enabled"
            checked={systemSettings.apiEnabled}
            onCheckedChange={(checked) => 
              setSystemSettings(prev => ({ ...prev, apiEnabled: checked }))
            }
          />
        </div>
        <Button className="w-full bg-primary hover:bg-primary/90">
          Проверить API
        </Button>
      </CardContent>
    </Card>
  );
};
