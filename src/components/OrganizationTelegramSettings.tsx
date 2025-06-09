
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bot, Settings, Eye, EyeOff, TestTube, Save } from 'lucide-react';
import { useTelegramSettings } from '@/hooks/useTelegramSettings';
import { useUserRole } from '@/hooks/useUserRole';
import { useOrganization } from '@/hooks/useOrganization';

export const OrganizationTelegramSettings = () => {
  const { isAdmin } = useUserRole();
  const { organization } = useOrganization();
  const { telegramSettings, isLoading, createOrUpdateSettings, testBotConnection } = useTelegramSettings();
  
  const [formData, setFormData] = useState({
    bot_token: telegramSettings?.bot_token || '',
    bot_username: telegramSettings?.bot_username || '',
    webhook_url: telegramSettings?.webhook_url || '',
    is_active: telegramSettings?.is_active ?? true
  });
  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  React.useEffect(() => {
    if (telegramSettings) {
      setFormData({
        bot_token: telegramSettings.bot_token || '',
        bot_username: telegramSettings.bot_username || '',
        webhook_url: telegramSettings.webhook_url || '',
        is_active: telegramSettings.is_active ?? true
      });
    }
  }, [telegramSettings]);

  const handleSave = () => {
    createOrUpdateSettings(formData);
  };

  const handleTest = async () => {
    if (!formData.bot_token) return;
    
    setIsTesting(true);
    await testBotConnection(formData.bot_token);
    setIsTesting(false);
  };

  if (!isAdmin) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-graphite">
            <Bot className="h-5 w-5 text-blue-600" />
            Настройки Telegram бота организации
          </CardTitle>
          <CardDescription>
            У вас нет прав для управления настройками Telegram бота
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-graphite">
          <Bot className="h-5 w-5 text-blue-600" />
          Настройки Telegram бота организации
        </CardTitle>
        <CardDescription>
          Управление Telegram ботом для организации "{organization?.name}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {telegramSettings && (
          <div className="flex items-center gap-2 mb-4">
            <Badge className={telegramSettings.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {telegramSettings.is_active ? 'Активен' : 'Неактивен'}
            </Badge>
            {telegramSettings.bot_username && (
              <Badge variant="outline">@{telegramSettings.bot_username}</Badge>
            )}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="bot_token">Токен бота</Label>
            <div className="flex gap-2">
              <Input
                id="bot_token"
                type={showToken ? "text" : "password"}
                placeholder="1234567890:ABCdefGHIjklMNOpqrSTUvwxyz"
                value={formData.bot_token}
                onChange={(e) => setFormData(prev => ({ ...prev, bot_token: e.target.value }))}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowToken(!showToken)}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTest}
                disabled={isTesting || !formData.bot_token}
              >
                {isTesting ? (
                  <TestTube className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Получите токен у @BotFather в Telegram
            </p>
          </div>

          <div>
            <Label htmlFor="bot_username">Username бота</Label>
            <Input
              id="bot_username"
              placeholder="my_callcontrol_bot"
              value={formData.bot_username}
              onChange={(e) => setFormData(prev => ({ ...prev, bot_username: e.target.value }))}
            />
            <p className="text-sm text-gray-600 mt-1">
              Username бота без символа @
            </p>
          </div>

          <div>
            <Label htmlFor="webhook_url">Webhook URL</Label>
            <Input
              id="webhook_url"
              placeholder="https://your-project.supabase.co/functions/v1/telegram-bot"
              value={formData.webhook_url}
              onChange={(e) => setFormData(prev => ({ ...prev, webhook_url: e.target.value }))}
            />
            <p className="text-sm text-gray-600 mt-1">
              URL для получения обновлений от Telegram
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Активный бот</Label>
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Сохранить настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
