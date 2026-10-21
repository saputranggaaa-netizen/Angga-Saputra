import React from 'react';
import {
  Banknote,
  Target,
  ShoppingCart,
  TrendingUp,
  Award,
  Percent,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { formatRupiah, formatPercent, formatNumber } from '../utils/formatters';
import { PeriodComparison } from '../types/sales';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface KpiCardsProps {
  totalRevenue: number;
  totalTarget: number;
  totalTransactions: number;
  totalUnits: number;
  averageOrderValue: number;
  winRate: number;
  topRepName: string;
  topRepRevenue: number;
  periodComparison?: PeriodComparison;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalRevenue,
  totalTarget,
  totalTransactions,
  totalUnits,
  averageOrderValue,
  winRate,
  topRepName,
  topRepRevenue,
  periodComparison,
}) => {
  const achievementRate = totalTarget > 0 ? (totalRevenue / totalTarget) * 100 : 0;
  const isTargetMet = achievementRate >= 100;
  const gap = totalTarget - totalRevenue;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Total Revenue / Omset */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Total Omzet Penjualan</span>
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Banknote className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight truncate" title={formatRupiah(totalRevenue)}>
            {formatRupiah(totalRevenue, true)}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          {periodComparison ? (
            <>
              <span className="text-slate-400 truncate max-w-[85px]">{periodComparison.label.split('vs')[0]}</span>
              <span
                className={`font-bold flex items-center gap-0.5 ${
                  periodComparison.isRevenueNeutral
                    ? 'text-slate-600'
                    : periodComparison.isRevenueUp
                    ? 'text-emerald-600'
                    : 'text-rose-600'
                }`}
                title={`Periode lalu: ${formatRupiah(periodComparison.previousRevenue)}`}
              >
                {periodComparison.isRevenueUp ? '+' : ''}
                {formatPercent(Math.abs(periodComparison.revenueChangePercent))}
                {periodComparison.isRevenueUp ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-400">Total terhitung</span>
              <span className="font-semibold text-emerald-600">Terverifikasi</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Target Achievement */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Target & Realisasi</span>
          <div className={`p-2 rounded-xl ${isTargetMet ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {formatPercent(achievementRate)}
            </h3>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              isTargetMet ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {isTargetMet ? 'Capai Target' : `${formatPercent(100 - achievementRate)} Lagi`}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isTargetMet ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(achievementRate, 100)}%` }}
            />
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Target:</span>
          <span className="font-semibold text-slate-700">{formatRupiah(totalTarget, true)}</span>
        </div>
      </div>

      {/* 3. Total Transactions & Units */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Transaksi & Qty</span>
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <ShoppingCart className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {formatNumber(totalTransactions)} <span className="text-xs font-semibold text-slate-500">Deal</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {formatNumber(totalUnits)} unit barang/layanan
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Rasio per deal</span>
          <span className="font-semibold text-slate-700">
            {totalTransactions > 0 ? (totalUnits / totalTransactions).toFixed(1) : 0} unit
          </span>
        </div>
      </div>

      {/* 4. Average Order Value (AOV) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Rata-rata Nilai Deal (AOV)</span>
          <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight truncate" title={formatRupiah(averageOrderValue)}>
            {formatRupiah(averageOrderValue, true)}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Nilai rata-rata per transaksi
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Efisiensi</span>
          <span className="font-semibold text-teal-700">Skala Enterprise</span>
        </div>
      </div>

      {/* 5. Win Rate */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500">Tingkat Closing (Win Rate)</span>
          <div className="p-2 bg-violet-100 text-violet-700 rounded-xl">
            <Percent className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {formatPercent(winRate)}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            Dari seluruh prospek yang masuk
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Performa</span>
          <span className="font-semibold text-violet-700">
            {winRate >= 70 ? 'Sangat Baik' : winRate >= 50 ? 'Stabil' : 'Perlu Evaluasi'}
          </span>
        </div>
      </div>

      {/* 6. Top Sales Representative */}
      <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white rounded-2xl p-4 border border-amber-200/80 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-amber-900">Top Sales Person</span>
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-xs">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight truncate" title={topRepName}>
            {topRepName || '-'}
          </h3>
          <p className="text-[11px] font-bold text-amber-700">
            {formatRupiah(topRepRevenue, true)}
          </p>
        </div>
        <div className="mt-3 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">MVP Bulan Ini</span>
          <span className="font-bold text-amber-600">Peringkat #1</span>
        </div>
      </div>
    </div>
  );
};
