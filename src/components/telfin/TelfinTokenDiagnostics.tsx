
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { TelfinClientCredentialsAPI } from '@/services/telfinOAuthApi';

interface TelfinTokenDiagnosticsProps {
  apiInstance: TelfinClientCredentialsAPI | null;
  onTokenRefresh?: () => void;
}

export const TelfinTokenDiagnostics: React.FC<TelfinTokenDiagnosticsProps> = ({
  apiInstance,
  onTokenRefresh,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  if (!apiInstance) {
    return null;
  }

  const diagnostics = apiInstance.getTokenDiagnostics();
  const isValid = diagnostics.isValid;
  const timeUntilExpiry = diagnostics.timeUntilExpiry;

  const getStatusColor = () => {
    if (!diagnostics.hasToken) return 'destructive';
    if (!isValid) return 'destructive';
    if (timeUntilExpiry && timeUntilExpiry < 300) return 'secondary'; // менее 5 минут
    return 'default';
  };

  const getStatusIcon = () => {
    if (!diagnostics.hasToken || !isValid) return <XCircle className="h-4 w-4" />;
    if (timeUntilExpiry && timeUntilExpiry < 300) return <AlertCircle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  const handleRefreshToken = async () => {
    if (!apiInstance) return;
    
    setIsRefreshing(true);
    try {
      await apiInstance.getAccessToken();
      setLastCheck(new Date());
      onTokenRefresh?.();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatTimeUntilExpiry = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    if (seconds < 0) return 'Истёк';
    
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes % 60}м`;
    }
    return `${minutes}м ${seconds % 60}с`;
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {getStatusIcon()}
          Диагностика токена доступа
        </CardTitle>
        <CardDescription className="text-xs">
          Статус токена авторизации Telfin API
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-600">Статус:</span>
            <Badge variant={getStatusColor()} className="ml-2 text-xs">
              {!diagnostics.hasToken ? 'Отсутствует' : 
               !isValid ? 'Недействителен' : 
               'Действителен'}
            </Badge>
          </div>
          
          <div>
            <span className="text-gray-600">До истечения:</span>
            <span className="ml-2 font-mono">
              {formatTimeUntilExpiry(timeUntilExpiry)}
            </span>
          </div>
          
          <div className="col-span-2">
            <span className="text-gray-600">Истекает:</span>
            <span className="ml-2 font-mono text-xs">
              {diagnostics.tokenExpiry || 'N/A'}
            </span>
          </div>
        </div>

        {lastCheck && (
          <div className="text-xs text-gray-500">
            Последнее обновление: {lastCheck.toLocaleTimeString()}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            size="sm"
            variant="outline"
            className="text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Обновление...' : 'Обновить токен'}
          </Button>
        </div>

        {(!isValid || (timeUntilExpiry && timeUntilExpiry < 300)) && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
            <AlertCircle className="h-3 w-3 inline mr-1" />
            {!isValid ? 'Токен недействителен и будет автоматически обновлён при следующем запросе.' :
             'Токен скоро истечёт. Рекомендуется обновить его сейчас.'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
