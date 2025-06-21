
import { TelfinClientCredentialsConfig, TelfinClientInfo } from '@/types/telfin';
import { TelfinTokenManager } from './telfin/TelfinTokenManager';
import { TelfinApiClient } from './telfin/TelfinApiClient';

export class TelfinClientCredentialsAPI {
  private tokenManager: TelfinTokenManager;
  private apiClient: TelfinApiClient;

  constructor(config: TelfinClientCredentialsConfig) {
    this.tokenManager = new TelfinTokenManager(config);
    this.apiClient = new TelfinApiClient(this.tokenManager);
  }

  async getAccessToken() {
    return this.tokenManager.getAccessToken();
  }

  async getUserInfo(): Promise<TelfinClientInfo> {
    return this.apiClient.getUserInfo();
  }

  async getCallHistory(dateFrom: string, dateTo: string, clientInfo?: TelfinClientInfo, retryCount = 0): Promise<any[]> {
    return this.apiClient.getCallHistory(dateFrom, dateTo, clientInfo, retryCount);
  }

  clearTokens(): void {
    this.tokenManager.clearTokens();
  }

  hasValidToken(): boolean {
    return this.tokenManager.hasValidToken();
  }

  getTokens() {
    return this.tokenManager.getTokens();
  }

  getTokenDiagnostics() {
    return this.tokenManager.getTokenDiagnostics();
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

// Re-export types for backward compatibility
export type { TelfinClientCredentialsConfig, TelfinClientInfo, TelfinTokenResponse, TelfinExtension } from '@/types/telfin';
