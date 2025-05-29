
import { Button } from "@/components/ui/button";
import { Play, FileText, MessageSquare } from "lucide-react";

interface CallActionsProps {
  audioFileUrl?: string;
}

export const CallActions = ({ audioFileUrl }: CallActionsProps) => {
  return (
    <div className="flex flex-col gap-2 ml-4">
      {audioFileUrl && (
        <Button size="sm" variant="outline" className="gap-2">
          <Play className="h-3 w-3" />
          Аудио
        </Button>
      )}
      <Button size="sm" variant="outline" className="gap-2">
        <FileText className="h-3 w-3" />
        Отчет
      </Button>
      <Button size="sm" variant="outline" className="gap-2">
        <MessageSquare className="h-3 w-3" />
        Детали
      </Button>
    </div>
  );
};
