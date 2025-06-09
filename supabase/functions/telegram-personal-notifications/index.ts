
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

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    // Определяем список пользователей для уведомления
    const targetUserIds = user_id ? [user_id] : (user_ids || []);
    
    if (targetUserIds.length === 0) {
      throw new Error('No user IDs provided');
    }

    // Получаем активные Telegram связи для указанных пользователей
    const { data: telegramLinks, error } = await supabaseClient
      .from('telegram_links')
      .select('chat_id, user_id, first_name')
      .in('user_id', targetUserIds)
      .eq('active', true);

    if (error) {
      throw error;
    }

    if (!telegramLinks || telegramLinks.length === 0) {
      console.log('No active Telegram links found for users:', targetUserIds);
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

    // Добавляем эмодзи в зависимости от типа
    const typeEmojis = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };

    const formattedMessage = `${typeEmojis[type]} ${message}`;

    // Отправляем уведомления
    const sendPromises = telegramLinks.map(async (link) => {
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
          console.error(`Failed to send message to ${link.chat_id}:`, result);
          return { success: false, chat_id: link.chat_id, error: result };
        }
        
        return { success: true, chat_id: link.chat_id };
      } catch (error) {
        console.error(`Error sending message to ${link.chat_id}:`, error);
        return { success: false, chat_id: link.chat_id, error: error.message };
      }
    });

    const results = await Promise.all(sendPromises);
    const successCount = results.filter(r => r.success).length;
    const failedResults = results.filter(r => !r.success);

    // Логируем результат в audit_logs
    const logData = {
      action: 'telegram_personal_notification',
      details: {
        target_users: targetUserIds,
        message_preview: message.substring(0, 100),
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

  } catch (error) {
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
