
import { supabase } from '@/integrations/supabase/client';
import { TelfinClientCredentialsConfig, TelfinTokenResponse } from '@/types/telfin';
import { OAUTH_HOST, TOKEN_BUFFER_TIME } from './telfinConfig';

export class TelfinTokenManager {
  private config: TelfinClientCredentialsConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(config: TelfinClientCredentialsConfig) {
    this.config = config;
    this.accessToken = config.accessToken || null;
    this.tokenExpiry = config.tokenExpiry || null;
  }

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
      
      console.log('Token successfully obtained. Expires in:', tokenData.expires_in, 'seconds');
      console.log('Token expiry time:', new Date(this.tokenExpiry).toISOString());
      
      return tokenData;
    } catch (error: any) {
      console.error('Error getting access token:', error);
      const message = error.message || JSON.stringify(error);
      throw new Error(`[TELFIN-API-001] Ошибка API Телфин: ${message}`);
    }
  }

  async ensureValidToken(): Promise<void> {
    const now = Date.now();
    
    console.log('Token validation check:', {
      hasToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      currentTime: new Date(now).toISOString(),
      timeUntilExpiry: this.tokenExpiry ? Math.round((this.tokenExpiry - now) / 1000) : null,
      needsRefresh: !this.accessToken || !this.tokenExpiry || now > (this.tokenExpiry - TOKEN_BUFFER_TIME)
    });

    if (!this.accessToken || !this.tokenExpiry || now > (this.tokenExpiry - TOKEN_BUFFER_TIME)) {
      console.log('Token is invalid or expiring soon, requesting new token...');
      
      try {
        await this.getAccessToken();
        console.log('Token successfully refreshed');
      } catch (error) {
        console.error('Failed to refresh token:', error);
        throw error;
      }
    } else {
      console.log('Token is still valid for', Math.round((this.tokenExpiry - now) / 1000), 'seconds');
    }
    
    if (!this.accessToken) {
      throw new Error('[TELFIN-API-002] Не удалось получить действительный токен доступа.');
    }
  }

  clearTokens(): void {
    this.accessToken = null;
    this.tokenExpiry = null;
    console.log('Tokens cleared');
  }

  hasValidToken(): boolean {
    const now = Date.now();
    const isValid = !!(this.accessToken && this.tokenExpiry && now < (this.tokenExpiry - TOKEN_BUFFER_TIME));
    
    console.log('Token validity check:', {
      hasToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      currentTime: new Date(now).toISOString(),
      isValid
    });
    
    return isValid;
  }

  getTokens() {
    return {
      accessToken: this.accessToken,
      tokenExpiry: this.tokenExpiry,
    };
  }

  getTokenDiagnostics() {
    const now = Date.now();
    return {
      hasToken: !!this.accessToken,
      tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null,
      currentTime: new Date(now).toISOString(),
      timeUntilExpiry: this.tokenExpiry ? Math.round((this.tokenExpiry - now) / 1000) : null,
      isValid: this.hasValidToken(),
    };
  }

  getCurrentToken(): string | null {
    return this.accessToken;
  }
}
