
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

    const formData = await req.formData()
    const audioFile = formData.get('audio') as File
    const managerId = formData.get('managerId') as string
    const customerId = formData.get('customerId') as string

    if (!audioFile) {
      throw new Error('No audio file provided')
    }

    // Generate unique filename
    const fileName = `${Date.now()}-${audioFile.name}`
    const filePath = `calls/${fileName}`

    // Upload audio file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio-files')
      .upload(filePath, audioFile)

    if (uploadError) {
      throw uploadError
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('audio-files')
      .getPublicUrl(filePath)

    // Create call record
    const { data: callData, error: callError } = await supabase
      .from('calls')
      .insert({
        manager_id: managerId,
        customer_id: customerId,
        audio_file_url: publicUrl,
        processing_status: 'pending'
      })
      .select()
      .single()

    if (callError) {
      throw callError
    }

    console.log('Audio uploaded successfully:', fileName)
    console.log('Call record created:', callData.id)

    // Trigger processing (call the process-call function)
    const processResponse = await supabase.functions.invoke('process-call', {
      body: {
        audioFileUrl: publicUrl,
        callId: callData.id
      }
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        callId: callData.id,
        audioUrl: publicUrl 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error uploading audio:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
