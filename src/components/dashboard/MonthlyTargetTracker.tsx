'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassComponents';
import { formatIDR } from '@/lib/budget';

interface MonthlyTargetTrackerProps {
  monthlyTotal: number;
  isMobile?: boolean;
}

export type CalcMode = 'all' | 'workdays';

const STORAGE_KEY_TARGET = 'flux_monthly_spending_target';
const STORAGE_KEY_MODE = 'flux_monthly_target_mode';
const DEFAULT_TARGET = 5000000;

// Format number with thousand separators (e.g. 5,000,000)
const formatWithThousandSeparator = (value: string | number): string => {
  const numStr = typeof value === 'number' ? value.toString() : value;
  const numericValue = numStr.replace(/[^\d]/g, '');
  if (!numericValue) return '';
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Parse formatted string back to raw number
const parseFormattedNumber = (value: string): number => {
  return parseFloat(value.replace(/,/g, '')) || 0;
};

// Helper: total days in current month
function getTotalDaysInMonth(now = new Date()): number {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

// Helper: remaining calendar days (inclusive of today)
function getRemainingAllDaysInMonth(now = new Date()): number {
  const totalDays = getTotalDaysInMonth(now);
  return totalDays - now.getDate() + 1;
}

// Helper: remaining workdays (Mon-Fri, inclusive of today)
function getRemainingWorkdaysInMonth(now = new Date()): number {
  const year = now.getFullYear();
  const month = now.getMonth();
  const totalDays = getTotalDaysInMonth(now);
  const currentDay = now.getDate();

  let count = 0;
  for (let day = currentDay; day <= totalDays; day++) {
    const dayOfWeek = new Date(year, month, day).getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
  }
  return count;
}

export function MonthlyTargetTracker({ monthlyTotal }: MonthlyTargetTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [target, setTarget] = useState<number>(() => {
    if (typeof window === 'undefined') return DEFAULT_TARGET;
    const savedTarget = localStorage.getItem(STORAGE_KEY_TARGET);
    if (savedTarget) {
      const parsed = parseFloat(savedTarget);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return DEFAULT_TARGET;
  });

  const [mode, setMode] = useState<CalcMode>(() => {
    if (typeof window === 'undefined') return 'all';
    const savedMode = localStorage.getItem(STORAGE_KEY_MODE);
    if (savedMode === 'all' || savedMode === 'workdays') {
      return savedMode;
    }
    return 'all';
  });

  const [inputValue, setInputValue] = useState<string>(() => {
    if (typeof window === 'undefined') return formatWithThousandSeparator(DEFAULT_TARGET);
    const savedTarget = localStorage.getItem(STORAGE_KEY_TARGET);
    if (savedTarget) {
      const parsed = parseFloat(savedTarget);
      if (!isNaN(parsed) && parsed > 0) {
        return formatWithThousandSeparator(parsed);
      }
    }
    return formatWithThousandSeparator(DEFAULT_TARGET);
  });

  const handleInputChange = (val: string) => {
    const formatted = formatWithThousandSeparator(val);
    setInputValue(formatted);
    const num = parseFormattedNumber(formatted);
    if (num >= 0) {
      setTarget(num);
      localStorage.setItem(STORAGE_KEY_TARGET, num.toString());
    }
  };

  const handlePresetClick = (amount: number) => {
    setTarget(amount);
    setInputValue(formatWithThousandSeparator(amount));
    localStorage.setItem(STORAGE_KEY_TARGET, amount.toString());
  };

  const handleModeChange = (newMode: CalcMode) => {
    setMode(newMode);
    localStorage.setItem(STORAGE_KEY_MODE, newMode);
  };

  const amountLeft = target - monthlyTotal;
  const isOverBudget = amountLeft < 0;
  const percentageSpent = target > 0 ? Math.min(100, Math.round((monthlyTotal / target) * 100)) : 0;

  const remainingDays = mode === 'all' ? getRemainingAllDaysInMonth() : getRemainingWorkdaysInMonth();
  const remainingDailyLimit = remainingDays > 0 ? Math.max(0, amountLeft) / remainingDays : 0;

  return (
    <GlassCard variant="light" padding="none" rounded="2xl" className="mb-4 overflow-hidden">
      {/* Accordion Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-white/20 transition-colors select-none"
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold text-neutral-800 text-xs">Monthly Spending Target</span>
          <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-700'}`}>
            {isOverBudget ? `Exceeded by ${formatIDR(Math.abs(amountLeft))}` : `Remaining: ${formatIDR(amountLeft)}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-neutral-500">
          <span className="text-xs text-neutral-400 font-medium hidden sm:inline">
            {isOpen ? 'Close' : 'Set Target & Details'}
          </span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} />
          </motion.div>
        </div>
      </div>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-4 border-t border-neutral-200/60 bg-white/30 backdrop-blur-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side (5 cols): Target Input Header & Field */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center h-8">
                    <label htmlFor="monthly-target-input" className="text-xs font-semibold text-neutral-700">
                      Set Monthly Target (IDR)
                    </label>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400">
                      Rp
                    </span>
                    <input
                      id="monthly-target-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="5,000,000"
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200/80 bg-white/80 py-3 pl-12 pr-4 text-xl font-bold text-neutral-900 placeholder:text-neutral-400 transition-all duration-200 focus:border-neutral-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/10 shadow-xs"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="pt-2">
                    <span className="text-[11px] font-medium text-neutral-400 mb-1.5 block">Quick Presets:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[1500000, 2000000, 3000000, 3500000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            target === preset
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80'
                          }`}
                        >
                          {formatIDR(preset)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side (7 cols): Header Div & Cards Grid */}
                <div className="lg:col-span-7 space-y-2">
                  {/* Mode Selector Header Div (Matching h-8 height with Left Header) */}
                  <div className="flex items-center justify-between h-8">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-neutral-400 font-medium mr-0.5">Mode:</span>
                      <button
                        type="button"
                        onClick={() => handleModeChange('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          mode === 'all'
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80'
                        }`}
                      >
                        All Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange('workdays')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          mode === 'workdays'
                            ? 'bg-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80'
                        }`}
                      >
                        Workdays
                      </button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Amount Left Card */}
                    <div className={`p-4 rounded-xl border ${isOverBudget ? 'bg-red-50/80 border-red-200' : 'bg-emerald-50/80 border-emerald-200/80'}`}>
                      <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-700' : 'text-emerald-700'}`}>
                        {isOverBudget ? 'Target Exceeded By' : 'Remaining Budget'}
                      </span>
                      <p className={`text-2xl font-bold mt-1 ${isOverBudget ? 'text-red-700' : 'text-emerald-800'}`}>
                        {formatIDR(Math.abs(amountLeft))}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="mt-2.5">
                        <div className="flex justify-between text-[10px] font-medium text-neutral-500 mb-1">
                          <span>Spent {formatIDR(monthlyTotal)}</span>
                          <span>{percentageSpent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-200/60 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOverBudget ? 'bg-red-500' : percentageSpent > 80 ? 'bg-amber-500' : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, percentageSpent)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Daily Limit Remaining Card */}
                    <div className="p-4 rounded-xl bg-white/70 border border-neutral-200/80 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-neutral-700">Recommended Daily Limit</span>
                        <p className="text-2xl font-bold text-neutral-900 mt-1">
                          {formatIDR(Math.round(remainingDailyLimit))}
                          <span className="text-xs font-normal text-neutral-500">/day</span>
                        </p>
                      </div>
                      
                      <p className="text-xs text-neutral-500 mt-2">
                        {isOverBudget ? (
                          <span className="text-red-600 font-medium flex items-center gap-1">
                            <AlertCircle size={12} /> Target reached. Try minimizing further spend.
                          </span>
                        ) : (
                          <>
                            to spend per day for remaining{' '}
                            <strong className="font-semibold text-neutral-800">{remainingDays} {mode === 'all' ? 'days' : 'workdays'}</strong>.
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
