
import { User, Clock, Star } from "lucide-react";
import { CallProcessingStatus } from "./CallProcessingStatus";
import { CallMetrics } from "./CallMetrics";
import { CallActions } from "./CallActions";
import { getScoreColor, formatDate, calculateDuration } from "@/utils/callUtils";

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
  general_score: number;
  user_satisfaction_index: number;
  communication_skills: number;
  sales_technique: number;
  transcription_score: number;
  audio_file_url?: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface RecentCallItemProps {
  call: RecentCall;
}

export const RecentCallItem = ({ call }: RecentCallItemProps) => {
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
        </div>

        <CallActions audioFileUrl={call.audio_file_url} />
      </div>
    </div>
  );
};
