"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "sales-detail" | "leaderboard" | "home" | "product-focus";

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

const FALLBACK_SALES: TransactionItem[] = [
  { id: "1", date: "03/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012211", sapArticle: "MOKMWC-235-TI", sapDescription: "ADAPTER 35W GAN USB C + USB A", brand: "MICROPACK", category: "ACCESSORIES", qty: 1, amount: 599000 },
  { id: "2", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012226", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "3", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012228", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "4", date: "08/10/2026", salesId: "24004971", salesName: "Liesbeth Febrina", invoice: "100012230", sapArticle: "SSUSM-A175FZKNXID", sapDescription: "GALAXY A17 4/128GB BLACK", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2999000 },
  { id: "5", date: "01/10/2026", salesId: "23016895", salesName: "Mia Noviyanti", invoice: "100012203", sapArticle: "NOXC20111", sapDescription: "20W CHARGER WHITE", brand: "NODX", category: "ACCESSORIES", qty: 1, amount: 199000 },
  { id: "6", date: "01/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012205", sapArticle: "APPMD3J4ZA/A", sapDescription: "20W USB-C POWER ADAPTER", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 549000 },
  { id: "7", date: "01/10/2026", salesId: "25015216", salesName: "Andrian Afi Syarfuan", invoice: "100012201", sapArticle: "APPMFYM4ID/A", sapDescription: "IPHONE 17 PRO MAX 256GB SILVER", brand: "APPLE", category: "DEVICES", qty: 1, amount: 24999000 },
  { id: "8", date: "01/10/2026", salesId: "26026303", salesName: "Surya Adi Permana", invoice: "100012204", sapArticle: "SSUSM-A075FLVDXID", sapDescription: "GALAXY A07 4/64GB LIGHT VIOLET", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 2299000 },
  { id: "9", date: "01/10/2026", salesId: "26028497", salesName: "Siti Amelia", invoice: "100012201", sapArticle: "APPMXP63ID/A", sapDescription: "AIRPODS 4", brand: "APPLE", category: "ACCESSORIES", qty: 1, amount: 2099000 },
  { id: "10", date: "02/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012206", sapArticle: "SSUSM-S948BZVBXID", sapDescription: "GALAXY S26 ULTRA 12/256GB", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 21760000 },
  { id: "11", date: "03/10/2026", salesId: "25005333", salesName: "M. Adlii", invoice: "100012215", sapArticle: "APPMFYQ4ID/A", sapDescription: "IPHONE 17 PRO MAX 512GB", brand: "APPLE", category: "DEVICES", qty: 1, amount: 29499000 },
  { id: "12", date: "03/10/2026", salesId: "26036846", salesName: "Bagas T Saputra", invoice: "100012220", sapArticle: "APPMYE73ID/A", sapDescription: "IPHONE 16 128GB BLACK", brand: "APPLE", category: "DEVICES", qty: 1, amount: 16499000 },
  { id: "13", date: "04/10/2026", salesId: "24016878", salesName: "Yunita Anggraini", invoice: "100012223", sapArticle: "SSUSM-F971BZKGXID", sapDescription: "SAMSUNG Z FOLD 8 12/512GB", brand: "SAMSUNG", category: "DEVICES", qty: 1, amount: 32499000 }
];

export default function DigiplusDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string; name: string } | null>(null);
  const [inputSalesId, setInputSalesId] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<MenuTab>("sales-detail");
  const [salesList, setSalesList] = useState<TransactionItem[]>(FALLBACK_SALES);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStaff, setFilterStaff] = useState("ALL");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // SHORTCUT UPLOAD STATE (TARGET: RAW SalesPerson KOLOM M, N, O)
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState<any[][]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL APPS SCRIPT AKTIF DARI SEL A1 SHEET RAW SalesPerson
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2VUsReKqqJgPsG15L1pOAkmqoIWF2vApyD18jr5e_z0OVqagasa9yHXEe5fzMhoQmOw/exec";

  // Load engine xlsx secara aman
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).XLSX) {
      const script = document.createElement("script");
      script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem("digiplus_auth_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (e) {
        localStorage.removeItem("digiplus_auth_user");
      }
    }
  }, []);

  // Sync Data Google Sheets
  useEffect(() => {
    const SHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
    const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=RAW%20SalesPerson`;

    fetch(GVIZ_URL)
      .then((res) => res.text())
      .then((text) => {
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

        if (parsed.length > 0) setSalesList(parsed);
      })
      .catch((err) => console.log("GVIZ Offline, menggunakan dataset lokal:", err));
  }, []);

  // Baca file .xls
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setUploadStatus({ type: "", message: "" });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
          setUploadStatus({ type: "error", message: "Engine file sedang memuat, mohon coba 2 detik lagi." });
          return;
        }

        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Ambil 3 kolom untuk kolom M, N, O
        const mapped = rawJson.map((row) => [
          row[0] !== undefined ? String(row[0]) : "",
          row[1] !== undefined ? String(row[1]) : "",
          row[2] !== undefined ? String(row[2]) : "",
        ]);

        setParsedRows(mapped);
      } catch (err) {
        setUploadStatus({ type: "error", message: "Gagal membaca format file .xls." });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Kirim data ke Kolom M, N, O Google Sheet
  const handleUploadSubmit = async () => {
    if (parsedRows.length === 0) return;
    setIsUploading(true);
    setUploadStatus({ type: "", message: "" });

    try {
      // Gunakan mode no-cors dan text/plain agar tidak diblokir browser
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          targetSheet: "RAW SalesPerson",
          startColumn: "M",
          columns: ["M", "N", "O"],
          data: parsedRows,
        }),
      });

      setUploadStatus({
        type: "success",
        message: `✅ Berhasil dikirim! ${parsedRows.length} baris telah diteruskan ke Sheet RAW SalesPerson Kolom M, N, O.`,
      });
    } catch (err) {
      setUploadStatus({
        type: "error",
        message: "Gagal terhubung ke Apps Script. Periksa koneksi internet Anda.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const trimmedId = inputSalesId.trim();
    const trimmedPass = inputPassword.trim();

    if (trimmedPass !== "Welcome@123") {
      setLoginError("Password salah! Silakan coba lagi.");
      return;
    }

    if (trimmedId === "22008089") {
      const userObj = { id: "22008089", role: "Super Admin", name: "Administrator QF01" };
      setCurrentUser(userObj);
      setIsAuthenticated(true);
      localStorage.setItem("digiplus_auth_user", JSON.stringify(userObj));
      return;
    }

    const matched = salesList.find((s) => s.salesId === trimmedId);
    const userObj = {
      id: trimmedId,
      role: "Sales Specialist",
      name: matched ? matched.salesName : `Staff ${trimmedId}`,
    };
    setCurrentUser(userObj);
    setIsAuthenticated(true);
    localStorage.setItem("digiplus_auth_user", JSON.stringify(userObj));
  };

  const handleLogout = () => {
    localStorage.removeItem("digiplus_auth_user");
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

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

  const staffOptions = useMemo(() => {
    const set = new Set<string>();
    salesList.forEach((s) => s.salesName && set.add(s.salesName));
    return Array.from(set).sort();
  }, [salesList]);

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

  // HALAMAN LOGIN
  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden font-sans">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 scale-105"
          style={{ backgroundImage: "url('/bg-login.jpg')", backgroundColor: "#070b14" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-[#070b14]/85 to-[#0b1222]/75 backdrop-blur-[6px]" />

        <div className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-3xl bg-[#0f172a]/80 border border-slate-700/60 shadow-2xl backdrop-blur-xl text-white">
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-600 items-center justify-center font-black text-2xl shadow-xl shadow-amber-500/25 mb-4">
              D+
            </div>
            <h1 className="text-2xl font-black tracking-wider text-white">DIGIPLUS PORTAL</h1>
            <p className="text-xs text-amber-400 font-semibold uppercase tracking-widest mt-1">QF01 • Grand Indonesia Store</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold text-center">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sales ID / Admin ID</label>
              <input
                type="text"
                required
                placeholder="22008089 atau ID Staf"
                value={inputSalesId}
                onChange={(e) => setInputSalesId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm tracking-wider uppercase shadow-lg shadow-amber-500/25 transition mt-2"
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
      <aside
        className={`${
          sidebarOpen ? "w-72" : "w-20"
        } transition-all duration-300 bg-[#0d1424] border-r border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30`}
      >
        <div className="overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
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
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              ⇄
            </button>
          </div>

          {/* User Profile */}
          {sidebarOpen && currentUser && (
            <div className="p-3 mx-3 mt-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-400 uppercase font-semibold">User Terautentikasi</p>
              <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
              <span className="text-[10px] font-mono text-amber-400">{currentUser.id}</span>
            </div>
          )}

          {/* KOTAK SHORTCUT UPLOAD DI BAGIAN KIRI */}
          {sidebarOpen ? (
            <div className="mx-3 mt-3 p-3.5 rounded-2xl bg-[#090e1a] border-2 border-amber-500/50 shadow-lg shadow-amber-500/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">📤</span>
                <div>
                  <h3 className="text-xs font-black text-amber-300 uppercase tracking-wide">Upload Saleswise</h3>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM/edit#gid=483282286"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] text-amber-400/80 hover:underline block"
                  >
                    Target: Sheet RAW (M, N, O) ↗
                  </a>
                </div>
              </div>

              {uploadStatus.message && (
                <div
                  className={`mt-2 p-2 rounded-lg text-[10px] font-semibold text-center leading-tight ${
                    uploadStatus.type === "success"
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-red-500/20 border border-red-500/40 text-red-300"
                  }`}
                >
                  {uploadStatus.message}
                </div>
              )}

              {/* Area File Drop / Click */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2.5 p-3 rounded-xl border border-dashed border-slate-700 hover:border-amber-400 bg-slate-900/80 text-center cursor-pointer transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xls,.xlsx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="text-xl block mb-1">📑</span>
                <p className="text-[11px] font-bold text-white truncate">
                  {fileName ? fileName : "Pilih File Saleswise (.xls)"}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  {parsedRows.length > 0 ? `${parsedRows.length} baris terbaca` : "Format Excel POS"}
                </p>
              </div>

              {/* Tombol Eksekusi Pengiriman ke Kolom M, N, O */}
              {parsedRows.length > 0 && (
                <button
                  onClick={handleUploadSubmit}
                  disabled={isUploading}
                  className="w-full mt-2.5 py-2 px-3 rounded-xl text-[11px] font-black bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20 transition flex items-center justify-center gap-1.5 uppercase"
                >
                  {isUploading ? (
                    <>
                      <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
                      <span>Menyimpan ke Sheet...</span>
                    </>
                  ) : (
                    <span>Kirim ke Kolom M, N, O</span>
                  )}
                </button>
              )}
            </div>
          ) : (
            <div className="p-3 text-center">
              <button
                onClick={() => setSidebarOpen(true)}
                title="Buka Shortcut Upload Saleswise"
                className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 transition text-sm"
              >
                📤
              </button>
            </div>
          )}

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5 mt-2">
            {[
              { id: "sales-detail", label: "Rincian Penjualan", icon: "📋" },
              { id: "leaderboard", label: "Staff Performance", icon: "🏆" },
              { id: "home", label: "Dashboard Overview", icon: "📊" },
              { id: "product-focus", label: "Product Focus", icon: "📱" },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => setActiveTab(nav.id as MenuTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === nav.id
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span className="text-base">{nav.icon}</span>
                {sidebarOpen && <span>{nav.label}</span>}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 border border-red-500/20 transition"
          >
            <span>🚪</span>
            {sidebarOpen && <span>Keluar</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 bg-[#0a0f1d]/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">QF01</span>
              <span className="text-slate-600">•</span>
              <h1 className="text-lg font-extrabold text-white">DIGIPLUS GRAND INDONESIA</h1>
            </div>
            <p className="text-xs text-slate-400">Target Sheet: RAW SalesPerson (Kolom M, N, O)</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl font-medium">
              Total Terfilter: <strong className="text-emerald-400">{formatIDR(totalFilteredAmount)}</strong>
            </span>
          </div>
        </header>

        {/* CONTENT TABS */}
        <main className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          {activeTab === "sales-detail" && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 flex-1 min-w-[300px]">
                  <input
                    type="text"
                    placeholder="Cari Staf, Produk, Invoice, atau SAP Article..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 flex-1 min-w-[220px]"
                  />

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

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
                  >
                    <option value="ALL">Semua Kategori</option>
                    <option value="DEVICES">DEVICES</option>
                    <option value="ACCESSORIES">ACCESSORIES</option>
                    <option value="VAS">VAS</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400">
                  Menampilkan <strong className="text-white">{filteredSales.length}</strong> transaksi
                </div>
              </div>

              {/* Table */}
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
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 font-semibold">{item.brand}</span>
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
                          <td className="py-3.5 px-4 text-right text-emerald-400 font-bold whitespace-nowrap">{formatIDR(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "leaderboard" && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-base font-bold text-white">🏆 Leaderboard Semua Staf Sales Digiplus</h2>
                <p className="text-xs text-slate-400 mt-0.5">Seluruh staf toko terdata lengkap</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0a0f1d] text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 text-center">Rank</th>
                      <th className="py-3.5 px-4">ID Staf</th>
                      <th className="py-3.5 px-4">Nama Staf</th>
                      <th className="py-3.5 px-4 text-right">Total Revenue</th>
                      <th className="py-3.5 px-4 text-center">Qty</th>
                      <th className="py-3.5 px-4 text-center">Struk</th>
                      <th className="py-3.5 px-4 text-right">ATV</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-medium">
                    {leaderboardData.map((staff, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition">
                        <td className="py-4 px-4 text-center font-bold text-amber-400">#{idx + 1}</td>
                        <td className="py-4 px-4 font-mono text-slate-400">{staff.salesId || "-"}</td>
                        <td className="py-4 px-4 font-bold text-white text-sm">{staff.name}</td>
                        <td className="py-4 px-4 text-right text-emerald-400 font-extrabold text-sm">{formatIDR(staff.totalSales)}</td>
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

          {activeTab === "home" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase">Total Sales</div>
                <div className="text-2xl font-black text-white mt-2">{formatIDR(totalFilteredAmount)}</div>
              </div>
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase">Total Staf</div>
                <div className="text-2xl font-black text-amber-400 mt-2">{staffOptions.length} Orang</div>
              </div>
              <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
                <div className="text-xs font-semibold text-slate-400 uppercase">Total Transaksi</div>
                <div className="text-2xl font-black text-emerald-400 mt-2">{filteredSales.length} Transaksi</div>
              </div>
            </div>
          )}

          {activeTab === "product-focus" && (
            <div className="p-6 rounded-2xl bg-[#0f172a] border border-slate-800">
              <h3 className="font-bold text-white mb-2">📱 Unit Unggulan Terjual</h3>
              <p className="text-xs text-slate-400 mb-6">iPhone 17 Pro, Fold 8, Galaxy S26 Ultra, dan Galaxy A17</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400">Galaxy A17 4/128GB (Liesbeth Febrina)</div>
                  <div className="text-lg font-bold text-indigo-400 mt-1">4 Unit • Rp 11.996.000</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-xs text-slate-400">iPhone 17 Pro / Pro Max</div>
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
