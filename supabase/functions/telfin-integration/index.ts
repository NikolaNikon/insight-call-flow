import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OAUTH_HOST = 'apiproxy.telphin.ru';
const API_HOST = 'apiproxy.telphin.ru';

interface TelfinRequest {
  action: 'get_access_token' | 'get_user_info' | 'get_call_history' | 'get_audio_url' | 'download_audio_with_oauth' | 'save_call_history' | 'process_call_record_and_create_call';
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  recordUuid?: string;
  calls?: any[];
  orgId?: string;
  telfinCall?: any;
  dateFrom?: string;
  dateTo?: string;
}

interface TelfinStorageUrlResponse {
  record_url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: TelfinRequest = await req.json();
    const { action } = body;

    console.log(`Telfin integration function invoked. Action: "${action}"`);

    if (action === 'get_access_token') {
      console.log('Executing action: get_access_token');
      const { clientId, clientSecret } = body;
      if (!clientId || !clientSecret) {
        throw new Error('clientId and clientSecret are required for get_access_token');
      }

      const url = `https://${OAUTH_HOST}/oauth/token`;
      const requestBody = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: requestBody.toString()
      });

      const responseData = await response.json();
      if (!response.ok) {
        console.error('Telfin Token API Error:', response.status, responseData);
        throw new Error(responseData.error_description || responseData.error || `HTTP ${response.status}`);
      }
      
      return new Response(JSON.stringify({ success: true, data: responseData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_user_info') {
      console.log('Executing action: get_user_info');
      const { accessToken } = body;
      if (!accessToken) {
        throw new Error('accessToken is required for get_user_info');
      }

      const url = `https://${API_HOST}/api/ver1.0/client/`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const responseData = await response.json();
      if (!response.ok) {
        console.error('Telfin User Info API Error:', response.status, responseData);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return new Response(JSON.stringify({ success: true, data: responseData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_call_history') {
      console.log('Executing action: get_call_history');
      const { accessToken, dateFrom, dateTo } = body;
      if (!accessToken || !dateFrom || !dateTo) {
        throw new Error('accessToken, dateFrom, and dateTo are required for get_call_history');
      }

      const params = new URLSearchParams({
        date_start: dateFrom,
        date_end: dateTo,
        limit: '1000'
      });
      const url = `https://${API_HOST}/api/ver1.0/client/cdr/?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      const responseData = await response.json();
      if (!response.ok) {
         console.error('Telfin Call History API Error:', response.status, responseData);
         throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      return new Response(JSON.stringify({ success: true, data: responseData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get_audio_url') {
      console.log('Executing action: get_audio_url');
      const { clientId, recordUuid, accessToken } = body;
      if (!accessToken || !clientId || !recordUuid) {
        throw new Error('Access Token, clientId, and recordUuid are required for get_audio_url action');
      }

      const url = `https://${API_HOST}/client/${clientId}/record/${recordUuid}/storage_url/`;
      
      console.log('Fetching storage URL from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      
      const data: TelfinStorageUrlResponse = await response.json();
      console.log('Success response:', data);
      
      return new Response(JSON.stringify({ success: true, audioUrl: data.record_url }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'download_audio_with_oauth') {
      console.log('Executing action: download_audio_with_oauth');
      const { clientId, recordUuid, accessToken } = body;
      if (!accessToken || !clientId || !recordUuid) {
        throw new Error('Access token, clientId, and recordUuid are required for OAuth download');
      }

      const url = `https://${API_HOST}/client/${clientId}/record/${recordUuid}/download/`;
      
      console.log('Downloading audio with OAuth from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': '*/*'
        }
      });
      
      console.log('OAuth download response status:', response.status);
      
      if (!response.ok) {
        console.error('OAuth download failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
      }
      
      const audioBuffer = await response.arrayBuffer();
      const audioBlob = new Uint8Array(audioBuffer);
      const base64Audio = btoa(String.fromCharCode(...audioBlob));
      
      return new Response(JSON.stringify({ 
        success: true, 
        audioData: base64Audio,
        contentType: response.headers.get('content-type') || 'audio/mpeg'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'save_call_history') {
      console.log('Executing action: save_call_history');
      const { calls, orgId } = body;
      if (!calls || !orgId) {
        throw new Error('calls and orgId are required for save_call_history action');
      }

      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const callsToUpsert = calls.map(call => ({
        call_id: call.id,
        org_id: orgId,
        extension_id: call.extension_id,
        caller_number: call.caller_id_number,
        called_number: call.called_did_number,
        start_time: call.start_time ? new Date(call.start_time * 1000).toISOString() : null,
        end_time: call.end_time ? new Date(call.end_time * 1000).toISOString() : null,
        duration: call.duration,
        has_record: call.has_record,
        record_url: call.record_uuid,
        status: call.disposition,
        raw_payload: call,
        processing_status: 'pending',
      }));

      const { data, error } = await supabaseAdmin
        .from('telfin_calls')
        .upsert(callsToUpsert, { onConflict: 'call_id', ignoreDuplicates: false });

      if (error) {
        console.error('Error upserting telfin calls:', error);
        throw error;
      }

      return new Response(JSON.stringify({ success: true, saved_count: callsToUpsert.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
      
    } else if (action === 'process_call_record_and_create_call') {
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

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
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
    } else {
      console.error(`Unknown action received: "${action}"`);
      throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in telfin-integration function:', error);
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
