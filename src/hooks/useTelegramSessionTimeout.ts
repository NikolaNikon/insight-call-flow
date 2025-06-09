
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PendingSession {
  session_code: string;
  telegram_url: string;
  expires_at: string;
}

interface UseTelegramSessionTimeoutProps {
  pendingSession: PendingSession | null;
  checkSessionStatus: (sessionCode: string) => Promise<any>;
  onSessionTimeout: () => void;
  onSuccessfulConnection: () => void;
}

export const useTelegramSessionTimeout = ({
  pendingSession,
  checkSessionStatus,
  onSessionTimeout,
  onSuccessfulConnection
}: UseTelegramSessionTimeoutProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const { toast } = useToast();

  const TIMEOUT_WARNING_THRESHOLD = 30; // 30 секунд

  // Таймер для отслеживания времени жизни сессии
  useEffect(() => {
    if (!pendingSession) return;

    const interval = setInterval(() => {
      const expiresAt = new Date(pendingSession.expires_at);
      const now = new Date();
      const secondsLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      
      setTimeLeft(secondsLeft);
      
      // Показываем предупреждение о таймауте
      if (secondsLeft <= TIMEOUT_WARNING_THRESHOLD && secondsLeft > 0) {
        setShowTimeoutWarning(true);
      }
      
      if (secondsLeft <= 0) {
        onSessionTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [pendingSession, onSessionTimeout]);

  // Проверка статуса сессии
  useEffect(() => {
    if (!pendingSession) return;

    const checkInterval = setInterval(async () => {
      try {
        const status = await checkSessionStatus(pendingSession.session_code);
        
        if (status.used) {
          onSuccessfulConnection();
        } else if (status.expired) {
          onSessionTimeout();
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    }, 2000);

    return () => clearInterval(checkInterval);
  }, [pendingSession, checkSessionStatus, onSuccessfulConnection, onSessionTimeout]);

  const resetWarning = () => {
    setShowTimeoutWarning(false);
  };

  return {
    timeLeft,
    showTimeoutWarning,
    resetWarning
  };
};
