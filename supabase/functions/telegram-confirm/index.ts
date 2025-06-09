
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConfirmRequest {
  code: string;
  chat_id: number;
  first_name?: string;
  username?: string;
}

serve(async (req) => {
  console.log('=== Telegram Confirm Function Called ===');
  console.log('Method:', req.method);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body = await req.json();
    console.log('Request body:', body);

    const { code, chat_id, first_name, username }: ConfirmRequest = body;

    if (!code || !chat_id) {
      console.error('Missing required fields:', { code: !!code, chat_id: !!chat_id });
      throw new Error('Code and chat_id are required');
    }

    console.log('Processing confirmation for code:', code, 'chat_id:', chat_id);

    // Проверяем существование и валидность кода
    const { data: session, error: sessionError } = await supabaseClient
      .from('telegram_sessions')
      .select('*')
      .eq('session_code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    console.log('Session query result:', { session, sessionError });

    if (sessionError || !session) {
      console.error('Invalid session:', sessionError?.message || 'Session not found');
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: 'Code not found or expired' 
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
      .select('user_id, active')
      .eq('chat_id', chat_id)
      .maybeSingle();

    console.log('Existing link check:', existingLink);

    if (existingLink && existingLink.user_id !== session.user_id && existingLink.active) {
      console.error('Chat already linked to different user');
      return new Response(
        JSON.stringify({ 
          status: 'error',
          error: 'This Telegram account is already linked to another user' 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Деактивируем все старые связи для этого пользователя
    await supabaseClient
      .from('telegram_links')
      .update({ active: false })
      .eq('user_id', session.user_id);

    // Создаем или обновляем связь
    const { error: linkError } = await supabaseClient
      .from('telegram_links')
      .upsert({
        user_id: session.user_id,
        chat_id: chat_id,
        telegram_username: username || null,
        first_name: first_name || null,
        active: true
      }, {
        onConflict: 'chat_id'
      });

    if (linkError) {
      console.error('Error creating telegram link:', linkError);
      throw new Error('Failed to create link');
    }

    console.log('Successfully created telegram link');

    // Помечаем сессию как использованную
    await supabaseClient
      .from('telegram_sessions')
      .update({ used: true })
      .eq('id', session.id);

    console.log('Session marked as used');

    // Возвращаем успешный ответ с информацией о пользователе
    return new Response(
      JSON.stringify({ 
        status: 'ok',
        first_name: session.user_name || first_name || 'User',
        role: getRoleDisplayName(session.user_role || 'operator'),
        user_name: session.user_name,
        user_role: session.user_role
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in telegram-confirm function:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error.message || 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function getRoleDisplayName(role: string): string {
  const roleNames: { [key: string]: string } = {
    admin: 'Администратор',
    superadmin: 'Суперадмин',
    operator: 'Оператор',
    manager: 'Менеджер',
    viewer: 'Наблюдатель'
  };
  return roleNames[role] || 'Пользователь';
}
