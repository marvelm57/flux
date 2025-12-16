'use client';

import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-200 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neutral-900 mb-4"
          >
            <Wallet size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-neutral-900">{title}</h1>
          <p className="text-neutral-500 mt-2">{subtitle}</p>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-xl rounded-3xl p-8 shadow-xl shadow-neutral-200/50 border border-white/50"
        >
          {children}
        </motion.div>
      </motion.div>
    </div>
  );
}