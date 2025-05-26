
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  Users, 
  Shield, 
  Database,
  Bell,
  Mail,
  Plus,
  Edit,
  Trash2,
  Key,
  Bot
} from "lucide-react";

const Settings = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Администратор",
      email: "admin@callcontrol.ru",
      role: "admin",
      status: "active",
      lastLogin: "2024-01-22 14:30"
    },
    {
      id: 2,
      name: "Иванов Иван",
      email: "ivanov@callcontrol.ru", 
      role: "manager",
      status: "active",
      lastLogin: "2024-01-22 12:15"
    },
    {
      id: 3,
      name: "Петров Петр",
      email: "petrov@callcontrol.ru",
      role: "analyst",
      status: "active", 
      lastLogin: "2024-01-21 16:45"
    },
    {
      id: 4,
      name: "Сидоров Семен",
      email: "sidorov@callcontrol.ru",
      role: "manager",
      status: "inactive",
      lastLogin: "2024-01-18 09:20"
    }
  ]);

  const [systemSettings, setSystemSettings] = useState({
    autoAnalysis: true,
    emailNotifications: true,
    telegramNotifications: true,
    dataRetention: "6",
    apiEnabled: true,
    backupEnabled: true
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'analyst': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор';
      case 'manager': return 'Менеджер';
      case 'analyst': return 'Аналитик';
      default: return 'Пользователь';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Настройки</h1>
          <p className="text-gray-600">Управление пользователями, системными настройками и интеграциями</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="system">Система</TabsTrigger>
            <TabsTrigger value="integrations">Интеграции</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Управление пользователями
                    </CardTitle>
                    <CardDescription>
                      Добавление, редактирование и управление доступом пользователей
                    </CardDescription>
                  </div>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Добавить пользователя
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">{user.name}</span>
                          <Badge className={getRoleColor(user.role)}>
                            {getRoleText(user.role)}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status === 'active' ? 'Активный' : 'Неактивный'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>{user.email}</span>
                          <span>Последний вход: {user.lastLogin}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Edit className="h-3 w-3" />
                          Редактировать
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2 text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
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
                      <Label htmlFor="auto-analysis" className="text-sm font-medium">
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
                      <Label htmlFor="backup" className="text-sm font-medium">
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
                    <Label htmlFor="retention" className="text-sm font-medium mb-2 block">
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
                  <CardTitle className="flex items-center gap-2">
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
                      <Label htmlFor="email-notifications" className="text-sm font-medium">
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
                      <Label htmlFor="telegram-notifications" className="text-sm font-medium">
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
                    <Label htmlFor="email-server" className="text-sm font-medium mb-2 block">
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
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    Telegram бот
                  </CardTitle>
                  <CardDescription>
                    Настройка интеграции с Telegram
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bot-token" className="text-sm font-medium mb-2 block">
                      Токен бота
                    </Label>
                    <Input 
                      id="bot-token"
                      type="password"
                      placeholder="1234567890:ABCdefGHIjklmnoPQRstuvwxyz"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chat-id" className="text-sm font-medium mb-2 block">
                      ID чата для уведомлений
                    </Label>
                    <Input 
                      id="chat-id"
                      placeholder="-1001234567890"
                    />
                  </div>
                  <Button className="w-full">
                    Проверить подключение
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    CRM интеграция
                  </CardTitle>
                  <CardDescription>
                    Подключение к внешней CRM системе
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="crm-url" className="text-sm font-medium mb-2 block">
                      URL API
                    </Label>
                    <Input 
                      id="crm-url"
                      placeholder="https://api.crm.example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="api-key" className="text-sm font-medium mb-2 block">
                      API ключ
                    </Label>
                    <Input 
                      id="api-key"
                      type="password"
                      placeholder="your-api-key"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-enabled" className="text-sm font-medium">
                      Автоматическая синхронизация
                    </Label>
                    <Switch id="sync-enabled" />
                  </div>
                  <Button className="w-full">
                    Тестировать соединение
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    API настройки
                  </CardTitle>
                  <CardDescription>
                    Конфигурация API для анализа звонков
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="ai-api-url" className="text-sm font-medium mb-2 block">
                      URL API анализа
                    </Label>
                    <Input 
                      id="ai-api-url"
                      placeholder="https://api.ai-service.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai-api-key" className="text-sm font-medium mb-2 block">
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
                      <Label htmlFor="api-enabled" className="text-sm font-medium">
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
                  <Button className="w-full">
                    Проверить API
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Безопасность и доступ
                </CardTitle>
                <CardDescription>
                  Настройки безопасности и политики доступа
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Политики паролей</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-complexity" className="text-sm font-medium">
                        Сложные пароли
                      </Label>
                      <Switch id="password-complexity" defaultChecked />
                    </div>
                    
                    <div>
                      <Label htmlFor="password-length" className="text-sm font-medium mb-2 block">
                        Минимальная длина пароля
                      </Label>
                      <Select defaultValue="8">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="6">6 символов</SelectItem>
                          <SelectItem value="8">8 символов</SelectItem>
                          <SelectItem value="12">12 символов</SelectItem>
                          <SelectItem value="16">16 символов</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="session-timeout" className="text-sm font-medium mb-2 block">
                        Время сессии (часы)
                      </Label>
                      <Select defaultValue="8">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 час</SelectItem>
                          <SelectItem value="4">4 часа</SelectItem>
                          <SelectItem value="8">8 часов</SelectItem>
                          <SelectItem value="24">24 часа</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Аудит и логирование</h4>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="audit-log" className="text-sm font-medium">
                        Журнал аудита
                      </Label>
                      <Switch id="audit-log" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="failed-login" className="text-sm font-medium">
                        Логировать неудачные входы
                      </Label>
                      <Switch id="failed-login" defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="data-access" className="text-sm font-medium">
                        Логировать доступ к данным
                      </Label>
                      <Switch id="data-access" defaultChecked />
                    </div>

                    <Button variant="outline" className="w-full">
                      Экспорт журнала аудита
                    </Button>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">Двухфакторная аутентификация</h4>
                      <p className="text-sm text-gray-500">
                        Требовать 2FA для всех пользователей
                      </p>
                    </div>
                    <Switch id="two-factor" />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <Button className="w-full">
                    Сохранить настройки безопасности
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
