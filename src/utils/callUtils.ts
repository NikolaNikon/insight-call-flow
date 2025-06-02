
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

const MOSCOW_TIMEZONE = 'Europe/Moscow';

export const getScoreColor = (score: number) => {
  if (score >= 8.5) return 'text-green-600';
  if (score >= 7.0) return 'text-yellow-600';
  return 'text-red-600';
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const moscowTime = toZonedTime(date, MOSCOW_TIMEZONE);
  const now = new Date();
  const moscowNow = toZonedTime(now, MOSCOW_TIMEZONE);
  
  const diffHours = Math.floor((moscowNow.getTime() - moscowTime.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) return 'Меньше часа назад';
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'час' : diffHours < 5 ? 'часа' : 'часов'} назад`;
  
  return format(moscowTime, "dd.MM.yyyy HH:mm", { locale: ru });
};

export const formatMoscowTime = (dateString: string) => {
  const date = new Date(dateString);
  const moscowTime = toZonedTime(date, MOSCOW_TIMEZONE);
  return format(moscowTime, "dd.MM.yyyy HH:mm", { locale: ru });
};

export const calculateDuration = (date: string) => {
  // Заглушка для длительности звонка (в реальном проекте это должно быть в БД)
  return `${Math.floor(Math.random() * 10) + 3}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
};

export const normalizeProcessingStatus = (status: string | null): 'pending' | 'processing' | 'completed' | 'failed' => {
  if (!status) return 'pending';
  const normalizedStatus = status.toLowerCase();
  if (['pending', 'processing', 'completed', 'failed'].includes(normalizedStatus)) {
    return normalizedStatus as 'pending' | 'processing' | 'completed' | 'failed';
  }
  return 'pending';
};
