
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Filter, 
  RefreshCw, 
  Search, 
  FileText, 
  Eye, 
  Download, 
  Clock,
  Plus
} from "lucide-react";
import { useState } from "react";

export const ReportHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

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

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">История отчетов</h3>
            <p className="text-sm text-gray-600">
              Созданные отчеты и их статус
            </p>
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
        
        <div className="space-y-4">
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
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  У вас пока нет отчётов
                </h4>
                <p className="text-gray-600 mb-4">
                  Создайте первый отчёт, выбрав период и формат
                </p>
                <Button variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Создать первый отчёт
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
