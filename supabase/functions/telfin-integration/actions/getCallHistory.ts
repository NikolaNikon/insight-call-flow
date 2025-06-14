
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

// Новые endpoint'ы основанные на документации RingMe API
const CDR_ENDPOINTS: string[] = [
  '/api/ver1.0/cdr/search',
  '/api/ver1.0/calls/search',
  '/api/ver1.0/calls/list',
  '/api/ver1.0/records',
  '/api/ver1.0/call_records',
];

// Fallback endpoint'ы (старые)
const FALLBACK_ENDPOINTS: string[] = [
  '/api/ver1.0/user/cdr/',
  '/api/ver1.0/client/cdr/',
  '/api/ver1.0/cdr/',
  '/api/ver1.0/calls/',
];

interface CallHistoryParams {
  date_from?: string;
  date_to?: string;
  date_start?: string;
  date_end?: string;
  start_date?: string;
  end_date?: string;
  from_date?: string;
  to_date?: string;
  limit?: number;
  offset?: number;
}

export async function handleGetCallHistory(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: get_call_history');
  const { accessToken, dateFrom, dateTo } = body;
  
  if (!accessToken || !dateFrom || !dateTo) {
    throw new Error('accessToken, dateFrom, and dateTo are required for get_call_history');
  }

  // Различные варианты параметров для разных API версий
  const paramVariants: CallHistoryParams[] = [
    // Вариант 1: Стандартные параметры
    { date_from: dateFrom, date_to: dateTo, limit: 1000 },
    // Вариант 2: Альтернативные названия
    { date_start: dateFrom, date_end: dateTo, limit: 1000 },
    // Вариант 3: Другие варианты названий
    { start_date: dateFrom, end_date: dateTo, limit: 1000 },
    // Вариант 4: Еще один формат
    { from_date: dateFrom, to_date: dateTo, limit: 1000 },
    // Вариант 5: Без лимита
    { date_from: dateFrom, date_to: dateTo },
  ];

  let lastError: string = '';
  let diagnosticInfo: any[] = [];

  // Сначала пробуем новые endpoint'ы с JSON в теле запроса (POST)
  for (const path of CDR_ENDPOINTS) {
    for (let paramIndex = 0; paramIndex < paramVariants.length; paramIndex++) {
      const params = paramVariants[paramIndex];
      const url = `https://${API_HOST}${path}`;
      
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CallControl/1.0.0',
      };

      console.log(`[TelfinCallHistory] Trying POST endpoint: ${url} (param variant ${paramIndex + 1})`);
      console.log(`[TelfinCallHistory] Request Body:`, JSON.stringify(params));

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(params),
        });

        const responseForText = response.clone();
        const diagnosticEntry = {
          endpoint: path,
          method: 'POST',
          status: response.status,
          paramVariant: paramIndex + 1,
          params: params,
        };

        console.log(`[TelfinCallHistory] POST API Response Status: ${response.status} for endpoint: ${path} (variant ${paramIndex + 1})`);

        if (!response.ok) {
          const errorText = await responseForText.text();
          console.error(`[TelfinCallHistory] POST API returned non-OK status for endpoint ${path} (variant ${paramIndex + 1}): ${response.status}`);
          console.error('[TelfinCallHistory] Error Response:', errorText);
          
          diagnosticEntry.error = errorText.substring(0, 300);
          diagnosticInfo.push(diagnosticEntry);
          
          lastError = `POST ${path} (variant ${paramIndex + 1}): HTTP ${response.status}. ${errorText.substring(0, 300)}`;
          
          // Если это 401 или 403, проблема с авторизацией
          if (response.status === 401 || response.status === 403) {
            diagnosticEntry.authIssue = true;
          }
          
          // Если это 404, endpoint не найден
          if (response.status === 404 && paramIndex < paramVariants.length - 1) {
            continue; // Попробовать следующий вариант параметров
          }
          
          break; // Переходим к следующему endpoint
        }

        try {
          const responseData = await response.json();
          console.log(`[TelfinCallHistory] Successfully parsed JSON from POST endpoint: ${path} (variant ${paramIndex + 1})`);

          diagnosticEntry.success = true;
          diagnosticEntry.dataStructure = Object.keys(responseData);
          diagnosticInfo.push(diagnosticEntry);

          // Успех!
          return new Response(JSON.stringify({ 
            success: true, 
            method: 'POST',
            endpoint: path, 
            paramVariant: paramIndex + 1,
            data: responseData,
            diagnostics: diagnosticInfo,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (jsonError) {
          const errorText = await responseForText.text();
          console.error(`[TelfinCallHistory] Failed to parse JSON from POST endpoint: ${path} (variant ${paramIndex + 1})`);
          console.error('Response Text:', errorText);
          
          diagnosticEntry.jsonError = errorText.substring(0, 300);
          diagnosticInfo.push(diagnosticEntry);
          
          lastError = `POST ${path} (variant ${paramIndex + 1}): JSON parse error. ${errorText.substring(0, 300)}`;
          break;
        }
      } catch (err) {
        const errorMessage = `POST ${path} (variant ${paramIndex + 1}): Network error. ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[TelfinCallHistory] ${errorMessage}`);
        
        diagnosticInfo.push({
          endpoint: path,
          method: 'POST',
          paramVariant: paramIndex + 1,
          networkError: errorMessage,
        });
        
        lastError = errorMessage;
        break;
      }
    }
  }

  // Если POST не сработал, пробуем старые GET endpoint'ы
  console.log('[TelfinCallHistory] POST methods failed, trying GET fallback endpoints...');
  
  for (const path of FALLBACK_ENDPOINTS) {
    for (let paramIndex = 0; paramIndex < paramVariants.length; paramIndex++) {
      const params = paramVariants[paramIndex];
      const urlParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          urlParams.append(key, String(value));
        }
      });
      
      const url = `https://${API_HOST}${path}?${urlParams.toString()}`;
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'User-Agent': 'CallControl/1.0.0',
      };

      console.log(`[TelfinCallHistory] Trying GET fallback endpoint: ${url} (param variant ${paramIndex + 1})`);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers,
        });

        const responseForText = response.clone();
        const diagnosticEntry = {
          endpoint: path,
          method: 'GET',
          status: response.status,
          paramVariant: paramIndex + 1,
          params: params,
        };

        console.log(`[TelfinCallHistory] GET API Response Status: ${response.status} for endpoint: ${path} (variant ${paramIndex + 1})`);

        if (!response.ok) {
          const errorText = await responseForText.text();
          console.error(`[TelfinCallHistory] GET API returned non-OK status for endpoint ${path} (variant ${paramIndex + 1}): ${response.status}`);
          console.error('[TelfinCallHistory] Error Response:', errorText);
          
          diagnosticEntry.error = errorText.substring(0, 300);
          diagnosticInfo.push(diagnosticEntry);
          
          lastError = `GET ${path} (variant ${paramIndex + 1}): HTTP ${response.status}. ${errorText.substring(0, 300)}`;
          
          if (response.status === 404 && paramIndex < paramVariants.length - 1) {
            continue;
          }
          
          break;
        }

        try {
          const responseData = await response.json();
          console.log(`[TelfinCallHistory] Successfully parsed JSON from GET endpoint: ${path} (variant ${paramIndex + 1})`);

          diagnosticEntry.success = true;
          diagnosticEntry.dataStructure = Object.keys(responseData);
          diagnosticInfo.push(diagnosticEntry);

          // Успех!
          return new Response(JSON.stringify({ 
            success: true, 
            method: 'GET',
            endpoint: path, 
            paramVariant: paramIndex + 1,
            data: responseData,
            diagnostics: diagnosticInfo,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (jsonError) {
          const errorText = await responseForText.text();
          console.error(`[TelfinCallHistory] Failed to parse JSON from GET endpoint: ${path} (variant ${paramIndex + 1})`);
          console.error('Response Text:', errorText);
          
          diagnosticEntry.jsonError = errorText.substring(0, 300);
          diagnosticInfo.push(diagnosticEntry);
          
          lastError = `GET ${path} (variant ${paramIndex + 1}): JSON parse error. ${errorText.substring(0, 300)}`;
          break;
        }
      } catch (err) {
        const errorMessage = `GET ${path} (variant ${paramIndex + 1}): Network error. ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[TelfinCallHistory] ${errorMessage}`);
        
        diagnosticInfo.push({
          endpoint: path,
          method: 'GET',
          paramVariant: paramIndex + 1,
          networkError: errorMessage,
        });
        
        lastError = errorMessage;
        break;
      }
    }
  }

  // Анализируем диагностическую информацию для лучшего сообщения об ошибке
  const authIssues = diagnosticInfo.filter(d => d.authIssue || d.status === 401 || d.status === 403);
  const notFoundIssues = diagnosticInfo.filter(d => d.status === 404);
  
  let recommendedAction = '';
  if (authIssues.length > 0) {
    recommendedAction = 'Проверьте права доступа приложения. Возможно, требуется уровень доступа "All" вместо "Call API".';
  } else if (notFoundIssues.length === diagnosticInfo.length) {
    recommendedAction = 'Все endpoint\'ы возвращают 404. Используйте интерактивный обозреватель API для поиска правильных endpoint\'ов.';
  } else {
    recommendedAction = 'Проверьте настройки приложения и используйте интерактивный обозреватель API для тестирования.';
  }

  // Возвращаем подробную диагностическую информацию
  return new Response(
    JSON.stringify({
      success: false,
      error: lastError || 'Не удалось получить историю звонков ни по одному из endpoint\'ов.',
      diagnostics: {
        totalEndpointsTried: CDR_ENDPOINTS.length + FALLBACK_ENDPOINTS.length,
        totalParamVariantsTried: paramVariants.length,
        detailedResults: diagnosticInfo,
        recommendedAction,
        apiExplorerUrl: `https://${API_HOST}/api/ver1.0/client_api_explorer/`,
        supportInfo: {
          authIssuesFound: authIssues.length,
          notFoundIssuesFound: notFoundIssues.length,
          possibleCauses: [
            'Недостаточные права доступа приложения',
            'Неправильные endpoint\'ы API',
            'Неверный формат параметров',
            'Проблемы с токеном авторизации'
          ]
        }
      },
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    }
  );
}
