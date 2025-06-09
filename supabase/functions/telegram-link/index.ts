
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkRequest {
  code: string;
  chat_id: number;
  telegram_username?: string;
  first_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { code, chat_id, telegram_username, first_name }: LinkRequest = await req.json();

    if (!code || !chat_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Code and chat_id are required' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Получаем авторизационный заголовок
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Authorization required' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Получаем пользователя из токена
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid authorization token' 
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Проверяем существование и валидность кода
    const { data: authCode, error: codeError } = await supabaseClient
      .from('telegram_auth_codes')
      .select('*')
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (codeError || !authCode) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Код недействителен или устарел' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Проверяем, не привязан ли уже этот chat_id к другому пользователю
    const { data: existingLink } = await supabaseClient
      .from('telegram_links')
      .select('user_id')
      .eq('chat_id', chat_id)
      .single();

    if (existingLink && existingLink.user_id !== user.id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Этот Telegram аккаунт уже привязан к другому пользователю' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Создаем или обновляем связь
    const { error: linkError } = await supabaseClient
      .from('telegram_links')
      .upsert({
        user_id: user.id,
        chat_id: chat_id,
        telegram_username: telegram_username || null,
        first_name: first_name || null,
        active: true
      }, {
        onConflict: 'chat_id'
      });

    if (linkError) {
      console.error('Error creating telegram link:', linkError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Ошибка при создании связи' 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Помечаем код как использованный
    await supabaseClient
      .from('telegram_auth_codes')
      .update({ used: true })
      .eq('id', authCode.id);

    // Отправляем подтверждение в Telegram
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (botToken) {
      await fetch(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chat_id,
            text: `✅ Аккаунт успешно подключен!\n\nТеперь вы будете получать персональные уведомления от CallControl.`,
            parse_mode: 'HTML'
          }),
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Аккаунт успешно подключен!' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in telegram-link function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Внутренняя ошибка сервера' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
