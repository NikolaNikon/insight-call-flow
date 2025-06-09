
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
  superadmin: 'Вы будете получать:\n– Все системные уведомления\n– Критические оповещения\n– Полную аналитику работы системы\n\nВысший уровень доступа активирован. 👑',
  operator: 'Вы будете получать уведомления о входящих звонках, комментариях и тегах,\nсвязанных с вашими диалогами.\n\nХорошей работы и отличных звонков! ☎️',
  viewer: 'Вы будете получать:\n– Обзорные уведомления по тревожным звонкам\n– Сводки по качеству коммуникаций команды\n\nВы в курсе, но без лишнего шума. 👀',
  manager: 'Вы будете получать:\n– Оповещения о звонках в вашей зоне ответственности\n– Комментарии и действия команды\n\nКонтроль и качество — в ваших руках! 💬'
};

const getRoleDisplayName = (role: string) => {
  const roleNames: { [key: string]: string } = {
    admin: 'Администратор',
    superadmin: 'Суперадмин',
    operator: 'Оператор',
    viewer: 'Наблюдатель',
    manager: 'Менеджер'
  };
  return roleNames[role] || role;
};

const getFriendlyName = (firstName?: string, username?: string) => {
  return firstName || username || 'друг';
};

serve(async (req) => {
  console.log('=== Telegram Bot Function Called ===');
  console.log('Method:', req.method);

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

    if (!message?.text || !message?.from) {
      console.log('No valid message data, ignoring');
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

    let responseMessage = '';

    // Обработка команд
    if (text.startsWith('/start')) {
      console.log('Processing /start command');
      const parts = text.split(' ');
      console.log('Command parts:', parts);
      
      if (parts.length > 1) {
        // Есть session_code - процесс подключения через ссылку
        const sessionCode = parts[1];
        console.log('Processing session code:', sessionCode);
        
        // Вызываем функцию confirm для обработки кода
        try {
          const { data: confirmResult, error: confirmError } = await supabaseClient.functions.invoke(
            'telegram-confirm',
            {
              body: {
                code: sessionCode,
                chat_id: chatId,
                first_name: firstName,
                username: username
              }
            }
          );

          console.log('Confirm function result:', { confirmResult, confirmError });

          if (confirmError || !confirmResult || confirmResult.status !== 'ok') {
            const errorMsg = confirmResult?.error || confirmError?.message || 'Unknown error';
            console.log('Confirmation failed:', errorMsg);
            
            if (errorMsg.includes('Code not found') || errorMsg.includes('expired')) {
              responseMessage = "❌ Неверный или истекший код подключения.\n\n🔄 Попробуйте сгенерировать новую ссылку в CallControl:\nНастройки → Интеграции → Подключить Telegram бот";
            } else if (errorMsg.includes('already linked')) {
              responseMessage = "⚠️ Этот Telegram-аккаунт уже привязан к другому пользователю.\n\nДля подключения используйте другой Telegram-аккаунт или обратитесь к администратору.";
            } else {
              responseMessage = "❌ Ошибка при подключении. Попробуйте еще раз или обратитесь к администратору.";
            }
          } else {
            // Успешное подключение
            const userRole = confirmResult.user_role || 'operator';
            const roleDisplayName = getRoleDisplayName(userRole);
            const roleGreeting = greetingsByRole[userRole as keyof typeof greetingsByRole] || greetingsByRole.operator;
            const friendlyName = getFriendlyName(firstName, username);

            console.log('Creating personalized greeting for:', { friendlyName, userRole, roleDisplayName });

            responseMessage = `Привет, ${friendlyName}! 👋\n✅ Telegram подключён к CallControl как ${roleDisplayName}.\n\n${roleGreeting}\n\n💡 Используйте /help для просмотра доступных команд.`;
          }
        } catch (error) {
          console.error('Error calling confirm function:', error);
          responseMessage = "❌ Ошибка сервера при подтверждении кода. Попробуйте позже.";
        }
      } else {
        // Обычный /start без параметров
        console.log('Processing /start without parameters - checking existing connection');
        
        // Проверяем, есть ли уже подключение для этого чата
        const { data: existingConnection, error: connectionError } = await supabaseClient
          .from('telegram_links')
          .select('*, users!inner(name, role)')
          .eq('chat_id', chatId)
          .eq('active', true)
          .maybeSingle();

        console.log('Existing connection check for chat:', { existingConnection, connectionError });

        if (existingConnection) {
          // Пользователь уже подключен
          const roleDisplayName = getRoleDisplayName(existingConnection.users.role);
          const friendlyName = getFriendlyName(firstName, username);
          const roleGreeting = greetingsByRole[existingConnection.users.role as keyof typeof greetingsByRole] || greetingsByRole.operator;
          
          responseMessage = `👋 Привет снова, ${friendlyName}!\n\n✅ Ваш Telegram уже подключён к CallControl (роль: ${roleDisplayName}).\n\n${roleGreeting}\n\n💡 При необходимости используйте /stop для отключения или /help для просмотра команд.`;
        } else {
          // Нет подключения
          const friendlyName = getFriendlyName(firstName, username);
          responseMessage = `🤖 Добро пожаловать в CallControl, ${friendlyName}!\n\n📋 Для подключения вашего аккаунта:\n1. Откройте CallControl в браузере\n2. Перейдите в Настройки → Интеграции\n3. Нажмите "Подключить Telegram бот"\n4. Перейдите по полученной ссылке\n\n💡 Или используйте команду /help для дополнительной информации.`;
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
        const friendlyName = getFriendlyName(firstName, username);
        responseMessage = `👋 До свидания, ${friendlyName}!\n\n❌ Уведомления отключены.\n\n🔄 Для повторного подключения используйте новую ссылку из CallControl:\nНастройки → Интеграции → Подключить Telegram бот`;
      } else {
        responseMessage = "❓ Активное подключение не найдено.\n\n📋 Для подключения используйте ссылку из CallControl:\nНастройки → Интеграции → Подключить Telegram бот";
      }
    } else if (text === '/help') {
      console.log('Processing /help command');
      const friendlyName = getFriendlyName(firstName, username);
      responseMessage = `📋 Доступные команды, ${friendlyName}:\n\n/start - Подключить аккаунт CallControl\n/stop - Отключить уведомления\n/status - Проверить статус подключения\n/help - Показать эту справку\n\n🔔 После подключения вы будете получать:\n• Уведомления о новых звонках\n• Еженедельные отчеты\n• Важные системные сообщения\n\n💡 Для подключения получите ссылку в CallControl:\nНастройки → Интеграции → Подключить Telegram бот`;
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
        const friendlyName = getFriendlyName(firstName, username);
        responseMessage = `📊 Статус подключения: ${status}\n\n👤 Пользователь: ${friendlyName}\n🎭 Роль: ${roleDisplayName}\n📅 Подключен: ${connectedDate}\n🏷️ Username: ${statusLink.telegram_username ? '@' + statusLink.telegram_username : 'не указан'}`;
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
