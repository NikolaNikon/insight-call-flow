
import { supabase } from "@/integrations/supabase/client";

interface NotificationData {
  type: 'new_call' | 'weekly_report' | 'custom';
  data: Record<string, any>;
}

export const useTelegramNotifications = () => {
  const sendNotification = async ({ type, data }: NotificationData) => {
    try {
      const { data: result, error } = await supabase.functions.invoke(
        'telegram-notifications',
        {
          body: { type, data }
        }
      );

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
      throw error;
    }
  };

  const sendNewCallNotification = async (callData: {
    manager: string;
    date: string;
    score: number;
    satisfaction: number;
  }) => {
    return sendNotification({
      type: 'new_call',
      data: callData
    });
  };

  const sendWeeklyReport = async (reportData: {
    totalCalls: number;
    avgScore: number;
    avgSatisfaction: number;
    topManager: string;
  }) => {
    return sendNotification({
      type: 'weekly_report',
      data: reportData
    });
  };

  return {
    sendNotification,
    sendNewCallNotification,
    sendWeeklyReport
  };
};
