
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Clock, 
  ExternalLink,
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
  telegramUrl?: string;
  onConnected?: (data: TelegramStatusResponse) => void;
  onCancel?: () => void;
  pollingEnabled?: boolean;
}

export const TelegramStatusChecker: React.FC<TelegramStatusCheckerProps> = ({
  sessionCode,
  telegramUrl,
  onConnected,
  onCancel,
  pollingEnabled = false
}) => {
  const [isPolling, setIsPolling] = useState(pollingEnabled);

  const { data: sessionStatus, isLoading } = useQuery({
    queryKey: ['telegram-session-status', sessionCode],
    queryFn: async () => {
      if (!sessionCode) return null;
      
      const { data, error } = await supabase.functions.invoke(`telegram-session-status?session_code=${sessionCode}`);

      if (error) throw error;
      return data as TelegramStatusResponse;
    },
    enabled: !!sessionCode && isPolling,
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (sessionStatus?.connected && onConnected) {
      onConnected(sessionStatus);
      setIsPolling(false);
    }
  }, [sessionStatus, onConnected]);

  useEffect(() => {
    setIsPolling(pollingEnabled);
  }, [pollingEnabled]);

  if (!sessionCode) {
    return null;
  }
  
  if (isLoading && !sessionStatus) {
    return (
      <div className="border-2 rounded-lg p-4 border-blue-200 bg-blue-50">
        <div className="flex items-center gap-2 mb-3">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="font-medium text-blue-900">Проверка подключения...</span>
        </div>
        <p className={`text-sm mb-3 text-blue-800`}>
          Ожидаем подтверждения в Telegram.
        </p>
      </div>
    );
  }

  if (sessionStatus?.connected) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Telegram успешно подключен! Обновляем интерфейс...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="border-2 rounded-lg p-4 border-blue-200 bg-blue-50">
      <div className="flex items-center gap-2 mb-3">
        <Clock className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-900">
          Ожидание подключения
        </span>
      </div>
      <p className="text-sm mb-3 text-blue-800">
        📱 Ссылка для подключения открыта в новой вкладке. Перейдите в Telegram и нажмите "START" для завершения.
      </p>
      <div className="flex gap-2">
        {telegramUrl && (
          <Button
            onClick={() => window.open(telegramUrl, '_blank')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Открыть ссылку еще раз
          </Button>
        )}
        {onCancel && (
          <Button
            onClick={onCancel}
            variant="ghost"
            size="sm"
          >
            Отменить
          </Button>
        )}
      </div>
    </div>
  );
};
