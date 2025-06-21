
import { supabase } from '@/integrations/supabase/client';
import { TelfinClientInfo } from '@/types/telfin';
import { TelfinTokenManager } from './TelfinTokenManager';

export class TelfinApiClient {
  private tokenManager: TelfinTokenManager;

  constructor(tokenManager: TelfinTokenManager) {
    this.tokenManager = tokenManager;
  }

  async getUserInfo(): Promise<TelfinClientInfo> {
    await this.tokenManager.ensureValidToken();
    
    try {
       const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'get_user_info',
          accessToken: this.tokenManager.getCurrentToken(),
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

  async getCallHistory(dateFrom: string, dateTo: string, clientInfo?: TelfinClientInfo, retryCount = 0): Promise<any[]> {
    await this.tokenManager.ensureValidToken();
    
    const telfinClientId = clientInfo?.client_id ? String(clientInfo.client_id).trim() : undefined;
    
    console.log('Getting call history:', {
      dateFrom,
      dateTo,
      clientId: telfinClientId,
      clientIdType: typeof telfinClientId,
      hasAccessToken: !!this.tokenManager.getCurrentToken(),
      retryAttempt: retryCount
    });
    
    if (!telfinClientId) {
      throw new Error('[TELFIN-API-005] Client ID отсутствует или неверен в данных пользователя');
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('telfin-integration', {
        body: {
          action: 'get_call_history',
          accessToken: this.tokenManager.getCurrentToken(),
          dateFrom,
          dateTo,
          telfinClientId,
        },
      });

      if (error) {
        console.error('Supabase function invoke error:', error);
        throw error;
      }
      
      if (!data.success) {
        console.error('Function returned error:', data.error);
        
        const errorMessage = data.error || '';
        const isAuthError = errorMessage.includes('401') || errorMessage.includes('403') || 
                           errorMessage.includes('unauthorized') || errorMessage.includes('forbidden') ||
                           data.errorCategory === 'authentication';
        
        if (isAuthError && retryCount < 2) {
          console.log('Authorization error detected, forcing token refresh and retrying...');
          
          this.tokenManager.clearTokens();
          await this.tokenManager.ensureValidToken();
          
          return this.getCallHistory(dateFrom, dateTo, clientInfo, retryCount + 1);
        }
        
        if (data.diagnostics) {
          console.error('Diagnostics:', data.diagnostics);
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
      
      if (message.includes('[TELFIN-API-005]')) {
        throw error;
      }
      
      throw new Error(`[TELFIN-API-005] HTTP error! Details: ${message}`);
    }
  }
}
