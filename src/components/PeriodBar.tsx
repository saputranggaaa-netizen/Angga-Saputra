import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface PeriodBarProps {
  periodLabel: string;
  dateInfo: string;
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const PeriodBar: React.FC<PeriodBarProps> = ({
  periodLabel = 'Oktober 2026',
  dateInfo = 'Data s/d 21/10 · Time gone 67,7%',
  selectedMonth,
  onSelectMonth,
}) => {
  const [mode, setMode] = useState<'current' | 'select'>('current');

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Left: Mode Selection */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">
          PERIODE
        </span>
        <div className="flex items-center gap-2">
          {/* Radio 1: Bulan Berjalan */}
          <button
            type="button"
            onClick={() => {
              setMode('current');
              onSelectMonth('2026-10');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              mode === 'current'
                ? 'bg-blue-50/80 border-blue-400 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                mode === 'current' ? 'border-blue-600 bg-white' : 'border-slate-300'
              }`}
            >
              {mode === 'current' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </span>
            <span>Bulan Berjalan</span>
          </button>

          {/* Radio 2: Pilih Bulan */}
          <button
            type="button"
            onClick={() => setMode('select')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer ${
              mode === 'select'
                ? 'bg-blue-50/80 border-blue-400 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                mode === 'select' ? 'border-blue-600 bg-white' : 'border-slate-300'
              }`}
            >
              {mode === 'select' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
            </span>
            <span>Pilih Bulan</span>
          </button>

          {mode === 'select' && (
            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="ml-2 px-2.5 py-1 text-xs font-medium border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="2026-10">Oktober 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">Agustus 2026</option>
            </select>
          )}
        </div>
      </div>

      {/* Right: Date Info Info */}
      <div className="text-left sm:text-right">
        <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">
          {periodLabel}
        </h4>
        <p className="text-[11px] text-slate-500 font-medium">
          {dateInfo}
        </p>
      </div>
    </div>
  );
};
