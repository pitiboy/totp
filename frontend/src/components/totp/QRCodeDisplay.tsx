import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface QRCodeDisplayProps {
  qrCode: string;
  secret: string;
}

const TOTP_ISSUER = 'OpenHome'; // Should match backend TOTP_ISSUER

export const QRCodeDisplay = ({ qrCode, secret }: QRCodeDisplayProps) => {
  const { user } = useAuth();
  const [showSecret, setShowSecret] = useState(false);
  const [showUri, setShowUri] = useState(false);

  // Reconstruct the otpauth URI from the secret (matching backend format)
  // Format: otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}
  const accountName = user?.email || user?.username || 'user';
  const otpauthUri = user
    ? `otpauth://totp/${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(TOTP_ISSUER)}`
    : null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <img
            src={qrCode}
            alt="TOTP QR Code"
            className="w-64 h-64"
            style={{ imageRendering: 'crisp-edges' }}
          />
          {otpauthUri && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">OTPAuth URI:</label>
                <Button
                  variant="outline"
                  onClick={() => setShowUri(!showUri)}
                  className="text-xs px-2 py-1"
                >
                  {showUri ? 'Hide' : 'Show'}
                </Button>
              </div>
              {showUri && (
                <div className="space-y-2">
                  <code className="block text-xs text-gray-500 break-all text-center font-mono bg-gray-50 p-2 rounded">
                    {otpauthUri}
                  </code>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(otpauthUri, 'OTPAuth URI')}
                    className="w-full text-xs"
                  >
                    Copy URI
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <p className="mt-4 text-sm text-gray-600 text-center">
          Scan this QR code with your authenticator app
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">Secret Key:</label>
          <Button
            variant="outline"
            onClick={() => setShowSecret(!showSecret)}
            className="text-xs px-2 py-1"
          >
            {showSecret ? 'Hide' : 'Show'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-gray-100 rounded font-mono text-sm break-all">
            {showSecret ? secret : '•'.repeat(32)}
          </code>
          <Button
            variant="outline"
            onClick={() => copyToClipboard(secret, 'Secret')}
            className="text-xs whitespace-nowrap"
          >
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
};
