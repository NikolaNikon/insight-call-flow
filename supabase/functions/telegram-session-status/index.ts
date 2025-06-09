
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

    const url = new URL(req.url);
    const sessionCode = url.searchParams.get('session_code');

    if (!sessionCode) {
      throw new Error('Session code is required');
    }

    console.log('Checking enhanced status for session code:', sessionCode);

    // Проверяем сессию с дополнительными данными пользователя
    const { data: session, error: sessionError } = await supabaseClient
      .from('telegram_sessions')
      .select(`
        user_id, 
        used, 
        expires_at, 
        user_name, 
        user_role,
        users!inner(
          name,
          role,
          email
        )
      `)
      .eq('session_code', sessionCode)
      .single();

    if (sessionError || !session) {
      console.log('Session not found or error:', sessionError);
      return new Response(
        JSON.stringify({ 
          connected: false,
          error: 'Session not found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Если сессия использована, проверяем подключение с расширенными данными
    if (session.used) {
      const { data: link, error: linkError } = await supabaseClient
        .from('telegram_links')
        .select(`
          telegram_username, 
          first_name, 
          active,
          created_at,
          chat_id
        `)
        .eq('user_id', session.user_id)
        .eq('active', true)
        .single();

      if (linkError || !link) {
        console.log('No active link found:', linkError);
        return new Response(
          JSON.stringify({ 
            connected: false,
            error: 'No active connection'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Возвращаем расширенную информацию о подключении
      return new Response(
        JSON.stringify({
          connected: true,
          first_name: link.first_name || session.user_name || session.users.name,
          username: link.telegram_username,
          connected_at: link.created_at,
          role: session.user_role || session.users.role,
          user_name: session.user_name || session.users.name,
          chat_id: link.chat_id,
          status: 'active'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Сессия не использована - проверяем, не истекла ли
    const isExpired = new Date(session.expires_at) < new Date();
    
    return new Response(
      JSON.stringify({
        connected: false,
        pending: !isExpired,
        expired: isExpired,
        user_name: session.user_name || session.users.name,
        role: session.user_role || session.users.role
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in enhanced telegram-session-status:', error);
    return new Response(
      JSON.stringify({
        connected: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
