
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface CallProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  className?: string;
}

export const CallProcessingStatus = ({ status, className }: CallProcessingStatusProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Ожидает обработки',
          variant: 'secondary' as const,
          className: 'text-yellow-600 border-yellow-200'
        };
      case 'processing':
        return {
          icon: Loader2,
          label: 'Обрабатывается',
          variant: 'secondary' as const,
          className: 'text-blue-600 border-blue-200',
          animate: true
        };
      case 'completed':
        return {
          icon: CheckCircle,
          label: 'Завершено',
          variant: 'outline' as const,
          className: 'text-green-600 border-green-200'
        };
      case 'failed':
        return {
          icon: XCircle,
          label: 'Ошибка',
          variant: 'destructive' as const,
          className: 'text-red-600 border-red-200'
        };
      default:
        return {
          icon: Clock,
          label: 'Неизвестно',
          variant: 'secondary' as const,
          className: 'text-gray-600 border-gray-200'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`gap-2 ${config.className} ${className}`}>
      <Icon 
        className={`h-3 w-3 ${config.animate ? 'animate-spin' : ''}`} 
      />
      {config.label}
    </Badge>
  );
};
