
import { Button } from "@/components/ui/button";
import { Play, FileText, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CallActionsProps {
  audioFileUrl?: string;
  callId?: string;
}

export const CallActions = ({ audioFileUrl, callId }: CallActionsProps) => {
  const { toast } = useToast();

  const handlePlayAudio = () => {
    if (audioFileUrl) {
      // Создаем элемент audio для воспроизведения
      const audio = new Audio(audioFileUrl);
      audio.play().catch(() => {
        toast({
          title: "Ошибка воспроизведения",
          description: "Не удалось воспроизвести аудиофайл",
          variant: "destructive",
        });
      });
      
      toast({
        title: "Воспроизведение аудио",
        description: "Аудиозапись начала воспроизводиться",
      });
    } else {
      toast({
        title: "Аудио недоступно",
        description: "Аудиофайл для данного звонка не найден",
        variant: "destructive",
      });
    }
  };

  const handleGenerateReport = () => {
    toast({
      title: "Генерация отчета",
      description: "Функция создания отчета будет доступна в следующих версиях",
    });
  };

  const handleShowDetails = () => {
    toast({
      title: "Детали звонка",
      description: "Функция просмотра деталей будет доступна в следующих версиях",
    });
  };

  return (
    <div className="flex flex-col gap-2 ml-4">
      {audioFileUrl && (
        <Button size="sm" variant="outline" className="gap-2" onClick={handlePlayAudio}>
          <Play className="h-3 w-3" />
          Аудио
        </Button>
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
  );
};
