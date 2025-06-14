
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  ThumbsUp, 
  Users, 
  MessageSquare,
  FileText,
  ArrowRight
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface AnalyticsOverviewProps {
  onCreateReport: () => void;
}

export const AnalyticsOverview = ({ onCreateReport }: AnalyticsOverviewProps) => {
  const weeklyData = [
    { day: 'Пн', calls: 45, satisfaction: 85, avgDuration: 6.2 },
    { day: 'Вт', calls: 52, satisfaction: 88, avgDuration: 5.8 },
    { day: 'Ср', calls: 38, satisfaction: 82, avgDuration: 7.1 },
    { day: 'Чт', calls: 61, satisfaction: 91, avgDuration: 6.0 },
    { day: 'Пт', calls: 55, satisfaction: 87, avgDuration: 6.5 },
    { day: 'Сб', calls: 42, satisfaction: 89, avgDuration: 5.9 },
    { day: 'Вс', calls: 33, satisfaction: 84, avgDuration: 6.8 }
  ];

  const monthlyTrend = [
    { month: 'Янв', calls: 1205, satisfaction: 83 },
    { month: 'Фев', calls: 1156, satisfaction: 85 },
    { month: 'Мар', calls: 1324, satisfaction: 87 },
    { month: 'Апр', calls: 1289, satisfaction: 86 },
    { month: 'Май', calls: 1445, satisfaction: 89 },
    { month: 'Июн', calls: 1567, satisfaction: 91 }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-theme-blue-bg">
                <BarChart3 className="h-6 w-6 text-theme-blue-text" />
              </div>
              <Badge variant="default" className="text-xs">+12%</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">293</p>
              <p className="text-sm text-gray-600">Звонков за неделю</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-theme-green-bg">
                <ThumbsUp className="h-6 w-6 text-theme-green-text" />
              </div>
              <Badge variant="default" className="text-xs">+5%</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">87%</p>
              <p className="text-sm text-gray-600">Удовлетворенность</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-theme-orange-bg">
                <Users className="h-6 w-6 text-theme-orange-text" />
              </div>
              <Badge variant="default" className="text-xs">+2</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">24</p>
              <p className="text-sm text-gray-600">Активных менеджеров</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-theme-purple-bg">
                <MessageSquare className="h-6 w-6 text-theme-purple-text" />
              </div>
              <Badge variant="outline" className="text-xs">6.2 мин</Badge>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">8.1</p>
              <p className="text-sm text-gray-600">Средняя оценка</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Динамика звонков</h3>
            <p className="text-sm text-gray-600 mb-4">Количество звонков по дням недели</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="hsl(var(--text-color-blue))" 
                    fill="hsl(var(--text-color-blue))" 
                    fillOpacity={0.1}
                    name="Звонки"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Месячные тренды</h3>
            <p className="text-sm text-gray-600 mb-4">Динамика за последние 6 месяцев</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="calls" 
                    stroke="hsl(var(--text-color-blue))" 
                    strokeWidth={2}
                    name="Звонки"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="satisfaction" 
                    stroke="hsl(var(--text-color-green))" 
                    strokeWidth={2}
                    name="Удовлетворенность %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA for Report Creation */}
      <Card className="bg-theme-blue-bg border-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-theme-blue-text mb-2">
                Создать отчёт на основе этих данных
              </h3>
              <p className="text-theme-blue-text/80">
                Экспортируйте текущую аналитику в удобном формате для презентации или архива
              </p>
            </div>
            <Button onClick={onCreateReport}>
              <FileText className="h-4 w-4" />
              Создать отчёт
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
