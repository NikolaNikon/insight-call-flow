interface TelfinOAuthConfig {
  hostname: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  tokenExpiry?: number | null;
}

interface TelfinTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
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

export class TelfinOAuthAPI {
  private config: TelfinOAuthConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;
  private refreshToken: string | null = null;

  constructor(config: TelfinOAuthConfig) {
    this.config = config;
    this.accessToken = config.accessToken || null;
    this.refreshToken = config.refreshToken || null;
    this.tokenExpiry = config.tokenExpiry || null;
  }

  /**
   * Шаг 1: Генерация URL для авторизации пользователя
   */
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: 'all'
    });

    return `https://${this.config.hostname}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Шаг 2: Обмен кода авторизации на токен доступа
   */
  async exchangeCodeForToken(code: string): Promise<TelfinTokenResponse> {
    const url = `https://${this.config.hostname}/oauth/token`;
    
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const tokenData: TelfinTokenResponse = await response.json();
      
      // Сохраняем токен
      this.accessToken = tokenData.access_token;
      this.refreshToken = tokenData.refresh_token || null;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      return tokenData;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      throw error;
    }
  }

  /**
   * Шаг 3: Создание доверенного приложения
   */
  async createTrustedApplication(name: string): Promise<any> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const url = `https://${this.config.hostname}/api/ver1.0/application/`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken}`
        },
        body: JSON.stringify({
          name: name,
          type: 'trusted'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating trusted application:', error);
      throw error;
    }
  }

  /**
   * Шаг 4: Получение токена для доверенного приложения
   */
  async getTrustedAppToken(): Promise<TelfinTokenResponse> {
    const url = `https://${this.config.hostname}/oauth/token`;
    
    const body = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const tokenData: TelfinTokenResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      
      return tokenData;
    } catch (error) {
      console.error('Error getting trusted app token:', error);
      throw error;
    }
  }

  /**
   * Получение информации об авторизованном пользователе
   */
  async getUserInfo(): Promise<TelfinUserInfo> {
    await this.ensureValidToken();
    
    const url = `https://${this.config.hostname}/api/ver1.0/user/`;
    
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
   * Получение аудиофайла с использованием OAuth токена
   */
  async getAudioFileWithOAuth(clientId: string, recordUuid: string): Promise<Blob> {
    await this.ensureValidToken();
    
    const url = `https://${this.config.hostname}/client/${clientId}/record/${recordUuid}/download/`;
    
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

      return await response.blob();
    } catch (error) {
      console.error('Error downloading audio file with OAuth:', error);
      throw error;
    }
  }

  /**
   * Проверка валидности токена и обновление при необходимости
   */
  private async ensureValidToken(): Promise<void> {
    if (!this.accessToken || !this.tokenExpiry) {
      throw new Error('No access token available');
    }

    // Проверяем, не истек ли токен (с запасом в 5 минут)
    if (Date.now() > (this.tokenExpiry - 300000)) {
      if (this.refreshToken) {
        await this.refreshAccessToken();
      } else {
        // Нужно получить новый токен для доверенного приложения
        await this.getTrustedAppToken();
      }
    }
  }

  /**
   * Обновление токена доступа
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const url = `https://${this.config.hostname}/oauth/token`;
    
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString()
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const tokenData: TelfinTokenResponse = await response.json();
      
      this.accessToken = tokenData.access_token;
      this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);
      if (tokenData.refresh_token) {
        this.refreshToken = tokenData.refresh_token;
      }
      
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw error;
    }
  }

  /**
   * Очистка сохраненных токенов
   */
  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Проверка наличия действующего токена
   */
  hasValidToken(): boolean {
    return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
  }

  /**
  * Получение текущих токенов
  */
  getTokens() {
    return {
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      tokenExpiry: this.tokenExpiry,
    };
  }
}

// Singleton instance для OAuth API
let telfinOAuthInstance: TelfinOAuthAPI | null = null;

export const initTelfinOAuthAPI = (config: TelfinOAuthConfig): TelfinOAuthAPI => {
  telfinOAuthInstance = new TelfinOAuthAPI(config);
  return telfinOAuthInstance;
};

export const getTelfinOAuthAPI = (): TelfinOAuthAPI => {
  if (!telfinOAuthInstance) {
    throw new Error('Telfin OAuth API not initialized. Call initTelfinOAuthAPI first.');
  }
  return telfinOAuthInstance;
};
