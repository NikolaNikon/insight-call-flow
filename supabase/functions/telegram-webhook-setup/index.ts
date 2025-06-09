
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== Telegram Webhook Setup Function Called ===');
  console.log('Method:', req.method);

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN not found in environment variables');
      throw new Error('Telegram bot token not configured');
    }
    console.log('Bot token found, length:', botToken.length);

    const { action } = await req.json();
    console.log('Action requested:', action);

    const baseUrl = 'https://pngbgnmajdpkzcrcfmkg.supabase.co/functions/v1/telegram-bot';

    if (action === 'set_webhook') {
      console.log('Setting webhook to:', baseUrl);
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: baseUrl,
          allowed_updates: ['message']
        }),
      });

      const result = await response.json();
      console.log('Set webhook response:', result);

      if (!response.ok || !result.ok) {
        throw new Error(result.description || 'Failed to set webhook');
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook установлен успешно',
        webhook_url: baseUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'get_webhook_info') {
      console.log('Getting webhook info');
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getWebhookInfo`);
      const result = await response.json();
      console.log('Webhook info response:', result);

      if (!response.ok || !result.ok) {
        throw new Error(result.description || 'Failed to get webhook info');
      }

      const isCorrect = result.result.url === baseUrl;
      
      return new Response(JSON.stringify({
        success: true,
        webhook_info: result.result,
        is_webhook_correct: isCorrect,
        expected_url: baseUrl
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'delete_webhook') {
      console.log('Deleting webhook');
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      console.log('Delete webhook response:', result);

      if (!response.ok || !result.ok) {
        throw new Error(result.description || 'Failed to delete webhook');
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Webhook удален успешно'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } else if (action === 'test_bot') {
      console.log('Testing bot token');
      
      const response = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const result = await response.json();
      console.log('Bot info response:', result);

      if (!response.ok || !result.ok) {
        throw new Error(result.description || 'Invalid bot token');
      }

      return new Response(JSON.stringify({
        success: true,
        bot_info: result.result,
        message: 'Бот активен и токен валиден'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    throw new Error('Unknown action');

  } catch (error) {
    console.error('Error in telegram-webhook-setup function:', error);
    
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
