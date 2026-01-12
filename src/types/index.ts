import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface TotpSecret {
  id: number;
  user_id: number;
  secret_encrypted: string;
  backup_codes_hashed: string | null;
  enabled: boolean;
  enabled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
}

export interface JwtUserPayload extends JwtPayload {
  userId: number;
  username: string;
  email: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface Login2FARequest {
  tokenKey: string;
  totpCode: string;
}

export interface TotpSetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export interface TotpVerifyRequest {
  totpCode: string;
}

export interface TotpEnableRequest {
  totpCode: string;
}

export interface TotpDisableRequest {
  password: string;
}

export interface TotpStatusResponse {
  enabled: boolean;
  enabledAt: string | null;
}

export interface BackupCodesRequest {
  password: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

