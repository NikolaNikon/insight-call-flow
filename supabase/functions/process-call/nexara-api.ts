
import type { NexaraTranscriptionResponse } from './types.ts';

export async function downloadAndTranscribeAudio(audioFileUrl: string): Promise<NexaraTranscriptionResponse> {
  const nexaraApiKey = Deno.env.get('NEXARA_API_KEY');
  
  if (!nexaraApiKey) {
    throw new Error('NEXARA_API_KEY не настроен');
  }

  try {
    console.log('Скачиваем аудиофайл:', audioFileUrl);
    
    // Скачиваем файл из Supabase Storage
    const audioResponse = await fetch(audioFileUrl);
    if (!audioResponse.ok) {
      throw new Error(`Не удалось скачать аудиофайл: ${audioResponse.status}`);
    }
    
    const audioBlob = await audioResponse.blob();
    console.log('Аудиофайл скачан, размер:', audioBlob.size, 'байт');

    // Создаем FormData для отправки файла
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('task', 'diarize');
    formData.append('diarization_setting', 'telephonic');
    formData.append('response_format', 'verbose_json');

    console.log('Отправляем файл в Nexara API...');

    // Отправляем файл на Nexara API
    const response = await fetch('https://api.nexara.ru/api/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${nexaraApiKey}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка Nexara API:', response.status, errorText);
      throw new Error(`Nexara API ошибка: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Результат транскрибации получен:', result);
    
    return result;
  } catch (error) {
    console.error('Ошибка при транскрибации:', error);
    throw error;
  }
}
