
import { API_HOST, corsHeaders } from '../utils.ts';
import { TelfinRequest } from '../types.ts';

// Endpoint'ы для диагностики основанные на реальной документации
const DIAGNOSTIC_ENDPOINTS = [
  {
    path: '/api/ver1.0/client/{client_id}/call_history/',
    method: 'GET',
    description: 'История звонков клиента',
    category: 'cdr',
    requiresClientId: true,
  },
  {
    path: '/api/ver1.0/client/{client_id}/calls/',
    method: 'GET', 
    description: 'Список звонков клиента',
    category: 'cdr',
    requiresClientId: true,
  },
  {
    path: '/api/ver1.0/client/{client_id}/cdr/',
    method: 'GET',
    description: 'CDR записи клиента',
    category: 'cdr',
    requiresClientId: true,
  },
  {
    path: '/api/ver1.0/client/{client_id}/calls/stats/',
    method: 'GET',
    description: 'Статистика звонков клиента',
    category: 'cdr',
    requiresClientId: true,
  },
  // Добавляем endpoint'ы, которые не требуют client_id для сравнения
  {
    path: '/api/ver1.0/clients/',
    method: 'GET',
    description: 'Список клиентов',
    category: 'client_info',
    requiresClientId: false,
  },
  {
    path: '/api/ver1.0/permissions/',
    method: 'GET',
    description: 'Права доступа',
    category: 'permissions',
    requiresClientId: false,
  },
];

export async function handleDiagnoseApiAccess(body: TelfinRequest): Promise<Response> {
  console.log('Executing action: diagnose_api_access');
  const { accessToken, telfinClientId } = body;
  
  if (!accessToken) {
    throw new Error('accessToken is required for diagnose_api_access');
  }

  const results: any[] = [];
  let accessibleEndpoints = 0;
  let cdrEndpointsAccessible = 0;
  const cdrEndpointsTotal = DIAGNOSTIC_ENDPOINTS.filter(ep => ep.category === 'cdr').length;

  console.log(`[DiagnoseAPI] Starting diagnosis with client_id: ${telfinClientId || 'not provided'}`);

  for (const endpoint of DIAGNOSTIC_ENDPOINTS) {
    let testPath = endpoint.path;
    let skipTest = false;

    // Заменяем {client_id} если требуется
    if (endpoint.requiresClientId) {
      if (!telfinClientId) {
        results.push({
          endpoint: endpoint.path,
          method: endpoint.method,
          description: endpoint.description,
          accessible: false,
          errorType: 'missing_client_id',
          status: 0,
        });
        skipTest = true;
      } else {
        testPath = endpoint.path.replace('{client_id}', telfinClientId);
      }
    }

    if (skipTest) continue;

    const url = `https://${API_HOST}${testPath}`;
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
      'User-Agent': 'CallControl-Diagnostics/1.0.0',
    };

    console.log(`[DiagnoseAPI] Testing ${endpoint.method} ${testPath}`);

    try {
      const response = await fetch(url, {
        method: endpoint.method,
        headers,
      });

      const result: any = {
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        status: response.status,
        accessible: response.ok,
      };

      if (response.ok) {
        accessibleEndpoints++;
        if (endpoint.category === 'cdr') {
          cdrEndpointsAccessible++;
        }

        try {
          const data = await response.json();
          result.dataStructure = Object.keys(data);
          result.isArray = Array.isArray(data);
          if (result.isArray) {
            result.arrayLength = data.length;
          }
          if (data.results && Array.isArray(data.results)) {
            result.hasRecordsArray = true;
            result.recordsCount = data.results.length;
          }
        } catch (jsonError) {
          result.jsonParseError = 'Response is not valid JSON';
        }
      } else {
        // Определяем тип ошибки
        if (response.status === 401) {
          result.errorType = 'authentication';
        } else if (response.status === 403) {
          result.errorType = 'authorization';
        } else if (response.status === 404) {
          result.errorType = 'not_found';
        } else {
          result.errorType = 'other';
        }

        try {
          const errorText = await response.text();
          result.errorSample = errorText.substring(0, 200);
        } catch (textError) {
          result.errorSample = 'Could not read error response';
        }
      }

      results.push(result);
    } catch (error) {
      console.error(`[DiagnoseAPI] Network error for ${endpoint.path}:`, error);
      results.push({
        endpoint: endpoint.path,
        method: endpoint.method,
        description: endpoint.description,
        accessible: false,
        networkError: error instanceof Error ? error.message : String(error),
        status: 0,
      });
    }
  }

  // Анализируем результаты и создаем рекомендации
  const recommendations: any[] = [];
  const accessibleCdrEndpoints = results.filter(r => r.accessible && DIAGNOSTIC_ENDPOINTS.find(ep => ep.path === r.endpoint)?.category === 'cdr');

  if (accessibleCdrEndpoints.length > 0) {
    recommendations.push({
      type: 'success',
      message: `Найдено ${accessibleCdrEndpoints.length} рабочих CDR endpoint'ов!`,
      accessibleEndpoints: accessibleCdrEndpoints.map(r => ({
        endpoint: r.endpoint,
        method: r.method,
        description: r.description,
      })),
    });
  }

  if (cdrEndpointsAccessible === 0) {
    const missingClientId = results.filter(r => r.errorType === 'missing_client_id').length;
    if (missingClientId > 0) {
      recommendations.push({
        type: 'missing_client_id',
        message: 'Для доступа к CDR endpoint\'ам требуется client_id из информации о пользователе.',
        action: 'Убедитесь, что получена информация о пользователе через getUserInfo().',
      });
    } else {
      recommendations.push({
        type: 'access_rights',
        message: 'CDR endpoint\'ы недоступны. Проверьте права доступа приложения.',
        action: 'Убедитесь, что уровень доступа приложения установлен на "All" вместо "Call API".',
      });
    }
  }

  if (accessibleEndpoints === 0) {
    recommendations.push({
      type: 'critical',
      message: 'Ни один endpoint не доступен. Проверьте токен авторизации.',
      action: 'Пересоздайте токен доступа или проверьте настройки приложения.',
    });
  }

  return new Response(
    JSON.stringify({
      success: true,
      analysis: {
        totalEndpoints: DIAGNOSTIC_ENDPOINTS.length,
        accessibleEndpoints,
        cdrEndpointsTotal,
        cdrEndpointsAccessible,
        recommendations,
      },
      detailedResults: results,
      explorerUrl: `https://${API_HOST}/api/ver1.0/client_api_explorer/`,
      nextSteps: [
        'Используйте доступные endpoint\'ы для получения данных',
        'Проверьте права доступа приложения в настройках Телфин',
        'При необходимости обратитесь в поддержку Телфин',
        'Используйте интерактивный API Explorer для дополнительного тестирования',
      ],
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}
