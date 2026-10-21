import React from 'react';
import { StoreOverviewData, LobPerformance } from '../types/storeSales';
import { formatRupiah, formatNumber } from '../utils/formatters';

interface StorePerformanceSectionProps {
  data: StoreOverviewData;
  onSelectLob?: (lobId: string) => void;
}

export const StorePerformanceSection: React.FC<StorePerformanceSectionProps> = ({
  data,
  onSelectLob,
}) => {
  const isTargetAchieved = data.achievementPercent >= 100;

  return (
    <section className="space-y-4">
      {/* Title & Subtitle */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          Store Performance
        </h2>
        <p className="text-xs text-slate-500">
          Actual vs target bulan terpilih.
        </p>
      </div>

      {/* Hero Card: TOTAL SALES */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-3.5 hover:shadow-xs transition-shadow">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
          TOTAL SALES
        </span>

        {/* Big Amount */}
        <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight font-sans">
          {formatRupiah(data.totalSales)}
        </div>

        {/* Row 1: Target vs Achievement */}
        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 font-medium">
            Target {formatRupiah(data.totalTarget)}
          </span>
          <span className={`font-extrabold flex items-center gap-1 ${
            isTargetAchieved ? 'text-slate-900' : 'text-rose-600'
          }`}>
            <span>{isTargetAchieved ? '▲' : '▼'}</span>
            <span>{data.achievementPercent}%</span>
          </span>
        </div>

        {/* Row 2: Estimation vs Points */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-600 font-semibold">
            Est. {formatRupiah(data.estSales)} ({data.estPercent}%)
          </span>
          <span className="text-slate-800 font-bold">
            {formatNumber(data.totalPoints)}/{data.maxPoints} pts
          </span>
        </div>

        {/* Row 3: Variance */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
          <span className="text-slate-500 font-medium">Variance</span>
          <span className={`font-bold ${
            data.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {data.variance >= 0 ? '' : '-'}
            {formatRupiah(Math.abs(data.variance))}
          </span>
        </div>
      </div>

      {/* 4 LOB Category Cards: APPLE, ANDROID, ACCESSORIES, VAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.lobs.map((lob) => {
          const isLobAchieved = lob.achievementPercent >= 100;
          return (
            <div
              key={lob.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 sm:p-5 flex flex-col justify-between space-y-3 hover:shadow-xs transition-shadow"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  {lob.name}
                </span>

                <div className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight font-sans">
                  {formatRupiah(lob.currentSales)}
                </div>

                {/* Target & Achievement */}
                <div className="flex items-center justify-between text-xs mt-2.5">
                  <span className="text-slate-500 font-medium truncate max-w-[140px]" title={`Target ${formatRupiah(lob.target)}`}>
                    Target {formatRupiah(lob.target)}
                  </span>
                  <span className={`font-extrabold shrink-0 flex items-center gap-0.5 ${
                    isLobAchieved ? 'text-slate-900' : 'text-rose-600'
                  }`}>
                    <span>{isLobAchieved ? '▲' : '▼'}</span>
                    <span>{lob.achievementPercent}%</span>
                  </span>
                </div>

                {/* Estimation & Points */}
                <div className="flex items-center justify-between text-xs mt-1.5">
                  <span className="text-blue-600 font-semibold truncate max-w-[150px]">
                    Est. {formatRupiah(lob.estSales)} ({lob.estPercent}%)
                  </span>
                  <span className="text-slate-800 font-bold shrink-0">
                    {formatNumber(lob.points)}/{lob.maxPoints} pts
                  </span>
                </div>

                {/* Variance */}
                <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-100">
                  <span className="text-slate-500 font-medium">Variance</span>
                  <span className={`font-bold ${
                    lob.variance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {lob.variance >= 0 ? '' : '-'}
                    {formatRupiah(Math.abs(lob.variance))}
                  </span>
                </div>
              </div>

              {/* Action Link: Klik untuk rincian */}
              <button
                type="button"
                onClick={() => onSelectLob && onSelectLob(lob.id)}
                className="text-left text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline pt-1 transition-colors cursor-pointer"
              >
                Klik untuk rincian &rsaquo;
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
