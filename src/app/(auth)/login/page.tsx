'use client';

import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useLogin } from '@/hooks/useLogin';
import {
  AuthLayout,
  FormInput,
  FormError,
  SubmitButton,
} from '@/components/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, error, loading } = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Flux account"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <FormError message={error} />}

        <FormInput
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          icon={Mail}
        />

        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          icon={Lock}
        />

        <SubmitButton loading={loading} loadingText="Signing in...">
          Sign in
        </SubmitButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-neutral-500 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-neutral-900 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}