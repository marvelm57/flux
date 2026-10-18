'use client';

import { useState, useSyncExternalStore } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { GlassCard } from '../ui/GlassComponents';
import { formatIDR } from '@/lib/budget';

interface MonthlyTargetTrackerProps {
  monthlyTotal: number;
  projectedMonthlyTotal: number;
  avgCalcMode?: 'all' | 'workdays' | 'active';
  setAvgCalcMode?: (mode: 'all' | 'workdays' | 'active') => void;
  projectionDailyAmount?: number;
  setProjectionDailyAmount?: (amount: number | null) => void;
  isMobile?: boolean;
}

export type CalcMode = 'all' | 'workdays';

const STORAGE_KEY_TARGET = 'flux_monthly_spending_target';
const DEFAULT_TARGET = 5000000;
const emptySubscribe = () => () => {};

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

export function MonthlyTargetTracker({ 
  monthlyTotal, 
  projectedMonthlyTotal, 
  avgCalcMode = 'all', 
  setAvgCalcMode,
  projectionDailyAmount = 50000,
  setProjectionDailyAmount,
}: MonthlyTargetTrackerProps) {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
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
    if (setAvgCalcMode) {
      setAvgCalcMode(newMode);
    }
  };

  if (!mounted) {
    return null; // Prevent hydration error
  }

  const amountLeft = target - monthlyTotal;
  const isOverBudget = amountLeft < 0;
  const percentageSpent = target > 0 ? Math.min(100, Math.round((monthlyTotal / target) * 100)) : 0;

  const remainingDays = avgCalcMode === 'workdays' ? getRemainingWorkdaysInMonth() : getRemainingAllDaysInMonth();
  const remainingDailyLimit = remainingDays > 0 ? Math.max(0, amountLeft) / remainingDays : 0;

  return (
    <GlassCard variant="light" padding="none" rounded="2xl" className="mb-4 overflow-hidden">
      {/* Accordion Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-white/20 dark:hover:bg-white/5 transition-colors select-none"
      >
        <div className="flex flex-1 items-center justify-between pr-6 gap-2">
          <span className="font-bold text-neutral-800 dark:text-white text-xs">Monthly Spending Target</span>
          <div className="flex flex-col text-right shrink-0">
            <span className={`text-xs font-semibold whitespace-nowrap ${isOverBudget ? 'text-red-600 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
              {isOverBudget ? `Exceeded by ${formatIDR(Math.abs(amountLeft))}` : `Remaining: ${formatIDR(amountLeft)}`} 
            </span>
            <span className="text-xs font-semibold text-blue-500 dark:text-sky-300 whitespace-nowrap">
              Projected: {formatIDR(Math.round(projectedMonthlyTotal))}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-neutral-500 dark:text-white">
          <span className="text-xs text-neutral-400 dark:text-neutral-100 font-medium hidden sm:inline">
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
            <div className="p-6 pt-4 border-t border-neutral-200/60 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* Left Side (5 cols): Target Input Header & Field */}
                <div className="lg:col-span-5 space-y-2">
                  <div className="flex items-center h-8">
                    <label htmlFor="monthly-target-input" className="text-xs font-semibold text-neutral-700 dark:text-white">
                      Set Monthly Target (IDR)
                    </label>
                  </div>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-neutral-400 dark:text-neutral-200">
                      Rp
                    </span>
                    <input
                      id="monthly-target-input"
                      type="text"
                      inputMode="numeric"
                      placeholder="5,000,000"
                      value={inputValue}
                      onChange={(e) => handleInputChange(e.target.value)}
                      className="w-full rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white/80 dark:bg-neutral-800/90 py-3 pl-12 pr-4 text-xl font-bold text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-400 transition-all duration-200 focus:border-neutral-800 dark:focus:border-white focus:bg-white dark:focus:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 shadow-xs"
                    />
                  </div>

                  {/* Preset Buttons */}
                  <div className="pt-2">
                    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-200 mb-1.5 block">Quick Presets:</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[1500000, 2000000, 3000000, 3500000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handlePresetClick(preset)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                            target === preset
                              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                              : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80 dark:bg-white/10 dark:text-white hover:dark:bg-white/20'
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
                      <span className="text-xs text-neutral-400 dark:text-neutral-200 font-medium mr-0.5">Mode:</span>
                      <button
                        type="button"
                        onClick={() => handleModeChange('all')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          avgCalcMode === 'all' || avgCalcMode === 'active'
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                            : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80 dark:bg-white/10 dark:text-white hover:dark:bg-white/20'
                        }`}
                      >
                        All Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModeChange('workdays')}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          avgCalcMode === 'workdays'
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                            : 'bg-neutral-100/80 text-neutral-600 hover:bg-neutral-200/80 dark:bg-white/10 dark:text-white hover:dark:bg-white/20'
                        }`}
                      >
                        Workdays
                      </button>
                    </div>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Amount Left Card */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${isOverBudget ? 'bg-red-50/80 border-red-200 dark:bg-red-950/40 dark:border-red-900/60' : 'bg-emerald-50/80 border-emerald-200/80 dark:bg-emerald-950/40 dark:border-emerald-900/60'}`}>
                      <div>
                        <span className={`text-xs font-semibold ${isOverBudget ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                          {isOverBudget ? 'Target Exceeded By' : 'Remaining Budget'}
                        </span>
                        <p className={`text-xl font-bold mt-1 ${isOverBudget ? 'text-red-700 dark:text-red-200' : 'text-emerald-800 dark:text-emerald-200'}`}>
                          {formatIDR(Math.abs(amountLeft))}
                        </p>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-2.5">
                        <div className="flex justify-between text-xs font-medium text-neutral-500 dark:text-neutral-200 mb-1">
                          <span>Spent {formatIDR(monthlyTotal)}</span>
                          <span className="font-bold text-neutral-800 dark:text-white">{percentageSpent}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-neutral-200/60 dark:bg-neutral-700/60 rounded-full overflow-hidden">
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
                    <div className="p-4 rounded-xl bg-white/70 dark:bg-neutral-800/80 border border-neutral-200/80 dark:border-neutral-700/80 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-neutral-700 dark:text-white">Recommended Daily Limit</span>
                        <p className="text-xl font-bold text-neutral-900 dark:text-white mt-1">
                          {formatIDR(Math.round(remainingDailyLimit))}
                          <span className="text-xs font-normal text-neutral-500 dark:text-neutral-300">/day</span>
                        </p>
                      </div>
                      
                      <p className="text-xs text-neutral-500 dark:text-neutral-200 mt-2 leading-snug">
                        {isOverBudget ? (
                          <span className="text-red-600 dark:text-red-300 font-medium flex items-center gap-1">
                            <AlertCircle size={10} /> Limit reached. Minimize spend.
                          </span>
                        ) : (
                          <>
                            to spend per day for remaining{' '}
                            <strong className="font-semibold text-neutral-800 dark:text-white">{remainingDays} {avgCalcMode === 'workdays' ? 'workdays' : 'days'}</strong>.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Projected Card */}
                    <div className={`p-4 rounded-xl border flex flex-col justify-between ${projectedMonthlyTotal > target ? 'bg-amber-50/80 border-amber-200/80 dark:bg-amber-950/40 dark:border-amber-900/60' : 'bg-blue-50/80 border-blue-200/80 dark:bg-blue-950/40 dark:border-blue-900/60'}`}>
                      <div>
                        <span className={`text-xs font-semibold ${projectedMonthlyTotal > target ? 'text-amber-700 dark:text-amber-300' : 'text-blue-700 dark:text-blue-300'}`}>
                          Projected Total
                        </span>
                        <p className={`text-xl font-bold mt-1 ${projectedMonthlyTotal > target ? 'text-amber-800 dark:text-amber-200' : 'text-blue-800 dark:text-blue-200'}`}>
                          {formatIDR(Math.round(projectedMonthlyTotal))}
                        </p>
                      </div>
                      
                      <p className="text-xs text-neutral-500 dark:text-neutral-200 mt-2 leading-snug">
                        {projectedMonthlyTotal > target ? (
                          <span className="text-amber-600 dark:text-amber-300 font-medium flex items-center gap-1">
                            <AlertCircle size={10} /> Projected to exceed target by {formatIDR(Math.round(projectedMonthlyTotal - target))}.
                          </span>
                        ) : (
                          <span className="text-blue-600 dark:text-blue-300 font-medium flex items-center gap-1">
                            Projected to be under target by {formatIDR(Math.round(target - projectedMonthlyTotal))}.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Projection Slider */}
                  {setProjectionDailyAmount && (
                    <div className="mt-4 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700/80 bg-white/70 dark:bg-neutral-800/80">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-neutral-700 dark:text-white">Daily Amount for Projection (remaining {remainingDays} {avgCalcMode === 'workdays' ? 'workdays' : 'days'})</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setProjectionDailyAmount(null)}
                            className="text-[10px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-white bg-neutral-100 hover:bg-neutral-200 dark:bg-white/15 dark:hover:bg-white/25 px-2 py-0.5 rounded transition-colors"
                          >
                            Reset
                          </button>
                          <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatIDR(projectionDailyAmount)}</span>
                        </div>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100000" 
                        step="1000"
                        value={projectionDailyAmount}
                        onChange={(e) => setProjectionDailyAmount(Number(e.target.value))}
                        className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-neutral-800 dark:accent-white"
                      />
                      <div className="flex justify-between mt-1 text-[10px] text-neutral-400 dark:text-neutral-200 font-medium">
                        <span>Rp 0</span>
                        <span>Rp 100,000+</span>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}
