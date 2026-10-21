import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus, TrendingUp, TrendingDown } from 'lucide-react';
import { PeriodComparison } from '../types/sales';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface PeriodComparisonIndicatorProps {
  comparison: PeriodComparison;
  compact?: boolean;
  className?: string;
}

export const PeriodComparisonIndicator: React.FC<PeriodComparisonIndicatorProps> = ({
  comparison,
  compact = false,
  className = '',
}) => {
  const {
    label,
    periodName,
    comparisonPeriodName,
    currentRevenue,
    previousRevenue,
    revenueChangePercent,
    isRevenueUp,
    isRevenueNeutral,
  } = comparison;

  const isUp = isRevenueUp && !isRevenueNeutral;
  const isDown = !isRevenueUp && !isRevenueNeutral;

  // Color classes
  const badgeColors = isRevenueNeutral
    ? 'bg-slate-100 text-slate-700 border-slate-200'
    : isUp
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80 ring-1 ring-emerald-500/20'
    : 'bg-rose-50 text-rose-800 border-rose-200/80 ring-1 ring-rose-500/20';

  const arrowColor = isRevenueNeutral
    ? 'text-slate-500'
    : isUp
    ? 'text-emerald-600'
    : 'text-rose-600';

  const sign = isRevenueNeutral ? '' : isUp ? '+' : '';

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold shadow-2xs transition-all ${badgeColors} ${className}`}
        title={`${label}: ${formatRupiah(currentRevenue)} (${periodName}) vs ${formatRupiah(previousRevenue)} (${comparisonPeriodName})`}
      >
        <span className="text-[11px] font-bold text-slate-600 hidden md:inline">
          {label}:
        </span>
        <span className="font-mono font-extrabold flex items-center gap-0.5">
          {sign}
          {formatPercent(Math.abs(revenueChangePercent))}
          {isRevenueNeutral ? (
            <Minus className="w-3.5 h-3.5 text-slate-400" />
          ) : isUp ? (
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs shadow-2xs ${badgeColors} ${className}`}
    >
      <div className="flex items-center gap-1 font-bold">
        {isRevenueNeutral ? (
          <Minus className="w-4 h-4 text-slate-400" />
        ) : isUp ? (
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        ) : (
          <TrendingDown className="w-4 h-4 text-rose-600" />
        )}
        <span>{label}</span>
      </div>

      <div className="flex items-center gap-1 pl-1 border-l border-current/20 font-mono font-extrabold">
        <span>
          {sign}
          {formatPercent(Math.abs(revenueChangePercent))}
        </span>
        {isUp ? (
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
        ) : isDown ? (
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 stroke-[2.5]" />
        ) : null}
      </div>

      <div className="hidden xl:flex items-center gap-1 text-[10px] opacity-75 font-medium">
        <span>({formatRupiah(currentRevenue, true)} vs {formatRupiah(previousRevenue, true)})</span>
      </div>
    </div>
  );
};
