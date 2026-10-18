'use client';

import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Modal } from '../ui/Overlays';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
}: LogoutConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isLoading) onClose();
      }}
      cardClassName="bg-white/85 border border-white/60 shadow-2xl shadow-neutral-300/40 backdrop-blur-2xl max-w-sm mx-auto"
    >
      <div className="flex flex-col items-center text-center">
        {/* Warning / Logout Icon */}
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3.5 shadow-inner">
          <LogOut size={24} />
        </div>

        {/* Title & Message */}
        <h3 className="text-lg font-semibold text-neutral-900 mb-1">Log Out?</h3>
        <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
          Are you sure you want to log out of Flux?
        </p>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 hover:bg-neutral-50 active:bg-neutral-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-700 active:bg-red-800 shadow-sm shadow-red-500/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
              />
            ) : (
              'Log Out'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
