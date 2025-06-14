import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SearchFilters, SearchResults } from "@/components/search";

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

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

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

  // Загрузка звонков с фильтрацией
  const { data: calls = [], isLoading, refetch } = useQuery({
    queryKey: ['calls', searchTerm, selectedManager, dateFrom, dateTo],
    queryFn: async () => {
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
        `)
        .order('date', { ascending: false });

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

      const { data, error } = await query;
      
      if (error) throw error;

      // Фильтрация по ключевым словам в транскрипции и описании
      let filteredData = data || [];
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(call => 
          call.transcription?.toLowerCase().includes(searchLower) ||
          call.summary?.toLowerCase().includes(searchLower)
        );
      }

      return filteredData.map(call => ({
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
    }
  });

  const handleSearch = () => {
    refetch();
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedManager("all");
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedManager={selectedManager}
        setSelectedManager={setSelectedManager}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        managers={managers}
        onSearch={handleSearch}
        onReset={handleResetFilters}
      />

      <SearchResults
        calls={calls}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Search;
