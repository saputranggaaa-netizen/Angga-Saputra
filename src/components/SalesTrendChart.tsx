import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, Calendar } from 'lucide-react';
import { SalesRecord } from '../types/sales';
import { formatRupiah, formatNumber } from '../utils/formatters';

interface SalesTrendChartProps {
  records: SalesRecord[];
}

export const SalesTrendChart: React.FC<SalesTrendChartProps> = ({ records }) => {
  const [metric, setMetric] = useState<'revenue' | 'deals'>('revenue');
  const [groupBy, setGroupBy] = useState<'day' | 'month'>('day');
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    revenue: number;
    deals: number;
    x: number;
    y: number;
  } | null>(null);

  // Group records by chosen time dimension
  const trendData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; deals: number }>();

    // Sort chronologically
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((r) => {
      let key = r.date;
      if (groupBy === 'month') {
        key = r.date.substring(0, 7); // YYYY-MM
      }

      if (!map.has(key)) {
        map.set(key, { date: key, revenue: 0, deals: 0 });
      }

      const item = map.get(key)!;
      if (r.status === 'Closed Won') {
        item.revenue += r.totalRevenue;
      }
      item.deals += 1;
    });

    return Array.from(map.values());
  }, [records, groupBy]);

  // SVG Chart Dimensions
  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 70 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = useMemo(() => {
    if (trendData.length === 0) return 100;
    const values = trendData.map((d) => (metric === 'revenue' ? d.revenue : d.deals));
    const highest = Math.max(...values, 0);
    return highest > 0 ? highest * 1.15 : 100;
  }, [trendData, metric]);

  const points = useMemo(() => {
    if (trendData.length === 0) return [];

    return trendData.map((d, index) => {
      const x =
        trendData.length === 1
          ? padding.left + chartWidth / 2
          : padding.left + (index / (trendData.length - 1)) * chartWidth;
      const currentVal = metric === 'revenue' ? d.revenue : d.deals;
      const y = padding.top + chartHeight - (currentVal / maxVal) * chartHeight;
      return { ...d, x, y };
    });
  }, [trendData, metric, maxVal, chartWidth, chartHeight]);

  // Construct SVG Path
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((path, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const bottomY = padding.top + chartHeight;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, points, padding.top, chartHeight]);

  // Y-axis grid ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    value: maxVal * pct,
    y: padding.top + chartHeight - pct * chartHeight,
  }));

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Tren Penjualan & Performa Waktu
          </h3>
          <p className="text-xs text-slate-500">
            Perkembangan omset dan volume transaksi sepanjang periode
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Day vs Month Toggle */}
          <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setGroupBy('day')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                groupBy === 'day' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Harian
            </button>
            <button
              type="button"
              onClick={() => setGroupBy('month')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                groupBy === 'month' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600'
              }`}
            >
              Bulanan
            </button>
          </div>

          {/* Metric Toggle */}
          <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setMetric('revenue')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metric === 'revenue' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
              }`}
            >
              Omzet (IDR)
            </button>
            <button
              type="button"
              onClick={() => setMetric('deals')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                metric === 'deals' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600'
              }`}
            >
              Volume Deals
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div className="relative w-full overflow-hidden">
        {trendData.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
            <BarChart3 className="w-8 h-8 text-slate-300" />
            <span>Tidak ada data untuk rentang waktu ini</span>
          </div>
        ) : (
          <div className="relative w-full aspect-[8/2.8] min-h-[220px]">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y Axis Grid Lines */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={tick.y}
                    x2={width - padding.right}
                    y2={tick.y}
                    stroke="#f1f5f9"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="inherit"
                  >
                    {metric === 'revenue' ? formatRupiah(tick.value, true) : Math.round(tick.value)}
                  </text>
                </g>
              ))}

              {/* Area Fill */}
              <path d={areaPath} fill="url(#revenueGradient)" />

              {/* Trend Line */}
              <path
                d={linePath}
                fill="none"
                stroke="#059669"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((pt, i) => (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.date === pt.date ? 6 : 3.5}
                    fill={hoveredPoint?.date === pt.date ? '#059669' : '#ffffff'}
                    stroke="#059669"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Bottom date label (spaced) */}
                  {(points.length <= 12 || i % Math.ceil(points.length / 8) === 0) && (
                    <text
                      x={pt.x}
                      y={height - 12}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9.5"
                      fontFamily="inherit"
                    >
                      {groupBy === 'month' ? pt.date : pt.date.slice(5)}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
                style={{
                  left: `${(hoveredPoint.x / width) * 100}%`,
                  top: `${(hoveredPoint.y / height) * 100}%`,
                }}
              >
                <div className="bg-slate-900 text-white rounded-xl shadow-xl px-3 py-2 text-xs border border-slate-700 whitespace-nowrap space-y-1">
                  <div className="font-semibold text-slate-300 text-[10px]">
                    {hoveredPoint.date}
                  </div>
                  <div className="font-bold text-emerald-400 text-xs">
                    {formatRupiah(hoveredPoint.revenue)}
                  </div>
                  <div className="text-[10px] text-slate-300">
                    {hoveredPoint.deals} Transaksi tercatat
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
