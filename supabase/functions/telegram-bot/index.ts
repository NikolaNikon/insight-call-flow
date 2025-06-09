
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { TelegramUpdate, TelegramUser } from './types.ts';
import { sendTelegramMessage } from './telegram-api.ts';
import {
  handleStartCommand,
  handleStopCommand,
  handleHelpCommand,
  handleStatusCommand,
  handleUnknownCommand
} from './commands.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    const user: TelegramUser = {
      id: userId,
      first_name: message.from.first_name || '',
      username: message.from.username || ''
    };

    console.log('Processing message from user:', userId, 'chat:', chatId, 'text:', text);

    let responseMessage = '';

    // Обработка команд
    if (text.startsWith('/start')) {
      responseMessage = await handleStartCommand(supabaseClient, chatId, text, user);
    } else if (text === '/stop') {
      responseMessage = await handleStopCommand(supabaseClient, chatId, user);
    } else if (text === '/help') {
      responseMessage = handleHelpCommand(user);
    } else if (text === '/status') {
      responseMessage = await handleStatusCommand(supabaseClient, chatId, user);
    } else {
      responseMessage = handleUnknownCommand(text);
    }

    // Отправляем ответ
    await sendTelegramMessage(botToken, {
      chat_id: chatId,
      text: responseMessage
    });

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
