
import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bot, CheckCircle, User, Calendar, Loader2, ExternalLink } from 'lucide-react';
import { useTelegramAuth } from '@/hooks/useTelegramAuth';
import { useTelegramSession } from '@/hooks/useTelegramSession';
import { useToast } from '@/hooks/use-toast';
import { useUserRole } from '@/hooks/useUserRole';

interface TelegramConnectionData {
  connected: boolean;
  first_name?: string;
  username?: string;
  connected_at?: string;
  role?: string;
  user_name?: string;
}

interface TelegramLink {
  id: string;
  chat_id: number;
  telegram_username?: string;
  first_name?: string;
  created_at: string;
  active: boolean;
}

export const ImprovedTelegramIntegration = () => {
  const [connectionData, setConnectionData] = useState<TelegramConnectionData>({ connected: false });
  const [loading, setLoading] = useState(true);
  const [pendingSession, setPendingSession] = useState<{
    session_code: string;
    telegram_url: string;
  } | null>(null);

  const { getTelegramLinks, deactivateTelegramLink } = useTelegramAuth();
  const { startTelegramSession, isGeneratingSession } = useTelegramSession();
  const { toast } = useToast();
  const { userRole } = useUserRole();

  useEffect(() => {
    loadConnectionStatus();
  }, []);

  const loadConnectionStatus = async () => {
    setLoading(true);
    try {
      const links = await getTelegramLinks();
      if (links && links.length > 0) {
        const activeLink = links.find((link: TelegramLink) => link.active) || links[0];
        setConnectionData({
          connected: true,
          first_name: activeLink.first_name || 'Пользователь',
          username: activeLink.telegram_username,
          connected_at: activeLink.created_at,
          role: userRole || 'operator'
        });
      } else {
        setConnectionData({ connected: false });
      }
    } catch (error) {
      console.error('Error loading connection status:', error);
      setConnectionData({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const sessionData = await startTelegramSession();
      if (sessionData && sessionData.success) {
        setPendingSession({
          session_code: sessionData.session_code!,
          telegram_url: sessionData.telegram_url!
        });
        
        // Автоматически открываем Telegram
        window.open(sessionData.telegram_url, '_blank');
        
        toast({
          title: "📱 Переходите в Telegram",
          description: "Нажмите 'START' в боте для завершения подключения",
        });
      }
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      const links = await getTelegramLinks();
      if (links && links.length > 0) {
        const activeLink = links.find((link: TelegramLink) => link.active);
        if (activeLink) {
          const success = await deactivateTelegramLink(activeLink.id);
          if (success) {
            setConnectionData({ connected: false });
            toast({
              title: "✅ Отключено",
              description: "Telegram уведомления отключены",
            });
          }
        }
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      admin: 'Администратор',
      superadmin: 'Суперадмин',
      operator: 'Оператор',
      viewer: 'Наблюдатель',
      manager: 'Менеджер'
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загрузка статуса подключения...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {connectionData.connected ? (
        // Connected State
        <div className="space-y-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              ✅ Telegram подключён к вашему аккаунту CallControl
            </AlertDescription>
          </Alert>

          <Card className="border-green-200 bg-green-50/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium">
                  {connectionData.first_name}
                  {connectionData.username && (
                    <span className="text-gray-600 ml-1">(@{connectionData.username})</span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  Подключено: {connectionData.connected_at && formatDate(connectionData.connected_at)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                  🟢 Статус: Активен
                </Badge>
                {connectionData.role && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                    {getRoleDisplayName(connectionData.role)}
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              📬 Вы будете получать:
            </h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>– Уведомления о звонках и рисках</li>
              <li>– Отчёты по эффективности команды</li>
              <li>– Важные системные сообщения</li>
            </ul>
          </div>

          <Button 
            onClick={handleDisconnect}
            variant="outline" 
            className="w-full border-red-300 text-red-700 hover:bg-red-50"
          >
            🔌 Отключить Telegram
          </Button>
        </div>
      ) : pendingSession ? (
        // Pending Connection State
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <Bot className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              💬 Завершите подключение в Telegram, нажав кнопку "START"
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => window.open(pendingSession.telegram_url, '_blank')}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Открыть бота в Telegram
          </Button>

          <Button
            onClick={() => setPendingSession(null)}
            variant="ghost"
            className="w-full"
          >
            Отменить
          </Button>
        </div>
      ) : (
        // Not Connected State
        <div className="space-y-4">
          <Alert className="border-gray-200 bg-gray-50">
            <Bot className="h-4 w-4 text-gray-600" />
            <AlertDescription className="text-gray-700">
              🔌 Telegram не подключён к вашему аккаунту CallControl
            </AlertDescription>
          </Alert>

          <Button 
            onClick={handleConnect}
            disabled={isGeneratingSession}
            className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {isGeneratingSession && <Loader2 className="h-4 w-4 animate-spin" />}
            {isGeneratingSession ? 'Генерация ссылки...' : 'Подключить Telegram бот'}
          </Button>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Что вы получите:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Уведомления о новых звонках</li>
              <li>• Еженедельные отчёты по эффективности</li>
              <li>• Важные системные сообщения</li>
              <li>• Алерты по критичным ситуациям</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
