
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleDownloadAudioWithOauth(body: TelfinRequest): Promise<Response> {
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
}
