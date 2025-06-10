
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, XCircle, Loader2, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProcessingCall {
  id: string;
  date: string;
  processing_status: string;
  processing_step: string;
  upload_progress: number;
  error_message?: string;
  customer: { name: string };
  manager: { name: string };
}

export const ProcessingMonitor = () => {
  const { data: processingCalls = [], refetch } = useQuery({
    queryKey: ['processing-calls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calls')
        .select(`
          id,
          date,
          processing_status,
          processing_step,
          upload_progress,
          error_message,
          customers:customer_id (name),
          managers:manager_id (name)
        `)
        .in('processing_status', ['pending', 'processing'])
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data?.map(call => ({
        id: call.id,
        date: call.date,
        processing_status: call.processing_status || 'pending',
        processing_step: call.processing_step || 'pending',
        upload_progress: call.upload_progress || 0,
        error_message: call.error_message,
        customer: { name: call.customers?.name || 'Неизвестно' },
        manager: { name: call.managers?.name || 'Неизвестно' }
      })) as ProcessingCall[] || [];
    },
    refetchInterval: 2000 // Обновляем каждые 2 секунды
  });

  const getStepProgress = (step: string) => {
    switch (step) {
      case 'pending': return 0;
      case 'uploading': return 25;
      case 'transcribing': return 50;
      case 'diarizing': return 75;
      case 'analyzing': return 90;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const getStepLabel = (step: string) => {
    switch (step) {
      case 'pending': return 'Ожидание';
      case 'uploading': return 'Загрузка';
      case 'transcribing': return 'Транскрипция';
      case 'diarizing': return 'Диаризация';
      case 'analyzing': return 'Анализ';
      case 'completed': return 'Завершено';
      default: return 'Неизвестно';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (processingCalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-gray-500" />
            Мониторинг обработки
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            Нет файлов в обработке
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
          Мониторинг обработки ({processingCalls.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {processingCalls.map(call => (
            <div key={call.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(call.processing_status)}
                    <span className="font-medium">
                      {call.customer.name} → {call.manager.name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(call.date).toLocaleString('ru-RU')}
                  </p>
                </div>
                <Badge variant="outline">
                  {getStepLabel(call.processing_step)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Прогресс обработки</span>
                  <span>{getStepProgress(call.processing_step)}%</span>
                </div>
                <Progress value={getStepProgress(call.processing_step)} />
              </div>
              
              {call.error_message && (
                <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {call.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
