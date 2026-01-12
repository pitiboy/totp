import { api, getErrorMessage } from './api';
import {
  TotpSetupResponse,
  TotpVerifyRequest,
  TotpVerifyResponse,
  TotpEnableRequest,
  TotpEnableResponse,
  TotpStatusResponse,
  TotpDisableRequest,
  TotpDisableResponse,
  BackupCodesRequest,
  BackupCodesResponse,
} from '../types';

export const totpService = {
  setup: async (): Promise<TotpSetupResponse> => {
    try {
      const response = await api.post<TotpSetupResponse>('/totp/setup');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  verify: async (data: TotpVerifyRequest): Promise<TotpVerifyResponse> => {
    try {
      const response = await api.post<TotpVerifyResponse>('/totp/verify', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  enable: async (data: TotpEnableRequest): Promise<TotpEnableResponse> => {
    try {
      const response = await api.post<TotpEnableResponse>('/totp/enable', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  getStatus: async (): Promise<TotpStatusResponse> => {
    try {
      const response = await api.get<TotpStatusResponse>('/totp/status');
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  disable: async (data: TotpDisableRequest): Promise<TotpDisableResponse> => {
    try {
      const response = await api.post<TotpDisableResponse>('/totp/disable', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  regenerateBackupCodes: async (data: BackupCodesRequest): Promise<BackupCodesResponse> => {
    try {
      const response = await api.post<BackupCodesResponse>('/totp/backup-codes', data);
      return response.data;
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};

