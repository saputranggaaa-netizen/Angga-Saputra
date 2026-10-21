import React, { useState } from 'react';
import { StoreOverviewData, StaffPerformanceRecord } from '../types/storeSales';
import { formatRupiah, formatNumber, formatPercent } from '../utils/formatters';
import { Users, Award, ChevronDown, ChevronUp, CheckCircle2, AlertCircle } from 'lucide-react';

interface TeamPerformanceSectionProps {
  data: StoreOverviewData;
  onSelectStaff?: (staffName: string) => void;
}

export const TeamPerformanceSection: React.FC<TeamPerformanceSectionProps> = ({
  data,
  onSelectStaff,
}) => {
  const [showStaffTable, setShowStaffTable] = useState(true);

  const kpis = [
    { label: 'Total Staff', value: String(data.totalStaff), sublabel: 'Aktif di toko' },
    { label: 'Productive', value: String(data.productiveStaff), color: 'text-emerald-600', sublabel: 'Capai target' },
    { label: 'Need Push', value: String(data.needPushStaff), color: 'text-amber-600', sublabel: 'Perlu dorongan' },
    { label: 'Total Transaction', value: formatNumber(data.totalTransactions), sublabel: 'Struk transaksi' },
    { label: 'Avg UPT', value: String(data.avgUpt), sublabel: 'Unit / transaksi' },
    { label: 'Avg ATV', value: formatRupiah(data.avgAtv), isCurrency: true, sublabel: 'Rata-rata belanja' },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Team Performance
          </h2>
          <p className="text-xs text-slate-500">
            Metrik produktivitas staf penjualan toko
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowStaffTable(!showStaffTable)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
        >
          <span>{showStaffTable ? 'Sembunyikan Rincian Staf' : 'Lihat Rincian Staf'}</span>
          {showStaffTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* 6 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-1 hover:shadow-xs transition-shadow"
          >
            <span className="text-[11px] font-semibold text-slate-500 block truncate" title={kpi.label}>
              {kpi.label}
            </span>
            <div
              className={`text-lg sm:text-xl font-extrabold tracking-tight truncate ${
                kpi.color || 'text-slate-900'
              }`}
              title={kpi.value}
            >
              {kpi.value}
            </div>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              {kpi.sublabel}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Staff Performance Table */}
      {showStaffTable && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between text-xs pb-1">
            <span className="font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Klasemen & Evaluasi Staf Sales ({data.staffList.length} orang)
            </span>
            <span className="text-[11px] text-slate-400">
              Target individual toko periode Oktober 2026
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="p-3 whitespace-nowrap">Nama Staf</th>
                  <th className="p-3 whitespace-nowrap">Peran / Posisi</th>
                  <th className="p-3 whitespace-nowrap text-right">Penjualan Aktual</th>
                  <th className="p-3 whitespace-nowrap text-right">Target</th>
                  <th className="p-3 whitespace-nowrap text-center">Pencapaian</th>
                  <th className="p-3 whitespace-nowrap text-center">UPT</th>
                  <th className="p-3 whitespace-nowrap text-right">ATV</th>
                  <th className="p-3 whitespace-nowrap text-center">Poin (pts)</th>
                  <th className="p-3 whitespace-nowrap text-center">Status</th>
                  <th className="p-3 whitespace-nowrap text-right">Est. Insentif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {data.staffList.map((staff, i) => {
                  const isProd = staff.status === 'Productive';
                  return (
                    <tr
                      key={staff.id}
                      onClick={() => onSelectStaff && onSelectStaff(staff.name)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="p-3 whitespace-nowrap font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span>{staff.name}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-slate-500 text-[11px]">
                        {staff.role}
                      </td>
                      <td className="p-3 whitespace-nowrap text-right font-extrabold text-slate-900 font-mono">
                        {formatRupiah(staff.totalSales)}
                      </td>
                      <td className="p-3 whitespace-nowrap text-right text-slate-500 font-mono">
                        {formatRupiah(staff.target)}
                      </td>
                      <td className="p-3 whitespace-nowrap text-center">
                        <span
                          className={`font-extrabold font-mono ${
                            staff.achievementPercent >= 100
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {staff.achievementPercent}%
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-center font-mono">
                        {staff.upt}
                      </td>
                      <td className="p-3 whitespace-nowrap text-right font-mono text-slate-700">
                        {formatRupiah(staff.atv, true)}
                      </td>
                      <td className="p-3 whitespace-nowrap text-center font-bold text-slate-800">
                        {staff.points} pts
                      </td>
                      <td className="p-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isProd
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isProd ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                          {staff.status}
                        </span>
                      </td>
                      <td className="p-3 whitespace-nowrap text-right font-bold text-emerald-700 font-mono">
                        {formatRupiah(staff.estIncentive)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
};
