
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useTelegramConnectionAttempts = () => {
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const MAX_CONNECTION_ATTEMPTS = 3;

  const handleSessionTimeout = () => {
    setConnectionAttempts(prev => prev + 1);
    
    if (connectionAttempts < MAX_CONNECTION_ATTEMPTS - 1) {
      toast({
        title: "⏰ Время подключения истекло",
        description: `Попробуйте еще раз. Осталось попыток: ${MAX_CONNECTION_ATTEMPTS - connectionAttempts - 1}`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "❌ Превышено количество попыток",
        description: "Обратитесь к администратору или попробуйте позже",
        variant: "destructive"
      });
      setError("Превышено максимальное количество попыток подключения");
    }
  };

  const handleSuccessfulConnection = () => {
    setConnectionAttempts(0);
    setError(null);
  };

  const incrementAttempts = () => {
    setConnectionAttempts(prev => prev + 1);
  };

  const canAttemptConnection = connectionAttempts < MAX_CONNECTION_ATTEMPTS;

  const resetError = () => {
    setError(null);
  };

  return {
    connectionAttempts,
    error,
    canAttemptConnection,
    handleSessionTimeout,
    handleSuccessfulConnection,
    incrementAttempts,
    resetError,
    setError
  };
};
