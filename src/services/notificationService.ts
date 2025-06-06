
import { supabase } from '@/integrations/supabase/client';
import { DatabaseNotification } from '@/hooks/useNotifications';

export interface CreateNotificationParams {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  user_id?: string | null;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

export class NotificationService {
  // Создание системного уведомления
  static async createSystemNotification(params: CreateNotificationParams) {
    try {
      const notification = {
        title: params.title,
        message: params.message,
        type: params.type || 'info',
        user_id: params.user_id || null,
        entity_type: params.entity_type,
        entity_id: params.entity_id,
        metadata: params.metadata || {},
        read: false
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([notification])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  // Создание уведомления о завершении обработки звонка
  static async notifyCallProcessed(callId: string, managerId?: string, success: boolean = true) {
    const title = success ? "Обработка завершена" : "Ошибка обработки";
    const message = success 
      ? "Аудиозапись успешно обработана и готова к просмотру"
      : "Не удалось обработать аудиозапись";
    
    return this.createSystemNotification({
      title,
      message,
      type: success ? 'success' : 'error',
      user_id: managerId,
      entity_type: 'call',
      entity_id: callId,
      metadata: { call_id: callId }
    });
  }

  // Создание уведомления об экспорте
  static async notifyExportComplete(exportId: string, userId?: string, success: boolean = true) {
    const title = success ? "Отчет готов" : "Ошибка экспорта";
    const message = success 
      ? "Экспорт завершен, файл готов к скачиванию"
      : "Не удалось создать экспорт";
    
    return this.createSystemNotification({
      title,
      message,
      type: success ? 'success' : 'error',
      user_id: userId,
      entity_type: 'export',
      entity_id: exportId,
      metadata: { export_id: exportId }
    });
  }

  // Создание уведомления о системных событиях
  static async notifySystemEvent(title: string, message: string, type: 'info' | 'warning' = 'info') {
    return this.createSystemNotification({
      title,
      message,
      type,
      user_id: null, // Системное уведомление для всех
      entity_type: 'system'
    });
  }

  // Создание персонального уведомления
  static async notifyUser(userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    return this.createSystemNotification({
      title,
      message,
      type,
      user_id: userId
    });
  }
}
