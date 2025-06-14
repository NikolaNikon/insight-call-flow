
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

const ENDPOINTS: string[] = [
  '/api/v1.0/client/',
  '/api/v1.0/clients/',
  '/api/v1.0/user/',
];

export async function handleGetUserInfo(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: get_user_info');
  const { accessToken } = body;
  if (!accessToken) {
    throw new Error('accessToken is required for get_user_info');
  }

  let lastError: string = '';
  for (const path of ENDPOINTS) {
    const url = `https://${API_HOST}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'CallControl/1.0.0',
    };

    console.log(`[TelfinUserInfo] Trying endpoint: ${url}`);
    console.log(`[TelfinUserInfo] Request Headers:`, JSON.stringify(headers));

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const responseForText = response.clone();

      console.log(`[TelfinUserInfo] API Response Status: ${response.status} for endpoint: ${path}`);

      if (!response.ok) {
        const errorText = await responseForText.text();
        console.error(`[TelfinUserInfo] API returned non-OK status for endpoint ${path}: ${response.status}`);
        console.error('[TelfinUserInfo] Error Response:', errorText);
        lastError = `Attempted endpoint: ${path}. HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 600)}`;
        // If status is 404 or 401 or 403, try next endpoint
        continue;
      }

      try {
        const responseData = await response.json();
        console.log(`[TelfinUserInfo] Successfully parsed JSON from endpoint: ${path}`);

        // success!
        return new Response(JSON.stringify({ 
          success: true, 
          endpoint: path, 
          data: responseData 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        const errorText = await responseForText.text();
        console.error(`[TelfinUserInfo] Failed to parse JSON from endpoint: ${path}`);
        console.error('Response Text:', errorText);
        lastError = `Attempted endpoint: ${path}. Failed to parse JSON. Response: ${errorText.substring(0, 600)}`;
        continue;
      }
    } catch (err) {
      // Network or fetch error
      lastError = `[TelfinUserInfo] Network/fetch error on endpoint: ${path}. ${err instanceof Error ? err.message : String(err)}`;
      console.error(lastError);
      continue;
    }
  }

  // Если не удалось получить ни по одному из endpoint-ов, возвращаем подробную ошибку
  return new Response(
    JSON.stringify({
      success: false,
      tried_endpoints: ENDPOINTS,
      error: lastError || 'Не удалось получить информацию о клиенте Телфин ни по одному из возможных endpoint.',
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
  );
}
