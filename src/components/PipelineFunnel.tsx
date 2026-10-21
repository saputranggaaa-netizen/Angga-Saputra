import React, { useMemo } from 'react';
import { GitCommit, CheckCircle2, XCircle, Clock, FileText, ArrowRight } from 'lucide-react';
import { SalesRecord } from '../types/sales';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface PipelineFunnelProps {
  records: SalesRecord[];
}

const STAGES: Array<{
  status: SalesRecord['status'];
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: any;
}> = [
  {
    status: 'Lead',
    label: 'Lead / Prospek',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: Clock,
  },
  {
    status: 'Proposal',
    label: 'Proposal / Penawaran',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: FileText,
  },
  {
    status: 'Negotiation',
    label: 'Negosiasi Akhir',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: GitCommit,
  },
  {
    status: 'Closed Won',
    label: 'Deal Berhasil (Won)',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: CheckCircle2,
  },
];

export const PipelineFunnel: React.FC<PipelineFunnelProps> = ({ records }) => {
  const stageStats = useMemo(() => {
    const totalDeals = records.length || 1;
    const stageMap = new Map<string, { count: number; totalValue: number }>();

    records.forEach((r) => {
      const s = r.status;
      if (!stageMap.has(s)) {
        stageMap.set(s, { count: 0, totalValue: 0 });
      }
      const item = stageMap.get(s)!;
      item.count += 1;
      item.totalValue += r.totalRevenue;
    });

    const lostItem = stageMap.get('Closed Lost') || { count: 0, totalValue: 0 };

    const stagesData = STAGES.map((st) => {
      const data = stageMap.get(st.status) || { count: 0, totalValue: 0 };
      const pct = (data.count / totalDeals) * 100;
      return {
        ...st,
        count: data.count,
        totalValue: data.totalValue,
        percentage: pct,
      };
    });

    return { stagesData, lostItem, totalDeals };
  }, [records]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-emerald-600" />
            Corong Pipeline Penjualan (Sales Pipeline)
          </h3>
          <p className="text-xs text-slate-500">
            Sebaran tahap transaksi dan potensi nilai di setiap fase
          </p>
        </div>
      </div>

      {/* Funnel Stages Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {stageStats.stagesData.map((stage, idx) => {
          const Icon = stage.icon;
          return (
            <div
              key={stage.status}
              className={`p-3.5 rounded-xl border ${stage.borderColor} ${stage.bgColor} space-y-2 relative overflow-hidden`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${stage.color} flex items-center gap-1.5`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {stage.label}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-white/80 text-slate-700">
                  {stage.count} Deal
                </span>
              </div>

              <div>
                <span className="text-sm font-extrabold text-slate-900 block truncate" title={formatRupiah(stage.totalValue)}>
                  {formatRupiah(stage.totalValue, true)}
                </span>
                <span className="text-[10px] text-slate-500">
                  {formatPercent(stage.percentage)} dari total pipeline
                </span>
              </div>

              <div className="w-full bg-black/5 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-current h-full rounded-full opacity-60"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Closed Lost Callout */}
      {stageStats.lostItem.count > 0 && (
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          <div className="flex items-center gap-2 text-rose-700 font-semibold">
            <XCircle className="w-4 h-4 text-rose-500" />
            <span>Closed Lost (Tidak Berhasil):</span>
            <span className="text-slate-600 font-normal">
              {stageStats.lostItem.count} transaksi ({formatRupiah(stageStats.lostItem.totalValue, true)})
            </span>
          </div>
          <span className="text-[11px] text-slate-400">
            Evaluasi berkala alasan penolakan klien
          </span>
        </div>
      )}
    </div>
  );
};
