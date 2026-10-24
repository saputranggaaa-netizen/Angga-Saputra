"use client";

import React, { useState, useEffect } from "react";

// Struktur data retail Digiplus
interface StoreSummary {
  storeName: string;
  target: number;
  actual: number;
  achievement: number;
  devicesApple: number;
  devicesAndroid: number;
  accessories: number;
  vasQoala: number;
}

interface StaffRank {
  rank: number;
  name: string;
  totalSales: number;
  qty: number;
  invoices: number;
  atv: number;
  insentif: number;
}

export default function DigiplusDashboard() {
  const [loading, setLoading] = useState(false);

  // Data master dari spreadsheet QF01 (Grand Indonesia / Oktober 2026)
  const [summary] = useState<StoreSummary>({
    storeName: "QF01 - DIGIPLUS GRAND INDONESIA",
    target: 8720000000,
    actual: 3105420000,
    achievement: 35.6,
    devicesApple: 1850000000,
    devicesAndroid: 620000000,
    accessories: 415420000,
    vasQoala: 220000000,
  });

  const [leaderboard] = useState<StaffRank[]>([
    { rank: 1, name: "Yunita Anggraini", totalSales: 892400000, qty: 74, invoices: 52, atv: 17161538, insentif: 1250000 },
    { rank: 2, name: "Andrian Afi Syarfuan", totalSales: 745300000, qty: 58, invoices: 41, atv: 18178048, insentif: 980000 },
    { rank: 3, name: "M. Adlii", totalSales: 540200000, qty: 45, invoices: 36, atv: 15005555, insentif: 720000 },
    { rank: 4, name: "Bagas T Saputra", totalSales: 412500000, qty: 38, invoices: 29, atv: 14224137, insentif: 540000 },
    { rank: 5, name: "Siti Amelia", totalSales: 315020000, qty: 32, invoices: 24, atv: 13125833, insentif: 430000 },
    { rank: 6, name: "Surya Adi Permana", totalSales: 200000000, qty: 22, invoices: 18, atv: 11111111, insentif: 280000 },
  ]);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans pb-12">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800 bg-[#0f172a]/70 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-wrap justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400">
            D+
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-wide">{summary.storeName}</h1>
            <p className="text-xs text-slate-400">Retail Sales Performance Engine • Live Sync</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Oktober 2026
          </span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales MTD</span>
            <div className="text-2xl font-extrabold text-white mt-2">{formatRupiah(summary.actual)}</div>
            <div className="mt-2 text-xs text-slate-400 flex justify-between">
              <span>Target:</span>
              <span className="text-amber-400 font-semibold">{formatRupiah(summary.target)}</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Achievement</span>
            <div className="text-2xl font-extrabold text-emerald-400 mt-2">{summary.achievement}%</div>
            <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${summary.achievement}%` }}></div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Apple Ecosystem</span>
            <div className="text-2xl font-extrabold text-sky-400 mt-2">{formatRupiah(summary.devicesApple)}</div>
            <p className="mt-2 text-xs text-slate-400">iPhone 17 Pro, iPad, Mac & AirPods</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800 shadow-lg">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Android & Multi-brand</span>
            <div className="text-2xl font-extrabold text-indigo-400 mt-2">{formatRupiah(summary.devicesAndroid)}</div>
            <p className="mt-2 text-xs text-slate-400">Galaxy S26 Ultra, Fold 8 & A-Series</p>
          </div>
        </div>

        {/* Category Contribution */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">Accessories Revenue</span>
              <span className="text-sm font-bold text-amber-400">{formatRupiah(summary.accessories)}</span>
            </div>
            <p className="text-xs text-slate-400">Charger, MagSafe Case, Tempered Glass, TWS Audio</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131b2e] border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-semibold text-slate-300">VAS (Proteksi Qoala)</span>
              <span className="text-sm font-bold text-violet-400">{formatRupiah(summary.vasQoala)}</span>
            </div>
            <p className="text-xs text-slate-400">Device Protection Extended Warranty</p>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-[#131b2e] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="text-base font-bold text-white tracking-wide">🏆 Staff Sales Leaderboard & Productivity</h2>
            <span className="text-xs text-slate-400">Diurutkan berdasarkan Omset</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f172a] text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Nama Staff</th>
                  <th className="py-4 px-6 text-right">Total Penjualan</th>
                  <th className="py-4 px-6 text-center">Qty</th>
                  <th className="py-4 px-6 text-center">Struk</th>
                  <th className="py-4 px-6 text-right">ATV (Avg Basket)</th>
                  <th className="py-4 px-6 text-right">Est. Insentif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {leaderboard.map((item) => (
                  <tr key={item.rank} className="hover:bg-slate-800/30 transition">
                    <td className="py-4 px-6">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs font-bold ${
                        item.rank === 1 ? "bg-amber-400 text-slate-950" :
                        item.rank === 2 ? "bg-slate-300 text-slate-950" :
                        item.rank === 3 ? "bg-amber-700 text-white" : "text-slate-400"
                      }`}>
                        {item.rank}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">{item.name}</td>
                    <td className="py-4 px-6 text-right text-emerald-400 font-bold">{formatRupiah(item.totalSales)}</td>
                    <td className="py-4 px-6 text-center text-slate-300">{item.qty}</td>
                    <td className="py-4 px-6 text-center text-slate-300">{item.invoices}</td>
                    <td className="py-4 px-6 text-right text-slate-400">{formatRupiah(item.atv)}</td>
                    <td className="py-4 px-6 text-right text-amber-300 font-bold">{formatRupiah(item.insentif)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
