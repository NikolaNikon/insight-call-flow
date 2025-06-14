
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

interface TelfinUserInfo {
  admin: boolean;
  client_id: number;
  dealer_id: number | null;
  extension_group_id: number | null;
  extension_id: number | null;
  id: number;
  login: string;
}

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
    const url = `https://${API_HOST}/api/ver1.0/oauth/token`;
    
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
        const errorData = await response.json().catch(() => ({ error: 'Unknown error', error_description: 'Failed to parse error response' }));
        console.error('Telfin API Error:', response.status, errorData);
        throw new Error(`Ошибка API Телфин: ${errorData.error_description || errorData.error || `HTTP ${response.status}`}`);
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
      throw new Error('Не удалось получить действительный токен доступа.');
    }
  }

  /**
   * Получение информации об авторизованном пользователе
   */
  async getUserInfo(): Promise<TelfinUserInfo> {
    await this.ensureValidToken();
    
    const url = `https://${API_HOST}/api/ver1.0/user/`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting user info:', error);
      throw error;
    }
  }

  /**
   * Получение истории звонков
   */
  async getCallHistory(clientId: number, dateFrom: string, dateTo: string): Promise<any[]> {
    await this.ensureValidToken();
    
    const params = new URLSearchParams({
      date_from: dateFrom,
      date_to: dateTo,
      limit: '1000'
    });
    
    const url = `https://${API_HOST}/api/ver1.0/client/${clientId}/call_history/?${params.toString()}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.records || [];
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
    throw new Error('Telfin API not initialized. Call initTelfinAPI first.');
  }
  return apiInstance;
};
