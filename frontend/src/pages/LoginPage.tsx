import { LoginForm } from '../components/auth/LoginForm';
import { Layout } from '../components/layout/Layout';

export const LoginPage = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <LoginForm />
      </div>
    </Layout>
  );
};

