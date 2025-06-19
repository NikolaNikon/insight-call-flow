
import { supabase } from '@/integrations/supabase/client';

interface TelfinClientCredentialsConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string | null;
  tokenExpiry?: number | null;
}

interface TelfinTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

interface TelfinExtension {
  extension_id: string;
  number: string;
  name: string;
}

export interface TelfinClientInfo {
  client_id: string;
  name: string;
  timezone: string;
  extensions: TelfinExtension[];
}

const OAUTH_HOST = 'apiproxy.telphin.ru';
const API_HOST = 'apiproxy.telphin.ru';

export class TelfinClientCredentialsAPI {
  private config: TelfinClientCredentialsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: TelfinClientCredentialsConfig) {
    this.config = config;
    this.accessToken = config.accessToken || null;
    this.tokenExpiry = config.tokenExpiry || null;
  }

  /**
   * Получение токена доступа по client_credentials через Edge Function
   */
  async getAccessToken(): Promise<TelfinTokenResponse> {
    console.log('Requesting Telfin access token via Edge Function with client_id:', this.config.clientId);

    try {
      const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'get_access_token',
          clientId: this.config.clientId,
          clientSecret: this.config.clientSecret,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const tokenData: TelfinTokenResponse = data.data;
      
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      return tokenData;
    } catch (error: any) {
      console.error('Error getting access token:', error);
      const message = error.message || JSON.stringify(error);
      throw new Error(`[TELFIN-API-001] Ошибка API Телфин: ${message}`);
    }
  }

  /**
   * Проверка валидности токена и обновление при необходимости
   */
  private async ensureValidToken(): Promise<void> {
    // Проверяем токен с запасом в 1 минуту
    if (!this.accessToken || !this.tokenExpiry || Date.now() > (this.tokenExpiry - 60000)) {
      console.log('Токен недействителен или истекает, запрашиваем новый.');
      await this.getAccessToken();
    }
    if (!this.accessToken) {
      throw new Error('[TELFIN-API-002] Не удалось получить действительный токен доступа.');
    }
  }

  /**
   * Получение информации об авторизованном пользователе через Edge Function
   */
  async getUserInfo(): Promise<TelfinClientInfo> {
    await this.ensureValidToken();
    
    try {
       const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'get_user_info',
          accessToken: this.accessToken,
        },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      
      const responseData = data.data;
      if (Array.isArray(responseData) && responseData.length > 0) {
        return responseData[0];
      }
      if (!Array.isArray(responseData) && responseData.client_id) {
        return responseData;
      }
      
      throw new Error("[TELFIN-API-004] Информация о клиенте не найдена в ответе API.");

    } catch (error: any) {
      console.error('Error getting user info:', error);
      const message = error.message || JSON.stringify(error);
      if (message.includes('[TELFIN-API-004]')) {
          throw error;
      }
      throw new Error(`[TELFIN-API-003] HTTP error! Details: ${message}`);
    }
  }

  /**
   * Получение истории звонков через Edge Function
   */
  async getCallHistory(dateFrom: string, dateTo: string, clientInfo?: TelfinClientInfo): Promise<any[]> {
    await this.ensureValidToken();
    
    // Преобразуем client_id в строку и добавляем валидацию
    const telfinClientId = clientInfo?.client_id ? String(clientInfo.client_id).trim() : undefined;
    
    console.log('Getting call history:', {
      dateFrom,
      dateTo,
      clientId: telfinClientId,
      clientIdType: typeof telfinClientId,
      hasAccessToken: !!this.accessToken
    });
    
    if (!telfinClientId) {
      throw new Error('[TELFIN-API-005] Client ID отсутствует или неверен в данных пользователя');
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'get_call_history',
          accessToken: this.accessToken,
          dateFrom,
          dateTo,
          telfinClientId, // Передаем уже проверенный и преобразованный в строку client_id
        },
      });

      if (error) {
        console.error('Supabase function invoke error:', error);
        throw error;
      }
      
      if (!data.success) {
        console.error('Function returned error:', data.error);
        // Передаем диагностическую информацию если есть
        if (data.diagnostics) {
          console.error('Diagnostics:', data.diagnostics);
          // Формируем более детальное сообщение об ошибке
          let detailedError = data.error;
          if (data.errorCategory) {
            detailedError += ` (Категория: ${data.errorCategory})`;
          }
          if (data.diagnostics.recommendedAction) {
            detailedError += ` Рекомендация: ${data.diagnostics.recommendedAction}`;
          }
          throw new Error(detailedError);
        }
        throw new Error(data.error);
      }

      const responseData = data.data;
      console.log('Call history response received:', {
        hasData: !!responseData,
        dataType: Array.isArray(responseData) ? 'array' : typeof responseData,
        recordsCount: data.recordsCount || 'unknown'
      });
      
      // Поддерживаем разные структуры ответа
      if (responseData.results && Array.isArray(responseData.results)) {
        return responseData.results;
      }
      if (responseData.data && Array.isArray(responseData.data)) {
        return responseData.data;
      }
      return responseData.records || responseData || [];
    } catch (error: any) {
      console.error('Error getting call history:', error);
      const message = error.message || JSON.stringify(error);
      
      // Сохраняем коды ошибок для правильной диагностики
      if (message.includes('[TELFIN-API-005]')) {
        throw error;
      }
      
      throw new Error(`[TELFIN-API-005] HTTP error! Details: ${message}`);
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  hasValidToken(): boolean {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }

  getTokens() {
    return {
      accessToken: this.accessToken,
      tokenExpiry: this.tokenExpiry,
    };
  }
}

let apiInstance: TelfinClientCredentialsAPI | null = null;

export const initTelfinAPI = (config: TelfinClientCredentialsConfig): TelfinClientCredentialsAPI => {
  apiInstance = new TelfinClientCredentialsAPI(config);
  return apiInstance;
};

export const getTelfinAPI = (): TelfinClientCredentialsAPI => {
  if (!apiInstance) {
    throw new Error('[TELFIN-API-006] Telfin API not initialized. Call initTelfinAPI first.');
  }
  return apiInstance;
};
