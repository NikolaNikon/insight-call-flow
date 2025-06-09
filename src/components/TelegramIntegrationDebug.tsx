
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bug, 
  Search, 
  Database, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { TelegramStatusChecker } from '@/components/TelegramStatusChecker';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const TelegramIntegrationDebug = () => {
  const [sessionCode, setSessionCode] = useState('');
  const [chatId, setChatId] = useState('');

  // Query для проверки сессий
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ['telegram-sessions-debug'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  // Query для проверки подключений
  const { data: links, refetch: refetchLinks } = useQuery({
    queryKey: ['telegram-links-debug'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('telegram_links')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string | boolean, type: 'session' | 'link') => {
    if (type === 'session') {
      const used = status as boolean;
      return used ? (
        <Badge variant="outline" className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Использована
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-700">
          <Clock className="h-3 w-3 mr-1" />
          Активна
        </Badge>
      );
    } else {
      const active = status as boolean;
      return active ? (
        <Badge variant="outline" className="bg-green-100 text-green-700">
          <CheckCircle className="h-3 w-3 mr-1" />
          Активна
        </Badge>
      ) : (
        <Badge variant="outline" className="bg-red-100 text-red-700">
          <XCircle className="h-3 w-3 mr-1" />
          Неактивна
        </Badge>
      );
    }
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Отладка Telegram интеграции
          </CardTitle>
          <CardDescription>
            Инструменты для диагностики и тестирования подключений
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Эта панель предназначена для разработчиков и тестирования функций.
              Здесь отображается техническая информация о состоянии интеграции.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Проверить статус сессии</label>
              <div className="flex gap-2">
                <Input
                  placeholder="tg_ABC123..."
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value)}
                />
                <Button 
                  variant="outline"
                  onClick={() => refetchSessions()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Поиск по Chat ID</label>
              <div className="flex gap-2">
                <Input
                  placeholder="123456789"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                />
                <Button 
                  variant="outline"
                  onClick={() => refetchLinks()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Checker */}
      {sessionCode && (
        <TelegramStatusChecker 
          sessionCode={sessionCode}
          pollingEnabled={false}
          onConnected={(data) => {
            console.log('Connection established:', data);
          }}
        />
      )}

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Последние сессии ({sessions?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions && sessions.length > 0 ? (
            <div className="space-y-3">
              {sessions.map((session: any) => (
                <div key={session.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      {session.session_code}
                    </code>
                    <div className="flex gap-2">
                      {getStatusBadge(session.used, 'session')}
                      {isExpired(session.expires_at) && (
                        <Badge variant="outline" className="bg-red-100 text-red-700">
                          Истекла
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Пользователь:</span>
                      <br />
                      {session.user_name || 'Не указан'}
                    </div>
                    <div>
                      <span className="font-medium">Роль:</span>
                      <br />
                      {session.user_role || 'Не указана'}
                    </div>
                    <div>
                      <span className="font-medium">Создана:</span>
                      <br />
                      {new Date(session.created_at).toLocaleString('ru-RU')}
                    </div>
                    <div>
                      <span className="font-medium">Истекает:</span>
                      <br />
                      {new Date(session.expires_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>Нет активных сессий</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Links Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Последние подключения ({links?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {links && links.length > 0 ? (
            <div className="space-y-3">
              {links.map((link: any) => (
                <div key={link.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {link.first_name || 'Telegram User'}
                      </span>
                      {link.telegram_username && (
                        <span className="text-gray-500">@{link.telegram_username}</span>
                      )}
                    </div>
                    {getStatusBadge(link.active, 'link')}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Chat ID:</span>
                      <br />
                      <code className="text-xs">{link.chat_id}</code>
                    </div>
                    <div>
                      <span className="font-medium">Создано:</span>
                      <br />
                      {new Date(link.created_at).toLocaleString('ru-RU')}
                    </div>
                    <div>
                      <span className="font-medium">Обновлено:</span>
                      <br />
                      {new Date(link.updated_at).toLocaleString('ru-RU')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>Нет подключений</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
