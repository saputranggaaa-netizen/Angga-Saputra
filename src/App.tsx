"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  TrendingUp,
  Users,
  Settings,
  Bell,
  LogOut,
  UploadCloud,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Smartphone,
  Headphones,
  CheckCircle2,
  Clock,
  Sparkles,
  Search
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Master Data Transaksi & Target QF01
const STORE_TARGET = 8728667173;
const STORE_ACTUAL = 3147828200;
const STORE_ACHIEVEMENT = 36.1;
const STORE_VARIANCE = -5580838973;
const STORE_ESTIMATE = 4065944758;

// Data Tren Mingguan untuk Recharts
const WEEKLY_CHART_DATA = [
  { week: "Week 1", sales: 725.8, target: 1969.0 },
  { week: "Week 2", sales: 935.9, target: 1969.0 },
  { week: "Week 3", sales: 815.7, target: 1969.0 },
  { week: "Week 4", sales: 670.4, target: 2821.6 }
];

// Matriks Kategori Produk Utama
const CATEGORY_CARDS = [
  {
    category: "Apple Devices",
    icon: Smartphone,
    actual: 2519060000,
    target: 6932151006,
    achv: 36.3,
    variance: -4413091006,
    accent: "from-blue-500 to-indigo-600",
    lightBg: "bg-blue-50 text-blue-600"
  },
  {
    category: "Android Devices",
    icon: Smartphone,
    actual: 394141000,
    target: 943691666,
    achv: 41.8,
    variance: -549550666,
    accent: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50 text-emerald-600"
  },
  {
    category: "Accessories",
    icon: Headphones,
    actual: 60156200,
    target: 460550560,
    achv: 13.1,
    variance: -400394360,
    accent: "from-amber-500 to-orange-600",
    lightBg: "bg-amber-50 text-amber-600"
  },
  {
    category: "VAS (Qoala/Telco)",
    icon: ShieldCheck,
    actual: 45070000,
    target: 392273940,
    achv: 11.5,
    variance: -347203940,
    accent: "from-purple-500 to-pink-600",
    lightBg: "bg-purple-50 text-purple-600"
  }
];

// Data Staf QF01 Grand Indonesia
const STAFF_LIST = [
  {
    rank: 1,
    id: "24004971",
    name: "Liesbeth Febrina",
    sales: 1420983000,
    target: 872866717,
    achv: 162.8,
    status: "Tercapai 👑",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 2,
    id: "24016878",
    name: "Yunita Anggraini",
    sales: 451008000,
    target: 1222013404,
    achv: 36.9,
    status: "Dalam Pantauan",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 3,
    id: "26028497",
    name: "Siti Amelia",
    sales: 301970200,
    target: 1658446763,
    achv: 18.2,
    status: "Perlu Perhatian",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 4,
    id: "25005333",
    name: "M. Adlii",
    sales: 269015000,
    target: 1658446763,
    achv: 16.2,
    status: "Perlu Perhatian",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 5,
    id: "26036846",
    name: "Bagas T Saputra",
    sales: 256332000,
    target: 0,
    achv: 0.0,
    status: "Dalam Pantauan",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 6,
    id: "25015216",
    name: "Andrian Afi",
    sales: 240422000,
    target: 1658446763,
    achv: 14.5,
    status: "Perlu Perhatian",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
  },
  {
    rank: 7,
    id: "26026303",
    name: "Surya Adi",
    sales: 174451000,
    target: 1658446763,
    achv: 10.5,
    status: "Perlu Perhatian",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
  }
];

export default function SoftNeumorphicDashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedStaff, setSelectedStaff] = useState(STAFF_LIST[0]);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Endpoint Apps Script untuk Sinkronisasi Sheet RAW SalesPerson
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbz2VUsReKqqJgPsG15L1pOAkmqoIWF2vApyD18jr5e_z0OVqagasa9yHXEe5fzMhoQmOw/exec";

  // Inisialisasi Tanggal & Waktu Real-Time
  useEffect(() => {
    setCurrentDate(new Date());
    const timer = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0
    }).format(val);
  };

  // Handler Upload XLS ke Google Sheets Kolom M, N, O
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Membaca file...");
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
          setUploadStatus("Engine parser belum siap, ulangi 2 detik lagi.");
          return;
        }
        const wb = XLSX.read(evt.target?.result, { type: "binary" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const mapped = rawJson.map((row) => [
          row[0] !== undefined ? String(row[0]) : "",
          row[1] !== undefined ? String(row[1]) : "",
          row[2] !== undefined ? String(row[2]) : ""
        ]);

        setUploadStatus("Mengirim ke sheet...");
        await fetch(APPS_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({
            action: "upload_saleswise",
            targetSheet: "RAW SalesPerson",
            columns: ["M", "N", "O"],
            fileName: file.name,
            data: mapped
          })
        });

        setUploadStatus("Tersinkron ke Kolom M, N, O!");
        setTimeout(() => setUploadStatus(""), 4000);
      } catch (err) {
        setUploadStatus("Gagal membaca file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const formattedDateString = useMemo(() => {
    if (!currentDate) return "Memuat tanggal...";
    return currentDate.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  }, [currentDate]);

  return (
    <div className="min-h-screen bg-[#F4F5FA] text-slate-800 font-sans flex flex-col xl:flex-row p-3 sm:p-5 lg:p-6 gap-6">
      {/* ========================================================================= */}
      {/* 1. SIDEBAR KIRI: FLOATING PILL SHAPE (#1E1E24)                             */}
      {/* ========================================================================= */}
      <aside className="w-full xl:w-24 bg-[#1E1E24] rounded-3xl p-5 flex xl:flex-col items-center justify-between shadow-[0_15px_35px_rgba(30,30,36,0.15)] shrink-0">
        <div className="flex xl:flex-col items-center gap-6">
          {/* Logo Ungu Aksen */}
          <div className="w-12 h-12 rounded-2xl bg-[#5B4DFB] flex items-center justify-center text-white font-black text-xl shadow-[0_8px_20px_rgba(91,77,251,0.45)]">
            D+
          </div>

          {/* Navigasi Ikon Minimalis */}
          <nav className="flex xl:flex-col items-center gap-3">
            {[
              { id: "overview", icon: LayoutDashboard, tooltip: "Dashboard Overview" },
              { id: "weekly", icon: TrendingUp, tooltip: "Weekly Sales" },
              { id: "staff", icon: Users, tooltip: "Staff Performance" },
              { id: "calendar", icon: CalendarDays, tooltip: "Kalender & Shift" },
              { id: "notif", icon: Bell, tooltip: "Notifikasi" },
              { id: "settings", icon: Settings, tooltip: "Pengaturan" }
            ].map((btn) => {
              const IconComp = btn.icon;
              const isActive = activeNav === btn.id;
              return (
                <button
                  key={btn.id}
                  onClick={() => setActiveNav(btn.id)}
                  title={btn.tooltip}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-[#5B4DFB] text-white shadow-[0_6px_18px_rgba(91,77,251,0.35)] scale-105"
                      : "text-slate-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <IconComp size={20} strokeWidth={isActive ? 2.5 : 2} />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Shortcut Upload & Logout */}
        <div className="flex xl:flex-col items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload Saleswise (.xls)"
            className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-[#5B4DFB] text-slate-300 hover:text-white flex items-center justify-center transition-all"
          >
            <UploadCloud size={20} />
          </button>

          <button
            onClick={() => alert("Sesi berhasil diakhiri.")}
            title="Keluar"
            className="w-12 h-12 rounded-2xl text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-all"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. KOLOM TENGAH: AREA KONTEN UTAMA                                         */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Header Bersih: Tanggal & Search Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Digiplus Grand Indonesia</span>
              <span>•</span>
              <span className="text-[#5B4DFB] font-bold">Store QF01</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 tracking-tight">
              Retail Sales Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
              <CalendarDays size={15} className="text-[#5B4DFB]" />
              <span>{formattedDateString}</span>
              <span className="text-slate-300">|</span>
              <Clock size={15} className="text-slate-400" />
              <span>
                {currentDate?.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })} WIB
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {uploadStatus && (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-200 animate-pulse">
                {uploadStatus}
              </span>
            )}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari transaksi / staf..."
                className="w-56 sm:w-64 pl-10 pr-4 py-2.5 rounded-full bg-white border border-slate-100 text-xs font-medium text-slate-700 shadow-[0_4px_12px_rgba(0,0,0,0.02)] focus:outline-none focus:border-[#5B4DFB] transition"
              />
            </div>
          </div>
        </header>

        {/* Kartu Ringkasan Besar (Store Target & Time Gone) */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-[#5B4DFB]/10 text-[#5B4DFB] text-xs font-extrabold uppercase tracking-wider">
                Performance MTD
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {formatCurrency(STORE_ACTUAL)}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                <span>Target: <strong>{formatCurrency(STORE_TARGET)}</strong></span>
                <span>•</span>
                <span>Variance: <strong className="text-rose-500">{formatCurrency(STORE_VARIANCE)}</strong></span>
                <span>•</span>
                <span>Estimate: <strong className="text-emerald-600">{formatCurrency(STORE_ESTIMATE)}</strong></span>
              </div>
            </div>

            {/* Time Gone Pill Visual */}
            <div className="bg-[#F8F9FD] p-4 sm:p-5 rounded-2xl border border-slate-100 flex items-center gap-6">
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Time Gone (24/31 Hari)</p>
                <p className="text-xl font-black text-slate-900 mt-0.5">77.4%</p>
                <p className="text-[11px] text-slate-400">Sisa 7 Hari Lagi</p>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Achievement Pace</p>
                <p className="text-xl font-black text-[#5B4DFB] mt-0.5">{STORE_ACHIEVEMENT}%</p>
                <p className="text-[11px] text-rose-500 font-bold">-41.3% Lagging</p>
              </div>
            </div>
          </div>

          {/* Progress Bar Soft */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-6">
            <div
              className="bg-gradient-to-r from-[#5B4DFB] to-purple-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${STORE_ACHIEVEMENT}%` }}
            />
          </div>
        </section>

        {/* Grid 4 Kartu Kategori LOB (Neumorphic Card) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {CATEGORY_CARDS.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <div
                key={i}
                className="bg-white rounded-3xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col justify-between hover:shadow-[0_15px_35px_rgba(91,77,251,0.08)] transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cat.lightBg} group-hover:scale-110 transition`}>
                      <Icon size={20} />
                    </span>
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-full">
                      {cat.achv}%
                    </span>
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{cat.category}</h3>
                  <div className="text-lg font-black text-slate-900 mt-1">{formatCurrency(cat.actual)}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex justify-between font-medium">
                  <span>Target: {formatCurrency(cat.target)}</span>
                </div>
              </div>
            );
          })}
        </section>

        {/* Grafik Recharts: Tren Mingguan Store */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Tren Penjualan Mingguan (Week to Week)</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Perbandingan omset aktual dan target mingguan dalam Miliar Rupiah</p>
            </div>
            <span className="text-xs font-bold text-[#5B4DFB] flex items-center gap-1">
              Live Chart <Sparkles size={14} />
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B4DFB" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#5B4DFB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F9" />
                <XAxis dataKey="week" tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E24",
                    borderRadius: "16px",
                    border: "none",
                    color: "#FFFFFF",
                    fontSize: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                  }}
                  itemStyle={{ color: "#FFF" }}
                />
                <Area type="monotone" dataKey="sales" stroke="#5B4DFB" strokeWidth={3} fillOpacity={1} fill="url(#purpleGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Tabel Evaluasi Performa Seluruh Staf */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Leaderboard & Evaluasi Kinerja Staf</h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Daftar lengkap seluruh tim sales toko tanpa pemotongan data</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FD] text-slate-400 uppercase text-[10px] font-bold tracking-wider rounded-2xl">
                <tr>
                  <th className="py-3 px-4 rounded-l-2xl">Rank</th>
                  <th className="py-3 px-4">Salesperson</th>
                  <th className="py-3 px-4 text-right">Actual Omset</th>
                  <th className="py-3 px-4 text-right">Target</th>
                  <th className="py-3 px-4 text-center">Achievement</th>
                  <th className="py-3 px-4 text-center rounded-r-2xl">Status Kinerja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {STAFF_LIST.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStaff(st)}
                    className="hover:bg-[#F8F9FD] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-xs ${
                        st.rank === 1 ? "bg-amber-100 text-amber-700" : "text-slate-400"
                      }`}>
                        #{st.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img src={st.avatar} alt={st.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{st.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {st.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600">{formatCurrency(st.sales)}</td>
                    <td className="py-3.5 px-4 text-right text-slate-400 font-mono">{st.target > 0 ? formatCurrency(st.target) : "-"}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`font-black ${st.achv >= 100 ? "text-emerald-600" : "text-[#5B4DFB]"}`}>
                        {st.achv > 0 ? `${st.achv.toFixed(1)}%` : "-"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        st.status.includes("Tercapai")
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                          : st.status.includes("Perhatian")
                          ? "bg-rose-50 text-rose-600 border border-rose-200"
                          : "bg-amber-50 text-amber-600 border border-amber-200"
                      }`}>
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 3. PANEL KANAN: PROFIL & KALENDER INTERAKTIF                               */}
      {/* ========================================================================= */}
      <aside className="w-full xl:w-80 flex flex-col gap-6 shrink-0">
        {/* Kartu Profil Pengguna Aktif */}
        <section className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col items-center text-center">
          <div className="relative mb-3">
            <img
              src={selectedStaff.avatar}
              alt={selectedStaff.name}
              className="w-20 h-20 rounded-full object-cover p-1 ring-4 ring-[#5B4DFB]/20 shadow-md"
            />
            <span className="absolute bottom-0 right-1 w-6 h-6 rounded-full bg-[#5B4DFB] text-white font-bold text-xs flex items-center justify-center border-2 border-white">
              #{selectedStaff.rank}
            </span>
          </div>
          <h2 className="text-base font-black text-slate-900">{selectedStaff.name}</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">Sales ID: {selectedStaff.id}</p>
          <span className="mt-2.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
            Store Sales Specialist
          </span>

          <div className="w-full grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-slate-100 text-left">
            <div className="bg-[#F8F9FD] p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Sales</span>
              <p className="text-xs font-black text-slate-900 mt-0.5">{formatCurrency(selectedStaff.sales)}</p>
            </div>
            <div className="bg-[#F8F9FD] p-3 rounded-2xl">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Pencapaian</span>
              <p className="text-xs font-black text-[#5B4DFB] mt-0.5">{selectedStaff.achv.toFixed(1)}%</p>
            </div>
          </div>
        </section>

        {/* Kalender Soft Neumorphic */}
        <section className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black text-slate-900">
              {currentDate?.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </h3>
            <span className="text-xs font-bold text-[#5B4DFB]">Bulan Berjalan</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            <span>M</span><span>S</span><span>S</span><span>R</span><span>K</span><span>J</span><span>S</span>
          </div>

          {/* Grid Tanggal Mini */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold">
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
              const isToday = currentDate?.getDate() === day;
              return (
                <div
                  key={day}
                  className={`h-8 rounded-xl flex items-center justify-center transition ${
                    isToday
                      ? "bg-[#5B4DFB] text-white shadow-[0_4px_12px_rgba(91,77,251,0.4)] scale-105"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </section>

        {/* Shortcut Info Store */}
        <section className="bg-gradient-to-br from-[#1E1E24] to-[#2B274F] rounded-3xl p-6 text-white shadow-[0_15px_35px_rgba(30,30,36,0.15)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5B4DFB]">Grand Indonesia</span>
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <h4 className="text-base font-black">Digiplus QF01 Engine</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Data disinkronkan secara langsung dari Google Sheets master <code>DATABASE</code> dan <code>RAW SalesPerson</code>.
          </p>
        </section>
      </aside>
    </div>
  );
}
