
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
}
