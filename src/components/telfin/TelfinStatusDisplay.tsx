
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TestTube, ExternalLink, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface TelfinStatusDisplayProps {
  isAuthorized: boolean;
  userInfo: any;
  isLoading: boolean;
  handleStartOAuth: () => void;
  testConnection: () => void;
  handleLogout: () => void;
  handleSyncCallHistory: () => void;
}

export const TelfinStatusDisplay: React.FC<TelfinStatusDisplayProps> = ({
  isAuthorized,
  userInfo,
  isLoading,
  handleStartOAuth,
  testConnection,
  handleLogout,
  handleSyncCallHistory,
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
          <h4 className="font-medium mb-2">Информация о пользователе:</h4>
          <div className="text-sm space-y-1">
            <p><strong>Логин:</strong> {userInfo.login}</p>
            <p><strong>ID:</strong> {userInfo.id}</p>
            <p><strong>Client ID:</strong> {userInfo.client_id}</p>
            <p><strong>Администратор:</strong> {userInfo.admin ? 'Да' : 'Нет'}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {!isAuthorized ? (
          <Button onClick={handleStartOAuth} className="gap-2" disabled={isLoading}>
            <ExternalLink className="h-4 w-4" />
            {isLoading ? 'Авторизация...' : 'Начать OAuth авторизацию'}
          </Button>
        ) : (
          <>
            <Button onClick={testConnection} variant="outline" className="gap-2" disabled={isLoading}>
              <TestTube className="h-4 w-4" />
              {isLoading ? 'Тестируем...' : 'Тест подключения'}
            </Button>
             <Button onClick={handleSyncCallHistory} variant="outline" className="gap-2" disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              {isLoading ? 'Синхронизация...' : 'Синхронизировать звонки'}
            </Button>
            <Button onClick={handleLogout} variant="destructive" className="gap-2" disabled={isLoading}>
              <XCircle className="h-4 w-4" />
              Отозвать доступ
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
