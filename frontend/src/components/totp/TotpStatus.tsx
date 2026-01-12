import { useState, useEffect } from 'react';
import { totpService } from '../../services/totp.service';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TotpDisable } from './TotpDisable';
import toast from 'react-hot-toast';
import { TotpStatusResponse } from '../../types';

export const TotpStatus = () => {
  const [status, setStatus] = useState<TotpStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDisable, setShowDisable] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const data = await totpService.getStatus();
      setStatus(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load TOTP status');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <LoadingSpinner />
      </Card>
    );
  }

  if (showDisable) {
    return (
      <TotpDisable
        onCancel={() => setShowDisable(false)}
        onSuccess={() => {
          setShowDisable(false);
          loadStatus();
        }}
      />
    );
  }

  return (
    <Card title="TOTP Status">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Status:</span>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              status?.enabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>

        {status?.enabled && status.enabledAt && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Enabled At:</span>
            <span className="text-gray-900">{formatDate(status.enabledAt)}</span>
          </div>
        )}

        <div className="pt-4 border-t">
          {status?.enabled ? (
            <Button variant="danger" onClick={() => setShowDisable(true)} className="w-full">
              Disable TOTP
            </Button>
          ) : (
            <p className="text-sm text-gray-600">
              TOTP is not enabled. Go to the setup page to enable it.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

