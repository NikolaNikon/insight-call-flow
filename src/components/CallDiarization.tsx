
import { Users, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DiarizationSegment {
  speaker: string;
  start: number;
  end: number;
  text: string;
}

interface CallDiarizationProps {
  segments?: DiarizationSegment[];
  duration?: number;
}

export const CallDiarization = ({ segments, duration }: CallDiarizationProps) => {
  if (!segments || segments.length === 0) {
    return (
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="text-center text-gray-500 text-sm">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            Диалог участников недоступен
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerLabel = (speaker: string) => {
    switch (speaker) {
      case 'speaker_0':
        return 'Менеджер';
      case 'speaker_1':
        return 'Клиент';
      default:
        return `Спикер ${speaker.replace('speaker_', '')}`;
    }
  };

  const getSpeakerColor = (speaker: string) => {
    switch (speaker) {
      case 'speaker_0':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'speaker_1':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSpeakerStats = () => {
    const speakerStats: Record<string, { segments: number; totalTime: number }> = {};
    
    segments.forEach(segment => {
      if (!speakerStats[segment.speaker]) {
        speakerStats[segment.speaker] = { segments: 0, totalTime: 0 };
      }
      speakerStats[segment.speaker].segments++;
      speakerStats[segment.speaker].totalTime += segment.end - segment.start;
    });
    
    return speakerStats;
  };

  const speakerStats = getSpeakerStats();

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-blue-600" />
          Диалог участников
          {duration && (
            <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
              <Clock className="h-3 w-3" />
              {formatTime(duration)}
            </div>
          )}
        </CardTitle>
        
        {/* Статистика по говорящим */}
        <div className="flex gap-2 mt-2">
          {Object.entries(speakerStats).map(([speaker, stats]) => (
            <div key={speaker} className="text-xs text-gray-600">
              <Badge variant="outline" className={getSpeakerColor(speaker)}>
                {getSpeakerLabel(speaker)}: {formatTime(stats.totalTime)}
              </Badge>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {segments.map((segment, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center gap-1 min-w-[100px]">
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-1 border ${getSpeakerColor(segment.speaker)}`}
                >
                  {getSpeakerLabel(segment.speaker)}
                </Badge>
                <span className="text-xs text-gray-500 font-mono">
                  {formatTime(segment.start)} - {formatTime(segment.end)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800 leading-relaxed">
                  {segment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
          Всего сегментов: {segments.length} • 
          Участников: {Object.keys(speakerStats).length}
        </div>
      </CardContent>
    </Card>
  );
};
