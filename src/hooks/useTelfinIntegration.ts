
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getTelfinAPI } from '@/services/telfinApi';
import { getTelfinOAuthAPI } from '@/services/telfinOAuthApi';

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
      // Сначала пробуем OAuth API
      try {
        const oauthAPI = getTelfinOAuthAPI();
        if (oauthAPI.hasValidToken()) {
          const audioBlob = await oauthAPI.getAudioFileWithOAuth(clientId, recordUuid);
          
          toast({
            title: "Аудио загружено (OAuth)",
            description: "Аудиофайл успешно загружен через OAuth из Телфин",
          });
          
          return audioBlob;
        }
      } catch (oauthError) {
        console.log('OAuth API not available, falling back to Basic Auth');
      }
      
      // Fallback на Basic Auth
      const telfinAPI = getTelfinAPI();
      const audioBlob = await telfinAPI.downloadAudioFile(clientId, recordUuid);
      
      toast({
        title: "Аудио загружено (Basic Auth)",
        description: "Аудиофайл успешно загружен через Basic Auth из Телфин",
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
