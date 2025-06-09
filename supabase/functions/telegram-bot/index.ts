
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
          responseMessage = "❌ Неверный или истекший код подключения.\n\n🔄 Попробуйте сгенерировать новую ссылку в CallControl:\nНастройки → Интеграции → Подключить Telegram бот";
        } else {
          console.log('Valid session found for user:', session.user_id);
          
          // Проверяем, есть ли уже активная связка для этого чата
          const { data: existingChatLink, error: existingChatError } = await supabaseClient
            .from('telegram_links')
            .select('*, users!inner(name, role)')
            .eq('chat_id', chatId)
            .eq('active', true)
            .maybeSingle();

          console.log('Existing chat link check:', { existingChatLink, existingChatError });

          if (existingChatLink && existingChatLink.user_id !== session.user_id) {
            // Этот Telegram уже привязан к другому пользователю
            console.log('Chat already linked to different user');
            const otherUserName = existingChatLink.users?.name || 'другому пользователю';
            responseMessage = `⚠️ Этот Telegram-аккаунт уже привязан к ${otherUserName}.\n\nДля подключения используйте другой Telegram-аккаунт или обратитесь к администратору.`;
          } else {
            // Проверяем, есть ли уже активная связка для этого пользователя
            const { data: existingUserLink, error: existingUserError } = await supabaseClient
              .from('telegram_links')
              .select('*')
              .eq('user_id', session.user_id)
              .eq('active', true)
              .maybeSingle();

            console.log('Existing user link check:', { existingUserLink, existingUserError });

            if (existingUserLink && existingUserLink.chat_id !== chatId) {
              // У пользователя уже есть другой активный Telegram
              console.log('User already has different telegram linked');
              responseMessage = `⚠️ У вас уже подключен другой Telegram-аккаунт.\n\nСначала отключите предыдущий в настройках CallControl, затем повторите подключение.`;
            } else if (existingUserLink && existingUserLink.chat_id === chatId) {
              // Повторное подключение того же аккаунта
              console.log('Re-connecting same telegram account');
              const { error: updateError } = await supabaseClient
                .from('telegram_links')
                .update({
                  telegram_username: username,
                  first_name: firstName,
                  updated_at: new Date().toISOString()
                })
                .eq('id', existingUserLink.id);

              if (updateError) {
                console.error('Error updating existing link:', updateError);
                responseMessage = "❌ Ошибка при обновлении подключения.";
              } else {
                console.log('Successfully updated existing link');
                // Помечаем сессию как использованную
                await supabaseClient
                  .from('telegram_sessions')
                  .update({ used: true })
                  .eq('id', session.id);

                responseMessage = `✅ Telegram уже подключён к вашему аккаунту CallControl.\n\n📱 Подключение обновлено успешно!\n\nИспользуйте /help для просмотра команд.`;
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
                responseMessage = "❌ Ошибка при создании подключения.\n\nПопробуйте еще раз или обратитесь к администратору.";
              } else {
                console.log('Successfully created new telegram link');
                
                // Помечаем сессию как использованную
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

                responseMessage = `Привет, ${userName}! 👋\n✅ Telegram подключён к вашему аккаунту CallControl (роль: ${roleDisplayName}).\n\n${roleGreeting}\n\nИспользуйте /help для просмотра доступных команд.`;
              }
            }
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
          const userName = existingConnection.users.name || firstName;
          responseMessage = `👋 Привет, ${userName}!\n\n✅ Вы уже подключены к CallControl (роль: ${roleDisplayName}).\n🔔 Уведомления включены.\n\n💡 При необходимости используйте /stop для отключения.\n\nИспользуйте /help для просмотра команд.`;
        } else {
          responseMessage = `🤖 Добро пожаловать в CallControl!\n\n📋 Для подключения вашего аккаунта:\n1. Откройте CallControl в браузере\n2. Перейдите в Настройки → Интеграции\n3. Нажмите "Подключить Telegram бот"\n4. Перейдите по полученной ссылке\n\n💡 Или используйте команду /help для дополнительной информации.`;
        }
      }
    } else if (text === '/stop') {
      console.log('Processing /stop command');
      // Деактивируем пользователя
      const { data: linkData, error: stopError } = await supabaseClient
        .from('telegram_links')
        .update({ active: false })
        .eq('chat_id', chatId)
        .select('*, users!inner(name)')
        .maybeSingle();

      console.log('Stop command result:', { linkData, stopError });

      if (linkData) {
        const userName = linkData.users?.name || firstName;
        responseMessage = `👋 До свидания, ${userName}!\n\n❌ Уведомления отключены.\n\n🔄 Для повторного подключения используйте новую ссылку из CallControl:\nНастройки → Интеграции → Подключить Telegram бот`;
      } else {
        responseMessage = "❓ Активное подключение не найдено.\n\n📋 Для подключения используйте ссылку из CallControl:\nНастройки → Интеграции → Подключить Telegram бот";
      }
    } else if (text === '/help') {
      console.log('Processing /help command');
      responseMessage = `📋 Доступные команды:\n\n/start - Подключить аккаунт CallControl\n/stop - Отключить уведомления\n/status - Проверить статус подключения\n/help - Показать эту справку\n\n🔔 После подключения вы будете получать:\n• Уведомления о новых звонках\n• Еженедельные отчеты\n• Важные системные сообщения\n\n💡 Для подключения получите ссылку в CallControl:\nНастройки → Интеграции → Подключить Telegram бот`;
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
        const userName = statusLink.users.name || firstName;
        responseMessage = `📊 Статус подключения: ${status}\n\n👤 Пользователь: ${userName}\n🎭 Роль: ${roleDisplayName}\n📅 Подключен: ${connectedDate}\n🏷️ Username: ${statusLink.telegram_username ? '@' + statusLink.telegram_username : 'не указан'}`;
      } else {
        responseMessage = "❓ Аккаунт не подключен.\n\n📋 Получите ссылку в CallControl для подключения:\nНастройки → Интеграции → Подключить Telegram бот";
      }
    } else {
      console.log('Unknown command:', text);
      responseMessage = `❓ Неизвестная команда: "${text}"\n\n💡 Используйте /help для просмотра доступных команд.`;
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
