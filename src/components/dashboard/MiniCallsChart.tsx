
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';

export const MiniCallsChart = () => {
  const { callVolumeData, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📈 Объем звонков за 7 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!callVolumeData || callVolumeData.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-200">
        <CardHeader>
          <CardTitle>📈 Объем звонков за 7 дней</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Нет звонков за выбранный период</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  const chartData = callVolumeData.map(item => ({
    ...item,
    formattedDate: formatDate(item.date)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>📈 Объем звонков за 7 дней</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={chartData}>
            <XAxis 
              dataKey="formattedDate" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip 
              labelFormatter={(value) => `Дата: ${value}`}
              formatter={(value) => [`${value} звонков`, 'Количество']}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
