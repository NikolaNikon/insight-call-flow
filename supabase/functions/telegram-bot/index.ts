
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelegramUpdate {
  message?: {
    chat: {
      id: number;
      type: string;
    };
    from?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    text?: string;
  };
}

interface TelegramMessage {
  chat_id: number;
  text: string;
  parse_mode?: string;
  reply_markup?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      throw new Error('Telegram bot token not configured');
    }

    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (!message || !message.text || !message.from) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text.trim();
    const firstName = message.from.first_name || '';
    const username = message.from.username || '';

    let responseMessage = '';
    let replyMarkup = null;

    switch (text) {
      case '/start':
        // Генерируем уникальный код для авторизации
        const authCode = generateAuthCode();
        const authUrl = `https://callcontrol.app/telegram-auth?code=${authCode}`;
        
        // Сохраняем код в базу (без user_id, так как пользователь еще не авторизован)
        await supabaseClient
          .from('telegram_auth_codes')
          .insert({
            code: authCode,
            user_id: null // Будет заполнен при авторизации на сайте
          });

        responseMessage = `🤖 Добро пожаловать в CallControl!

Для получения персональных уведомлений необходимо подключить ваш аккаунт.

Нажмите кнопку ниже для авторизации:`;

        replyMarkup = {
          inline_keyboard: [[
            {
              text: "🔗 Подключить аккаунт",
              url: authUrl
            }
          ]]
        };
        break;

      case '/stop':
        // Деактивируем пользователя
        const { data: linkData } = await supabaseClient
          .from('telegram_links')
          .update({ active: false })
          .eq('chat_id', chatId)
          .select()
          .single();

        if (linkData) {
          responseMessage = "❌ Уведомления отключены. Используйте /start для повторного подключения.";
        } else {
          responseMessage = "❓ Аккаунт не найден. Используйте /start для подключения.";
        }
        break;

      case '/help':
        responseMessage = `📋 Доступные команды:

/start - Подключить аккаунт CallControl
/stop - Отключить уведомления  
/status - Статус подключения
/help - Показать эту справку

🔔 После подключения вы будете получать:
• Уведомления о новых звонках
• Еженедельные отчеты
• Важные системные сообщения`;
        break;

      case '/status':
        const { data: statusLink } = await supabaseClient
          .from('telegram_links')
          .select('active, created_at, telegram_username')
          .eq('chat_id', chatId)
          .single();

        if (statusLink) {
          const status = statusLink.active ? "✅ Активен" : "❌ Отключен";
          const connectedDate = new Date(statusLink.created_at).toLocaleDateString('ru-RU');
          responseMessage = `📊 Статус подключения: ${status}
📅 Подключен: ${connectedDate}
👤 Username: @${statusLink.telegram_username || 'не указан'}`;
        } else {
          responseMessage = "❓ Аккаунт не подключен. Используйте /start для подключения.";
        }
        break;

      default:
        responseMessage = "❓ Неизвестная команда. Используйте /help для просмотра доступных команд.";
        break;
    }

    // Отправляем ответ
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: responseMessage,
          parse_mode: 'HTML',
          reply_markup: replyMarkup
        } as TelegramMessage),
      }
    );

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', await telegramResponse.text());
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in telegram-bot function:', error);
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function generateAuthCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
