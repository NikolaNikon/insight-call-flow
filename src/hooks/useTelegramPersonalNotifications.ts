
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type UserRole = Database['public']['Enums']['user_role'];

interface PersonalNotificationData {
  userId: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface BulkNotificationData {
  userIds: string[];
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export const useTelegramPersonalNotifications = () => {
  const sendPersonalNotification = async ({ userId, message, type = 'info' }: PersonalNotificationData) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'telegram-personal-notifications',
        {
          body: { 
            user_id: userId,
            message,
            type
          }
        }
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending personal Telegram notification:', error);
      throw error;
    }
  };

  const sendBulkNotifications = async ({ userIds, message, type = 'info' }: BulkNotificationData) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'telegram-personal-notifications',
        {
          body: { 
            user_ids: userIds,
            message,
            type
          }
        }
      );

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error sending bulk Telegram notifications:', error);
      throw error;
    }
  };

  const sendRoleBasedNotification = async (roles: UserRole[], message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    try {
      // Получаем пользователей с нужными ролями
      const { data: users, error } = await supabase
        .from('users')
        .select('id')
        .in('role', roles)
        .eq('is_active', true);

      if (error) throw error;

      if (!users || users.length === 0) {
        console.log('No users found with specified roles');
        return;
      }

      const userIds = users.map(user => user.id);
      return await sendBulkNotifications({ userIds, message, type });
    } catch (error) {
      console.error('Error sending role-based notification:', error);
      throw error;
    }
  };

  const sendNewCallNotification = async (callData: {
    managerName: string;
    date: string;
    score: number;
    satisfaction: number;
    userId: string;
  }) => {
    const message = `📞 Обработан новый звонок

👤 Менеджер: ${callData.managerName}
📅 Дата: ${callData.date}
⭐ Оценка: ${callData.score}/10
😊 Удовлетворенность: ${callData.satisfaction}%`;

    return sendPersonalNotification({
      userId: callData.userId,
      message,
      type: 'info'
    });
  };

  const sendWeeklyReportNotification = async (userIds: string[], reportData: {
    totalCalls: number;
    avgScore: number;
    avgSatisfaction: number;
    topManager: string;
  }) => {
    const message = `📊 Еженедельный отчет CallControl

📞 Всего звонков: ${reportData.totalCalls}
⭐ Средняя оценка: ${reportData.avgScore.toFixed(1)}
😊 Средняя удовлетворенность: ${reportData.avgSatisfaction}%
🏆 Лучший менеджер: ${reportData.topManager}`;

    return sendBulkNotifications({
      userIds,
      message,
      type: 'info'
    });
  };

  return {
    sendPersonalNotification,
    sendBulkNotifications,
    sendRoleBasedNotification,
    sendNewCallNotification,
    sendWeeklyReportNotification
  };
};
