
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

    console.log('Creating user profile for:', user.id);

    // Проверяем, существует ли уже пользователь
    const { data: existingUser } = await supabaseClient
      .from('users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'User profile already exists'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Создаем пользователя
    const { data: newUser, error: insertError } = await supabaseClient
      .from('users')
      .insert({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || 'Пользователь',
        role: 'admin' // Первый пользователь - администратор
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      throw insertError;
    }

    console.log('User profile created successfully:', newUser.id);

    return new Response(
      JSON.stringify({
        success: true,
        user: newUser
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-user-profile function:', error);
    
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
