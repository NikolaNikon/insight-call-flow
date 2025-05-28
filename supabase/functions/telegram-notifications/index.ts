
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TelegramMessage {
  chat_id: string
  text: string
  parse_mode?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, data } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID')

    if (!botToken || !chatId) {
      throw new Error('Telegram bot token or chat ID not configured')
    }

    let message = ''
    
    switch (type) {
      case 'new_call':
        message = `🔔 *Новый звонок обработан*\n\n` +
                 `📞 Менеджер: ${data.manager}\n` +
                 `📅 Дата: ${data.date}\n` +
                 `⭐ Оценка: ${data.score}/10\n` +
                 `😊 Удовлетворенность: ${data.satisfaction}%`
        break
        
      case 'weekly_report':
        message = `📊 *Еженедельный отчет*\n\n` +
                 `📞 Всего звонков: ${data.totalCalls}\n` +
                 `⭐ Средняя оценка: ${data.avgScore}\n` +
                 `😊 Средняя удовлетворенность: ${data.avgSatisfaction}%\n` +
                 `🏆 Лучший менеджер: ${data.topManager}`
        break
        
      default:
        message = data.message || 'Уведомление из CallControl'
    }

    const telegramMessage: TelegramMessage = {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(telegramMessage),
      }
    )

    const telegramResult = await telegramResponse.json()

    // Логируем результат в audit_logs
    const logData = {
      action: 'telegram_notification',
      details: {
        type,
        success: telegramResponse.ok,
        telegram_response: telegramResult,
        message_preview: message.substring(0, 100)
      },
      user_id: null
    }

    await supabaseClient
      .from('audit_logs')
      .insert(logData)

    if (!telegramResponse.ok) {
      throw new Error(`Telegram API error: ${telegramResult.description}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        telegram_response: telegramResult
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending telegram notification:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
