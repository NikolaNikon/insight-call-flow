
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, Loader2 } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegramSession } from '@/hooks/useTelegramSession';
import { useTelegramSessionTimeout } from '@/hooks/useTelegramSessionTimeout';
import { useTelegramConnectionAttempts } from '@/hooks/useTelegramConnectionAttempts';
import { TelegramConnectionStatus } from '@/components/telegram/TelegramConnectionStatus';
import { TelegramActiveConnections } from '@/components/telegram/TelegramActiveConnections';
import { TelegramPendingSession } from '@/components/telegram/TelegramPendingSession';
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
  
  const { getTelegramLinks, deactivateTelegramLink } = useTelegramAuth();
  const { startTelegramSession, checkSessionStatus, isGeneratingSession } = useTelegramSession();
  const { toast } = useToast();

  const {
    connectionAttempts,
    error,
    canAttemptConnection,
    handleSessionTimeout: onTimeout,
    handleSuccessfulConnection: onSuccess,
    incrementAttempts,
    resetError,
    setError
  } = useTelegramConnectionAttempts();

  const handleSessionTimeout = () => {
    setPendingSession(null);
    onTimeout();
  };

  const handleSuccessfulConnection = async () => {
    setPendingSession(null);
    onSuccess();
    await loadTelegramLinks();
    
    toast({
      title: "🎉 Успешно подключено!",
      description: "Telegram бот успешно подключен к вашему аккаунту",
    });
  };

  const { timeLeft, showTimeoutWarning, resetWarning } = useTelegramSessionTimeout({
    pendingSession,
    checkSessionStatus,
    onSessionTimeout: handleSessionTimeout,
    onSuccessfulConnection: handleSuccessfulConnection
  });

  useEffect(() => {
    loadTelegramLinks();
  }, []);

  const loadTelegramLinks = async () => {
    setLoading(true);
    resetError();
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
      resetError();
      resetWarning();
      
      // Проверяем лимит попыток
      if (!canAttemptConnection) {
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
      incrementAttempts();
    }
  };

  const handleCancelPendingSession = () => {
    setPendingSession(null);
    resetWarning();
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
        <TelegramConnectionStatus
          isConnected={links.length > 0}
          isPending={!!pendingSession}
          error={error}
          showTimeoutWarning={showTimeoutWarning}
        />

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-pulse text-gray-500 flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загрузка...
            </div>
          </div>
        ) : (
          <>
            <TelegramActiveConnections
              links={links}
              onDeactivate={handleDeactivate}
              onRefresh={loadTelegramLinks}
              loading={loading}
            />

            {pendingSession && (
              <TelegramPendingSession
                pendingSession={pendingSession}
                timeLeft={timeLeft}
                showTimeoutWarning={showTimeoutWarning}
                onCancel={handleCancelPendingSession}
              />
            )}

            {links.length === 0 && !pendingSession && (
              <Button 
                onClick={handleConnectBot} 
                disabled={isGeneratingSession || !canAttemptConnection}
                className="w-full flex items-center gap-2"
              >
                {isGeneratingSession && <Loader2 className="h-4 w-4 animate-spin" />}
                {isGeneratingSession 
                  ? 'Генерация ссылки...' 
                  : !canAttemptConnection
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
