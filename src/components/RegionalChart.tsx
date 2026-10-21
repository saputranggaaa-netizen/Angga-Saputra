import React, { useMemo } from 'react';
import { MapPin, TrendingUp } from 'lucide-react';
import { SalesRecord } from '../types/sales';
import { formatRupiah, formatNumber } from '../utils/formatters';

interface RegionalChartProps {
  records: SalesRecord[];
}

export const RegionalChart: React.FC<RegionalChartProps> = ({ records }) => {
  const regionalData = useMemo(() => {
    const map = new Map<string, { region: string; revenue: number; deals: number }>();

    records.forEach((r) => {
      const reg = r.region || 'Nasional';
      if (!map.has(reg)) {
        map.set(reg, { region: reg, revenue: 0, deals: 0 });
      }
      const item = map.get(reg)!;
      if (r.status === 'Closed Won') {
        item.revenue += r.totalRevenue;
      }
      item.deals += 1;
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue);
  }, [records]);

  const maxRevenue = regionalData[0]?.revenue || 1;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Performa Penjualan per Wilayah / Cabang
          </h3>
          <p className="text-xs text-slate-500">
            Perbandingan omset dan jumlah transaksi berdasarkan area
          </p>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {regionalData.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">Tidak ada data wilayah</p>
        ) : (
          regionalData.map((reg, idx) => {
            const pct = (reg.revenue / maxRevenue) * 100;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {reg.region}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {formatNumber(reg.deals)} Transaksi
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {formatRupiah(reg.revenue, true)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
