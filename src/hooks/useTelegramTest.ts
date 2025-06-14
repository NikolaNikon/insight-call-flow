
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramNotifications } from '@/hooks/useTelegramNotifications';

export const useTelegramTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendNotification } = useTelegramNotifications();

  const testConnection = async (botToken: string, chatId: string) => {
    if (!botToken || !chatId) {
      const errorCode = "TELEGRAM-TEST-001";
      const errorText = "Заполните токен бота и ID чата";
      toast({
        title: `Ошибка [${errorCode}]`,
        description: errorText,
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка\nDescription: ${errorText}`
      });
      return false;
    }

    setIsLoading(true);
    
    try {
      // Тестируем отправку уведомления
      await sendNotification({
        type: 'custom',
        data: {
          message: '🤖 Тестовое сообщение из CallControl\n\nПоздравляем! Интеграция с Telegram настроена корректно.'
        }
      });

      toast({
        title: "Успешно!",
        description: "Тестовое сообщение отправлено в Telegram",
      });
      
      return true;
    } catch (error: any) {
      console.error('Telegram test error:', error);
      
      const errorCode = "TELEGRAM-TEST-002";
      const errorText = error.message || "Не удалось отправить сообщение в Telegram";
      
      toast({
        title: `Ошибка подключения [${errorCode}]`,
        description: errorText,
        variant: "destructive",
        copyableText: `Error Code: ${errorCode}\nTitle: Ошибка подключения\nDescription: ${errorText}\nDetails: ${JSON.stringify(error, null, 2)}`
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    testConnection,
    isLoading
  };
};
