
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';

interface PendingSession {
  session_code: string;
  telegram_url: string;
  expires_at: string;
}

interface TelegramPendingSessionProps {
  pendingSession: PendingSession;
  timeLeft?: number;
  showTimeoutWarning?: boolean;
  onCancel?: () => void;
}

export const TelegramPendingSession: React.FC<TelegramPendingSessionProps> = ({
  pendingSession,
  timeLeft = 300,
  showTimeoutWarning = false,
  onCancel = () => {}
}) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${
      showTimeoutWarning ? 'border-yellow-200 bg-yellow-50' : 'border-blue-200 bg-blue-50'
    }`}>
      <div className="flex items-center gap-2 mb-3">
        <Clock className={`h-4 w-4 ${showTimeoutWarning ? 'text-yellow-600' : 'text-blue-600'}`} />
        <span className={`font-medium ${showTimeoutWarning ? 'text-yellow-900' : 'text-blue-900'}`}>
          Ожидание подключения
        </span>
        <Badge 
          variant="outline" 
          className={showTimeoutWarning ? 'text-yellow-700 border-yellow-300' : 'text-blue-700 border-blue-300'}
        >
          {formatTime(timeLeft)}
        </Badge>
      </div>
      <p className={`text-sm mb-3 ${showTimeoutWarning ? 'text-yellow-800' : 'text-blue-800'}`}>
        {showTimeoutWarning ? (
          '⏰ Поторопитесь! Перейдите в Telegram и нажмите "START"'
        ) : (
          '📱 Перейдите в Telegram и нажмите "START" для завершения подключения'
        )}
      </p>
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
          onClick={onCancel}
          variant="ghost"
          size="sm"
        >
          Отменить
        </Button>
      </div>
    </div>
  );
};
