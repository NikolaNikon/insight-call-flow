
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Download
} from "lucide-react";

const Analytics = () => {
  const weeklyData = [
    { day: 'Пн', calls: 45, satisfaction: 85, avgDuration: 6.2 },
    { day: 'Вт', calls: 52, satisfaction: 88, avgDuration: 5.8 },
    { day: 'Ср', calls: 38, satisfaction: 82, avgDuration: 7.1 },
    { day: 'Чт', calls: 61, satisfaction: 91, avgDuration: 6.0 },
    { day: 'Пт', calls: 55, satisfaction: 87, avgDuration: 6.5 },
    { day: 'Сб', calls: 42, satisfaction: 89, avgDuration: 5.9 },
    { day: 'Вс', calls: 33, satisfaction: 84, avgDuration: 6.8 }
  ];

  const managerPerformance = [
    { name: 'Иванов И.', calls: 45, satisfaction: 92, general: 8.3 },
    { name: 'Петров П.', calls: 38, satisfaction: 87, general: 7.6 },
    { name: 'Сидоров С.', calls: 52, satisfaction: 84, general: 7.9 },
    { name: 'Козлов К.', calls: 41, satisfaction: 90, general: 8.1 },
    { name: 'Васильев В.', calls: 35, satisfaction: 86, general: 7.8 }
  ];

  const sentimentData = [
    { name: 'Позитивные', value: 65, color: '#10b981' },
    { name: 'Нейтральные', value: 25, color: '#f59e0b' },
    { name: 'Негативные', value: 10, color: '#ef4444' }
  ];

  const topIssues = [
    { issue: 'Долгое время ожидания', count: 23, trend: 'up' },
    { issue: 'Некорректная информация о бронировании', count: 18, trend: 'down' },
    { issue: 'Плохое качество услуг', count: 15, trend: 'up' },
    { issue: 'Проблемы с оплатой', count: 12, trend: 'down' },
    { issue: 'Забытые вещи', count: 9, trend: 'stable' }
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Аналитика</h1>
              <p className="text-gray-600">Детальная аналитика производительности и качества обслуживания</p>
            </div>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Экспорт данных
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="managers">Менеджеры</TabsTrigger>
            <TabsTrigger value="sentiment">Настроения</TabsTrigger>
            <TabsTrigger value="issues">Проблемы</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
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
                    <div className="p-3 rounded-lg bg-green-100">
                      <ThumbsUp className="h-6 w-6 text-green-600" />
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
                    <div className="p-3 rounded-lg bg-orange-100">
                      <Users className="h-6 w-6 text-orange-600" />
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
                    <div className="p-3 rounded-lg bg-purple-100">
                      <MessageSquare className="h-6 w-6 text-purple-600" />
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
                <CardHeader>
                  <CardTitle>Динамика звонков</CardTitle>
                  <CardDescription>Количество звонков и удовлетворенность по дням недели</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="calls" 
                          stroke="#3b82f6" 
                          fill="#3b82f6" 
                          fillOpacity={0.1}
                          name="Звонки"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Месячные тренды</CardTitle>
                  <CardDescription>Динамика за последние 6 месяцев</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                        <YAxis stroke="#6b7280" fontSize={12} />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="calls" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Звонки"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="satisfaction" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Удовлетворенность %"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="managers" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Производительность менеджеров</CardTitle>
                <CardDescription>Детальная статистика по каждому менеджеру</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {managerPerformance.map((manager, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="font-medium text-gray-700">
                              {manager.name.split(' ')[0][0]}{manager.name.split(' ')[1][0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{manager.name}</h3>
                            <p className="text-sm text-gray-500">{manager.calls} звонков за неделю</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {manager.general}/10
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Удовлетворенность клиентов</span>
                            <span className="font-medium">{manager.satisfaction}%</span>
                          </div>
                          <Progress value={manager.satisfaction} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Общая оценка</span>
                            <span className="font-medium">{manager.general}/10</span>
                          </div>
                          <Progress value={manager.general * 10} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Количество звонков</span>
                            <span className="font-medium">{manager.calls}</span>
                          </div>
                          <Progress value={(manager.calls / 60) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Анализ настроений</CardTitle>
                  <CardDescription>Распределение настроений клиентов в звонках</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {sentimentData.map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                        <p className="text-xs text-gray-600">{item.name}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle>Ключевые слова</CardTitle>
                  <CardDescription>Наиболее часто упоминаемые слова и фразы</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Позитивные
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['отлично', 'спасибо', 'хороший сервис', 'довольны', 'рекомендую'].map((word, index) => (
                          <Badge key={index} variant="outline" className="text-green-600 border-green-200">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-red-600 mb-2 flex items-center gap-2">
                        <ThumbsDown className="h-4 w-4" />
                        Негативные
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {['долго ждать', 'плохо', 'не доволен', 'проблема', 'жалоба'].map((word, index) => (
                          <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                            {word}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Популярные проблемы клиентов
                </CardTitle>
                <CardDescription>
                  Наиболее часто встречающиеся проблемы и жалобы
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-orange-600">
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{issue.issue}</h4>
                          <p className="text-sm text-gray-500">Упоминаний: {issue.count}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {issue.trend === 'up' && (
                          <Badge variant="destructive" className="text-xs">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Растет
                          </Badge>
                        )}
                        {issue.trend === 'down' && (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                            <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
                            Снижается
                          </Badge>
                        )}
                        {issue.trend === 'stable' && (
                          <Badge variant="outline" className="text-xs">
                            Стабильно
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;
