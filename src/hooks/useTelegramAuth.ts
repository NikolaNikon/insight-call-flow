
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TelegramAuthData {
  code: string;
  chat_id: number;
  telegram_username?: string;
  first_name?: string;
}

export const useTelegramAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const linkTelegramAccount = async (authData: TelegramAuthData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-link', {
        body: authData
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка');
      }

      toast({
        title: "Успешно!",
        description: data.message,
      });

      return { success: true, message: data.message };
    } catch (error: any) {
      const errorMessage = error.message || 'Ошибка при подключении аккаунта';
      
      toast({
        title: "Ошибка",
        description: errorMessage,
        variant: "destructive"
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const getTelegramLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('telegram_links')
        .select('*')
        .eq('active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching telegram links:', error);
      return [];
    }
  };

  const deactivateTelegramLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('telegram_links')
        .update({ active: false })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: "Telegram уведомления отключены",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: error.message || "Ошибка при отключении",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    linkTelegramAccount,
    getTelegramLinks,
    deactivateTelegramLink,
    isLoading
  };
};
