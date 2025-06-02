
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getTelfinOAuthAPI } from '@/services/telfinOAuthApi';

export const useTelfinIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getAudioUrl = useCallback(async (clientId: string, recordUuid: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const hostname = localStorage.getItem('telfin_hostname');
      
      if (!hostname) {
        throw new Error('Телфин hostname не настроен');
      }

      const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'get_audio_url',
          clientId,
          recordUuid,
          hostname
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка');
      }
      
      toast({
        title: "Аудио получено",
        description: "Ссылка на аудиофайл успешно получена из Телфин",
      });
      
      return data.audioUrl;
    } catch (error) {
      console.error('Error getting Telfin audio URL:', error);
      toast({
        title: "Ошибка получения аудио",
        description: error instanceof Error ? error.message : "Не удалось получить ссылку на аудиофайл из Телфин",
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
          const hostname = localStorage.getItem('telfin_oauth_hostname');
          if (!hostname) {
            throw new Error('OAuth hostname не настроен');
          }

          // Получаем access token (это может обновить токен если нужно)
          await oauthAPI.getUserInfo();
          const accessToken = (oauthAPI as any).accessToken;

          const { data, error } = await supabase.functions.invoke('telfin-integration', {
            body: {
              action: 'download_audio_with_oauth',
              clientId,
              recordUuid,
              hostname,
              accessToken
            }
          });

          if (error) {
            throw new Error(error.message);
          }

          if (!data.success) {
            throw new Error(data.error || 'Неизвестная ошибка OAuth загрузки');
          }

          // Декодируем base64 в Blob
          const binaryString = atob(data.audioData);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const audioBlob = new Blob([bytes], { type: data.contentType });
          
          toast({
            title: "Аудио загружено (OAuth)",
            description: "Аудиофайл успешно загружен через OAuth из Телфин",
          });
          
          return audioBlob;
        }
      } catch (oauthError) {
        console.log('OAuth API не доступен, используем Basic Auth:', oauthError);
      }
      
      // Fallback на Basic Auth
      const hostname = localStorage.getItem('telfin_hostname');
      const username = localStorage.getItem('telfin_username');
      const password = localStorage.getItem('telfin_password');

      if (!hostname || !username || !password) {
        throw new Error('Настройки Basic Auth не найдены');
      }

      const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'download_audio',
          clientId,
          recordUuid,
          hostname,
          username,
          password
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Неизвестная ошибка Basic Auth загрузки');
      }

      // Декодируем base64 в Blob
      const binaryString = atob(data.audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: data.contentType });
      
      toast({
        title: "Аудио загружено (Basic Auth)",
        description: "Аудиофайл успешно загружен через Basic Auth из Телфин",
      });
      
      return audioBlob;
    } catch (error) {
      console.error('Error downloading Telfin audio:', error);
      toast({
        title: "Ошибка загрузки аудио",
        description: error instanceof Error ? error.message : "Не удалось загрузить аудиофайл из Телфин",
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
