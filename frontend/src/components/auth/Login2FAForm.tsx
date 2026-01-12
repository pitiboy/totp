import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { validation } from '../../utils/validation';
import { getUserFromToken } from '../../utils/jwt';
import toast from 'react-hot-toast';

interface Login2FAFormProps {
  tokenKey: string;
  onCancel?: () => void;
}

interface Login2FAFormData {
  totpCode: string;
}

const TOKEN_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

export const Login2FAForm = ({ tokenKey, onCancel }: Login2FAFormProps) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TOKEN_EXPIRY_TIME);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<Login2FAFormData>();

  const totpCode = watch('totpCode');

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Countdown timer
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TOKEN_EXPIRY_TIME - elapsed);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        toast.error('Token expired. Please login again.');
        if (onCancel) {
          onCancel();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onCancel]);

  // Format TOTP code input (6 digits only)
  useEffect(() => {
    if (totpCode) {
      const digitsOnly = totpCode.replace(/\D/g, '').slice(0, 6);
      if (digitsOnly !== totpCode) {
        setValue('totpCode', digitsOnly);
      }
    }
  }, [totpCode, setValue]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const onSubmit = async (data: Login2FAFormData) => {
    setIsLoading(true);
    try {
      const { token } = await authService.login2FA({
        tokenKey,
        totpCode: data.totpCode,
      });

      // Extract user info from JWT token
      const user = getUserFromToken(token) || { id: 0, username: '', email: '' };
      login(token, user);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Invalid TOTP code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Two-Factor Authentication">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          Enter the 6-digit code from your authenticator app
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Code expires in:</span>
          <span className={`font-mono ${timeRemaining < 60000 ? 'text-red-600' : 'text-gray-700'}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          ref={inputRef}
          label="TOTP Code"
          type="text"
          inputMode="numeric"
          maxLength={6}
          {...register('totpCode', {
            required: 'TOTP code is required',
            validate: (value) => validation.totpCode(value),
          })}
          error={errors.totpCode?.message}
          placeholder="000000"
          className="text-center text-2xl font-mono tracking-widest"
        />

        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button type="submit" isLoading={isLoading} className="flex-1">
            Verify
          </Button>
        </div>
      </form>
    </Card>
  );
};

