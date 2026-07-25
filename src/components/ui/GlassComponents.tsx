'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import Image from 'next/image';
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
  default:
    'bg-[rgba(255,255,255,0.08)] border-[0.75px] border-white/10 text-white shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.4)]',
  light:
    'bg-[rgba(255,255,255,0.12)] border-[0.75px] border-white/20 text-white shadow-[inset_0px_-1px_3px_rgba(0,0,0,0.15),inset_0px_2px_4px_rgba(255,255,255,0.45)]',
  dark:
    'bg-[rgba(34,34,34,0.52)] border-[0.75px] border-white/15 text-white shadow-[inset_0px_-2px_5px_rgba(0,0,0,0.35),inset_0px_1px_3px_rgba(255,255,255,0.18)]',
  frosted:
    'bg-[rgba(255,255,255,0.06)] border-[0.75px] border-white/8 text-white shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_5px_rgba(255,255,255,0.32)]',
};

const textureClasses = {
  default: 'bg-[rgba(255,255,255,0.04)]',
  light: 'bg-[rgba(255,255,255,0.06)]',
  dark: 'bg-[rgba(255,255,255,0.03)]',
  frosted: 'bg-[rgba(255,255,255,0.035)]',
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
          relative isolate overflow-hidden
          ${variantClasses[variant]}
          ${blurClasses[blur]}
          ${paddingClasses[padding]}
          ${roundedClasses[rounded]}
          ${hover ? 'transition-all duration-300 hover:scale-[1.01] hover:border-white/25 hover:brightness-110' : ''}
          ${className}
        `}
        {...props}
      >
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[1] h-full w-full backdrop-blur-[2px] ${textureClasses[variant]}`}
        />
        <div className="relative z-[2]">{children}</div>
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
  default:
    'bg-[rgba(255,255,255,0.08)] border-[0.75px] border-white/12 text-white hover:border-white/24 hover:brightness-110',
  primary:
    'bg-[rgba(255,255,255,0.85)] border-[0.75px] border-white/40 text-[#0a0a0a] hover:bg-[rgba(255,255,255,0.92)]',
  ghost:
    'bg-[rgba(255,255,255,0.04)] border-[0.75px] border-white/8 text-white/80 hover:bg-[rgba(255,255,255,0.1)] hover:text-white',
  danger:
    'bg-[rgba(255,77,77,0.16)] border-[0.75px] border-red-300/35 text-red-100 hover:bg-[rgba(255,77,77,0.24)]',
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
          relative isolate overflow-hidden
          ${buttonVariantClasses[variant]}
          ${buttonSizeClasses[size]}
          ${fullWidth ? 'w-full' : ''}
          backdrop-blur-[5px] rounded-xl font-medium
          shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.35)]
          transition-all duration-200
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full bg-[rgba(255,255,255,0.04)] backdrop-blur-[2px]"
        />
        <span className="relative z-[2]">{children}</span>
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
      <div
        className="relative isolate overflow-hidden rounded-xl border-[0.75px] border-white/12 bg-[rgba(255,255,255,0.08)] backdrop-blur-[5px] shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.35)] transition-all duration-200 focus-within:border-white/24 focus-within:brightness-110"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] h-full w-full bg-[rgba(255,255,255,0.04)] backdrop-blur-[2px]"
        />
        {icon && (
          <div className="absolute left-3 top-1/2 z-[3] -translate-y-1/2 text-white/65">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            relative z-[2] w-full bg-transparent
            px-4 py-3
            focus:outline-none
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
      <div className="relative isolate overflow-hidden rounded-xl border-[0.75px] border-white/12 bg-[rgba(255,255,255,0.08)] backdrop-blur-[5px] shadow-[inset_0px_-2px_4px_rgba(0,0,0,0.2),inset_0px_2px_4px_rgba(255,255,255,0.35)] transition-all duration-200 focus-within:border-white/24 focus-within:brightness-110">
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-29.75px] top-[-47.75px] z-[1] h-[209px] w-[191px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[2px]"
        />
        <select
          ref={ref}
          className={`
            relative z-[2] w-full appearance-none cursor-pointer bg-transparent
            px-4 py-3 pr-10 text-white
            focus:outline-none
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#2b2b2b] text-white">
              {option.label}
            </option>
          ))}
        </select>
        <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 z-[3] -translate-y-1/2 text-xs text-white/70">
          ▾
        </span>
      </div>
    );
  }
);

GlassSelect.displayName = 'GlassSelect';

interface LiquidGlassTileProps
  extends Omit<HTMLMotionProps<'button'>, 'children'> {
  title: string;
  detail?: string;
  active?: boolean;
  icon?: ReactNode;
}

export const LiquidGlassTile = forwardRef<HTMLButtonElement, LiquidGlassTileProps>(
  (
    {
      title,
      detail = 'Detail',
      active = true,
      icon,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={`
          relative isolate flex size-[151px] flex-col items-start justify-between overflow-hidden
          rounded-[24px] border-[0.75px] border-solid border-white/10
          px-[14px] pt-[14px] pb-[17px]
          text-left
          ${className}
        `}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-[rgba(255,255,255,0.08)] backdrop-blur-[5px]" />

        <div className="pointer-events-none absolute left-[-29.75px] top-[-47.75px] z-[1] h-[209px] w-[191px] bg-[rgba(255,255,255,0.04)] backdrop-blur-[2px]" />

        <div className="relative z-[3] size-[40px] shrink-0 rounded-full">
          {active ? (
            <Image
              src="/figma-assets/liquid-glass-symbol-bg.svg"
              alt=""
              width={40}
              height={40}
              aria-hidden
              className="absolute inset-0 block size-full max-w-none"
            />
          ) : (
            <div className="pointer-events-none absolute inset-0 rounded-full bg-white/20 mix-blend-luminosity" />
          )}

          <div
            className={`absolute inset-0 flex items-center justify-center text-[15px] font-bold tracking-[-0.2px] ${active ? 'text-[#0a0a0a]' : 'text-white'}`}
          >
            {icon ?? <span aria-hidden>◎</span>}
          </div>
        </div>

        <div className="relative z-[2] flex w-full flex-col items-start justify-center px-[2px] text-[14px] tracking-[-0.08px]">
          <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-white">
            {title}
          </p>
          <p className="w-full overflow-hidden text-ellipsis whitespace-nowrap leading-[18px] font-medium text-white/60">
            {detail}
          </p>
        </div>

        <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-2px_4px_0px_rgba(0,0,0,0.2),inset_0px_2px_4px_0px_rgba(255,255,255,0.4)]" />
      </motion.button>
    );
  }
);

LiquidGlassTile.displayName = 'LiquidGlassTile';
