
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProcessingMonitor } from "@/components/ProcessingMonitor";

const Monitoring = () => {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Мониторинг системы
        </h1>
        <p className="text-gray-600">
          Отслеживайте обработку звонков и статус системы в реальном времени
        </p>
      </div>

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
    </div>
  );
};

export default Monitoring;
