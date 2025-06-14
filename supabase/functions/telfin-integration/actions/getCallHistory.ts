
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

// Правильные endpoint'ы основанные на документации Telfin API
const CALL_HISTORY_ENDPOINTS: string[] = [
  '/api/ver1.0/client/{client_id}/call_history/',
  '/api/ver1.0/client/{client_id}/calls/',
  '/api/ver1.0/client/{client_id}/cdr/',
];

interface CallHistoryParams {
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export async function handleGetCallHistory(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: get_call_history');
  const { accessToken, dateFrom, dateTo, telfinClientId } = body;
  
  if (!accessToken || !dateFrom || !dateTo) {
    throw new Error('[TELFIN-API-005] accessToken, dateFrom, and dateTo are required for get_call_history');
  }

  if (!telfinClientId) {
    throw new Error('[TELFIN-API-006] telfinClientId is required for get_call_history');
  }

  // Параметры для GET запроса
  const params: CallHistoryParams = {
    date_from: dateFrom,
    date_to: dateTo,
    limit: 1000,
  };

  let lastError: string = '';
  let diagnosticInfo: any[] = [];

  // Пробуем каждый endpoint с правильным client_id в пути
  for (const pathTemplate of CALL_HISTORY_ENDPOINTS) {
    // Заменяем {client_id} на реальный client_id
    const path = pathTemplate.replace('{client_id}', telfinClientId);
    
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

    console.log(`[TelfinCallHistory] Trying GET endpoint: ${url}`);

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
        url: url,
        clientId: telfinClientId,
      };

      console.log(`[TelfinCallHistory] GET API Response Status: ${response.status} for endpoint: ${path}`);

      if (!response.ok) {
        const errorText = await responseForText.text();
        console.error(`[TelfinCallHistory] GET API returned non-OK status for endpoint ${path}: ${response.status}`);
        console.error('[TelfinCallHistory] Error Response:', errorText.substring(0, 500));
        
        diagnosticEntry.error = errorText.substring(0, 300);
        diagnosticInfo.push(diagnosticEntry);
        
        lastError = `GET ${path}: HTTP ${response.status}. ${errorText.substring(0, 300)}`;
        
        // Если это 401 или 403, проблема с авторизацией
        if (response.status === 401 || response.status === 403) {
          diagnosticEntry.authIssue = true;
        }
        
        continue; // Переходим к следующему endpoint
      }

      try {
        const responseData = await response.json();
        console.log(`[TelfinCallHistory] Successfully parsed JSON from GET endpoint: ${path}`);
        console.log(`[TelfinCallHistory] Response data keys:`, Object.keys(responseData));

        diagnosticEntry.success = true;
        diagnosticEntry.dataStructure = Object.keys(responseData);
        
        // Проверяем структуру ответа
        let callsData = responseData;
        if (responseData.results && Array.isArray(responseData.results)) {
          callsData = responseData.results;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          callsData = responseData.data;
        } else if (!Array.isArray(responseData)) {
          // Если это не массив, возможно нужно извлечь данные
          console.log('[TelfinCallHistory] Response is not array, checking for nested data...');
        }

        diagnosticEntry.recordsFound = Array.isArray(callsData) ? callsData.length : 'unknown';
        diagnosticInfo.push(diagnosticEntry);

        // Успех!
        return new Response(JSON.stringify({ 
          success: true, 
          method: 'GET',
          endpoint: path, 
          clientId: telfinClientId,
          data: responseData,
          diagnostics: diagnosticInfo,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        const errorText = await responseForText.text();
        console.error(`[TelfinCallHistory] Failed to parse JSON from GET endpoint: ${path}`);
        console.error('Response Text:', errorText.substring(0, 500));
        
        diagnosticEntry.jsonError = errorText.substring(0, 300);
        diagnosticInfo.push(diagnosticEntry);
        
        lastError = `GET ${path}: JSON parse error. ${errorText.substring(0, 300)}`;
        continue;
      }
    } catch (err) {
      const errorMessage = `GET ${path}: Network error. ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[TelfinCallHistory] ${errorMessage}`);
      
      diagnosticInfo.push({
        endpoint: path,
        method: 'GET',
        networkError: errorMessage,
        clientId: telfinClientId,
      });
      
      lastError = errorMessage;
      continue;
    }
  }

  // Анализируем диагностическую информацию для лучшего сообщения об ошибке
  const authIssues = diagnosticInfo.filter(d => d.authIssue || d.status === 401 || d.status === 403);
  const notFoundIssues = diagnosticInfo.filter(d => d.status === 404);
  
  let recommendedAction = '';
  if (authIssues.length > 0) {
    recommendedAction = 'Проверьте права доступа приложения. Возможно, требуется уровень доступа "All" вместо "Call API".';
  } else if (notFoundIssues.length === diagnosticInfo.length) {
    recommendedAction = 'Все endpoint\'ы возвращают 404. Проверьте правильность client_id и доступность API.';
  } else {
    recommendedAction = 'Проверьте настройки приложения и используйте интерактивный обозреватель API для тестирования.';
  }

  // Возвращаем подробную диагностическую информацию
  return new Response(
    JSON.stringify({
      success: false,
      error: lastError || 'Не удалось получить историю звонков ни по одному из endpoint\'ов.',
      diagnostics: {
        clientId: telfinClientId,
        totalEndpointsTried: CALL_HISTORY_ENDPOINTS.length,
        detailedResults: diagnosticInfo,
        recommendedAction,
        apiExplorerUrl: `https://${API_HOST}/api/ver1.0/client_api_explorer/`,
        supportInfo: {
          authIssuesFound: authIssues.length,
          notFoundIssuesFound: notFoundIssues.length,
          possibleCauses: [
            'Неправильный client_id',
            'Недостаточные права доступа приложения',
            'Проблемы с токеном авторизации',
            'Неверные параметры запроса'
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
