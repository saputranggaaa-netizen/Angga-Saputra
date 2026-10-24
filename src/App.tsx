"use client";

import React, { useState, useMemo } from "react";

// Tipe Data
type MenuTab = "home" | "sales-detail" | "leaderboard" | "product-focus" | "payment";

interface TransactionItem {
  id: string;
  date: string;
  salesName: string;
  invoice: string;
  sapArticle: string;
  sapDescription: string;
  brand: string;
  category: "DEVICES" | "ACCESSORIES" | "VAS";
  qty: number;
  amount: number;
  productFocus?: string;
  insentifApple: number;
  insentifAndroid: number;
  insentif3rdParty: number;
  insentifQoala: number;
}

// Master Sample Data Transaksi Riil dari Sheet "DATABASE" QF01
const RAW_DATABASE: TransactionItem[] = [
  { id: "1", date: "01/10/2026", salesName: "Mia Noviyanti", invoice: "100012203", sapArticle: "NOXC20111", sapDescription: "20W CHARGER WHITE", brand: "NODX", category: "ACCESSORIES", qty: 1, amount: 199000, insentifApple: 0, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "2", date: "01/10/2026", salesName: "Yunita Anggraini", invoice: "100012205", sapArticle: "APPMD3J4ZA/A", sapDescription: "20W USB-C POWER ADAPTER", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 549000, insentifApple: 0, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "3", date: "01/10/2026", salesName: "Andrian Afi Syarfuan", invoice: "100012201", sapArticle: "APPMFYM4ID/A", sapDescription: "IPHONE 17 PRO MAX 256GB SILVER", brand: "APPLE", category: "DEVICES", qty: 1, amount: 24999000, productFocus: "iPhone 17 PM", insentifApple: 15000, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "4", date: "01/10/2026", salesName: "Andrian Afi Syarfuan", invoice: "100012201", sapArticle: "KLADIAMOND(24-25)", sapDescription: "PROTEKSI DIAMOND 24-25", brand: "QOALA", category: "VAS", qty: 1, amount: 1970000, insentifApple: 0, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 25000 },
  { id: "5", date: "01/10/2026", salesName: "Surya Adi Permana", invoice: "100012204", sapArticle: "SSUSM-A075FLVDXID", sapDescription: "GALAXY A07 4/64GB LIGHT VIOLET", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2299000, insentifApple: 0, insentifAndroid: 10000, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "6", date: "01/10/2026", salesName: "Siti Amelia", invoice: "100012201", sapArticle: "APPMXP63ID/A", sapDescription: "AIRPODS 4", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 2099000, insentifApple: 0, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "7", date: "01/10/2026", salesName: "Siti Amelia", invoice: "100012201", sapArticle: "MUUM-IP17PM-ICM-CL", sapDescription: "IP17 PRO MAX ICE MGSF CLR", brand: "MUTUALL", category: "ACCESSORIES", qty: 1, amount: 549000, insentifApple: 0, insentifAndroid: 0, insentif3rdParty: 30000, insentifQoala: 0 },
  { id: "8", date: "02/10/2026", salesName: "Yunita Anggraini", invoice: "100012206", sapArticle: "SSUSM-S948BZVBXID", sapDescription: "GALAXY S26 ULTRA 12/256GB COBALT", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 21760000, productFocus: "S26 ULTRA", insentifApple: 0, insentifAndroid: 30000, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "9", date: "02/10/2026", salesName: "Yunita Anggraini", invoice: "100012206", sapArticle: "SSUSM-R410NZKAXSE", sapDescription: "GALAXY BUDS CORE BLACK", brand: "SAMSUNG", category: "ACCESSORIES", qty: 1, amount: 799000, insentifApple: 0, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "10", date: "03/10/2026", salesName: "Yunita Anggraini", invoice: "100012221", sapArticle: "APPMG8P4ID/A", sapDescription: "IPHONE 17 PRO 1TB SILVER", brand: "APPLE", category: "DEVICES", qty: 1, amount: 32249000, productFocus: "iPhone 17 Pro", insentifApple: 15000, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "11", date: "03/10/2026", salesName: "Yunita Anggraini", invoice: "100012208", sapArticle: "APPMD4A4PA/A", sapDescription: "IPAD 11TH WI-FI 128GB BLUE", brand: "APPLE", category: "DEVICES", qty: 1, amount: 8699000, productFocus: "iPad A16", insentifApple: 10000, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "12", date: "03/10/2026", salesName: "M. Adlii", invoice: "100012215", sapArticle: "APPMFYQ4ID/A", sapDescription: "IPHONE 17 PRO MAX 512GB SILVER", brand: "APPLE", category: "DEVICES", qty: 1, amount: 29499000, productFocus: "iPhone 17 PM", insentifApple: 15000, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "13", date: "03/10/2026", salesName: "Bagas T Saputra", invoice: "100012220", sapArticle: "APPMYE73ID/A", sapDescription: "IPHONE 16 128GB BLACK", brand: "APPLE", category: "DEVICES", qty: 1, amount: 16499000, productFocus: "iPhone 16", insentifApple: 15000, insentifAndroid: 0, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "14", date: "04/10/2026", salesName: "Yunita Anggraini", invoice: "100012223", sapArticle: "SSUSM-F971BZKGXID", sapDescription: "SAMSUNG Z FOLD 8 12/512GB GRAPHITE", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 32499000, productFocus: "Fold 8 Series", insentifApple: 0, insentifAndroid: 30000, insentif3rdParty: 0, insentifQoala: 0 },
  { id: "15", date: "08/10/2026", salesName: "Liesbeth Febrina", invoice: "100012226", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000, insentifApple: 0, insentifAndroid: 10000, insentif3rdParty: 0, insentifQoala: 0 }
];

export default function DigiplusDashboard() {
  const [activeTab, setActiveTab] = useState<MenuTab>("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStaff, setFilterStaff] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Toko & KPI MTD (Data Master Tab "Dashboard QF01")
  const storeInfo = {
    code: "QF01",
    name: "DIGIPLUS GRAND INDONESIA",
    period: "Oktober 2026",
    target: 8720000000,
    actual: 3105420000,
    appleSales: 1850000000,
    androidSales: 620000000,
    accessoriesSales: 415420000,
    vasSales: 220000000,
  };

  const achievementRate = ((storeInfo.actual / storeInfo.target) * 100).toFixed(1);

  // Format Mata Uang
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filter Data Transaksi
  const filteredSales = useMemo(() => {
    return RAW_DATABASE.filter((item) => {
      const matchSearch =
        item.sapDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sapArticle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.invoice.includes(searchQuery);
      const matchCat = filterCategory === "ALL" || item.category === filterCategory;
      const matchStaff = filterStaff === "ALL" || item.salesName === filterStaff;
      return matchSearch && matchCat && matchStaff;
    });
  }, [searchQuery, filterCategory, filterStaff]);

  // Agregasi Leaderboard Tim Sales
  const leaderboardData = useMemo(() => {
    const map: { [key: string]: { name: string; sales: number; qty: number; invoices: Set<string>; insentif: number } } = {};
    RAW_DATABASE.forEach((item) => {
      if (!map[item.salesName]) {
        map[item.salesName] = { name: item.salesName, sales: 0, qty: 0, invoices: new Set(), insentif: 0 };
      }
      map[item.salesName].sales += item.amount;
      map[item.salesName].qty += item.qty;
      map[item.salesName].invoices.add(item.invoice);
      map[item.salesName].insentif += item.insentifApple + item.insentifAndroid + item.insentif3rdParty + item.insentifQoala;
    });

    return Object.values(map)
      .map((st) => ({
        name: st.name,
        totalSales: st.sales,
        qty: st.qty,
        struk: st.invoices.size,
        atv: st.invoices.size > 0 ? Math.round(st.sales / st.invoices.size) : 0,
        upt: st.invoices.size > 0 ? (st.qty / st.invoices.size).toFixed(1) : "0",
        totalInsentif: st.insentif,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, []);

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-[#0d1424] border-r border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
                D+
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="text-sm font-bold tracking-wider text-white">DIGIPLUS</h2>
                  <p className="text-[10px] text-amber-400 font-medium">RETAIL ENGINE</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              ⇄
            </button>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5 mt-3">
            {[
              { id: "home", label: "Dashboard Overview", icon: "📊" },
              { id: "sales-detail", label: "Rincian Penjualan", icon: "📋" },
              { id: "leaderboard", label: "Staff Performance", icon: "🏆" },
              { id: "product-focus", label: "Product Focus", icon: "📱" },
              { id: "payment", label: "BNPL & Pembayaran", icon: "💳" },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id as MenuTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === nav.id
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span className="text-base">{nav.icon}</span>
                {sidebarOpen && <span>{nav.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Store Tag */}
        {sidebarOpen && (
          <div className="p-4 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <p className="text-slate-400 text-[11px]">Active Storefront:</p>
            <p className="font-bold text-white mt-0.5">{storeInfo.code} - GI</p>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync OK
            </p>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                {storeInfo.code}
              </span>
              <span className="text-slate-600">•</span>
              <h1 className="text-lg font-extrabold text-white">{storeInfo.name}</h1>
            </div>
            <p className="text-xs text-slate-400">Periode: {storeInfo.period} • Sumber: Master QF01 Sheet</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg font-medium">
              Target: <strong className="text-amber-400">{formatIDR(storeInfo.target)}</strong>
            </span>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg font-bold">
              {achievementRate}% Achieved
            </span>
          </div>
        </header>

        {/* CONTENT TABS */}
        <main className="p-8 space-y-8 max-w-7xl w-full mx-auto">
          {/* TAB 1: HOME / DASHBOARD OVERVIEW */}
          {activeTab === "home" && (
            <>
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm relative overflow-hidden">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales MTD</div>
                  <div className="text-2xl font-black text-white mt-2">{formatIDR(storeInfo.actual)}</div>
                  <div className="mt-3 flex justify-between text-xs text-slate-400">
                    <span>Target Toko:</span>
                    <span className="text-amber-400 font-semibold">{formatIDR(storeInfo.target)}</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Achievement</div>
                  <div className="text-2xl font-black text-emerald-400 mt-2">{achievementRate}%</div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${achievementRate}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Apple Ecosystem</div>
                  <div className="text-2xl font-black text-sky-400 mt-2">{formatIDR(storeInfo.appleSales)}</div>
                  <p className="mt-3 text-[11px] text-slate-400">iPhone 17 PM, 16, iPad & AirPods</p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 shadow-sm">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Android & Samsung</div>
                  <div className="text-2xl font-black text-indigo-400 mt-2">{formatIDR(storeInfo.androidSales)}</div>
                  <p className="mt-3 text-[11px] text-slate-400">S26 Ultra, Fold 8, Galaxy A-Series</p>
                </div>
              </div>

              {/* Sub Categories: Accessories & VAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm text-slate-200">Accessories Revenue</h3>
                    <span className="text-sm font-bold text-amber-400">{formatIDR(storeInfo.accessoriesSales)}</span>
                  </div>
                  <p className="text-xs text-slate-400">Power Adapter, MagSafe Case, Tempered Glass, TWS Audio</p>
                </div>

                <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm text-slate-200">VAS (Proteksi Qoala)</h3>
                    <span className="text-sm font-bold text-violet-400">{formatIDR(storeInfo.vasSales)}</span>
                  </div>
                  <p className="text-xs text-slate-400">Diamond Extended Warranty & Device Protection Plan</p>
                </div>
              </div>

              {/* Quick Summary Leaderboard Top 3 */}
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                <h3 className="font-bold text-sm text-white mb-4">🏆 Top Salesperson Minggu Ini</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {leaderboardData.slice(0, 3).map((staff, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800/80">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-white">{staff.name}</p>
                          <p className="text-xs text-emerald-400 font-semibold">{formatIDR(staff.totalSales)}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between text-[11px] text-slate-400">
                        <span>ATV: {formatIDR(staff.atv)}</span>
                        <span>{staff.struk} Invoices</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: RINCIAN PENJUALAN (DAILY SALES DETAIL TABLE) */}
          {activeTab === "sales-detail" && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 flex-1 min-w-[280px]">
                  {/* Search */}
                  <input
                    type="text"
                    placeholder="Cari Produk, Invoice, atau Artikel SAP..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 flex-1 min-w-[200px]"
                  />

                  {/* Filter Kategori */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="DEVICES">DEVICES</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                    <option value="VAS">VAS (Proteksi)</option>
                  </select>

                  {/* Filter Sales */}
                  <select
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Semua Staff</option>
                    {leaderboardData.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-400">
                  Ditemukan: <strong className="text-white">{filteredSales.length}</strong> transaksi
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a0f1d] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Tanggal</th>
                        <th className="py-3.5 px-4">Invoice</th>
                        <th className="py-3.5 px-4">Salesperson</th>
                        <th className="py-3.5 px-4">SAP Article & Deskripsi</th>
                        <th className="py-3.5 px-4">Brand</th>
                        <th className="py-3.5 px-4">Kategori</th>
                        <th className="py-3.5 px-4 text-center">Qty</th>
                        <th className="py-3.5 px-4 text-right">Amount (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredSales.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{item.date}</td>
                          <td className="py-3 px-4 text-amber-400 font-mono font-semibold">{item.invoice}</td>
                          <td className="py-3 px-4 text-white font-semibold">{item.salesName}</td>
                          <td className="py-3 px-4">
                            <div className="text-white font-bold">{item.sapDescription}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{item.sapArticle}</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">
                              {item.brand}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.category === "DEVICES"
                                  ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                                  : item.category === "ACCESSORIES"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-300">{item.qty}</td>
                          <td className="py-3 px-4 text-right text-emerald-400 font-bold whitespace-nowrap">
                            {formatIDR(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: STAFF PERFORMANCE & LEADERBOARD */}
          {activeTab === "leaderboard" && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white">🏆 Staff Sales Performance & Leaderboard</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Analisis omset penjualan, produktivitas struk, dan akumulasi insentif staf</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a0f1d] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Nama Staff</th>
                      <th className="py-3.5 px-4 text-right">Total Revenue</th>
                      <th className="py-3.5 px-4 text-center">Unit Terjual</th>
                      <th className="py-3.5 px-4 text-center">Struk</th>
                      <th className="py-3.5 px-4 text-right">ATV (Avg Basket)</th>
                      <th className="py-3.5 px-4 text-center">UPT</th>
                      <th className="py-3.5 px-4 text-right">Est. Insentif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {leaderboardData.map((staff, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                              idx === 0
                                ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/30"
                                : idx === 1
                                ? "bg-slate-300 text-slate-950"
                                : idx === 2
                                ? "bg-amber-700 text-white"
                                : "text-slate-400"
                            }`}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-bold text-white text-sm">{staff.name}</td>
                        <td className="py-4 px-4 text-right text-emerald-400 font-extrabold text-sm">
                          {formatIDR(staff.totalSales)}
                        </td>
                        <td className="py-4 px-4 text-center text-slate-300">{staff.qty}</td>
                        <td className="py-4 px-4 text-center text-slate-300">{staff.struk}</td>
                        <td className="py-4 px-4 text-right text-slate-300 font-medium">{formatIDR(staff.atv)}</td>
                        <td className="py-4 px-4 text-center text-slate-400 font-semibold">{staff.upt}</td>
                        <td className="py-4 px-4 text-right text-amber-300 font-bold">{formatIDR(staff.totalInsentif)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PRODUCT FOCUS & ECOSYSTEM */}
          {activeTab === "product-focus" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">🍏 Apple Ecosystem Attachments</h3>
                <p className="text-xs text-slate-400 mb-5">Rasio penjualan Device yang dilengkapi dengan Proteksi Qoala & Aksesoris resmi</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">iPhone 17 Pro / Pro Max</span>
                      <span className="text-sky-400 font-bold">18 Unit</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">iPad 11th Gen & Stylus</span>
                      <span className="text-sky-400 font-bold">9 Unit</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full rounded-full" style={{ width: "45%" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                <h3 className="text-sm font-bold text-white mb-3">⚡ Samsung Flagship & Multi-brand</h3>
                <p className="text-xs text-slate-400 mb-5">Distribusi lini produk ponsel lipat dan flagship Android</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Galaxy Z Fold 8 Series</span>
                      <span className="text-indigo-400 font-bold">8 Unit</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300">Galaxy S26 Ultra</span>
                      <span className="text-indigo-400 font-bold">12 Unit</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BNPL & METODE PEMBAYARAN */}
          {activeTab === "payment" && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
              <h3 className="text-base font-bold text-white mb-1">💳 Distribusi Metode Pembayaran & BNPL</h3>
              <p className="text-xs text-slate-400 mb-6">Penetrasi pembiayaan konsumen di Digiplus Grand Indonesia</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">Kredivo</span>
                  <div className="text-lg font-bold text-white mt-1">Rp 480.250.000</div>
                  <span className="text-[11px] text-emerald-400">32 Transaksi</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">Home Credit (HCI)</span>
                  <div className="text-lg font-bold text-white mt-1">Rp 315.800.000</div>
                  <span className="text-[11px] text-emerald-400">19 Transaksi</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">Kartu Kredit 0%</span>
                  <div className="text-lg font-bold text-white mt-1">Rp 1.420.000.000</div>
                  <span className="text-[11px] text-emerald-400">58 Transaksi</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs text-slate-400">Debit / QRIS / Cash</span>
                  <div className="text-lg font-bold text-white mt-1">Rp 889.370.000</div>
                  <span className="text-[11px] text-emerald-400">84 Transaksi</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
