import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';

interface SignupOptions {
  email: string;
  password: string;
  confirmPassword: string;
}

export function useSignup() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const signup = async ({ email, password, confirmPassword }: SignupOptions) => {
    setError(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return false;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return false;
      }

      setSuccess(true);
      return true;
    } catch {
      setError('An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, error, success, loading };
}