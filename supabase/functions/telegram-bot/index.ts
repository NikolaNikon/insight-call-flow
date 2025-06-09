
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

const greetingsByRole = {
  admin: 'Вы будете получать:\n– Уведомления о тревожных звонках\n– Информацию об активности менеджеров\n– Системные оповещения о событиях в команде\n\nВсе под контролем. 🛠',
  operator: 'Вы будете получать уведомления о входящих звонках, комментариях и тегах,\nсвязанных с вашими диалогами.\n\nХорошей работы и отличных звонков! ☎️',
  observer: 'Вы будете получать:\n– Обзорные уведомления по тревожным звонкам\n– Сводки по качеству коммуникаций команды\n\nВы в курсе, но без лишнего шума. 👀',
  manager: 'Вы будете получать:\n– Оповещения о звонках в вашей зоне ответственности\n– Комментарии и действия команды\n\nКонтроль и качество — в ваших руках! 💬'
};

const getRoleDisplayName = (role: string) => {
  const roleNames: { [key: string]: string } = {
    admin: 'Администратор',
    operator: 'Оператор',
    observer: 'Наблюдатель',
    manager: 'Менеджер'
  };
  return roleNames[role] || role;
};

serve(async (req) => {
  console.log('=== Telegram Bot Function Called ===');
  console.log('Method:', req.method);
  console.log('Headers:', Object.fromEntries(req.headers.entries()));

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
      throw new Error('Telegram bot token not configured');
    }
    console.log('Bot token found, length:', botToken.length);

    // Получаем и логируем тело запроса
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);

    let update: TelegramUpdate;
    try {
      update = JSON.parse(requestBody);
      console.log('Parsed update:', JSON.stringify(update, null, 2));
    } catch (parseError) {
      console.error('Failed to parse request body as JSON:', parseError);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = update.message;

    if (!message) {
      console.log('No message in update, ignoring');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message.text) {
      console.log('No text in message, ignoring');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!message.from) {
      console.log('No from user in message, ignoring');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const chatId = message.chat.id;
    const userId = message.from.id;
    const text = message.text.trim();
    const firstName = message.from.first_name || '';
    const username = message.from.username || '';

    console.log('Processing message from user:', userId, 'chat:', chatId, 'text:', text);
    console.log('User details:', { firstName, username });

    let responseMessage = '';

    // Обработка команд
    if (text.startsWith('/start')) {
      console.log('Processing /start command');
      const parts = text.split(' ');
      console.log('Command parts:', parts);
      
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

        console.log('Session query result:', { session, sessionError });

        if (sessionError || !session) {
          console.log('Invalid session:', sessionError?.message || 'Session not found');
          responseMessage = "❌ Неверный или истекший код подключения. Попробуйте сгенерировать новую ссылку в CallControl.";
        } else {
          console.log('Valid session found for user:', session.user_id);
          
          // Проверяем, есть ли уже активная связка для этого пользователя
          const { data: existingLink, error: existingLinkError } = await supabaseClient
            .from('telegram_links')
            .select('*')
            .eq('user_id', session.user_id)
            .eq('active', true)
            .maybeSingle();

          console.log('Existing link check:', { existingLink, existingLinkError });

          if (existingLink) {
            // Обновляем существующую связку
            console.log('Updating existing link:', existingLink.id);
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
            } else {
              console.log('Successfully updated existing link');
            }
          } else {
            // Создаем новую связку
            console.log('Creating new telegram link');
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
            } else {
              console.log('Successfully created new telegram link');
            }
          }

          if (!responseMessage) {
            // Помечаем сессию как использованную
            console.log('Marking session as used');
            const { error: sessionUpdateError } = await supabaseClient
              .from('telegram_sessions')
              .update({ used: true })
              .eq('id', session.id);

            if (sessionUpdateError) {
              console.error('Error marking session as used:', sessionUpdateError);
            }

            // Формируем персонализированное приветствие
            const userName = session.user_name || firstName;
            const userRole = session.user_role || 'user';
            const roleDisplayName = getRoleDisplayName(userRole);
            const roleGreeting = greetingsByRole[userRole as keyof typeof greetingsByRole] || greetingsByRole.operator;

            console.log('Creating personalized greeting for:', { userName, userRole, roleDisplayName });

            responseMessage = `Привет, ${userName}! 👋
✅ Telegram подключён к вашему аккаунту CallControl (роль: ${roleDisplayName}).

${roleGreeting}

Используйте /help для просмотра доступных команд.`;
          }
        }
      } else {
        // Обычный /start без параметров
        console.log('Processing /start without parameters');
        // Проверяем, есть ли уже подключение
        const { data: existingConnection, error: connectionError } = await supabaseClient
          .from('telegram_links')
          .select('*, users!inner(name, role)')
          .eq('chat_id', chatId)
          .eq('active', true)
          .maybeSingle();

        console.log('Existing connection check:', { existingConnection, connectionError });

        if (existingConnection) {
          const roleDisplayName = getRoleDisplayName(existingConnection.users.role);
          responseMessage = `✅ Вы уже подключены. Роль: ${roleDisplayName}.
Уведомления включены. При необходимости введите /stop.

Используйте /help для просмотра команд.`;
        } else {
          responseMessage = `🤖 Добро пожаловать в CallControl!

Для подключения вашего аккаунта:
1. Откройте CallControl в браузере
2. Перейдите в настройки → Интеграции
3. Нажмите "Подключить Telegram бот"
4. Перейдите по полученной ссылке

Или используйте команду /help для дополнительной информации.`;
        }
      }
    } else if (text === '/stop') {
      console.log('Processing /stop command');
      // Деактивируем пользователя
      const { data: linkData, error: stopError } = await supabaseClient
        .from('telegram_links')
        .update({ active: false })
        .eq('chat_id', chatId)
        .select()
        .maybeSingle();

      console.log('Stop command result:', { linkData, stopError });

      if (linkData) {
        responseMessage = "❌ Уведомления отключены. Используйте новую ссылку из CallControl для повторного подключения.";
      } else {
        responseMessage = "❓ Аккаунт не найден. Используйте ссылку из CallControl для подключения.";
      }
    } else if (text === '/help') {
      console.log('Processing /help command');
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
      console.log('Processing /status command');
      const { data: statusLink, error: statusError } = await supabaseClient
        .from('telegram_links')
        .select('active, created_at, telegram_username, users!inner(name, role)')
        .eq('chat_id', chatId)
        .maybeSingle();

      console.log('Status command result:', { statusLink, statusError });

      if (statusLink) {
        const status = statusLink.active ? "✅ Активен" : "❌ Отключен";
        const connectedDate = new Date(statusLink.created_at).toLocaleDateString('ru-RU');
        const roleDisplayName = getRoleDisplayName(statusLink.users.role);
        responseMessage = `📊 Статус подключения: ${status}
📅 Подключен: ${connectedDate}
👤 Username: @${statusLink.telegram_username || 'не указан'}
🎭 Роль: ${roleDisplayName}
👋 Имя: ${statusLink.users.name}`;
      } else {
        responseMessage = "❓ Аккаунт не подключен. Получите ссылку в CallControl для подключения.";
      }
    } else {
      console.log('Unknown command:', text);
      responseMessage = "❓ Неизвестная команда. Используйте /help для просмотра доступных команд.";
    }

    console.log('Sending response message:', responseMessage);

    // Отправляем ответ
    const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
    console.log('Calling Telegram API:', telegramApiUrl);

    const telegramResponse = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: responseMessage,
        parse_mode: 'HTML'
      } as TelegramMessage),
    });

    const telegramResponseText = await telegramResponse.text();
    console.log('Telegram API response status:', telegramResponse.status);
    console.log('Telegram API response body:', telegramResponseText);

    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramResponseText);
    } else {
      console.log('Message sent successfully to Telegram');
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in telegram-bot function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
