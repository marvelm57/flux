import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export function useLogin() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return false;
      }

      router.push('/dashboard');
      router.refresh();
      // Keep loading true - redirect will unmount component
      return true;
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
      return false;
    }
  };

  return { login, error, loading };
}