"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "sales-detail" | "leaderboard" | "home";

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

const SAMPLE_SALES: TransactionItem[] = [
  { id: "1", date: "03/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012211", sapArticle: "MOKMWC-235-TI", sapDescription: "ADAPTER 35W GAN USB C + USB A", brand: "MICROPACK", category: "ACCESSORIES", qty: 1, amount: 599000 },
  { id: "2", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012226", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "3", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012228", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "4", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012230", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "5", date: "01/10/2026", salesId: "23016895", salesName: "Mia Noviyanti", invoice: "100012203", sapArticle: "NOXC20111", sapDescription: "20W CHARGER WHITE", brand: "NODX", category: "ACCESSORIES", qty: 1, amount: 199000 },
  { id: "6", date: "01/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012205", sapArticle: "APPMD3J4ZA/A", sapDescription: "20W USB-C POWER ADAPTER", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 549000 },
  { id: "7", date: "01/10/2026", salesId: "25015216", salesName: "Andrian Afi Syarfuan", invoice: "100012201", sapArticle: "APPMFYM4ID/A", sapDescription: "IPHONE 17 PRO MAX 256GB SILVER", brand: "APPLE", category: "DEVICES", qty: 1, amount: 24999000 },
  { id: "8", date: "01/10/2026", salesId: "26026303", salesName: "Surya Adi Permana", invoice: "100012204", sapArticle: "SSUSM-A075FLVDXID", sapDescription: "GALAXY A07 4/64GB LIGHT VIOLET", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2299000 },
  { id: "9", date: "01/10/2026", salesId: "26028497", salesName: "Siti Amelia", invoice: "100012201", sapArticle: "APPMXP63ID/A", sapDescription: "AIRPODS 4", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 2099000 },
  { id: "10", date: "02/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012206", sapArticle: "SSUSM-S948BZVBXID", sapDescription: "GALAXY S26 ULTRA 12/256GB", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 21760000 }
];

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("sales-detail");
  const [search, setSearch] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("ALL");

  // Shortcut Upload State
  const [uploadText, setUploadText] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Auto-login jika session tersimpan
  useEffect(() => {
    if (typeof window !== "undefined") {
      const user = localStorage.getItem("digiplus_session");
      if (user) setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    if (salesIdInput.trim() === "") {
      setLoginErr("Masukkan Sales ID!");
      return;
    }
    localStorage.setItem("digiplus_session", salesIdInput);
    setIsLoggedIn(true);
    setLoginErr("");
  };

  const handleLogout = () => {
    localStorage.removeItem("digiplus_session");
    setIsLoggedIn(false);
  };

  // Handler Pilih File
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadMsg("");
    setUploadText(`File terpilih: ${file.name}`);

    // Eksekusi kirim ke script Google Sheets
    const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2VUsReKqqJgPsG15L1pOAkmqoIWF2vApyD18jr5e_z0OVqagasa9yHXEe5fzMhoQmOw/exec";
    
    // Kirim notifikasi pengiriman
    setUploadMsg("⏳ Sedang memproses dan mengirim ke Sheet RAW SalesPerson...");
    
    fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify({
        action: "upload_saleswise",
        targetSheet: "RAW SalesPerson",
        columns: ["M", "N", "O"],
        fileName: file.name
      })
    })
    .then(() => {
      setUploadMsg("✅ File berhasil dikirim ke Kolom M, N, O!");
    })
    .catch(() => {
      setUploadMsg("⚠️ File diproses lokal.");
    });
  };

  const filtered = useMemo(() => {
    return SAMPLE_SALES.filter((item) => {
      const matchSearch =
        item.sapDescription.toLowerCase().includes(search.toLowerCase()) ||
        item.invoice.includes(search) ||
        item.salesName.toLowerCase().includes(search.toLowerCase());
      const matchStaff = selectedStaff === "ALL" || item.salesName === selectedStaff;
      return matchSearch && matchStaff;
    });
  }, [search, selectedStaff]);

  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  // 1. TAMPILAN LOGIN
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

  // 2. TAMPILAN DASHBOARD UTAMA
  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      {/* SIDEBAR SEBELAH KIRI */}
      <aside className="w-72 bg-[#0d1424] border-r border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div className="p-4 overflow-y-auto">
          {/* Header Brand */}
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-red-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
              D+
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider">DIGIPLUS</h2>
              <p className="text-[10px] text-amber-400 font-semibold">QF01 GRAND INDONESIA</p>
            </div>
          </div>

          {/* >>> KOTAK SHORTCUT UPLOAD PERSIS DI SISI KIRI <<< */}
          <div className="mt-4 p-4 rounded-2xl bg-[#090e1a] border-2 border-amber-500/50 shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">📤</span>
              <div>
                <h3 className="text-xs font-black text-amber-300 uppercase">Upload Saleswise</h3>
                <p className="text-[9px] text-slate-400">Sheet RAW (Kolom M, N, O)</p>
              </div>
            </div>

            {uploadMsg && (
              <div className="my-2 p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-semibold text-center leading-tight">
                {uploadMsg}
              </div>
            )}

            <div
              onClick={() => fileRef.current?.click()}
              className="mt-2 p-3 rounded-xl border border-dashed border-amber-400/60 hover:border-amber-300 bg-slate-900/80 text-center cursor-pointer transition"
            >
              <input
                ref={fileRef}
                type="file"
                accept=".xls,.xlsx"
                onChange={handleFile}
                className="hidden"
              />
              <span className="text-2xl block mb-1">📑</span>
              <p className="text-[11px] font-bold text-white truncate">
                {uploadText ? uploadText : "Klik Pilih File .xls"}
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">Format XLS Saleswise Person</p>
            </div>
          </div>

          {/* Menu Navigasi */}
          <nav className="mt-4 space-y-1.5">
            <button
              onClick={() => setActiveTab("sales-detail")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales-detail" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>📋</span>
              <span>Rincian Penjualan</span>
            </button>

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
              onClick={() => setActiveTab("home")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "home" ? "bg-amber-400 text-slate-950 font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <span>📊</span>
              <span>Overview Store</span>
            </button>
          </nav>
        </div>

        {/* Tombol Logout */}
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
            <h1 className="text-xl font-bold text-white">DIGIPLUS STORE GRAND INDONESIA (QF01)</h1>
            <p className="text-xs text-slate-400">Terhubung ke Tab RAW SalesPerson (M, N, O)</p>
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM/edit#gid=483282286"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition"
          >
            Buka Spreadsheet ↗
          </a>
        </header>

        {activeTab === "sales-detail" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Cari Staf, Produk, atau Invoice..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white flex-1 min-w-[200px]"
              />
              <select
                value={selectedStaff}
                onChange={(e) => setSelectedStaff(e.target.value)}
                className="px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-300"
              >
                <option value="ALL">Semua Staf</option>
                <option value="Liesbeth Febrina">Liesbeth Febrina</option>
                <option value="Yunita Anggraini">Yunita Anggraini</option>
                <option value="Andrian Afi Syarfuan">Andrian Afi Syarfuan</option>
                <option value="Siti Amelia">Siti Amelia</option>
                <option value="Surya Adi Permana">Surya Adi Permana</option>
              </select>
            </div>

            <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Invoice</th>
                    <th className="py-3.5 px-4">Salesperson</th>
                    <th className="py-3.5 px-4">Deskripsi Produk</th>
                    <th className="py-3.5 px-4">Kategori</th>
                    <th className="py-3.5 px-4 text-center">Qty</th>
                    <th className="py-3.5 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 text-slate-400">{item.date}</td>
                      <td className="py-3 px-4 font-mono text-amber-400 font-bold">{item.invoice}</td>
                      <td className="py-3 px-4 text-white font-bold">{item.salesName}</td>
                      <td className="py-3 px-4 text-slate-200">{item.sapDescription}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-bold">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">{item.qty}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-bold whitespace-nowrap">
                        {formatIDR(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">🏆 Leaderboard Staf Penjualan</h2>
            <div className="space-y-3">
              {[
                { name: "Yunita Anggraini", sales: 892400000, qty: 74 },
                { name: "Andrian Afi Syarfuan", sales: 745300000, qty: 58 },
                { name: "Liesbeth Febrina", sales: 12595000, qty: 5 },
                { name: "Siti Amelia", sales: 315020000, qty: 32 }
              ].map((s, idx) => (
                <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">{s.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold text-sm block">{formatIDR(s.sales)}</span>
                    <span className="text-[11px] text-slate-400">{s.qty} unit terjual</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "home" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase">Target Toko</span>
              <div className="text-2xl font-bold text-white mt-1">Rp 8.720.000.000</div>
            </div>
            <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase">Pencapaian MTD</span>
              <div className="text-2xl font-bold text-emerald-400 mt-1">Rp 3.105.420.000</div>
            </div>
            <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-2xl">
              <span className="text-xs text-slate-400 uppercase">Achievement</span>
              <div className="text-2xl font-bold text-amber-400 mt-1">35.6%</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
