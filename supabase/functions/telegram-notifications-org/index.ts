
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

interface NotificationRequest {
  org_id: string;
  type: 'new_call' | 'weekly_report' | 'custom' | 'alert';
  data: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { org_id, type, data }: NotificationRequest = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (!org_id) {
      throw new Error('Organization ID is required')
    }

    // Получаем настройки Telegram бота для организации
    const { data: telegramSettings, error: settingsError } = await supabaseClient
      .from('telegram_settings')
      .select('bot_token, is_active')
      .eq('org_id', org_id)
      .eq('is_active', true)
      .single()

    if (settingsError || !telegramSettings) {
      throw new Error('Telegram bot not configured or inactive for this organization')
    }

    const botToken = telegramSettings.bot_token

    // Получаем активные подключения пользователей организации
    const { data: telegramLinks, error: linksError } = await supabaseClient
      .from('telegram_links')
      .select('chat_id, user_id, first_name')
      .eq('org_id', org_id)
      .eq('active', true)

    if (linksError) {
      throw new Error(`Error fetching telegram links: ${linksError.message}`)
    }

    if (!telegramLinks || telegramLinks.length === 0) {
      console.log('No active telegram links found for organization:', org_id)
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No active telegram links found',
          sent_count: 0
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
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

      case 'alert':
        message = `⚠️ *Уведомление*\n\n${data.message}`
        break
        
      default:
        message = data.message || 'Уведомление из CallControl'
    }

    // Отправляем уведомления всем активным пользователям организации
    const sendPromises = telegramLinks.map(async (link) => {
      const telegramMessage: TelegramMessage = {
        chat_id: link.chat_id.toString(),
        text: message,
        parse_mode: 'Markdown'
      }

      try {
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

        if (!telegramResponse.ok) {
          // Если бот заблокирован пользователем (403), деактивируем связь
          if (telegramResult.error_code === 403) {
            await supabaseClient
              .from('telegram_links')
              .update({ active: false })
              .eq('chat_id', link.chat_id)
              .eq('org_id', org_id)
            
            console.log(`Deactivated telegram link for chat_id ${link.chat_id} due to 403 error`)
          }
          
          throw new Error(`Telegram API error: ${telegramResult.description}`)
        }

        return { success: true, chat_id: link.chat_id, user_id: link.user_id }
      } catch (error) {
        console.error(`Error sending to chat_id ${link.chat_id}:`, error)
        return { success: false, chat_id: link.chat_id, user_id: link.user_id, error: error.message }
      }
    })

    const results = await Promise.all(sendPromises)
    const successCount = results.filter(r => r.success).length
    const failedResults = results.filter(r => !r.success)

    // Логируем результат в audit_logs
    const logData = {
      action: 'telegram_org_notification',
      details: {
        org_id,
        type,
        message_preview: message.substring(0, 100),
        sent_count: successCount,
        failed_count: failedResults.length,
        failures: failedResults
      },
      user_id: null
    }

    await supabaseClient
      .from('audit_logs')
      .insert(logData)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${successCount} notifications`,
        sent_count: successCount,
        failed_count: failedResults.length,
        results: results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending telegram organization notification:', error)
    
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
