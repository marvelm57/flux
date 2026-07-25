'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { BottomSheet, Modal } from '../ui/Overlays';
import { FilterType } from '@/hooks/useExpenses';

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => format(new Date(), 'yyyy-MM-dd');

interface FilterTabsProps {
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  isMobile: boolean;
  customDateRange?: { start: string; end: string };
  onCustomDateChange?: (range: { start: string; end: string }) => void;
}

export function FilterTabs({ 
  filter, 
  setFilter, 
  isMobile, 
  customDateRange,
  onCustomDateChange 
}: FilterTabsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(customDateRange?.start || getTodayDate());
  const [endDate, setEndDate] = useState(customDateRange?.end || getTodayDate());

  const filters: { value: FilterType; label: string }[] = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'Week' },
    { value: 'monthly', label: 'Month' },
    { value: 'custom', label: 'Custom' },
  ];

  const handleCustomFilterClick = () => {
    setIsOpen(true);
  };

  const handleApplyCustomFilter = () => {
    if (startDate && endDate && onCustomDateChange) {
      onCustomDateChange({ start: startDate, end: endDate });
      setFilter('custom');
      setIsOpen(false);
    }
  };

  const handleFilterClick = (value: FilterType) => {
    if (value === 'custom') {
      handleCustomFilterClick();
    } else {
      setFilter(value);
    }
  };

  const getCustomLabel = () => {
    if (filter === 'custom' && customDateRange) {
      const start = format(new Date(customDateRange.start), 'MMM d');
      const end = format(new Date(customDateRange.end), 'MMM d');
      return start === end ? start : `${start} - ${end}`;
    }
    return 'Custom';
  };

  const activeIndex = filters.findIndex((f) => f.value === filter);

  const formContent = (
    <div className="space-y-5">
      {/* Start Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-600">Start Date</label>
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <Calendar size={18} />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate || getTodayDate()}
            className="w-full rounded-xl border border-neutral-200 bg-white/50 py-3 pl-12 pr-4 text-neutral-900 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>
      </div>

      {/* End Date */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-600">End Date</label>
        <div className="relative">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400">
            <Calendar size={18} />
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={getTodayDate()}
            className="w-full rounded-xl border border-neutral-200 bg-white/50 py-3 pl-12 pr-4 text-neutral-900 transition-all duration-200 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
          />
        </div>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-600">Quick Select</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Last 7 Days', days: 7 },
            { label: 'Last 14 Days', days: 14 },
            { label: 'Last 30 Days', days: 30 },
            { label: 'Last 90 Days', days: 90 },
          ].map((preset) => (
            <motion.button
              key={preset.days}
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - preset.days + 1);
                setStartDate(format(start, 'yyyy-MM-dd'));
                setEndDate(format(end, 'yyyy-MM-dd'));
              }}
              className="rounded-xl border border-neutral-200 bg-white/50 px-4 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:bg-white/80"
              whileTap={{ scale: 0.95 }}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <button
        type="button"
        onClick={handleApplyCustomFilter}
        disabled={!startDate || !endDate}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 text-base font-medium text-white transition-colors duration-200 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Apply Filter
      </button>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="relative isolate flex w-full items-center justify-between overflow-hidden rounded-[50px] border-[0.75px] border-white/0 bg-[rgba(255,255,255,0.1)] p-[5px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] h-full w-full bg-[rgba(255,255,255,0.01)] backdrop-blur-[2px]"
          />

          <motion.div
            aria-hidden
            className="pointer-events-none absolute z-[2] overflow-hidden rounded-[60px]"
            style={{
              width: `calc((100% - 10px) / ${filters.length})`,
              left: 5,
              top: 4.25,
              bottom: 4.25,
            }}
            animate={{ x: `${Math.max(activeIndex, 0) * 100}%` }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          >
            <div className="absolute inset-0 rounded-[50px] bg-[rgba(255,255,255,0.3)] shadow-[inset_0px_-1px_2px_rgba(0,0,0,0.1),inset_0px_0px_2px_rgba(255,255,255,0.2)]" />
          </motion.div>

          {filters.map((f) => (
            <motion.button
              key={f.value}
              onClick={() => handleFilterClick(f.value)}
              className={`
                relative z-[4] flex min-w-px flex-1 items-center justify-center rounded-[50px]
                px-2 py-[10px] text-center text-sm font-semibold tracking-[-0.08px]
                transition-colors duration-200
                ${filter === f.value ? 'text-dark' : 'text-dark/90'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex max-w-full items-center justify-center gap-1 truncate">
                {f.value === 'custom' && <SlidersHorizontal size={14} />}
                <span className="truncate">{f.value === 'custom' ? getCustomLabel() : f.label}</span>
              </span>
            </motion.button>
          ))}

          <div className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] shadow-[inset_0px_-2px_6px_0px_rgba(0,0,0,0.2),inset_0px_2px_8px_0px_rgba(255,255,255,0.4)]" />
        </div>

        <BottomSheet
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Custom Date Range"
          cardClassName="bg-white/60 border border-white/50 shadow-xl shadow-neutral-200/50 backdrop-blur-xl"
        >
          {formContent}
        </BottomSheet>
      </>
    );
  }

  return (
    <>
      <div className="relative isolate flex w-[300px] items-center justify-between overflow-hidden rounded-[50px] border-[0.75px] border-white/0 bg-[rgba(255,255,255,0.1)] p-[5px]">
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-15.75px] top-[-17.75px] z-[1] h-[81px] w-[344px] bg-[rgba(255,255,255,0.01)] backdrop-blur-[2px]"
        />

        <motion.div
          aria-hidden
          className="pointer-events-none absolute z-[2] overflow-hidden rounded-[60px]"
          style={{
            width: `calc((100% - 10px) / ${filters.length})`,
            left: 5,
            top: 4.25,
            bottom: 4.25,
          }}
          animate={{ x: `${Math.max(activeIndex, 0) * 100}%` }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        >
          <div className="absolute -left-[6px] -top-[5px] h-[45px] w-[106px] bg-[rgba(255,255,255,0.01)] backdrop-blur-[2px] shadow-[inset_0px_-1px_2px_rgba(0,0,0,0.1),inset_0px_0px_2px_rgba(255,255,255,0.2)]" />
          <div className="absolute inset-0 rounded-[50px] bg-[rgba(255,255,255,0.3)] shadow-[inset_0px_-1px_2px_rgba(0,0,0,0.1),inset_0px_0px_2px_rgba(255,255,255,0.2)]" />
        </motion.div>

        {filters.map((f) => (
          <motion.button
            key={f.value}
            onClick={() => handleFilterClick(f.value)}
            className={`
              relative z-[4] flex min-w-px flex-1 items-center justify-center rounded-[50px]
              px-2 py-[10px] text-sm font-semibold tracking-[-0.08px]
              transition-colors duration-200
              ${filter === f.value ? 'text-dark' : 'text-dark/90'}
            `}
            whileTap={{ scale: 0.97 }}
          >
            <span className="relative z-10 flex max-w-full items-center gap-1 truncate">
              {f.value === 'custom' && <SlidersHorizontal size={14} />}
              <span className="truncate">{f.value === 'custom' ? getCustomLabel() : f.label}</span>
            </span>
          </motion.button>
        ))}

        <div className="pointer-events-none absolute inset-0 z-[5] rounded-[inherit] shadow-[inset_0px_-2px_6px_0px_rgba(0,0,0,0.2),inset_0px_2px_8px_0px_rgba(255,255,255,0.4)]" />
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Custom Date Range"
        cardClassName="bg-white/60 border border-white/50 shadow-xl shadow-neutral-200/50 backdrop-blur-xl"
      >
        {formContent}
      </Modal>
    </>
  );
}
