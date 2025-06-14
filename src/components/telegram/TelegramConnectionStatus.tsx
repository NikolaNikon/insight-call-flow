
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface TelegramConnectionStatusProps {
  isConnected?: boolean;
  isPending?: boolean;
  error?: string | null;
  showTimeoutWarning?: boolean;
}

export const TelegramConnectionStatus: React.FC<TelegramConnectionStatusProps> = ({
  isConnected = false,
  isPending = false,
  error = null,
  showTimeoutWarning = false
}) => {
  if (isConnected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Telegram успешно подключен к вашему аккаунту CallControl
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
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

  return null;
};
