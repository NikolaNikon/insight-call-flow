import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TelfinRequest {
  action: 'get_audio_url' | 'download_audio' | 'download_audio_with_oauth' | 'save_call_history';
  clientId: string;
  recordUuid: string;
  hostname?: string;
  username?: string;
  password?: string;
  accessToken?: string;
  calls?: any[];
  orgId?: string;
}

interface TelfinStorageUrlResponse {
  record_url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, clientId, recordUuid, hostname, username, password, accessToken, calls, orgId }: TelfinRequest = await req.json();

    console.log('Telfin integration request:', { action, clientId, recordUuid, hostname });

    switch (action) {
      case 'get_audio_url': {
        if (!hostname) {
          throw new Error('Hostname is required for get_audio_url action');
        }

        const url = `https://${hostname}/client/${clientId}/record/${recordUuid}/storage_url/`;
        
        console.log('Fetching storage URL from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
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
      }

      case 'download_audio': {
        if (!hostname || !username || !password) {
          throw new Error('Hostname, username, and password are required for download_audio action');
        }

        const url = `https://${hostname}/client/${clientId}/record/${recordUuid}/download/`;
        
        // Создание базовой аутентификации
        const credentials = btoa(`${username}:${password}`);
        
        console.log('Downloading audio from:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Accept': '*/*'
          }
        });
        
        console.log('Download response status:', response.status);
        
        if (!response.ok) {
          console.error('Download failed with status:', response.status);
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
        }
        
        // Получение аудиофайла в виде ArrayBuffer
        const audioBuffer = await response.arrayBuffer();
        const audioBlob = new Uint8Array(audioBuffer);
        
        // Возвращаем бинарные данные как base64
        const base64Audio = btoa(String.fromCharCode(...audioBlob));
        
        return new Response(JSON.stringify({ 
          success: true, 
          audioData: base64Audio,
          contentType: response.headers.get('content-type') || 'audio/mpeg'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'download_audio_with_oauth': {
        if (!hostname || !accessToken) {
          throw new Error('Hostname and access token are required for OAuth download');
        }

        const url = `https://${hostname}/client/${clientId}/record/${recordUuid}/download/`;
        
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
        
        // Получение аудиофайла в виде ArrayBuffer
        const audioBuffer = await response.arrayBuffer();
        const audioBlob = new Uint8Array(audioBuffer);
        
        // Возвращаем бинарные данные как base64
        const base64Audio = btoa(String.fromCharCode(...audioBlob));
        
        return new Response(JSON.stringify({ 
          success: true, 
          audioData: base64Audio,
          contentType: response.headers.get('content-type') || 'audio/mpeg'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'save_call_history': {
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
      }

      default:
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
