
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';

interface TelegramSessionResponse {
  success: boolean;
  session_code?: string;
  telegram_url?: string;
  url?: string;
  expires_at?: string;
  error?: string;
}

export const useTelegramSession = () => {
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  const { toast } = useToast();
  const { ensureUserProfile } = useUserProfile();

  const startTelegramSession = async (): Promise<TelegramSessionResponse | null> => {
    setIsGeneratingSession(true);
    
    try {
      console.log('Starting Telegram session...');
      
      // Сначала убеждаемся, что профиль пользователя существует
      const profileResult = await ensureUserProfile();
      if (!profileResult) {
        throw new Error('Не удалось создать профиль пользователя');
      }

      const { data, error } = await supabase.functions.invoke('telegram-start-session');

      console.log('Function response:', data, error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.success) {
        const errorMessage = data?.error || 'Неизвестная ошибка';
        console.error('Function returned error:', errorMessage);
        throw new Error(errorMessage);
      }

      toast({
        title: "✅ Ссылка сгенерирована!",
        description: "Нажмите на кнопку ниже для подключения Telegram бота",
      });

      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при генерации ссылки';
      console.error('Error in startTelegramSession:', error);
      
      toast({
        title: "❌ Ошибка",
        description: errorMessage,
        variant: "destructive"
      });

      return null;
    } finally {
      setIsGeneratingSession(false);
    }
  };

  const checkSessionStatus = async (sessionCode: string) => {
    try {
      const { data, error } = await supabase
        .from('telegram_sessions')
        .select('used, expires_at')
        .eq('session_code', sessionCode)
        .maybeSingle();

      if (error) {
        console.error('Error checking session status:', error);
        throw error;
      }
      
      if (!data) {
        return { used: false, expired: true };
      }
      
      return {
        used: data.used,
        expired: new Date(data.expires_at) < new Date()
      };
    } catch (error) {
      console.error('Error checking session status:', error);
      return { used: false, expired: true };
    }
  };

  return {
    startTelegramSession,
    checkSessionStatus,
    isGeneratingSession
  };
};
