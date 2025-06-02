
import { User, Clock, Star, Users } from "lucide-react";
import { CallProcessingStatus } from "./CallProcessingStatus";
import { CallMetrics } from "./CallMetrics";
import { CallActions } from "./CallActions";
import { CallDiarization } from "./CallDiarization";
import { getScoreColor, formatDate, calculateDuration } from "@/utils/callUtils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DiarizationSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

interface RecentCall {
  id: string;
  customer: {
    name: string;
    phone_number: string;
  };
  manager: {
    name: string;
  };
  date: string;
  summary: string;
  transcription?: string;
  general_score: number;
  user_satisfaction_index: number;
  communication_skills: number;
  sales_technique: number;
  transcription_score: number;
  audio_file_url?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  task_id?: string;
}

interface RecentCallItemProps {
  call: RecentCall;
}

export const RecentCallItem = ({ call }: RecentCallItemProps) => {
  const [showDiarization, setShowDiarization] = useState(false);

  // Парсим диаризацию из task_id если она есть
  let diarizationData = null;
  let hasDiarization = false;
  
  if (call.task_id) {
    try {
      diarizationData = JSON.parse(call.task_id);
      hasDiarization = diarizationData?.segments && diarizationData.segments.length > 0;
    } catch (e) {
      console.warn('Не удалось распарсить данные диаризации:', e);
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-900">{call.customer.name}</span>
            </div>
            <CallProcessingStatus status={call.processing_status} />
            {hasDiarization && (
              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                <Users className="h-3 w-3 mr-1" />
                Диаризация
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
            <div>
              <span className="block">Телефон:</span>
              <span className="font-medium">{call.customer.phone_number}</span>
            </div>
            <div>
              <span className="block">Менеджер:</span>
              <span className="font-medium">{call.manager.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{calculateDuration(call.date)} • {formatDate(call.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span className={`font-medium ${getScoreColor(call.general_score)}`}>
                {call.general_score}/10
              </span>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {call.summary}
          </p>

          <CallMetrics
            userSatisfactionIndex={call.user_satisfaction_index}
            transcriptionScore={call.transcription_score}
            communicationSkills={call.communication_skills}
            salesTechnique={call.sales_technique}
          />

          {hasDiarization && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDiarization(!showDiarization)}
                className="text-xs"
              >
                <Users className="h-3 w-3 mr-1" />
                {showDiarization ? 'Скрыть диалог' : 'Показать диалог'}
              </Button>
              
              {showDiarization && (
                <div className="mt-3">
                  <CallDiarization 
                    segments={diarizationData.segments}
                    duration={diarizationData.duration}
                  />
                </div>
              )}
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
