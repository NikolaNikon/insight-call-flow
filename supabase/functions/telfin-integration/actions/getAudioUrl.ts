
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest, TelfinStorageUrlResponse } from '../types.ts';

export async function handleGetAudioUrl(body: TelfinRequest): Promise<Response> {
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
}
