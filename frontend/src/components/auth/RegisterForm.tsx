import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { validation } from '../../utils/validation';
import toast from 'react-hot-toast';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>();

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { token, user } = await authService.register({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      login(token, user);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card title="Create Account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Username"
          type="text"
          {...register('username', {
            validate: (value) => validation.username(value),
          })}
          error={errors.username?.message}
          placeholder="Enter your username"
        />

        <Input
          label="Email"
          type="email"
          {...register('email', {
            validate: (value) => validation.email(value),
          })}
          error={errors.email?.message}
          placeholder="Enter your email"
        />

        <Input
          label="Password"
          type="password"
          {...register('password', {
            validate: (value) => validation.password(value),
          })}
          error={errors.password?.message}
          placeholder="Enter your password"
        />

        <Input
          label="Confirm Password"
          type="password"
          {...register('confirmPassword', {
            validate: (value) => validation.confirmPassword(password, value),
          })}
          error={errors.confirmPassword?.message}
          placeholder="Confirm your password"
        />

        <Button type="submit" isLoading={isLoading} className="w-full">
          Register
        </Button>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </Card>
  );
};

