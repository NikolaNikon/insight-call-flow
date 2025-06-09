
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Bot, Send, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramTest } from '@/hooks/useTelegramTest';

interface OnboardingStepTelegramProps {
  onComplete: () => void;
  isCompleted: boolean;
}

export const OnboardingStepTelegram = ({ onComplete, isCompleted }: OnboardingStepTelegramProps) => {
  const [telegramSettings, setTelegramSettings] = useState({
    botToken: localStorage.getItem('telegram_bot_token') || '',
    chatId: localStorage.getItem('telegram_chat_id') || ''
  });
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>(
    isCompleted ? 'success' : 'idle'
  );
  
  const { toast } = useToast();
  const { testConnection, isLoading } = useTelegramTest();

  const handleTestConnection = async () => {
    if (!telegramSettings.botToken || !telegramSettings.chatId) {
      toast({
        title: "Заполните все поля",
        description: "Для тестирования нужны токен бота и ID чата",
        variant: "destructive"
      });
      return;
    }

    setConnectionStatus('testing');
    
    const success = await testConnection(telegramSettings.botToken, telegramSettings.chatId);
    
    if (success) {
      setConnectionStatus('success');
      localStorage.setItem('telegram_bot_token', telegramSettings.botToken);
      localStorage.setItem('telegram_chat_id', telegramSettings.chatId);
      onComplete();
    } else {
      setConnectionStatus('error');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Скопировано",
      description: "Текст скопирован в буфер обмена",
    });
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
          <h3 className="text-lg font-medium">Настройка Telegram-бота</h3>
          <p className="text-sm text-gray-600">
            Получайте мгновенные уведомления о звонках
          </p>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Создание бота</CardTitle>
            <CardDescription>
              Пошаговая инструкция
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                <div>
                  <p className="font-medium">Найдите @BotFather в Telegram</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-blue-600"
                    onClick={() => window.open('https://t.me/BotFather', '_blank')}
                  >
                    Открыть @BotFather
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                <div>
                  <p className="font-medium">Отправьте команду:</p>
                  <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs flex items-center justify-between">
                    <span>/newbot</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => copyToClipboard('/newbot')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                <div>
                  <p className="font-medium">Введите имя бота:</p>
                  <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                    CallControl Bot
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                <div>
                  <p className="font-medium">Введите username:</p>
                  <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                    callcontrol_your_company_bot
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</span>
                <p>Скопируйте токен из сообщения BotFather</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Настройки</CardTitle>
            <CardDescription>
              Введите данные вашего бота
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="bot-token">Токен бота</Label>
              <Input
                id="bot-token"
                type="password"
                placeholder="1234567890:ABCdefGHIjklmnoPQRstuvwxyz"
                value={telegramSettings.botToken}
                onChange={(e) => setTelegramSettings(prev => ({ ...prev, botToken: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="chat-id">ID чата</Label>
              <Input
                id="chat-id"
                placeholder="-1001234567890 или @username"
                value={telegramSettings.chatId}
                onChange={(e) => setTelegramSettings(prev => ({ ...prev, chatId: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Для получения ID чата отправьте /start боту @userinfobot
              </p>
            </div>

            <Button 
              onClick={handleTestConnection}
              className="w-full"
              disabled={isLoading || !telegramSettings.botToken || !telegramSettings.chatId}
            >
              <Send className="mr-2 h-4 w-4" />
              {isLoading ? 'Отправляем тест...' : 'Отправить тестовое сообщение'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="bg-green-50 p-4 rounded-lg">
        <div className="flex items-start gap-3">
          <Bot className="text-green-600 mt-1 h-5 w-5" />
          <div className="text-sm">
            <p className="font-medium text-green-900 mb-1">Что даёт Telegram-бот?</p>
            <ul className="text-green-700 space-y-1">
              <li>• Мгновенные уведомления о новых звонках</li>
              <li>• Алерты при обнаружении проблем в разговоре</li>
              <li>• Еженедельные отчёты по команде</li>
              <li>• Возможность быстро прослушать запись</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
