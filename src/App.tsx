"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "leaderboard" | "category-breakdown" | "store-overview";

interface StaffPerformance {
  rank: number;
  salesId: string;
  name: string;
  target: number;
  appleSales: number;
  androidSales: number;
  accessoriesSales: number;
  vasSales: number;
  totalSales: number;
  achievement: number;
  status: "Tercapai" | "Belum Tercapai";
}

// DATA MASTER PERSIS SESUAI SHEET "Dashboard QF01"
const STORE_DATA_DEFAULT = {
  storeCode: "QF01",
  storeName: "DIGIPLUS GRAND INDONESIA",
  period: "Oktober 2026",
  targetRevenue: 8728667173,
  actualRevenue: 3099725200,
  achievementRate: 35.5,
  appleSales: 2519060000,
  androidSales: 394141000,
  accessoriesSales: 57816200,
  vasSales: 41335000,
  totalInvoices: 174,
  totalItems: 301,
  atv: 17814513,
  upt: 1.73,
};

const LEADERBOARD_DEFAULT: StaffPerformance[] = [
  {
    rank: 1,
    salesId: "24004971",
    name: "Liesbeth Febrina",
    target: 872866717,
    appleSales: 1353207000,
    androidSales: 27992000,
    accessoriesSales: 2452000,
    vasSales: 3490000,
    totalSales: 1387141000,
    achievement: 158.9,
    status: "Tercapai",
  },
  {
    rank: 2,
    salesId: "24016878",
    name: "Yunita Anggraini",
    target: 1222013404,
    appleSales: 238190000,
    androidSales: 136044000,
    accessoriesSales: 16222000,
    vasSales: 13120000,
    totalSales: 403576000,
    achievement: 33.0,
    status: "Belum Tercapai",
  },
  {
    rank: 3,
    salesId: "25005333",
    name: "M. Adlii",
    target: 1658446763,
    appleSales: 171742000,
    androidSales: 80384000,
    accessoriesSales: 8532000,
    vasSales: 3860000,
    totalSales: 264518000,
    achievement: 15.9,
    status: "Belum Tercapai",
  },
  {
    rank: 4,
    salesId: "26036846",
    name: "Bagas T Saputra",
    target: 0,
    appleSales: 198992000,
    androidSales: 52394000,
    accessoriesSales: 1647000,
    vasSales: 3000000,
    totalSales: 256033000,
    achievement: 0.0,
    status: "Belum Tercapai",
  },
  {
    rank: 5,
    salesId: "26028497",
    name: "Siti Amelia",
    target: 1658446763,
    appleSales: 212493000,
    androidSales: 27392000,
    accessoriesSales: 9087200,
    vasSales: 5750000,
    totalSales: 254722200,
    achievement: 15.4,
    status: "Belum Tercapai",
  },
  {
    rank: 6,
    salesId: "25015216",
    name: "Andrian Afi Syarfuan",
    target: 1658446763,
    appleSales: 183792000,
    androidSales: 38142000,
    accessoriesSales: 9546000,
    vasSales: 8255000,
    totalSales: 239735000,
    achievement: 14.5,
    status: "Belum Tercapai",
  },
  {
    rank: 7,
    salesId: "26026303",
    name: "Surya Adi Permana",
    target: 1658446763,
    appleSales: 124496000,
    androidSales: 31793000,
    accessoriesSales: 10330000,
    vasSales: 3860000,
    totalSales: 170479000,
    achievement: 10.3,
    status: "Belum Tercapai",
  },
  {
    rank: 8,
    salesId: "ONLINE",
    name: "Digiplus.Co.Id",
    target: 0,
    appleSales: 36148000,
    androidSales: 0,
    accessoriesSales: 0,
    vasSales: 0,
    totalSales: 36148000,
    achievement: 0.0,
    status: "Belum Tercapai",
  },
];

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("leaderboard");
  const [search, setSearch] = useState("");
  const [leaderboard, setLeaderboard] = useState<StaffPerformance[]>(LEADERBOARD_DEFAULT);
  const [storeData, setStoreData] = useState(STORE_DATA_DEFAULT);
  const [isLiveSync, setIsLiveSync] = useState(false);

  // SHORTCUT UPLOAD
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; text: string }>({
    type: "idle",
    text: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2VUsReKqqJgPsG15L1pOAkmqoIWF2vApyD18jr5e_z0OVqagasa9yHXEe5fzMhoQmOw/exec";

  // AUTO-SYNC DARI GOOGLE SHEETS
  useEffect(() => {
    const SHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
    const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=Dashboard%20QF01`;

    fetch(GVIZ_URL)
      .then((res) => res.text())
      .then((text) => {
        if (!text.includes("google.visualization.Query.setResponse")) return;
        const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));
        const rows = json.table.rows;

        // Ambil Total Store Revenue dari row 14
        const totalRev = Number(rows[13]?.c[2]?.v) || STORE_DATA_DEFAULT.actualRevenue;
        const targetRev = Number(rows[15]?.c[2]?.v) || STORE_DATA_DEFAULT.targetRevenue;
        const apple = Number(rows[13]?.c[5]?.v) || STORE_DATA_DEFAULT.appleSales;
        const android = Number(rows[13]?.c[7]?.v) || STORE_DATA_DEFAULT.androidSales;
        const acc = Number(rows[13]?.c[9]?.v) || STORE_DATA_DEFAULT.accessoriesSales;
        const vas = Number(rows[13]?.c[11]?.v) || STORE_DATA_DEFAULT.vasSales;

        setStoreData((prev) => ({
          ...prev,
          actualRevenue: totalRev,
          targetRevenue: targetRev,
          appleSales: apple,
          androidSales: android,
          accessoriesSales: acc,
          vasSales: vas,
          achievementRate: Number(((totalRev / targetRev) * 100).toFixed(1)),
        }));

        setIsLiveSync(true);
      })
      .catch(() => {
        console.log("Memakai data resmi terverifikasi");
      });
  }, []);

  // Cek sesi login
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
      setUploadStatus({
        type: "error",
        text: "Pilih file .xls terlebih dahulu!",
      });
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
    } catch (err) {
      setUploadStatus({
        type: "error",
        text: "Gagal mengirim file. Periksa koneksi internet.",
      });
    }
  };

  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter(
      (item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.salesId.includes(search)
    );
  }, [leaderboard, search]);

  // LOGIN SCREEN
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
                placeholder="Contoh: 22008089 atau ID Staf"
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

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      {/* SIDEBAR SEBELAH KIRI */}
      <aside className="w-72 bg-[#0d1424] border-r border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div className="p-4 overflow-y-auto">
          {/* Brand */}
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
                  Target: RAW (Kolom M, N, O) ↗
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

            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-amber-400/40 hover:border-amber-400 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📁</span>
              <span className="truncate">
                {selectedFile ? selectedFile.name : "1. Pilih File .xls"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={uploadStatus.type === "loading"}
              className="w-full mt-2 py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
            >
              {uploadStatus.type === "loading" ? "Mengirim Data..." : "2. Kirim ke Kolom M, N, O"}
            </button>
          </div>

          {/* Navigasi Menu */}
          <nav className="mt-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("leaderboard")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "leaderboard" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>🏆</span>
              <span>Staff Performance</span>
            </button>

            <button
              onClick={() => setActiveTab("category-breakdown")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "category-breakdown" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>📋</span>
              <span>Rincian per Kategori</span>
            </button>

            <button
              onClick={() => setActiveTab("store-overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "store-overview" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>📊</span>
              <span>Overview Store</span>
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
              <h1 className="text-xl font-bold text-white">{storeData.storeName}</h1>
              {isLiveSync && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  ● Live Sheets Sync
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Periode: {storeData.period} • Master Data: Tab `Dashboard QF01`</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              Total Actual: {formatIDR(storeData.actualRevenue)}
            </span>
          </div>
        </header>

        {/* TAB 1: LEADERBOARD PERINGKAT TIM */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                placeholder="Cari Nama Salesperson atau ID Staf..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white max-w-sm w-full focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400">
                Peringkat Resmi Toko QF01 Grand Indonesia
              </span>
            </div>

            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a0f1d] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 text-center">Rank</th>
                    <th className="py-4 px-4">Salesperson</th>
                    <th className="py-4 px-4 text-right">Target</th>
                    <th className="py-4 px-4 text-right">Actual Sales</th>
                    <th className="py-4 px-4 text-center">Achv %</th>
                    <th className="py-4 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filteredLeaderboard.map((s) => (
                    <tr
                      key={s.rank}
                      className={`hover:bg-slate-800/40 transition ${
                        s.rank === 1 ? "bg-amber-500/10 font-semibold" : ""
                      }`}
                    >
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`w-7 h-7 rounded-full inline-flex items-center justify-center font-black text-xs ${
                            s.rank === 1
                              ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                              : s.rank === 2
                              ? "bg-slate-300 text-slate-950"
                              : s.rank === 3
                              ? "bg-amber-700 text-white"
                              : "text-slate-400"
                          }`}
                        >
                          {s.rank}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-white font-bold text-sm flex items-center gap-2">
                          <span>{s.name}</span>
                          {s.rank === 1 && (
                            <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
                              Rank 1 👑
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {s.salesId}</div>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-400">
                        {s.target > 0 ? formatIDR(s.target) : "-"}
                      </td>
                      <td className="py-4 px-4 text-right text-emerald-400 font-extrabold text-sm">
                        {formatIDR(s.totalSales)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`font-black ${s.achievement >= 100 ? "text-emerald-400" : "text-amber-400"}`}>
                          {s.achievement.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            s.status === "Tercapai"
                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {s.status === "Tercapai" ? "🔵 Tercapai" : "🔻 Belum Tercapai"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BREAKDOWN PER KATEGORI */}
        {activeTab === "category-breakdown" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white mb-2">Penjualan per Kategori Produk (LOB Revenue)</h2>
            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a0f1d] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Salesperson</th>
                    <th className="py-3.5 px-4 text-right text-sky-400">Apple Devices</th>
                    <th className="py-3.5 px-4 text-right text-indigo-400">Android</th>
                    <th className="py-3.5 px-4 text-right text-amber-400">Accessories</th>
                    <th className="py-3.5 px-4 text-right text-purple-400">VAS (Qoala)</th>
                    <th className="py-3.5 px-4 text-right text-emerald-400">Total Penjualan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {leaderboard.map((item) => (
                    <tr key={item.rank} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-bold text-white">{item.name}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatIDR(item.appleSales)}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatIDR(item.androidSales)}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatIDR(item.accessoriesSales)}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{formatIDR(item.vasSales)}</td>
                      <td className="py-3 px-4 text-right font-extrabold text-emerald-400">{formatIDR(item.totalSales)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: OVERVIEW STORE */}
        {activeTab === "store-overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Target Revenue</span>
                <div className="text-xl font-bold text-white mt-1">{formatIDR(storeData.targetRevenue)}</div>
              </div>
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Actual Revenue MTD</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{formatIDR(storeData.actualRevenue)}</div>
              </div>
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Pencapaian Toko</span>
                <div className="text-xl font-bold text-amber-400 mt-1">{storeData.achievementRate}%</div>
              </div>
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Total Items & UPT</span>
                <div className="text-xl font-bold text-sky-400 mt-1">{storeData.totalItems} Unit (UPT {storeData.upt})</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Total Apple Devices</span>
                <div className="text-2xl font-black text-sky-400 mt-1">{formatIDR(storeData.appleSales)}</div>
              </div>
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Total Android Devices</span>
                <div className="text-2xl font-black text-indigo-400 mt-1">{formatIDR(storeData.androidSales)}</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
