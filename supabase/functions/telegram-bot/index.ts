
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

    console.log('Processing message:', text, 'from chat:', chatId);

    let responseMessage = '';

    // Обработка команд
    if (text.startsWith('/start')) {
      const parts = text.split(' ');
      
      if (parts.length > 1) {
        // Есть session_code
        const sessionCode = parts[1];
        console.log('Processing session code:', sessionCode);
        
        // Ищем активную сессию
        const { data: session, error: sessionError } = await supabaseClient
          .from('telegram_sessions')
          .select('*')
          .eq('session_code', sessionCode)
          .eq('used', false)
          .gte('expires_at', new Date().toISOString())
          .single();

        if (sessionError || !session) {
          console.log('Invalid session:', sessionError);
          responseMessage = "❌ Неверный или истекший код подключения. Попробуйте сгенерировать новую ссылку в CallControl.";
        } else {
          console.log('Valid session found for user:', session.user_id);
          
          // Проверяем, есть ли уже активная связка для этого пользователя
          const { data: existingLink } = await supabaseClient
            .from('telegram_links')
            .select('*')
            .eq('user_id', session.user_id)
            .eq('active', true)
            .maybeSingle();

          if (existingLink) {
            // Обновляем существующую связку
            const { error: updateError } = await supabaseClient
              .from('telegram_links')
              .update({
                chat_id: chatId,
                telegram_username: username,
                first_name: firstName,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingLink.id);

            if (updateError) {
              console.error('Error updating existing link:', updateError);
              responseMessage = "❌ Ошибка при обновлении подключения.";
            }
          } else {
            // Создаем новую связку
            const { error: insertError } = await supabaseClient
              .from('telegram_links')
              .insert({
                user_id: session.user_id,
                chat_id: chatId,
                telegram_username: username,
                first_name: firstName,
                active: true
              });

            if (insertError) {
              console.error('Error creating new link:', insertError);
              responseMessage = "❌ Ошибка при создании подключения.";
            }
          }

          if (!responseMessage) {
            // Помечаем сессию как использованную
            await supabaseClient
              .from('telegram_sessions')
              .update({ used: true })
              .eq('id', session.id);

            responseMessage = `✅ Отлично! Ваш аккаунт CallControl успешно подключен к Telegram.

🔔 Теперь вы будете получать:
• Уведомления о новых звонках
• Еженедельные отчеты
• Важные системные сообщения

Используйте /help для просмотра доступных команд.`;
          }
        }
      } else {
        // Обычный /start без параметров
        responseMessage = `🤖 Добро пожаловать в CallControl!

Для подключения вашего аккаунта:
1. Откройте CallControl в браузере
2. Перейдите в настройки → Интеграции
3. Нажмите "Подключить Telegram бот"
4. Перейдите по полученной ссылке

Или используйте команду /help для дополнительной информации.`;
      }
    } else if (text === '/stop') {
      // Деактивируем пользователя
      const { data: linkData } = await supabaseClient
        .from('telegram_links')
        .update({ active: false })
        .eq('chat_id', chatId)
        .select()
        .maybeSingle();

      if (linkData) {
        responseMessage = "❌ Уведомления отключены. Используйте новую ссылку из CallControl для повторного подключения.";
      } else {
        responseMessage = "❓ Аккаунт не найден. Используйте ссылку из CallControl для подключения.";
      }
    } else if (text === '/help') {
      responseMessage = `📋 Доступные команды:

/start - Подключить аккаунт CallControl
/stop - Отключить уведомления  
/status - Статус подключения
/help - Показать эту справку

🔔 После подключения вы будете получать:
• Уведомления о новых звонках
• Еженедельные отчеты
• Важные системные сообщения

💡 Для подключения получите ссылку в CallControl:
Настройки → Интеграции → Подключить Telegram бот`;
    } else if (text === '/status') {
      const { data: statusLink } = await supabaseClient
        .from('telegram_links')
        .select('active, created_at, telegram_username')
        .eq('chat_id', chatId)
        .maybeSingle();

      if (statusLink) {
        const status = statusLink.active ? "✅ Активен" : "❌ Отключен";
        const connectedDate = new Date(statusLink.created_at).toLocaleDateString('ru-RU');
        responseMessage = `📊 Статус подключения: ${status}
📅 Подключен: ${connectedDate}
👤 Username: @${statusLink.telegram_username || 'не указан'}`;
      } else {
        responseMessage = "❓ Аккаунт не подключен. Получите ссылку в CallControl для подключения.";
      }
    } else {
      responseMessage = "❓ Неизвестная команда. Используйте /help для просмотра доступных команд.";
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
          parse_mode: 'HTML'
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
