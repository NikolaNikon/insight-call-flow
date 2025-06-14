
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { User, Phone, Star } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { CallActions } from "@/components/CallActions";

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

interface SearchResultItemProps {
  call: Call;
}

const getScoreColor = (score: number) => {
  if (score >= 8.5) return 'text-green-600';
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

export const SearchResultItem = ({ call }: SearchResultItemProps) => {
  const keywords = extractKeywords(call.transcription + ' ' + call.summary);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{call.customer.name}</span>
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
              <span className="font-medium">{call.manager.name}</span>
            </div>
            <div>
              <span className="block">Дата и время:</span>
              <span className="font-medium">{formatDate(call.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span className={`font-medium ${getScoreColor(call.general_score)}`}>
                {call.general_score}/10
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500">Удовлетворенность:</span>
              <span className="font-medium text-green-600">{call.user_satisfaction_index * 10}%</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3">{call.summary}</p>

          {keywords.length > 0 && (
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-500">Ключевые слова:</span>
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <CallActions
          audioFileUrl={call.audio_file_url}
          callId={call.id}
          transcription={call.transcription}
          summary={call.summary}
        />
      </div>
    </div>
  );
};
