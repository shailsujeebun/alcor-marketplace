import { AuthTabs } from '@/components/auth/auth-tabs';

export default function RegisterPage() {
  return (
    <div className="container-main py-12 md:py-20 flex items-center justify-center min-h-[calc(100vh-200px)]">
      <AuthTabs defaultTab="register" />
    </div>
  );
}
