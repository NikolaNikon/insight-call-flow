
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
  console.log('=== TELFIN GET CALL HISTORY START ===');
  console.log('Executing action: get_call_history');
  
  // Детальное логирование входящих параметров
  const { accessToken, dateFrom, dateTo, telfinClientId } = body;
  
  console.log('Input parameters:');
  console.log('- accessToken exists:', !!accessToken);
  console.log('- accessToken length:', accessToken ? accessToken.length : 0);
  console.log('- dateFrom:', dateFrom);
  console.log('- dateTo:', dateTo);
  console.log('- telfinClientId:', telfinClientId);
  
  // Валидация входящих параметров
  if (!accessToken) {
    const error = '[TELFIN-API-005] accessToken is required for get_call_history';
    console.error('VALIDATION ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error,
      diagnostics: { missingParameter: 'accessToken' }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }

  if (!dateFrom || !dateTo) {
    const error = '[TELFIN-API-005] dateFrom and dateTo are required for get_call_history';
    console.error('VALIDATION ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error,
      diagnostics: { missingParameters: { dateFrom: !dateFrom, dateTo: !dateTo } }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }

  if (!telfinClientId) {
    const error = '[TELFIN-API-005] telfinClientId is required for get_call_history';
    console.error('VALIDATION ERROR:', error);
    return new Response(JSON.stringify({
      success: false,
      error,
      diagnostics: { missingParameter: 'telfinClientId', recommendation: 'Ensure userInfo is loaded before calling get_call_history' }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  }

  // Параметры для GET запроса
  const params: CallHistoryParams = {
    date_from: dateFrom,
    date_to: dateTo,
    limit: 1000,
  };

  console.log('Request parameters:', params);

  let lastError: string = '';
  let diagnosticInfo: any[] = [];
  let attemptCount = 0;

  // Пробуем каждый endpoint с правильным client_id в пути
  for (const pathTemplate of CALL_HISTORY_ENDPOINTS) {
    attemptCount++;
    console.log(`\n=== ATTEMPT ${attemptCount}/${CALL_HISTORY_ENDPOINTS.length} ===`);
    
    // Заменяем {client_id} на реальный client_id
    const path = pathTemplate.replace('{client_id}', telfinClientId);
    console.log('Using path:', path);
    
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        urlParams.append(key, String(value));
      }
    });
    
    const url = `https://${API_HOST}${path}?${urlParams.toString()}`;
    console.log('Full URL:', url);
    
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'User-Agent': 'CallControl/1.0.0',
    };

    console.log('Request headers:', { 
      'Authorization': `Bearer ${accessToken.substring(0, 20)}...`,
      'Accept': headers.Accept,
      'User-Agent': headers['User-Agent']
    });

    try {
      console.log(`Making GET request to: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      const responseForText = response.clone();
      const diagnosticEntry = {
        attempt: attemptCount,
        endpoint: path,
        method: 'GET',
        status: response.status,
        url: url,
        clientId: telfinClientId,
        timestamp: new Date().toISOString(),
      };

      console.log(`Response status: ${response.status} for endpoint: ${path}`);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await responseForText.text();
        console.error(`API returned non-OK status for endpoint ${path}:`);
        console.error(`- Status: ${response.status}`);
        console.error(`- Status text: ${response.statusText}`);
        console.error(`- Error response body:`, errorText.substring(0, 1000));
        
        diagnosticEntry.error = errorText.substring(0, 300);
        diagnosticEntry.statusText = response.statusText;
        diagnosticInfo.push(diagnosticEntry);
        
        lastError = `GET ${path}: HTTP ${response.status} (${response.statusText}). ${errorText.substring(0, 300)}`;
        
        // Специальная обработка ошибок авторизации
        if (response.status === 401) {
          diagnosticEntry.authIssue = true;
          console.error('Authentication issue detected - token may be expired or invalid');
        } else if (response.status === 403) {
          diagnosticEntry.authIssue = true;
          console.error('Authorization issue detected - insufficient permissions');
        } else if (response.status === 404) {
          console.error('Endpoint not found - may be incorrect client_id or endpoint path');
        } else if (response.status >= 500) {
          console.error('Server error - Telfin API internal issue');
        }
        
        continue; // Переходим к следующему endpoint
      }

      try {
        const responseData = await response.json();
        console.log(`Successfully received and parsed JSON from endpoint: ${path}`);
        console.log(`Response data structure:`, Object.keys(responseData));
        
        // Логируем количество записей если это массив
        if (Array.isArray(responseData)) {
          console.log(`Direct array response with ${responseData.length} items`);
        } else if (responseData.results && Array.isArray(responseData.results)) {
          console.log(`Response has 'results' array with ${responseData.results.length} items`);
        } else if (responseData.data && Array.isArray(responseData.data)) {
          console.log(`Response has 'data' array with ${responseData.data.length} items`);
        } else {
          console.log('Response structure analysis:', {
            hasResults: 'results' in responseData,
            hasData: 'data' in responseData,
            topLevelKeys: Object.keys(responseData).slice(0, 10)
          });
        }

        diagnosticEntry.success = true;
        diagnosticEntry.dataStructure = Object.keys(responseData);
        
        // Определяем количество записей
        let recordsCount = 0;
        if (Array.isArray(responseData)) {
          recordsCount = responseData.length;
        } else if (responseData.results && Array.isArray(responseData.results)) {
          recordsCount = responseData.results.length;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          recordsCount = responseData.data.length;
        }
        
        diagnosticEntry.recordsFound = recordsCount;
        diagnosticInfo.push(diagnosticEntry);

        console.log(`SUCCESS! Found ${recordsCount} call records`);
        console.log('=== TELFIN GET CALL HISTORY SUCCESS ===\n');

        // Успех!
        return new Response(JSON.stringify({ 
          success: true, 
          method: 'GET',
          endpoint: path, 
          clientId: telfinClientId,
          recordsCount,
          data: responseData,
          diagnostics: diagnosticInfo,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (jsonError) {
        const errorText = await responseForText.text();
        console.error(`Failed to parse JSON from endpoint: ${path}`);
        console.error('JSON parse error:', jsonError);
        console.error('Response text:', errorText.substring(0, 1000));
        
        diagnosticEntry.jsonError = `${jsonError}`;
        diagnosticEntry.responseText = errorText.substring(0, 300);
        diagnosticInfo.push(diagnosticEntry);
        
        lastError = `GET ${path}: JSON parse error. ${jsonError}`;
        continue;
      }
    } catch (networkError) {
      const errorMessage = `GET ${path}: Network error. ${networkError instanceof Error ? networkError.message : String(networkError)}`;
      console.error(`Network error for endpoint ${path}:`, networkError);
      
      diagnosticInfo.push({
        attempt: attemptCount,
        endpoint: path,
        method: 'GET',
        networkError: errorMessage,
        clientId: telfinClientId,
        timestamp: new Date().toISOString(),
      });
      
      lastError = errorMessage;
      continue;
    }
  }

  // Все endpoint'ы не сработали - анализируем и возвращаем детальную диагностику
  console.error('=== ALL ENDPOINTS FAILED ===');
  console.error('Final error:', lastError);
  console.error('Diagnostic info:', diagnosticInfo);

  const authIssues = diagnosticInfo.filter(d => d.authIssue || d.status === 401 || d.status === 403);
  const notFoundIssues = diagnosticInfo.filter(d => d.status === 404);
  const serverErrors = diagnosticInfo.filter(d => d.status >= 500);
  
  let recommendedAction = '';
  let errorCategory = 'unknown';
  
  if (authIssues.length > 0) {
    errorCategory = 'authentication';
    recommendedAction = 'Проверьте права доступа приложения. Возможно, требуется уровень доступа "All" вместо "Call API". Также проверьте, не истек ли токен доступа.';
  } else if (notFoundIssues.length === diagnosticInfo.length) {
    errorCategory = 'not_found';
    recommendedAction = 'Все endpoint\'ы возвращают 404. Проверьте правильность client_id и доступность API endpoints.';
  } else if (serverErrors.length > 0) {
    errorCategory = 'server_error';
    recommendedAction = 'Сервер Telfin API возвращает ошибки 5xx. Попробуйте позже или обратитесь в поддержку Telfin.';
  } else {
    recommendedAction = 'Проверьте настройки приложения и используйте интерактивный обозреватель API для тестирования.';
  }

  console.log('=== TELFIN GET CALL HISTORY FAILED ===\n');

  // Возвращаем подробную диагностическую информацию
  return new Response(
    JSON.stringify({
      success: false,
      error: `[TELFIN-API-005] ${lastError || 'Не удалось получить историю звонков ни по одному из endpoint\'ов.'}`,
      errorCategory,
      diagnostics: {
        clientId: telfinClientId,
        totalEndpointsTried: CALL_HISTORY_ENDPOINTS.length,
        detailedResults: diagnosticInfo,
        recommendedAction,
        summary: {
          authIssuesFound: authIssues.length,
          notFoundIssuesFound: notFoundIssues.length,
          serverErrorsFound: serverErrors.length,
          networkErrorsFound: diagnosticInfo.filter(d => d.networkError).length,
        },
        apiExplorerUrl: `https://${API_HOST}/api/ver1.0/client_api_explorer/`,
        supportInfo: {
          possibleCauses: [
            'Неправильный client_id',
            'Недостаточные права доступа приложения', 
            'Истекший или неверный токен авторизации',
            'Неверные параметры запроса',
            'Проблемы с сервером Telfin API'
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
