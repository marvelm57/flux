'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, SlidersHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { GlassCard, GlassButton, GlassInput } from '../ui/GlassComponents';
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

  const formContent = (
    <div className="space-y-5">
      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-2">Start Date</label>
        <GlassInput
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          icon={<Calendar size={18} />}
          max={endDate || getTodayDate()}
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-2">End Date</label>
        <GlassInput
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          icon={<Calendar size={18} />}
          min={startDate}
          max={getTodayDate()}
        />
      </div>

      {/* Quick Presets */}
      <div>
        <label className="block text-sm font-medium text-neutral-600 mb-2">Quick Select</label>
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
              className="py-2.5 px-4 rounded-xl text-sm font-medium bg-white/30 text-neutral-600 hover:bg-white/50 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {preset.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Apply Button */}
      <GlassButton
        variant="primary"
        fullWidth
        onClick={handleApplyCustomFilter}
        disabled={!startDate || !endDate}
        className="py-4 text-lg mt-4"
      >
        Apply Filter
      </GlassButton>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="flex gap-2 px-1">
          {filters.map((f) => (
            <motion.button
              key={f.value}
              onClick={() => handleFilterClick(f.value)}
              className={`
                relative flex-1 py-2.5 px-3 rounded-xl text-sm font-medium
                transition-colors duration-200
                ${filter === f.value ? 'text-neutral-900' : 'text-neutral-500'}
              `}
              whileTap={{ scale: 0.95 }}
            >
              {filter === f.value && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute inset-0 bg-white/40 border border-white/50 rounded-xl shadow-sm"
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1">
                {f.value === 'custom' && <SlidersHorizontal size={14} />}
                {f.value === 'custom' ? getCustomLabel() : f.label}
              </span>
            </motion.button>
          ))}
        </div>

        <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title="Custom Date Range">
          {formContent}
        </BottomSheet>
      </>
    );
  }

  return (
    <>
      <GlassCard variant="frosted" padding="sm" rounded="xl" className="inline-flex gap-1">
        {filters.map((f) => (
          <motion.button
            key={f.value}
            onClick={() => handleFilterClick(f.value)}
            className={`
              relative py-2 px-5 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${filter === f.value ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}
            `}
            whileTap={{ scale: 0.97 }}
          >
            {filter === f.value && (
              <motion.div
                layoutId="activeFilterDesktop"
                className="absolute inset-0 bg-white/50 border border-white/60 rounded-lg shadow-sm"
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              {f.value === 'custom' && <SlidersHorizontal size={14} />}
              {f.value === 'custom' ? getCustomLabel() : f.label}
            </span>
          </motion.button>
        ))}
      </GlassCard>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Custom Date Range">
        {formContent}
      </Modal>
    </>
  );
}
