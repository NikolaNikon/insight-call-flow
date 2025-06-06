
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bot, HelpCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramTest } from '@/hooks/useTelegramTest';

export const TelegramIntegrationCard = () => {
  const { toast } = useToast();
  const { testConnection, isLoading: isTelegramTesting } = useTelegramTest();
  
  const [telegramSettings, setTelegramSettings] = useState({
    botToken: localStorage.getItem('telegram_bot_token') || '',
    chatId: localStorage.getItem('telegram_chat_id') || ''
  });

  const handleSaveTelegramSettings = () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      toast({
        title: "Ошибка",
        description: "Заполните токен бота и ID чата",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem('telegram_bot_token', telegramSettings.botToken);
    localStorage.setItem('telegram_chat_id', telegramSettings.chatId);

    toast({
      title: "Настройки сохранены",
      description: "Конфигурация Telegram бота сохранена",
    });
  };

  const handleTestTelegramConnection = async () => {
    const success = await testConnection(telegramSettings.botToken, telegramSettings.chatId);
    if (success) {
      handleSaveTelegramSettings();
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-graphite">
          <Bot className="h-5 w-5" />
          Telegram бот
        </CardTitle>
        <CardDescription>
          Настройка интеграции с Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="bot-token" className="text-sm font-semibold text-graphite mb-2 block">
            Токен бота
          </Label>
          <Input 
            id="bot-token"
            type="password"
            placeholder="1234567890:ABCdefGHIjklmnoPQRstuvwxyz"
            value={telegramSettings.botToken}
            onChange={(e) => setTelegramSettings(prev => ({ ...prev, botToken: e.target.value }))}
          />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Label htmlFor="chat-id" className="text-sm font-semibold text-graphite">
              ID чата для уведомлений
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Для получения ID чата:<br />
                    1. Добавьте бота @userinfobot в Telegram<br />
                    2. Отправьте ему любое сообщение<br />
                    3. Скопируйте ID из ответа
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input 
            id="chat-id"
            placeholder="-1001234567890"
            value={telegramSettings.chatId}
            onChange={(e) => setTelegramSettings(prev => ({ ...prev, chatId: e.target.value }))}
          />
        </div>
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={handleTestTelegramConnection}
          disabled={isTelegramTesting}
        >
          {isTelegramTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isTelegramTesting ? 'Тестируем подключение...' : 'Проверить подключение'}
        </Button>
      </CardContent>
    </Card>
  );
};
