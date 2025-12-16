'use client';

import { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import Link from 'next/link';
import { useSignup } from '@/hooks';
import {
  AuthLayout,
  FormInput,
  FormError,
  SubmitButton,
  SuccessMessage,
} from '@/components/auth';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, error, success, loading } = useSignup();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signup({ email, password, confirmPassword });
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Start tracking your expenses with Flux"
    >
      {success ? (
        <SuccessMessage
          title="Check your email!"
          message={`We sent a confirmation link to ${email}`}
        />
      ) : (
        <>
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

            <FormInput
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="••••••••"
              icon={Lock}
            />

            <SubmitButton loading={loading} loadingText="Creating account...">
              Create account
            </SubmitButton>
          </form>

          <div className="mt-6 text-center">
            <p className="text-neutral-500 text-sm">
              Already have an account?{' '}
              <Link href="/login" className="text-neutral-900 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </>
      )}
    </AuthLayout>
  );
}