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
      console.error('No authorization header provided');
      throw new Error('Authorization header required');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Invalid authentication');
    }

    console.log('User authenticated:', user.id);

    // Получаем информацию о пользователе и его организации
    const { data: userData, error: userError } = await supabaseClient
      .from('users')
      .select(`
        name, 
        role, 
        org_id,
        organizations!inner(
          id,
          name,
          subdomain
        )
      `)
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('User data error:', userError);
      throw new Error('User not found in database');
    }

    console.log('User data retrieved:', userData.name, userData.role, userData.org_id);

    // Получаем настройки Telegram бота для организации
    const { data: telegramSettings, error: settingsError } = await supabaseClient
      .from('telegram_settings')
      .select('bot_username, bot_token, is_active')
      .eq('org_id', userData.org_id)
      .eq('is_active', true)
      .single();

    if (settingsError || !telegramSettings) {
      console.error('Telegram settings error:', settingsError);
      throw new Error('Telegram bot not configured for this organization');
    }

    if (!telegramSettings.bot_username) {
      throw new Error('Bot username not configured');
    }

    // Генерируем уникальный session_code с префиксом tg_org_
    const sessionCode = generateSessionCodeWithPrefix();
    console.log('Generated session code:', sessionCode);
    
    // Очищаем старые сессии пользователя
    const { error: deleteError } = await supabaseClient
      .from('telegram_sessions')
      .delete()
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting old sessions:', deleteError);
    }

    // Создаем новую сессию с информацией о пользователе и организации
    const { data: session, error: sessionError } = await supabaseClient
      .from('telegram_sessions')
      .insert({
        session_code: sessionCode,
        user_id: user.id,
        user_name: userData.name,
        user_role: userData.role,
        org_id: userData.org_id
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      throw sessionError;
    }

    console.log('Session created successfully:', session.id);

    // Формируем ссылку на бота организации
    const telegramUrl = `https://t.me/${telegramSettings.bot_username}?start=${sessionCode}`;

    return new Response(
      JSON.stringify({
        success: true,
        session_code: sessionCode,
        telegram_url: telegramUrl,
        url: telegramUrl,
        expires_at: session.expires_at,
        bot_username: telegramSettings.bot_username,
        organization: userData.organizations.name
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in telegram-start-session-org function:', error);
    
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

function generateSessionCodeWithPrefix(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'tg_org_';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
