
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PerformanceMetrics } from "@/components/PerformanceMetrics";
import { RecentCalls } from "@/components/RecentCalls";
import { CallsChart } from "@/components/CallsChart";
import { AudioUploader } from "@/components/AudioUploader";
import { ProcessingMonitor } from "@/components/ProcessingMonitor";
import { ExportManager } from "@/components/ExportManager";
import { useRealtimeUpdates } from "@/hooks/useRealtimeUpdates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  // Подключаем real-time обновления
  useRealtimeUpdates();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CallControl - Аналитика звонков
          </h1>
          <p className="text-gray-600">
            Система контроля качества телефонных переговоров и анализа эффективности менеджеров
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Загрузка</TabsTrigger>
            <TabsTrigger value="analytics">Аналитика</TabsTrigger>
            <TabsTrigger value="monitoring">Мониторинг</TabsTrigger>
            <TabsTrigger value="export">Экспорт</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <AudioUploader />
            <ProcessingMonitor />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <PerformanceMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CallsChart />
              <RecentCalls />
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProcessingMonitor />
              <Card>
                <CardHeader>
                  <CardTitle>Статистика обработки</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Всего звонков сегодня:</span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">В обработке:</span>
                      <span className="font-medium text-blue-600">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Завершено:</span>
                      <span className="font-medium text-green-600">0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ошибки:</span>
                      <span className="font-medium text-red-600">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <ExportManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
