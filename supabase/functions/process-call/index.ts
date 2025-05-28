
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NexaraTranscriptionResponse {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }>;
  speakers?: Array<{
    speaker: string;
    segments: Array<{
      start: number;
      end: number;
      text: string;
    }>;
  }>;
}

async function transcribeAudio(audioFileUrl: string): Promise<NexaraTranscriptionResponse> {
  const nexaraApiKey = Deno.env.get('NEXARA_API_KEY');
  
  if (!nexaraApiKey) {
    throw new Error('NEXARA_API_KEY не настроен');
  }

  try {
    console.log('Начинаем транскрибацию через Nexara API для:', audioFileUrl);

    // Отправляем URL аудиофайла на Nexara API
    const response = await fetch('https://api.nexara.ru/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nexaraApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: audioFileUrl,
        response_format: 'verbose_json',
        task: 'diarize' // Включаем диаризацию для определения спикеров
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка Nexara API:', response.status, errorText);
      throw new Error(`Nexara API ошибка: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Результат транскрибации получен:', result);
    
    return result;
  } catch (error) {
    console.error('Ошибка при транскрибации:', error);
    throw error;
  }
}

function analyzeTranscription(transcription: NexaraTranscriptionResponse): {
  summary: string;
  general_score: number;
  user_satisfaction_index: number;
  communication_skills: number;
  sales_technique: number;
  transcription_score: number;
  feedback: string;
  advice: string;
} {
  const text = transcription.text.toLowerCase();
  
  // Анализ качества разговора на основе ключевых слов и фраз
  const positiveWords = ['спасибо', 'отлично', 'хорошо', 'понятно', 'согласен', 'да', 'подходит'];
  const negativeWords = ['нет', 'не подходит', 'дорого', 'не интересно', 'плохо', 'не понимаю'];
  const salesWords = ['предложение', 'скидка', 'акция', 'условия', 'цена', 'стоимость'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  const salesCount = salesWords.filter(word => text.includes(word)).length;
  
  // Расчет метрик
  const general_score = Math.min(10, Math.max(5, 7 + positiveCount - negativeCount));
  const user_satisfaction_index = Math.min(10, Math.max(5, 8 + positiveCount - negativeCount));
  const communication_skills = Math.min(10, Math.max(5, 7 + (text.length > 100 ? 1 : 0)));
  const sales_technique = Math.min(10, Math.max(4, 6 + salesCount));
  const transcription_score = transcription.text.length > 50 ? 9 : 7;
  
  // Генерация краткого описания
  let summary = 'Стандартный разговор с клиентом';
  if (positiveCount > negativeCount) {
    summary = 'Позитивный разговор, клиент проявил интерес';
  } else if (negativeCount > positiveCount) {
    summary = 'Сложный разговор, клиент выразил возражения';
  }
  
  // Обратная связь и советы
  let feedback = 'Менеджер провел разговор профессионально';
  let advice = 'Продолжайте работать в том же ключе';
  
  if (general_score < 7) {
    feedback = 'Разговор требует улучшения качества коммуникации';
    advice = 'Рекомендуется больше слушать клиента и отвечать на его потребности';
  } else if (general_score >= 8) {
    feedback = 'Отличная работа менеджера, высокое качество общения';
    advice = 'Поделитесь опытом с коллегами';
  }
  
  return {
    summary,
    general_score,
    user_satisfaction_index,
    communication_skills,
    sales_technique,
    transcription_score,
    feedback,
    advice
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { audioFileUrl, callId } = await req.json()

    console.log('Обработка звонка:', callId, 'с аудио:', audioFileUrl)

    // Обновляем статус на "processing"
    await supabase
      .from('calls')
      .update({ processing_status: 'processing' })
      .eq('id', callId)

    try {
      // Транскрибируем аудио через Nexara API
      const transcriptionResult = await transcribeAudio(audioFileUrl);
      
      // Анализируем транскрипцию
      const analysis = analyzeTranscription(transcriptionResult);

      // Обновляем запись звонка с результатами анализа
      const { error: updateError } = await supabase
        .from('calls')
        .update({
          transcription: transcriptionResult.text,
          ...analysis,
          processing_status: 'completed'
        })
        .eq('id', callId)

      if (updateError) {
        throw updateError
      }

      console.log('Обработка звонка завершена успешно:', callId)

      return new Response(
        JSON.stringify({ 
          success: true, 
          callId,
          transcription: transcriptionResult.text,
          analysis 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )

    } catch (transcriptionError) {
      console.error('Ошибка при транскрибации:', transcriptionError)
      
      // Обновляем статус на "failed"
      await supabase
        .from('calls')
        .update({ 
          processing_status: 'failed',
          feedback: `Ошибка транскрибации: ${transcriptionError.message}`
        })
        .eq('id', callId)

      throw transcriptionError
    }

  } catch (error) {
    console.error('Ошибка обработки звонка:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
