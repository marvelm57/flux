'use client';

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface SuccessMessageProps {
  title: string;
  message: string;
}

export function SuccessMessage({ title, message }: SuccessMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
        <CheckCircle size={32} className="text-green-600" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h2>
      <p className="text-neutral-500">{message}</p>
    </motion.div>
  );
}