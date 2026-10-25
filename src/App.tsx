"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  STORE_CONFIG 
} from "@/config/store.config";
import { 
  calculateAchievement, 
  calculateGap, 
  calculateUPT, 
  calculateATV, 
  calculateCVR, 
  calculateWoWGrowth,
  formatCurrencyIDR 
} from "@/lib/calculations";
import { 
  TabType, 
  ThemeMode, 
  TransactionRecord, 
  BnplRecord, 
  StaffTarget, 
  LoginActivityLog 
} from "@/types/dashboard";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { WhatsAppShareButton } from "@/components/ui/WhatsAppShare";
import { 
  Smartphone, 
  Headphones, 
  ShieldCheck, 
  Sun, 
  Moon, 
  LogOut, 
  TrendingUp, 
  Users, 
  CreditCard, 
  LayoutDashboard, 
  History, 
  Calendar,
  AlertTriangle
} from "lucide-react";

export default function DashboardProduction() {
  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // UI Theme & Segmented Tabs
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<TabType>("store-overview");
  
  // Filter Date & Week
  const [filterWeek, setFilterWeek] = useState("ALL");
  const [filterMonth, setFilterMonth] = useState("2026-10");

  // Bottom Sheet Interactive States
  const [activeSheet, setActiveSheet] = useState<"UPT" | "INVOICE" | "QTY" | "LOB_DETAIL" | null>(null);
  const [selectedLobTitle, setSelectedLobTitle] = useState("");

  // Audit Logs (Khusus Admin Sales ID)
  const [auditLogs, setAuditLogs] = useState<LoginActivityLog[]>([]);

  // Toggle Theme Handler
  const isDark = theme === "dark";
  const themeClasses = isDark 
    ? "bg-[#1A1831] text-[#FFF6E9]" 
    : "bg-[#F9F8F3] text-[#1E293B]";
  const cardClasses = isDark 
    ? "bg-[#221F40] border-[#3B3666]" 
    : "bg-white border-[#E5E2D9] shadow-sm";
  const innerCardClasses = isDark 
    ? "bg-[#141226] border-[#3B3666]" 
    : "bg-[#F2EFE9] border-[#E5E2D9]";
  const accentColor = isDark ? "text-[#F5BA42]" : "text-[#054ff0]";
  const accentBtn = isDark 
    ? "bg-[#F5BA42] text-[#1A1831] hover:bg-[#ffc857]" 
    : "bg-[#054ff0] text-white hover:bg-blue-700";

  // Check Local Session on Mount
  useEffect(() => {
    const session = localStorage.getItem("store_ops_session");
    if (session) {
      try {
        const parsed = JSON.parse(session);
        setCurrentUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("store_ops_session");
      }
    }
  }, []);

  // Login Execution
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError("Harap masukkan ID Karyawan dan Kata Sandi.");
      return;
    }

    const userData = {
      id: loginId.trim(),
      name: loginId.trim() === STORE_CONFIG.adminSalesId ? "Store Leader / Supervisor" : `Staff (${loginId.trim()})`,
    };

    localStorage.setItem("store_ops_session", JSON.stringify(userData));
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setLoginError("");

    // Catat Activity Audit
    const newLog: LoginActivityLog = {
      id: Date.now().toString(),
      salesId: userData.id,
      salesName: userData.name,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
      deviceType: typeof window !== "undefined" && window.innerWidth < 768 ? "Handphone / Mobile" : "Komputer / PC",
      location: STORE_CONFIG.storeLocation,
      coordinates: "-6.1953, 106.8219",
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 30)]);
  };

  const handleLogout = () => {
    localStorage.removeItem("store_ops_session");
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // State Contoh Abstraksi Data (Siap dihubungkan ke API / Sheets)
  const storeKPI = {
    actual: 3150827200,
    target: 8728667173,
    traffic: 1250,
    transactions: 181,
    qty: 312,
  };

  const storeAchv = calculateAchievement(storeKPI.actual, storeKPI.target);
  const storeGap = calculateGap(storeKPI.actual, storeKPI.target);
  const storeUPT = calculateUPT(storeKPI.qty, storeKPI.transactions);
  const storeATV = calculateATV(storeKPI.actual, storeKPI.transactions);
  const storeCVR = calculateCVR(storeKPI.transactions, storeKPI.traffic);

  // ==========================================
  // JIKA BELUM LOGIN: HALAMAN LOGIN SECURE
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className={`min-h-screen ${themeClasses} flex items-center justify-center p-4 font-sans`}>
        <div className={`max-w-md w-full ${cardClasses} border rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6`}>
          <div className="text-center space-y-2">
            <div className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-xl font-black ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"}`}>
              D+
            </div>
            <h1 className="text-xl font-bold tracking-tight">{STORE_CONFIG.storeName}</h1>
            <p className="text-xs opacity-70">Masuk menggunakan Employee ID / NIK untuk memonitor operasional</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-500 font-bold text-center">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">Employee ID / NIK</label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Masukkan Sales ID Anda"
                className={`w-full px-4 py-3 rounded-xl border ${innerCardClasses} text-sm focus:outline-none`}
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider block mb-1">Kata Sandi</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border ${innerCardClasses} text-sm focus:outline-none`}
              />
            </div>
            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition ${accentBtn}`}
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD UTAMA
  // ==========================================
  return (
    <div className={`min-h-screen ${themeClasses} font-sans pb-24 lg:pb-8 flex flex-col`}>
      {/* HEADER UTAMA */}
      <header className={`sticky top-0 z-30 border-b ${cardClasses} px-4 py-3 backdrop-blur-md bg-opacity-90`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className={`text-base sm:text-lg font-black ${accentColor}`}>
              Halo, {currentUser?.name} 👋
            </span>
            <p className="text-[11px] opacity-70">
              {STORE_CONFIG.storeName} • {STORE_CONFIG.storeLocation}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              className={`p-2 rounded-xl border ${innerCardClasses} text-xs font-bold flex items-center gap-1`}
              title="Ganti Tema"
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 text-xs font-bold"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* SEGMENTED TABS (NAVIGASI ATAS ZERO-RELOAD) */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: "store-overview", label: "Executive Overview", icon: LayoutDashboard },
            { id: "today-sales", label: "Hari Ini & Interaktif", icon: Calendar },
            { id: "weekly-sales", label: "Weekly (WoW)", icon: TrendingUp },
            { id: "staff-performance", label: "Staff Detail", icon: Users },
            { id: "bnpl", label: "BNPL Leasing", icon: CreditCard },
            ...(currentUser?.id === STORE_CONFIG.adminSalesId 
              ? [{ id: "admin-audit" as TabType, label: "Activity Staff", icon: History }] 
              : []
            ),
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive ? accentBtn : `${innerCardClasses} opacity-70 hover:opacity-100`
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* AREA KONTEN UTAMA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* ========================================================= */}
        {/* TAB 1: EXECUTIVE STORE OVERVIEW                           */}
        {/* ========================================================= */}
        {activeTab === "store-overview" && (
          <div className="space-y-6">
            {/* HERO KPI TOTAL SALES */}
            <div className={`p-5 sm:p-6 rounded-3xl border-2 ${cardClasses} space-y-4`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Hero KPI • Total Sales MTD</span>
                  <div className="text-3xl sm:text-4xl font-black mt-1 tracking-tight">
                    {formatCurrencyIDR(storeKPI.actual)}
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs opacity-80 mt-1">
                    <span>Target: <strong>{formatCurrencyIDR(storeKPI.target)}</strong></span>
                    <span>•</span>
                    <span className="text-rose-500 font-bold">Gap: {formatCurrencyIDR(storeGap)}</span>
                    <span>•</span>
                    <span>Est: <strong className="text-emerald-500">{formatCurrencyIDR(4069818467)}</strong></span>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <span className={`text-2xl sm:text-3xl font-black ${accentColor}`}>{storeAchv}%</span>
                  <p className="text-[10px] opacity-60 uppercase font-bold">Achievement</p>
                  <WhatsAppShareButton
                    storeName={STORE_CONFIG.storeName}
                    actual={formatCurrencyIDR(storeKPI.actual)}
                    target={formatCurrencyIDR(storeKPI.target)}
                    achv={storeAchv}
                    gap={formatCurrencyIDR(storeGap)}
                    upt={storeUPT}
                    periodText="Oktober 2026"
                  />
                </div>
              </div>

              {/* Progress Bar */}
              <div className={`w-full h-3 rounded-full overflow-hidden ${innerCardClasses}`}>
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${isDark ? "bg-[#F5BA42]" : "bg-[#054ff0]"}`}
                  style={{ width: `${Math.min(storeAchv, 100)}%` }}
                />
              </div>

              {/* TIME GONE CARD */}
              <div className={`p-4 rounded-2xl border ${innerCardClasses} flex flex-wrap items-center justify-between gap-4 text-xs`}>
                <div>
                  <span className="opacity-60 block">Time Gone (Hari Berjalan):</span>
                  <strong className="text-sm">24 dari 31 Hari (77,4%)</strong>
                </div>
                <div>
                  <span className="opacity-60 block">Status Pace Omset:</span>
                  <strong className="text-sm text-red-500">-41,3% (Tertinggal)</strong>
                </div>
                <div>
                  <span className="opacity-60 block">Required Daily Run Rate:</span>
                  <strong className="text-sm text-emerald-500">{formatCurrencyIDR(797262710)}/hari</strong>
                </div>
              </div>
            </div>

            {/* SECONDARY OPERATIONAL METRIC CARDS (CVR, ATV, UPT, TRAFFIC) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className={`p-4 rounded-2xl border ${cardClasses}`}>
                <span className="text-[10px] font-bold opacity-60 uppercase block">UPT</span>
                <span className="text-xl font-black text-sky-500">{storeUPT}</span>
                <span className="text-[10px] opacity-60 block">Unit / Struk</span>
              </div>
              <div className={`p-4 rounded-2xl border ${cardClasses}`}>
                <span className="text-[10px] font-bold opacity-60 uppercase block">ATV</span>
                <span className="text-xl font-black">{formatCurrencyIDR(storeATV)}</span>
                <span className="text-[10px] opacity-60 block">Avg Basket Size</span>
              </div>
              <div className={`p-4 rounded-2xl border ${cardClasses}`}>
                <span className="text-[10px] font-bold opacity-60 uppercase block">CVR</span>
                <span className="text-xl font-black text-emerald-500">{storeCVR}%</span>
                <span className="text-[10px] opacity-60 block">Trans / Traffic</span>
              </div>
              <div className={`p-4 rounded-2xl border ${cardClasses}`}>
                <span className="text-[10px] font-bold opacity-60 uppercase block">Traffic</span>
                <span className="text-xl font-black text-amber-500">{storeKPI.traffic}</span>
                <span className="text-[10px] opacity-60 block">Pengunjung</span>
              </div>
            </div>

            {/* MATRIKS LOB TARGET & ESTIMATE */}
            <div className={`p-5 rounded-3xl border ${cardClasses} space-y-3`}>
              <h3 className="text-sm font-bold uppercase tracking-wider">Matriks Kategori Produk (Apple, Android, Acc, VAS)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className={`${innerCardClasses} text-[10px] uppercase border-b border-inherit`}>
                    <tr>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3 text-right">Actual</th>
                      <th className="py-2.5 px-3 text-right">Target</th>
                      <th className="py-2.5 px-3 text-center">Achv %</th>
                      <th className="py-2.5 px-3 text-right">Gap</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit">
                    {OVERVIEW_LOB_DATA.map((lob, idx) => (
                      <tr key={idx} className="hover:opacity-90">
                        <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                          <span>{lob.icon}</span>
                          <span>{lob.category}</span>
                        </td>
                        <td className={`py-2.5 px-3 text-right font-bold ${lob.color}`}>{formatCurrencyIDR(lob.actual)}</td>
                        <td className="py-2.5 px-3 text-right opacity-70 font-mono">{formatCurrencyIDR(lob.target)}</td>
                        <td className="py-2.5 px-3 text-center font-black">{lob.achievement}%</td>
                        <td className="py-2.5 px-3 text-right font-mono text-red-500">{formatCurrencyIDR(lob.variance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: TODAY SALES & TAPPABLE BOTTOM SHEETS              */}
        {/* ========================================================= */}
        {activeTab === "today-sales" && (
          <div className="space-y-6">
            <div className={`p-5 rounded-3xl border ${cardClasses} space-y-4`}>
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider">Daily Sales & Tappable Metrics</h3>
                <span className="text-[10px] opacity-70">Ketuk metrik untuk detail</span>
              </div>

              {/* Tappable LOB Breakdown */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { setSelectedLobTitle("Detail Transaksi Device Hari Ini"); setActiveSheet("LOB_DETAIL"); }}
                  className={`p-3.5 rounded-2xl border text-center transition active:scale-95 ${innerCardClasses}`}
                >
                  <Smartphone size={20} className="mx-auto mb-1 text-sky-400" />
                  <span className="text-[10px] font-bold block opacity-70">DEVICE</span>
                  <span className="text-xs font-black">{formatCurrencyIDR(85400000)}</span>
                </button>
                <button
                  onClick={() => { setSelectedLobTitle("Detail Transaksi Accessories Hari Ini"); setActiveSheet("LOB_DETAIL"); }}
                  className={`p-3.5 rounded-2xl border text-center transition active:scale-95 ${innerCardClasses}`}
                >
                  <Headphones size={20} className="mx-auto mb-1 text-amber-400" />
                  <span className="text-[10px] font-bold block opacity-70">ACC</span>
                  <span className="text-xs font-black">{formatCurrencyIDR(4190000)}</span>
                </button>
                <button
                  onClick={() => { setSelectedLobTitle("Detail Transaksi VAS (Qoala/Telco)"); setActiveSheet("LOB_DETAIL"); }}
                  className={`p-3.5 rounded-2xl border text-center transition active:scale-95 ${innerCardClasses}`}
                >
                  <ShieldCheck size={20} className="mx-auto mb-1 text-purple-400" />
                  <span className="text-[10px] font-bold block opacity-70">VAS</span>
                  <span className="text-xs font-black">{formatCurrencyIDR(3490000)}</span>
                </button>
              </div>

              {/* Tappable UPT / INVOICE / QTY */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <button
                  onClick={() => setActiveSheet("UPT")}
                  className={`p-3.5 rounded-2xl border text-center transition active:scale-95 ${innerCardClasses}`}
                >
                  <span className="text-[10px] font-bold block opacity-70">TAP UPT</span>
                  <span className="text-lg font-black text-sky-500">1.85</span>
                  <span className="text-[9px] opacity-60 block">Rata-rata Struk</span>
                </button>

                <button
                  onClick={() => setActiveSheet("INVOICE")}
                  className={`p-3.5 rounded-2xl border text-center transition active:scale-95 ${innerCardClasses}`}
                >
                  <span className="text-[10px] font-bold block opacity-70">TAP INVOICE</span>
                  <span className="text-lg font-black text-emerald-500">12 Struk</span>
                  <span className="text-[9px] opacity-60 block">Unique Inv</span>
                </button>

                <button
                  onClick={() => setActiveSheet("QTY")}
                  className={`p-3.5 rounded-2xl border text-center transition active:scale-95 ${innerCardClasses}`}
                >
                  <span className="text-[10px] font-bold block opacity-70">TAP QTY</span>
                  <span className="text-lg font-black text-amber-500">22 Unit</span>
                  <span className="text-[9px] opacity-60 block">Fisik Terjual</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: WEEKLY SALES (WoW DARI KOLOM O)                    */}
        {/* ========================================================= */}
        {activeTab === "weekly-sales" && (
          <div className="space-y-6">
            <div className={`p-5 rounded-3xl border ${cardClasses} space-y-4`}>
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider">Weekly Sales Performance (Week to Week)</h3>
                  <p className="text-xs opacity-70">Sumber Data: Sheet <code>DATABASE</code> Kolom O</p>
                </div>
                <WhatsAppShareButton
                  storeName={STORE_CONFIG.storeName}
                  actual={formatCurrencyIDR(storeKPI.actual)}
                  target={formatCurrencyIDR(storeKPI.target)}
                  achv={storeAchv}
                  gap={formatCurrencyIDR(storeGap)}
                  upt={storeUPT}
                  periodText="Rekap Mingguan W1-W4"
                />
              </div>

              {/* Grid 4 Minggu */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {DATABASE_WEEKLY_DATA.map((w, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border ${innerCardClasses}`}>
                    <span className="text-xs font-bold text-amber-400 block">{w.weekLabel}</span>
                    <span className="text-base font-black mt-1 block">{formatCurrencyIDR(w.totalSales)}</span>
                    <span className={`text-[10px] font-bold block mt-1 ${w.growthWoW >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                      {idx === 0 ? "Baseline W1" : `${w.growthWoW > 0 ? `+${w.growthWoW}%` : `${w.growthWoW}%`} WoW`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: STAFF PERFORMANCE DETAIL (SEMUA STAF DITAMPILKAN)  */}
        {/* ========================================================= */}
        {activeTab === "staff-performance" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider">Daftar Lengkap Seluruh Staf Sales ({ALL_STAFF_DETAILS.length} Orang)</h3>
              <WhatsAppShareButton
                storeName={STORE_CONFIG.storeName}
                actual={formatCurrencyIDR(storeKPI.actual)}
                target={formatCurrencyIDR(storeKPI.target)}
                achv={storeAchv}
                gap={formatCurrencyIDR(storeGap)}
                upt={storeUPT}
                periodText="Peringkat Kinerja Staf"
              />
            </div>

            <div className="space-y-4">
              {ALL_STAFF_DETAILS.map((staff) => (
                <div key={staff.salesId} className={`p-5 rounded-3xl border ${cardClasses} space-y-4`}>
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-inherit">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm ${staff.avatarBg} ${staff.avatarText}`}>
                        {staff.initials}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          <span>{staff.name}</span>
                          <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${innerCardClasses}`}>
                            Rank #{staff.rank}
                          </span>
                        </div>
                        <span className="text-[10px] opacity-60 font-mono">ID: {staff.salesId} • UPT: {staff.upt}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-500 block">{formatCurrencyIDR(staff.actual)}</span>
                      <span className={`text-[11px] font-bold ${staff.achievement >= 100 ? "text-emerald-500" : accentColor}`}>
                        {staff.achievement > 0 ? `${staff.achievement}%` : "Non-Quota"}
                      </span>
                    </div>
                  </div>

                  {/* Evaluasi Ringkas */}
                  <div className={`p-3 rounded-2xl border text-xs space-y-1 ${innerCardClasses}`}>
                    <p className="opacity-80"><strong>Evaluasi:</strong> {staff.ringkasanEvaluasi}</p>
                    <p className="text-emerald-500"><strong>Tindakan:</strong> {staff.rekomendasiTindakan}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: BNPL TRANSACTIONS (BUY NOW PAY LATER)              */}
        {/* ========================================================= */}
      // 1. Hook Fetch Real-Time untuk Tab "BNPL DATABASE" (gid: 2697970)
const [bnplTransactions, setBnplTransactions] = useState<BnplTransaction[]>([]);
const [bnplLoading, setBnplLoading] = useState<boolean>(true);

useEffect(() => {
  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
  const BNPL_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=BNPL%20DATABASE`;

  fetch(BNPL_GVIZ_URL)
    .then((res) => res.text())
    .then((text) => {
      // Membersihkan wrapper Google Visualization setResponse(...)
      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const data = JSON.parse(text.substring(jsonStart, jsonEnd));
      
      const parsed: BnplTransaction[] = [];
      const rows = data.table.rows;

      rows.forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const date = c[0]?.f || c[0]?.v || "";
        const invoice = String(c[1]?.v || "");
        // Membersihkan format pemisah ribuan agar terhitung akurat
        const rawAmount = c[2]?.v;
        const amount = typeof rawAmount === "number" 
          ? rawAmount 
          : Number(String(rawAmount || 0).replace(/[^0-9]/g, ""));
        const tender = String(c[3]?.v || "Other");
        const product = String(c[4]?.v || "");
        const qty = Number(c[5]?.v) || 1;
        const month = String(c[6]?.v || "");

        // Validasi baris data transaksi
        if (invoice && amount > 0) {
          parsed.push({
            date,
            invoice,
            amount,
            tender,
            product,
            qty,
            month,
          });
        }
      });

      setBnplTransactions(parsed);
      setBnplLoading(false);
    })
    .catch((err) => {
      console.error("Gagal sinkronisasi BNPL:", err);
      setBnplLoading(false);
    });
}, []);

// 2. Kalkulasi Pencapaian & Kontribusi per Tender BNPL
const bnplSummary = useMemo(() => {
  const totalBnplAmount = bnplTransactions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBnplQty = bnplTransactions.reduce((acc, curr) => acc + curr.qty, 0);

  // Grouping performa per mitra leasing/pembiayaan
  const tenderMap: Record<string, { amount: number; qty: number }> = {};
  bnplTransactions.forEach((t) => {
    if (!tenderMap[t.tender]) {
      tenderMap[t.tender] = { amount: 0, qty: 0 };
    }
    tenderMap[t.tender].amount += t.amount;
    tenderMap[t.tender].qty += t.qty;
  });

  const tenderBreakdown = Object.entries(tenderMap).map(([tender, val]) => {
    const contribution = totalBnplAmount > 0 
      ? Number(((val.amount / totalBnplAmount) * 100).toFixed(1)) 
      : 0;
    // Estimasi proyeksi akhir bulan berdasarkan Time Gone (24 hari berlalu)
    const estimate = Math.round((val.amount / 24) * 31);

    return {
      tender,
      amount: val.amount,
      qty: val.qty,
      contribution,
      estimate,
    };
  }).sort((a, b) => b.amount - a.amount);

  return {
    totalAmount: totalBnplAmount,
    totalQty: totalBnplQty,
    tenders: tenderBreakdown,
  };
}, [bnplTransactions]);
  {activeTab === "bnpl" && (
  <div className="space-y-6">
    {/* Kartu Ringkasan Total & Performa Mitra BNPL */}
    <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
            <span>💳</span>
            <span>RINGKASAN PEMBIAYAAN KONSUMEN (BNPL & LEASING)</span>
          </h2>
          <p className={`text-xs ${textMuted} mt-1`}>
            Data tersinkronisasi otomatis dari sheet <code>BNPL DATABASE</code>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-400/30">
            Total BNPL: {formatIDR(bnplSummary.totalAmount)}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/15 text-sky-400 border border-sky-400/30">
            {bnplSummary.totalQty} Unit
          </span>
        </div>
      </div>

      {/* Grid Kartu Pencapaian Masing-Masing Tender */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {bnplSummary.tenders.map((t, idx) => (
          <div key={idx} className={`p-4 ${innerCardBg} border rounded-2xl space-y-2`}>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-black uppercase ${accentColor}`}>{t.tender}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-700/40 text-slate-300">
                {t.contribution}% Share
              </span>
            </div>
            <div className="text-base font-black">{formatIDR(t.amount)}</div>
            <div className="flex justify-between text-[11px] opacity-70">
              <span>Qty: <strong>{t.qty} Unit</strong></span>
              <span>Est: <strong>{formatIDR(t.estimate)}</strong></span>
            </div>
            <div className={`w-full ${cardBg} h-1.5 rounded-full overflow-hidden`}>
              <div 
                className="bg-emerald-400 h-full rounded-full transition-all"
                style={{ width: `${Math.min(t.contribution, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Tabel Rincian Transaksi BNPL */}
    <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
      <h3 className="text-sm font-bold uppercase tracking-wider">Detail Log Transaksi BNPL</h3>
      
      {bnplLoading ? (
        <div className="py-8 text-center text-xs opacity-60 animate-pulse">
          Memuat data real-time dari Google Sheets...
        </div>
      ) : bnplTransactions.length === 0 ? (
        <div className="py-8 text-center text-xs opacity-60">
          Tidak ada data transaksi BNPL yang ditemukan pada sheet.
        </div>
      ) : (
        <div className={`overflow-x-auto rounded-2xl border ${innerCardBg}`}>
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className={`${innerCardBg} uppercase text-[11px] border-b border-inherit`}>
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">No. Invoice</th>
                <th className="py-3.5 px-4">Mitra BNPL</th>
                <th className="py-3.5 px-4">Detail Produk yang Dibeli</th>
                <th className="py-3.5 px-4 text-center">QTY</th>
                <th className="py-3.5 px-4 text-right">Nilai Pembiayaan (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit font-medium">
              {bnplTransactions.map((b, idx) => (
                <tr key={idx} className="hover:opacity-90 transition">
                  <td className="py-3.5 px-4 font-mono opacity-80 whitespace-nowrap">{b.date}</td>
                  <td className={`py-3.5 px-4 font-mono font-bold ${accentColor}`}>{b.invoice}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${innerCardBg}`}>
                      {b.tender}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold max-w-md">{b.product}</td>
                  <td className="py-3.5 px-4 text-center font-bold">{b.qty}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-400 text-sm whitespace-nowrap">
                    {formatIDR(b.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
)}

        {/* ========================================================= */}
        {/* TAB 6: ACTIVITY STAFF (KHUSUS ADMIN 22008089)             */}
        {/* ========================================================= */}
        {activeTab === "admin-audit" && currentUser?.id === STORE_CONFIG.adminSalesId && (
          <div className="space-y-4">
            <div className={`p-5 rounded-3xl border ${cardClasses} space-y-4`}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-500">Log Aktivitas Login Staf (Real-Time Audit)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className={`${innerCardClasses} text-[10px] uppercase border-b border-inherit`}>
                    <tr>
                      <th className="py-3 px-3">Waktu Login</th>
                      <th className="py-3 px-3">Sales ID / Nama</th>
                      <th className="py-3 px-3">Perangkat</th>
                      <th className="py-3 px-3">Lokasi Toko</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit font-mono">
                    {auditLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="py-3 px-3 opacity-70">{log.timestamp}</td>
                        <td className="py-3 px-3 font-bold">{log.salesName} ({log.salesId})</td>
                        <td className="py-3 px-3 text-sky-400">{log.deviceType}</td>
                        <td className="py-3 px-3 text-emerald-400">{log.location}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* BOTTOM SHEETS INTERAKTIF UNTUK MOBILE & DESKTOP           */}
      {/* ========================================================= */}
      <BottomSheet
        isOpen={activeSheet === "UPT"}
        onClose={() => setActiveSheet(null)}
        title="Detail UPT • Hari Ini (Units Per Transaction)"
      >
        <div className="space-y-3 text-xs">
          <div className={`p-3 rounded-xl border ${innerCardClasses} flex justify-between`}>
            <span>Rata-rata UPT Toko Hari Ini:</span>
            <strong className="text-sky-500">1.85 Unit/Struk</strong>
          </div>
          <div className="space-y-2">
            {ALL_STAFF_DETAILS.map((s) => (
              <div key={s.salesId} className="flex justify-between items-center p-2 rounded-lg hover:bg-slate-500/10">
                <span>{s.name}</span>
                <span className="font-bold text-sky-400">{s.upt} UPT</span>
              </div>
            ))}
          </div>
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "INVOICE"}
        onClose={() => setActiveSheet(null)}
        title="Daftar Unique Invoice • Hari Ini"
      >
        <div className="space-y-2 text-xs font-mono">
          {["INV-100012290", "INV-100012291", "INV-100012292"].map((inv, i) => (
            <div key={i} className={`p-2.5 rounded-xl border ${innerCardClasses} flex justify-between`}>
              <span className="text-amber-400 font-bold">{inv}</span>
              <span>1 Unit • Rp 24.999.000</span>
            </div>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "QTY"}
        onClose={() => setActiveSheet(null)}
        title="Peringkat Qty Fisik Terjual • Hari Ini"
      >
        <div className="space-y-2 text-xs">
          {ALL_STAFF_DETAILS.map((s, idx) => (
            <div key={s.salesId} className={`p-2.5 rounded-xl border ${innerCardClasses} flex justify-between`}>
              <span>#{idx + 1} {s.name}</span>
              <strong className="text-emerald-500">{s.rank === 1 ? 8 : 3} Unit</strong>
            </div>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet
        isOpen={activeSheet === "LOB_DETAIL"}
        onClose={() => setActiveSheet(null)}
        title={selectedLobTitle}
      >
        <div className="space-y-2 text-xs">
          <p className="opacity-70">Daftar item produk yang berhasil ditransaksikan pada kategori ini.</p>
          <div className={`p-3 rounded-xl border ${innerCardClasses}`}>
            <span className="font-bold block">iPhone 17 Pro Max 256GB Silver</span>
            <span className="opacity-60 text-[10px]">SKU: APPMFYM4ID/A • 1 Unit • Rp 24.999.000</span>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
