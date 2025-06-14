import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WebhookInfo {
  url: string;
  has_custom_certificate: boolean;
  pending_update_count: number;
  last_error_date?: number;
  last_error_message?: string;
  max_connections?: number;
  allowed_updates?: string[];
}

interface BotInfo {
  id: number;
  is_bot: boolean;
  first_name: string;
  username: string;
  can_join_groups: boolean;
  can_read_all_group_messages: boolean;
  supports_inline_queries: boolean;
}

export const useTelegramWebhook = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [webhookInfo, setWebhookInfo] = useState<WebhookInfo | null>(null);
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const { toast } = useToast();

  const setWebhook = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-webhook-setup', {
        body: { action: 'set_webhook' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Webhook настроен",
          description: data.message,
        });
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const errorCode = "WEBHOOK-SETUP-001";
      const errorText = error.message || "Не удалось настроить webhook";
      toast({
        title: `❌ Ошибка [${errorCode}]`,
        description: errorText,
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка настройки webhook\nDescription: ${errorText}\nDetails: ${JSON.stringify(error, null, 2)}`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getWebhookInfo = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-webhook-setup', {
        body: { action: 'get_webhook_info' }
      });

      if (error) throw error;

      if (data.success) {
        setWebhookInfo(data.webhook_info);
        return {
          webhookInfo: data.webhook_info,
          isCorrect: data.is_webhook_correct,
          expectedUrl: data.expected_url
        };
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const errorCode = "WEBHOOK-SETUP-002";
      const errorText = error.message || "Не удалось получить информацию о webhook";
      toast({
        title: `❌ Ошибка [${errorCode}]`,
        description: errorText,
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка получения информации о webhook\nDescription: ${errorText}\nDetails: ${JSON.stringify(error, null, 2)}`
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteWebhook = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-webhook-setup', {
        body: { action: 'delete_webhook' }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "✅ Webhook удален",
          description: data.message,
        });
        setWebhookInfo(null);
        return true;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const errorCode = "WEBHOOK-SETUP-003";
      const errorText = error.message || "Не удалось удалить webhook";
      toast({
        title: `❌ Ошибка [${errorCode}]`,
        description: errorText,
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка удаления webhook\nDescription: ${errorText}\nDetails: ${JSON.stringify(error, null, 2)}`
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const testBot = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('telegram-webhook-setup', {
        body: { action: 'test_bot' }
      });

      if (error) throw error;

      if (data.success) {
        setBotInfo(data.bot_info);
        toast({
          title: "✅ Бот активен",
          description: data.message,
        });
        return data.bot_info;
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      const errorCode = "WEBHOOK-SETUP-004";
      const errorText = error.message || "Не удалось проверить бота";
      toast({
        title: `❌ Ошибка [${errorCode}]`,
        description: errorText,
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка проверки бота\nDescription: ${errorText}\nDetails: ${JSON.stringify(error, null, 2)}`
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    setWebhook,
    getWebhookInfo,
    deleteWebhook,
    testBot,
    isLoading,
    webhookInfo,
    botInfo
  };
};
