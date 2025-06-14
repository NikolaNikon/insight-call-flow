
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, Plug, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { TelfinClientInfo } from '@/services/telfinOAuthApi';

interface TelfinStatusDisplayProps {
  isAuthorized: boolean;
  userInfo: TelfinClientInfo | null;
  isLoading: boolean;
  handleConnect: () => void;
  testConnection: () => void;
  handleLogout: () => void;
  handleSyncCallHistory: () => void;
  isAdmin: boolean;
}

export const TelfinStatusDisplay: React.FC<TelfinStatusDisplayProps> = ({
  isAuthorized,
  userInfo,
  isLoading,
  handleConnect,
  testConnection,
  handleLogout,
  handleSyncCallHistory,
  isAdmin,
}) => {
  return (
    <div className="space-y-4 pt-4">
      <div className="flex items-center gap-3 p-4 border rounded-lg">
        <div className="flex items-center gap-2">
          {isAuthorized ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <span className="font-medium">
            {isAuthorized ? 'Авторизован' : 'Не авторизован'}
          </span>
        </div>
        
        <Badge variant={isAuthorized ? 'default' : 'destructive'}>
          {isAuthorized ? 'Активно' : 'Неактивно'}
        </Badge>
      </div>

      {userInfo && (
        <div className="p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-2">Информация о клиенте Телфин:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Название компании:</strong> {userInfo.name}</p>
            <p><strong>Client ID:</strong> {userInfo.client_id}</p>
            <p><strong>Часовой пояс:</strong> {userInfo.timezone}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!isAuthorized ? (
          <Button onClick={handleConnect} className="gap-2" disabled={isLoading || !isAdmin}>
            <Plug className="h-4 w-4" />
            {isLoading ? 'Подключение...' : 'Подключиться'}
          </Button>
        ) : (
          <>
            <Button onClick={testConnection} variant="outline" className="gap-2" disabled={isLoading}>
              <TestTube className="h-4 w-4" />
              {isLoading ? 'Тестируем...' : 'Тест подключения'}
            </Button>
             <Button onClick={handleSyncCallHistory} variant="outline" className="gap-2" disabled={isLoading || !isAdmin}>
              <RefreshCw className="h-4 w-4" />
              {isLoading ? 'Синхронизация...' : 'Синхронизировать звонки'}
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="gap-2" disabled={isLoading || !isAdmin}>
              <XCircle className="h-4 w-4" />
              Отключить
            </Button>
          </>
        )}
      </div>
      {!isAdmin && isAuthorized && (
        <p className="text-xs text-gray-500 mt-2">
          Управление интеграцией и синхронизация доступны только администраторам.
        </p>
      )}
      {!isAdmin && !isAuthorized && (
        <p className="text-xs text-gray-500 mt-2">
          Интеграция не настроена. Обратитесь к администратору для подключения.
        </p>
      )}
    </div>
  );
};
