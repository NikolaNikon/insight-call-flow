
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleGetUserInfo(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: get_user_info');
  const { accessToken } = body;
  if (!accessToken) {
    throw new Error('accessToken is required for get_user_info');
  }

  const url = `https://${API_HOST}/api/ver1.0/client/`;
  console.log('Requesting user info from Telfin URL:', url);

  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  // Клонируем ответ, чтобы иметь возможность прочитать его тело дважды (как текст и как JSON)
  const responseForText = response.clone();
  
  if (!response.ok) {
    const errorText = await responseForText.text();
    console.error(`Telfin User Info API returned non-OK status: ${response.status}`);
    console.error('Telfin User Info API Error Response:', errorText);
    throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 500)}`);
  }
  
  try {
    const responseData = await response.json();
    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (jsonError) {
      const errorText = await responseForText.text();
      console.error('Failed to parse JSON from Telfin User Info API.');
      console.error('Response Text:', errorText);
      throw new Error(`Failed to parse JSON. Telfin API returned: ${errorText.substring(0, 500)}`);
  }
}

