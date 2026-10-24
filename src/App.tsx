"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "store-overview" | "leaderboard" | "sales-detail";

interface CategoryMetric {
  category: string;
  icon: string;
  actual: number;
  target: number;
  achievement: number;
  variance: number;
  estimate: number;
  color: string;
  badgeBg: string;
}

interface ProductDetailItem {
  name: string;
  sku: string;
  brand: string;
  qty: number;
  revenue: number;
  share: string;
}

// 1. DATA MASTER MATRIKS KATEGORI SESUAI TAB "Dashboard QF01" (BARIS 14 - 20)
const STORE_OVERVIEW_METRICS: CategoryMetric[] = [
  {
    category: "Apple Devices",
    icon: "🍎",
    actual: 2519060000,
    target: 6932151006,
    achievement: 36.3,
    variance: -4413091006,
    estimate: 3253785833,
    color: "text-sky-400",
    badgeBg: "bg-sky-500/10 border-sky-500/30 text-sky-300",
  },
  {
    category: "Android Devices",
    icon: "🤖",
    actual: 394141000,
    target: 943691666,
    achievement: 41.8,
    variance: -549550666,
    estimate: 509098792,
    color: "text-indigo-400",
    badgeBg: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
  },
  {
    category: "Accessories",
    icon: "🔌",
    actual: 60156200,
    target: 460550560,
    achievement: 13.1,
    variance: -400394360,
    estimate: 77701758,
    color: "text-amber-400",
    badgeBg: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  },
  {
    category: "VAS (Proteksi Qoala)",
    icon: "🛡️",
    actual: 45070000,
    target: 392273940,
    achievement: 11.5,
    variance: -347203940,
    estimate: 58215417,
    color: "text-purple-400",
    badgeBg: "bg-purple-500/10 border-purple-500/30 text-purple-300",
  },
];

const STORE_TOTAL = {
  actual: 3147828200,
  target: 8728667173,
  achievement: 36.1,
  variance: -5580838973,
  estimate: 4065944758,
};

// 2. RINCIAN DETAIL PRODUK PER KATEGORI (BERDASARKAN SHEET DATABASE)
const PRODUCT_DETAILS: Record<string, ProductDetailItem[]> = {
  apple: [
    { name: "iPhone 17 Pro Max 256GB / 512GB", sku: "APPMFYM4ID/A", brand: "APPLE", qty: 48, revenue: 1248000000, share: "49.5%" },
    { name: "iPhone 17 Pro 256GB / 1TB", sku: "APPMG8P4ID/A", brand: "APPLE", qty: 26, revenue: 642000000, share: "25.5%" },
    { name: "iPhone 16 128GB / 256GB", sku: "APPMYE73ID/A", brand: "APPLE", qty: 22, revenue: 362978000, share: "14.4%" },
    { name: "iPhone 15 128GB", sku: "APPMTP13ID/A", brand: "APPLE", qty: 12, revenue: 167988000, share: "6.7%" },
    { name: "iPad 11th Gen Wi-Fi 128GB", sku: "APPMD4A4PA/A", brand: "APPLE", qty: 9, revenue: 78291000, share: "3.1%" },
    { name: "MacBook Neo M-Series", sku: "APPMACNEO", brand: "APPLE", qty: 2, revenue: 19803000, share: "0.8%" },
  ],
  android: [
    { name: "Galaxy S26 Ultra 12/256GB", sku: "SSUSM-S948BZVB", brand: "SAMSUNG", qty: 12, revenue: 261120000, share: "66.2%" },
    { name: "Samsung Galaxy Z Fold 8 512GB", sku: "SSUSM-F971BZKG", brand: "SAMSUNG", qty: 2, revenue: 64998000, share: "16.5%" },
    { name: "Galaxy A17 4/128GB LTE/5G", sku: "SSUSM-A175FZKN", brand: "SAMSUNG", qty: 14, revenue: 41986000, share: "10.7%" },
    { name: "Galaxy A07 4/64GB Light Violet", sku: "SSUSM-A075FLVD", brand: "SAMSUNG", qty: 8, revenue: 18392000, share: "4.7%" },
    { name: "Motorola & Multi-brand Devices", sku: "MOT-MULTIBRAND", brand: "MOTOROLA", qty: 3, revenue: 7645000, share: "1.9%" },
  ],
  accessories: [
    { name: "20W USB-C Power Adapter", sku: "APPMD3J4ZA/A", brand: "APPLE", qty: 36, revenue: 19764000, share: "32.9%" },
    { name: "AirPods 4th Generation", sku: "APPMXP63ID/A", brand: "APPLE", qty: 7, revenue: 14693000, share: "24.4%" },
    { name: "240W USB-C Charge Cable (2M)", sku: "APPMYQT3ZA/A", brand: "APPLE", qty: 16, revenue: 8784000, share: "14.6%" },
    { name: "MagSafe Silicone & Clear Case", sku: "MUUM-IP17PM-ICM", brand: "MUTUALL / ZAGG", qty: 14, revenue: 7686000, share: "12.8%" },
    { name: "Samsung Travel Adapter 25W/45W", sku: "SSUEP-T2510NBE", brand: "SAMSUNG", qty: 18, revenue: 5382000, share: "8.9%" },
    { name: "Tempered Glass 2.5D / 3D Shield", sku: "KOATGF-IP18PM", brand: "DIGI-SHIELD", qty: 6, revenue: 3847200, share: "6.4%" },
  ],
  vas: [
    { name: "Proteksi Qoala Diamond 24-25", sku: "KLADIAMOND(24-25)", brand: "QOALA", qty: 18, revenue: 35460000, share: "78.7%" },
    { name: "Proteksi Screen & Extended Warranty", sku: "KLAPROT-EXT", brand: "QOALA", qty: 8, revenue: 9610000, share: "21.3%" },
  ],
};

// 3. LEADERBOARD STAF PENJUALAN RESMI
const OFFICIAL_LEADERBOARD = [
  { rank: 1, name: "Liesbeth Febrina", target: 872866717, totalSales: 1387141000, achievement: 158.9, status: "Tercapai 👑" },
  { rank: 2, name: "Yunita Anggraini", target: 1222013404, totalSales: 403576000, achievement: 33.0, status: "Belum Tercapai" },
  { rank: 3, name: "M. Adlii", target: 1658446763, totalSales: 264518000, achievement: 15.9, status: "Belum Tercapai" },
  { rank: 4, name: "Bagas T Saputra", target: 0, totalSales: 256033000, achievement: 0.0, status: "Belum Tercapai" },
  { rank: 5, name: "Siti Amelia", target: 1658446763, totalSales: 254722200, achievement: 15.4, status: "Belum Tercapai" },
  { rank: 6, name: "Andrian Afi Syarfuan", target: 1658446763, totalSales: 239735000, achievement: 14.5, status: "Belum Tercapai" },
  { rank: 7, name: "Surya Adi Permana", target: 1658446763, totalSales: 170479000, achievement: 10.3, status: "Belum Tercapai" },
];

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [activeCategoryTab, setActiveCategoryTab] = useState<"apple" | "android" | "accessories" | "vas">("apple");

  // Shortcut Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; text: string }>({
    type: "idle",
    text: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2VUsReKqqJgPsG15L1pOAkmqoIWF2vApyD18jr5e_z0OVqagasa9yHXEe5fzMhoQmOw/exec";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("digiplus_session_user");
      if (savedUser) setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    if (salesIdInput.trim() === "") {
      setLoginErr("Masukkan Sales ID Anda!");
      return;
    }
    localStorage.setItem("digiplus_session_user", salesIdInput);
    setIsLoggedIn(true);
    setLoginErr("");
  };

  const handleLogout = () => {
    localStorage.removeItem("digiplus_session_user");
    setIsLoggedIn(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setUploadStatus({ type: "idle", text: `File: ${file.name}` });
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile) {
      setUploadStatus({ type: "error", text: "Pilih file .xls terlebih dahulu!" });
      return;
    }

    setUploadStatus({ type: "loading", text: "Mengirim ke Kolom M, N, O..." });

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "upload_saleswise",
          targetSheet: "RAW SalesPerson",
          columns: ["M", "N", "O"],
          fileName: selectedFile.name,
        }),
      });

      setUploadStatus({
        type: "success",
        text: `Berhasil! File "${selectedFile.name}" telah diteruskan ke Sheet RAW SalesPerson Kolom M, N, O.`,
      });
      setSelectedFile(null);
    } catch (err) {
      setUploadStatus({ type: "error", text: "Gagal mengirim file. Periksa koneksi internet." });
    }
  };

  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  // HALAMAN LOGIN
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 text-white font-sans">
        <div className="max-w-md w-full bg-[#0d1424] border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20 mb-3">
              D+
            </div>
            <h1 className="text-xl font-bold text-white">DIGIPLUS GRAND INDONESIA</h1>
            <p className="text-xs text-amber-400 mt-1">Portal Login Sales & Admin (QF01)</p>
          </div>

          {loginErr && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold text-center">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase">Sales ID / Admin ID</label>
              <input
                type="text"
                required
                placeholder="22008089 atau ID Anda"
                value={salesIdInput}
                onChange={(e) => setSalesIdInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase">Password</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg shadow-amber-400/20"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD UTAMA
  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      {/* SIDEBAR KIRI */}
      <aside className="w-72 bg-[#0d1424] border-r border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div className="p-4 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-red-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
              D+
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider">DIGIPLUS</h2>
              <p className="text-[10px] text-amber-400 font-semibold">QF01 GRAND INDONESIA</p>
            </div>
          </div>

          {/* KOTAK SHORTCUT UPLOAD */}
          <div className="mt-4 p-4 rounded-2xl bg-[#090e1a] border-2 border-amber-500/50 shadow-xl shadow-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📤</span>
              <div>
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wide">Upload Saleswise</h3>
                <a
                  href="https://docs.google.com/spreadsheets/d/1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM/edit#gid=483282286"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-slate-400 hover:text-amber-400 underline block"
                >
                  Sheet RAW (Kolom M, N, O) ↗
                </a>
              </div>
            </div>

            {uploadStatus.text && (
              <div
                className={`my-2 p-2 rounded-xl text-[10px] font-bold text-center leading-tight ${
                  uploadStatus.type === "success"
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                    : uploadStatus.type === "error"
                    ? "bg-red-500/20 border border-red-500/40 text-red-300"
                    : "bg-slate-800 border border-slate-700 text-amber-300"
                }`}
              >
                {uploadStatus.text}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-amber-400/40 hover:border-amber-400 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📁</span>
              <span className="truncate">{selectedFile ? selectedFile.name : "1. Pilih File .xls"}</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={uploadStatus.type === "loading"}
              className="w-full mt-2 py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              {uploadStatus.type === "loading" ? "Mengirim..." : "2. Kirim ke Kolom M, N, O"}
            </button>
          </div>

          {/* Navigasi Menu */}
          <nav className="mt-5 space-y-1.5">
            <button
              onClick={() => setActiveTab("store-overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "store-overview" ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">📊</span>
              <span>Overview Store & Kategori</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "leaderboard" ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">🏆</span>
              <span>Staff Performance</span>
            </button>

            <button
              onClick={() => setActiveTab("sales-detail")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales-detail" ? "bg-amber-400 text-slate-950 font-black shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span className="text-base">📋</span>
              <span>Rincian Penjualan LOB</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        <header className="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase">
                QF01 Grand Indonesia
              </span>
              <h1 className="text-xl font-bold text-white">RETAIL STORE PERFORMANCE ENGINE</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">Periode: Oktober 2026 • Sumber Master: Sheet `Dashboard QF01` & `DATABASE`</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              Actual MTD: {formatIDR(STORE_TOTAL.actual)}
            </span>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB: STORE OVERVIEW (TARGET, ACHV, VARIANCE, ESTIMATE)    */}
        {/* ========================================================= */}
        {activeTab === "store-overview" && (
          <div className="space-y-8">
            {/* 1. KARTU BESAR TOTAL STORE REVENUE */}
            <div className="p-6 bg-[#0d1424] border-2 border-slate-800 rounded-3xl shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Store Revenue</span>
                  <div className="text-3xl font-black text-white mt-1">{formatIDR(STORE_TOTAL.actual)}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Target Toko: <strong className="text-slate-200">{formatIDR(STORE_TOTAL.target)}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Achievement</span>
                  <span className="text-3xl font-black text-amber-400">{STORE_TOTAL.achievement}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-4">
                <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: `${STORE_TOTAL.achievement}%` }} />
              </div>

              {/* Variance & Estimate Ringkasan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80 text-xs">
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Variance (Selisih Target):</span>
                  <span className="font-bold text-red-400 font-mono">{formatIDR(STORE_TOTAL.variance)}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400">Estimate (Proyeksi Akhir Bulan):</span>
                  <span className="font-bold text-emerald-400 font-mono">{formatIDR(STORE_TOTAL.estimate)}</span>
                </div>
              </div>
            </div>

            {/* 2. TABEL LENGKAP: TARGET, ACHV, VARIANCE, ESTIMATE PER KATEGORI */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-white">Matriks Kategori Produk (Apple, Android, Accessories & VAS)</h2>
                <span className="text-[11px] text-slate-400">Presisi 100% Tab Dashboard QF01</span>
              </div>

              <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a0f1d] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-4">Kategori Produk</th>
                      <th className="py-4 px-4 text-right">Actual Sales</th>
                      <th className="py-4 px-4 text-right">Target</th>
                      <th className="py-4 px-4 text-center">Achievement (%)</th>
                      <th className="py-4 px-4 text-right">Variance (Selisih)</th>
                      <th className="py-4 px-4 text-right">Estimate (Run Rate)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {STORE_OVERVIEW_METRICS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition">
                        <td className="py-4 px-4 font-bold text-white text-sm">
                          <span className="mr-2">{row.icon}</span>
                          <span>{row.category}</span>
                        </td>
                        <td className={`py-4 px-4 text-right font-extrabold text-sm ${row.color}`}>
                          {formatIDR(row.actual)}
                        </td>
                        <td className="py-4 px-4 text-right text-slate-300 font-mono">
                          {formatIDR(row.target)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${row.badgeBg}`}>
                            {row.achievement}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-red-400 font-mono font-bold">
                          {formatIDR(row.variance)}
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-400 font-mono font-bold">
                          {formatIDR(row.estimate)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. RINCIAN DETAIL PRODUK PER KATEGORI (INTERAKTIF TABS) */}
            <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-3xl shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white">Rincian Detail Produk Terjual per Kategori</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Komposisi item, revenue kontribusi, dan persentase share produk</p>
                </div>

                {/* Sub Tab Pemilih Kategori */}
                <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
                  <button
                    onClick={() => setActiveCategoryTab("apple")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "apple" ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🍎 Apple Devices
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab("android")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "android" ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🤖 Android Devices
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab("accessories")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "accessories" ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🔌 Accessories
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab("vas")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "vas" ? "bg-purple-500 text-white shadow-md shadow-purple-500/20" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    🛡️ VAS (Qoala)
                  </button>
                </div>
              </div>

              {/* Tabel Rincian Produk Aktif */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a0f1d] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Nama Produk & Tipe</th>
                      <th className="py-3 px-4">Artikel SAP</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4 text-center">Qty Terjual</th>
                      <th className="py-3 px-4 text-right">Nilai Penjualan (Rp)</th>
                      <th className="py-3 px-4 text-right">Kontribusi Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {PRODUCT_DETAILS[activeCategoryTab].map((p, i) => (
                      <tr key={i} className="hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4 font-bold text-white">{p.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">{p.sku}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold text-[10px]">
                            {p.brand}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-white">{p.qty} Unit</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400">
                          {formatIDR(p.revenue)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-amber-400 font-bold">{p.share}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LEADERBOARD STAF */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">🏆 Staff Sales Performance & Leaderboard</h2>
            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a0f1d] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 text-center">Rank</th>
                    <th className="py-4 px-4">Nama Salesperson</th>
                    <th className="py-4 px-4 text-right">Target</th>
                    <th className="py-4 px-4 text-right">Actual Sales</th>
                    <th className="py-4 px-4 text-center">Achievement</th>
                    <th className="py-4 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {OFFICIAL_LEADERBOARD.map((s) => (
                    <tr key={s.rank} className={`hover:bg-slate-800/40 transition ${s.rank === 1 ? "bg-amber-500/10 font-bold" : ""}`}>
                      <td className="py-4 px-4 text-center">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${s.rank === 1 ? "bg-amber-400 text-slate-950" : "text-slate-400"}`}>
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-white text-sm">{s.name}</td>
                      <td className="py-4 px-4 text-right text-slate-400 font-mono">{s.target > 0 ? formatIDR(s.target) : "-"}</td>
                      <td className="py-4 px-4 text-right text-emerald-400 font-extrabold text-sm">{formatIDR(s.totalSales)}</td>
                      <td className="py-4 px-4 text-center font-bold text-amber-400">{s.achievement.toFixed(1)}%</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.achievement >= 100 ? "bg-blue-500/20 text-blue-300" : "bg-red-500/20 text-red-300"}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: RINCIAN PENJUALAN LOB */}
        {activeTab === "sales-detail" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white">Breakdown LOB Sales</h2>
            <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-300">
                Data kategori lengkap mencakup <strong>Apple Devices</strong> (Rp 2,51 M), <strong>Android Devices</strong> (Rp 394 Jt), <strong>Accessories</strong> (Rp 60,1 Jt), dan <strong>VAS Qoala</strong> (Rp 45,0 Jt).
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
