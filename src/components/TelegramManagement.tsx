import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Trash2, ExternalLink, Loader2, Clock, RefreshCw, AlertCircle, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  
  const { getTelegramLinks, deactivateTelegramLink } = useTelegramAuth();
  const { startTelegramSession, checkSessionStatus, isGeneratingSession } = useTelegramSession();
  const { toast } = useToast();

  const MAX_CONNECTION_ATTEMPTS = 3;
  const TIMEOUT_WARNING_THRESHOLD = 30; // 30 секунд
  const SESSION_TIMEOUT = 600; // 10 минут

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
      
      // Показываем предупреждение о таймауте
      if (secondsLeft <= TIMEOUT_WARNING_THRESHOLD && secondsLeft > 0) {
        setShowTimeoutWarning(true);
      }
      
      if (secondsLeft <= 0) {
        handleSessionTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingSession]);

  // Проверка статуса сессии
  useEffect(() => {
    if (!pendingSession) return;

    const checkInterval = setInterval(async () => {
      try {
        const status = await checkSessionStatus(pendingSession.session_code);
        
        if (status.used) {
          handleSuccessfulConnection();
        } else if (status.expired) {
          handleSessionTimeout();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [pendingSession, checkSessionStatus]);

  const handleSessionTimeout = () => {
    setPendingSession(null);
    setShowTimeoutWarning(false);
    setConnectionAttempts(prev => prev + 1);
    
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS - 1) {
      toast({
        title: "⏰ Время подключения истекло",
        description: `Попробуйте еще раз. Осталось попыток: ${MAX_CONNECTION_ATTEMPTS - connectionAttempts - 1}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "❌ Превышено количество попыток",
        description: "Обратитесь к администратору или попробуйте позже",
        variant: "destructive"
      });
      setError("Превышено максимальное количество попыток подключения");
    }
  };

  const handleSuccessfulConnection = async () => {
    setPendingSession(null);
    setShowTimeoutWarning(false);
    setConnectionAttempts(0);
    setError(null);
    
    await loadTelegramLinks();
    
    toast({
      title: "🎉 Успешно подключено!",
      description: "Telegram бот успешно подключен к вашему аккаунту",
    });
  };

  const loadTelegramLinks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTelegramLinks();
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading telegram links:', error);
      setError('Не удалось загрузить список подключений');
      toast({
        title: "❌ Ошибка загрузки",
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
      toast({
        title: "✅ Отключено",
        description: "Telegram уведомления успешно отключены",
      });
    }
  };

  const handleConnectBot = async () => {
    try {
      setError(null);
      setShowTimeoutWarning(false);
      
      // Проверяем лимит попыток
      if (connectionAttempts >= MAX_CONNECTION_ATTEMPTS) {
        setError("Превышено максимальное количество попыток подключения");
        return;
      }

      // Проверяем существующие подключения
      if (links.length > 0) {
        toast({
          title: "⚠️ Внимание",
          description: "У вас уже есть активное подключение. Отключите его перед созданием нового.",
          variant: "destructive"
        });
        return;
      }

      const sessionData = await startTelegramSession();
      if (sessionData && sessionData.success) {
        setPendingSession({
          session_code: sessionData.session_code!,
          telegram_url: sessionData.telegram_url!,
          expires_at: sessionData.expires_at!
        });
        
        // Автоматически открываем ссылку на Telegram
        const opened = window.open(sessionData.telegram_url, '_blank');
        
        // Проверяем, удалось ли открыть окно
        if (!opened || opened.closed) {
          toast({
            title: "⚠️ Внимание",
            description: "Не удалось автоматически открыть Telegram. Скопируйте ссылку вручную.",
            variant: "destructive"
          });
        }

        // Показываем инструкцию через 3 секунды
        setTimeout(() => {
          if (pendingSession) {
            toast({
              title: "📱 Инструкция",
              description: "Перейдите в Telegram и нажмите кнопку 'START' для завершения подключения",
            });
          }
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error connecting bot:', error);
      setError(error.message || 'Ошибка при подключении бота');
      setConnectionAttempts(prev => prev + 1);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderConnectionStatus = () => {
    if (links.length > 0) {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Telegram успешно подключен к вашему аккаунту CallControl
          </AlertDescription>
        </Alert>
      );
    }

    if (pendingSession) {
      return (
        <Alert className={`${showTimeoutWarning ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'}`}>
          <Clock className={`h-4 w-4 ${showTimeoutWarning ? 'text-yellow-600' : 'text-blue-600'}`} />
          <AlertDescription className={showTimeoutWarning ? 'text-yellow-800' : 'text-blue-800'}>
            {showTimeoutWarning ? (
              <>⏰ Время подключения скоро истечет! Завершите подключение в Telegram.</>
            ) : (
              <>💬 Как только вы нажмёте START в Telegram, подключение завершится автоматически.
              Если ничего не происходит — проверьте, не заблокирован ли бот.</>
            )}
          </AlertDescription>
        </Alert>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert className="border-gray-200 bg-gray-50">
        <Bot className="h-4 w-4 text-gray-600" />
        <AlertDescription className="text-gray-700">
          🔌 Telegram не подключен к вашему аккаунту CallControl
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Telegram уведомления
        </CardTitle>
        <CardDescription>
          Получайте уведомления о звонках и отчёты прямо в Telegram
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderConnectionStatus()}

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
                    className="flex items-center justify-between p-3 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <Bot className="h-4 w-4 text-green-600" />
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
                      <Badge variant={link.active ? "default" : "secondary"} className="bg-green-100 text-green-700">
                        {link.active ? "✅ Активен" : "❌ Отключен"}
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
              <div className={`border-2 rounded-lg p-4 ${
                showTimeoutWarning ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'
              }`}>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className={`h-4 w-4 ${showTimeoutWarning ? 'text-yellow-600' : 'text-blue-600'}`} />
                  <span className={`font-medium ${showTimeoutWarning ? 'text-yellow-900' : 'text-blue-900'}`}>
                    Ожидание подключения
                  </span>
                  <Badge 
                    variant="outline" 
                    className={showTimeoutWarning ? 'text-yellow-700 border-yellow-300' : 'text-blue-700 border-blue-300'}
                  >
                    {formatTime(timeLeft)}
                  </Badge>
                </div>
                <p className={`text-sm mb-3 ${showTimeoutWarning ? 'text-yellow-800' : 'text-blue-800'}`}>
                  {showTimeoutWarning ? (
                    '⏰ Поторопитесь! Перейдите в Telegram и нажмите "START"'
                  ) : (
                    '📱 Перейдите в Telegram и нажмите "START" для завершения подключения'
                  )}
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(pendingSession.telegram_url, '_blank')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Открыть бота в Telegram
                  </Button>
                  <Button
                    onClick={() => {
                      setPendingSession(null);
                      setShowTimeoutWarning(false);
                    }}
                    variant="ghost"
                    size="sm"
                  >
                    Отменить
                  </Button>
                </div>
              </div>
            )}

            {/* Кнопка подключения */}
            {links.length === 0 && !pendingSession && (
              <Button 
                onClick={handleConnectBot} 
                disabled={isGeneratingSession || connectionAttempts >= MAX_CONNECTION_ATTEMPTS}
                className="w-full flex items-center gap-2"
              >
                {isGeneratingSession && <Loader2 className="h-4 w-4 animate-spin" />}
                {isGeneratingSession 
                  ? 'Генерация ссылки...' 
                  : connectionAttempts >= MAX_CONNECTION_ATTEMPTS
                    ? 'Превышен лимит попыток'
                    : 'Подключить Telegram бот'
                }
              </Button>
            )}
          </>
        )}

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Что вы получите:</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Уведомления о новых звонках</li>
            <li>Еженедельные отчёты по эффективности</li>
            <li>Важные системные сообщения</li>
            <li>Алерты по критичным ситуациям</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
