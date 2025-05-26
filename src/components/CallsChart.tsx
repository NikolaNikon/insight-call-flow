
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp } from "lucide-react";

const CallsChart = () => {
  const data = [
    { day: 'Пн', calls: 45, satisfaction: 85 },
    { day: 'Вт', calls: 52, satisfaction: 88 },
    { day: 'Ср', calls: 38, satisfaction: 82 },
    { day: 'Чт', calls: 61, satisfaction: 91 },
    { day: 'Пт', calls: 55, satisfaction: 87 },
    { day: 'Сб', calls: 42, satisfaction: 89 },
    { day: 'Вс', calls: 33, satisfaction: 84 }
  ];

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Статистика звонков за неделю
        </CardTitle>
        <CardDescription>
          Количество звонков и уровень удовлетворенности клиентов
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
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
              />
              <Bar 
                dataKey="calls" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Звонки"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export { CallsChart };
