'use client';

import { LucideIcon } from 'lucide-react';

interface FormInputProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: LucideIcon;
  required?: boolean;
}

export function FormInput({
  label,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  required = true,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-600 mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 border border-neutral-200 
                   focus:outline-none focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-400
                   transition-all duration-200 text-neutral-800 placeholder:text-neutral-400"
        />
      </div>
    </div>
  );
}