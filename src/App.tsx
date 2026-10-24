"use client";

import React, { useState, useEffect, useMemo } from "react";

type MenuTab = "home" | "sales-detail" | "leaderboard" | "product-focus";

interface TransactionItem {
  id: string;
  date: string;
  salesId: string;
  salesName: string;
  invoice: string;
  sapArticle: string;
  sapDescription: string;
  brand: string;
  category: string;
  qty: number;
  amount: number;
}

// Data awal lengkap (fallback) yang mencakup transaksi riil Liesbeth Febrina
const FALLBACK_SALES: TransactionItem[] = [
  { id: "1", date: "03/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012211", sapArticle: "MOKMWC-235-TI", sapDescription: "ADAPTER 35W GAN USB C + USB A", brand: "MICROPACK", category: "ACCESSORIES", qty: 1, amount: 599000 },
  { id: "2", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012226", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "3", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012228", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "4", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012228", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "5", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012230", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "6", date: "01/10/2026", salesId: "23016895", salesName: "Mia Noviyanti", invoice: "100012203", sapArticle: "NOXC20111", sapDescription: "20W CHARGER WHITE", brand: "NODX", category: "ACCESSORIES", qty: 1, amount: 199000 },
  { id: "7", date: "01/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012205", sapArticle: "APPMD3J4ZA/A", sapDescription: "20W USB-C POWER ADAPTER", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 549000 },
  { id: "8", date: "01/10/2026", salesId: "25015216", salesName: "Andrian Afi Syarfuan", invoice: "100012201", sapArticle: "APPMFYM4ID/A", sapDescription: "IPHONE 17 PRO MAX 256GB SILVER", brand: "APPLE", category: "DEVICES", qty: 1, amount: 24999000 },
  { id: "9", date: "01/10/2026", salesId: "25015216", salesName: "Andrian Afi Syarfuan", invoice: "100012201", sapArticle: "KLADIAMOND(24-25)", sapDescription: "PROTEKSI DIAMOND 24-25", brand: "QOALA", category: "VAS", qty: 1, amount: 1970000 },
  { id: "10", date: "01/10/2026", salesId: "26026303", salesName: "Surya Adi Permana", invoice: "100012204", sapArticle: "SSUSM-A075FLVDXID", sapDescription: "GALAXY A07 4/64GB LIGHT VIOLET", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2299000 },
  { id: "11", date: "01/10/2026", salesId: "26028497", salesName: "Siti Amelia", invoice: "100012201", sapArticle: "APPMXP63ID/A", sapDescription: "AIRPODS 4", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 2099000 },
  { id: "12", date: "01/10/2026", salesId: "26028497", salesName: "Siti Amelia", invoice: "100012201", sapArticle: "MUUM-IP17PM-ICM-CL", sapDescription: "IP17 PRO MAX ICE MGSF CLR", brand: "MUTUALL", category: "ACCESSORIES", qty: 1, amount: 549000 },
  { id: "13", date: "02/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012206", sapArticle: "SSUSM-S948BZVBXID", sapDescription: "GALAXY S26 ULTRA 12/256GB", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 21760000 },
  { id: "14", date: "03/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012221", sapArticle: "APPMG8P4ID/A", sapDescription: "IPHONE 17 PRO 1TB SILVER", brand: "APPLE", category: "DEVICES", qty: 1, amount: 32249000 },
  { id: "15", date: "03/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012208", sapArticle: "APPMD4A4PA/A", sapDescription: "IPAD 11TH WI-FI 128GB BLUE", brand: "APPLE", category: "DEVICES", qty: 1, amount: 8699000 },
  { id: "16", date: "03/10/2026", salesId: "25005333", salesName: "M. Adlii", invoice: "100012215", sapArticle: "APPMFYQ4ID/A", sapDescription: "IPHONE 17 PRO MAX 512GB", brand: "APPLE", category: "DEVICES", qty: 1, amount: 29499000 },
  { id: "17", date: "03/10/2026", salesId: "26036846", salesName: "Bagas T Saputra", invoice: "100012220", sapArticle: "APPMYE73ID/A", sapDescription: "IPHONE 16 128GB BLACK", brand: "APPLE", category: "DEVICES", qty: 1, amount: 16499000 },
  { id: "18", date: "04/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012223", sapArticle: "SSUSM-F971BZKGXID", sapDescription: "SAMSUNG Z FOLD 8 12/512GB", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 32499000 }
];

export default function DigiplusDashboard() {
  const [activeTab, setActiveTab] = useState<MenuTab>("sales-detail");
  const [salesList, setSalesList] = useState<TransactionItem[]>(FALLBACK_SALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStaff, setFilterStaff] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Ambil Data Live dari Google Sheets (Tab RAW SalesPerson)
  useEffect(() => {
    const SHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
    const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=RAW%20SalesPerson`;

    fetch(GVIZ_URL)
      .then((res) => res.text())
      .then((text) => {
        // Parse format JSONP dari Google Sheets GViz
        const jsonString = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
        const data = JSON.parse(jsonString);
        const rows = data.table.rows;

        const parsed: TransactionItem[] = [];
        rows.forEach((r: any, idx: number) => {
          const c = r.c;
          if (!c) return;
          const date = c[0]?.f || c[0]?.v || "";
          const salesId = String(c[1]?.v || "");
          const salesName = c[2]?.v || "";
          const invoice = String(c[3]?.v || "");
          const sapArticle = c[4]?.v || "";
          const sapDesc = c[5]?.v || "";
          const qty = Number(c[7]?.v) || 0;
          const amount = Number(c[8]?.v) || 0;
          const brand = c[10]?.v || "OTHER";
          const category = c[11]?.v || "ACCESSORIES";

          // Hanya ambil baris transaksi valid (ada nama sales dan amount > 0)
          if (salesName && amount > 0) {
            parsed.push({
              id: String(idx + 1),
              date,
              salesId,
              salesName,
              invoice,
              sapArticle,
              sapDescription: sapDesc,
              brand,
              category,
              qty: qty || 1,
              amount,
            });
          }
        });

        if (parsed.length > 0) {
          setSalesList(parsed);
          setIsLiveConnected(true);
        }
      })
      .catch((err) => {
        console.log("Menggunakan dataset fallback:", err);
      });
  }, []);

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Filter Data Transaksi
  const filteredSales = useMemo(() => {
    return salesList.filter((item) => {
      const matchSearch =
        item.sapDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sapArticle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.invoice.includes(searchQuery) ||
        item.salesName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === "ALL" || item.category === filterCategory;
      const matchStaff = filterStaff === "ALL" || item.salesName === filterStaff;
      return matchSearch && matchCat && matchStaff;
    });
  }, [salesList, searchQuery, filterCategory, filterStaff]);

  // Daftar Nama Sales Unik untuk Dropdown Filter
  const staffOptions = useMemo(() => {
    const set = new Set<string>();
    salesList.forEach((s) => {
      if (s.salesName) set.add(s.salesName);
    });
    return Array.from(set).sort();
  }, [salesList]);

  // Perhitungan Leaderboard Lengkap (Semua Staf Termasuk Liesbeth Febrina)
  const leaderboardData = useMemo(() => {
    const map: { [key: string]: { name: string; id: string; sales: number; qty: number; invoices: Set<string> } } = {};
    salesList.forEach((item) => {
      if (!map[item.salesName]) {
        map[item.salesName] = { name: item.salesName, id: item.salesId, sales: 0, qty: 0, invoices: new Set() };
      }
      map[item.salesName].sales += item.amount;
      map[item.salesName].qty += item.qty;
      if (item.invoice) map[item.salesName].invoices.add(item.invoice);
    });

    return Object.values(map)
      .map((st) => ({
        name: st.name,
        salesId: st.id,
        totalSales: st.sales,
        qty: st.qty,
        struk: st.invoices.size,
        atv: st.invoices.size > 0 ? Math.round(st.sales / st.invoices.size) : 0,
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [salesList]);

  const totalFilteredAmount = useMemo(() => {
    return filteredSales.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredSales]);

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
              { id: "sales-detail", label: "Rincian Penjualan", icon: "📋" },
              { id: "leaderboard", label: "Staff Performance", icon: "🏆" },
              { id: "home", label: "Dashboard Overview", icon: "📊" },
              { id: "product-focus", label: "Product Focus", icon: "📱" },
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

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
            <p className="text-slate-400 text-[11px]">Storefront Status:</p>
            <p className="font-bold text-white mt-0.5">QF01 - Grand Indonesia</p>
            <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isLiveConnected ? "Sheets Live Sync" : "Database Ready"}
            </p>
          </div>
        )}
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">QF01</span>
              <span className="text-slate-600">•</span>
              <h1 className="text-lg font-extrabold text-white">DIGIPLUS GRAND INDONESIA</h1>
            </div>
            <p className="text-xs text-slate-400">Master Sheet Sync: RAW SalesPerson & DATABASE</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg font-medium">
              Total Sales Terfilter: <strong className="text-emerald-400">{formatIDR(totalFilteredAmount)}</strong>
            </span>
          </div>
        </header>

        {/* CONTENT TABS */}
        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* TAB: RINCIAN PENJUALAN (DETAIL PENJUALAN LENGKAP) */}
          {activeTab === "sales-detail" && (
            <div className="space-y-6">
              {/* Filter Bar */}
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 flex-1 min-w-[300px]">
                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="Cari Staf, Produk, Invoice, atau SAP Article..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 flex-1 min-w-[220px]"
                  />

                  {/* Filter Dropdown Staf Sales */}
                  <select
                    value={filterStaff}
                    onChange={(e) => setFilterStaff(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="ALL">Semua Staf ({staffOptions.length} Orang)</option>
                    {staffOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  {/* Filter Dropdown Kategori */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="DEVICES">DEVICES (Smartphone/Tablet)</option>
                    <option value="ACCESSORIES">ACCESSORIES (Charger/Audio/Case)</option>
                    <option value="VAS">VAS (Proteksi Qoala)</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400">
                  Menampilkan <strong className="text-white">{filteredSales.length}</strong> baris transaksi
                </div>
              </div>

              {/* Tabel Detail Transaksi */}
              <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0a0f1d] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-3.5 px-4">Tanggal</th>
                        <th className="py-3.5 px-4">Invoice</th>
                        <th className="py-3.5 px-4">Salesperson</th>
                        <th className="py-3.5 px-4">Deskripsi Produk (SAP)</th>
                        <th className="py-3.5 px-4">Brand</th>
                        <th className="py-3.5 px-4">Kategori</th>
                        <th className="py-3.5 px-4 text-center">Qty</th>
                        <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {filteredSales.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">{item.date}</td>
                          <td className="py-3.5 px-4 text-amber-400 font-mono font-bold">{item.invoice}</td>
                          <td className="py-3.5 px-4 text-white font-bold flex items-center gap-2">
                            <span>{item.salesName}</span>
                            {item.salesName === "Liesbeth Febrina" && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-semibold">
                                Staf
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-white font-bold">{item.sapDescription}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{item.sapArticle}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">
                              {item.brand}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
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
                          <td className="py-3.5 px-4 text-center text-slate-300 font-bold">{item.qty}</td>
                          <td className="py-3.5 px-4 text-right text-emerald-400 font-bold whitespace-nowrap">
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

          {/* TAB: STAFF PERFORMANCE & LEADERBOARD LENGKAP */}
          {activeTab === "leaderboard" && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-white">🏆 Leaderboard Semua Staf Sales Digiplus</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Semua staf toko terdaftar tanpa pemotongan data</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a0f1d] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">ID Staf</th>
                      <th className="py-3.5 px-4">Nama Lengkap Salesperson</th>
                      <th className="py-3.5 px-4 text-right">Total Penjualan</th>
                      <th className="py-3.5 px-4 text-center">Unit Terjual</th>
                      <th className="py-3.5 px-4 text-center">Jumlah Struk</th>
                      <th className="py-3.5 px-4 text-right">ATV (Rata-rata Keranjang)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {leaderboardData.map((staff, idx) => (
                      <tr
                        key={idx}
                        className={`transition ${
                          staff.name === "Liesbeth Febrina" ? "bg-purple-900/10 hover:bg-purple-900/20" : "hover:bg-slate-800/30"
                        }`}
                      >
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-bold text-xs ${
                              idx === 0
                                ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
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
                        <td className="py-4 px-4 font-mono text-slate-400">{staff.salesId || "-"}</td>
                        <td className="py-4 px-4 font-bold text-white text-sm">
                          {staff.name}
                          {staff.name === "Liesbeth Febrina" && (
                            <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-full font-bold">
                              Liesbeth Terdaftar
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-400 font-extrabold text-sm">
                          {formatIDR(staff.totalSales)}
                        </td>
                        <td className="py-4 px-4 text-center text-slate-300">{staff.qty}</td>
                        <td className="py-4 px-4 text-center text-slate-300">{staff.struk}</td>
                        <td className="py-4 px-4 text-right text-slate-300 font-medium">{formatIDR(staff.atv)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: DASHBOARD OVERVIEW */}
          {activeTab === "home" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Keseluruhan</div>
                  <div className="text-2xl font-black text-white mt-2">{formatIDR(totalFilteredAmount)}</div>
                  <p className="mt-2 text-xs text-slate-400">Total akumulasi dari transaksi aktif</p>
                </div>
                <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Staf Aktif</div>
                  <div className="text-2xl font-black text-amber-400 mt-2">{staffOptions.length} Orang</div>
                  <p className="mt-2 text-xs text-slate-400">Termasuk Liesbeth Febrina, Yunita, Andrian, dll</p>
                </div>
                <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Transaksi / Invoice</div>
                  <div className="text-2xl font-black text-emerald-400 mt-2">{filteredSales.length} Transaksi</div>
                  <p className="mt-2 text-xs text-slate-400">Tercatat di QF01 Grand Indonesia</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRODUCT FOCUS */}
          {activeTab === "product-focus" && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
              <h3 className="font-bold text-white mb-2">📱 Unit Unggulan Terjual (Product Focus)</h3>
              <p className="text-xs text-slate-400 mb-6">Penjualan seri iPhone 17 Pro, Fold 8, Galaxy S26 Ultra, dan Galaxy A17</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400">Galaxy A17 4/128GB (Liesbeth Febrina)</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">4 Unit • Rp 11.996.000</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400">iPhone 17 Pro / Pro Max (Yunita & Adlii)</div>
                  <div className="text-lg font-bold text-sky-400 mt-1">3 Unit • Rp 86.747.000</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
