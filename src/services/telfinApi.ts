
interface TelfinConfig {
  hostname: string;
  username: string;
  password: string;
}

interface TelfinStorageUrlResponse {
  record_url: string;
}

export class TelfinAPI {
  private config: TelfinConfig;

  constructor(config: TelfinConfig) {
    this.config = config;
  }

  /**
   * Получение ссылки на запись в хранилище (не требует аутентификации)
   */
  async getStorageUrl(clientId: string, recordUuid: string): Promise<string> {
    const url = `https://${this.config.hostname}/client/${clientId}/record/${recordUuid}/storage_url/`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data: TelfinStorageUrlResponse = await response.json();
      return data.record_url;
    } catch (error) {
      console.error('Error fetching Telfin audio file URL:', error);
      throw error;
    }
  }

  /**
   * Прямое получение аудиофайла через HTTP Basic Authentication
   */
  async downloadAudioFile(clientId: string, recordUuid: string): Promise<Blob> {
    const url = `https://${this.config.hostname}/client/${clientId}/record/${recordUuid}/download/`;
    
    // Создание базовой аутентификации
    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      // Получение аудиофайла в виде Blob
      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('Error downloading Telfin audio file:', error);
      throw error;
    }
  }

  /**
   * Альтернативный метод получения через группу внутренних номеров
   */
  async downloadAudioFileByExtGroup(extGroupId: string, recordUuid: string): Promise<Blob> {
    const url = `https://${this.config.hostname}/extension_group/${extGroupId}/record/${recordUuid}/download/`;
    
    const credentials = btoa(`${this.config.username}:${this.config.password}`);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      return audioBlob;
    } catch (error) {
      console.error('Error downloading Telfin audio file by ext group:', error);
      throw error;
    }
  }
}

// Singleton instance для использования в приложении
let telfinInstance: TelfinAPI | null = null;

export const initTelfinAPI = (config: TelfinConfig) => {
  telfinInstance = new TelfinAPI(config);
};

export const getTelfinAPI = (): TelfinAPI => {
  if (!telfinInstance) {
    throw new Error('Telfin API not initialized. Call initTelfinAPI first.');
  }
  return telfinInstance;
};
