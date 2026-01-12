// User types
export interface User {
  id: number;
  username: string;
  email: string;
}

// Auth types
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  tokenKey?: string;
  requiresTotp?: boolean;
}

export interface Login2FARequest {
  tokenKey: string;
  totpCode: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// TOTP types
export interface TotpSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TotpVerifyRequest {
  totpCode: string;
}

export interface TotpVerifyResponse {
  success: boolean;
}

export interface TotpEnableRequest {
  totpCode: string;
}

export interface TotpEnableResponse {
  success: boolean;
}

export interface TotpStatusResponse {
  enabled: boolean;
  enabledAt: string | null;
}

export interface TotpDisableRequest {
  password: string;
}

export interface TotpDisableResponse {
  success: boolean;
}

export interface BackupCodesRequest {
  password: string;
}

export interface BackupCodesResponse {
  backupCodes: string[];
}

// API Error types
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

