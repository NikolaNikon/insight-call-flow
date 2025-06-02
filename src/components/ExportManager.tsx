
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, FileSpreadsheet, Code } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ExportType = 'pdf' | 'excel' | 'json';

export const ExportManager = () => {
  const [exportType, setExportType] = useState<ExportType>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const { data: exports = [], refetch } = useQuery({
    queryKey: ['exports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    }
  });

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Создаем запись экспорта
      const { data, error } = await supabase
        .from('exports')
        .insert({
          type: exportType,
          filters: {},
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Экспорт запущен",
        description: `Начинается создание ${exportType.toUpperCase()} отчета`,
      });

      // Здесь можно вызвать edge function для генерации отчета
      // await supabase.functions.invoke('generate-export', {
      //   body: { exportId: data.id, type: exportType }
      // });

      refetch();
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось создать отчет",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'json': return <Code className="h-4 w-4 text-blue-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5 text-blue-600" />
          Экспорт отчетов
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Создание нового экспорта */}
        <div className="flex items-center gap-4">
          <Select value={exportType} onValueChange={(value: ExportType) => setExportType(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-red-500" />
                  PDF отчет
                </div>
              </SelectItem>
              <SelectItem value="excel">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-green-500" />
                  Excel таблица
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-blue-500" />
                  JSON данные
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? 'Создание...' : 'Создать отчет'}
          </Button>
        </div>

        {/* История экспортов */}
        {exports.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">История экспортов</h3>
            {exports.map(exportItem => (
              <div key={exportItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTypeIcon(exportItem.type)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exportItem.type.toUpperCase()} отчет</span>
                      <Badge 
                        variant="outline" 
                        className={`text-white ${getStatusColor(exportItem.status)}`}
                      >
                        {exportItem.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(exportItem.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                </div>
                
                {exportItem.status === 'completed' && exportItem.file_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={exportItem.file_url} download>
                      <Download className="h-4 w-4 mr-1" />
                      Скачать
                    </a>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
