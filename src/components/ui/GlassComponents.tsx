'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef, ReactNode } from 'react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'light' | 'dark' | 'frosted';
  blur?: 'sm' | 'md' | 'lg' | 'xl';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  hover?: boolean;
}

const blurClasses = {
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const roundedClasses = {
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
};

const variantClasses = {
  default: 'bg-white/20 border border-white/30 shadow-xl shadow-black/5',
  light: 'bg-white/40 border border-white/50 shadow-lg shadow-black/5',
  dark: 'bg-black/20 border border-white/10 shadow-xl shadow-black/10',
  frosted: 'bg-white/10 border border-white/20 shadow-2xl shadow-black/10',
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      variant = 'default',
      blur = 'lg',
      padding = 'md',
      rounded = '2xl',
      hover = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={`
          ${variantClasses[variant]}
          ${blurClasses[blur]}
          ${paddingClasses[padding]}
          ${roundedClasses[rounded]}
          ${hover ? 'transition-all duration-300 hover:bg-white/30 hover:border-white/40 hover:shadow-2xl hover:scale-[1.02]' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
}

const buttonVariantClasses = {
  default: 'bg-white/20 border border-white/30 text-neutral-800 hover:bg-white/30',
  primary: 'bg-neutral-900 border border-neutral-800 text-white hover:bg-neutral-800',
  ghost: 'bg-transparent border border-transparent text-neutral-600 hover:bg-white/20',
  danger: 'bg-red-500/20 border border-red-500/30 text-red-600 hover:bg-red-500/30',
};

const buttonSizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  icon: 'p-3',
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={`
          ${buttonVariantClasses[variant]}
          ${buttonSizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          backdrop-blur-lg rounded-xl font-medium
          transition-all duration-200
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ icon, className = '', ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-white/20 border border-white/30 
            backdrop-blur-lg rounded-xl
            px-4 py-3 text-neutral-800 placeholder:text-neutral-500
            focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900/30
            transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

interface GlassSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  ({ options, className = '', ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`
          w-full bg-white/20 border border-white/30 
          backdrop-blur-lg rounded-xl
          px-4 py-3 text-neutral-800
          focus:outline-none focus:ring-2 focus:ring-neutral-900/20 focus:border-neutral-900/30
          transition-all duration-200
          appearance-none cursor-pointer
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-white text-neutral-800">
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';
