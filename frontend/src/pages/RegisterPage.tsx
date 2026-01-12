import { RegisterForm } from '../components/auth/RegisterForm';
import { Layout } from '../components/layout/Layout';

export const RegisterPage = () => {
  return (
    <Layout>
      <div className="max-w-md mx-auto mt-12">
        <RegisterForm />
      </div>
    </Layout>
  );
};

