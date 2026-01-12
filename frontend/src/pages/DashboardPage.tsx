import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { TotpStatus } from '../components/totp/TotpStatus';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.username}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TotpStatus />

        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link to="/totp/setup">
              <Button className="w-full">Setup TOTP</Button>
            </Link>
            <p className="text-sm text-gray-600">
              Enable two-factor authentication to secure your account with an additional layer of
              protection.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

