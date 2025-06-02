import { useState, useEffect } from "react";
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
  Star,
  Play,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Call {
  id: string;
  date: string;
  transcription: string;
  summary: string;
  general_score: number;
  user_satisfaction_index: number;
  audio_file_url: string;
  customer: {
    name: string;
    phone_number: string;
  };
  manager: {
    name: string;
  };
}

interface Manager {
  id: string;
  name: string;
}

const Calls = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Загрузка менеджеров для фильтра
  const { data: managers = [] } = useQuery({
    queryKey: ['managers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('managers')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data as Manager[];
    }
  });

  // Загрузка звонков с пагинацией
  const { data: callsData, isLoading, refetch } = useQuery({
    queryKey: ['calls', searchTerm, selectedManager, dateFrom, dateTo, currentPage, pageSize],
    queryFn: async () => {
      const start = (currentPage - 1) * pageSize;
      const end = start + pageSize - 1;

      let query = supabase
        .from('calls')
        .select(`
          id,
          date,
          transcription,
          summary,
          general_score,
          user_satisfaction_index,
          audio_file_url,
          customers:customer_id (
            name,
            phone_number
          ),
          managers:manager_id (
            name
          )
        `, { count: 'exact' })
        .order('date', { ascending: false })
        .range(start, end);

      // Применяем фильтры
      if (selectedManager && selectedManager !== "all") {
        query = query.eq('manager_id', selectedManager);
      }

      if (dateFrom) {
        query = query.gte('date', dateFrom.toISOString());
      }

      if (dateTo) {
        query = query.lte('date', dateTo.toISOString());
      }

      const { data, error, count } = await query;
      
      if (error) throw error;

      // Фильтрация по ключевым словам
      let filteredData = data || [];
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(call => 
          call.transcription?.toLowerCase().includes(searchLower) ||
          call.summary?.toLowerCase().includes(searchLower)
        );
      }

      const calls = filteredData.map(call => ({
        id: call.id,
        date: call.date,
        transcription: call.transcription || '',
        summary: call.summary || 'Краткое описание недоступно',
        general_score: call.general_score || 0,
        user_satisfaction_index: call.user_satisfaction_index || 0,
        audio_file_url: call.audio_file_url,
        customer: {
          name: call.customers?.name || 'Неизвестный клиент',
          phone_number: call.customers?.phone_number || ''
        },
        manager: {
          name: call.managers?.name || 'Неизвестный менеджер'
        }
      })) as Call[];

      return {
        calls,
        totalCount: count || 0
      };
    }
  });

  const totalPages = Math.ceil((callsData?.totalCount || 0) / pageSize);

  const handleSearch = () => {
    setCurrentPage(1);
    refetch();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedManager("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setCurrentPage(1);
  };

  const getScoreColor = (score: number) => {
    if (score >= 8.5) return 'text-green';
    if (score >= 7.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd.MM.yyyy HH:mm", { locale: ru });
  };

  const extractKeywords = (text: string) => {
    if (!text) return [];
    
    const commonWords = ['баня', 'бронирование', 'услуги', 'время', 'цена', 'массаж', 'vip'];
    const words = text.toLowerCase().split(/\s+/);
    return commonWords.filter(keyword => 
      words.some(word => word.includes(keyword))
    ).slice(0, 3);
  };

  const handlePlayAudio = (audioUrl: string) => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch(() => {
        console.error('Ошибка воспроизведения аудио');
      });
    }
  };

  const handleGenerateReport = (callId: string) => {
    console.log('Генерация отчета для звонка:', callId);
    // Здесь будет логика генерации отчета
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h1 className="text-3xl font-bold text-graphite mb-2">Звонки</h1>
          <p className="text-gray-600">Поиск и фильтрация записей звонков по различным параметрам</p>
        </div>

        {/* Search and Filters */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-graphite">
              <SearchIcon className="h-5 w-5" />
              Параметры поиска
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-semibold text-graphite mb-2 block">
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
                <label className="text-sm font-semibold text-graphite mb-2 block">
                  Менеджер
                </label>
                <Select value={selectedManager} onValueChange={setSelectedManager}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите менеджера" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все менеджеры</SelectItem>
                    {managers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold text-graphite mb-2 block">
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
                <label className="text-sm font-semibold text-graphite mb-2 block">
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
              <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={handleSearch}>
                <SearchIcon className="h-4 w-4" />
                Найти
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleResetFilters}>
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
              <CardTitle className="text-graphite">Результаты поиска</CardTitle>
              <div className="flex items-center gap-4">
                <Badge variant="outline">
                  Найдено: {callsData?.totalCount || 0} звонков
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Показать:</span>
                  <Select value={pageSize.toString()} onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Загрузка звонков...</span>
              </div>
            ) : !callsData?.calls.length ? (
              <div className="text-center py-8 text-gray-500">
                Звонки не найдены. Попробуйте изменить параметры поиска.
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {callsData.calls.map((call) => (
                    <div key={call.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-gray-500" />
                              <span className="font-semibold text-graphite">{call.customer.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span className="text-sm">{call.customer.phone_number}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              ID: {call.id.slice(0, 8)}...
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="block">Менеджер:</span>
                              <span className="font-semibold">{call.manager.name}</span>
                            </div>
                            <div>
                              <span className="block">Дата и время:</span>
                              <span className="font-semibold">{formatDate(call.date)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span className={`font-semibold ${getScoreColor(call.general_score)}`}>
                                {call.general_score}/10
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-500">Удовлетворенность:</span>
                              <span className="font-semibold text-green">{call.user_satisfaction_index * 10}%</span>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mb-3">{call.summary}</p>

                          {extractKeywords(call.transcription + ' ' + call.summary).length > 0 && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-xs text-gray-500">Ключевые слова:</span>
                              {extractKeywords(call.transcription + ' ' + call.summary).map((keyword, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {call.audio_file_url && (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2"
                              onClick={() => handlePlayAudio(call.audio_file_url)}
                            >
                              <Play className="h-3 w-3" />
                              Аудио
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="gap-2"
                            onClick={() => handleGenerateReport(call.id)}
                          >
                            <FileText className="h-3 w-3" />
                            Отчет
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious 
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}
                        
                        <PaginationItem>
                          <PaginationNext 
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calls;
