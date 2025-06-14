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
   * Получение токена доступа по client_credentials
   */
  async getAccessToken(): Promise<TelfinTokenResponse> {
    const url = `https://${OAUTH_HOST}/oauth/token`;
    
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
    });

    console.log('Requesting Telfin access token with client_id:', this.config.clientId);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Telfin API Error Response Text:', errorText);
        try {
            const errorData = JSON.parse(errorText);
            console.error('Telfin API Error:', response.status, errorData);
            throw new Error(`[TELFIN-API-001] Ошибка API Телфин: ${errorData.error_description || errorData.error || `HTTP ${response.status}`}`);
        } catch (e) {
            // The response was not JSON, throw error with the text content, truncated
            throw new Error(`[TELFIN-API-001] Ошибка API Телфин: ${errorText.substring(0, 300) || `HTTP ${response.status}`}`);
        }
      }

      const tokenData: TelfinTokenResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      return tokenData;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
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
   * Получение информации об авторизованном пользователе
   */
  async getUserInfo(): Promise<TelfinClientInfo> {
    await this.ensureValidToken();
    
    const url = `https://${API_HOST}/api/ver1.0/client/`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`[TELFIN-API-003] HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      // API может вернуть массив с одним объектом клиента
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
      // Или один объект клиента
      if (!Array.isArray(data) && data.client_id) {
        return data;
      }
      
      throw new Error("[TELFIN-API-004] Информация о клиенте не найдена в ответе API.");

    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Получение истории звонков
   */
  async getCallHistory(dateFrom: string, dateTo: string): Promise<any[]> {
    await this.ensureValidToken();
    
    const params = new URLSearchParams({
      date_start: dateFrom,
      date_end: dateTo,
      limit: '1000'
    });
    
    const url = `https://${API_HOST}/api/ver1.0/client/cdr/?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`[TELFIN-API-005] HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      // API может вернуть объект с полем records или просто массив
      return data.records || data || [];
    } catch (error) {
      console.error('Error getting call history:', error);
      throw error;
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
