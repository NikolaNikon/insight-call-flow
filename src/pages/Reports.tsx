
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Clock,
  Star,
  TrendingUp,
  Play
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const Reports = () => {
  const [reportType, setReportType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const weeklyReport = {
    period: "15-21 января 2024",
    totalCalls: 150,
    avgDuration: 7,
    satisfaction: 85,
    managers: [
      {
        name: "Иванов И.",
        calls: 50,
        avgDuration: 6,
        satisfaction: 90,
        transcription: 8,
        communication: 9,
        sales: 7,
        general: 8.5
      },
      {
        name: "Петров П.",
        calls: 40,
        avgDuration: 7,
        satisfaction: 80,
        transcription: 7,
        communication: 8,
        sales: 6,
        general: 7.0
      },
      {
        name: "Сидоров С.",
        calls: 60,
        avgDuration: 8,
        satisfaction: 85,
        transcription: 9,
        communication: 8,
        sales: 7,
        general: 8.0
      }
    ],
    topIssues: [
      "Долгое время ожидания на линии",
      "Некорректная информация о бронированиях",
      "Плохое качество услуг в бане"
    ],
    audioLinks: [
      { id: "CALL-001", customer: "Иван Иванов", url: "#" },
      { id: "CALL-002", customer: "Мария Петрова", url: "#" },
      { id: "CALL-003", customer: "Алексей Сидоров", url: "#" }
    ]
  };

  const savedReports = [
    {
      id: "RPT-001",
      name: "Еженедельный отчет 15-21 янв",
      type: "Еженедельный",
      created: "2024-01-22",
      manager: "Система",
      status: "ready"
    },
    {
      id: "RPT-002", 
      name: "Месячный отчет декабрь 2023",
      type: "Месячный",
      created: "2024-01-01",
      manager: "Система",
      status: "ready"
    },
    {
      id: "RPT-003",
      name: "Отчет по менеджеру Иванов И.",
      type: "По менеджеру",
      created: "2024-01-20",
      manager: "Администратор",
      status: "processing"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Отчеты</h1>
          <p className="text-gray-600">Создание и управление отчетами по работе менеджеров</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Создать отчет</TabsTrigger>
            <TabsTrigger value="weekly">Недельный отчет</TabsTrigger>
            <TabsTrigger value="saved">Сохраненные отчеты</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
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
                      Тип отчета
                    </label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите тип отчета" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Еженедельный</SelectItem>
                        <SelectItem value="monthly">Месячный</SelectItem>
                        <SelectItem value="manager">По менеджеру</SelectItem>
                        <SelectItem value="custom">Пользовательский</SelectItem>
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
                        <SelectItem value="current-week">Текущая неделя</SelectItem>
                        <SelectItem value="last-week">Прошлая неделя</SelectItem>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Button className="gap-2">
                    <FileText className="h-4 w-4" />
                    Создать отчет
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Экспорт в PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Еженедельный отчет по менеджерам
                    </CardTitle>
                    <CardDescription>{weeklyReport.period}</CardDescription>
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Скачать PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Общие показатели</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-900">{weeklyReport.totalCalls}</p>
                    <p className="text-sm text-blue-600">Количество звонков</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-900">Среднее время</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">{weeklyReport.avgDuration} мин</p>
                    <p className="text-sm text-green-600">Обработки звонка</p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-orange-900">Удовлетворенность</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-900">{weeklyReport.satisfaction}%</p>
                    <p className="text-sm text-orange-600">Клиентов</p>
                  </div>
                </div>

                {/* Manager Performance Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Производительность менеджеров</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Менеджер</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Кол-во звонков</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Ср. время</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Удовлетворенность</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Транскрипция</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Коммуникация</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Продажи</th>
                          <th className="text-center py-3 px-4 font-medium text-gray-900">Общая оценка</th>
                        </tr>
                      </thead>
                      <tbody>
                        {weeklyReport.managers.map((manager, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">{manager.name}</td>
                            <td className="py-3 px-4 text-center">{manager.calls}</td>
                            <td className="py-3 px-4 text-center">{manager.avgDuration} мин</td>
                            <td className="py-3 px-4 text-center">{manager.satisfaction}%</td>
                            <td className="py-3 px-4 text-center">
                              <span className={getScoreColor(manager.transcription)}>
                                {manager.transcription}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={getScoreColor(manager.communication)}>
                                {manager.communication}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className={getScoreColor(manager.sales)}>
                                {manager.sales}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge 
                                variant="outline" 
                                className={`${getScoreColor(manager.general)} border-current`}
                              >
                                {manager.general}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Issues */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные проблемы клиентов</h3>
                  <div className="space-y-2">
                    {weeklyReport.topIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="text-sm text-gray-900">{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio Records */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Аудиозаписи разговоров</h3>
                  <div className="space-y-3">
                    {weeklyReport.audioLinks.map((audio, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-900">{audio.customer}</span>
                          <span className="text-sm text-gray-500 ml-2">({audio.id})</span>
                        </div>
                        <Button size="sm" variant="outline" className="gap-2">
                          <Play className="h-3 w-3" />
                          Прослушать
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card className="bg-white border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Сохраненные отчеты</CardTitle>
                <CardDescription>
                  История созданных отчетов и их статус
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {savedReports.map((report) => (
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
                        <div className="text-sm text-gray-600 space-x-4">
                          <span>Тип: {report.type}</span>
                          <span>Создан: {report.created}</span>
                          <span>Автор: {report.manager}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {report.status === 'ready' && (
                          <>
                            <Button size="sm" variant="outline">
                              Просмотр
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Download className="h-3 w-3" />
                              Скачать
                            </Button>
                          </>
                        )}
                        {report.status === 'processing' && (
                          <Badge variant="outline" className="text-yellow-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Обработка...
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

export default Reports;
