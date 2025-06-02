
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getTelfinAPI } from '@/services/telfinApi';

export const useTelfinIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAudioUrl = useCallback(async (clientId: string, recordUuid: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const telfinAPI = getTelfinAPI();
      const audioUrl = await telfinAPI.getStorageUrl(clientId, recordUuid);
      
      toast({
        title: "Аудио получено",
        description: "Ссылка на аудиофайл успешно получена из Телфин",
      });
      
      return audioUrl;
    } catch (error) {
      console.error('Error getting Telfin audio URL:', error);
      toast({
        title: "Ошибка получения аудио",
        description: "Не удалось получить ссылку на аудиофайл из Телфин",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const downloadAudio = useCallback(async (clientId: string, recordUuid: string): Promise<Blob | null> => {
    setIsLoading(true);
    try {
      const telfinAPI = getTelfinAPI();
      const audioBlob = await telfinAPI.downloadAudioFile(clientId, recordUuid);
      
      toast({
        title: "Аудио загружено",
        description: "Аудиофайл успешно загружен из Телфин",
      });
      
      return audioBlob;
    } catch (error) {
      console.error('Error downloading Telfin audio:', error);
      toast({
        title: "Ошибка загрузки аудио",
        description: "Не удалось загрузить аудиофайл из Телфин",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    isLoading,
    getAudioUrl,
    downloadAudio
  };
};
