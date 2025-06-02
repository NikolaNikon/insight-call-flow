
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { downloadAndTranscribeAudio } from './nexara-api.ts'
import { analyzeTranscription } from './analysis.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      .update({ 
        processing_status: 'processing',
        processing_step: 'transcribing'
      })
      .eq('id', callId)

    try {
      // Транскрибируем аудио через Nexara API
      const transcriptionResult = await downloadAndTranscribeAudio(audioFileUrl);
      
      // Обновляем статус на анализ
      await supabase
        .from('calls')
        .update({ processing_step: 'analyzing' })
        .eq('id', callId)
      
      // Анализируем транскрипцию
      const analysis = analyzeTranscription(transcriptionResult);

      // Подготавливаем данные для сохранения
      const updateData = {
        transcription: transcriptionResult.text,
        ...analysis,
        processing_status: 'completed',
        processing_step: 'completed'
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
          processing_step: 'failed',
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
