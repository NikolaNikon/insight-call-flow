
export interface TelfinRequest {
  action: 'get_access_token' | 'get_user_info' | 'get_call_history' | 'get_audio_url' | 'download_audio_with_oauth' | 'save_call_history' | 'process_call_record_and_create_call' | 'diagnose_api_access';
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
  recordUuid?: string;
  calls?: any[];
  orgId?: string;
  telfinCall?: any;
  dateFrom?: string;
  dateTo?: string;
  telfinClientId?: string; // Добавляем client_id из userInfo
}

export interface TelfinStorageUrlResponse {
  record_url: string;
}
