
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleGetCallHistory(body: TelfinRequest): Promise<Response> {
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
  console.log('Requesting call history from Telfin URL:', url);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  const responseForText = response.clone();

  if (!response.ok) {
     const errorText = await responseForText.text();
     console.error(`Telfin Call History API returned non-OK status: ${response.status}`);
     console.error('Telfin Call History API Error Response:', errorText);
     throw new Error(`HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 500)}`);
  }
  
  try {
    const responseData = await response.json();
    return new Response(JSON.stringify({ success: true, data: responseData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (jsonError) {
    const errorText = await responseForText.text();
    console.error('Failed to parse JSON from Telfin Call History API.');
    console.error('Response Text:', errorText);
    throw new Error(`Failed to parse JSON. Telfin API returned: ${errorText.substring(0, 500)}`);
  }
}

