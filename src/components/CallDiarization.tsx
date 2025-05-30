
import { Users, Clock } from "lucide-react";
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
    return null;
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
        return 'bg-blue-100 text-blue-800';
      case 'speaker_1':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="bg-white border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Диалог участников
          {duration && (
            <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
              <Clock className="h-3 w-3" />
              {formatTime(duration)}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {segments.map((segment, index) => (
            <div key={index} className="flex gap-3 p-3 rounded-lg bg-gray-50">
              <div className="flex flex-col items-center gap-1">
                <Badge 
                  variant="secondary" 
                  className={`text-xs px-2 py-1 ${getSpeakerColor(segment.speaker)}`}
                >
                  {getSpeakerLabel(segment.speaker)}
                </Badge>
                <span className="text-xs text-gray-500">
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
      </CardContent>
    </Card>
  );
};
