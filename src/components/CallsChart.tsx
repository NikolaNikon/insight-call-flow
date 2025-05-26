
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Loader2 } from "lucide-react";
import { useCallStats } from "@/hooks/useCalls";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const CallsChart = () => {
  const { data: stats, isLoading, error } = useCallStats();

  if (isLoading) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Статистика звонков
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Статистика звонков
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-gray-500">Не удалось загрузить данные</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = stats.chartData.slice(-7).map(item => ({
    day: format(new Date(item.date), 'EEE', { locale: ru }),
    calls: item.calls,
    satisfaction: item.satisfaction
  }));

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Статистика звонков за неделю
        </CardTitle>
        <CardDescription>
          Всего звонков: {stats.totalCalls} | Средняя оценка: {stats.avgScore}/10 | Удовлетворенность: {stats.avgSatisfaction}%
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value, name) => [
                  value,
                  name === 'calls' ? 'Звонки' : 'Удовлетворенность (%)'
                ]}
              />
              <Bar 
                dataKey="calls" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="calls"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export { CallsChart };
