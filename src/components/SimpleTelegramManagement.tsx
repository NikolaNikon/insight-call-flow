
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, Trash2, ExternalLink, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegramSession } from '@/hooks/useTelegramSession';
import { TelegramStatusChecker } from '@/components/TelegramStatusChecker';
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

export const SimpleTelegramManagement = () => {
  const [links, setLinks] = useState<TelegramLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingSession, setPendingSession] = useState<PendingSession | null>(null);
  
  const { getTelegramLinks, deactivateTelegramLink } = useTelegramAuth();
  const { startTelegramSession, isGeneratingSession } = useTelegramSession();
  const { toast } = useToast();

  useEffect(() => {
    loadTelegramLinks();
  }, []);

  const loadTelegramLinks = async () => {
    setLoading(true);
    try {
      const data = await getTelegramLinks();
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading telegram links:', error);
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
        window.open(sessionData.telegram_url, '_blank');
      }
    } catch (error: any) {
      console.error('Error connecting bot:', error);
    }
  };

  const handleConnectionComplete = () => {
    setPendingSession(null);
    loadTelegramLinks();
  };

  const isConnected = links.length > 0 && links.some(link => link.active);
  const activeLink = links.find(link => link.active);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Загрузка статуса Telegram...</p>
        </CardContent>
      </Card>
    );
  }

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
      <CardContent className="space-y-6">
        {isConnected ? (
          // Состояние: подключено
          <div className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ✅ Telegram успешно подключен к вашему аккаунту CallControl
              </AlertDescription>
            </Alert>
            
            {activeLink && (
              <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200">
                <div className="flex items-center gap-3">
                  <Bot className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">
                      {activeLink.first_name || 'Telegram User'}
                      {activeLink.telegram_username && (
                        <span className="text-gray-500 ml-2">
                          @{activeLink.telegram_username}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Подключен {new Date(activeLink.created_at).toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-700">
                    Активен
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeactivate(activeLink.id)}
                  >
                    Отключить
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : pendingSession ? (
          // Состояние: ожидание подключения
          <div className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Bot className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                💬 Как только вы нажмёте START в Telegram, подключение завершится автоматически.
                Если ничего не происходит — проверьте, не заблокирован ли бот.
              </AlertDescription>
            </Alert>

            <TelegramStatusChecker 
              sessionCode={pendingSession.session_code}
              onConnected={handleConnectionComplete}
              pollingEnabled={true}
            />

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
                onClick={() => setPendingSession(null)}
                variant="ghost"
                size="sm"
              >
                Отменить
              </Button>
            </div>
          </div>
        ) : (
          // Состояние: не подключено
          <div className="space-y-4">
            <Alert className="border-gray-200 bg-gray-50">
              <XCircle className="h-4 w-4 text-gray-600" />
              <AlertDescription className="text-gray-700">
                🔌 Telegram не подключен к вашему аккаунту CallControl
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleConnectBot} 
              disabled={isGeneratingSession}
              className="w-full flex items-center gap-2"
            >
              {isGeneratingSession && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGeneratingSession ? 'Генерация ссылки...' : 'Подключить Telegram бот'}
            </Button>
          </div>
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
