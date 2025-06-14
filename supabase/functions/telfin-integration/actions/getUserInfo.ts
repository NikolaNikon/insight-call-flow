
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleGetUserInfo(body: TelfinRequest): Promise<Response> {
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
}
