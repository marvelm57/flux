'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';
import { GlassCard, GlassButton } from './GlassComponents';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function BottomSheet({ isOpen, onClose, children, title }: BottomSheetProps) {
  // Prevent body scroll when sheet is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-hidden"
          >
            <GlassCard
              variant="light"
              blur="xl"
              padding="none"
              rounded="3xl"
              className="mx-2 mb-2 overflow-hidden"
              style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-neutral-400/50 rounded-full" />
              </div>

              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-5 pb-4 border-b border-white/20">
                  <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
                  <GlassButton variant="ghost" size="icon" onClick={onClose}>
                    <X size={20} />
                  </GlassButton>
                </div>
              )}

              {/* Content */}
              <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard variant="light" blur="xl" padding="none" rounded="2xl">
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/20">
                    <h2 className="text-lg font-semibold text-neutral-800">{title}</h2>
                    <GlassButton variant="ghost" size="icon" onClick={onClose}>
                      <X size={20} />
                    </GlassButton>
                  </div>
                )}
                <div className="p-6">{children}</div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
