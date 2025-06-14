
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleProcessCallRecord(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: process_call_record_and_create_call');
  const { orgId, telfinCall, clientId, accessToken } = body;

  if (!orgId || !telfinCall || !clientId || !accessToken) {
    throw new Error('orgId, telfinCall, clientId, and accessToken are required.');
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const updateStatus = async (status: string, feedback: string | null = null) => {
    await supabaseAdmin
      .from('telfin_calls')
      .update({ processing_status: status, processing_feedback: feedback })
      .eq('id', telfinCall.id);
  };
  
  if (!telfinCall.has_record || !telfinCall.record_url) {
    await updateStatus('skipped', 'Звонок без записи');
    return new Response(JSON.stringify({ success: true, message: 'Skipped: no record.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  
  try {
    await updateStatus('processing', null);

    const recordUuid = telfinCall.record_url;
    const storageUrlEndpoint = `https://${API_HOST}/client/${clientId}/record/${recordUuid}/storage_url/`;
    
    const storageUrlResponse = await fetch(storageUrlEndpoint, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    
    if (!storageUrlResponse.ok) {
      const errorText = await storageUrlResponse.text();
      throw new Error(`Failed to get storage URL: ${errorText}`);
    }
    const { record_url } = await storageUrlResponse.json();

    const audioResponse = await fetch(record_url, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!audioResponse.ok) {
       const errorText = await audioResponse.text();
      throw new Error(`Failed to download audio: ${errorText}`);
    }
    const audioBlob = await audioResponse.blob();
    const fileName = `${orgId}/${telfinCall.call_id}.mp3`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('call-records')
      .upload(fileName, audioBlob, {
        contentType: audioBlob.type || 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('call-records')
      .getPublicUrl(fileName);

    if (!publicUrlData) throw new Error("Could not get public URL for the file.");

    const { error: insertError } = await supabaseAdmin
      .from('calls')
      .insert({
        org_id: orgId,
        audio_file_url: publicUrlData.publicUrl,
        date: telfinCall.start_time,
        source: 'telfin',
        source_call_id: telfinCall.id,
        processing_status: 'pending',
      });

    if (insertError) throw insertError;

    await updateStatus('completed');
    
    return new Response(JSON.stringify({ success: true, message: 'Call processed successfully.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error(`Error processing call ${telfinCall.id}:`, e);
    await updateStatus('error', e.message);
    throw e;
  }
}
