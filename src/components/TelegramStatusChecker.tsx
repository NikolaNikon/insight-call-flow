
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  RefreshCw,
  MessageSquare,
  User,
  Loader2
} from 'lucide-react';

interface TelegramStatusResponse {
  connected: boolean;
  username?: string;
  first_name?: string;
  role?: string;
  chat_id?: number;
  active?: boolean;
}

interface TelegramStatusCheckerProps {
  sessionCode?: string;
  onConnected?: (data: TelegramStatusResponse) => void;
  pollingEnabled?: boolean;
}

export const TelegramStatusChecker: React.FC<TelegramStatusCheckerProps> = ({
  sessionCode,
  onConnected,
  pollingEnabled = false
}) => {
  const [isPolling, setIsPolling] = useState(pollingEnabled);

  // Query для проверки статуса сессии
  const { data: sessionStatus, isLoading, error, refetch } = useQuery({
    queryKey: ['telegram-session-status', sessionCode],
    queryFn: async () => {
      if (!sessionCode) return null;
      
      const { data, error } = await supabase.functions.invoke('telegram-session-status', {
        body: { session_code: sessionCode }
      });

      if (error) throw error;
      return data as TelegramStatusResponse;
    },
    enabled: !!sessionCode,
    refetchInterval: isPolling ? 3000 : false, // Poll every 3 seconds when enabled
    refetchIntervalInBackground: false
  });

  // Query для проверки активных подключений
  const { data: activeConnections, refetch: refetchConnections } = useQuery({
    queryKey: ['telegram-active-connections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_links')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      return data;
    },
    refetchInterval: isPolling ? 5000 : false
  });

  useEffect(() => {
    if (sessionStatus?.connected && onConnected) {
      onConnected(sessionStatus);
      setIsPolling(false); // Stop polling when connected
    }
  }, [sessionStatus, onConnected]);

  const startPolling = () => setIsPolling(true);
  const stopPolling = () => setIsPolling(false);

  const manualRefresh = () => {
    refetch();
    refetchConnections();
  };

  if (!sessionCode && !activeConnections?.length) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Нет активной сессии или подключений для отслеживания
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Session Status */}
      {sessionCode && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Статус сессии: {sessionCode}
              </h4>
              <div className="flex items-center gap-2">
                {isPolling && (
                  <Badge variant="outline" className="text-blue-600 border-blue-200">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Отслеживается
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={manualRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {isLoading && !sessionStatus && (
              <div className="flex items-center gap-2 text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Проверка статуса...
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Ошибка при проверке статуса: {error.message}
                </AlertDescription>
              </Alert>
            )}

            {sessionStatus && (
              <div className="space-y-3">
                {sessionStatus.connected ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Подключено!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-700">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Ожидание подключения...</span>
                  </div>
                )}

                {sessionStatus.connected && sessionStatus.username && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Username:</span>
                      <br />
                      <span className="font-medium">@{sessionStatus.username}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Имя:</span>
                      <br />
                      <span className="font-medium">{sessionStatus.first_name || 'Не указано'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Роль:</span>
                      <br />
                      <Badge variant="outline">{sessionStatus.role || 'Неизвестно'}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-500">Chat ID:</span>
                      <br />
                      <span className="font-mono text-xs">{sessionStatus.chat_id}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {sessionCode && !sessionStatus?.connected && (
              <div className="mt-3">
                <div className="flex gap-2">
                  {!isPolling ? (
                    <Button variant="outline" size="sm" onClick={startPolling}>
                      Начать отслеживание
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={stopPolling}>
                      Остановить отслеживание
                    </Button>
                  )}
                </div>
                
                <Alert className="mt-3 border-blue-200 bg-blue-50">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    💬 Как только вы нажмёте START в Telegram, подключение завершится автоматически.
                    Если ничего не происходит — проверьте, не заблокирован ли бот.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Connections */}
      {activeConnections && activeConnections.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium flex items-center gap-2 mb-3">
              <User className="h-4 w-4" />
              Активные подключения ({activeConnections.length})
            </h4>
            
            <div className="space-y-3">
              {activeConnections.map((connection: any) => (
                <div key={connection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <div className="font-medium">
                        {connection.first_name || 'Telegram User'}
                        {connection.telegram_username && (
                          <span className="text-gray-500 ml-2">
                            @{connection.telegram_username}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Подключен {new Date(connection.created_at).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-700">
                    Активен
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
