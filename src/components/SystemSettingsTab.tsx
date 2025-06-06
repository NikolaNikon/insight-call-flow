
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Bell } from 'lucide-react';

export const SystemSettingsTab = () => {
  const [systemSettings, setSystemSettings] = useState({
    autoAnalysis: true,
    emailNotifications: true,
    telegramNotifications: true,
    dataRetention: "6",
    apiEnabled: true,
    backupEnabled: true
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <SettingsIcon className="h-5 w-5" />
            Системные настройки
          </CardTitle>
          <CardDescription>
            Основные параметры работы системы
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-analysis" className="text-sm font-semibold text-graphite">
                Автоматический анализ звонков
              </Label>
              <p className="text-sm text-gray-500">
                Включить автоматическую обработку новых записей
              </p>
            </div>
            <Switch 
              id="auto-analysis"
              checked={systemSettings.autoAnalysis}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, autoAnalysis: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="backup" className="text-sm font-semibold text-graphite">
                Автоматическое резервное копирование
              </Label>
              <p className="text-sm text-gray-500">
                Ежедневное создание резервных копий данных
              </p>
            </div>
            <Switch 
              id="backup"
              checked={systemSettings.backupEnabled}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, backupEnabled: checked }))
              }
            />
          </div>

          <div>
            <Label htmlFor="retention" className="text-sm font-semibold text-graphite mb-2 block">
              Срок хранения данных (месяцы)
            </Label>
            <Select 
              value={systemSettings.dataRetention} 
              onValueChange={(value) => 
                setSystemSettings(prev => ({ ...prev, dataRetention: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 месяца</SelectItem>
                <SelectItem value="6">6 месяцев</SelectItem>
                <SelectItem value="12">12 месяцев</SelectItem>
                <SelectItem value="24">24 месяца</SelectItem>
                <SelectItem value="unlimited">Без ограничений</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <Bell className="h-5 w-5" />
            Уведомления
          </CardTitle>
          <CardDescription>
            Настройка каналов уведомлений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notifications" className="text-sm font-semibold text-graphite">
                Email уведомления
              </Label>
              <p className="text-sm text-gray-500">
                Отправка отчетов и уведомлений по email
              </p>
            </div>
            <Switch 
              id="email-notifications"
              checked={systemSettings.emailNotifications}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="telegram-notifications" className="text-sm font-semibold text-graphite">
                Telegram уведомления
              </Label>
              <p className="text-sm text-gray-500">
                Отправка уведомлений через Telegram бота
              </p>
            </div>
            <Switch 
              id="telegram-notifications"
              checked={systemSettings.telegramNotifications}
              onCheckedChange={(checked) => 
                setSystemSettings(prev => ({ ...prev, telegramNotifications: checked }))
              }
            />
          </div>

          <div>
            <Label htmlFor="email-server" className="text-sm font-semibold text-graphite mb-2 block">
              SMTP сервер
            </Label>
            <Input 
              id="email-server"
              placeholder="smtp.example.com"
              className="mb-2"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Логин" />
              <Input type="password" placeholder="Пароль" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
