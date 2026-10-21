import React, { useMemo } from 'react';
import { PieChart, Package, ArrowUpRight } from 'lucide-react';
import { SalesRecord } from '../types/sales';
import { formatRupiah, formatPercent } from '../utils/formatters';

interface ProductCategoryChartsProps {
  records: SalesRecord[];
}

const CATEGORY_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#64748b', // slate
];

export const ProductCategoryCharts: React.FC<ProductCategoryChartsProps> = ({ records }) => {
  // Category breakdown
  const categoryData = useMemo(() => {
    const map = new Map<string, { category: string; revenue: number; count: number }>();
    let totalRevenue = 0;

    records.forEach((r) => {
      const cat = r.category || 'Lainnya';
      if (!map.has(cat)) {
        map.set(cat, { category: cat, revenue: 0, count: 0 });
      }
      const item = map.get(cat)!;
      if (r.status === 'Closed Won') {
        item.revenue += r.totalRevenue;
        totalRevenue += r.totalRevenue;
      }
      item.count += 1;
    });

    const list = Array.from(map.values())
      .map((item, idx) => ({
        ...item,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return { list, totalRevenue };
  }, [records]);

  // Top products
  const topProducts = useMemo(() => {
    const map = new Map<string, { product: string; category: string; revenue: number; units: number }>();

    records.forEach((r) => {
      const prod = r.product || 'Produk';
      if (!map.has(prod)) {
        map.set(prod, { product: prod, category: r.category, revenue: 0, units: 0 });
      }
      const item = map.get(prod)!;
      if (r.status === 'Closed Won') {
        item.revenue += r.totalRevenue;
      }
      item.units += r.quantity;
    });

    return Array.from(map.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [records]);

  const maxProductRevenue = topProducts[0]?.revenue || 1;

  // Donut chart stroke dashes
  let accumulatedPercent = 0;
  const circumference = 2 * Math.PI * 40; // radius = 40

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* 1. Category Revenue Share (Donut) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Distribusi Omzet per Kategori
            </h3>
            <p className="text-xs text-slate-500">
              Porsi kontribusi kategori terhadap total penjualan
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            {formatRupiah(categoryData.totalRevenue, true)}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-2">
          {/* Donut SVG */}
          <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {categoryData.list.map((cat, i) => {
                const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
                accumulatedPercent += cat.percentage;

                return (
                  <circle
                    key={i}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={cat.color}
                    strokeWidth="14"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300 hover:opacity-85"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Kategori</span>
              <span className="text-sm font-extrabold text-slate-800">{categoryData.list.length}</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 w-full space-y-2">
            {categoryData.list.slice(0, 5).map((cat, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate pr-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="font-medium text-slate-700 truncate">{cat.category}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-extrabold text-slate-900">{formatPercent(cat.percentage)}</span>
                  <span className="text-[10px] text-slate-400 block">{formatRupiah(cat.revenue, true)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top Selling Products */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Produk Terlaris (Top Revenue)
            </h3>
            <p className="text-xs text-slate-500">
              5 produk penghasil omset terbesar
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">Tidak ada data produk</p>
          ) : (
            topProducts.map((prod, idx) => {
              const pct = (prod.revenue / maxProductRevenue) * 100;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[240px]">
                      {idx + 1}. {prod.product}
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      {formatRupiah(prod.revenue, true)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{prod.category}</span>
                    <span>{prod.units} unit terjual</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
