
import { Button } from "@/components/ui/button";
import { Play, FileText, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AudioPlayer } from "./AudioPlayer";
import { TranscriptionDialog } from "./TranscriptionDialog";
import { useState } from "react";

interface CallActionsProps {
  audioFileUrl?: string;
  callId?: string;
  transcription?: string;
  summary?: string;
}

export const CallActions = ({ audioFileUrl, callId, transcription, summary }: CallActionsProps) => {
  const { toast } = useToast();
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);

  const handleGenerateReport = () => {
    setShowTranscription(true);
  };

  const handleShowDetails = () => {
    toast({
      title: "Детали звонка",
      description: "Функция просмотра деталей будет доступна в следующих версиях",
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2 ml-4">
        {audioFileUrl && (
          <>
            <Button 
              size="sm" 
              variant="outline" 
              className="gap-2" 
              onClick={() => setShowPlayer(!showPlayer)}
            >
              <Play className="h-3 w-3" />
              Аудио
            </Button>
            
            {showPlayer && (
              <div className="mt-2 w-80">
                <AudioPlayer audioFileUrl={audioFileUrl} callId={callId} />
              </div>
            )}
          </>
        )}
        
        <Button size="sm" variant="outline" className="gap-2" onClick={handleGenerateReport}>
          <FileText className="h-3 w-3" />
          Отчет
        </Button>
        <Button size="sm" variant="outline" className="gap-2" onClick={handleShowDetails}>
          <MessageSquare className="h-3 w-3" />
          Детали
        </Button>
      </div>

      <TranscriptionDialog 
        isOpen={showTranscription}
        onClose={() => setShowTranscription(false)}
        transcription={transcription || ''}
        summary={summary || ''}
      />
    </>
  );
};
