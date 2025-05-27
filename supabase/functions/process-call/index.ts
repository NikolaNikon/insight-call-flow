
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

    console.log('Processing call:', callId, 'with audio:', audioFileUrl)

    // Simulate AI processing (replace with actual AI service integration)
    const mockAnalysis = {
      transcription: "Здравствуйте, меня зовут Анна. Я звоню по поводу вашего предложения о кредитах. Можете рассказать подробнее о условиях?",
      summary: "Клиент интересуется условиями кредитования. Запрашивает подробную информацию о процентных ставках и требованиях.",
      general_score: Math.floor(Math.random() * 5) + 6, // 6-10
      user_satisfaction_index: Math.floor(Math.random() * 3) + 8, // 8-10
      communication_skills: Math.floor(Math.random() * 3) + 7, // 7-9
      sales_technique: Math.floor(Math.random() * 3) + 6, // 6-8
      transcription_score: Math.floor(Math.random() * 2) + 8, // 8-9
      feedback: "Менеджер проявил профессионализм и вежливость. Рекомендуется улучшить активное слушание клиента.",
      advice: "Следует задавать больше уточняющих вопросов для выявления реальных потребностей клиента."
    }

    // Update call with analysis results
    const { error: updateError } = await supabase
      .from('calls')
      .update({
        ...mockAnalysis,
        processing_status: 'completed'
      })
      .eq('id', callId)

    if (updateError) {
      throw updateError
    }

    console.log('Call processing completed for:', callId)

    return new Response(
      JSON.stringify({ success: true, callId }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error processing call:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
