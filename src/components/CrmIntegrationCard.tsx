
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Database } from 'lucide-react';

export const CrmIntegrationCard = () => {
  return (
    <div className="relative">
      <Card className="bg-white border-0 shadow-sm blur-sm pointer-events-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <Database className="h-5 w-5" />
            CRM интеграция
          </CardTitle>
          <CardDescription>
            Подключение к внешней CRM системе
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="crm-url" className="text-sm font-semibold text-graphite mb-2 block">
              URL API
            </Label>
            <Input 
              id="crm-url"
              placeholder="https://api.crm.example.com"
            />
          </div>
          <div>
            <Label htmlFor="api-key" className="text-sm font-semibold text-graphite mb-2 block">
              API ключ
            </Label>
            <Input 
              id="api-key"
              type="password"
              placeholder="your-api-key"
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="sync-enabled" className="text-sm font-semibold text-graphite">
              Автоматическая синхронизация
            </Label>
            <Switch id="sync-enabled" />
          </div>
          <Button className="w-full bg-primary hover:bg-primary/90">
            Тестировать соединение
          </Button>
        </CardContent>
      </Card>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-lg border shadow-sm">
          <span className="text-lg font-semibold text-gray-600">Soon</span>
        </div>
      </div>
    </div>
  );
};
