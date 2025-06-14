
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { SearchResultItem } from './SearchResultItem';

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

interface SearchResultsProps {
  calls: Call[];
  isLoading: boolean;
}

export const SearchResults = ({ calls, isLoading }: SearchResultsProps) => {
  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Результаты поиска</CardTitle>
          <Badge variant="outline">
            Найдено: {calls.length} звонков
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Загрузка звонков...</span>
          </div>
        ) : calls.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Звонки не найдены. Попробуйте изменить параметры поиска.
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call) => (
              <SearchResultItem key={call.id} call={call} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
