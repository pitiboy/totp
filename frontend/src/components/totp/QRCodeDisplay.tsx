import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface QRCodeDisplayProps {
  qrCode: string;
  secret: string;
}

export const QRCodeDisplay = ({ qrCode, secret }: QRCodeDisplayProps) => {
  const [showSecret, setShowSecret] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCodeSVG value={qrCode} size={256} />
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

