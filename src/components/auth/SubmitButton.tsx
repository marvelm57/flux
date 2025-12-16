'use client';

import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  loading: boolean;
  loadingText: string;
  children: React.ReactNode;
}

export function SubmitButton({ loading, loadingText, children }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-3 px-4 rounded-xl bg-neutral-900 text-white font-medium
               hover:bg-neutral-800 transition-all duration-200
               disabled:opacity-50 disabled:cursor-not-allowed
               flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}