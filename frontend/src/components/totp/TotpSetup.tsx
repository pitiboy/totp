import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { totpService } from '../../services/totp.service';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { QRCodeDisplay } from './QRCodeDisplay';
import { validation } from '../../utils/validation';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface TotpSetupFormData {
  totpCode: string;
}

type SetupStep = 'initial' | 'qr-display' | 'verify' | 'enable';

export const TotpSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SetupStep>('initial');
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TotpSetupFormData>();

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

  const handleStartSetup = async () => {
    setIsLoading(true);
    try {
      const data = await totpService.setup();
      setSetupData(data);
      setStep('qr-display');
      toast.success('TOTP setup initialized');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (data: TotpSetupFormData) => {
    setIsLoading(true);
    try {
      const result = await totpService.verify({ totpCode: data.totpCode });
      if (result.success) {
        setStep('enable');
        toast.success('Code verified! Now enable TOTP.');
      } else {
        toast.error('Invalid TOTP code');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnable = async (data: TotpSetupFormData) => {
    setIsLoading(true);
    try {
      const result = await totpService.enable({ totpCode: data.totpCode });
      if (result.success) {
        toast.success('TOTP enabled successfully!');
        navigate('/dashboard');
      } else {
        toast.error('Failed to enable TOTP');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to enable TOTP');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'initial') {
    return (
      <Card title="Setup Two-Factor Authentication">
        <p className="text-gray-600 mb-6">
          Enable two-factor authentication to add an extra layer of security to your account.
        </p>
        <Button onClick={handleStartSetup} isLoading={isLoading} className="w-full">
          Start TOTP Setup
        </Button>
      </Card>
    );
  }

  if (step === 'qr-display' && setupData) {
    return (
      <Card title="Scan QR Code">
        <div className="space-y-6">
          <QRCodeDisplay qrCode={setupData.qrCode} secret={setupData.secret} />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Backup Codes</h3>
            <p className="text-sm text-yellow-700 mb-3">
              Save these backup codes in a safe place. You can use them to access your account if
              you lose your authenticator device.
            </p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {setupData.backupCodes.map((code, index) => (
                <code
                  key={index}
                  className="px-2 py-1 bg-white rounded text-sm font-mono text-center"
                >
                  {code}
                </code>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                const codesText = setupData.backupCodes.join('\n');
                navigator.clipboard.writeText(codesText);
                toast.success('Backup codes copied to clipboard');
              }}
              className="w-full text-sm"
            >
              Copy All Backup Codes
            </Button>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-4">
              After scanning the QR code, enter the 6-digit code from your authenticator app to
              verify:
            </p>
            <form onSubmit={handleSubmit(handleVerify)} className="space-y-4">
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
                Verify Code
              </Button>
            </form>
          </div>
        </div>
      </Card>
    );
  }

  if (step === 'enable') {
    return (
      <Card title="Enable TOTP">
        <p className="text-gray-600 mb-4">
          Enter the TOTP code one more time to confirm and enable two-factor authentication:
        </p>
        <form onSubmit={handleSubmit(handleEnable)} className="space-y-4">
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
            Enable TOTP
          </Button>
        </form>
      </Card>
    );
  }

  return null;
};

