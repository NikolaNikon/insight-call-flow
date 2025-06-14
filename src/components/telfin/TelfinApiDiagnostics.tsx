import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, TestTube, ExternalLink, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TelfinClientInfo } from '@/services/telfinOAuthApi';

interface ApiDiagnosticResult {
  endpoint: string;
  method: string;
  description: string;
  status: number;
  accessible: boolean;
  errorType?: string;
  dataStructure?: string[];
  isArray?: boolean;
  arrayLength?: number;
  hasRecordsArray?: boolean;
  recordsCount?: number;
  errorSample?: string;
}

interface DiagnosticData {
  success: boolean;
  analysis: {
    totalEndpoints: number;
    accessibleEndpoints: number;
    cdrEndpointsTotal: number;
    cdrEndpointsAccessible: number;
    recommendations: Array<{
      type: string;
      message: string;
      action?: string;
      accessibleEndpoints?: Array<{
        endpoint: string;
        method: string;
        description: string;
      }>;
    }>;
  };
  detailedResults: ApiDiagnosticResult[];
  explorerUrl: string;
  nextSteps: string[];
}

interface TelfinApiDiagnosticsProps {
  accessToken: string | null;
  userInfo?: TelfinClientInfo | null;
}

export const TelfinApiDiagnostics: React.FC<TelfinApiDiagnosticsProps> = ({ accessToken, userInfo }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const runDiagnostics = async () => {
    if (!accessToken) {
      toast({
        title: "Ошибка диагностики",
        description: "Токен доступа отсутствует. Сначала подключитесь к API.",
        variant: "destructive"
      });
      return;
    }

    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'diagnose_api_access',
          accessToken: accessToken,
          telfinClientId: userInfo?.client_id,
        },
      });

      if (error) throw error;
      
      if (data.success) {
        setDiagnosticData(data);
        toast({
          title: "Диагностика завершена",
          description: `Проверено ${data.analysis.totalEndpoints} endpoint'ов. Доступно: ${data.analysis.accessibleEndpoints}.`
        });
      } else {
        throw new Error(data.error || 'Неизвестная ошибка диагностики');
      }
    } catch (error: any) {
      console.error('Diagnostic error:', error);
      toast({
        title: "Ошибка диагностики",
        description: error.message || 'Не удалось выполнить диагностику API',
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getStatusIcon = (result: ApiDiagnosticResult) => {
    if (result.accessible) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (result.errorType === 'authentication' || result.errorType === 'authorization') {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusBadge = (result: ApiDiagnosticResult) => {
    if (result.accessible) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Доступен</Badge>;
    } else if (result.errorType === 'authentication' || result.errorType === 'authorization') {
      return <Badge variant="destructive" className="bg-yellow-100 text-yellow-800">Нет прав</Badge>;
    } else if (result.errorType === 'not_found') {
      return <Badge variant="secondary">Не найден</Badge>;
    } else {
      return <Badge variant="destructive">Ошибка</Badge>;
    }
  };

  const groupedResults = diagnosticData?.detailedResults.reduce((groups, result) => {
    let category = 'Прочие';
    if (result.endpoint.includes('cdr') || result.endpoint.includes('call') || result.endpoint.includes('record')) {
      category = 'CDR и записи звонков';
    } else if (result.endpoint.includes('user') || result.endpoint.includes('client')) {
      category = 'Информация о пользователе';
    } else if (result.endpoint.includes('permission') || result.endpoint.includes('oauth')) {
      category = 'Права доступа';
    }
    
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(result);
    return groups;
  }, {} as Record<string, ApiDiagnosticResult[]>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Диагностика API доступа
        </CardTitle>
        {userInfo && (
          <p className="text-sm text-gray-600">
            Client ID: <code className="bg-gray-100 px-1 rounded">{userInfo.client_id}</code>
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning || !accessToken}
            className="gap-2"
          >
            <TestTube className="h-4 w-4" />
            {isRunning ? 'Выполняется...' : 'Запустить диагностику'}
          </Button>
          
          {diagnosticData && (
            <Button variant="outline" asChild>
              <a href={diagnosticData.explorerUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                API Explorer
              </a>
            </Button>
          )}
        </div>

        {!userInfo && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Для полной диагностики CDR endpoint'ов необходима информация о клиенте. 
              Сначала подключитесь к API.
            </p>
          </div>
        )}

        {diagnosticData && (
          <div className="space-y-4">
            {/* Общая статистика */}
            <Card>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{diagnosticData.analysis.totalEndpoints}</div>
                    <div className="text-sm text-gray-600">Всего endpoint'ов</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{diagnosticData.analysis.accessibleEndpoints}</div>
                    <div className="text-sm text-gray-600">Доступных</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{diagnosticData.analysis.cdrEndpointsTotal}</div>
                    <div className="text-sm text-gray-600">CDR endpoint'ов</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{diagnosticData.analysis.cdrEndpointsAccessible}</div>
                    <div className="text-sm text-gray-600">CDR доступных</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Рекомендации */}
            {diagnosticData.analysis.recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Рекомендации</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {diagnosticData.analysis.recommendations.map((rec, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      rec.type === 'success' ? 'bg-green-50 border-green-200' :
                      rec.type === 'access_rights' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="font-medium">{rec.message}</div>
                      {rec.action && <div className="text-sm mt-1 text-gray-600">{rec.action}</div>}
                      {rec.accessibleEndpoints && (
                        <div className="mt-2">
                          <div className="text-sm font-medium mb-1">Доступные endpoint'ы:</div>
                          {rec.accessibleEndpoints.map((ep, i) => (
                            <Badge key={i} variant="outline" className="mr-1 mb-1">
                              {ep.method} {ep.endpoint}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Детальные результаты */}
            {groupedResults && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Детальные результаты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(groupedResults).map(([category, results]) => (
                    <Collapsible key={category}>
                      <CollapsibleTrigger 
                        className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                        onClick={() => toggleSection(category)}
                      >
                        <span className="font-medium">{category} ({results.length})</span>
                        {expandedSections.has(category) ? 
                          <ChevronDown className="h-4 w-4" /> : 
                          <ChevronRight className="h-4 w-4" />
                        }
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 space-y-2">
                        {results.map((result, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(result)}
                                <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {result.method} {result.endpoint}
                                </code>
                              </div>
                              {getStatusBadge(result)}
                            </div>
                            <div className="text-sm text-gray-600 mb-1">{result.description}</div>
                            {result.status > 0 && (
                              <div className="text-xs text-gray-500">HTTP {result.status}</div>
                            )}
                            {result.dataStructure && (
                              <div className="text-xs text-green-600 mt-1">
                                Структура данных: {result.dataStructure.join(', ')}
                              </div>
                            )}
                            {result.errorSample && (
                              <div className="text-xs text-red-600 mt-1 font-mono bg-red-50 p-1 rounded">
                                {result.errorSample}
                              </div>
                            )}
                          </div>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Следующие шаги */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Следующие шаги</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {diagnosticData.nextSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
