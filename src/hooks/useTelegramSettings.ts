
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useOrganization } from '@/hooks/useOrganization';

interface TelegramSettings {
  id: string;
  org_id: string;
  bot_token: string;
  bot_username?: string;
  webhook_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useTelegramSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useOrganization();

  const { data: telegramSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ['telegram-settings', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return null;

      const { data, error } = await supabase
        .from('telegram_settings')
        .select('*')
        .eq('org_id', organization.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching telegram settings:', error);
        return null;
      }

      return data as TelegramSettings | null;
    },
    enabled: !!organization?.id
  });

  const createOrUpdateSettings = useMutation({
    mutationFn: async (settings: Partial<TelegramSettings>) => {
      if (!organization?.id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('telegram_settings')
        .upsert({
          org_id: organization.id,
          ...settings
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
      toast({
        title: "Успешно!",
        description: "Настройки Telegram обновлены",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обновить настройки",
        variant: "destructive"
      });
    }
  });

  const deleteSettings = useMutation({
    mutationFn: async () => {
      if (!telegramSettings?.id) throw new Error('No settings to delete');

      const { error } = await supabase
        .from('telegram_settings')
        .delete()
        .eq('id', telegramSettings.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-settings'] });
      toast({
        title: "Успешно!",
        description: "Настройки Telegram удалены",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось удалить настройки",
        variant: "destructive"
      });
    }
  });

  const testBotConnection = async (botToken: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-webhook-setup', {
        body: { 
          action: 'test_bot',
          bot_token: botToken,
          org_id: organization?.id
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Бот активен",
          description: data.message,
        });
        return data.bot_info;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "❌ Ошибка",
        description: error.message || "Не удалось проверить бота",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    telegramSettings,
    isLoading: isLoadingSettings || isLoading,
    createOrUpdateSettings: createOrUpdateSettings.mutate,
    deleteSettings: deleteSettings.mutate,
    testBotConnection
  };
};
