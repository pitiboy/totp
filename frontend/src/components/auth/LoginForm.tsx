import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { getUserFromToken } from '../../utils/jwt';
import toast from 'react-hot-toast';
import { Login2FAForm } from './Login2FAForm';

interface LoginFormData {
  username: string;
  password: string;
}

export const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenKey, setTokenKey] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);

      if (response.requiresTotp && response.tokenKey) {
        // Show 2FA form
        setTokenKey(response.tokenKey);
      } else if (response.token) {
        // Direct login (no TOTP)
        // Extract user info from JWT token
        const user = getUserFromToken(response.token) || {
          id: 0,
          username: data.username,
          email: '',
        };
        login(response.token, user);
        toast.success('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Show 2FA form if tokenKey is set
  if (tokenKey) {
    return <Login2FAForm tokenKey={tokenKey} onCancel={() => setTokenKey(null)} />;
  }

  return (
    <Card title="Login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          type="text"
          {...register('username', { required: 'Username is required' })}
          error={errors.username?.message}
          placeholder="Enter your username"
          autoFocus
        />

        <Input
          label="Password"
          type="password"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
          placeholder="Enter your password"
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Login
        </Button>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:underline">
            Register
          </Link>
        </p>
      </form>
    </Card>
  );
};

