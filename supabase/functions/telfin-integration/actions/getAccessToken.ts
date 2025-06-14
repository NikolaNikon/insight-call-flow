
import { OAUTH_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleGetAccessToken(body: TelfinRequest): Promise<Response> {
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
}
