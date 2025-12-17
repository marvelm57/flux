// Currency formatting utility for Indonesian Rupiah (IDR)

export const WEEKLY_LIMIT = 1000000; // Rp 1,000,000 weekly limit

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatIDRCompact(amount: number): string {
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)}rb`;
  }
  return formatIDR(amount);
}

export function getWeeklyLimitStatus(weeklyTotal: number): {
  percentage: number;
  remaining: number;
  isWarning: boolean;
  isExceeded: boolean;
  message: string;
} {
  const percentage = (weeklyTotal / WEEKLY_LIMIT) * 100;
  const remaining = WEEKLY_LIMIT - weeklyTotal;
  const isWarning = percentage >= 80 && percentage < 100;
  const isExceeded = percentage >= 100;

  let message = '';
  if (isExceeded) {
    message = `Weekly limit exceeded by ${formatIDR(Math.abs(remaining))}`;
  } else if (isWarning) {
    message = `Warning: ${formatIDR(remaining)} remaining this week`;
  } else {
    message = `${formatIDR(remaining)} remaining this week`;
  }

  return {
    percentage: Math.min(percentage, 100),
    remaining,
    isWarning,
    isExceeded,
    message,
  };
}
