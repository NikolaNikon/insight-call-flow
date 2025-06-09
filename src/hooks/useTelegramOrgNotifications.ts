
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface OrgNotificationData {
  type: 'new_call' | 'weekly_report' | 'custom' | 'alert';
  data: Record<string, any>;
}

export const useTelegramOrgNotifications = () => {
  const { organization } = useOrganization();

  const sendOrgNotification = async ({ type, data }: OrgNotificationData) => {
    if (!organization?.id) {
      throw new Error('No organization context available');
    }

    try {
      const { data: result, error } = await supabase.functions.invoke(
        'telegram-notifications-org',
        {
          body: { 
            org_id: organization.id,
            type, 
            data 
          }
        }
      );

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      console.error('Error sending Telegram organization notification:', error);
      throw error;
    }
  };

  const sendNewCallNotification = async (callData: {
    manager: string;
    date: string;
    score: number;
    satisfaction: number;
  }) => {
    return sendOrgNotification({
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
    return sendOrgNotification({
      type: 'weekly_report',
      data: reportData
    });
  };

  const sendAlert = async (message: string) => {
    return sendOrgNotification({
      type: 'alert',
      data: { message }
    });
  };

  return {
    sendOrgNotification,
    sendNewCallNotification,
    sendWeeklyReport,
    sendAlert,
    organization
  };
};
