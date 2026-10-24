"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "store-overview" | "leaderboard" | "sales-detail";

interface SubProductMetric {
  name: string;
  target: number;
  actual: number;
  achievement: number;
  variance: number;
  estimate: number;
  qty: number;
}

interface StaffDetailedPerformance {
  rank: number;
  salesId: string;
  name: string;
  target: number;
  actual: number;
  achievement: number;
  variance: number;
  estimate: number;
  status: "Tercapai" | "Perlu Perhatian Khusus" | "Dalam Pantauan";
  attentionNotes: string[];
  appleSubProducts: SubProductMetric[];
  androidSubProducts: SubProductMetric[];
  topProductSold: string;
}

// 1. DATA MASTER TIME GONE & TOKO
const TIME_GONE_METRIC = {
  daysPassed: 24,
  totalDays: 31,
  daysLeft: 7,
  percentageTimeGone: 77.4,
  percentageTimeLeft: 22.6,
  dailyActualRunRate: 131159508,
  requiredDailyRunRate: 797262710,
};

const STORE_TOTAL = {
  actual: 3147828200,
  target: 8728667173,
  achievement: 36.1,
  variance: -5580838973,
  estimate: 4065944758,
};

// 2. DATA RINCIAN LENGKAP SETIAP STAF & SUB-PRODUK (APPLE & ANDROID)
const DETAILED_STAFF_PERFORMANCE: StaffDetailedPerformance[] = [
  {
    rank: 1,
    salesId: "24004971",
    name: "Liesbeth Febrina",
    target: 872866717,
    actual: 1420983000,
    achievement: 162.8,
    variance: 548116283,
    estimate: 1835436458,
    status: "Tercapai",
    attentionNotes: [
      "Performa sangat prima, target bulanan sudah terlampaui 162,8%.",
      "Penyumbang omset iPhone terbesar di toko (Rp 1,35 Miliar).",
      "Perlu dorongan tambahan pada lini MacBook & Apple Watch yang masih minim.",
    ],
    topProductSold: "iPhone 17 Pro Max 256GB / 512GB (41 unit)",
    appleSubProducts: [
      { name: "iPhone", target: 750000000, actual: 1353207000, achievement: 180.4, variance: 603207000, estimate: 1747892375, qty: 45 },
      { name: "iPad", target: 60000000, actual: 24884000, achievement: 41.5, variance: -35116000, estimate: 32141833, qty: 3 },
      { name: "MacBook", target: 30000000, actual: 0, achievement: 0.0, variance: -30000000, estimate: 0, qty: 0 },
      { name: "Apple Watch", target: 20000000, actual: 4499000, achievement: 22.5, variance: -15501000, estimate: 5811208, qty: 1 },
      { name: "AirPods", target: 12866717, actual: 4200000, achievement: 32.6, variance: -8666717, estimate: 5425000, qty: 2 },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 80000000, actual: 27992000, achievement: 35.0, variance: -52008000, estimate: 36156333, qty: 8 },
      { name: "Oppo Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0 },
      { name: "Motorola Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0 },
      { name: "Huawei Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0 },
      { name: "Infinix Devices", target: 5000000, actual: 0, achievement: 0.0, variance: -5000000, estimate: 0, qty: 0 },
      { name: "Xiaomi Devices", target: 5000000, actual: 0, achievement: 0.0, variance: -5000000, estimate: 0, qty: 0 },
    ],
  },
  {
    rank: 2,
    salesId: "24016878",
    name: "Yunita Anggraini",
    target: 1222013404,
    actual: 451008000,
    achievement: 36.9,
    variance: -771005404,
    estimate: 582552000,
    status: "Dalam Pantauan",
    attentionNotes: [
      "Achievement (36,9%) tertinggal dari laju waktu Time Gone (77,4%).",
      "Penjualan Samsung Devices sangat kuat (Galaxy S26 Ultra & Fold 8).",
      "Perlu fokus mengejar sisa gap target sebesar Rp 771 Juta dalam 7 hari sisa.",
    ],
    topProductSold: "Galaxy S26 Ultra 12/256GB & iPhone 15",
    appleSubProducts: [
      { name: "iPhone", target: 850000000, actual: 238190000, achievement: 28.0, variance: -611810000, estimate: 307662083, qty: 12 },
      { name: "iPad", target: 80000000, actual: 34796000, achievement: 43.5, variance: -45204000, estimate: 44944833, qty: 4 },
      { name: "MacBook", target: 50000000, actual: 0, achievement: 0.0, variance: -50000000, estimate: 0, qty: 0 },
      { name: "Apple Watch", target: 30000000, actual: 7104000, achievement: 23.7, variance: -22896000, estimate: 9176167, qty: 1 },
      { name: "AirPods", target: 20000000, actual: 4100000, achievement: 20.5, variance: -15900000, estimate: 5295833, qty: 2 },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 150000000, actual: 136044000, achievement: 90.7, variance: -13956000, estimate: 175723500, qty: 16 },
      { name: "Oppo Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0 },
      { name: "Motorola Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0 },
      { name: "Huawei Devices", target: 10000000, actual: 0, achievement: 0.0, variance: -10000000, estimate: 0, qty: 0 },
      { name: "Infinix Devices", target: 5000000, actual: 0, achievement: 0.0, variance: -5000000, estimate: 0, qty: 0 },
      { name: "Xiaomi Devices", target: 7013404, actual: 0, achievement: 0.0, variance: -7013404, estimate: 0, qty: 0 },
    ],
  },
  {
    rank: 3,
    salesId: "26028497",
    name: "Siti Amelia",
    target: 1658446763,
    actual: 301970200,
    achievement: 18.2,
    variance: -1356476563,
    estimate: 390044842,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "PERINGATAN DEFISIT: Target Rp 1,65 Miliar baru tercapai 18,2% (Pace tertinggal -59,2%).",
      "Defisit omset sangat besar (-Rp 1,35 Miliar).",
      "Penjualan Android selain Samsung masih nol (Oppo, Xiaomi, Huawei kosong).",
    ],
    topProductSold: "AirPods 4 & iPhone 17 Pro",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 212493000, achievement: 19.3, variance: -887507000, estimate: 274470125, qty: 8 },
      { name: "iPad", target: 100000000, actual: 17398000, achievement: 17.4, variance: -82602000, estimate: 22472417, qty: 2 },
      { name: "MacBook", target: 80000000, actual: 19803000, achievement: 24.8, variance: -60197000, estimate: 25578875, qty: 1 },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0 },
      { name: "AirPods", target: 30000000, actual: 4799000, achievement: 16.0, variance: -25201000, estimate: 6198708, qty: 2 },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 27392000, achievement: 13.7, variance: -172608000, estimate: 35381333, qty: 6 },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0 },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0 },
    ],
  },
  {
    rank: 4,
    salesId: "25005333",
    name: "M. Adlii",
    target: 1658446763,
    actual: 269015000,
    achievement: 16.2,
    variance: -1389431763,
    estimate: 347477708,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "PERINGATAN DEFISIT: Pencapaian hanya 16,2% dengan sisa waktu tinggal 22,6%.",
      "Defisit omset mencapai -Rp 1,38 Miliar terhadap target kuota.",
      "Lini MacBook, Apple Watch, dan seluruh brand Android Non-Samsung belum ada penjualan.",
    ],
    topProductSold: "iPhone 17 Pro Max 512GB",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 171742000, achievement: 15.6, variance: -928258000, estimate: 221833417, qty: 6 },
      { name: "iPad", target: 100000000, actual: 0, achievement: 0.0, variance: -100000000, estimate: 0, qty: 0 },
      { name: "MacBook", target: 80000000, actual: 0, achievement: 0.0, variance: -80000000, estimate: 0, qty: 0 },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0 },
      { name: "AirPods", target: 30000000, actual: 4497000, achievement: 15.0, variance: -25503000, estimate: 5808625, qty: 2 },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 80384000, achievement: 40.2, variance: -119616000, estimate: 103829333, qty: 8 },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0 },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0 },
    ],
  },
  {
    rank: 5,
    salesId: "26036846",
    name: "Bagas T Saputra",
    target: 0,
    actual: 256332000,
    achievement: 0.0,
    variance: 256332000,
    estimate: 331095500,
    status: "Dalam Pantauan",
    attentionNotes: [
      "Staf baru / non-quota resmi, namun berhasil mencatatkan omset Rp 256 Juta.",
      "Penjualan iPhone 16 128GB stabil.",
      "Perlu diberikan target resmi bulan depan untuk mengukur rasio produktivitas.",
    ],
    topProductSold: "iPhone 16 128GB Black & Pink",
    appleSubProducts: [
      { name: "iPhone", target: 0, actual: 198992000, achievement: 0.0, variance: 198992000, estimate: 257031333, qty: 9 },
      { name: "iPad", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
      { name: "MacBook", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
      { name: "Apple Watch", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
      { name: "AirPods", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 0, actual: 52394000, achievement: 0.0, variance: 52394000, estimate: 67675583, qty: 6 },
      { name: "Oppo Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
      { name: "Motorola Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
      { name: "Huawei Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
      { name: "Infinix Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
      { name: "Xiaomi Devices", target: 0, actual: 0, achievement: 0.0, variance: 0, estimate: 0, qty: 0 },
    ],
  },
  {
    rank: 6,
    salesId: "25015216",
    name: "Andrian Afi Syarfuan",
    target: 1658446763,
    actual: 240422000,
    achievement: 14.5,
    variance: -1418024763,
    estimate: 310545083,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "PERINGATAN KRITIS: Pencapaian terendah ke-2 (14,5%), defisit omset mencapai -Rp 1,41 Miliar.",
      "Produktivitas harian hanya Rp 10 Juta/hari, membutuhkan kenaikan 5x lipat untuk mendekati kuota.",
      "Attachment Qoala VAS cukup baik, namun unit device utama masih sangat rendah.",
    ],
    topProductSold: "iPhone 17 Pro Max 256GB Silver",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 184291000, achievement: 16.8, variance: -915709000, estimate: 238042542, qty: 7 },
      { name: "iPad", target: 100000000, actual: 0, achievement: 0.0, variance: -100000000, estimate: 0, qty: 0 },
      { name: "MacBook", target: 80000000, actual: 0, achievement: 0.0, variance: -80000000, estimate: 0, qty: 0 },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0 },
      { name: "AirPods", target: 30000000, actual: 0, achievement: 0.0, variance: -30000000, estimate: 0, qty: 0 },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 38142000, achievement: 19.1, variance: -161858000, estimate: 49266750, qty: 5 },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0 },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0 },
    ],
  },
  {
    rank: 7,
    salesId: "26026303",
    name: "Surya Adi Permana",
    target: 1658446763,
    actual: 174451000,
    achievement: 10.5,
    variance: -1483995763,
    estimate: 225332542,
    status: "Perlu Perhatian Khusus",
    attentionNotes: [
      "PERINGATAN PALING KRITIS: Peringkat terendah di toko dengan pencapaian hanya 10,5%.",
      "Defisit omset terbesar di toko (-Rp 1,48 Miliar).",
      "Penjualan iPad, MacBook, dan seluruh brand Android di luar Samsung tercatat kosong (0 unit).",
      "Memerlukan coaching intensif strategi penawaran paket cicilan / BNPL.",
    ],
    topProductSold: "Galaxy A07 4/64GB & MagSafe Case",
    appleSubProducts: [
      { name: "iPhone", target: 1100000000, actual: 128496000, achievement: 11.7, variance: -971504000, estimate: 165974000, qty: 5 },
      { name: "iPad", target: 100000000, actual: 0, achievement: 0.0, variance: -100000000, estimate: 0, qty: 0 },
      { name: "MacBook", target: 80000000, actual: 0, achievement: 0.0, variance: -80000000, estimate: 0, qty: 0 },
      { name: "Apple Watch", target: 40000000, actual: 0, achievement: 0.0, variance: -40000000, estimate: 0, qty: 0 },
      { name: "AirPods", target: 30000000, actual: 0, achievement: 0.0, variance: -30000000, estimate: 0, qty: 0 },
    ],
    androidSubProducts: [
      { name: "Samsung Devices", target: 200000000, actual: 31793000, achievement: 15.9, variance: -168207000, estimate: 41065958, qty: 5 },
      { name: "Oppo Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Motorola Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Huawei Devices", target: 25000000, actual: 0, achievement: 0.0, variance: -25000000, estimate: 0, qty: 0 },
      { name: "Infinix Devices", target: 15000000, actual: 0, achievement: 0.0, variance: -15000000, estimate: 0, qty: 0 },
      { name: "Xiaomi Devices", target: 18446763, actual: 0, achievement: 0.0, variance: -18446763, estimate: 0, qty: 0 },
    ],
  },
];

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("leaderboard");
  const [selectedStaffIndex, setSelectedStaffIndex] = useState(0);
  const [subLOBTab, setSubLOBTab] = useState<"apple" | "android">("apple");

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

  const currentStaff = DETAILED_STAFF_PERFORMANCE[selectedStaffIndex];

  // Daftar Staf yang Memerlukan Perhatian Khusus
  const attentionStaffList = useMemo(() => {
    return DETAILED_STAFF_PERFORMANCE.filter((s) => s.status === "Perlu Perhatian Khusus");
  }, []);

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
      {/* SIDEBAR KIRI */}
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
              onClick={() => setActiveTab("leaderboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "leaderboard" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">🏆</span>
              <span>Staff Performance Detail</span>
            </button>

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
              onClick={() => setActiveTab("sales-detail")}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales-detail" ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md shadow-[#F5BA42]/20" : "text-[#FFF6E9]/70 hover:text-[#FFF6E9] hover:bg-[#221F40]"
              }`}
            >
              <span className="text-base">📋</span>
              <span>Rincian LOB Penjualan</span>
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
              <h1 className="text-xl font-bold text-[#FFF6E9]">STAFF SALES PERFORMANCE & PRODUCTIVITY</h1>
            </div>
            <p className="text-xs text-[#FFF6E9]/70 mt-1">Breakdown Sub-Lini Apple, Android, & Analisis Staf Perlu Perhatian Khusus</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
              Time Gone: {TIME_GONE_METRIC.percentageTimeGone}% (Day {TIME_GONE_METRIC.daysPassed}/31)
            </span>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TAB: STAFF PERFORMANCE DETAIL (FITUR BARU LENGKAP)        */}
        {/* ========================================================= */}
        {activeTab === "leaderboard" && (
          <div className="space-y-8">
            {/* 1. KARTU PERINGATAN: STAF YANG PERLU DIPERHATIKAN PENJUALANNYA */}
            <div className="p-6 bg-[#221F40] border-2 border-red-400/40 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-400/40 flex items-center justify-center text-xl font-bold text-red-300">
                  ⚠️
                </div>
                <div>
                  <h2 className="text-base font-black text-red-300 uppercase tracking-wide">
                    PERHATIAN KHUSUS: STAF TERTINGGAL TARGET PENJUALAN
                  </h2>
                  <p className="text-xs text-[#FFF6E9]/70">
                    Staf dengan pencapaian di bawah 20% dan defisit variance di atas Rp 1,3 Miliar terhadap kuota waktu berjalan (77,4%)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {attentionStaffList.map((st) => (
                  <div
                    key={st.salesId}
                    onClick={() => {
                      const idx = DETAILED_STAFF_PERFORMANCE.findIndex((x) => x.salesId === st.salesId);
                      if (idx !== -1) setSelectedStaffIndex(idx);
                    }}
                    className="p-4 bg-[#141226] border border-red-500/30 hover:border-red-400 rounded-2xl cursor-pointer transition"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-white">{st.name}</span>
                      <span className="text-[10px] bg-red-500/20 text-red-200 border border-red-400/30 px-1.5 py-0.2 rounded font-black">
                        #{st.rank}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#FFF6E9]/60 font-mono">ID: {st.salesId}</div>
                    <div className="mt-2 text-sm font-black text-red-300">{formatIDR(st.actual)}</div>
                    <div className="flex justify-between text-[10px] text-[#FFF6E9]/70 mt-1">
                      <span>Achv: <strong className="text-amber-300">{st.achievement}%</strong></span>
                      <span className="text-red-400 font-bold">{formatIDR(st.variance)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. TABEL RINGKASAN SELURUH SALES & STATUS KINERJA */}
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl shadow-xl">
              <h3 className="text-base font-bold text-[#FFF6E9] mb-4">🏆 Peringkat Salesperson & Evaluasi Kinerja Toko</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">Salesperson</th>
                      <th className="py-3.5 px-4 text-right">Target Kuota</th>
                      <th className="py-3.5 px-4 text-right">Actual Penjualan</th>
                      <th className="py-3.5 px-4 text-center">Achv (%)</th>
                      <th className="py-3.5 px-4 text-right">Variance</th>
                      <th className="py-3.5 px-4 text-right">Estimate Akhir Bulan</th>
                      <th className="py-3.5 px-4 text-center">Status & Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {DETAILED_STAFF_PERFORMANCE.map((st, index) => (
                      <tr
                        key={st.salesId}
                        onClick={() => setSelectedStaffIndex(index)}
                        className={`cursor-pointer transition ${
                          selectedStaffIndex === index
                            ? "bg-[#2B274F] border-l-4 border-l-[#F5BA42]"
                            : "hover:bg-[#2B274F]/50"
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                              st.rank === 1
                                ? "bg-[#F5BA42] text-[#1A1831]"
                                : st.rank === 2
                                ? "bg-slate-300 text-[#1A1831]"
                                : st.rank === 3
                                ? "bg-amber-700 text-white"
                                : "text-[#FFF6E9]/60"
                            }`}
                          >
                            {st.rank}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#FFF6E9] font-bold text-sm">{st.name}</div>
                          <div className="text-[10px] text-[#FFF6E9]/50 font-mono">ID: {st.salesId}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right text-[#FFF6E9]/70 font-mono">
                          {st.target > 0 ? formatIDR(st.target) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-extrabold text-emerald-300 text-sm">
                          {formatIDR(st.actual)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`font-black ${st.achievement >= 100 ? "text-emerald-300" : "text-[#F5BA42]"}`}>
                            {st.achievement > 0 ? `${st.achievement.toFixed(1)}%` : "-"}
                          </span>
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold ${st.variance >= 0 ? "text-emerald-300" : "text-red-300"}`}>
                          {st.target > 0 ? formatIDR(st.variance) : "-"}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-300">
                          {formatIDR(st.estimate)}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.status === "Tercapai"
                                ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                                : st.status === "Perlu Perhatian Khusus"
                                ? "bg-red-500/20 text-red-300 border border-red-400/30 animate-pulse"
                                : "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 3. PANEL RINCIAN SUB-LINI PRODUK STAF TERPILIH */}
            <div className="p-6 bg-[#221F40] border-2 border-[#F5BA42]/40 rounded-3xl shadow-2xl">
              {/* Header Staf Terpilih */}
              <div className="flex flex-wrap justify-between items-center gap-4 pb-4 border-b border-[#3B3666] mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#F5BA42] tracking-widest block">
                    Detail Sub-Lini Produk Salesperson
                  </span>
                  <h2 className="text-2xl font-black text-[#FFF6E9] mt-0.5 flex items-center gap-2">
                    <span>{currentStaff.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F5BA42] text-[#1A1831] font-black">
                      Rank #{currentStaff.rank}
                    </span>
                  </h2>
                  <p className="text-xs text-[#FFF6E9]/70 mt-1">
                    Top Selling Unit: <strong className="text-emerald-300">{currentStaff.topProductSold}</strong>
                  </p>
                </div>

                {/* Sub Tab Pemilih Kategori: Apple vs Android */}
                <div className="flex gap-2 bg-[#141226] p-1.5 rounded-2xl border border-[#3B3666]">
                  <button
                    onClick={() => setSubLOBTab("apple")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      subLOBTab === "apple"
                        ? "bg-sky-500 text-[#1A1831] shadow-lg shadow-sky-500/20"
                        : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    <span>🍎</span>
                    <span>Apple Devices (iPhone, iPad, Mac, Watch, AirPods)</span>
                  </button>

                  <button
                    onClick={() => setSubLOBTab("android")}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                      subLOBTab === "android"
                        ? "bg-indigo-500 text-[#FFF6E9] shadow-lg shadow-indigo-500/20"
                        : "text-[#FFF6E9]/70 hover:text-[#FFF6E9]"
                    }`}
                  >
                    <span>🤖</span>
                    <span>Android Devices (Samsung, Oppo, Moto, Huawei, dll)</span>
                  </button>
                </div>
              </div>

              {/* Catatan Evaluasi Penjualan Staf */}
              <div className="mb-6 p-4 bg-[#141226] rounded-2xl border border-[#3B3666]">
                <h4 className="text-xs font-bold text-[#F5BA42] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span>📌</span>
                  <span>Catatan Evaluasi Penjualan & Rekomendasi Leader:</span>
                </h4>
                <ul className="space-y-1 text-xs text-[#FFF6E9]/80 list-disc list-inside">
                  {currentStaff.attentionNotes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Tabel Detail Sub-Lini Terpilih */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#141226] text-[#FFF6E9]/70 uppercase text-[11px] border-b border-[#3B3666]">
                    <tr>
                      <th className="py-4 px-4">Lini Produk</th>
                      <th className="py-4 px-4 text-center">Qty Terjual</th>
                      <th className="py-4 px-4 text-right">Target Lini</th>
                      <th className="py-4 px-4 text-right">Actual Sales</th>
                      <th className="py-4 px-4 text-center">Achievement (%)</th>
                      <th className="py-4 px-4 text-right">Variance</th>
                      <th className="py-4 px-4 text-right">Estimate (Run Rate)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3B3666] font-medium">
                    {(subLOBTab === "apple" ? currentStaff.appleSubProducts : currentStaff.androidSubProducts).map(
                      (sub, idx) => (
                        <tr key={idx} className="hover:bg-[#2B274F]/50 transition">
                          <td className="py-4 px-4 font-bold text-[#FFF6E9] text-sm">
                            {subLOBTab === "apple" ? "🍎" : "⚡"} {sub.name}
                          </td>
                          <td className="py-4 px-4 text-center font-bold text-white">{sub.qty} Unit</td>
                          <td className="py-4 px-4 text-right text-[#FFF6E9]/70 font-mono">
                            {sub.target > 0 ? formatIDR(sub.target) : "-"}
                          </td>
                          <td className="py-4 px-4 text-right font-extrabold text-emerald-300 text-sm">
                            {formatIDR(sub.actual)}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                                sub.actual === 0
                                  ? "bg-slate-800 text-slate-500 border-slate-700"
                                  : sub.achievement >= 100
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                                  : "bg-amber-500/20 text-amber-300 border-amber-400/30"
                              }`}
                            >
                              {sub.target > 0 ? `${sub.achievement.toFixed(1)}%` : sub.actual > 0 ? "100%" : "0%"}
                            </span>
                          </td>
                          <td
                            className={`py-4 px-4 text-right font-mono font-bold ${
                              sub.variance >= 0 ? "text-emerald-300" : "text-red-300"
                            }`}
                          >
                            {sub.target > 0 ? formatIDR(sub.variance) : "-"}
                          </td>
                          <td className="py-4 px-4 text-right text-emerald-300 font-mono font-bold">
                            {formatIDR(sub.estimate)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: OVERVIEW STORE */}
        {activeTab === "store-overview" && (
          <div className="space-y-6">
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-3xl">
              <h2 className="text-base font-bold text-white mb-2">Total Penjualan Store QF01 Grand Indonesia</h2>
              <div className="text-3xl font-black text-emerald-300">{formatIDR(STORE_TOTAL.actual)}</div>
              <p className="text-xs text-[#FFF6E9]/70 mt-1">Target: {formatIDR(STORE_TOTAL.target)} ({STORE_TOTAL.achievement}% Achieved)</p>
            </div>
          </div>
        )}

        {/* TAB 3: RINCIAN PENJUALAN LOB */}
        {activeTab === "sales-detail" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-[#FFF6E9]">Breakdown LOB Sales</h2>
            <div className="p-6 bg-[#221F40] border border-[#3B3666] rounded-2xl">
              <p className="text-xs text-[#FFF6E9]/80 leading-relaxed">
                Total penjualan store terdiri dari <strong>Apple Devices</strong> senilai Rp 2,51 Miliar, <strong>Android Devices</strong> Rp 394 Juta, <strong>Accessories</strong> Rp 60,1 Juta, dan <strong>VAS</strong> Rp 45,0 Juta.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
