
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Получаем пользователя из JWT токена
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Генерируем уникальный session_code
    const sessionCode = generateSessionCode();
    
    // Очищаем старые сессии пользователя
    await supabaseClient
      .from('telegram_sessions')
      .delete()
      .eq('user_id', user.id);

    // Создаем новую сессию
    const { data: session, error: sessionError } = await supabaseClient
      .from('telegram_sessions')
      .insert({
        session_code: sessionCode,
        user_id: user.id
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Формируем ссылку на бота
    const botUsername = 'callcontrol_tgbot'; // Замените на ваше имя бота
    const telegramUrl = `https://t.me/${botUsername}?start=${sessionCode}`;

    return new Response(
      JSON.stringify({
        success: true,
        session_code: sessionCode,
        telegram_url: telegramUrl,
        expires_at: session.expires_at
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in telegram-start-session function:', error);
    
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

function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
