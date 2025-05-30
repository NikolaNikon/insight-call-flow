
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NexaraTranscriptionResponse {
  task: string;
  language: string;
  duration: number;
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }>;
}

async function transcribeAudio(audioFileUrl: string): Promise<NexaraTranscriptionResponse> {
  const nexaraApiKey = Deno.env.get('NEXARA_API_KEY');
  
  if (!nexaraApiKey) {
    throw new Error('NEXARA_API_KEY не настроен');
  }

  try {
    console.log('Начинаем транскрибацию через Nexara API для:', audioFileUrl);

    // Отправляем URL аудиофайла на Nexara API с диаризацией
    const response = await fetch('https://api.nexara.ru/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nexaraApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: audioFileUrl,
        task: 'diarize', // Включаем диаризацию для определения спикеров
        diarization_setting: 'telephonic', // Оптимизировано для телефонных звонков
        response_format: 'verbose_json'
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
  
  // Анализ по сегментам диаризации
  let managerSegments = [];
  let customerSegments = [];
  
  if (transcription.segments) {
    // Разделяем сегменты по спикерам
    transcription.segments.forEach(segment => {
      if (segment.speaker === 'speaker_0') {
        managerSegments.push(segment);
      } else {
        customerSegments.push(segment);
      }
    });
  }
  
  // Анализ качества разговора на основе ключевых слов и фраз
  const positiveWords = ['спасибо', 'отлично', 'хорошо', 'понятно', 'согласен', 'да', 'подходит', 'интересно', 'удобно'];
  const negativeWords = ['нет', 'не подходит', 'дорого', 'не интересно', 'плохо', 'не понимаю', 'отказываюсь'];
  const salesWords = ['предложение', 'скидка', 'акция', 'условия', 'цена', 'стоимость', 'бронирование', 'услуга'];
  const qualityWords = ['здравствуйте', 'до свидания', 'пожалуйста', 'извините', 'понимаю', 'помогу'];
  
  const positiveCount = positiveWords.filter(word => text.includes(word)).length;
  const negativeCount = negativeWords.filter(word => text.includes(word)).length;
  const salesCount = salesWords.filter(word => text.includes(word)).length;
  const qualityCount = qualityWords.filter(word => text.includes(word)).length;
  
  // Анализ длительности разговора менеджера vs клиента
  const managerTalkTime = managerSegments.reduce((total, seg) => total + (seg.end - seg.start), 0);
  const customerTalkTime = customerSegments.reduce((total, seg) => total + (seg.end - seg.start), 0);
  const talkRatio = customerTalkTime > 0 ? managerTalkTime / customerTalkTime : 1;
  
  // Расчет метрик
  let general_score = 7; // Базовый балл
  general_score += Math.min(2, positiveCount * 0.5); // Позитивные слова добавляют балл
  general_score -= Math.min(2, negativeCount * 0.5); // Негативные слова убавляют балл
  general_score += Math.min(1, qualityCount * 0.3); // Вежливость добавляет балл
  general_score = Math.min(10, Math.max(1, general_score));
  
  // Удовлетворенность клиента
  let satisfaction = 7;
  satisfaction += Math.min(2, positiveCount * 0.6);
  satisfaction -= Math.min(3, negativeCount * 0.8);
  satisfaction = Math.min(10, Math.max(1, satisfaction));
  
  // Коммуникативные навыки
  let communication = 7;
  communication += Math.min(2, qualityCount * 0.4);
  communication += talkRatio > 2 ? -1 : (talkRatio < 0.5 ? 1 : 0); // Оптимальное соотношение речи
  communication = Math.min(10, Math.max(1, communication));
  
  // Техника продаж
  let sales = 6;
  sales += Math.min(2, salesCount * 0.5);
  sales += transcription.segments && transcription.segments.length > 4 ? 1 : 0; // Структурированный разговор
  sales = Math.min(10, Math.max(1, sales));
  
  // Качество транскрипции
  const transcription_score = transcription.text.length > 50 ? 9.5 : 7;
  
  // Генерация описания на основе диаризации
  let summary = 'Стандартный разговор с клиентом';
  if (transcription.segments && transcription.segments.length > 0) {
    const speakerCount = new Set(transcription.segments.map(s => s.speaker)).size;
    if (speakerCount >= 2) {
      summary = `Диалог между ${speakerCount} участниками`;
      if (positiveCount > negativeCount) {
        summary += ', клиент проявил интерес к предложению';
      } else if (negativeCount > positiveCount) {
        summary += ', клиент выразил возражения';
      } else {
        summary += ', нейтральное обсуждение услуг';
      }
    }
  }
  
  // Обратная связь и советы
  let feedback = 'Менеджер провел разговор профессионально';
  let advice = 'Продолжайте работать в том же ключе';
  
  if (general_score < 6) {
    feedback = 'Разговор требует улучшения качества коммуникации';
    advice = 'Рекомендуется больше слушать клиента, использовать вежливые обороты и четче презентовать услуги';
  } else if (general_score >= 8) {
    feedback = 'Отличная работа менеджера, высокое качество общения';
    advice = 'Поделитесь успешными техниками с коллегами';
  }
  
  if (talkRatio > 3) {
    advice += '. Старайтесь больше слушать клиента и меньше говорить самостоятельно';
  }
  
  return {
    summary,
    general_score: Math.round(general_score * 10) / 10,
    user_satisfaction_index: Math.round(satisfaction * 10) / 10,
    communication_skills: Math.round(communication * 10) / 10,
    sales_technique: Math.round(sales * 10) / 10,
    transcription_score: Math.round(transcription_score * 10) / 10,
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

      // Подготавливаем данные для сохранения
      const updateData = {
        transcription: transcriptionResult.text,
        ...analysis,
        processing_status: 'completed'
      };

      // Если есть сегменты диаризации, сохраняем их в поле task_id как JSON
      if (transcriptionResult.segments) {
        updateData.task_id = JSON.stringify({
          segments: transcriptionResult.segments,
          duration: transcriptionResult.duration,
          language: transcriptionResult.language
        });
      }

      // Обновляем запись звонка с результатами анализа
      const { error: updateError } = await supabase
        .from('calls')
        .update(updateData)
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
          analysis,
          segments: transcriptionResult.segments 
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
