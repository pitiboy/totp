import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { totpService } from '../../services/totp.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { validation } from '../../utils/validation';
import toast from 'react-hot-toast';

interface TotpVerifyFormData {
  totpCode: string;
}

interface TotpVerifyProps {
  onSuccess?: () => void;
}

export const TotpVerify = ({ onSuccess }: TotpVerifyProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TotpVerifyFormData>();

  const totpCode = watch('totpCode');

  // Format TOTP code input (6 digits only)
  useEffect(() => {
    if (totpCode) {
      const digitsOnly = totpCode.replace(/\D/g, '').slice(0, 6);
      if (digitsOnly !== totpCode) {
        setValue('totpCode', digitsOnly);
      }
    }
  }, [totpCode, setValue]);

  const onSubmit = async (data: TotpVerifyFormData) => {
    setIsLoading(true);
    try {
      const result = await totpService.verify({ totpCode: data.totpCode });
      if (result.success) {
        toast.success('TOTP code verified successfully');
        onSuccess?.();
      } else {
        toast.error('Invalid TOTP code');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Verify TOTP Code">
      <p className="text-sm text-gray-600 mb-4">
        Enter the 6-digit code from your authenticator app:
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
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
          autoFocus
        />
        <Button type="submit" isLoading={isLoading} className="w-full">
          Verify
        </Button>
      </form>
    </Card>
  );
};

