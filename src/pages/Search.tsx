
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Search as SearchIcon, 
  Filter, 
  Calendar as CalendarIcon,
  User,
  Phone,
  Clock,
  Star,
  Play,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  const searchResults = [
    {
      id: "CALL-001",
      customer: "Иван Иванов",
      phone: "+7 999 123-45-67",
      manager: "Петров П.",
      date: "2024-01-15",
      time: "14:30",
      duration: "6:32",
      general: 8.3,
      satisfaction: 92,
      summary: "Клиент интересовался бронированием бани на выходные для компании из 8 человек...",
      keywords: ["бронирование", "выходные", "компания"]
    },
    {
      id: "CALL-002",
      customer: "Мария Петрова", 
      phone: "+7 999 234-56-78",
      manager: "Иванов И.",
      date: "2024-01-15",
      time: "15:45",
      duration: "4:18",
      general: 8.1,
      satisfaction: 88,
      summary: "Звонок по поводу забытых вещей в раздевалке. Клиент оставил шорты...",
      keywords: ["забытые вещи", "раздевалка", "шорты"]
    },
    {
      id: "CALL-003",
      customer: "Алексей Сидоров",
      phone: "+7 999 345-67-89", 
      manager: "Сидоров С.",
      date: "2024-01-14",
      time: "16:20",
      duration: "8:45",
      general: 9.1,
      satisfaction: 95,
      summary: "Консультация по услугам VIP-зоны и дополнительным опциям. Обсуждение массажа...",
      keywords: ["VIP-зона", "массаж", "дополнительные услуги"]
    }
  ];

  const managers = ["Все менеджеры", "Иванов И.", "Петров П.", "Сидоров С."];

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green-600';
    if (score >= 7.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Поиск звонков</h1>
          <p className="text-gray-600">Поиск и фильтрация записей звонков по различным параметрам</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SearchIcon className="h-5 w-5" />
              Параметры поиска
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Поиск по ключевым словам
                </label>
                <Input
                  placeholder="Введите ключевые слова..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Менеджер
                </label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите менеджера" />
                  </SelectTrigger>
                  <SelectContent>
                    {managers.map((manager) => (
                      <SelectItem key={manager} value={manager}>
                        {manager}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Дата с
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
                  Дата до
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

            <div className="flex gap-3">
              <Button className="gap-2">
                <SearchIcon className="h-4 w-4" />
                Найти
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Сбросить фильтры
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Результаты поиска</CardTitle>
              <Badge variant="outline">
                Найдено: {searchResults.length} звонков
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((call) => (
                <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{call.customer}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span className="text-sm">{call.phone}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          ID: {call.id}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="block">Менеджер:</span>
                          <span className="font-medium">{call.manager}</span>
                        </div>
                        <div>
                          <span className="block">Дата и время:</span>
                          <span className="font-medium">{call.date} {call.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{call.duration}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span className={`font-medium ${getScoreColor(call.general)}`}>
                            {call.general}/10
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">{call.summary}</p>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Ключевые слова:</span>
                        {call.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-500">Удовлетворенность:</span>
                          <span className="font-medium text-green-600">{call.satisfaction}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Play className="h-3 w-3" />
                        Аудио
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <FileText className="h-3 w-3" />
                        Отчет
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Search;
