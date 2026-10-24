"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "leaderboard" | "sales-detail" | "category-breakdown" | "store-overview";

interface StaffPerformance {
  rank: number;
  salesId: string;
  name: string;
  appleSales: number;
  androidSales: number;
  accessoriesSales: number;
  vasSales: number;
  totalSales: number;
  transactions: number;
}

// Data Master Riil Hasil Audit Sheet DATABASE (1 - 24 Oktober 2026)
const OFFICIAL_LEADERBOARD: StaffPerformance[] = [
  {
    rank: 1,
    salesId: "24004971",
    name: "Liesbeth Febrina",
    appleSales: 1386790000,
    androidSales: 27992000,
    accessoriesSales: 2711000,
    vasSales: 3490000,
    totalSales: 1420983000,
    transactions: 71,
  },
  {
    rank: 2,
    salesId: "24016878",
    name: "Yunita Anggraini",
    appleSales: 284190000,
    androidSales: 136044000,
    accessoriesSales: 17654000,
    vasSales: 13120000,
    totalSales: 451008000,
    transactions: 57,
  },
  {
    rank: 3,
    salesId: "26028497",
    name: "Siti Amelia",
    appleSales: 254493000,
    androidSales: 27392000,
    accessoriesSales: 14335200,
    vasSales: 5750000,
    totalSales: 301970200,
    transactions: 47,
  },
  {
    rank: 4,
    salesId: "25005333",
    name: "M. Adlii",
    appleSales: 176239000,
    androidSales: 80384000,
    accessoriesSales: 8532000,
    vasSales: 3860000,
    totalSales: 269015000,
    transactions: 42,
  },
  {
    rank: 5,
    salesId: "26036846",
    name: "Bagas T Saputra",
    appleSales: 198992000,
    androidSales: 52394000,
    accessoriesSales: 1946000,
    vasSales: 3000000,
    totalSales: 256332000,
    transactions: 20,
  },
  {
    rank: 6,
    salesId: "25015216",
    name: "Andrian Afi Syarfuan",
    appleSales: 184291000,
    androidSales: 38142000,
    accessoriesSales: 9734000,
    vasSales: 8255000,
    totalSales: 240422000,
    transactions: 38,
  },
  {
    rank: 7,
    salesId: "26026303",
    name: "Surya Adi Permana",
    appleSales: 128496000,
    androidSales: 31793000,
    accessoriesSales: 10302000,
    vasSales: 3860000,
    totalSales: 174451000,
    transactions: 28,
  },
];

const STORE_TOTALS = {
  totalRevenue: 3150827200,
  targetRevenue: 8728667173,
  appleRevenue: 2551279000,
  samsungRevenue: 371169000,
  accessoriesRevenue: 60654200,
  vasRevenue: 45070000,
  totalQty: 312,
  totalTransactions: 307,
};

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("leaderboard");
  const [search, setSearch] = useState("");

  // Shortcut Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[][]>([]);
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
    setUploadStatus({ type: "loading", text: "Membaca file .xls..." });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
          setUploadStatus({ type: "error", text: "Modul Excel sedang memuat. Coba lagi dalam 2 detik." });
          return;
        }

        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        const mapped = rawJson.map((row) => [
          row[0] !== undefined ? String(row[0]) : "",
          row[1] !== undefined ? String(row[1]) : "",
          row[2] !== undefined ? String(row[2]) : "",
        ]);

        setParsedRows(mapped);
        setUploadStatus({
          type: "idle",
          text: `File "${file.name}" terbaca (${mapped.length} baris). Siap dikirim!`,
        });
      } catch (err) {
        setUploadStatus({ type: "error", text: "Gagal membaca format file Excel." });
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExecuteUpload = async () => {
    if (!selectedFile || parsedRows.length === 0) {
      setUploadStatus({ type: "error", text: "Pilih file .xls terlebih dahulu!" });
      return;
    }

    setUploadStatus({ type: "loading", text: `Mengirim ${parsedRows.length} baris ke Kolom M, N, O...` });

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ data: parsedRows }),
      });

      setUploadStatus({
        type: "success",
        text: `Berhasil! ${parsedRows.length} baris telah dikirim ke Sheet RAW SalesPerson Kolom M, N, O.`,
      });
      setSelectedFile(null);
      setParsedRows([]);
    } catch (err) {
      setUploadStatus({ type: "error", text: "Gagal mengirim data. Periksa jaringan Anda." });
    }
  };

  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  const filteredLeaderboard = useMemo(() => {
    return OFFICIAL_LEADERBOARD.filter(
      (item) => item.name.toLowerCase().includes(search.toLowerCase()) || item.salesId.includes(search)
    );
  }, [search]);

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
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-amber-400/40 hover:border-amber-400 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📁</span>
              <span className="truncate">{selectedFile ? selectedFile.name : "1. Pilih File .xls"}</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={uploadStatus.type === "loading" || parsedRows.length === 0}
              className={`w-full mt-2 py-2.5 px-3 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                parsedRows.length > 0 && uploadStatus.type !== "loading"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 cursor-pointer animate-pulse"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {uploadStatus.type === "loading" ? "Mengirim..." : "2. Kirim ke Kolom M, N, O"}
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
            <h1 className="text-xl font-bold text-white">DIGIPLUS GRAND INDONESIA (QF01)</h1>
            <p className="text-xs text-slate-400">Sumber Data: Sheet `DATABASE` • Periode: Oktober 2026</p>
          </div>
          <div className="flex gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              Total Sales: {formatIDR(STORE_TOTALS.totalRevenue)}
            </span>
          </div>
        </header>

        {/* TAB 1: LEADERBOARD RESMI */}
        {activeTab === "leaderboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <input
                type="text"
                placeholder="Cari Nama Salesperson..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white max-w-sm w-full focus:outline-none focus:border-amber-400"
              />
              <span className="text-xs text-slate-400">Total Transaksi: {STORE_TOTALS.totalTransactions} Struk</span>
            </div>

            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-x-auto shadow-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0a0f1d] text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-4 text-center">Rank</th>
                    <th className="py-4 px-4">Salesperson</th>
                    <th className="py-4 px-4 text-right">Apple</th>
                    <th className="py-4 px-4 text-right">Android</th>
                    <th className="py-4 px-4 text-right">Accessories</th>
                    <th className="py-4 px-4 text-right">VAS (Qoala)</th>
                    <th className="py-4 px-4 text-right">Total Penjualan</th>
                    <th className="py-4 px-4 text-center">Struk</th>
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
                      <td className="py-4 px-4 text-right text-slate-300">{formatIDR(s.appleSales)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatIDR(s.androidSales)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatIDR(s.accessoriesSales)}</td>
                      <td className="py-4 px-4 text-right text-slate-300">{formatIDR(s.vasSales)}</td>
                      <td className="py-4 px-4 text-right text-emerald-400 font-extrabold text-sm">
                        {formatIDR(s.totalSales)}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-300 font-bold">{s.transactions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: BREAKDOWN PER KATEGORI */}
        {activeTab === "category-breakdown" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-2">🍏 Apple Ecosystem (80.97%)</h3>
                <p className="text-2xl font-black text-sky-400">{formatIDR(STORE_TOTALS.appleRevenue)}</p>
                <p className="text-xs text-slate-400 mt-2">Dominasi penjualan iPhone 17 Pro Max, iPad, & AirPods</p>
              </div>

              <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-2">⚡ Samsung & Multi-brand (11.78%)</h3>
                <p className="text-2xl font-black text-indigo-400">{formatIDR(STORE_TOTALS.samsungRevenue)}</p>
                <p className="text-xs text-slate-400 mt-2">Galaxy S26 Ultra, Galaxy A17, & Z Fold 8 Series</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: OVERVIEW STORE */}
        {activeTab === "store-overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Target Revenue</span>
                <div className="text-xl font-bold text-white mt-1">{formatIDR(STORE_TOTALS.targetRevenue)}</div>
              </div>
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Actual Revenue MTD</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">{formatIDR(STORE_TOTALS.totalRevenue)}</div>
              </div>
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Pencapaian Toko</span>
                <div className="text-xl font-bold text-amber-400 mt-1">36.1%</div>
              </div>
              <div className="p-5 bg-[#0d1424] border border-slate-800 rounded-2xl">
                <span className="text-xs text-slate-400 uppercase">Total Unit Terjual</span>
                <div className="text-xl font-bold text-sky-400 mt-1">{STORE_TOTALS.totalQty} Unit</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
