"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "store-overview" | "weekly-sales" | "staff-performance" | "bnpl" | "sales-detail";
type ThemeMode = "dark" | "light";

interface TransactionItem {
  date: string;
  invoice: string;
  salesId: string;
  salesName: string;
  productName: string;
  category: string;
  qty: number;
  amount: number;
  weekLabel: string;
}

interface BnplTransaction {
  date: string;
  invoice: string;
  amount: number;
  tender: string;
  product: string;
  qty: number;
  month: string;
}

export default function DigiplusLiveDashboard() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State Data Live dari Google Sheets
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [bnplList, setBnplList] = useState<BnplTransaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Filter State
  const [filterMonth, setFilterMonth] = useState("2026-10");
  const [filterWeek, setFilterWeek] = useState("ALL");
  const [filterDate, setFilterDate] = useState("2026-10-24");

  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";

  // ==============================================================
  // 1. FETCH REAL-TIME DATA DARI SHEET "DATABASE" & "BNPL DATABASE"
  // ==============================================================
  const fetchAllSheetsData = async () => {
    setIsLoading(true);
    try {
      // URL GViz Tab DATABASE (gid: 602901290)
      const dbUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=602901290`;
      // URL GViz Tab BNPL DATABASE (gid: 2697970)
      const bnplUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=2697970`;

      const [resDb, resBnpl] = await Promise.all([fetch(dbUrl), fetch(bnplUrl)]);
      const textDb = await resDb.text();
      const textBnpl = await resBnpl.text();

      // Parse JSONP Tab DATABASE
      const jsonDb = JSON.parse(textDb.substring(textDb.indexOf("{"), textDb.lastIndexOf("}") + 1));
      const rowsDb = jsonDb.table.rows;

      const parsedTrx: TransactionItem[] = [];
      rowsDb.forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const date = c[0]?.f || c[0]?.v || "";
        const salesId = String(c[1]?.v || "").trim();
        const salesName = String(c[2]?.v || "").trim();
        const invoice = String(c[3]?.v || "").trim();
        const productName = String(c[5]?.v || "").trim();
        const qty = Number(c[7]?.v) || 1;
        const amount = Number(c[8]?.v) || 0;
        const category = String(c[11]?.v || "ACCESSORIES").trim();
        const weekLabel = String(c[14]?.v || "").trim(); // Kolom O

        if (invoice && amount > 0) {
          parsedTrx.push({
            date,
            invoice,
            salesId,
            salesName,
            productName,
            category,
            qty,
            amount,
            weekLabel,
          });
        }
      });

      // Parse JSONP Tab BNPL DATABASE
      const jsonBnpl = JSON.parse(textBnpl.substring(textBnpl.indexOf("{"), textBnpl.lastIndexOf("}") + 1));
      const rowsBnpl = jsonBnpl.table.rows;

      const parsedBnpl: BnplTransaction[] = [];
      rowsBnpl.forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const date = c[0]?.f || c[0]?.v || "";
        const invoice = String(c[1]?.v || "").trim();
        const rawAmount = c[2]?.v;
        const amount = typeof rawAmount === "number" ? rawAmount : Number(String(rawAmount || 0).replace(/[^0-9]/g, ""));
        const tender = String(c[3]?.v || "Other").trim();
        const product = String(c[4]?.v || "").trim();
        const qty = Number(c[5]?.v) || 1;
        const month = String(c[6]?.v || "").trim();

        if (invoice && amount > 0) {
          parsedBnpl.push({
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

      setTransactions(parsedTrx);
      setBnplList(parsedBnpl);
      setLastSyncTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Gagal sinkronisasi data Google Sheets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllSheetsData();
  }, []);

  // Format Mata Uang IDR
  const formatIDR = (n: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  };

  // ==============================================================
  // 2. KALKULASI DINAMIS BERDASARKAN HASIL FETCH GOOGLE SHEETS
  // ==============================================================
  const filteredData = useMemo(() => {
    let list = transactions;

    // Filter Week (Sesuai Kolom O di Sheet DATABASE)
    if (filterWeek !== "ALL") {
      list = list.filter((t) => t.weekLabel.toLowerCase().includes(filterWeek.toLowerCase()));
    }

    const totalActual = list.reduce((acc, curr) => acc + curr.amount, 0);
    const targetStore = 8728667173;
    const achv = targetStore > 0 ? Number(((totalActual / targetStore) * 100).toFixed(1)) : 0;
    const variance = totalActual - targetStore;

    // Filter Kategori LOB
    const appleSales = list.filter((t) => t.category.toUpperCase().includes("APPLE") || t.productName.toUpperCase().includes("IPHONE")).reduce((acc, c) => acc + c.amount, 0);
    const androidSales = list.filter((t) => t.category.toUpperCase().includes("ANDROID") || t.productName.toUpperCase().includes("GALAXY")).reduce((acc, c) => acc + c.amount, 0);
    const accSales = list.filter((t) => t.category.toUpperCase().includes("ACCESSORIES") || t.category.toUpperCase().includes("ACC")).reduce((acc, c) => acc + c.amount, 0);
    const vasSales = list.filter((t) => t.category.toUpperCase().includes("VAS") || t.productName.toUpperCase().includes("QOALA")).reduce((acc, c) => acc + c.amount, 0);

    return {
      list,
      totalActual,
      targetStore,
      achv,
      variance,
      appleSales,
      androidSales,
      accSales,
      vasSales,
    };
  }, [transactions, filterWeek]);

  // Kalkulasi BNPL Dinamis
  const bnplSummary = useMemo(() => {
    const totalAmount = bnplList.reduce((acc, curr) => acc + curr.amount, 0);
    const totalQty = bnplList.reduce((acc, curr) => acc + curr.qty, 0);

    const tenderMap: Record<string, { amount: number; qty: number }> = {};
    bnplList.forEach((t) => {
      if (!tenderMap[t.tender]) tenderMap[t.tender] = { amount: 0, qty: 0 };
      tenderMap[t.tender].amount += t.amount;
      tenderMap[t.tender].qty += t.qty;
    });

    const breakdown = Object.entries(tenderMap).map(([tender, data]) => ({
      tender,
      amount: data.amount,
      qty: data.qty,
      share: totalAmount > 0 ? Number(((data.amount / totalAmount) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return { totalAmount, totalQty, breakdown };
  }, [bnplList]);

  // Tema Warna
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#1A1831]" : "bg-[#F9F8F3]";
  const textMain = isDark ? "text-[#FFF6E9]" : "text-[#1E293B]";
  const cardBg = isDark ? "bg-[#221F40] border-[#3B3666]" : "bg-white border-[#E5E2D9]";
  const innerBg = isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F2EFE9] border-[#E5E2D9]";
  const accentText = isDark ? "text-[#F5BA42]" : "text-[#054ff0]";

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} font-sans flex flex-col`}>
      {/* HEADER UTAMA */}
      <header className={`p-4 border-b ${cardBg} flex flex-wrap justify-between items-center gap-4 sticky top-0 z-30 backdrop-blur-md`}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black">DIGIPLUS GRAND INDONESIA (QF01)</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
              ● Live Sync OK
            </span>
          </div>
          <p className="text-xs opacity-70 mt-0.5">
            Terhubung otomatis ke sheet <code>DATABASE</code> & <code>BNPL DATABASE</code> {lastSyncTime && `• Terakhir sync: ${lastSyncTime} WIB`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllSheetsData}
            disabled={isLoading}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${innerBg} hover:opacity-80`}
          >
            <span>🔄</span>
            <span>{isLoading ? "Menyinkronkan..." : "Sync Sekarang"}</span>
          </button>

          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${innerBg}`}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </header>

      {/* FILTER PERIODE REAL-TIME */}
      <div className={`p-3 mx-4 mt-4 rounded-2xl border ${cardBg} flex flex-wrap gap-4 items-center justify-between text-xs`}>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="opacity-70 font-semibold">Bulan:</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className={`px-2.5 py-1 rounded-xl border font-bold ${innerBg}`}
            >
              <option value="2026-10">Oktober 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="opacity-70 font-semibold">Week (Kolom O):</span>
            <select
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className={`px-2.5 py-1 rounded-xl border font-bold ${innerBg}`}
            >
              <option value="ALL">Semua Minggu (W1 - W4)</option>
              <option value="Week 1">Week 1 (03/10/26)</option>
              <option value="W2">W2 (10OKT 2026)</option>
              <option value="W3">W3 (17OKT 2026)</option>
              <option value="W4">W4 (24OKT 2026)</option>
            </select>
          </div>
        </div>

        <span className={`text-[11px] font-bold ${accentText}`}>
          Data Transaksi Terbaca: {transactions.length} Baris
        </span>
      </div>

      {/* NAVIGASI TABS */}
      <div className="flex gap-2 px-4 mt-4 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: "store-overview", label: "📊 Overview Store" },
          { id: "weekly-sales", label: "📈 Weekly Sales (WoW)" },
          { id: "bnpl", label: "💳 BNPL Transactions" },
          { id: "sales-detail", label: "📋 Rincian Transaksi" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as MenuTab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === tab.id
                ? (isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white")
                : `${innerBg} border opacity-70 hover:opacity-100`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KONTEN AKTIF */}
      <main className="p-4 flex-1 space-y-6">
        {isLoading ? (
          <div className="py-20 text-center text-sm font-semibold opacity-60 animate-pulse">
            ⏳ Mengambil data terbaru langsung dari Google Sheets...
          </div>
        ) : (
          <>
            {/* TAB OVERVIEW */}
            {activeTab === "store-overview" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border-2 ${cardBg} space-y-3`}>
                  <span className="text-xs font-bold uppercase opacity-60">Total Omset Toko (Real-Time Live Data)</span>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                    {formatIDR(filteredData.totalActual)}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs opacity-80 pt-1">
                    <span>Target: {formatIDR(filteredData.targetStore)}</span>
                    <span>•</span>
                    <span className="font-bold text-[#F5BA42]">Pencapaian: {filteredData.achv}%</span>
                    <span>•</span>
                    <span className="text-rose-400 font-bold">Variance: {formatIDR(filteredData.variance)}</span>
                  </div>
                </div>

                {/* 4 Kategori LOB */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-2xl border ${cardBg}`}>
                    <span className="text-xs font-bold opacity-60">🍎 Apple Devices</span>
                    <div className="text-lg font-black text-sky-400 mt-1">{formatIDR(filteredData.appleSales)}</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${cardBg}`}>
                    <span className="text-xs font-bold opacity-60">🤖 Android Devices</span>
                    <div className="text-lg font-black text-indigo-400 mt-1">{formatIDR(filteredData.androidSales)}</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${cardBg}`}>
                    <span className="text-xs font-bold opacity-60">🔌 Accessories</span>
                    <div className="text-lg font-black text-amber-400 mt-1">{formatIDR(filteredData.accSales)}</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${cardBg}`}>
                    <span className="text-xs font-bold opacity-60">🛡️ VAS (Qoala / Telco)</span>
                    <div className="text-lg font-black text-purple-400 mt-1">{formatIDR(filteredData.vasSales)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB BNPL (DITARIK LANGSUNG DARI SHEET BNPL DATABASE) */}
            {activeTab === "bnpl" && (
              <div className="space-y-6">
                <div className={`p-6 rounded-3xl border-2 ${cardBg} space-y-4`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-bold">Ringkasan Pembiayaan BNPL (Live Sheet)</h2>
                      <p className="text-xs opacity-70">Total Omset: {formatIDR(bnplSummary.totalAmount)} ({bnplSummary.totalQty} Unit)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {bnplSummary.breakdown.map((item, idx) => (
                      <div key={idx} className={`p-3.5 rounded-xl border ${innerBg}`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-[#F5BA42]">{item.tender}</span>
                          <span className="opacity-70">{item.share}% Share</span>
                        </div>
                        <div className="text-base font-black mt-1">{formatIDR(item.amount)}</div>
                        <div className="text-[11px] opacity-60 mt-0.5">{item.qty} Unit Terjual</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={`p-6 rounded-3xl border ${cardBg} overflow-x-auto`}>
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className={`${innerBg} border-b border-inherit`}>
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Invoice</th>
                        <th className="p-3">Tender</th>
                        <th className="p-3">Produk</th>
                        <th className="p-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit">
                      {bnplList.map((b, i) => (
                        <tr key={i} className="hover:opacity-80">
                          <td className="p-3 font-mono opacity-80">{b.date}</td>
                          <td className="p-3 font-mono font-bold text-[#F5BA42]">{b.invoice}</td>
                          <td className="p-3">{b.tender}</td>
                          <td className="p-3">{b.product}</td>
                          <td className="p-3 text-right font-extrabold text-emerald-400">{formatIDR(b.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
