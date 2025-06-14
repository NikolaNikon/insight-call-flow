
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

export async function handleDiagnoseApiAccess(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: diagnose_api_access');
  const { accessToken } = body;
  
  if (!accessToken) {
    throw new Error('accessToken is required for diagnose_api_access');
  }

  const diagnosticEndpoints = [
    // Базовые endpoint'ы
    { path: '/api/ver1.0/user/', method: 'GET', description: 'Информация о пользователе' },
    { path: '/api/ver1.0/client/', method: 'GET', description: 'Информация о клиенте' },
    
    // CDR/записи звонков
    { path: '/api/ver1.0/cdr/', method: 'GET', description: 'CDR данные (GET)' },
    { path: '/api/ver1.0/cdr/search', method: 'POST', description: 'Поиск CDR (POST)' },
    { path: '/api/ver1.0/calls/', method: 'GET', description: 'Звонки (GET)' },
    { path: '/api/ver1.0/calls/search', method: 'POST', description: 'Поиск звонков (POST)' },
    { path: '/api/ver1.0/calls/list', method: 'POST', description: 'Список звонков (POST)' },
    { path: '/api/ver1.0/records', method: 'GET', description: 'Записи звонков' },
    { path: '/api/ver1.0/call_records', method: 'GET', description: 'Записи разговоров' },
    
    // Права доступа
    { path: '/api/ver1.0/permissions', method: 'GET', description: 'Права доступа приложения' },
    { path: '/api/ver1.0/oauth/permissions', method: 'GET', description: 'OAuth права' },
    { path: '/api/ver1.0/app/permissions', method: 'GET', description: 'Права приложения' },
  ];

  const results = [];
  
  for (const endpoint of diagnosticEndpoints) {
    const url = `https://${API_HOST}${endpoint.path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'CallControl/1.0.0',
    };

    if (endpoint.method === 'POST') {
      headers['Content-Type'] = 'application/json';
      headers['Accept'] = 'application/json';
    }

    console.log(`[ApiDiagnostic] Testing ${endpoint.method} ${url}`);

    try {
      const requestOptions: RequestInit = {
        method: endpoint.method,
        headers,
      };

      // Для POST запросов добавляем тестовые данные
      if (endpoint.method === 'POST') {
        const testData = {
          date_from: '2025-06-01',
          date_to: '2025-06-14',
          limit: 10
        };
        requestOptions.body = JSON.stringify(testData);
      }

      const response = await fetch(url, requestOptions);
      const responseText = await response.text();

      let parsedData = null;
      let isJson = false;
      
      try {
        parsedData = JSON.parse(responseText);
        isJson = true;
      } catch {
        // Не JSON ответ
      }

      const result = {
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: response.status,
        statusText: response.statusText,
        accessible: response.ok,
        isJson,
        responseSize: responseText.length,
        contentType: response.headers.get('content-type'),
      };

      if (response.ok && isJson && parsedData) {
        result.dataStructure = Object.keys(parsedData);
        if (Array.isArray(parsedData)) {
          result.isArray = true;
          result.arrayLength = parsedData.length;
        }
        if (parsedData.records && Array.isArray(parsedData.records)) {
          result.hasRecordsArray = true;
          result.recordsCount = parsedData.records.length;
        }
      } else if (!response.ok) {
        result.errorSample = responseText.substring(0, 200);
        
        // Определяем тип ошибки
        if (response.status === 401) {
          result.errorType = 'authentication';
        } else if (response.status === 403) {
          result.errorType = 'authorization';
        } else if (response.status === 404) {
          result.errorType = 'not_found';
        } else if (response.status >= 500) {
          result.errorType = 'server_error';
        }
      }

      results.push(result);

    } catch (error) {
      console.error(`[ApiDiagnostic] Error testing ${endpoint.path}:`, error);
      results.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: 0,
        accessible: false,
        error: error instanceof Error ? error.message : String(error),
        errorType: 'network_error'
      });
    }
  }

  // Анализируем результаты
  const accessibleEndpoints = results.filter(r => r.accessible);
  const cdrEndpoints = results.filter(r => 
    r.endpoint.includes('cdr') || 
    r.endpoint.includes('call') || 
    r.endpoint.includes('record')
  );
  const accessibleCdrEndpoints = cdrEndpoints.filter(r => r.accessible);
  
  const authErrors = results.filter(r => r.errorType === 'authentication' || r.errorType === 'authorization');
  const notFoundErrors = results.filter(r => r.errorType === 'not_found');

  const analysis = {
    totalEndpoints: results.length,
    accessibleEndpoints: accessibleEndpoints.length,
    cdrEndpointsTotal: cdrEndpoints.length,
    cdrEndpointsAccessible: accessibleCdrEndpoints.length,
    authenticationIssues: authErrors.length,
    notFoundIssues: notFoundErrors.length,
    recommendations: []
  };

  // Генерируем рекомендации
  if (authErrors.length > 0) {
    analysis.recommendations.push({
      type: 'access_rights',
      message: 'Обнаружены проблемы с правами доступа. Проверьте уровень доступа приложения в настройках Telphin.',
      action: 'Измените уровень доступа с "Call API" на "All" в настройках приложения.'
    });
  }

  if (accessibleCdrEndpoints.length === 0) {
    analysis.recommendations.push({
      type: 'cdr_access',
      message: 'Нет доступа ни к одному endpoint\'у для получения данных о звонках.',
      action: 'Используйте интерактивный обозреватель API для поиска правильных endpoint\'ов.'
    });
  } else {
    analysis.recommendations.push({
      type: 'success',
      message: `Найдено ${accessibleCdrEndpoints.length} доступных endpoint(ов) для работы с данными о звонках.`,
      accessibleEndpoints: accessibleCdrEndpoints.map(e => ({
        endpoint: e.endpoint,
        method: e.method,
        description: e.description
      }))
    });
  }

  if (notFoundErrors.length > results.length * 0.8) {
    analysis.recommendations.push({
      type: 'api_version',
      message: 'Большинство endpoint\'ов возвращают 404. Возможно, используется неправильная версия API.',
      action: 'Проверьте документацию API и используйте интерактивный обозреватель для определения правильных путей.'
    });
  }

  return new Response(JSON.stringify({
    success: true,
    timestamp: new Date().toISOString(),
    apiHost: API_HOST,
    explorerUrl: `https://${API_HOST}/api/ver1.0/client_api_explorer/`,
    analysis,
    detailedResults: results,
    nextSteps: [
      'Используйте интерактивный обозреватель API для тестирования endpoint\'ов',
      'Проверьте права доступа приложения в настройках Telphin',
      'Если проблемы продолжаются, обратитесь в службу поддержки Telphin'
    ]
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
