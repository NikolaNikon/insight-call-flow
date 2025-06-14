
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  user_id?: string;
  user_ids?: string[];
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { user_id, user_ids, message, type = 'info' }: NotificationRequest = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Тут — единый токен, глобально для всего проекта
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) throw new Error('Telegram bot token not configured');

    // Список пользователей-реципиентов
    const targetUserIds = user_id ? [user_id] : (user_ids || []);
    if (targetUserIds.length === 0) throw new Error('No user IDs provided');

    // Получаем данные связей + профили пользователя + организации (+ user_role)
    const { data: links, error: linkError } = await supabaseClient
      .from('telegram_links')
      .select(`
        chat_id, user_id, first_name, username, org_id, is_active,
        users:users (
          name, role, org_id,
          organizations (
            name
          )
        )
      `)
      .in('user_id', targetUserIds)
      .eq('is_active', true);

    if (linkError) throw linkError;

    if (!links || links.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active Telegram links found',
          sent_count: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Эмодзи по типу
    const typeEmojis: Record<string, string> = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    // Стандартизируем сообщение с вставками: имя, роль, орг
    function formatMessageTelegram(link: any): string {
      const fullname = link.users?.name || link.first_name || 'Пользователь';
      const username = link.username ? `@${link.username}` : '';
      // Роль из users или fallback
      const userRole = link.users?.role || 'user';
      // Friendly (русское) имя роли
      const roleMap: Record<string, string> = {
        admin: "Администратор",
        manager: "Менеджер",
        operator: "Оператор",
        viewer: "Наблюдатель",
        superadmin: "Суперадмин"
      };
      const roleHuman = roleMap[userRole] || userRole;

      // Организация
      const org = link.users?.organizations?.name || '—';

      // Новый шаблон уведомлений
      return `${typeEmojis[type] || ''} ${message}
👤 ${fullname} ${username}
🎭 Роль: ${roleHuman}
🏢 Организация: ${org}`;
    }

    // Отправляем уведомления
    const sendPromises = links.map(async (link: any) => {
      const formattedMessage = formatMessageTelegram(link);

      try {
        const response = await fetch(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: link.chat_id,
              text: formattedMessage,
              parse_mode: 'HTML'
            }),
          }
        );
        const result = await response.json();

        if (!response.ok) {
          // Если 403: бот заблокирован — деактивируем связь
          if (result?.error_code === 403) {
            await supabaseClient
              .from('telegram_links')
              .update({ is_active: false })
              .eq('chat_id', link.chat_id)
              .eq('user_id', link.user_id);
          }
          return { success: false, chat_id: link.chat_id, error: result };
        }
        return { success: true, chat_id: link.chat_id };
      } catch (error) {
        return { success: false, chat_id: link.chat_id, error: (error as any).message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failedResults = results.filter(r => !r.success);

    // Логируем результат (минимально — в audit_logs)
    const logData = {
      action: 'telegram_personal_notification',
      details: {
        target_users: targetUserIds,
        requested_message: message.substring(0, 100),
        type,
        sent_count: successCount,
        failed_count: failedResults.length,
        failures: failedResults
      },
      user_id: null
    };

    await supabaseClient
      .from('audit_logs')
      .insert(logData);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount} notifications`,
        sent_count: successCount,
        failed_count: failedResults.length,
        details: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in telegram-personal-notifications function:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
