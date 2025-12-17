'use client';

import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { GlassCard } from '../ui/GlassComponents';
import { getCategoryById } from '@/lib/categories';
import { formatIDR, formatIDRCompact } from '@/lib/budget';

interface TooltipPayload {
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <GlassCard variant="dark" padding="sm" rounded="lg" className="text-white">
        <p className="text-xs text-neutral-400">{label}</p>
        <p className="font-semibold">{formatIDR(payload[0].value)}</p>
      </GlassCard>
    );
  }
  return null;
}

interface ExpenseChartProps {
  expensesByDate: Record<string, number>;
  expensesByCategory: Record<string, number>;
  totalExpenses: number;
  isMobile: boolean;
}

// Monochrome color palette
const MONOCHROME_COLORS = [
  '#171717',
  '#404040',
  '#525252',
  '#737373',
  '#a3a3a3',
  '#d4d4d4',
  '#e5e5e5',
];

export function ExpenseChart({
  expensesByDate,
  expensesByCategory,
  totalExpenses,
  isMobile,
}: ExpenseChartProps) {
  // Prepare data for charts
  const dateData = Object.entries(expensesByDate)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const categoryData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      name: getCategoryById(category).name,
      amount,
      percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  if (isMobile) {
    // Mobile: Simplified horizontal bar chart
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard variant="light" padding="md" rounded="2xl">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">Spending by Category</h3>
          
          {categoryData.length === 0 ? (
            <p className="text-neutral-400 text-center py-8">No data to display</p>
          ) : (
            <div className="space-y-3">
              {categoryData.slice(0, 5).map((item, index) => {
                const category = getCategoryById(item.category);
                const CategoryIcon = category.icon;
                const widthPercentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;

                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <CategoryIcon size={14} className="text-neutral-600" />
                        <span className="text-sm text-neutral-700">{item.name.split(' ')[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-800">
                        {formatIDRCompact(item.amount)}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-200/50 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPercentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </motion.div>
    );
  }

  // Desktop: Area chart and pie chart
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Spending Over Time */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GlassCard variant="light" padding="lg" rounded="2xl">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">Spending Over Time</h3>
          
          {dateData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-neutral-400">
              No data to display
            </div>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dateData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#171717" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#171717" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#a3a3a3', fontSize: 11 }}
                    tickFormatter={(value) => formatIDRCompact(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#171717"
                    strokeWidth={2}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </motion.div>

      {/* Category Breakdown */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <GlassCard variant="light" padding="lg" rounded="2xl">
          <h3 className="text-sm font-medium text-neutral-500 mb-4">Category Breakdown</h3>
          
          {categoryData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-neutral-400">
              No data to display
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-32 h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={55}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={entry.category}
                          fill={MONOCHROME_COLORS[index % MONOCHROME_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {categoryData.slice(0, 4).map((item, index) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: MONOCHROME_COLORS[index % MONOCHROME_COLORS.length] }}
                    />
                    <span className="text-sm text-neutral-600 flex-1 truncate">
                      {item.name}
                    </span>
                    <span className="text-sm font-medium text-neutral-800">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
