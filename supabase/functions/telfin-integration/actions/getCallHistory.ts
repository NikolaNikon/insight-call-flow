
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

const ENDPOINTS: string[] = [
  '/api/ver1.0/user/cdr/',
  '/api/ver1.0/client/cdr/',
  '/api/ver1.0/cdr/',
  '/api/ver1.0/calls/',
];

export async function handleGetCallHistory(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: get_call_history');
  const { accessToken, dateFrom, dateTo } = body;
  if (!accessToken || !dateFrom || !dateTo) {
    throw new Error('accessToken, dateFrom, and dateTo are required for get_call_history');
  }

  // Попробуем разные варианты параметров
  const paramVariants = [
    // Вариант 1: Оригинальные параметры
    new URLSearchParams({
      date_start: dateFrom,
      date_end: dateTo,
      limit: '1000'
    }),
    // Вариант 2: Параметры без подчеркивания
    new URLSearchParams({
      datestart: dateFrom,
      dateend: dateTo,
      limit: '1000'
    }),
    // Вариант 3: Другие названия
    new URLSearchParams({
      from: dateFrom,
      to: dateTo,
      limit: '1000'
    }),
    // Вариант 4: Только дата без лимита
    new URLSearchParams({
      date_start: dateFrom,
      date_end: dateTo
    })
  ];

  let lastError: string = '';
  
  for (const path of ENDPOINTS) {
    for (let paramIndex = 0; paramIndex < paramVariants.length; paramIndex++) {
      const params = paramVariants[paramIndex];
      const url = `https://${API_HOST}${path}?${params.toString()}`;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'CallControl/1.0.0',
      };

      console.log(`[TelfinCallHistory] Trying endpoint: ${url} (param variant ${paramIndex + 1})`);
      console.log(`[TelfinCallHistory] Request Headers:`, JSON.stringify(headers));

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        const responseForText = response.clone();

        console.log(`[TelfinCallHistory] API Response Status: ${response.status} for endpoint: ${path} (variant ${paramIndex + 1})`);

        if (!response.ok) {
          const errorText = await responseForText.text();
          console.error(`[TelfinCallHistory] API returned non-OK status for endpoint ${path} (variant ${paramIndex + 1}): ${response.status}`);
          console.error('[TelfinCallHistory] Error Response:', errorText);
          lastError = `Attempted endpoint: ${path} with params variant ${paramIndex + 1}. HTTP error! Status: ${response.status}. Response: ${errorText.substring(0, 600)}`;
          
          // Если это 401 или 403, то проблема с авторизацией - попробуем другой endpoint
          // Если это 404, попробуем другие параметры для того же endpoint
          if (response.status === 404 && paramIndex < paramVariants.length - 1) {
            continue; // Попробовать следующий вариант параметров для того же endpoint
          }
          
          break; // Переходим к следующему endpoint
        }

        try {
          const responseData = await response.json();
          console.log(`[TelfinCallHistory] Successfully parsed JSON from endpoint: ${path} (variant ${paramIndex + 1})`);

          // success!
          return new Response(JSON.stringify({ 
            success: true, 
            endpoint: path, 
            paramVariant: paramIndex + 1,
            data: responseData 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (jsonError) {
          const errorText = await responseForText.text();
          console.error(`[TelfinCallHistory] Failed to parse JSON from endpoint: ${path} (variant ${paramIndex + 1})`);
          console.error('Response Text:', errorText);
          lastError = `Attempted endpoint: ${path} with params variant ${paramIndex + 1}. Failed to parse JSON. Response: ${errorText.substring(0, 600)}`;
          break; // Переходим к следующему endpoint
        }
      } catch (err) {
        // Network or fetch error
        lastError = `[TelfinCallHistory] Network/fetch error on endpoint: ${path} (variant ${paramIndex + 1}). ${err instanceof Error ? err.message : String(err)}`;
        console.error(lastError);
        break; // Переходим к следующему endpoint
      }
    }
  }

  // Если не удалось получить ни по одному из endpoint-ов, возвращаем подробную ошибку
  return new Response(
    JSON.stringify({
      success: false,
      tried_endpoints: ENDPOINTS,
      tried_param_variants: paramVariants.length,
      error: lastError || 'Не удалось получить историю звонков ни по одному из возможных endpoint.',
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
  );
}
