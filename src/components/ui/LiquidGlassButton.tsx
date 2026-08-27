'use client';

import React, { forwardRef } from 'react';

export interface LiquidGlassBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  cornerRadius?: number;
  mode?: 'standard' | 'polar' | 'prominent' | 'shader';
}

export const LiquidGlassButton = forwardRef<
  HTMLButtonElement,
  LiquidGlassBtnProps
>((
    {
      children,
      className = '',
      cornerRadius = 60,
      mode = 'standard',
      style,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Dynamic corner radius style matching props if provided
    const roundedStyle: React.CSSProperties = {
      borderRadius: cornerRadius ? `${cornerRadius}px` : '60px',
      ...style,
    };

    // Variant style accents based on mode parameter for visual flexibility
    const modeOverlayClasses = {
      standard:
        'bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.14)] border-white/20 shadow-[inset_0px_1px_2px_rgba(255,255,255,0.5),inset_0px_-2px_4px_rgba(0,0,0,0.3)]',
      polar:
        'bg-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.20)] border-white/30 shadow-[inset_0px_1.5px_3px_rgba(255,255,255,0.6),inset_0px_-2px_6px_rgba(0,0,0,0.4)]',
      prominent:
        'bg-gradient-to-b from-white/20 to-white/5 hover:from-white/30 hover:to-white/10 border-white/35 shadow-[inset_0px_2px_4px_rgba(255,255,255,0.7),0_8px_20px_rgba(0,0,0,0.3)]',
      shader:
        'bg-[rgba(255,255,255,0.10)] hover:bg-[rgba(255,255,255,0.18)] border-white/25 shadow-[inset_0px_1px_3px_rgba(255,255,255,0.5)]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        style={roundedStyle}
        className={`
          relative isolate inline-flex items-center justify-center
          px-6 py-3 font-bold text-white
          backdrop-blur-xl border-[0.75px]
          transition-all duration-200 ease-out
          hover:scale-[1.02] hover:brightness-110
          active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100
          overflow-hidden cursor-pointer select-none
          ${modeOverlayClasses[mode] || modeOverlayClasses.standard}
          ${className}
        `}
        {...props}
      >
        {/* Subtle glass reflection highlight overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-80"
        />

        {/* Content wrapper */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    );
  }
);

LiquidGlassButton.displayName = 'LiquidGlassButton';

export default LiquidGlassButton;
