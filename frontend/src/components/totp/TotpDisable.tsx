import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { totpService } from '../../services/totp.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import toast from 'react-hot-toast';

interface TotpDisableProps {
  onCancel: () => void;
  onSuccess: () => void;
}

interface TotpDisableFormData {
  password: string;
}

export const TotpDisable = ({ onCancel, onSuccess }: TotpDisableProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TotpDisableFormData>();

  const onSubmit = async (data: TotpDisableFormData) => {
    setIsLoading(true);
    try {
      const result = await totpService.disable({ password: data.password });
      if (result.success) {
        toast.success('TOTP disabled successfully');
        onSuccess();
      } else {
        toast.error('Failed to disable TOTP');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to disable TOTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Disable TOTP">
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          To disable two-factor authentication, please confirm your password:
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Password"
          type="password"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
          placeholder="Enter your password"
          autoFocus
        />

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="danger" isLoading={isLoading} className="flex-1">
            Disable TOTP
          </Button>
        </div>
      </form>
    </Card>
  );
};

