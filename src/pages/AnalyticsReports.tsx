
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
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
  Download,
  FileText,
  Calendar as CalendarIcon,
  Clock,
  Star,
  Play,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Share,
  Plus,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const AnalyticsReports = () => {
  const [reportType, setReportType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Data from Analytics
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

  // Data from Reports
  const savedReports = [
    {
      id: "RPT-001",
      name: "Еженедельный отчет 15-21 янв",
      type: "Еженедельный",
      created: "2024-01-22",
      manager: "Система",
      status: "ready",
      description: "Полный анализ работы команды за неделю"
    },
    {
      id: "RPT-002", 
      name: "Месячный отчет декабрь 2023",
      type: "Месячный",
      created: "2024-01-01",
      manager: "Система",
      status: "ready",
      description: "Подробная статистика за месяц"
    },
    {
      id: "RPT-003",
      name: "Отчет по менеджеру Иванов И.",
      type: "По менеджеру",
      created: "2024-01-20",
      manager: "Администратор",
      status: "processing",
      description: "Индивидуальный анализ производительности"
    }
  ];

  const filteredReports = savedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600 font-semibold';
    if (score >= 7.0) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };

  const handleCreateReport = () => {
    console.log("Creating report with:", { reportType, selectedPeriod, dateFrom, dateTo });
  };

  const handleCreateReportFromData = () => {
    // Navigate to Reports tab and pre-fill with current data
    setReportType("weekly");
    setSelectedPeriod("current-week");
    // Switch to Reports tab programmatically
    const reportsTab = document.querySelector('[value="reports"]') as HTMLElement;
    if (reportsTab) reportsTab.click();
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📈 Аналитика и отчёты
        </h1>
        <p className="text-gray-600">
          Вся статистика команды, отчёты и экспорт — в одном месте
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="managers">Менеджеры</TabsTrigger>
          <TabsTrigger value="sentiment">Настроения</TabsTrigger>
          <TabsTrigger value="issues">Проблемы</TabsTrigger>
          <TabsTrigger value="reports">Отчёты</TabsTrigger>
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

          {/* CTA for Report Creation */}
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Создать отчёт на основе этих данных
                  </h3>
                  <p className="text-blue-700">
                    Экспортируйте текущую аналитику в удобном формате для презентации или архива
                  </p>
                </div>
                <Button onClick={handleCreateReportFromData} className="gap-2">
                  <FileText className="h-4 w-4" />
                  Создать отчёт
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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

        <TabsContent value="reports" className="space-y-6">
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Создать</TabsTrigger>
              <TabsTrigger value="history">История</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Создание нового отчета
                  </CardTitle>
                  <CardDescription>
                    Настройте параметры для генерации отчета
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Формат отчета
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите формат" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Период
                      </label>
                      <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите период" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="last-7-days">Последние 7 дней</SelectItem>
                          <SelectItem value="current-month">Текущий месяц</SelectItem>
                          <SelectItem value="last-month">Прошлый месяц</SelectItem>
                          <SelectItem value="custom">Выбрать даты</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Название отчета
                      </label>
                      <Input placeholder="Введите название отчета" />
                    </div>
                  </div>

                  {selectedPeriod === "custom" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Дата начала
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateFrom ? format(dateFrom, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateFrom}
                              onSelect={setDateFrom}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Дата окончания
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left font-normal">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateTo ? format(dateTo, "dd.MM.yyyy", { locale: ru }) : "Выберите дату"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={dateTo}
                              onSelect={setDateTo}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={handleCreateReport} className="gap-2">
                      <FileText className="h-4 w-4" />
                      Создать отчет
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Download className="h-4 w-4" />
                      Экспорт
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Share className="h-4 w-4" />
                      Поделиться ссылкой
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-6">
              <Card className="bg-white border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>История отчетов</CardTitle>
                      <CardDescription>
                        Созданные отчеты и их статус
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-2">
                        <Filter className="h-4 w-4" />
                        Фильтры
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Обновить
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Search and Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Поиск отчетов..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        <SelectItem value="ready">Готов</SelectItem>
                        <SelectItem value="processing">В обработке</SelectItem>
                        <SelectItem value="error">Ошибка</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reports List */}
                  <div className="space-y-4">
                    {filteredReports.length > 0 ? filteredReports.map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <span className="font-medium text-gray-900">{report.name}</span>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status === 'ready' ? 'Готов' : 
                               report.status === 'processing' ? 'Обработка' : 'Ошибка'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="text-sm text-gray-500 space-x-4">
                            <span>Тип: {report.type}</span>
                            <span>Создан: {report.created}</span>
                            <span>Автор: {report.manager}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {report.status === 'ready' && (
                            <>
                              <Button size="sm" variant="outline" className="gap-2">
                                <Eye className="h-3 w-3" />
                                Просмотр
                              </Button>
                              <Button size="sm" variant="outline" className="gap-2">
                                <Download className="h-3 w-3" />
                                Скачать
                              </Button>
                            </>
                          )}
                          {report.status === 'processing' && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                              <Clock className="h-3 w-3 mr-1" />
                              Обработка...
                            </Badge>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          У вас пока нет отчётов
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Создайте первый отчёт, выбрав формат и период
                        </p>
                        <Button variant="outline" className="gap-2">
                          <Plus className="h-4 w-4" />
                          Создать первый отчёт
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsReports;
