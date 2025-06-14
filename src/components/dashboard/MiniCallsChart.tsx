
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTheme } from '../ThemeProvider';

export const MiniCallsChart = () => {
  const { callVolumeData, isLoading } = useDashboardData();
  const { resolvedTheme } = useTheme();

  const primaryColor = resolvedTheme === 'dark' ? 'hsl(219 56% 53%)' : 'hsl(208 41% 47%)';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📈 Объем звонков за 7 дней</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!callVolumeData || callVolumeData.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle>📈 Объем звонков за 7 дней</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Нет звонков за выбранный период</p>
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
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
              }}
              labelFormatter={(value) => `Дата: ${value}`}
              formatter={(value) => [`${value} звонков`, 'Количество']}
            />
            <Line 
              type="monotone" 
              dataKey="count" 
              stroke={primaryColor} 
              strokeWidth={2}
              dot={{ fill: primaryColor, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
