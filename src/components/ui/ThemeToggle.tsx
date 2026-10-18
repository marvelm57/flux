'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: number;
}

const emptySubscribe = () => () => {};

export function ThemeToggle({ className = '', size = 22 }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div
        className={`p-1.5 flex items-center justify-center text-neutral-400 ${className}`}
        style={{ width: size + 12, height: size + 12 }}
        aria-hidden="true"
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.08 }}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={`p-1.5 flex items-center justify-center text-neutral-400 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer rounded-lg ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -90, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {isDark ? <Sun size={size} className="text-amber-400" /> : <Moon size={size} className="text-neutral-600 hover:text-neutral-900" />}
      </motion.div>
    </motion.button>
  );
}
