import React from 'react';
import { Award, Target, CheckCircle2, ChevronRight, TrendingUp, AlertCircle } from 'lucide-react';
import { SalesRepStats } from '../types/sales';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface SalesRepLeaderboardProps {
  stats: SalesRepStats[];
  selectedRep: string;
  onSelectRep: (repName: string) => void;
}

export const SalesRepLeaderboard: React.FC<SalesRepLeaderboardProps> = ({
  stats,
  selectedRep,
  onSelectRep,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Klasemen Performa Tim Sales (Leaderboard)
          </h3>
          <p className="text-xs text-slate-500">
            Peringkat pencapaian target dan omset per perwakilan sales
          </p>
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          {stats.length} Sales Person
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {stats.map((rep) => {
          const isSelected = selectedRep === rep.name;
          const isTop3 = rep.rank <= 3;
          const isMet = rep.achievementRate >= 100;

          return (
            <div
              key={rep.name}
              onClick={() => onSelectRep(isSelected ? 'all' : rep.name)}
              className={`py-3.5 px-3 -mx-3 rounded-xl transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                isSelected
                  ? 'bg-emerald-50/80 border border-emerald-300 ring-2 ring-emerald-400/20 shadow-2xs'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              {/* Left: Rank, Avatar & Name */}
              <div className="flex items-center gap-3 min-w-[200px]">
                {/* Rank Badge */}
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-2xs shrink-0 ${
                    rep.rank === 1
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 border border-amber-300'
                      : rep.rank === 2
                      ? 'bg-gradient-to-tr from-slate-300 to-slate-100 text-slate-800 border border-slate-300'
                      : rep.rank === 3
                      ? 'bg-gradient-to-tr from-amber-700/80 to-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  #{rep.rank}
                </div>

                {/* Avatar */}
                {rep.avatar ? (
                  <img
                    src={rep.avatar}
                    alt={rep.name}
                    className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold text-xs flex items-center justify-center">
                    {rep.name.substring(0, 2).toUpperCase()}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{rep.name}</h4>
                    {isTop3 && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-sm">
                        TOP {rep.rank}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {rep.dealsWon} deal berhasil ({formatPercent(rep.winRate)} win rate)
                  </p>
                </div>
              </div>

              {/* Middle: Target Progress Bar */}
              <div className="flex-1 max-w-sm space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Pencapaian Target</span>
                  <span
                    className={`text-[11px] font-extrabold ${
                      isMet ? 'text-emerald-700' : 'text-slate-800'
                    }`}
                  >
                    {formatPercent(rep.achievementRate)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rep.achievementRate >= 100
                        ? 'bg-emerald-500'
                        : rep.achievementRate >= 75
                        ? 'bg-blue-600'
                        : rep.achievementRate >= 50
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(rep.achievementRate, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Realisasi: {formatRupiah(rep.totalRevenue, true)}</span>
                  <span>Target: {formatRupiah(rep.totalTarget, true)}</span>
                </div>
              </div>

              {/* Right: Revenue & Action */}
              <div className="flex items-center justify-between md:justify-end gap-3 min-w-[170px]">
                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 block">
                    {formatRupiah(rep.totalRevenue)}
                  </span>
                  <span
                    className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isMet
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isMet ? 'Target Terpenuhi' : 'On Going'}
                  </span>
                </div>

                <div
                  className={`p-1.5 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
                  title={isSelected ? 'Hapus filter sales ini' : 'Klik untuk filter data sales ini'}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
