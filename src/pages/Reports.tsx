import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Calendar as CalendarIcon,
  Users,
  BarChart3,
  Clock,
  Star,
  TrendingUp,
  Play,
  Filter,
  Search,
  RefreshCw,
  Eye,
  Share
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const Reports = () => {
  const [reportType, setReportType] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("created");

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
      { id: "CALL-001", customer: "Иван Иванов", manager: "Иванов И.", duration: "5:20", url: "#" },
      { id: "CALL-002", customer: "Мария Петрова", manager: "Петров П.", duration: "8:15", url: "#" },
      { id: "CALL-003", customer: "Алексей Сидоров", manager: "Сидоров С.", duration: "6:45", url: "#" }
    ]
  };

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
    },
    {
      id: "RPT-004",
      name: "Анализ удовлетворенности клиентов",
      type: "Аналитический",
      created: "2024-01-18",
      manager: "Аналитик",
      status: "ready",
      description: "Глубокий анализ отзывов клиентов"
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

  const handleGenerateReport = () => {
    console.log("Generating report with:", { reportType, selectedPeriod, dateFrom, dateTo });
    // TODO: Implement report generation logic
  };

  const handleExportPDF = () => {
    console.log("Exporting to PDF");
    // TODO: Implement PDF export
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Отчеты</h1>
              <p className="text-gray-600">Создание и управление отчетами по работе менеджеров</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Обновить
              </Button>
              <Button size="sm" className="gap-2">
                <FileText className="h-4 w-4" />
                Быстрый отчет
              </Button>
            </div>
          </div>
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
                        <SelectItem value="satisfaction">Анализ удовлетворенности</SelectItem>
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
                        <SelectItem value="quarter">Квартал</SelectItem>
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
                  <Button onClick={handleGenerateReport} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Создать отчет
                  </Button>
                  <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                    <Download className="h-4 w-4" />
                    Экспорт в PDF
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Share className="h-4 w-4" />
                    Поделиться
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
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Eye className="h-4 w-4" />
                      Просмотр
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Скачать PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* General Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-600 rounded-lg">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-blue-900">Общие показатели</span>
                    </div>
                    <p className="text-3xl font-bold text-blue-900 mb-1">{weeklyReport.totalCalls}</p>
                    <p className="text-sm text-blue-600">Количество звонков</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-green-600 rounded-lg">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-green-900">Среднее время</span>
                    </div>
                    <p className="text-3xl font-bold text-green-900 mb-1">{weeklyReport.avgDuration} мин</p>
                    <p className="text-sm text-green-600">Обработки звонка</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-orange-600 rounded-lg">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-orange-900">Удовлетворенность</span>
                    </div>
                    <p className="text-3xl font-bold text-orange-900 mb-1">{weeklyReport.satisfaction}%</p>
                    <p className="text-sm text-orange-600">Клиентов</p>
                  </div>
                </div>

                {/* Manager Performance Table */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Производительность менеджеров</h3>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="font-semibold text-gray-900">Менеджер</TableHead>
                          <TableHead className="text-center font-semibold text-gray-900">Кол-во звонков</TableHead>
                          <TableHead className="text-center font-semibold text-gray-900">Ср. время</TableHead>
                          <TableHead className="text-center font-semibold text-gray-900">Удовлетворенность</TableHead>
                          <TableHead className="text-center font-semibold text-gray-900">Транскрипция</TableHead>
                          <TableHead className="text-center font-semibold text-gray-900">Коммуникация</TableHead>
                          <TableHead className="text-center font-semibold text-gray-900">Продажи</TableHead>
                          <TableHead className="text-center font-semibold text-gray-900">Общая оценка</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {weeklyReport.managers.map((manager, index) => (
                          <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                            <TableCell className="font-medium text-gray-900">{manager.name}</TableCell>
                            <TableCell className="text-center">{manager.calls}</TableCell>
                            <TableCell className="text-center">{manager.avgDuration} мин</TableCell>
                            <TableCell className="text-center">{manager.satisfaction}%</TableCell>
                            <TableCell className="text-center">
                              <span className={getScoreColor(manager.transcription)}>
                                {manager.transcription}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={getScoreColor(manager.communication)}>
                                {manager.communication}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={getScoreColor(manager.sales)}>
                                {manager.sales}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge 
                                variant="outline" 
                                className={`${getScoreColor(manager.general)} border-current`}
                              >
                                {manager.general}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Top Issues */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Популярные проблемы клиентов</h3>
                  <div className="space-y-3">
                    {weeklyReport.topIssues.map((issue, index) => (
                      <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm font-semibold">
                          #{index + 1}
                        </div>
                        <span className="text-sm text-gray-900 flex-1">{issue}</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.floor(Math.random() * 10) + 5} случаев
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Audio Records */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Аудиозаписи разговоров</h3>
                  <div className="space-y-3">
                    {weeklyReport.audioLinks.map((audio, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium text-gray-900">{audio.customer}</span>
                            <Badge variant="outline" className="text-xs">{audio.id}</Badge>
                          </div>
                          <div className="text-sm text-gray-500 space-x-3">
                            <span>Менеджер: {audio.manager}</span>
                            <span>Длительность: {audio.duration}</span>
                          </div>
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Сохраненные отчеты</CardTitle>
                    <CardDescription>
                      История созданных отчетов и их статус
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Фильтры
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Экспорт всех
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Сортировка" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created">По дате создания</SelectItem>
                      <SelectItem value="name">По названию</SelectItem>
                      <SelectItem value="type">По типу</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reports List */}
                <div className="space-y-4">
                  {filteredReports.map((report) => (
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
                            <Button size="sm" variant="outline" className="gap-2">
                              <Share className="h-3 w-3" />
                              Поделиться
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
                  ))}
                </div>

                {filteredReports.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Отчеты не найдены</h3>
                    <p className="text-gray-600">Попробуйте изменить параметры поиска или создайте новый отчет</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
