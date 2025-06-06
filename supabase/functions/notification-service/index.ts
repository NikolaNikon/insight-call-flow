
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  user_id?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { 
      title, 
      message, 
      type = 'info', 
      user_id, 
      entity_type, 
      entity_id, 
      metadata = {} 
    }: NotificationRequest = await req.json();

    console.log('Creating notification:', { title, message, type, user_id, entity_type, entity_id });

    // Валидация
    if (!title || !message) {
      throw new Error('Title and message are required');
    }

    // Создаем уведомление
    const { data, error } = await supabaseClient
      .from('notifications')
      .insert([{
        title,
        message,
        type,
        user_id: user_id || null,
        entity_type,
        entity_id,
        metadata,
        read: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      throw error;
    }

    console.log('Notification created successfully:', data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notification: data 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in notification-service function:', error);
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
