
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, Trash2, ExternalLink, Loader2, Clock, RefreshCw } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegramSession } from '@/hooks/useTelegramSession';
import { useToast } from '@/hooks/use-toast';

interface TelegramLink {
  id: string;
  chat_id: number;
  telegram_username?: string;
  first_name?: string;
  created_at: string;
  active: boolean;
}

interface PendingSession {
  session_code: string;
  telegram_url: string;
  expires_at: string;
}

export const TelegramManagement = () => {
  const [links, setLinks] = useState<TelegramLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const { getTelegramLinks, deactivateTelegramLink } = useTelegramAuth();
  const { startTelegramSession, checkSessionStatus, isGeneratingSession } = useTelegramSession();
  const { toast } = useToast();

  useEffect(() => {
    loadTelegramLinks();
  }, []);

  // Таймер для отслеживания времени жизни сессии
  useEffect(() => {
    if (!pendingSession) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(pendingSession.expires_at);
      const now = new Date();
      const secondsLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      
      setTimeLeft(secondsLeft);
      
      if (secondsLeft <= 0) {
        setPendingSession(null);
        toast({
          title: "Время истекло",
          description: "Сессия подключения истекла. Попробуйте еще раз.",
          variant: "destructive"
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingSession, toast]);

  // Проверка статуса сессии
  useEffect(() => {
    if (!pendingSession) return;

    const checkInterval = setInterval(async () => {
      try {
        const status = await checkSessionStatus(pendingSession.session_code);
        
        if (status.used) {
          setPendingSession(null);
          await loadTelegramLinks();
          toast({
            title: "Успешно подключено!",
            description: "Telegram бот успешно подключен к вашему аккаунту",
          });
        } else if (status.expired) {
          setPendingSession(null);
          toast({
            title: "Сессия истекла",
            description: "Время подключения истекло",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [pendingSession, checkSessionStatus, toast]);

  const loadTelegramLinks = async () => {
    setLoading(true);
    try {
      const data = await getTelegramLinks();
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading telegram links:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список подключений",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (linkId: string) => {
    const success = await deactivateTelegramLink(linkId);
    if (success) {
      await loadTelegramLinks();
    }
  };

  const handleConnectBot = async () => {
    try {
      const sessionData = await startTelegramSession();
      if (sessionData && sessionData.success) {
        setPendingSession({
          session_code: sessionData.session_code!,
          telegram_url: sessionData.telegram_url!,
          expires_at: sessionData.expires_at!
        });
        
        // Автоматически открываем ссылку на Telegram
        window.open(sessionData.telegram_url, '_blank');
      }
    } catch (error) {
      console.error('Error connecting bot:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Telegram уведомления
        </CardTitle>
        <CardDescription>
          Управление подключениями к Telegram боту для получения уведомлений
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-pulse text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загрузка...
            </div>
          </div>
        ) : (
          <>
            {/* Активные подключения */}
            {links.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-gray-700">Активные подключения:</h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadTelegramLinks}
                    disabled={loading}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div>
                        <div className="font-medium">
                          {link.first_name || 'Telegram User'}
                          {link.telegram_username && (
                            <span className="text-gray-500 ml-2">
                              @{link.telegram_username}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          Подключен {new Date(link.created_at).toLocaleDateString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={link.active ? "default" : "secondary"}>
                        {link.active ? "Активен" : "Отключен"}
                      </Badge>
                      {link.active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeactivate(link.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Ожидающая сессия */}
            {pendingSession && (
              <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Ожидание подключения</span>
                  <Badge variant="outline" className="text-blue-700 border-blue-300">
                    {formatTime(timeLeft)}
                  </Badge>
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  Перейдите в Telegram и нажмите "START" для завершения подключения
                </p>
                <Button
                  onClick={() => window.open(pendingSession.telegram_url, '_blank')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Открыть бота в Telegram
                </Button>
              </div>
            )}

            {/* Кнопка подключения */}
            <Button 
              onClick={handleConnectBot} 
              disabled={isGeneratingSession || !!pendingSession}
              className="w-full flex items-center gap-2"
            >
              {isGeneratingSession && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGeneratingSession 
                ? 'Генерация ссылки...' 
                : pendingSession 
                  ? 'Ожидание подключения...'
                  : 'Подключить Telegram бот'
              }
            </Button>
          </>
        )}

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Как это работает:</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
            <li>Нажмите "Подключить Telegram бот"</li>
            <li>Автоматически откроется чат с ботом</li>
            <li>Нажмите "START" в боте</li>
            <li>Подключение будет активировано автоматически</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
