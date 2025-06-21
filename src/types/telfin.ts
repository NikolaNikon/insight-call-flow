
export interface TelfinClientCredentialsConfig {
  clientId: string;
  clientSecret: string;
  accessToken?: string | null;
  tokenExpiry?: number | null;
}

export interface TelfinTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface TelfinExtension {
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

export interface TelfinTokenDiagnostics {
  hasToken: boolean;
  tokenExpiry: string | null;
  currentTime: string;
  timeUntilExpiry: number | null;
  isValid: boolean;
}
