import { UniversalSignIn } from '../components/auth/UniversalSignIn';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <UniversalSignIn />
    </div>
  );
}