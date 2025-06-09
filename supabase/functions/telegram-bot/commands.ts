
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TelegramUser } from './types.ts';
import { greetingsByRole, getRoleDisplayName, getFriendlyName } from './greetings.ts';

export const handleStartCommand = async (
  supabaseClient: any,
  chatId: number,
  text: string,
  user: TelegramUser
) => {
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
            first_name: user.first_name,
            username: user.username
          }
        }
      );

      console.log('Confirm function result:', { confirmResult, confirmError });

      if (confirmError || !confirmResult || confirmResult.status !== 'ok') {
        const errorMsg = confirmResult?.error || confirmError?.message || 'Unknown error';
        console.log('Confirmation failed:', errorMsg);
        
        if (errorMsg.includes('Code not found') || errorMsg.includes('expired')) {
          return "❌ Неверный или истекший код подключения.\n\n🔄 Попробуйте сгенерировать новую ссылку в CallControl:\nНастройки → Интеграции → Подключить Telegram бот";
        } else if (errorMsg.includes('already linked')) {
          return "⚠️ Этот Telegram-аккаунт уже привязан к другому пользователю.\n\nДля подключения используйте другой Telegram-аккаунт или обратитесь к администратору.";
        } else {
          return "❌ Ошибка при подключении. Попробуйте еще раз или обратитесь к администратору.";
        }
      } else {
        // Успешное подключение
        const userRole = confirmResult.user_role || 'operator';
        const roleDisplayName = getRoleDisplayName(userRole);
        const roleGreeting = greetingsByRole[userRole as keyof typeof greetingsByRole] || greetingsByRole.operator;
        const friendlyName = getFriendlyName(user.first_name, user.username);

        console.log('Creating personalized greeting for:', { friendlyName, userRole, roleDisplayName });

        return `Привет, ${friendlyName}! 👋\n✅ Telegram подключён к CallControl как ${roleDisplayName}.\n\n${roleGreeting}\n\n💡 Используйте /help для просмотра доступных команд.`;
      }
    } catch (error) {
      console.error('Error calling confirm function:', error);
      return "❌ Ошибка сервера при подтверждении кода. Попробуйте позже.";
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
      const friendlyName = getFriendlyName(user.first_name, user.username);
      const roleGreeting = greetingsByRole[existingConnection.users.role as keyof typeof greetingsByRole] || greetingsByRole.operator;
      
      return `👋 Привет снова, ${friendlyName}!\n\n✅ Ваш Telegram уже подключён к CallControl (роль: ${roleDisplayName}).\n\n${roleGreeting}\n\n💡 При необходимости используйте /stop для отключения или /help для просмотра команд.`;
    } else {
      // Нет подключения
      const friendlyName = getFriendlyName(user.first_name, user.username);
      return `🤖 Добро пожаловать в CallControl, ${friendlyName}!\n\n📋 Для подключения вашего аккаунта:\n1. Откройте CallControl в браузере\n2. Перейдите в Настройки → Интеграции\n3. Нажмите "Подключить Telegram бот"\n4. Перейдите по полученной ссылке\n\n💡 Или используйте команду /help для дополнительной информации.`;
    }
  }
};

export const handleStopCommand = async (
  supabaseClient: any,
  chatId: number,
  user: TelegramUser
) => {
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
    const friendlyName = getFriendlyName(user.first_name, user.username);
    return `👋 До свидания, ${friendlyName}!\n\n❌ Уведомления отключены.\n\n🔄 Для повторного подключения используйте новую ссылку из CallControl:\nНастройки → Интеграции → Подключить Telegram бот`;
  } else {
    return "❓ Активное подключение не найдено.\n\n📋 Для подключения используйте ссылку из CallControl:\nНастройки → Интеграции → Подключить Telegram бот";
  }
};

export const handleHelpCommand = (user: TelegramUser) => {
  console.log('Processing /help command');
  const friendlyName = getFriendlyName(user.first_name, user.username);
  return `📋 Доступные команды, ${friendlyName}:\n\n/start - Подключить аккаунт CallControl\n/stop - Отключить уведомления\n/status - Проверить статус подключения\n/help - Показать эту справку\n\n🔔 После подключения вы будете получать:\n• Уведомления о новых звонках\n• Еженедельные отчеты\n• Важные системные сообщения\n\n💡 Для подключения получите ссылку в CallControl:\nНастройки → Интеграции → Подключить Telegram бот`;
};

export const handleStatusCommand = async (
  supabaseClient: any,
  chatId: number,
  user: TelegramUser
) => {
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
    const friendlyName = getFriendlyName(user.first_name, user.username);
    return `📊 Статус подключения: ${status}\n\n👤 Пользователь: ${friendlyName}\n🎭 Роль: ${roleDisplayName}\n📅 Подключен: ${connectedDate}\n🏷️ Username: ${statusLink.telegram_username ? '@' + statusLink.telegram_username : 'не указан'}`;
  } else {
    return "❓ Аккаунт не подключен.\n\n📋 Получите ссылку в CallControl для подключения:\nНастройки → Интеграции → Подключить Telegram бот";
  }
};

export const handleUnknownCommand = (text: string) => {
  console.log('Unknown command:', text);
  return `❓ Неизвестная команда: "${text}"\n\n💡 Используйте /help для просмотра доступных команд.`;
};
