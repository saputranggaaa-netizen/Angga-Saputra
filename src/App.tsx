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
  paceStatus: string;
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

interface StaffRankItem {
  rank: number;
  salesId: string;
  name: string;
  target: number;
  actual: number;
  achievement: number;
  appleSales: number;
  androidSales: number;
  accessoriesSales: number;
  vasSales: number;
  status: "Tercapai" | "Belum Tercapai";
  paceVsTimeGone: number;
}

// 1. DATA TIME GONE RESMI (1 - 24 OKTOBER 2026 DARI 31 HARI)
const TIME_GONE_METRIC = {
  daysPassed: 24,
  totalDays: 31,
  daysLeft: 7,
  percentageTimeGone: 77.4,
  percentageTimeLeft: 22.6,
  dailyActualRunRate: 131159508,
  requiredDailyRunRate: 797262710,
};

// 2. DATA MASTER KATEGORI SESUAI TAB "Dashboard QF01" (BARIS 14 - 20)
const STORE_OVERVIEW_METRICS: CategoryMetric[] = [
  {
    category: "Apple Devices",
    icon: "🍎",
    actual: 2519060000,
    target: 6932151006,
    achievement: 36.3,
    variance: -4413091006,
    estimate: 3253785833,
    paceStatus: "Lagging (-41.1%)",
    color: "text-sky-300",
    badgeBg: "bg-sky-500/15 border-sky-400/30 text-sky-200",
  },
  {
    category: "Android Devices",
    icon: "🤖",
    actual: 394141000,
    target: 943691666,
    achievement: 41.8,
    variance: -549550666,
    estimate: 509098792,
    paceStatus: "Lagging (-35.6%)",
    color: "text-indigo-300",
    badgeBg: "bg-indigo-500/15 border-indigo-400/30 text-indigo-200",
  },
  {
    category: "Accessories",
    icon: "🔌",
    actual: 60156200,
    target: 460550560,
    achievement: 13.1,
    variance: -400394360,
    estimate: 77701758,
    paceStatus: "Lagging (-64.3%)",
    color: "text-amber-300",
    badgeBg: "bg-amber-500/15 border-amber-400/30 text-amber-200",
  },
  {
    category: "VAS (Proteksi Qoala)",
    icon: "🛡️",
    actual: 45070000,
    target: 392273940,
    achievement: 11.5,
    variance: -347203940,
    estimate: 58215417,
    paceStatus: "Lagging (-65.9%)",
    color: "text-purple-300",
    badgeBg: "bg-purple-500/15 border-purple-400/30 text-purple-200",
  },
];

const STORE_TOTAL = {
  actual: 3147828200,
  target: 8728667173,
  achievement: 36.1,
  variance: -5580838973,
  estimate: 4065944758,
};

// 3. RANK SALES PER STAFF RESMI (SESUAI SHEET DATABASE & DASHBOARD QF01)
const STAFF_RANK_DATA: StaffRankItem[] = [
  {
    rank: 1,
    salesId: "24004971",
    name: "Liesbeth Febrina",
    target: 872866717,
    actual: 1420983000,
    achievement: 162.8,
    appleSales: 1386790000,
    androidSales: 27992000,
    accessoriesSales: 2711000,
    vasSales: 3490000,
    status: "Tercapai",
    paceVsTimeGone: 85.4,
  },
  {
    rank: 2,
    salesId: "24016878",
    name: "Yunita Anggraini",
    target: 1222013404,
    actual: 451008000,
    achievement: 36.9,
    appleSales: 284190000,
    androidSales: 136044000,
    accessoriesSales: 17654000,
    vasSales: 13120000,
    status: "Belum Tercapai",
    paceVsTimeGone: -40.5,
  },
  {
    rank: 3,
    salesId: "26028497",
    name: "Siti Amelia",
    target: 1658446763,
    actual: 301970200,
    achievement: 18.2,
    appleSales: 254493000,
    androidSales: 27392000,
    accessoriesSales: 14335200,
    vasSales: 5750000,
    status: "Belum Tercapai",
    paceVsTimeGone: -59.2,
  },
  {
    rank: 4,
    salesId: "25005333",
    name: "M. Adlii",
    target: 1658446763,
    actual: 269015000,
    achievement: 16.2,
    appleSales: 176239000,
    androidSales: 80384000,
    accessoriesSales: 8532000,
    vasSales: 3860000,
    status: "Belum Tercapai",
    paceVsTimeGone: -61.2,
  },
  {
    rank: 5,
    salesId: "26036846",
    name: "Bagas T Saputra",
    target: 0,
    actual: 256332000,
    achievement: 0.0,
    appleSales: 198992000,
    androidSales: 52394000,
    accessoriesSales: 1946000,
    vasSales: 3000000,
    status: "Belum Tercapai",
    paceVsTimeGone: 0.0,
  },
  {
    rank: 6,
    salesId: "25015216",
    name: "Andrian Afi Syarfuan",
    target: 1658446763,
    actual: 240422000,
    achievement: 14.5,
    appleSales: 184291000,
    androidSales: 38142000,
    accessoriesSales: 9734000,
    vasSales: 8255000,
    status: "Belum Tercapai",
    paceVsTimeGone: -62.9,
  },
  {
    rank: 7,
    salesId: "26026303",
    name: "Surya Adi Permana",
    target: 1658446763,
    actual: 174451000,
    achievement: 10.5,
    appleSales: 128496000,
    androidSales: 31793000,
    accessoriesSales: 10302000,
    vasSales: 3860000,
    status: "Belum Tercapai",
    paceVsTimeGone: -66.9,
  },
];

// 4. DETAIL PRODUK PER KATEGORI
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

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [activeCategoryTab, setActiveCategoryTab] = useState<"apple" | "android" | "accessories" | "vas">("apple");
  const [searchStaff, setSearchStaff] = useState("");

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

  const filteredStaffRank = useMemo(() => {
    return STAFF_RANK_DATA.filter(
      (s) => s.name.toLowerCase().includes(searchStaff.toLowerCase()) || s.salesId.includes(searchStaff)
    );
  }, [searchStaff]);

  // HALAMAN LOGIN DENGAN BACKGROUND DEEP INDIGO (#1A1831) & TEKS WARM CLOUD (#FFF6E9)
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#1A1831] flex items-center justify-center p-4 text-[#FFF6E9] font-sans">
        <div className="max-w-md w-full bg-[#221F40] border-2 border-[#3B3666] rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-[#F5BA42] to-[#E65100] rounded-2xl mx-auto flex items-center justify-center font-black text-2xl text-[#1A1831] shadow-lg shadow-[#F5BA42]/20 mb-3">
              D+
            </div>
            <h1 className="text-xl font-bold text-[#FFF6E9]">DIGIPLUS GRAND INDONESIA</h1>
            <p className="text-xs text-[#F5BA42] mt-1 font-semibold tracking-wider">PORTAL LOGIN SALES & ADMIN (QF01)</p>
          </div>

          {loginErr && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-red-200 text-xs font-semibold text-center">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#FFF6E9]/80 uppercase tracking-wider">Sales ID / Admin ID</label>
              <input
                type="text"
                required
                placeholder="22008089 atau ID Anda"
                value={salesIdInput}
                onChange={(e) => setSalesIdInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-[#141226] border border-[#3B3666] text-[#FFF6E9] placeholder-[#FFF6E9]/40 text-sm focus:border-[#F5BA42] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#FFF6E9]/80 uppercase tracking-wider">Password</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-[#141226] border border-[#3B3666] text-[#FFF6E9] placeholder-[#FFF6E9]/40 text-sm focus:border-[#F5BA42] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-[#F5BA42] hover:bg-[#ffc857] text-[#1A1831] font-black rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg shadow-[#F5BA42]/20"
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
    <div className="flex min-h-screen bg-[#1A1831] text-[#FFF6E9] font-sans">
      {/* SIDEBAR KIRI BERWARNA DEEP INDIGO GELAP */}
      <aside className="w-72 bg-[#141226] border-r border-[#3B3666] flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div className="p-4 overflow-y-auto">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#3B3666]">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#F5BA42] to-[#E65100] rounded-xl flex items-center justify-center font-black text-[#1A1831] text-lg shadow-lg shadow-[#F5BA42]/20">
              D+
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#FFF6E9] tracking-wider">DIGIPLUS</h2>
              <p className="text-[10px] text-[#F5BA42] font-semibold">QF01 GRAND INDONESIA</p>
            </div>
          </div>

          {/* KOTAK SHORTCUT UPLOAD */}
          <div className="mt-4 p-4 rounded-2xl bg-[#221F40] border-2 border-[#F5BA42]/40 shadow-xl shadow-[#F5BA42]/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📤</span>
              <div>
                <h3 className="text-xs font-black text-[#F5BA42] uppercase tracking-wide">Upload Saleswise</h3>
                <a
                  href="https://docs.google.com/spreadsheets/d/1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM/edit#gid=483282286"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-[#FFF6E9]/60 hover:text-[#F5BA42] underline block"
                >
                  Sheet RAW (Kolom M, N, O) ↗
                </a>
              </div>
            </div>

            {uploadStatus.text && (
              <div
                className={`my-2 p-2 rounded-xl text-[10px] font-bold text-center leading-tight ${
                  uploadStatus.type === "success"
                    ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-200"
                    : uploadStatus.type === "error"
                    ? "bg-red-500/20 border border-red-400/40 text-red-200"
                    : "bg-[#141226] border border-[#3B3666] text-[#F5BA42]"
                }`}
              >
                {uploadStatus.text}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept=".xls,.xlsx" onChange={handleFileChange} className="hidden" />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-[#141226] hover:bg-[#2B274F] border border-[#F5BA42]/30 hover:border-[#F5BA42] text-[#FFF6E9] font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📁</span>
              <span className="truncate">{selectedFile ? selectedFile.name : "1. Pilih File .xls"}</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={uploadStatus.type === "loading"}
              className="w-full mt-2 py-2.5 px-3 bg-[#F5BA42] hover:bg-[#ffc857] text-[#1A1831] font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              {uploadStatus.type === "loading" ? "Mengirim..." : "2. Kirim ke Kolom M, N, O"}
            </button>
          </div>

          {/* Navigasi Menu */}
          <nav className="mt-5 space-y-1.5">
            <button
              onClick={() => setActiveTab("store-overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "store-overview" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">📊</span>
              <span>Overview Store & Kategori</span>
            </button>

            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "leaderboard" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">🏆</span>
              <span>Staff Performance</span>
            </button>

            <button
              onClick={() => setActiveTab("sales-detail")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales-detail" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">📋</span>
              <span>Rincian Penjualan LOB</span>
            </button>
          </nav>
        </div>

        <div className="p-4 border-t border-[#3B3666]">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        <header className="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-[#3B3666] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-[#F5BA42]/15 border border-[#F5BA42]/30 text-[#F5BA42] text-[10px] font-black uppercase">
                QF01 Grand Indonesia
              </span>
              <h1 className="text-xl font-bold text-[#FFF6E9]">RETAIL STORE PERFORMANCE ENGINE</h1>
            </div>
            <p className="text-xs text-[#FFF6E9]/70 mt-1">Periode: Oktober 2026 • Sumber Master: Sheet `TIME GONE`, `Dashboard QF01`, & `DATABASE`</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              Actual MTD: {formatIDR(STORE_TOTAL.actual)}
            </span>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB: STORE OVERVIEW (TIME GONE, TARGET, ACHV, VARIANCE)   */}
        {/* ========================================================= */}
        {activeTab === "store-overview" && (
          <div className="space-y-8">
            {/* 1. MODUL TIME GONE ANALYTICS */}
            <div className="p-6 bg-[#221F40] border-2 border-[#F5BA42]/35 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F5BA42]/20 border border-[#F5BA42]/40 flex items-center justify-center text-2xl font-bold text-[#F5BA42]">
                    ⏳
                  </div>
                  <div>
                    <h2 className="text-base font-black text-[#FFF6E9] tracking-wide">TIME GONE ANALYTICS (OKTOBER 2026)</h2>
                    <p className="text-xs text-[#FFF6E9]/70">
                      Hari Berjalan: <strong className="text-[#FFF6E9]">{TIME_GONE_METRIC.daysPassed} hari</strong> dari {TIME_GONE_METRIC.totalDays} hari ({TIME_GONE_METRIC.daysLeft} hari tersisa)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#FFF6E9]/60 block">Time Elapsed</span>
                    <span className="text-2xl font-black text-[#F5BA42]">{TIME_GONE_METRIC.percentageTimeGone}%</span>
                  </div>
                  <div className="h-8 w-px bg-[#3B3666] mx-1"></div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#FFF6E9]/60 block">Achv Pace</span>
                    <span className="text-2xl font-black text-emerald-300">{STORE_TOTAL.achievement}%</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar Dual Komparasi: Time Gone vs Actual Achv */}
              <div className="space-y-2 mb-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#FFF6E9]/70">Waktu Berjalan (Time Gone):</span>
                    <span className="font-bold text-[#F5BA42]">{TIME_GONE_METRIC.percentageTimeGone}% ({TIME_GONE_METRIC.daysPassed}/{TIME_GONE_METRIC.totalDays} Hari)</span>
                  </div>
                  <div className="w-full bg-[#141226] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#F5BA42] h-full rounded-full transition-all" style={{ width: `${TIME_GONE_METRIC.percentageTimeGone}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-[#FFF6E9]/70">Pencapaian Omset (Actual Revenue):</span>
                    <span className="font-bold text-emerald-300">{STORE_TOTAL.achievement}% ({formatIDR(STORE_TOTAL.actual)})</span>
                  </div>
                  <div className="w-full bg-[#141226] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full transition-all" style={{ width: `${STORE_TOTAL.achievement}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Status Pace & Run Rate Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#3B3666] text-xs">
                <div className="p-3 bg-[#141226] rounded-xl border border-[#3B3666]">
                  <span className="text-[#FFF6E9]/60 text-[11px]">Kesenjangan Pace Toko:</span>
                  <div className="text-sm font-black text-red-300 mt-0.5">
                    -{(TIME_GONE_METRIC.percentageTimeGone - STORE_TOTAL.achievement).toFixed(1)}% (Tertinggal)
                  </div>
                  <p className="text-[10px] text-[#FFF6E9]/50 mt-1">Omset tertinggal dibanding laju hari</p>
                </div>

                <div className="p-3 bg-[#141226] rounded-xl border border-[#3B3666]">
                  <span className="text-[#FFF6E9]/60 text-[11px]">Daily Run Rate Aktual:</span>
                  <div className="text-sm font-black text-sky-300 mt-0.5">
                    {formatIDR(TIME_GONE_METRIC.dailyActualRunRate)} / hari
                  </div>
                  <p className="text-[10px] text-[#FFF6E9]/50 mt-1">Rata-rata penjualan harian saat ini</p>
                </div>

                <div className="p-3 bg-[#141226] rounded-xl border border-[#3B3666]">
                  <span className="text-[#FFF6E9]/60 text-[11px]">Required Run Rate (7 Hari Sisa):</span>
                  <div className="text-sm font-black text-[#F5BA42] mt-0.5">
                    {formatIDR(TIME_GONE_METRIC.requiredDailyRunRate)} / hari
                  </div>
                  <p className="text-[10px] text-[#FFF6E9]/50 mt-1">Target harian untuk capai 100%</p>
                </div>
              </div>
            </div>

            {/* 2. TABEL LENGKAP: TARGET, ACHV, VARIANCE, ESTIMATE PER KATEGORI */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base font-bold text-[#FFF6E9]">Matriks Kategori Produk (Apple, Android, Accessories & VAS)</h2>
                <span className="text-[11px] text-[#FFF6E9]/60">Presisi 100% Tab Dashboard QF01</span>
              </div>

              <div className="bg-[#221F40] border border-[#3B3666] rounded-2xl overflow-x-auto shadow-2xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-4 px-4">Kategori Produk</th>
                      <th className="py-4 px-4 text-right">Actual Sales</th>
                      <th className="py-4 px-4 text-right">Target</th>
                      <th className="py-4 px-4 text-center">Achievement (%)</th>
                      <th className="py-4 px-4 text-right">Variance (Selisih)</th>
                      <th className="py-4 px-4 text-right">Estimate (Run Rate)</th>
                      <th className="py-4 px-4 text-center">Pace Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {STORE_OVERVIEW_METRICS.map((row, idx) => (
                      <tr key={idx} className="hover:bg-[#2B274F]/50 transition">
                        <td className="py-4 px-4 font-bold text-[#FFF6E9] text-sm">
                          <span className="mr-2">{row.icon}</span>
                          <span>{row.category}</span>
                        </td>
                        <td className={`py-4 px-4 text-right font-extrabold text-sm ${row.color}`}>
                          {formatIDR(row.actual)}
                        </td>
                        <td className="py-4 px-4 text-right text-[#FFF6E9]/80 font-mono">
                          {formatIDR(row.target)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${row.badgeBg}`}>
                            {row.achievement}%
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right text-red-300 font-mono font-bold">
                          {formatIDR(row.variance)}
                        </td>
                        <td className="py-4 px-4 text-right text-emerald-300 font-mono font-bold">
                          {formatIDR(row.estimate)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/15 text-red-200 border border-red-500/30">
                            {row.paceStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. RANK SALES PER STAFF (LENGKAP DI HALAMAN OVERVIEW) */}
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#FFF6E9]">🏆 Rank Sales per Staff & Pace Komparasi</h3>
                  <p className="text-xs text-[#FFF6E9]/70 mt-0.5">Peringkat performa staf dibandingkan Target Quota dan laju Time Gone (77,4%)</p>
                </div>
                <input
                  type="text"
                  placeholder="Cari Staf atau Sales ID..."
                  value={searchStaff}
                  onChange={(e) => setSearchStaff(e.target.value)}
                  className="px-3.5 py-2 bg-[#141226] border border-[#3B3666] rounded-xl text-xs text-[#FFF6E9] placeholder-[#FFF6E9]/40 focus:outline-none focus:border-[#F5BA42] max-w-xs"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Nama Salesperson</th>
                      <th className="py-3.5 px-4 text-right">Target</th>
                      <th className="py-3.5 px-4 text-right">Actual Penjualan</th>
                      <th className="py-3.5 px-4 text-center">Achv %</th>
                      <th className="py-3.5 px-4 text-center">Status Quota</th>
                      <th className="py-3.5 px-4 text-right">Pace vs Time Gone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {filteredStaffRank.map((s) => (
                      <tr
                        key={s.rank}
                        className={`hover:bg-[#2B274F]/50 transition ${
                          s.rank === 1 ? "bg-[#F5BA42]/10 font-bold" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                              s.rank === 1
                                ? "bg-[#F5BA42] text-[#1A1831] shadow-md shadow-[#F5BA42]/30"
                                : s.rank === 2
                                ? "bg-slate-300 text-[#1A1831]"
                                : s.rank === 3
                                ? "bg-amber-700 text-white"
                                : "text-[#FFF6E9]/60"
                            }`}
                          >
                            {s.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#FFF6E9] font-bold flex items-center gap-2">
                            <span>{s.name}</span>
                            {s.rank === 1 && (
                              <span className="text-[9px] bg-[#F5BA42] text-[#1A1831] px-2 py-0.2 rounded-full font-black uppercase">
                                Top Sales 👑
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-[#FFF6E9]/50 font-mono">ID: {s.salesId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#FFF6E9]/70 font-mono">
                          {s.target > 0 ? formatIDR(s.target) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-300 text-sm">
                          {formatIDR(s.actual)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-black ${s.achievement >= 100 ? "text-emerald-300" : "text-[#F5BA42]"}`}>
                            {s.achievement.toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === "Tercapai"
                                ? "bg-blue-500/15 text-blue-300 border border-blue-400/30"
                                : "bg-red-500/15 text-red-300 border border-red-400/30"
                            }`}
                          >
                            {s.status === "Tercapai" ? "🔵 Tercapai" : "🔻 Belum"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold">
                          <span className={s.paceVsTimeGone >= 0 ? "text-emerald-300" : "text-red-300"}>
                            {s.paceVsTimeGone > 0 ? `+${s.paceVsTimeGone.toFixed(1)}%` : `${s.paceVsTimeGone.toFixed(1)}%`}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. RINCIAN DETAIL PRODUK PER KATEGORI (INTERAKTIF TABS) */}
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl shadow-xl">
              <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                <div>
                  <h3 className="text-base font-bold text-[#FFF6E9]">Rincian Detail Produk Terjual per Kategori</h3>
                  <p className="text-xs text-[#FFF6E9]/70 mt-0.5">Komposisi item, revenue kontribusi, dan persentase share produk</p>
                </div>

                <div className="flex flex-wrap gap-2 bg-[#141226] p-1.5 rounded-2xl border border-[#3B3666]">
                  <button
                    onClick={() => setActiveCategoryTab("apple")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "apple" ? "bg-sky-500 text-[#1A1831] shadow-md shadow-sky-500/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🍎 Apple Devices
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab("android")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "android" ? "bg-indigo-500 text-[#FFF6E9] shadow-md shadow-indigo-500/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🤖 Android Devices
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab("accessories")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "accessories" ? "bg-[#F5BA42] text-[#1A1831] shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🔌 Accessories
                  </button>
                  <button
                    onClick={() => setActiveCategoryTab("vas")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      activeCategoryTab === "vas" ? "bg-purple-500 text-[#FFF6E9] shadow-md shadow-purple-500/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    🛡️ VAS (Qoala)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-3 px-4">Nama Produk & Tipe</th>
                      <th className="py-3 px-4">Artikel SAP</th>
                      <th className="py-3 px-4">Brand</th>
                      <th className="py-3 px-4 text-center">Qty Terjual</th>
                      <th className="py-3 px-4 text-right">Nilai Penjualan (Rp)</th>
                      <th className="py-3 px-4 text-right">Kontribusi Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {PRODUCT_DETAILS[activeCategoryTab].map((p, i) => (
                      <tr key={i} className="hover:bg-[#2B274F]/50 transition">
                        <td className="py-3.5 px-4 font-bold text-[#FFF6E9]">{p.name}</td>
                        <td className="py-3.5 px-4 font-mono text-[#FFF6E9]/60 text-[11px]">{p.sku}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#141226] text-[#FFF6E9]/80 font-semibold text-[10px] border border-[#3B3666]">
                            {p.brand}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-[#FFF6E9]">{p.qty} Unit</td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-300">
                          {formatIDR(p.revenue)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#F5BA42] font-bold">{p.share}</td>
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
            <h2 className="text-base font-bold text-[#FFF6E9]">🏆 Staff Sales Performance & Leaderboard</h2>
            <div className="bg-[#221F40] border border-[#3B3666] rounded-2xl overflow-x-auto shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                  <tr>
                    <th className="py-4 px-4 text-center">Rank</th>
                    <th className="py-4 px-4">Nama Salesperson</th>
                    <th className="py-4 px-4 text-right">Target</th>
                    <th className="py-4 px-4 text-right">Actual Sales</th>
                    <th className="py-4 px-4 text-center">Achievement</th>
                    <th className="py-4 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3B3666] font-medium">
                  {STAFF_RANK_DATA.map((s) => (
                    <tr key={s.rank} className={`hover:bg-[#2B274F]/50 transition ${s.rank === 1 ? "bg-[#F5BA42]/10 font-bold" : ""}`}>
                      <td className="py-4 px-4 text-center">
                        <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${s.rank === 1 ? "bg-[#F5BA42] text-[#1A1831]" : "text-[#FFF6E9]/60"}`}>
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-[#FFF6E9] text-sm">{s.name}</td>
                      <td className="py-4 px-4 text-right text-[#FFF6E9]/70 font-mono">{s.target > 0 ? formatIDR(s.target) : "-"}</td>
                      <td className="py-4 px-4 text-right text-emerald-300 font-extrabold text-sm">{formatIDR(s.actual)}</td>
                      <td className="py-4 px-4 text-center font-bold text-[#F5BA42]">{s.achievement.toFixed(1)}%</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${s.achievement >= 100 ? "bg-blue-500/20 text-blue-200" : "bg-red-500/20 text-red-200"}`}>
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
            <h2 className="text-base font-bold text-[#FFF6E9]">Breakdown LOB Sales</h2>
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-2xl">
              <p className="text-xs text-[#FFF6E9]/80 leading-relaxed">
                Total penjualan store didominasi oleh <strong>Apple Devices</strong> senilai Rp 2,51 Miliar (80,0%), diikuti <strong>Android Devices</strong> Rp 394 Juta (12,5%), <strong>Accessories</strong> Rp 60,1 Juta (1,9%), dan <strong>VAS Qoala</strong> Rp 45,0 Juta (1,4%).
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
