"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";

type MenuTab = "store-overview" | "weekly-sales" | "staff-performance" | "bnpl" | "sales-detail" | "admin-audit";
type ThemeMode = "dark" | "light";
type PeriodType = "daily" | "weekly" | "monthly";

interface RawTransaction {
  date: string;       // Format asli di sheet: DD-MM-YYYY atau DD/MM/YYYY
  isoDate: string;    // Format seragam hasil normalisasi: YYYY-MM-DD
  monthKey: string;   // Format bulan: YYYY-MM
  salesId: string;
  salesName: string;
  invoice: string;
  sapArticle: string;
  productName: string;
  qty: number;
  amount: number;
  productType: string;
  brand: string;
  groupCategory: string;
  weekLabel: string;
}

interface BnplRecord {
  date: string;
  invoice: string;
  amount: number;
  tender: string;
  product: string;
  qty: number;
  month: string;
}

interface ActivityLog {
  id: string;
  salesId: string;
  salesName: string;
  timestamp: string;
  deviceType: string;
  browser: string;
  location: string;
  coords: string;
}

// Helper Format Mata Uang IDR
const formatIDR = (n: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
};

const calcAchv = (actual: number, target: number): number => {
  if (target <= 0) return 0;
  return Number(((actual / target) * 100).toFixed(1));
};

const calcUpt = (qty: number, invoices: number): number => {
  if (invoices <= 0) return 0;
  return Number((qty / invoices).toFixed(2));
};

export default function DigiplusRetailOperations() {
  // Theme & Navigation States
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [overviewDetailCategory, setOverviewDetailCategory] = useState<"apple" | "android" | "accessories" | "vas">("apple");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [currentSalesId, setCurrentSalesId] = useState("");
  const [currentSalesName, setCurrentSalesName] = useState("");

  // Live Sheets Data State
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [bnplData, setBnplData] = useState<BnplRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState("");

  // Period Filter States
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState("2026-10");
  const [selectedWeek, setSelectedWeek] = useState("ALL");
  const [selectedDate, setSelectedDate] = useState("2026-10-24"); // Format: YYYY-MM-DD

  // Admin Audit Log State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
  const ADMIN_ID = "22008089";

  // Normalisasi Tanggal ke YYYY-MM-DD dan YYYY-MM
  const parseNormalizedDate = (rawDateStr: string) => {
    if (!rawDateStr) return { isoDate: "", monthKey: "" };
    const cleanStr = rawDateStr.trim().replace(/\//g, "-");
    const parts = cleanStr.split("-");

    let y = 0, m = 0, d = 0;
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        y = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      } else {
        // DD-MM-YYYY
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
        y = parseInt(parts[2], 10);
      }
      const isoDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const monthKey = `${y}-${String(m).padStart(2, "0")}`;
      return { isoDate, monthKey };
    }
    return { isoDate: cleanStr, monthKey: "" };
  };

  // 1. FETCH REAL-TIME DATA DARI GOOGLE SHEETS
  const fetchGoogleSheetsRealtime = async () => {
    setIsLoading(true);
    try {
      const dbUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=602901290`;
      const bnplUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=2697970`;

      const [resDb, resBnpl] = await Promise.all([fetch(dbUrl), fetch(bnplUrl)]);
      const textDb = await resDb.text();
      const textBnpl = await resBnpl.text();

      // Parse JSONP Tab DATABASE
      const startDb = textDb.indexOf("{");
      const endDb = textDb.lastIndexOf("}") + 1;
      const jsonDb = JSON.parse(textDb.substring(startDb, endDb));
      const rowsDb = jsonDb.table.rows;

      const parsedTrx: RawTransaction[] = [];
      rowsDb.forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const rawDate = c[0]?.f || c[0]?.v || "";
        const { isoDate, monthKey } = parseNormalizedDate(rawDate);

        const salesId = String(c[1]?.v || "").trim();
        const salesName = String(c[2]?.v || "").trim();
        const invoice = String(c[3]?.v || "").trim();
        const sapArticle = String(c[4]?.v || "").trim();
        const productName = String(c[5]?.v || "").trim();
        const qty = Number(c[7]?.v) || 1;
        const rawAmount = c[8]?.v;
        const amount = typeof rawAmount === "number" ? rawAmount : Number(String(rawAmount || 0).replace(/[^0-9]/g, ""));
        const productType = String(c[9]?.v || "").trim();
        const brand = String(c[10]?.v || "").trim().toUpperCase();
        let groupCategory = String(c[11]?.v || "").trim().toUpperCase();
        const weekLabel = String(c[14]?.v || "").trim();

        const pUpper = productName.toUpperCase();
        if (!groupCategory || groupCategory === "NAN" || groupCategory === "N/A") {
          if (brand === "APPLE" || pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("AIRPOD")) {
            groupCategory = "DEVICES";
          } else if (["SAMSUNG", "OPPO", "MOTOROLA", "HUAWEI", "INFINIX", "XIAOMI"].includes(brand)) {
            groupCategory = "DEVICES";
          } else if (brand === "QOALA" || brand === "TELKOMSEL" || brand === "XL" || brand === "INDOSAT" || pUpper.includes("PROTEKSI")) {
            groupCategory = "VAS";
          } else {
            groupCategory = "ACCESSORIES";
          }
        }

        if (invoice && amount > 0 && salesName) {
          parsedTrx.push({
            date: rawDate,
            isoDate,
            monthKey: monthKey || "2026-10",
            salesId,
            salesName,
            invoice,
            sapArticle,
            productName,
            qty,
            amount,
            productType,
            brand,
            groupCategory,
            weekLabel,
          });
        }
      });

      // Parse JSONP Tab BNPL DATABASE
      const startBnpl = textBnpl.indexOf("{");
      const endBnpl = textBnpl.lastIndexOf("}") + 1;
      const jsonBnpl = JSON.parse(textBnpl.substring(startBnpl, endBnpl));
      const rowsBnpl = jsonBnpl.table.rows;

      const parsedBnpl: BnplRecord[] = [];
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
          parsedBnpl.push({ date, invoice, amount, tender, product, qty, month });
        }
      });

      setTransactions(parsedTrx);
      setBnplData(parsedBnpl);
      setLastSyncTime(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }));

      if (currentSalesId && !currentSalesName) {
        if (currentSalesId === ADMIN_ID) {
          setCurrentSalesName("Store Leader Admin");
        } else {
          const match = parsedTrx.find((t) => t.salesId === currentSalesId);
          if (match) setCurrentSalesName(match.salesName);
        }
      }
    } catch (err) {
      console.error("Gagal sinkronisasi data Google Sheets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGoogleSheetsRealtime();

    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("digi_ops_user");
      const savedName = localStorage.getItem("digi_ops_name");
      const savedTheme = localStorage.getItem("digi_ops_theme") as ThemeMode;
      if (savedTheme) setTheme(savedTheme);
      if (savedUser) {
        setIsLoggedIn(true);
        setCurrentSalesId(savedUser);
        setCurrentSalesName(savedName || `Sales ${savedUser}`);
      }
      const savedLogs = localStorage.getItem("digi_ops_admin_logs");
      if (savedLogs) {
        try { setActivityLogs(JSON.parse(savedLogs)); } catch (e) {}
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("digi_ops_theme", nextTheme);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    const cleanId = salesIdInput.trim();
    if (!cleanId) {
      setLoginErr("Masukkan Sales ID Anda!");
      return;
    }

    let detectedName = `Sales ${cleanId}`;
    if (cleanId === ADMIN_ID) {
      detectedName = "Store Leader Admin";
    } else {
      const match = transactions.find((t) => t.salesId === cleanId);
      if (match) detectedName = match.salesName;
    }

    localStorage.setItem("digi_ops_user", cleanId);
    localStorage.setItem("digi_ops_name", detectedName);
    setCurrentSalesId(cleanId);
    setCurrentSalesName(detectedName);
    setIsLoggedIn(true);
    setLoginErr("");

    const log: ActivityLog = {
      id: Date.now().toString(),
      salesId: cleanId,
      salesName: detectedName,
      timestamp: new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " WIB",
      deviceType: typeof window !== "undefined" && window.innerWidth < 768 ? "Handphone" : "Komputer",
      browser: "Chrome/Safari",
      location: "Store Grand Indonesia",
      coords: "-6.1953, 106.8219",
    };
    setActivityLogs((prev) => [log, ...prev.slice(0, 49)]);
  };

  const handleLogout = () => {
    localStorage.removeItem("digi_ops_user");
    localStorage.removeItem("digi_ops_name");
    setIsLoggedIn(false);
    setCurrentSalesId("");
    setCurrentSalesName("");
  };

  // Daftar Definisi Minggu Resmi dari Kolom O
  const WEEK_DEFINITIONS = useMemo(() => [
    { key: "W1", label: "Week 1 (03/10/26)", range: "01 - 03 Okt 2026", days: 3 },
    { key: "W2", label: "W2 (10OKT 2026)", range: "04 - 10 Okt 2026", days: 7 },
    { key: "W3", label: "W3 (17OKT 2026)", range: "11 - 17 Okt 2026", days: 7 },
    { key: "W4", label: "W4 (24OKT 2026)", range: "18 - 24 Okt 2026", days: 7 },
  ], []);

  // 2. LOGIKA PENYARINGAN DATA TRANSAKSI DINAMIS
  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter 1: Bulan
      if (selectedMonth !== "ALL" && t.monthKey && t.monthKey !== selectedMonth) {
        return false;
      }
      // Filter 2: Mode Periode
      if (periodType === "daily") {
        return t.isoDate === selectedDate;
      }
      if (periodType === "weekly" && selectedWeek !== "ALL") {
        const wDef = WEEK_DEFINITIONS.find((w) => w.key === selectedWeek);
        return wDef ? t.weekLabel.toLowerCase().includes(wDef.label.toLowerCase()) : true;
      }
      return true;
    });
  }, [transactions, selectedMonth, periodType, selectedDate, selectedWeek, WEEK_DEFINITIONS]);

  // 3. KALKULASI OVERVIEW METRICS SESUAI DATA TERSARING
  const overviewStats = useMemo(() => {
    const actual = activeTransactions.reduce((acc, t) => acc + t.amount, 0);
    const target = periodType === "daily"
      ? Math.round(8728667173 / 31)
      : periodType === "weekly"
      ? Math.round((8728667173 / 31) * (WEEK_DEFINITIONS.find((w) => w.key === selectedWeek)?.days || 7))
      : 8728667173;

    const achv = calcAchv(actual, target);
    const variance = actual - target;
    const estimate = Math.round(actual * 1.29);
    const qtyTotal = activeTransactions.reduce((acc, t) => acc + t.qty, 0);
    const invoiceCount = new Set(activeTransactions.map((t) => t.invoice)).size;
    const storeUPT = calcUpt(qtyTotal, invoiceCount);

    const appleItems = activeTransactions.filter((t) => t.brand === "APPLE" || t.productName.toUpperCase().includes("IPHONE"));
    const appleActual = appleItems.reduce((acc, t) => acc + t.amount, 0);
    const appleTarget = Math.round(target * 0.794);

    const androidItems = activeTransactions.filter((t) =>
      ["SAMSUNG", "OPPO", "MOTOROLA", "HUAWEI", "INFINIX", "XIAOMI"].includes(t.brand) ||
      (t.groupCategory === "DEVICES" && t.brand !== "APPLE")
    );
    const androidActual = androidItems.reduce((acc, t) => acc + t.amount, 0);
    const androidTarget = Math.round(target * 0.108);

    const accItems = activeTransactions.filter((t) => t.groupCategory === "ACCESSORIES");
    const accActual = accItems.reduce((acc, t) => acc + t.amount, 0);
    const accTarget = Math.round(target * 0.053);

    const vasItems = activeTransactions.filter((t) =>
      t.groupCategory === "VAS" ||
      ["QOALA", "TELKOMSEL", "XL", "INDOSAT"].includes(t.brand) ||
      t.productName.toUpperCase().includes("QOALA") ||
      t.productName.toUpperCase().includes("PROTEKSI")
    );
    const vasActual = vasItems.reduce((acc, t) => acc + t.amount, 0);
    const vasTarget = Math.round(target * 0.045);

    return {
      actual,
      target,
      achv,
      variance,
      estimate,
      qtyTotal,
      invoiceCount,
      storeUPT,
      lobs: [
        { name: "Apple Devices", icon: "🍎", actual: appleActual, target: appleTarget, achv: calcAchv(appleActual, appleTarget), variance: appleActual - appleTarget, estimate: Math.round(appleActual * 1.29), color: "text-sky-400" },
        { name: "Android Devices", icon: "🤖", actual: androidActual, target: androidTarget, achv: calcAchv(androidActual, androidTarget), variance: androidActual - androidTarget, estimate: Math.round(androidActual * 1.29), color: "text-indigo-400" },
        { name: "Accessories", icon: "🔌", actual: accActual, target: accTarget, achv: calcAchv(accActual, accTarget), variance: accActual - accTarget, estimate: Math.round(accActual * 1.29), color: "text-amber-400" },
        { name: "VAS (Qoala, Telkomsel, XL, Indosat)", icon: "🛡️", actual: vasActual, target: vasTarget, achv: calcAchv(vasActual, vasTarget), variance: vasActual - vasTarget, estimate: Math.round(vasActual * 1.29), color: "text-purple-400" },
      ],
      appleItems,
      androidItems,
      accItems,
      vasItems,
    };
  }, [activeTransactions, periodType, selectedWeek, WEEK_DEFINITIONS]);

  // 4. KALKULASI STAFF PERFORMANCE MENGIKUTI DATA TERSARING
  const staffStats = useMemo(() => {
    const map: Record<string, {
      salesId: string;
      name: string;
      total: number;
      qty: number;
      invoices: Set<string>;
      appleMap: Record<string, { actual: number; qty: number; icon: string }>;
      androidMap: Record<string, { actual: number; qty: number; icon: string }>;
      accMap: Record<string, { actual: number; qty: number; icon: string }>;
      vasMap: Record<string, { actual: number; qty: number; icon: string }>;
    }> = {};

    activeTransactions.forEach((t) => {
      const id = t.salesId || "OTHER";
      if (!map[id]) {
        map[id] = {
          salesId: id,
          name: t.salesName || `Sales ${id}`,
          total: 0,
          qty: 0,
          invoices: new Set(),
          appleMap: {
            "iPhone": { actual: 0, qty: 0, icon: "📱" },
            "iPad": { actual: 0, qty: 0, icon: "📟" },
            "MacBook": { actual: 0, qty: 0, icon: "💻" },
            "Apple Watch": { actual: 0, qty: 0, icon: "⌚" },
            "AirPods": { actual: 0, qty: 0, icon: "🎧" },
          },
          androidMap: {
            "Samsung Devices": { actual: 0, qty: 0, icon: "📱" },
            "Oppo Devices": { actual: 0, qty: 0, icon: "🟢" },
            "Motorola Devices": { actual: 0, qty: 0, icon: "Ⓜ️" },
            "Huawei Devices": { actual: 0, qty: 0, icon: "🔴" },
            "Infinix Devices": { actual: 0, qty: 0, icon: "⚡" },
            "Xiaomi Devices": { actual: 0, qty: 0, icon: "🟠" },
          },
          accMap: {},
          vasMap: {
            "Qoala Proteksi Gadget": { actual: 0, qty: 0, icon: "🛡️" },
            "Telkomsel Halo/Data": { actual: 0, qty: 0, icon: "🔴" },
            "XL Prioritas": { actual: 0, qty: 0, icon: "🔵" },
            "Indosat IM3": { actual: 0, qty: 0, icon: "🟡" },
          },
        };
      }

      map[id].total += t.amount;
      map[id].qty += t.qty;
      if (t.invoice) map[id].invoices.add(t.invoice);

      const pUpper = t.productName.toUpperCase();

      if (t.brand === "APPLE" || pUpper.includes("IPHONE")) {
        if (pUpper.includes("IPHONE")) { map[id].appleMap["iPhone"].actual += t.amount; map[id].appleMap["iPhone"].qty += t.qty; }
        else if (pUpper.includes("IPAD")) { map[id].appleMap["iPad"].actual += t.amount; map[id].appleMap["iPad"].qty += t.qty; }
        else if (pUpper.includes("MAC") || pUpper.includes("BOOK")) { map[id].appleMap["MacBook"].actual += t.amount; map[id].appleMap["MacBook"].qty += t.qty; }
        else if (pUpper.includes("WATCH")) { map[id].appleMap["Apple Watch"].actual += t.amount; map[id].appleMap["Apple Watch"].qty += t.qty; }
        else if (pUpper.includes("AIRPOD")) { map[id].appleMap["AirPods"].actual += t.amount; map[id].appleMap["AirPods"].qty += t.qty; }
      }

      if (t.brand === "SAMSUNG" || pUpper.includes("GALAXY")) { map[id].androidMap["Samsung Devices"].actual += t.amount; map[id].androidMap["Samsung Devices"].qty += t.qty; }
      else if (t.brand === "OPPO") { map[id].androidMap["Oppo Devices"].actual += t.amount; map[id].androidMap["Oppo Devices"].qty += t.qty; }
      else if (t.brand === "MOTOROLA") { map[id].androidMap["Motorola Devices"].actual += t.amount; map[id].androidMap["Motorola Devices"].qty += t.qty; }
      else if (t.brand === "HUAWEI") { map[id].androidMap["Huawei Devices"].actual += t.amount; map[id].androidMap["Huawei Devices"].qty += t.qty; }
      else if (t.brand === "INFINIX") { map[id].androidMap["Infinix Devices"].actual += t.amount; map[id].androidMap["Infinix Devices"].qty += t.qty; }
      else if (t.brand === "XIAOMI") { map[id].androidMap["Xiaomi Devices"].actual += t.amount; map[id].androidMap["Xiaomi Devices"].qty += t.qty; }

      if (t.groupCategory === "ACCESSORIES") {
        const item = t.productName.trim() || "Aksesoris";
        if (!map[id].accMap[item]) map[id].accMap[item] = { actual: 0, qty: 0, icon: "🔌" };
        map[id].accMap[item].actual += t.amount;
        map[id].accMap[item].qty += t.qty;
      }

      if (t.brand === "QOALA" || pUpper.includes("QOALA") || pUpper.includes("PROTEKSI")) {
        map[id].vasMap["Qoala Proteksi Gadget"].actual += t.amount;
        map[id].vasMap["Qoala Proteksi Gadget"].qty += t.qty;
      } else if (t.brand === "TELKOMSEL" || pUpper.includes("TELKOMSEL")) {
        map[id].vasMap["Telkomsel Halo/Data"].actual += t.amount;
        map[id].vasMap["Telkomsel Halo/Data"].qty += t.qty;
      } else if (t.brand === "XL") {
        map[id].vasMap["XL Prioritas"].actual += t.amount;
        map[id].vasMap["XL Prioritas"].qty += t.qty;
      } else if (t.brand === "INDOSAT") {
        map[id].vasMap["Indosat IM3"].actual += t.amount;
        map[id].vasMap["Indosat IM3"].qty += t.qty;
      }
    });

    const sorted = Object.values(map).sort((a, b) => b.total - a.total);

    return sorted.map((s, idx) => {
      const invCount = s.invoices.size;
      const upt = calcUpt(s.qty, invCount);
      const targetQuota = 1658446763;
      const achv = calcAchv(s.total, targetQuota);
      const variance = s.total - targetQuota;

      const words = s.name.split(" ");
      const initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();

      const sortedAcc = Object.entries(s.accMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.actual - a.actual);

      const totalAcc = sortedAcc.reduce((acc, c) => acc + c.actual, 0);
      const totalVas = Object.values(s.vasMap).reduce((acc, c) => acc + c.actual, 0);

      let status: "Tercapai" | "Perlu Perhatian Khusus" | "Dalam Pantauan" = "Dalam Pantauan";
      let ringkasan = `Pencapaian ${achv}% terhadap target kuota.`;
      let rekomendasi = "Tingkatkan penawaran paket bundling aksesoris dan layanan proteksi pada setiap nota penjualan.";

      if (achv >= 100) {
        status = "Tercapai";
        ringkasan = `Performa sangat prima! Target tercapai ${achv}% dengan total ${invCount} struk nota.`;
        rekomendasi = "Pertahankan konsistensi penjualan unit dan maksimalkan attachment rate aksesoris premium.";
      } else if (achv < 20) {
        status = "Perlu Perhatian Khusus";
        ringkasan = `Pencapaian sangat tertinggal (${achv}%), defisit omset mencapai ${formatIDR(variance)}.`;
        rekomendasi = "Evaluasi interaksi prospek customer harian dan manfaatkan program cicilan/BNPL 0%.";
      }

      return {
        rank: idx + 1,
        salesId: s.salesId,
        name: s.name,
        initials,
        total: s.total,
        qty: s.qty,
        invoices: invCount,
        upt,
        totalAcc,
        totalVas,
        appleSub: Object.entries(s.appleMap).map(([name, d]) => ({ name, ...d })),
        androidSub: Object.entries(s.androidMap).map(([name, d]) => ({ name, ...d })),
        accessoriesSub: sortedAcc,
        vasSub: Object.entries(s.vasMap).map(([name, d]) => ({ name, ...d })),
        status,
        ringkasan,
        rekomendasi,
      };
    });
  }, [activeTransactions]);

  // 5. KALKULASI BNPL
  const bnplSummary = useMemo(() => {
    const totalAmount = bnplData.reduce((acc, b) => acc + b.amount, 0);
    const totalQty = bnplData.reduce((acc, b) => acc + b.qty, 0);
    const storeActual = overviewStats.actual;

    const map: Record<string, { amount: number; qty: number }> = {};
    bnplData.forEach((b) => {
      const tKey = b.tender || "Other";
      if (!map[tKey]) map[tKey] = { amount: 0, qty: 0 };
      map[tKey].amount += b.amount;
      map[tKey].qty += b.qty;
    });

    const tenders = Object.entries(map).map(([tender, d]) => {
      const share = storeActual > 0 ? Number(((d.amount / storeActual) * 100).toFixed(1)) : 0;
      const estimate = Math.round((d.amount / 24) * 31);
      return { tender, amount: d.amount, qty: d.qty, share, estimate };
    }).sort((a, b) => b.amount - a.amount);

    return { totalAmount, totalQty, tenders, list: bnplData };
  }, [bnplData, overviewStats.actual]);

  // Share Daily Report ke WhatsApp
  const handleShareDaily = () => {
    const appleVal = overviewStats.lobs.find((l) => l.name.includes("Apple"))?.actual || 0;
    const androidVal = overviewStats.lobs.find((l) => l.name.includes("Android"))?.actual || 0;
    const accVal = overviewStats.lobs.find((l) => l.name.includes("Accessories"))?.actual || 0;
    const vasVal = overviewStats.lobs.find((l) => l.name.includes("VAS"))?.actual || 0;

    const text = 
`*DAILY RETAIL SALES REPORT - DIGIPLUS GRAND INDONESIA*
Tanggal: ${selectedDate} (Filter: ${periodType.toUpperCase()})

📊 *Pencapaian Store:*
• Sales: ${formatIDR(overviewStats.actual)}
• Target: ${formatIDR(overviewStats.target)}
• Achievement: ${overviewStats.achv}%
• Gap / Sisa: ${formatIDR(overviewStats.variance)}

📦 *Breakdown Kategori:*
• Apple Devices: ${formatIDR(appleVal)}
• Android Devices: ${formatIDR(androidVal)}
• Accessories: ${formatIDR(accVal)}
• VAS: ${formatIDR(vasVal)}

📈 *Metrik Operasional:*
• UPT: ${overviewStats.storeUPT}
• Invoice: ${overviewStats.invoiceCount} Struk
• Qty: ${overviewStats.qtyTotal} Unit

_Diperbarui otomatis via Store Performance Engine._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  // Styling Dinamis Tema
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#1A1831]" : "bg-[#F9F8F3]";
  const textMain = isDark ? "text-[#FFF6E9]" : "text-[#1E293B]";
  const textMuted = isDark ? "text-[#FFF6E9]/70" : "text-slate-600";
  const cardBg = isDark ? "bg-[#221F40] border-[#3B3666]" : "bg-white border-[#E5E2D9] shadow-sm";
  const innerBg = isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F2EFE9] border-[#E5E2D9]";
  const accentText = isDark ? "text-[#F5BA42]" : "text-[#054ff0]";
  const activeTabBtn = isDark ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md" : "bg-[#054ff0] text-white font-black shadow-md";

  // LOGIN SCREEN
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4 ${textMain} font-sans`}>
        <div className={`max-w-md w-full ${cardBg} border-2 rounded-3xl p-6 md:p-8 shadow-2xl`}>
          <div className="text-center mb-6">
            <div className={`w-14 h-14 ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg mb-3`}>
              D+
            </div>
            <h1 className="text-xl font-bold">DIGIPLUS GRAND INDONESIA</h1>
            <p className={`text-xs ${accentText} mt-1 font-semibold`}>PORTAL LOGIN RESMI OPERASIONAL</p>
          </div>

          {loginErr && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-xs font-semibold text-center">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider">Sales ID / NIK Karyawan</label>
              <input
                type="text"
                required
                placeholder="Contoh: 24004971 atau 22008089"
                value={salesIdInput}
                onChange={(e) => setSalesIdInput(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3 rounded-xl ${innerBg} border text-sm focus:outline-none`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider">Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3 rounded-xl ${innerBg} border text-sm focus:outline-none`}
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3.5 ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} font-black rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg`}
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen ${bgMain} ${textMain} font-sans relative`}>
      {/* Mobile Drawer Button */}
      <div className="lg:hidden fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`w-14 h-14 rounded-full ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} font-black text-2xl flex items-center justify-center shadow-2xl transition`}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40" />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-72 ${isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F2EFE9] border-[#E5E2D9]"} border-r flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 pb-4 border-b border-inherit">
            <div className={`w-10 h-10 ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} rounded-xl flex items-center justify-center font-black text-lg`}>
              D+
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider">DIGIPLUS</h2>
              <p className={`text-[10px] ${accentText} font-semibold`}>STORE OPERATIONS QF01</p>
            </div>
          </div>

          {/* User Tag */}
          <div className={`mt-3 p-3 rounded-2xl ${cardBg} border flex items-center justify-between`}>
            <div>
              <span className="text-[9px] uppercase tracking-wider opacity-60 block font-bold">User Terotentikasi</span>
              <span className="text-xs font-bold truncate block">{currentSalesName}</span>
              <span className={`text-[10px] font-mono ${accentText}`}>ID: {currentSalesId}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          {/* Navigasi Menu */}
          <nav className="mt-5 space-y-1.5">
            <button
              onClick={() => { setActiveTab("store-overview"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "store-overview" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>📊</span>
              <span>Overview Store</span>
            </button>

            <button
              onClick={() => { setActiveTab("weekly-sales"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "weekly-sales" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>📈</span>
              <span>Weekly sales (WoW)</span>
            </button>

            <button
              onClick={() => { setActiveTab("staff-performance"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "staff-performance" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>🏆</span>
              <span>Staff Performance Detail</span>
            </button>

            <button
              onClick={() => { setActiveTab("bnpl"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "bnpl" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>💳</span>
              <span>BNPL Transactions</span>
            </button>

            {currentSalesId === ADMIN_ID && (
              <button
                onClick={() => { setActiveTab("admin-audit"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition border border-emerald-500/40 ${
                  activeTab === "admin-audit" ? "bg-emerald-500 text-white font-black" : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                <span>🛡️</span>
                <span>Activity Staff (Admin)</span>
              </button>
            )}

            <button
              onClick={() => { setActiveTab("sales-detail"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "sales-detail" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>📋</span>
              <span>Rincian Transaksi Log</span>
            </button>
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-inherit space-y-2">
          <button
            onClick={toggleTheme}
            className={`w-full py-2 px-3 ${innerBg} border rounded-xl text-xs font-bold transition flex items-center justify-center gap-2`}
          >
            <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* HEADER: PERSONALISASI & FILTER BAR REAKTIF */}
        <header className="mb-6 border-b border-inherit pb-5">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <div className={`text-xl sm:text-2xl font-black ${accentText} flex items-center gap-2`}>
                <span>Halo, {currentSalesName} 👋</span>
              </div>
              <p className={`text-xs ${textMuted} mt-1`}>
                Live Sync: <code>DATABASE</code> (gid: 602901290) & <code>BNPL DATABASE</code> (gid: 2697970)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareDaily}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
              >
                <span>📲</span>
                <span>Share Daily (WhatsApp)</span>
              </button>

              <button
                onClick={fetchGoogleSheetsRealtime}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${innerBg}`}
              >
                <span>🔄</span>
                <span>{isLoading ? "Mengambil Data..." : "Sync Live"}</span>
              </button>

              <span className={`px-3 py-1.5 rounded-lg border text-xs font-bold ${
                isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-600 border-emerald-200"
              }`}>
                Actual Terfilter: {formatIDR(overviewStats.actual)}
              </span>
            </div>
          </div>

          {/* BARIS FILTER DINAMIS */}
          <div className={`p-3 ${cardBg} border rounded-2xl flex flex-wrap items-center gap-3 justify-between text-xs`}>
            <div className="flex flex-wrap items-center gap-3">
              {/* Toggle Mode Periode */}
              <div className="flex items-center gap-1 bg-black/20 p-1 rounded-xl">
                {(["daily", "weekly", "monthly"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPeriodType(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition ${
                      periodType === mode ? activeTabBtn : "opacity-70 hover:opacity-100"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Filter Bulan */}
              <div className="flex items-center gap-2">
                <span className="opacity-70 font-semibold">📅 Bulan:</span>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
                >
                  <option value="2026-10">2026-10 (Oktober 2026)</option>
                  <option value="ALL">Semua Bulan</option>
                </select>
              </div>

              {/* Filter Week */}
              {periodType === "weekly" && (
                <div className="flex items-center gap-2">
                  <span className="opacity-70 font-semibold">📊 Week:</span>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
                  >
                    <option value="ALL">Semua Minggu</option>
                    {WEEK_DEFINITIONS.map((w) => (
                      <option key={w.key} value={w.key}>{w.label} ({w.range})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Filter Daily / Tanggal */}
              {periodType === "daily" && (
                <div className="flex items-center gap-2">
                  <span className="opacity-70 font-semibold">🗓️ Tanggal:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
                  />
                </div>
              )}
            </div>

            <div className={`text-[11px] ${accentText} font-semibold flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Terfilter: {activeTransactions.length} Baris ({periodType.toUpperCase()} - {periodType === "daily" ? selectedDate : periodType === "weekly" ? selectedWeek : selectedMonth})</span>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="py-20 text-center text-sm font-semibold opacity-60 animate-pulse">
            ⏳ Mengambil dan mengkalkulasi data langsung dari Google Sheets...
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* TAB 1: OVERVIEW STORE                                     */}
            {/* ========================================================= */}
            {activeTab === "store-overview" && (
              <div className="space-y-6 sm:space-y-8">
                {/* Time Gone Card */}
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl relative overflow-hidden`}>
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl ${innerBg} border flex items-center justify-center text-2xl font-bold ${accentText}`}>
                        ⏳
                      </div>
                      <div>
                        <h2 className="text-base font-black tracking-wide">TIME GONE ANALYTICS (OKTOBER 2026)</h2>
                        <p className={`text-xs ${textMuted}`}>
                          Hari Berjalan: <strong className={textMain}>24 hari</strong> dari 31 hari (7 hari tersisa)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Time Elapsed</span>
                        <span className={`text-2xl font-black ${accentText}`}>77.4%</span>
                      </div>
                      <div className="h-8 w-px bg-inherit mx-1 opacity-20"></div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold opacity-60 block">Achv Pace</span>
                        <span className="text-2xl font-black text-emerald-500">{overviewStats.achv}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className={textMuted}>Waktu Berjalan (Time Gone):</span>
                        <span className={`font-bold ${accentText}`}>77.4%</span>
                      </div>
                      <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                        <div className={`${isDark ? "bg-[#F5BA42]" : "bg-[#054ff0]"} h-full rounded-full`} style={{ width: "77.4%" }}></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className={textMuted}>Pencapaian Omset Terfilter:</span>
                        <span className="font-bold text-emerald-500">{overviewStats.achv}% ({formatIDR(overviewStats.actual)})</span>
                      </div>
                      <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(overviewStats.achv, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-inherit text-xs">
                    <div className={`p-3 ${innerBg} rounded-xl border`}>
                      <span className="opacity-60 text-[11px]">Kesenjangan Pace:</span>
                      <div className="text-sm font-black text-red-500 mt-0.5">-{(77.4 - overviewStats.achv).toFixed(1)}%</div>
                    </div>
                    <div className={`p-3 ${innerBg} rounded-xl border`}>
                      <span className="opacity-60 text-[11px]">Daily Run Rate Aktual:</span>
                      <div className="text-sm font-black text-sky-500 mt-0.5">{formatIDR(Math.round(overviewStats.actual / 24))} / hari</div>
                    </div>
                    <div className={`p-3 ${innerBg} rounded-xl border`}>
                      <span className="opacity-60 text-[11px]">Target Periode:</span>
                      <div className={`text-sm font-black ${accentText} mt-0.5`}>{formatIDR(overviewStats.target)}</div>
                    </div>
                    <div className={`p-3 ${innerBg} rounded-xl border`}>
                      <span className="opacity-60 text-[11px]">UPT Terfilter:</span>
                      <div className="text-sm font-black text-emerald-500 mt-0.5">{overviewStats.storeUPT} Unit/Struk</div>
                    </div>
                  </div>
                </div>

                {/* Matriks 4 LOB Kategori */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold">Matriks Kategori Produk ({periodType.toUpperCase()})</h2>
                    <span className={`text-[11px] ${textMuted} hidden sm:inline`}>VAS: Qoala + Telkomsel + XL + Indosat</span>
                  </div>

                  <div className={`${cardBg} border rounded-2xl overflow-x-auto shadow-xl`}>
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-4 px-4">Kategori Produk</th>
                          <th className="py-4 px-4 text-right">Actual Sales</th>
                          <th className="py-4 px-4 text-right">Target</th>
                          <th className="py-4 px-4 text-center">Achievement (%)</th>
                          <th className="py-4 px-4 text-right">Variance</th>
                          <th className="py-4 px-4 text-right">Estimate</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {overviewStats.lobs.map((row, idx) => (
                          <tr key={idx} className="hover:opacity-90 transition">
                            <td className="py-4 px-4 font-bold text-sm">
                              <span className="mr-2">{row.icon}</span>
                              <span>{row.name}</span>
                            </td>
                            <td className={`py-4 px-4 text-right font-extrabold text-sm ${row.color}`}>{formatIDR(row.actual)}</td>
                            <td className="py-4 px-4 text-right font-mono opacity-80">{formatIDR(row.target)}</td>
                            <td className="py-4 px-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${innerBg}`}>
                                {row.achv}%
                              </span>
                            </td>
                            <td className={`py-4 px-4 text-right font-mono font-bold ${row.variance >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                              {formatIDR(row.variance)}
                            </td>
                            <td className="py-4 px-4 text-right text-emerald-500 font-mono font-bold">{formatIDR(row.estimate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rank Sales per Staff & UPT */}
                <div className={`p-4 sm:p-6 ${cardBg} border rounded-3xl shadow-xl`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold">🏆 Rank Sales per Staff & UPT ({periodType.toUpperCase()} Terfilter)</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3.5 px-4 text-center">Rank</th>
                          <th className="py-3.5 px-4">Nama Salesperson</th>
                          <th className="py-3.5 px-4 text-right">Actual Omset</th>
                          <th className="py-3.5 px-4 text-center">Unit</th>
                          <th className="py-3.5 px-4 text-center">Struk</th>
                          <th className="py-3.5 px-4 text-center">UPT</th>
                          <th className="py-3.5 px-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {staffStats.map((s) => (
                          <tr key={s.salesId} className="hover:opacity-90 transition">
                            <td className="py-3.5 px-4 text-center">
                              <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                                s.rank === 1 ? (isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white") : "opacity-60"
                              }`}>
                                {s.rank}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="font-bold">{s.name}</div>
                              <div className="text-[10px] opacity-60 font-mono">ID: {s.salesId}</div>
                            </td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-500 text-sm">{formatIDR(s.total)}</td>
                            <td className="py-3.5 px-4 text-center font-bold">{s.qty}</td>
                            <td className="py-3.5 px-4 text-center opacity-70">{s.invoices}</td>
                            <td className="py-3.5 px-4 text-center font-black text-sky-500">{s.upt}</td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === "Tercapai" ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"
                              }`}>
                                {s.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Rincian Produk Per Kategori */}
                <div className={`p-6 ${cardBg} border rounded-3xl shadow-xl`}>
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
                    <div>
                      <h3 className="text-base font-bold">Rincian Detail Produk Terjual per Kategori</h3>
                      <p className={`text-xs ${textMuted} mt-0.5`}>Menampilkan produk aktual yang tersaring dari Google Sheets</p>
                    </div>

                    <div className={`flex flex-wrap gap-2 ${innerBg} p-1.5 rounded-2xl border`}>
                      {(["apple", "android", "accessories", "vas"] as const).map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setOverviewDetailCategory(cat)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            overviewDetailCategory === cat ? activeTabBtn : "opacity-70 hover:opacity-100"
                          }`}
                        >
                          {cat === "apple" && "🍎 Apple"}
                          {cat === "android" && "🤖 Android"}
                          {cat === "accessories" && "🔌 Accessories"}
                          {cat === "vas" && "🛡️ VAS (Qoala/Telco)"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3 px-4">Nama Produk</th>
                          <th className="py-3 px-4">SKU / SAP Article</th>
                          <th className="py-3 px-4">Brand</th>
                          <th className="py-3 px-4 text-center">Qty</th>
                          <th className="py-3 px-4 text-right">Nilai Penjualan (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {(overviewDetailCategory === "apple"
                          ? overviewStats.appleItems
                          : overviewDetailCategory === "android"
                          ? overviewStats.androidItems
                          : overviewDetailCategory === "accessories"
                          ? overviewStats.accItems
                          : overviewStats.vasItems
                        ).slice(0, 15).map((p, i) => (
                          <tr key={i} className="hover:opacity-90 transition">
                            <td className="py-3.5 px-4 font-bold">{p.productName}</td>
                            <td className="py-3.5 px-4 font-mono opacity-60 text-[11px]">{p.sapArticle}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                                {p.brand}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold">{p.qty}</td>
                            <td className="py-3.5 px-4 text-right font-extrabold text-emerald-500">
                              {formatIDR(p.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: WEEKLY SALES (DARI SHEET DATABASE KOLOM O)        */}
            {/* ========================================================= */}
            {activeTab === "weekly-sales" && (
              <div className="space-y-6 sm:space-y-8">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                        <span>📈</span>
                        <span>WEEKLY SALES & WEEK-OVER-WEEK (WOW) DARI DATABASE KOLOM O</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Data dikelompokkan secara otomatis berdasarkan label minggu di Kolom O dengan rentang tanggal eksplisit.
                      </p>
                    </div>

                    <button
                      onClick={handleShareDaily}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <span>📲</span>
                      <span>Share Rekap Mingguan</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {weeklyReport.map((w, idx) => (
                      <div key={idx} className={`p-4 ${innerBg} border rounded-2xl`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${accentText}`}>{w.label}</span>
                          {idx > 0 && (
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${w.wowGrowth >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}>
                              {w.wowGrowth > 0 ? `+${w.wowGrowth}%` : `${w.wowGrowth}%`} WoW
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] ${textMuted} mb-1.5`}>{w.range}</p>
                        <div className="text-lg font-black mt-1">{formatIDR(w.sales)}</div>
                        <div className={`flex justify-between text-[11px] ${textMuted} mt-2`}>
                          <span>Unit: {w.qty}</span>
                          <span>Struk: {w.invCount}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`overflow-x-auto rounded-2xl border ${innerBg}`}>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-4 px-4">Label Kolom O</th>
                          <th className="py-4 px-4">Rentang Tanggal</th>
                          <th className="py-4 px-4 text-center">Unit</th>
                          <th className="py-4 px-4 text-center">Struk</th>
                          <th className="py-4 px-4 text-right">Target</th>
                          <th className="py-4 px-4 text-right">Total Penjualan</th>
                          <th className="py-4 px-4 text-center">Achv %</th>
                          <th className="py-4 px-4 text-center">WoW Growth</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {weeklyReport.map((w, i) => (
                          <tr key={i} className="hover:opacity-90 transition">
                            <td className="py-4 px-4 font-bold">{w.label}</td>
                            <td className="py-4 px-4 opacity-80">{w.range}</td>
                            <td className="py-4 px-4 text-center font-bold">{w.qty}</td>
                            <td className="py-4 px-4 text-center opacity-70">{w.invCount}</td>
                            <td className="py-4 px-4 text-right font-mono opacity-80">{formatIDR(w.target)}</td>
                            <td className="py-4 px-4 text-right font-extrabold text-emerald-400 text-sm">{formatIDR(w.sales)}</td>
                            <td className="py-4 px-4 text-center font-bold text-amber-400">{w.achv}%</td>
                            <td className="py-4 px-4 text-center font-bold">
                              {i === 0 ? (
                                <span className="opacity-50">Baseline</span>
                              ) : (
                                <span className={w.wowGrowth >= 0 ? "text-emerald-400" : "text-red-400"}>
                                  {w.wowGrowth > 0 ? `+${w.wowGrowth}%` : `${w.wowGrowth}%`}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: STAFF PERFORMANCE DETAIL (SEMUA STAF DITAMPILKAN)  */}
            {/* ========================================================= */}
            {activeTab === "staff-performance" && (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                    <span>👥</span>
                    <span>RINCIAN DETAIL SELURUH STAF SALES ({staffStats.length} ORANG)</span>
                  </h2>
                </div>

                {staffStats.map((staff) => (
                  <div key={staff.salesId} className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl relative overflow-hidden space-y-5`}>
                    {/* Header Staf */}
                    <div className="flex flex-wrap justify-between items-start gap-4 pb-4 border-b border-inherit">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl tracking-wider shadow-lg ${staff.rank === 1 ? "bg-amber-500/20 border-2 border-[#F5BA42] text-[#F5BA42]" : `${innerBg} border`}`}>
                            {staff.initials}
                          </div>
                          <span className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full inline-flex items-center justify-center font-black text-xs ${
                            staff.rank === 1 ? (isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white") : `${innerBg} border`
                          }`}>
                            #{staff.rank}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg sm:text-xl font-black flex items-center gap-2">
                            <span>{staff.name}</span>
                            {staff.rank === 1 && (
                              <span className={`text-[10px] ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} px-2 py-0.5 rounded-full font-black uppercase`}>
                                Top 1 👑
                              </span>
                            )}
                          </h3>
                          <p className={`text-xs ${textMuted} font-mono`}>ID Staf: {staff.salesId} • {staff.invoices} Struk Terbit</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-right">
                        <div className={`px-3 py-1.5 rounded-xl border ${innerBg}`}>
                          <span className="text-[9px] opacity-60 uppercase block">Actual Omset</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-400">{formatIDR(staff.total)}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border ${innerBg}`}>
                          <span className="text-[9px] opacity-60 uppercase block">UPT Staf</span>
                          <span className="text-xs sm:text-sm font-black text-sky-400">{staff.upt}</span>
                        </div>
                      </div>
                    </div>

                    {/* Evaluasi Ringkas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className={`p-3 rounded-xl border ${innerBg}`}>
                        <span className={`font-bold ${accentText} block mb-1`}>📌 Evaluasi Kinerja:</span>
                        <p className="opacity-80 leading-relaxed">{staff.ringkasan}</p>
                      </div>
                      <div className={`p-3 rounded-xl border ${innerBg}`}>
                        <span className="font-bold text-emerald-400 block mb-1">⚡ Rekomendasi Tindakan:</span>
                        <p className="opacity-80 leading-relaxed">{staff.rekomendasi}</p>
                      </div>
                    </div>

                    {/* Accessories & VAS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <span>🔌</span>
                            <span>Accessories Pencapaian</span>
                          </span>
                          <span className="text-xs font-black text-amber-400">{formatIDR(staff.totalAcc)}</span>
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                            <span>🛡️</span>
                            <span>VAS Pencapaian</span>
                          </span>
                          <span className="text-xs font-black text-purple-400">{formatIDR(staff.totalVas)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Sub-Lini Apple */}
                    <div>
                      <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🍎</span>
                        <span>Apple Devices</span>
                      </h4>
                      <div className={`overflow-x-auto rounded-xl border ${innerBg}`}>
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                            <tr>
                              <th className="py-2.5 px-3">Produk</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Actual Omset</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit font-medium">
                            {staff.appleSub.map((p, idx) => (
                              <tr key={idx} className="hover:opacity-90 transition">
                                <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                                  <span>{p.icon}</span>
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">{p.qty}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatIDR(p.actual)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sub-Lini Android */}
                    <div>
                      <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <span>🤖</span>
                        <span>Android Devices</span>
                      </h4>
                      <div className={`overflow-x-auto rounded-xl border ${innerBg}`}>
                        <table className="w-full text-left text-xs min-w-[500px]">
                          <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                            <tr>
                              <th className="py-2.5 px-3">Brand</th>
                              <th className="py-2.5 px-3 text-center">Qty</th>
                              <th className="py-2.5 px-3 text-right">Actual Omset</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit font-medium">
                            {staff.androidSub.map((p, idx) => (
                              <tr key={idx} className="hover:opacity-90 transition">
                                <td className="py-2.5 px-3 font-bold flex items-center gap-1.5">
                                  <span>{p.icon}</span>
                                  <span>{p.name}</span>
                                </td>
                                <td className="py-2.5 px-3 text-center font-bold">{p.qty}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatIDR(p.actual)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: BNPL TRANSACTIONS (LIVE DARI GID 2697970)          */}
            {/* ========================================================= */}
            {activeTab === "bnpl" && (
              <div className="space-y-6">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                        <span>💳</span>
                        <span>TRANSAKSI PEMBIAYAAN KONSUMEN (BNPL DATABASE)</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Sumber Data Live: Sheet <code>BNPL DATABASE</code> (gid: 2697970). Metrik dihitung otomatis.
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {bnplSummary.tenders.map((t, idx) => (
                      <div key={idx} className={`p-4 ${innerBg} border rounded-2xl space-y-1.5`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-black uppercase ${accentText}`}>{t.tender}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-700/40 text-slate-300">
                            {t.share}% Toko
                          </span>
                        </div>
                        <div className="text-base font-black">{formatIDR(t.amount)}</div>
                        <div className="flex justify-between text-[11px] opacity-70">
                          <span>Qty: <strong>{t.qty} Unit</strong></span>
                          <span>Est: <strong>{formatIDR(t.estimate)}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={`overflow-x-auto rounded-2xl border ${innerBg}`}>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3.5 px-4">Tanggal</th>
                          <th className="py-3.5 px-4">No. Invoice</th>
                          <th className="py-3.5 px-4">Mitra BNPL</th>
                          <th className="py-3.5 px-4">Detail Produk</th>
                          <th className="py-3.5 px-4 text-center">QTY</th>
                          <th className="py-3.5 px-4 text-right">Nilai Pembiayaan (Rp)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {bnplSummary.list.map((b, idx) => (
                          <tr key={idx} className="hover:opacity-90 transition">
                            <td className="py-3 px-4 font-mono opacity-80 whitespace-nowrap">{b.date}</td>
                            <td className={`py-3 px-4 font-mono font-bold ${accentText}`}>{b.invoice}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                                {b.tender}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-semibold max-w-md">{b.product}</td>
                            <td className="py-3 px-4 text-center font-bold">{b.qty}</td>
                            <td className="py-3 px-4 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                              {formatIDR(b.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: KHUSUS ADMIN (22008089) - ACTIVITY STAFF           */}
            {/* ========================================================= */}
            {activeTab === "admin-audit" && currentSalesId === ADMIN_ID && (
              <div className="space-y-6">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-2xl`}>
                  <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-emerald-400 flex items-center gap-2">
                        <span>🛡️</span>
                        <span>MONITORING ACTIVITY STAFF (PORTAL KHUSUS ADMIN)</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Merekam waktu login, tipe perangkat, dan lokasi/GPS setiap kali staf mengakses website dashboard.
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        localStorage.removeItem("digi_ops_admin_logs");
                        setActivityLogs([]);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-bold hover:bg-red-500/30 transition"
                    >
                      Bersihkan Log
                    </button>
                  </div>

                  <div className={`overflow-x-auto rounded-2xl border ${innerBg}`}>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3.5 px-4">Waktu Akses (WIB)</th>
                          <th className="py-3.5 px-4">Sales ID & Nama Staf</th>
                          <th className="py-3.5 px-4">Tipe Perangkat</th>
                          <th className="py-3.5 px-4">Browser</th>
                          <th className="py-3.5 px-4">Lokasi Terdeteksi</th>
                          <th className="py-3.5 px-4">Koordinat GPS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {activityLogs.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center opacity-60">
                              Belum ada aktivitas staf baru yang terekam.
                            </td>
                          </tr>
                        ) : (
                          activityLogs.map((log) => (
                            <tr key={log.id} className="hover:opacity-90 transition">
                              <td className={`py-3.5 px-4 font-mono ${accentText}`}>{log.timestamp}</td>
                              <td className="py-3.5 px-4">
                                <div className="font-bold">{log.salesName}</div>
                                <div className="text-[10px] opacity-60 font-mono">ID: {log.salesId}</div>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                                  {log.deviceType}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 opacity-80">{log.browser}</td>
                              <td className="py-3.5 px-4 text-emerald-400 font-bold">{log.location}</td>
                              <td className="py-3.5 px-4 font-mono opacity-60 text-[10px]">{log.coords}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: DETAIL LOG TRANSAKSI                               */}
            {/* ========================================================= */}
            {activeTab === "sales-detail" && (
              <div className="space-y-4">
                <div className={`p-4 sm:p-6 ${cardBg} border rounded-3xl overflow-x-auto`}>
                  <h3 className="text-base font-bold mb-4">Rincian Seluruh Transaksi Penjualan Terfilter (Live Data)</h3>
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">No. Invoice</th>
                        <th className="p-3">Salesperson</th>
                        <th className="p-3">Nama Produk</th>
                        <th className="p-3">Kategori</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit">
                      {activeTransactions.slice(0, 50).map((t, idx) => (
                        <tr key={idx} className="hover:opacity-90">
                          <td className="p-3 font-mono opacity-80 whitespace-nowrap">{t.date}</td>
                          <td className={`p-3 font-mono font-bold ${accentText}`}>{t.invoice}</td>
                          <td className="p-3 font-semibold">{t.salesName}</td>
                          <td className="p-3">{t.productName}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${innerBg}`}>
                              {t.groupCategory}
                            </span>
                          </td>
                          <td className="p-3 text-center font-bold">{t.qty}</td>
                          <td className="p-3 text-right font-extrabold text-emerald-400 whitespace-nowrap">
                            {formatIDR(t.amount)}
                          </td>
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
