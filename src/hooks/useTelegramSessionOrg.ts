
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useOrganization } from '@/hooks/useOrganization';

interface TelegramSessionResponse {
  success: boolean;
  session_code?: string;
  telegram_url?: string;
  url?: string;
  expires_at?: string;
  bot_username?: string;
  organization?: string;
  error?: string;
}

export const useTelegramSessionOrg = () => {
  const [isGeneratingSession, setIsGeneratingSession] = useState(false);
  const { toast } = useToast();
  const { ensureUserProfile } = useUserProfile();
  const { organization } = useOrganization();

  const startTelegramSession = async (): Promise<TelegramSessionResponse | null> => {
    setIsGeneratingSession(true);
    
    try {
      console.log('Starting Telegram organization session...');
      
      if (!organization) {
        throw new Error('Организация не определена');
      }
      
      // Убеждаемся, что профиль пользователя существует
      const profileResult = await ensureUserProfile();
      if (!profileResult) {
        throw new Error('Не удалось создать профиль пользователя');
      }

      const { data, error } = await supabase.functions.invoke('telegram-start-session-org');

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
        description: `Подключитесь к боту @${data.bot_username} для получения уведомлений`,
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
      const { data, error } = await supabase.functions.invoke('telegram-session-status', {
        body: { session_code: sessionCode }
      });

      if (error) {
        console.error('Error checking session status:', error);
        throw error;
      }
      
      return data || { connected: false, expired: true };
    } catch (error) {
      console.error('Error checking session status:', error);
      return { connected: false, expired: true };
    }
  };

  return {
    startTelegramSession,
    checkSessionStatus,
    isGeneratingSession,
    organization
  };
};
