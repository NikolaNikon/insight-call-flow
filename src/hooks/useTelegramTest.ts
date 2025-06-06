
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useTelegramNotifications } from '@/hooks/useTelegramNotifications';

export const useTelegramTest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { sendNotification } = useTelegramNotifications();

  const testConnection = async (botToken: string, chatId: string) => {
    if (!botToken || !chatId) {
      toast({
        title: "Ошибка",
        description: "Заполните токен бота и ID чата",
        variant: "destructive"
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
      
      toast({
        title: "Ошибка подключения",
        description: error.message || "Не удалось отправить сообщение в Telegram",
        variant: "destructive"
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
