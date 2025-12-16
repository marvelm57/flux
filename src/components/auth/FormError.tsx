'use client';

import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message: string;
}

export function FormError({ message }: FormErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700"
    >
      <AlertCircle size={18} />
      <span className="text-sm">{message}</span>
    </motion.div>
  );
}