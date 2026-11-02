"use client";

import React, { useState, useEffect, useMemo } from "react";

const LOG_API_URL = "https://script.google.com/macros/s/AKfycbymMye32fTgxNg4rKtLn5iqVWq4xenaZSJ2bxGW4yfZdMYoYKRbXYYCKrx1n_Uul_JNdw/exec";

// Modal Upload Bukti ke RAW SalesPerson (Kolom M-O)
export const UploadRawSalesModal = ({ isOpen, onClose, selectedInvoice, defaultSalesName }: any) => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [catatan, setCatatan] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  if (!isOpen) return null;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Silakan pilih file terlebih dahulu.");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = (reader.result as string).split(",")[1];

      const payload = {
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        fileBase64: base64Data,
        searchKey: selectedInvoice || "", 
        colN_Value: defaultSalesName || "Staf Grand Indonesia", 
        colO_Value: catatan || "Bukti Transaksi",                 
      };

      try {
        await fetch(LOG_API_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        alert("File berhasil diunggah! Link file dan data tercatat di Kolom M–O.");
        setSelectedFile(null);
        setCatatan("");
        onClose();
      } catch (err) {
        console.error("Gagal upload file:", err);
        alert("Terjadi kesalahan saat upload.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#09122A] border border-slate-300 dark:border-white/15 p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-white/10 pb-3">
          <h3 className="text-sm font-black text-slate-950 dark:text-white">Upload Bukti Transaksi (RAW SalesPerson)</h3>
          <button type="button" onClick={onClose} className="text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white text-xs font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">Pilih File / Foto Bukti:</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-900 dark:text-slate-200 font-semibold file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-sky-600 file:text-white file:font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block mb-1">Catatan Tambahan (Kolom O):</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan / keterangan..."
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-300 dark:border-white/10 text-slate-950 dark:text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition shadow-lg"
          >
            {isUploading ? "Mengunggah ke Drive & Menulis Sheet..." : "Upload & Simpan ke Kolom M-O"}
          </button>
        </form>
      </div>
    </div>
  );
};

type MenuTab =
  | "store-overview"
  | "weekly-sales"
  | "staff-performance"
  | "daily-target"
  | "schedule"
  | "feedback"
  | "bnpl"
  | "sales-detail"
  | "admin-audit"
  | "product-search"
  | "qoala-ar"
  | "mom-comparison";

type ThemeMode = "dark" | "light";
type PeriodType = "daily" | "weekly" | "monthly";

interface RawTransaction {
  date: string;
  isoDate: string;
  monthKey: string;
  month?: string;
  salesId: string;
  salesName: string;
  invoice: string;
  sapArticle: string;
  productName: string;
  qty: number;
  amount: number;
  productType: string;
  brand: string;
  brandName?: string;
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

interface StaffScheduleItem {
  id: string;
  name: string;
  role: string;
  mon: string;
  tue: string;
  wed: string;
  thu: string;
  fri: string;
  sat: string;
  sun: string;
  [key: string]: string;
}

interface FeedbackItem {
  id: string;
  salesName: string;
  salesRole: string;
  initials: string;
  sentiment: "Luar Biasa" | "Cukup Baik" | "Kecewa";
  timestamp: string;
  text: string;
  reactions: {
    thumbsUp: number;
    heart: number;
    fire: number;
    thumbsDown: number;
    sad: number;
  };
  userReactions: string[];
}

const formatIDR = (n: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(isNaN(n) ? 0 : n);
};

const formatCompactIDR = (n: number): string => {
  if (n >= 1000000000) return `Rp ${(n / 1000000000).toFixed(1)}M`;
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`;
  return formatIDR(n);
};

const calcAchv = (actual: number, target: number): number => {
  if (target <= 0) return 0;
  return Number(((actual / target) * 100).toFixed(1));
};

const calcUpt = (qty: number, invoices: number): number => {
  if (invoices <= 0) return 0;
  return Number((qty / invoices).toFixed(2));
};

const INITIAL_SCHEDULE: StaffScheduleItem[] = [
  { id: "1", name: "Angga", role: "Store Supervisor", mon: "OFF", tue: "D103", wed: "D047", thu: "D047", fri: "D103", sat: "D103", sun: "D047" },
  { id: "2", name: "Liesbeth", role: "Cashier Leader", mon: "D103", tue: "D047", wed: "OFF", thu: "D103", fri: "D103", sat: "D047", sun: "D047" },
  { id: "3", name: "Yunita", role: "Cashier", mon: "D047", tue: "OFF", wed: "D103", thu: "D047", fri: "D047", sat: "D103", sun: "D103" },
  { id: "4", name: "Surya", role: "Sales Assistant", mon: "D047", tue: "OFF", wed: "D103", thu: "D047", fri: "D047", sat: "D103", sun: "D103" },
  { id: "5", name: "Amel", role: "Sales Assistant", mon: "D103", tue: "D047", wed: "OFF", thu: "D103", fri: "D103", sat: "D047", sun: "D047" },
  { id: "6", name: "Adli", role: "Sales Assistant", mon: "OFF", tue: "D103", wed: "D103", thu: "D047", fri: "D047", sat: "D103", sun: "D047" },
  { id: "7", name: "Andrian Afi", role: "Sales Assistant", mon: "D047", tue: "D047", wed: "OFF", thu: "D103", fri: "D103", sat: "D047", sun: "D103" },
  { id: "8", name: "Bagas", role: "MT LEAPS", mon: "D103", tue: "TR", wed: "D047", thu: "D103", fri: "D047", sat: "OFF", sun: "D103" },
  { id: "9", name: "Bimo", role: "Daily Worker", mon: "D103", tue: "D047", wed: "OFF", thu: "D103", fri: "D103", sat: "OFF", sun: "D103" },
  { id: "10", name: "Dimas", role: "Daily Worker", mon: "D047", tue: "OFF", wed: "D103", thu: "D047", fri: "OFF", sat: "D103", sun: "D103" },
  { id: "11", name: "Amzahri", role: "Daily Worker", mon: "OFF", tue: "D103", wed: "D047", thu: "OFF", fri: "D103", sat: "D047", sun: "D047" },
];

const DEFAULT_FEEDBACKS: FeedbackItem[] = [
  {
    id: "fb-1",
    salesName: "Liesbeth Febrina",
    salesRole: "Cashier Leader",
    initials: "LF",
    sentiment: "Luar Biasa",
    timestamp: "Hari ini, 15:30 WIB",
    text: "Pelayanan sangat memuaskan pada transaksi iPhone 17 Pro Max. Penjelasan proteksi Qoala Diamond lengkap dan transparan sehingga customer langsung tertarik ambil proteksi 2 tahun.",
    reactions: { thumbsUp: 8, heart: 5, fire: 6, thumbsDown: 0, sad: 0 },
    userReactions: [],
  },
  {
    id: "fb-2",
    salesName: "Yunita Anggraini",
    salesRole: "Cashier",
    initials: "YA",
    sentiment: "Luar Biasa",
    timestamp: "Hari ini, 14:15 WIB",
    text: "Customer Galaxy S26 Ultra dipandu proses trade-in handphone lama dengan lancar. Paket bundling casing magnetik dan charger adapter sukses di-closing.",
    reactions: { thumbsUp: 6, heart: 3, fire: 4, thumbsDown: 0, sad: 0 },
    userReactions: [],
  }
];

export default function DigiplusOperationalEngine() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  // Theme & Navigation
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [salesIdInput, setSalesIdInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginErr, setLoginErr] = useState<string>("");
  const [currentSalesId, setCurrentSalesId] = useState<string>("");
  const [currentSalesName, setCurrentSalesName] = useState<string>("");

  // Live Spreadsheet Data & Dynamic Targets
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [bnplRecords, setBnplRecords] = useState<BnplRecord[]>([]);
  const [storeTotalTarget, setStoreTotalTarget] = useState<number>(8728667173);
  const [staffTargets, setStaffTargets] = useState<Record<string, number>>({});
  const [categoryTargets, setCategoryTargets] = useState<Record<string, number>>({
    apple: 6932151006,
    android: 943691666,
    accessories: 650000000,
    vas: 200000000,
  });
  const [scheduleData, setScheduleData] = useState<StaffScheduleItem[]>(INITIAL_SCHEDULE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Period Filters
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>("Oktober2026");
  const [momBaseMonth, setMomBaseMonth] = useState<string>("Oktober2026");
  const [momCompareMonth, setMomCompareMonth] = useState<string>("September2026");
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [w1Filter, setW1Filter] = useState<string>("");
  const [w2Filter, setW2Filter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-01");

  // Bottom Sheet Drawer State
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);

  // BNPL Tab Filter
  const [selectedBnplTender, setSelectedBnplTender] = useState<string>("ALL");

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(DEFAULT_FEEDBACKS);
  const [selectedFeedbackStaff, setSelectedFeedbackStaff] = useState<string>("ALL");

  // PPTX Exporting State
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
  const ADMIN_ID = "22008089";

  const parseNormalizedDate = (rawDateStr: string, rawMonthStr: string) => {
    let isoDate = "";

    if (rawDateStr) {
      const cleanStr = String(rawDateStr).trim().replace(/\//g, "-");
      const parts = cleanStr.split("-");
      if (parts.length === 3) {
        let y = 0, m = 0, d = 0;
        if (parts[0].length === 4) {
          y = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          d = parseInt(parts[2], 10);
        } else {
          d = parseInt(parts[0], 10);
          m = parseInt(parts[1], 10);
          y = parseInt(parts[2], 10);
        }
        if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
          isoDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        }
      }
    }

    const cleanRawM = String(rawMonthStr || "").trim();
    const mLower = cleanRawM.toLowerCase();
    let monthKey = "";

    if (mLower.includes("agu") || mLower.includes("aug") || mLower.includes("08-2026") || mLower.includes("2026-08")) {
      monthKey = "Agustus2026";
    } else if (mLower.includes("sep") || mLower.includes("09-2026") || mLower.includes("2026-09")) {
      monthKey = "September2026";
    } else if (mLower.includes("okt") || mLower.includes("oct") || mLower.includes("10-2026") || mLower.includes("2026-10")) {
      monthKey = "Oktober2026";
    } else if (cleanRawM !== "") {
      monthKey = cleanRawM;
    } else if (isoDate) {
      if (isoDate.startsWith("2026-08")) monthKey = "Agustus2026";
      else if (isoDate.startsWith("2026-09")) monthKey = "September2026";
      else if (isoDate.startsWith("2026-10")) monthKey = "Oktober2026";
      else monthKey = "Oktober2026";
    } else {
      monthKey = "Oktober2026";
    }

    return { isoDate, monthKey };
  };

  const fetchLiveGoogleSheets = async () => {
    setIsLoading(true);
    try {
      const dbUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=602901290`;
      const bnplUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=2697970`;
      const targetUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=685849310`;

      const [resDb, resBnpl, resTarget] = await Promise.all([
        fetch(dbUrl),
        fetch(bnplUrl),
        fetch(targetUrl),
      ]);

      const textDb = await resDb.text();
      const textBnpl = await resBnpl.text();
      const textTarget = await resTarget.text();

      const jsonDb = JSON.parse(
        textDb.substring(textDb.indexOf("{"), textDb.lastIndexOf("}") + 1)
      );
      const parsedTrx: RawTransaction[] = [];
      (jsonDb.table.rows || []).forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const rawDate = c[0]?.f || c[0]?.v || "";
        const rawMonth = c[12]?.f || c[12]?.v || "";
        const { isoDate, monthKey } = parseNormalizedDate(String(rawDate), String(rawMonth));

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

        if (groupCategory === "DEVICES") {
          // DEVICES
        } else if (groupCategory === "VAS" || brand === "QOALA" || brand === "TELKOMSEL" || brand === "XL" || brand === "INDOSAT" || pUpper.includes("PROTEKSI") || pUpper.includes("MYPRIO")) {
          groupCategory = "VAS";
        } else if (groupCategory === "ACCESSORIES") {
          groupCategory = "ACCESSORIES";
        } else if (brand === "APPLE" && (pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("MAC") || pUpper.includes("WATCH") || pUpper.includes("AIRPOD"))) {
          groupCategory = "DEVICES";
        } else if (["SAMSUNG", "XIAOMI", "OPPO", "MOTOROLA", "HUAWEI", "INFINIX"].includes(brand) && (pUpper.includes("PHONE") || pUpper.includes("GALAXY") || pUpper.includes("REDMI"))) {
          groupCategory = "DEVICES";
        } else {
          groupCategory = "OTHER";
        }

        if (invoice && amount > 0 && salesName) {
          parsedTrx.push({
            date: String(rawDate),
            isoDate,
            monthKey,
            month: monthKey,
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

      const jsonBnpl = JSON.parse(
        textBnpl.substring(textBnpl.indexOf("{"), textBnpl.lastIndexOf("}") + 1)
      );
      const parsedBnpl: BnplRecord[] = [];
      (jsonBnpl.table.rows || []).forEach((r: any) => {
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
          parsedBnpl.push({ date: String(date), invoice, amount, tender, product, qty, month });
        }
      });

      const jsonTarget = JSON.parse(
        textTarget.substring(textTarget.indexOf("{"), textTarget.lastIndexOf("}") + 1)
      );

      const targetMap: Record<string, number> = {};
      let parsedGrandTotal = 0;
      let targetApple = 0;
      let targetAndroid = 0;

      (jsonTarget.table.rows || []).forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const labelB = String(c[1]?.v || c[1]?.f || "").trim().toLowerCase();
        const rawAmountF = c[5]?.v;
        const amountF = typeof rawAmountF === "number"
          ? rawAmountF
          : Number(String(rawAmountF || 0).replace(/[^0-9]/g, ""));

        if (labelB.includes("grand total") && amountF > 5000000000 && parsedGrandTotal === 0) {
          parsedGrandTotal = amountF;
        }

        if (
          labelB &&
          !labelB.includes("staff name") &&
          !labelB.includes("grand total") &&
          !labelB.includes("target") &&
          amountF > 0
        ) {
          targetMap[labelB] = amountF;
        }

        if (labelB.includes("grand total") && amountF > 0) {
          if (amountF > 6000000000) targetApple = amountF;
          else if (amountF > 900000000 && amountF < 1000000000) targetAndroid = amountF;
        }
      });

      if (parsedGrandTotal > 0) setStoreTotalTarget(parsedGrandTotal);
      setStaffTargets(targetMap);
      setCategoryTargets((prev) => ({
        ...prev,
        apple: targetApple || prev.apple,
        android: targetAndroid || prev.android,
      }));

      setTransactions(parsedTrx);
      setBnplRecords(parsedBnpl);

      if (currentSalesId && !currentSalesName) {
        if (currentSalesId === ADMIN_ID) {
          setCurrentSalesName("Store Leader Admin");
        } else {
          const match = parsedTrx.find((t) => t.salesId === currentSalesId);
          if (match) setCurrentSalesName(match.salesName);
        }
      }
    } catch (err) {
      console.error("Gagal live fetch:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    fetchLiveGoogleSheets();

    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("digi_ops_user");
      const savedName = localStorage.getItem("digi_ops_name");
      const savedTheme = localStorage.getItem("digi_ops_theme") as ThemeMode;

      if (savedTheme) {
        applyTheme(savedTheme);
      } else {
        applyTheme("dark");
      }
      if (savedUser) {
        setIsLoggedIn(true);
        setCurrentSalesId(savedUser);
        setCurrentSalesName(savedName || `Sales ${savedUser}`);
      }
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    setTheme(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("digi_ops_theme", mode);
      if (mode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    applyTheme(next);
  };

  const handleRefresh = () => {
    fetchLiveGoogleSheets();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    const cleanId = salesIdInput.trim();
    if (!cleanId) {
      setLoginErr("Harap masukkan Sales ID Anda!");
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
  };

  const handleLogout = () => {
    localStorage.removeItem("digi_ops_user");
    localStorage.removeItem("digi_ops_name");
    setIsLoggedIn(false);
    setCurrentSalesId("");
    setCurrentSalesName("");
  };

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t: any) => {
      if (t.month && String(t.month).trim() !== "") {
        months.add(String(t.month).trim());
      } else if (t.monthKey && String(t.monthKey).trim() !== "") {
        months.add(String(t.monthKey).trim());
      }
    });
    return Array.from(months);
  }, [transactions]);

  const AUTO_WEEKS = useMemo(() => {
    const map = new Map<string, { label: string; minDate: string; maxDate: string; count: number }>();

    transactions.forEach((t) => {
      const wLabel = t.weekLabel ? t.weekLabel.trim() : "";
      if (!wLabel) return;

      if (!map.has(wLabel)) {
        map.set(wLabel, { label: wLabel, minDate: t.isoDate, maxDate: t.isoDate, count: 0 });
      }

      const item = map.get(wLabel)!;
      item.count++;
      if (t.isoDate && t.isoDate < item.minDate) item.minDate = t.isoDate;
      if (t.isoDate && t.isoDate > item.maxDate) item.maxDate = t.isoDate;
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.minDate.localeCompare(b.minDate));

    return sorted.map((w, idx) => {
      const key = `W${idx + 1}`;
      const formatNice = (iso: string) => {
        if (!iso) return "";
        const p = iso.split("-");
        return p.length === 3 ? `${p[2]}/${p[1]}` : iso;
      };
      const range = w.minDate ? `${formatNice(w.minDate)} s.d. ${formatNice(w.maxDate)}` : "Periode Berjalan";
      return { key, label: w.label, range, days: 7 };
    });
  }, [transactions]);

  useEffect(() => {
    if (AUTO_WEEKS.length > 0) {
      if (!w1Filter) setW1Filter(AUTO_WEEKS[Math.max(0, AUTO_WEEKS.length - 2)]?.label || AUTO_WEEKS[0].label);
      if (!w2Filter) setW2Filter(AUTO_WEEKS[AUTO_WEEKS.length - 1]?.label || AUTO_WEEKS[0].label);
    }
  }, [AUTO_WEEKS, w1Filter, w2Filter]);

  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedMonth !== "ALL" && selectedMonth !== "Semua Bulan" && t.monthKey !== selectedMonth && t.month !== selectedMonth) {
        return false;
      }
      if (periodType === "daily") {
        return t.isoDate === selectedDate;
      }
      if (periodType === "weekly" && selectedWeek !== "ALL") {
        return t.weekLabel.toLowerCase().includes(selectedWeek.toLowerCase());
      }
      return true;
    });
  }, [transactions, selectedMonth, periodType, selectedDate, selectedWeek]);

  const overviewStats = useMemo(() => {
    const activeTx = activeTransactions || [];
    const actual = activeTx.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    
    const baseTarget = storeTotalTarget || 8728667173;
    const target = periodType === "daily"
      ? Math.round(baseTarget / 31)
      : periodType === "weekly"
      ? Math.round((baseTarget / 31) * 7)
      : baseTarget;

    const achv = calcAchv(actual, target);
    const variance = actual - target;
    const estimate = Math.round(actual * 1.25);

    const qtyTotal = activeTx.reduce((acc: number, t: any) => acc + (Number(t.qty) || 1), 0);
    const invoiceCount = new Set(activeTx.map((t: any) => t.invoice)).size;
    const storeUPT = calcUpt(qtyTotal, invoiceCount);

    const appleItems = activeTx.filter((t: any) => {
      const pUpper = (t.productName || "").toUpperCase();
      const isHardware = pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("AIRPOD") || pUpper.includes("MACBOOK") || pUpper.includes("WATCH");
      const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE") || pUpper.includes("POWER");
      return (t.brand === "APPLE" && (t.groupCategory === "DEVICES" || isHardware)) && !isCaseOrAcc;
    });
    const appleActual = appleItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const appleTarget = categoryTargets.apple || Math.round(target * 0.794);

    const androidItems = activeTx.filter((t: any) => {
      const pUpper = (t.productName || "").toUpperCase();
      const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE");
      return t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseOrAcc;
    });
    const androidActual = androidItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const androidTarget = categoryTargets.android || Math.round(target * 0.108);

    const accItems = activeTx.filter((t: any) => t.groupCategory === "ACCESSORIES");
    const accActual = accItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const accTarget = categoryTargets.accessories || Math.round(target * 0.05);

    const vasItems = activeTx.filter((t: any) => t.groupCategory === "VAS");
    const vasActual = vasItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const vasTarget = categoryTargets.vas || Math.round(target * 0.045);

    const todayItems = transactions.filter((t: any) => t.isoDate === selectedDate);
    const todayActual = todayItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);

    return {
      actual,
      target,
      achv,
      variance,
      estimate,
      qtyTotal,
      invoiceCount,
      storeUPT,
      todayActual,
      lobs: [
        { name: "Apple Devices (Hardware)", icon: "🍎", actual: appleActual, target: appleTarget, achv: calcAchv(appleActual, appleTarget), variance: appleActual - appleTarget, estimate: Math.round(appleActual * 1.25), color: "text-sky-600 dark:text-sky-400" },
        { name: "Android Devices (Samsung, Xiaomi, dll)", icon: "🤖", actual: androidActual, target: androidTarget, achv: calcAchv(androidActual, androidTarget), variance: androidActual - androidTarget, estimate: Math.round(androidActual * 1.25), color: "text-indigo-600 dark:text-indigo-400" },
        { name: "Accessories (Cases & Acc)", icon: "🔌", actual: accActual, target: accTarget, achv: calcAchv(accActual, accTarget), variance: accActual - accTarget, estimate: Math.round(accActual * 1.25), color: "text-amber-600 dark:text-amber-400" },
        { name: "VAS (Qoala, Telkomsel, XL, Indosat)", icon: "🛡️", actual: vasActual, target: vasTarget, achv: calcAchv(vasActual, vasTarget), variance: vasActual - vasTarget, estimate: Math.round(vasActual * 1.25), color: "text-purple-600 dark:text-purple-400" }
      ],
      appleItems,
      androidItems,
      accItems,
      vasItems
    };
  }, [activeTransactions, periodType, storeTotalTarget, categoryTargets, selectedDate, transactions]);

  const getSubCategory = (t: RawTransaction) => {
    const p = (t.productName || "").toUpperCase();
    const b = (t.brand || "").toUpperCase();
    const g = (t.groupCategory || "").toUpperCase();

    if (b === "APPLE") {
      if (p.includes("IPHONE")) return "iPhone";
      if (p.includes("IPAD")) return "iPad";
      if (p.includes("MAC") || p.includes("BOOK")) return "MacBook";
      if (p.includes("WATCH")) return "Apple Watch";
      if (p.includes("AIRPOD")) return "AirPods";
      return "Apple Other";
    }

    if (g === "DEVICES") {
      if (p.includes("PHONE") || p.includes("GALAXY S") || p.includes("GALAXY Z") || p.includes("GALAXY A") || p.includes("REDMI") || p.includes("NOTE") || p.includes("RENO") || p.includes("PURA") || p.includes("MATE")) {
        return `${t.brand} Phone`;
      }
      if (p.includes("TAB") || p.includes("PAD") || p.includes("MATEPAD")) {
        return `${t.brand} Tablet`;
      }
      if (p.includes("WATCH") || p.includes("BAND") || p.includes("FIT")) {
        return `${t.brand} Watch`;
      }
      return `${t.brand} Other`;
    }

    if (g === "ACCESSORIES") {
      if (p.includes("CASE") || p.includes("COVER")) return "Casing & Protection";
      if (p.includes("GLASS") || p.includes("TEMPERED")) return "Screen Protector";
      if (p.includes("ADAPTER") || p.includes("CHARGER") || p.includes("POWER")) return "Power & Adapter";
      if (p.includes("CABLE")) return "Cable & Connector";
      return "Audio & Other Acc";
    }

    if (g === "VAS" || b === "QOALA") {
      if (p.includes("QOALA") || p.includes("PROTEKSI")) return "Qoala Proteksi Gadget";
      if (b.includes("TELKOMSEL") || p.includes("TELKOMSEL")) return "Telkomsel Halo/Data";
      if (b.includes("XL") || p.includes("MYPRIO")) return "XL Prioritas";
      return "VAS / Other Service";
    }

    return "Lain-lain";
  };

  const calcGrowth = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  };

  const buildAppleSubCategoryData = (trxP1: RawTransaction[], trxP2: RawTransaction[]) => {
    const appleItemsP1 = (trxP1 || []).filter((t) => t.brand === "APPLE" && t.groupCategory === "DEVICES");
    const appleItemsP2 = (trxP2 || []).filter((t) => t.brand === "APPLE" && t.groupCategory === "DEVICES");

    const appleCategories = ["iPhone", "iPad", "MacBook", "Apple Watch", "AirPods"];

    return appleCategories.map((subCat) => {
      const matchP1 = appleItemsP1.filter((t) => getSubCategory(t) === subCat);
      const matchP2 = appleItemsP2.filter((t) => getSubCategory(t) === subCat);

      const totalQtyP1 = matchP1.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
      const totalAmtP1 = matchP1.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const totalQtyP2 = matchP2.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
      const totalAmtP2 = matchP2.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

      const staffSet = new Set([...matchP1.map((t) => t.salesName), ...matchP2.map((t) => t.salesName)]);
      const staffList = Array.from(staffSet).filter(Boolean).map((sName) => {
        const sTrx1 = matchP1.filter((t) => t.salesName === sName);
        const sTrx2 = matchP2.filter((t) => t.salesName === sName);

        const q1 = sTrx1.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
        const a1 = sTrx1.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const q2 = sTrx2.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
        const a2 = sTrx2.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        return {
          name: sName,
          p1Qty: q1,
          p1Amt: a1,
          p2Qty: q2,
          p2Amt: a2,
          growthAmt: calcGrowth(a2, a1),
        };
      }).sort((a, b) => b.p2Amt - a.p2Amt);

      return {
        subCat,
        totalQtyP1,
        totalAmtP1,
        totalQtyP2,
        totalAmtP2,
        growthAmt: calcGrowth(totalAmtP2, totalAmtP1),
        staffList,
      };
    });
  };

  const buildAndroidBrandHierarchy = (trxP1: RawTransaction[], trxP2: RawTransaction[], brandName: string) => {
    const filterFn = (t: RawTransaction) => {
      const bUpper = (t.brand || "").toUpperCase();
      if (brandName === "ANDROID LAINNYA") {
        return !["APPLE", "SAMSUNG", "HUAWEI", "OPPO"].includes(bUpper) && t.groupCategory === "DEVICES";
      }
      return bUpper.includes(brandName.toUpperCase()) && t.groupCategory === "DEVICES";
    };

    const brandP1 = (trxP1 || []).filter(filterFn);
    const brandP2 = (trxP2 || []).filter(filterFn);

    const totalQtyP1 = brandP1.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
    const totalAmtP1 = brandP1.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalQtyP2 = brandP2.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
    const totalAmtP2 = brandP2.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const staffNames = Array.from(new Set([...brandP1.map((t) => t.salesName), ...brandP2.map((t) => t.salesName)])).filter(Boolean);

    const staffBreakdown = staffNames.map((sName) => {
      const stP1 = brandP1.filter((t) => t.salesName === sName);
      const stP2 = brandP2.filter((t) => t.salesName === sName);

      const stQty1 = stP1.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
      const stAmt1 = stP1.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const stQty2 = stP2.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
      const stAmt2 = stP2.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

      const categories = ["Phone", "Tablet", "Watch", "Other"];
      const subItems = categories.map((cat) => {
        const catMatchP1 = stP1.filter((t) => {
          const sub = getSubCategory(t).toLowerCase();
          return cat === "Other" ? (!sub.includes("phone") && !sub.includes("tablet") && !sub.includes("watch")) : sub.includes(cat.toLowerCase());
        });
        const catMatchP2 = stP2.filter((t) => {
          const sub = getSubCategory(t).toLowerCase();
          return cat === "Other" ? (!sub.includes("phone") && !sub.includes("tablet") && !sub.includes("watch")) : sub.includes(cat.toLowerCase());
        });

        const q1 = catMatchP1.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
        const a1 = catMatchP1.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
        const q2 = catMatchP2.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
        const a2 = catMatchP2.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

        return {
          catLabel: `${brandName} ${cat}`,
          q1,
          a1,
          q2,
          a2,
          growthAmt: calcGrowth(a2, a1),
        };
      }).filter((c) => c.q1 > 0 || c.q2 > 0);

      return {
        name: sName,
        totalQty1: stQty1,
        totalAmt1: stAmt1,
        totalQty2: stQty2,
        totalAmt2: stAmt2,
        growthAmt: calcGrowth(stAmt2, stAmt1),
        subItems,
      };
    }).sort((a, b) => b.totalAmt2 - a.totalAmt2);

    return {
      brand: brandName,
      totalQtyP1,
      totalAmtP1,
      totalQtyP2,
      totalAmtP2,
      growthAmt: calcGrowth(totalAmtP2, totalAmtP1),
      staffBreakdown,
    };
  };

  const buildDroppedProductsAnalysis = (trxP1: RawTransaction[], trxP2: RawTransaction[]) => {
    const deficitMap: Record<string, { name: string; brand: string; p1Amt: number; p2Amt: number; p1Qty: number; p2Qty: number }> = {};

    [...(trxP1 || []), ...(trxP2 || [])].forEach((t) => {
      const pName = (t.productName || "Unknown").trim();
      const brand = t.brand || "OTHER";

      if (!deficitMap[pName]) {
        deficitMap[pName] = { name: pName, brand, p1Amt: 0, p2Amt: 0, p1Qty: 0, p2Qty: 0 };
      }
    });

    (trxP1 || []).forEach((t) => {
      const pName = (t.productName || "Unknown").trim();
      if (deficitMap[pName]) {
        deficitMap[pName].p1Amt += (Number(t.amount) || 0);
        deficitMap[pName].p1Qty += (Number(t.qty) || 1);
      }
    });

    (trxP2 || []).forEach((t) => {
      const pName = (t.productName || "Unknown").trim();
      if (deficitMap[pName]) {
        deficitMap[pName].p2Amt += (Number(t.amount) || 0);
        deficitMap[pName].p2Qty += (Number(t.qty) || 1);
      }
    });

    return Object.values(deficitMap)
      .map((p) => {
        const diff = p.p2Amt - p.p1Amt;
        const growth = calcGrowth(p.p2Amt, p.p1Amt);
        return { ...p, diff, growth };
      })
      .filter((p) => p.diff < 0)
      .sort((a, b) => a.diff - b.diff);
  };

  // Komparasi Month to Month
  const momAnalytics = useMemo(() => {
    const trxM1 = transactions.filter((t) => (t.monthKey || t.month || "").trim() === momCompareMonth);
    const trxM2 = transactions.filter((t) => (t.monthKey || t.month || "").trim() === momBaseMonth);

    const totalM1 = trxM1.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalM2 = trxM2.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const storeGrowth = calcGrowth(totalM2, totalM1);

    const staffNames = Array.from(new Set([...trxM1.map((t) => t.salesName), ...trxM2.map((t) => t.salesName)])).filter(Boolean);
    const staffSales = staffNames.map((name) => {
      const sM1 = trxM1.filter((t) => t.salesName === name).reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const sM2 = trxM2.filter((t) => t.salesName === name).reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      return {
        name,
        m1: sM1,
        m2: sM2,
        growth: calcGrowth(sM2, sM1),
      };
    }).sort((a, b) => b.m2 - a.m2);

    return {
      p1Label: momCompareMonth,
      p2Label: momBaseMonth,
      totalM1,
      totalM2,
      storeGrowth,
      staffSales,
      appleData: buildAppleSubCategoryData(trxM1, trxM2),
      samsungData: buildAndroidBrandHierarchy(trxM1, trxM2, "SAMSUNG"),
      huaweiData: buildAndroidBrandHierarchy(trxM1, trxM2, "HUAWEI"),
      oppoData: buildAndroidBrandHierarchy(trxM1, trxM2, "OPPO"),
      androidOtherData: buildAndroidBrandHierarchy(trxM1, trxM2, "ANDROID LAINNYA"),
      droppedProducts: buildDroppedProductsAnalysis(trxM1, trxM2),
    };
  }, [transactions, momBaseMonth, momCompareMonth]);

  // Komparasi Week to Week
  const weeklyComparisonData = useMemo(() => {
    const getTrxForWeek = (selectedVal: string) => {
      if (!selectedVal) return [];

      const wObj = AUTO_WEEKS.find((w) => w.key === selectedVal || w.label === selectedVal);
      const targetLabel = (wObj ? wObj.label : selectedVal).trim().toLowerCase();
      const targetKey = (wObj ? wObj.key : selectedVal).trim().toLowerCase();
      const weekNum = targetKey.replace(/\D/g, "");

      return transactions.filter((t) => {
        if (!t.weekLabel) return false;
        const wl = t.weekLabel.trim().toLowerCase();
        return (
          wl === targetLabel ||
          wl.includes(targetLabel) ||
          wl.includes(targetKey) ||
          (weekNum && (wl.includes(`week ${weekNum}`) || wl.includes(`w${weekNum}`)))
        );
      });
    };

    const trxW1 = getTrxForWeek(w1Filter);
    const trxW2 = getTrxForWeek(w2Filter);

    const totalW1 = trxW1.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const totalW2 = trxW2.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const storeGrowth = calcGrowth(totalW2, totalW1);

    const staffNames = Array.from(new Set([...trxW1.map((t) => t.salesName), ...trxW2.map((t) => t.salesName)])).filter(Boolean);
    const staffSales = staffNames.map((name) => {
      const sW1 = trxW1.filter((t) => t.salesName === name).reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      const sW2 = trxW2.filter((t) => t.salesName === name).reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      return {
        name,
        w1: sW1,
        w2: sW2,
        growth: calcGrowth(sW2, sW1),
      };
    }).sort((a, b) => b.w2 - a.w2);

    return {
      p1Label: w1Filter || "Minggu 1",
      p2Label: w2Filter || "Minggu 2",
      totalM1: totalW1,
      totalM2: totalW2,
      storeGrowth,
      staffSales,
      appleData: buildAppleSubCategoryData(trxW1, trxW2),
      samsungData: buildAndroidBrandHierarchy(trxW1, trxW2, "SAMSUNG"),
      huaweiData: buildAndroidBrandHierarchy(trxW1, trxW2, "HUAWEI"),
      oppoData: buildAndroidBrandHierarchy(trxW1, trxW2, "OPPO"),
      androidOtherData: buildAndroidBrandHierarchy(trxW1, trxW2, "ANDROID LAINNYA"),
      droppedProducts: buildDroppedProductsAnalysis(trxW1, trxW2),
    };
  }, [transactions, w1Filter, w2Filter, AUTO_WEEKS]);

  const staffList = useMemo(() => {
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
      weekSales: Record<string, number>;
      rawItems: RawTransaction[];
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
            "Xiaomi / Redmi Devices": { actual: 0, qty: 0, icon: "🟠" },
            "Oppo Devices": { actual: 0, qty: 0, icon: "🟢" },
            "Motorola Devices": { actual: 0, qty: 0, icon: "Ⓜ️" },
            "Huawei Devices": { actual: 0, qty: 0, icon: "🔴" },
            "Infinix Devices": { actual: 0, qty: 0, icon: "⚡" },
          },
          accMap: {},
          vasMap: {
            "Qoala Proteksi Gadget": { actual: 0, qty: 0, icon: "🛡️" },
            "Telkomsel Halo/Data": { actual: 0, qty: 0, icon: "🔴" },
            "XL Prioritas": { actual: 0, qty: 0, icon: "🔵" },
            "Indosat IM3": { actual: 0, qty: 0, icon: "🟡" },
          },
          weekSales: {},
          rawItems: [],
        };
      }

      map[id].total += t.amount;
      map[id].qty += t.qty;
      map[id].rawItems.push(t);
      if (t.invoice) map[id].invoices.add(t.invoice);

      const wLabel = t.weekLabel || "W_Other";
      map[id].weekSales[wLabel] = (map[id].weekSales[wLabel] || 0) + t.amount;

      const pUpper = t.productName.toUpperCase();
      const isCaseAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE") || pUpper.includes("BAND");

      if (t.brand === "APPLE" && !isCaseAcc && (t.groupCategory === "DEVICES" || pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("MAC") || pUpper.includes("WATCH") || pUpper.includes("AIRPOD"))) {
        if (pUpper.includes("IPHONE")) { map[id].appleMap["iPhone"].actual += t.amount; map[id].appleMap["iPhone"].qty += t.qty; }
        else if (pUpper.includes("IPAD")) { map[id].appleMap["iPad"].actual += t.amount; map[id].appleMap["iPad"].qty += t.qty; }
        else if (pUpper.includes("MAC") || pUpper.includes("BOOK")) { map[id].appleMap["MacBook"].actual += t.amount; map[id].appleMap["MacBook"].qty += t.qty; }
        else if (pUpper.includes("WATCH")) { map[id].appleMap["Apple Watch"].actual += t.amount; map[id].appleMap["Apple Watch"].qty += t.qty; }
        else if (pUpper.includes("AIRPOD")) { map[id].appleMap["AirPods"].actual += t.amount; map[id].appleMap["AirPods"].qty += t.qty; }
      }

      if (t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseAcc) {
        if (t.brand === "SAMSUNG" || pUpper.includes("GALAXY")) { map[id].androidMap["Samsung Devices"].actual += t.amount; map[id].androidMap["Samsung Devices"].qty += t.qty; }
        else if (t.brand === "XIAOMI" || pUpper.includes("REDMI")) { map[id].androidMap["Xiaomi / Redmi Devices"].actual += t.amount; map[id].androidMap["Xiaomi / Redmi Devices"].qty += t.qty; }
        else if (t.brand === "OPPO") { map[id].androidMap["Oppo Devices"].actual += t.amount; map[id].androidMap["Oppo Devices"].qty += t.qty; }
        else if (t.brand === "MOTOROLA") { map[id].androidMap["Motorola Devices"].actual += t.amount; map[id].androidMap["Motorola Devices"].qty += t.qty; }
        else if (t.brand === "HUAWEI") { map[id].androidMap["Huawei Devices"].actual += t.amount; map[id].androidMap["Huawei Devices"].qty += t.qty; }
        else if (t.brand === "INFINIX") { map[id].androidMap["Infinix Devices"].actual += t.amount; map[id].androidMap["Infinix Devices"].qty += t.qty; }
      }

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
      } else if (t.brand === "XL" || pUpper.includes("MYPRIO")) {
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
      const atv = invCount > 0 ? Math.round(s.total / invCount) : 0;

      const nameKey = s.name.trim().toLowerCase();
      const matchedTarget = 
        staffTargets[nameKey] ||
        staffTargets[nameKey.split(" ")[0]] ||
        staffTargets[s.salesId];

      const targetQuota = matchedTarget || Math.round((storeTotalTarget || 8728667173) / 6);
      const achv = calcAchv(s.total, targetQuota);
      const variance = s.total - targetQuota;

      const words = s.name.split(" ");
      const initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();

      const sortedAcc = Object.entries(s.accMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.actual - a.actual);

      const totalAccActual = sortedAcc.reduce((acc, c) => acc + c.actual, 0);
      const totalVasActual = Object.values(s.vasMap).reduce((acc, c) => acc + c.actual, 0);

      const appleAmount = Object.values(s.appleMap).reduce((acc, c) => acc + c.actual, 0);
      const androidAmount = Object.values(s.androidMap).reduce((acc, c) => acc + c.actual, 0);

      const targetAcc = 80000000;
      const targetVas = 60000000;

      let status: "Tercapai" | "Perlu Perhatian Khusus" | "Dalam Pantauan" = "Dalam Pantauan";
      let ringkasan = `Pencapaian ${achv}% terhadap target kuota.`;
      let rekomendasi = "Tingkatkan penawaran bundling aksesoris dan layanan proteksi pada setiap nota penjualan.";

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
        role: "Sales Specialist",
        initials,
        actual: s.total,
        target: targetQuota,
        achievement: achv,
        achvPct: achv,
        variance,
        estimate: Math.round(s.total * 1.25),
        invoicesCount: invCount,
        trxCount: invCount,
        atv,
        qty: s.qty,
        upt,
        points: Number((achv * 0.15).toFixed(1)),
        totalAmount: s.total,
        targetAmount: targetQuota,
        appleAmount,
        androidAmount,
        accAmount: totalAccActual,
        vasAmount: totalVasActual,
        totalAccActual,
        targetAcc,
        achvAcc: calcAchv(totalAccActual, targetAcc),
        totalVasActual,
        targetVas,
        achvVas: calcAchv(totalVasActual, targetVas),
        status,
        ringkasan,
        rekomendasi,
        appleSub: Object.entries(s.appleMap).map(([name, d]) => ({ name, ...d })),
        androidSub: Object.entries(s.androidMap).map(([name, d]) => ({ name, ...d })),
        accessoriesSub: sortedAcc,
        vasSub: Object.entries(s.vasMap).map(([name, d]) => ({ name, ...d })),
        weekSales: s.weekSales,
        rawItems: s.rawItems,
      };
    });
  }, [activeTransactions, staffTargets, storeTotalTarget]);

  const timeGoneStats = useMemo(() => {
    const targetDateStr = selectedDate || new Date().toISOString().split("T")[0];
    const [yearStr, monthStr, dayStr] = targetDateStr.split("-");
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10) - 1;
    const day = parseInt(dayStr, 10);

    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const elapsedDays = Math.min(Math.max(day, 1), totalDays);
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    const timeElapsedPct = Number(((elapsedDays / totalDays) * 100).toFixed(1));

    const monthName = new Date(year, monthIndex, 1)
      .toLocaleDateString("id-ID", { month: "long", year: "numeric" })
      .toUpperCase();

    return {
      monthName,
      elapsedDays,
      totalDays,
      remainingDays,
      timeElapsedPct,
    };
  }, [selectedDate]);

  const dailyTrendStats = useMemo(() => {
    const daysInMonth = timeGoneStats.totalDays || 31;
    const idealDaily = Math.round((storeTotalTarget || 8728667173) / daysInMonth);
    const arr = [];

    const datePrefix = selectedDate ? selectedDate.substring(0, 7) : "2026-10";

    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = String(i).padStart(2, "0");
      const fullIso = `${datePrefix}-${dStr}`;
      const dayTrx = transactions.filter((t) => t.isoDate === fullIso);
      const dayActual = dayTrx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      arr.push({
        dayLabel: `${dStr} ${timeGoneStats.monthName.split(" ")[0].slice(0, 3)}`,
        actual: dayActual,
        target: idealDaily,
        gap: dayActual - idealDaily,
      });
    }
    return arr;
  }, [transactions, storeTotalTarget, selectedDate, timeGoneStats]);

  const dailyTargetCalculated = useMemo(() => {
    const totalMonthTarget = storeTotalTarget || 8728667173;
    const totalDays = timeGoneStats.totalDays;
    const daysPassed = timeGoneStats.elapsedDays;
    const daysLeft = timeGoneStats.remainingDays;

    const actualAchievedSoFar = transactions.reduce((acc, t) => acc + t.amount, 0);
    const remainingTarget = Math.max(0, totalMonthTarget - actualAchievedSoFar);
    const requiredDailyRunRate = daysLeft > 0 ? Math.round(remainingTarget / daysLeft) : 0;

    const todayShiftKey = "sat";
    const staffOnDuty = scheduleData.filter((s) => s[todayShiftKey] !== "OFF" && s[todayShiftKey] !== "CUTI");
    const staffCount = staffOnDuty.length || 7;

    const targetStoreToday = requiredDailyRunRate;
    const targetPerStaffToday = Math.round(targetStoreToday / staffCount);

    const actualToday = overviewStats.todayActual;
    const achvToday = calcAchv(actualToday, targetStoreToday);

    return {
      totalMonthTarget,
      totalDays,
      daysPassed,
      daysLeft,
      actualAchievedSoFar,
      remainingTarget,
      requiredDailyRunRate,
      staffOnDuty,
      staffCount,
      targetStoreToday,
      targetPerStaffToday,
      actualToday,
      achvToday,
    };
  }, [transactions, scheduleData, overviewStats.todayActual, storeTotalTarget, timeGoneStats]);

  const bnplSummary = useMemo(() => {
    const totalAmount = bnplRecords.reduce((acc, b) => acc + b.amount, 0);
    const totalQty = bnplRecords.reduce((acc, b) => acc + b.qty, 0);
    const storeActual = overviewStats.actual;

    const map: Record<string, { amount: number; qty: number }> = {};
    bnplRecords.forEach((b) => {
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

    const filteredRecords = selectedBnplTender === "ALL"
      ? bnplRecords
      : bnplRecords.filter((b) => b.tender.toLowerCase() === selectedBnplTender.toLowerCase());

    return { totalAmount, totalQty, tenders, list: filteredRecords };
  }, [bnplRecords, overviewStats.actual, selectedBnplTender]);

  const scheduleDaySummary = useMemo(() => {
    const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
    return days.map((day) => {
      let morning = 0;
      let evening = 0;
      let off = 0;
      scheduleData.forEach((s) => {
        const val = s[day];
        if (val === "D047") morning++;
        else if (val === "D103") evening++;
        else if (val === "OFF") off++;
      });
      return { day, morning, evening, off, totalStaff: morning + evening };
    });
  }, [scheduleData]);

  const handleShareDaily = () => {
    const appleVal = overviewStats.lobs.find((l) => l.name.includes("Apple"))?.actual || 0;
    const androidVal = overviewStats.lobs.find((l) => l.name.includes("Android"))?.actual || 0;
    const accVal = overviewStats.lobs.find((l) => l.name.includes("Accessories"))?.actual || 0;
    const vasVal = overviewStats.lobs.find((l) => l.name.includes("VAS"))?.actual || 0;

    const text = 
`*DAILY RETAIL SALES REPORT - DIGIPLUS GRAND INDONESIA*
Tanggal: ${selectedDate} (Filter: ${periodType.toUpperCase()})

📊 *Pencapaian Store:*
- Sales: ${formatIDR(overviewStats.actual)}
- Target: ${formatIDR(overviewStats.target)}
- Achievement: ${overviewStats.achv}%
- Gap / Sisa: ${formatIDR(overviewStats.variance)}

📦 *Breakdown Kategori:*
- Apple Devices: ${formatIDR(appleVal)}
- Android Devices: ${formatIDR(androidVal)}
- Accessories: ${formatIDR(accVal)}
- VAS: ${formatIDR(vasVal)}

📈 *Metrik Operasional:*
- UPT: ${overviewStats.storeUPT}
- Invoice: ${overviewStats.invoiceCount} Struk
- Qty: ${overviewStats.qtyTotal} Unit

_Diperbarui otomatis via Store Performance Engine._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareTargetWA = () => {
    const staffListMsg = dailyTargetCalculated.staffOnDuty
      .map((s) => `• ${s.name} : ${formatIDR(dailyTargetCalculated.targetPerStaffToday)}`)
      .join("\n");

    const text = 
`Target ${selectedDate}

Nama Staff:
${staffListMsg}

Total Target: ${formatIDR(dailyTargetCalculated.targetStoreToday)}
━━━━━━━━━━━━━━━━━━
Sisa Target Bulan: ${formatIDR(dailyTargetCalculated.remainingTarget)}
Sisa Waktu: ${dailyTargetCalculated.daysLeft} Hari Tersisa

Semangat closing team! Fokus capai target hari ini! 🔥💪`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareScheduleWA = () => {
    const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const text = 
`*JADWAL SHIFT OPERASIONAL TOKO QF01 GRAND INDONESIA*
Periode: 1 Minggu (Senin s.d. Minggu)

👥 *Personil Standby per Hari:*
${scheduleDaySummary.map((d, i) => `• ${dayNames[i]}: ${d.totalStaff} Orang (Pagi D047: ${d.morning} | Siang D103: ${d.evening})`).join("\n")}

_Diperbarui via Digiplus Store Operations Engine._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePrintSchedule = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportToPptx = async () => {
    setIsExportingPptx(true);
    try {
      if (typeof window !== "undefined" && !(window as any).PptxGenJS) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const pptx = new (window as any).PptxGenJS();
      pptx.layout = "LAYOUT_16x9";

      const slide1 = pptx.addSlide();
      slide1.background = { color: "0A1128" };
      slide1.addText("STORE SALES PERFORMANCE & STAFF OPERATIONS REPORT", { x: 0.8, y: 1.8, fontSize: 24, bold: true, color: "38BDF8" });
      slide1.addText("Evaluasi Mingguan (WoW), Kategori Produk, & Suara Lapangan\nKode Toko: QF01 | Periode: " + timeGoneStats.monthName + " | Cut-off: " + selectedDate, { x: 0.8, y: 3.2, fontSize: 14, color: "F8FAFC" });

      pptx.writeFile({ fileName: `Laporan_Operasional_QF01_${selectedDate}.pptx` });
    } catch (err) {
      alert("Gagal mengekspor slide PowerPoint: " + err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  const openCustomBottomSheet = (title: string, content: React.ReactNode) => {
    setSheetTitle(title);
    setSheetContent(content);
    setBottomSheetOpen(true);
  };

  const openLobDetailSheet = (lobName: string, items: RawTransaction[]) => {
    openCustomBottomSheet(`Rincian Produk: ${lobName} (${items.length} Item)`, (
      <div className="space-y-4 text-xs font-semibold">
        <div className="flex justify-between items-center p-3.5 rounded-2xl bg-black/10 dark:bg-black/25 border border-inherit shadow-inner">
          <span className="font-bold text-slate-800 dark:text-slate-300">Total Nilai Kategori:</span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-black text-sm sm:text-base">
            {formatIDR(items.reduce((acc, c) => acc + c.amount, 0))}
          </strong>
        </div>
      </div>
    ));
  };

  const isDark = theme === "dark";
  const bgMain = isDark 
    ? "bg-[#0A1128] bg-gradient-to-br from-[#070D1E] via-[#0A1128] to-[#0F1B3D]" 
    : "bg-[#F3F4F6] bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0]";

  const cardBg = isDark 
    ? "bg-[#0B1528] border-slate-700/60 shadow-xl shadow-black/40" 
    : "bg-white border-slate-200 shadow-lg shadow-slate-200/50";

  const innerBg = isDark 
    ? "bg-[#111F38] border-slate-700/50" 
    : "bg-slate-50 border-slate-200";

  const textMain = isDark ? "text-slate-50" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const accentText = isDark ? "text-sky-400" : "text-sky-600";
  const activeTabBtn = isDark 
    ? "bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-sm" 
    : "bg-sky-50 text-sky-700 border border-sky-300 shadow-sm";
  const glassSidebar = isDark 
    ? "bg-[#070D1E]/90 border-slate-800" 
    : "bg-white/90 border-slate-200";

  const mainNavItems = [
    { id: "store-overview", label: "Overview Store", icon: "📊", color: "bg-emerald-500", shadow: "shadow-emerald-500/30" },
    { id: "weekly-sales", label: "Weekly Sales (WoW)", icon: "📈", color: "bg-blue-600", shadow: "shadow-blue-600/30" },
    { id: "qoala-ar", label: "Qoala Protection (AR %)", icon: "🛡️", color: "bg-rose-500", shadow: "shadow-rose-500/30" },
    { id: "mom-comparison", label: "MoM Growth Analysis", icon: "⚖️", color: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
    { id: "staff-performance", label: "Staff Performance", icon: "🏆", color: "bg-amber-500", shadow: "shadow-amber-500/30" },
    { id: "daily-target", label: "Daily Target & Run Rate", icon: "🎯", color: "bg-orange-500", shadow: "shadow-orange-500/30" },
    { id: "schedule", label: "Jadwal Shift 1 Minggu", icon: "📅", color: "bg-sky-500", shadow: "shadow-sky-500/30" },
    { id: "feedback", label: "Feedback Tim", icon: "💬", color: "bg-teal-500", shadow: "shadow-teal-500/30" },
    { id: "bnpl", label: "BNPL Transactions", icon: "💳", color: "bg-purple-500", shadow: "shadow-purple-500/30" },
    { id: "product-search", label: "Cari Produk Terjual", icon: "🔍", color: "bg-pink-500", shadow: "shadow-pink-500/30" },
    { id: "sales-detail", label: "Rincian Transaksi Log", icon: "📋", color: "bg-slate-600", shadow: "shadow-slate-600/30" },
  ];

  const renderComparisonSection = (data: typeof momAnalytics, isWeekly = false) => {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
              <span>⚖️</span>
              <span>{isWeekly ? "PERBANDINGAN WEEK TO WEEK (WoW) SALES" : "ANALISIS PERTUMBUHAN MONTH TO MONTH (MoM)"}</span>
            </h2>
            <p className={`text-xs ${textMuted} mt-0.5`}>
              Analisis komparasi omset per staf, kuantitas produk, sub-kategori LOB, serta akar penyebab penurunan
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isWeekly ? (
              <>
                <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">Baseline (W1):</span>
                  <select
                    value={w1Filter}
                    onChange={(e) => setW1Filter(e.target.value)}
                    className="bg-transparent font-black text-xs text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {AUTO_WEEKS.map((w) => (
                      <option key={`w1-${w.key}`} value={w.label} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>
                        {w.label} ({w.range})
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs font-black text-slate-500">VS</span>

                <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">Pembanding (W2):</span>
                  <select
                    value={w2Filter}
                    onChange={(e) => setW2Filter(e.target.value)}
                    className="bg-transparent font-black text-xs text-sky-700 dark:text-sky-400 focus:outline-none cursor-pointer"
                  >
                    {AUTO_WEEKS.map((w) => (
                      <option key={`w2-${w.key}`} value={w.label} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>
                        {w.label} ({w.range})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">Bulan 1 (Lalu):</span>
                  <select
                    value={momCompareMonth}
                    onChange={(e) => setMomCompareMonth(e.target.value)}
                    className="bg-transparent font-black text-xs text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {availableMonths.map((m) => (
                      <option key={`cmp-${m}`} value={m} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <span className="text-xs font-black text-slate-500">VS</span>

                <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">Bulan 2 (Sekarang):</span>
                  <select
                    value={momBaseMonth}
                    onChange={(e) => setMomBaseMonth(e.target.value)}
                    className="bg-transparent font-black text-xs text-sky-700 dark:text-sky-400 focus:outline-none cursor-pointer"
                  >
                    {availableMonths.map((m) => (
                      <option key={`base-${m}`} value={m} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 1. TOTAL SALES BERDASARKAN FILTER */}
        <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-6`}>
          <div className="flex flex-wrap justify-between items-center pb-4 border-b border-inherit gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-500">TOTAL SALES TOKO</span>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-mono text-slate-950 dark:text-white">
                  {formatIDR(data.totalM2)}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 ${
                  data.storeGrowth >= 0 
                    ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-400/30" 
                    : "bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-400/30"
                }`}>
                  <span>{data.storeGrowth >= 0 ? "▲ +" : "▼ "}</span>
                  <span>{data.storeGrowth}%</span>
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 mt-0.5 block">
                {data.p1Label}: {formatIDR(data.totalM1)} ➔ {data.p2Label}: {formatIDR(data.totalM2)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3 flex items-center gap-2">
              <span>👥</span>
              <span>TOTAL SALES PER STAF ({data.p1Label} VS {data.p2Label}):</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {data.staffSales.map((st, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${innerBg} flex justify-between items-center shadow-sm`}>
                  <div>
                    <span className="text-xs font-black text-slate-950 dark:text-white block">{st.name}</span>
                    <div className="text-[11px] font-semibold text-slate-500 mt-1 space-y-0.5">
                      <div><strong className="text-slate-700 dark:text-slate-300">{data.p1Label}:</strong> {formatIDR(st.m1)}</div>
                      <div><strong className="text-slate-900 dark:text-white font-bold">{data.p2Label}:</strong> {formatIDR(st.m2)}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black border ${
                    st.growth >= 0 
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-400/30" 
                      : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-400/30"
                  }`}>
                    {st.growth >= 0 ? `▲ +${st.growth}%` : `▼ ${st.growth}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. PER LOB: APPLE DEVICES */}
        <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
          <div className="flex flex-wrap justify-between items-center pb-3 border-b border-inherit gap-3">
            <h3 className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400 flex items-center gap-2">
              <span>🍎</span>
              <span>PER LOB — APPLE DEVICES (MENAMPILKAN QTY DAN AMOUNT)</span>
            </h3>
            <span className="text-xs font-bold text-slate-500">
              iPhone, iPad, MacBook, Apple Watch, AirPods
            </span>
          </div>

          <div className="space-y-4">
            {data.appleData.map((sub, sIdx) => (
              <div key={sIdx} className={`p-4 rounded-2xl border ${innerBg} space-y-3`}>
                <div className="flex flex-wrap justify-between items-center gap-2 pb-2 border-b border-inherit/40">
                  <span className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span>
                    <span>{sub.subCat}</span>
                  </span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-slate-500 font-bold">
                      {data.p1Label}: {sub.totalQtyP1} Unit ({formatIDR(sub.totalAmtP1)}) ➔ {data.p2Label}: {sub.totalQtyP2} Unit ({formatIDR(sub.totalAmtP2)})
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[11px] font-black ${
                      sub.growthAmt >= 0 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                    }`}>
                      {sub.growthAmt >= 0 ? `▲ +${sub.growthAmt}%` : `▼ ${sub.growthAmt}%`}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs min-w-[500px]">
                    <thead className="text-[10px] uppercase font-black text-slate-500 border-b border-inherit">
                      <tr>
                        <th className="py-1 px-3">Nama Staff</th>
                        <th className="py-1 px-3 text-center">{data.p1Label} (Qty / Amount)</th>
                        <th className="py-1 px-3 text-center">{data.p2Label} (Qty / Amount)</th>
                        <th className="py-1 px-3 text-right">Growth (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-inherit font-bold">
                      {sub.staffList.length > 0 ? (
                        sub.staffList.map((st, idx) => (
                          <tr key={idx} className="hover:opacity-90">
                            <td className="py-2 px-3 text-slate-900 dark:text-slate-100 font-black">{st.name}</td>
                            <td className="py-2 px-3 text-center font-mono text-slate-600 dark:text-slate-400">
                              {st.p1Qty} Unit / {formatIDR(st.p1Amt)}
                            </td>
                            <td className="py-2 px-3 text-center font-mono text-slate-950 dark:text-white font-black">
                              {st.p2Qty} Unit / {formatIDR(st.p2Amt)}
                            </td>
                            <td className="py-2 px-3 text-right font-black">
                              <span className={st.growthAmt >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                {st.growthAmt >= 0 ? `▲ +${st.growthAmt}%` : `▼ ${st.growthAmt}%`}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-2 px-3 text-center text-slate-500 italic">Tidak ada transaksi tercatat pada periode ini.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. PER LOB: ANDROID DEVICES */}
        {[
          { title: "SAMSUNG DEVICES", data: data.samsungData, color: "text-blue-600 dark:text-blue-400", icon: "📱" },
          { title: "HUAWEI DEVICES", data: data.huaweiData, color: "text-rose-600 dark:text-rose-400", icon: "🔴" },
          { title: "OPPO DEVICES", data: data.oppoData, color: "text-emerald-600 dark:text-emerald-400", icon: "🟢" },
          { title: "ANDROID LAINNYA (Xiaomi, Motorola, Infinix, dll)", data: data.androidOtherData, color: "text-indigo-600 dark:text-indigo-400", icon: "🤖" },
        ].map((brandObj, bIdx) => (
          <div key={bIdx} className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
            <div className="flex flex-wrap justify-between items-center pb-3 border-b border-inherit gap-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">{brandObj.icon}</span>
                <h3 className={`text-sm sm:text-base font-black ${brandObj.color}`}>
                  —— {brandObj.title} (MENAMPILKAN QTY DAN AMOUNT) ——
                </h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  brandObj.data.growthAmt >= 0 
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-400/30" 
                    : "bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-400/30"
                }`}>
                  {brandObj.data.growthAmt >= 0 ? `▲ +${brandObj.data.growthAmt}%` : `▼ ${brandObj.data.growthAmt}%`}
                </span>
              </div>
              <div className="text-right text-xs font-bold text-slate-500">
                <span>{data.p1Label}: {brandObj.data.totalQtyP1} Unit ({formatIDR(brandObj.data.totalAmtP1)})</span>
                <span className="mx-2">➔</span>
                <span className="text-slate-950 dark:text-white font-black">{data.p2Label}: {brandObj.data.totalQtyP2} Unit ({formatIDR(brandObj.data.totalAmtP2)})</span>
              </div>
            </div>

            <div className="space-y-4">
              {brandObj.data.staffBreakdown.length > 0 ? (
                brandObj.data.staffBreakdown.map((st, stIdx) => (
                  <div key={stIdx} className={`p-4 rounded-2xl border ${innerBg} space-y-3`}>
                    <div className="flex justify-between items-center pb-2 border-b border-inherit/40">
                      <div>
                        <span className="text-xs font-black text-slate-950 dark:text-white block">{st.name}</span>
                        <span className="text-[11px] font-bold text-slate-500">
                          Total: {data.p1Label} ({st.totalQty1} Qty / {formatIDR(st.totalAmt1)}) ➔ {data.p2Label} ({st.totalQty2} Qty / {formatIDR(st.totalAmt2)})
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                        st.growthAmt >= 0 ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                      }`}>
                        {st.growthAmt >= 0 ? `▲ +${st.growthAmt}%` : `▼ ${st.growthAmt}%`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                      {st.subItems.map((catItem, cIdx) => (
                        <div key={cIdx} className={`p-2.5 rounded-xl border ${cardBg} text-xs space-y-1`}>
                          <div className="flex justify-between items-center">
                            <span className="font-black text-slate-900 dark:text-slate-200">{catItem.catLabel}</span>
                            <span className={`text-[10px] font-black ${catItem.growthAmt >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                              {catItem.growthAmt >= 0 ? `+${catItem.growthAmt}%` : `${catItem.growthAmt}%`}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-500">
                            <div>{data.p1Label}: <strong className="text-slate-700 dark:text-slate-300">{catItem.q1} Qty / {formatIDR(catItem.a1)}</strong></div>
                            <div>{data.p2Label}: <strong className="text-slate-950 dark:text-white font-bold">{catItem.q2} Qty / {formatIDR(catItem.a2)}</strong></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-500 italic">
                  Tidak ada transaksi {brandObj.title} pada rentang periode yang dibandingkan.
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 4. ANALISIS PENYEBAB PENURUNAN */}
        <div className={`${cardBg} rounded-3xl border-2 border-rose-500/30 overflow-hidden shadow-xl`}>
          <div className="px-5 py-4 border-b border-rose-500/20 flex justify-between items-center bg-rose-500/5">
            <div>
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <span>🔍</span>
                <span>ANALISIS PENYEBAB PENURUNAN (ROOT CAUSE BY PRODUCT DEFICIT)</span>
              </h3>
              <p className={`text-xs ${textMuted} mt-0.5 font-semibold`}>
                Daftar produk dengan defisit omset terbesar yang memicu penurunan penjualan di {data.p2Label} dibanding {data.p1Label}
              </p>
            </div>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-black bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              {data.droppedProducts.length} Produk Teridentifikasi
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className={`${innerBg} uppercase text-[10px] tracking-wider border-b border-inherit font-black text-slate-900 dark:text-slate-300`}>
                <tr>
                  <th className="px-4 py-3 font-black">Nama Produk</th>
                  <th className="px-4 py-3 font-black">Brand</th>
                  <th className="px-4 py-3 text-center font-black">{data.p1Label} (Unit)</th>
                  <th className="px-4 py-3 text-right font-black">{data.p1Label} (Omset)</th>
                  <th className="px-4 py-3 text-center font-black">{data.p2Label} (Unit)</th>
                  <th className="px-4 py-3 text-right font-black">{data.p2Label} (Omset)</th>
                  <th className="px-4 py-3 text-right font-black text-rose-600">Nilai Defisit (Gap)</th>
                  <th className="px-4 py-3 text-right font-black">Penurunan (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit font-bold">
                {data.droppedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-6 text-slate-500 font-black">
                      Tidak ada produk yang mengalami penurunan omset pada periode ini. Seluruh produk bertumbuh positif! 🎉
                    </td>
                  </tr>
                ) : (
                  data.droppedProducts.slice(0, 25).map((p, i) => (
                    <tr key={i} className="hover:opacity-90 transition">
                      <td className="px-4 py-3 font-black text-slate-950 dark:text-white max-w-xs">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-200">
                          {p.brand}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300 font-mono">{p.p1Qty}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{formatIDR(p.p1Amt)}</td>
                      <td className="px-4 py-3 text-center font-black text-amber-700 dark:text-amber-400 font-mono">{p.p2Qty}</td>
                      <td className="px-4 py-3 text-right font-mono font-black text-amber-700 dark:text-amber-400">{formatIDR(p.p2Amt)}</td>
                      <td className="px-4 py-3 text-right font-black text-rose-600 font-mono">
                        {formatIDR(p.diff)}
                      </td>
                      <td className="px-4 py-3 text-right font-black text-rose-600 font-mono">
                        {p.growth}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Form Login jika belum terautentikasi
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4 ${textMain} font-sans overflow-x-hidden w-full max-w-full`}>
        <div className={`max-w-md w-full ${cardBg} border-2 rounded-3xl p-6 md:p-8 shadow-2xl`}>
          <div className="text-center mb-6 flex flex-col items-center justify-center">
            <img 
              src="/apple-touch-icon.png" 
              alt="Logo Digiplus" 
              className="w-16 h-16 object-contain rounded-2xl bg-white p-1 shadow-md mb-2"
            />
            <h2 className="font-black text-3xl tracking-wider mb-1 text-slate-950 dark:text-white">
              QF01
            </h2>
            <h1 className="text-xl font-black text-slate-950 dark:text-white">DIGIPLUS GRAND INDONESIA</h1>
            <p className={`text-xs ${accentText} mt-1 uppercase tracking-widest`}>PORTAL DASHBOARD SALES</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4 font-bold">
            <div>
              <label className="text-xs font-black uppercase tracking-wider block text-slate-900 dark:text-slate-100">Sales ID / NIK Karyawan</label>
              <input
                type="text"
                required
                placeholder="Contoh: 24004971 atau 22008089"
                value={salesIdInput}
                onChange={(e) => setSalesIdInput(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3 rounded-xl ${innerBg} border text-sm font-semibold focus:outline-none text-slate-950 dark:text-white`}
              />
            </div>

            <div>
              <label className="text-xs font-black uppercase tracking-wider block text-slate-900 dark:text-slate-100">Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full mt-1.5 px-4 py-3 rounded-xl ${innerBg} border text-sm font-semibold focus:outline-none text-slate-950 dark:text-white`}
              />
            </div>

            {loginErr && (
              <p className="text-xs text-rose-600 font-black">{loginErr}</p>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 ${isDark ? "bg-sky-500 text-white" : "bg-blue-600 text-white"} font-black rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg`}
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${bgMain} ${isDark ? "text-slate-100" : "text-slate-900"} font-sans antialiased overflow-x-hidden w-full max-w-full relative`}>
      {/* 1. SIDEBAR DESKTOP */}
      <aside
        className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 h-screen sticky top-0 shrink-0 border-r backdrop-blur-2xl z-30 transition-all ${glassSidebar}`}
      >
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 pb-5 border-b border-inherit">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-black text-base flex items-center justify-center shadow-lg shadow-sky-500/20">
              QF01
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wider leading-none text-slate-950 dark:text-white">DIGIPLUS</h1>
              <p className="text-[11px] text-sky-600 dark:text-sky-400 font-black mt-1">GRAND INDONESIA</p>
            </div>
          </div>

          <div className={`mt-4 p-3 rounded-2xl border ${innerBg} flex items-center justify-between shadow-sm`}>
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-600 dark:text-slate-400 block font-bold uppercase tracking-wider truncate">Masuk sebagai</span>
              <span className="text-xs font-black block truncate text-slate-950 dark:text-white">{currentSalesName}</span>
              <span className="text-[10px] font-mono font-bold text-sky-600 dark:text-sky-400">ID: {currentSalesId}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 shrink-0 ml-2"></span>
          </div>

          <nav className="mt-5 space-y-1.5 overflow-y-auto flex-1 pr-1 custom-scrollbar">
            {mainNavItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as MenuTab)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                    active
                      ? isDark
                        ? "bg-sky-500/15 border border-sky-400/30 text-white font-black shadow-sm"
                        : "bg-sky-50 border border-sky-200 text-sky-950 font-black shadow-sm"
                      : "font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg ${item.color} ${item.shadow} shadow-md flex items-center justify-center text-xs shrink-0 text-white`}>
                    {item.icon}
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2">
              <button
                onClick={handleExportToPptx}
                disabled={isExportingPptx}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 border border-sky-500/40 text-sky-700 dark:text-sky-400 font-black text-xs shadow-md transition active:scale-95"
              >
                <span>📽️</span>
                <span className="truncate font-black">{isExportingPptx ? "Membuat Slide..." : "Export ke Slide PPTX"}</span>
              </button>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500 shadow-md shadow-cyan-500/30 flex items-center justify-center text-xs shrink-0 text-white">
                📤
              </div>
              <span>Upload Bukti RAW</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-inherit space-y-2 shrink-0">
            <button
              onClick={toggleTheme}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-black flex items-center justify-center gap-2 transition ${
                isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-200/80 border-slate-300 hover:bg-slate-300/80 text-slate-950"
              }`}
            >
              <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 text-xs font-black flex items-center justify-center gap-2 transition"
            >
              <span>🚪 Keluar</span>
            </button>
          </div>
        </div>
      </aside>
{/* Floating Action Button (FAB) Menu - Pojok Kanan Bawah */}
      <button
        type="button"
        onClick={() => setMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white shadow-xl shadow-sky-500/40 border border-sky-400/30 flex flex-col items-center justify-center gap-0.5 transition-all duration-200"
        aria-label="Buka Menu Navigasi"
      >
        <span className="text-xl leading-none">☰</span>
        <span className="text-[10px] font-black uppercase tracking-wider leading-none">Menu</span>
      </button>
          </div>

          <nav className="mt-4 space-y-1.5 overflow-y-auto max-h-[60vh] pr-1 custom-scrollbar">
            {mainNavItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as MenuTab);
                    setMobileDrawerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all active:scale-[0.98] ${
                    active
                      ? isDark
                        ? "bg-sky-500/15 border border-sky-400/30 text-white font-black shadow-sm"
                        : "bg-sky-50 border border-sky-200 text-sky-950 font-black shadow-sm"
                      : "font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg ${item.color} ${item.shadow} shadow-md flex items-center justify-center text-xs shrink-0 text-white`}>
                    {item.icon}
                  </div>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => { setUploadModalOpen(true); setMobileDrawerOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500 shadow-md shadow-cyan-500/30 flex items-center justify-center text-xs shrink-0 text-white">
                📤
              </div>
              <span>Upload Bukti RAW</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-inherit space-y-2">
          <button
            onClick={toggleTheme}
            className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
              isDark ? "bg-white/5 border-white/10" : "bg-slate-200/80 border-slate-300 text-slate-950"
            }`}
          >
            <span>{isDark ? "☀️ Mode Terang" : "🌙 Mode Gelap"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 text-xs font-black flex items-center justify-center gap-2"
          >
            <span>🚪 Keluar</span>
          </button>
        </div>
      </div>

      {/* 3. KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`lg:hidden flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl sticky top-0 z-20 print:hidden ${glassSidebar}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 dark:text-sky-400 border border-sky-400/20 text-xs font-black flex items-center gap-1.5 active:scale-95 transition"
              aria-label="Buka Menu"
            >
              <span>☰</span>
              <span>Menu</span>
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-700/40">
              <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center font-black text-xs text-white shadow-sm">
                QF01
              </div>
              <div>
                <h2 className="text-xs font-black leading-none text-slate-900 dark:text-white">DIGIPLUS GI</h2>
                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold block mt-0.5">
                  {currentSalesName || "Store Leader Admin"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 active:scale-95 transition text-xs flex items-center gap-1 font-bold"
              title="Sync Live Data"
            >
              <span>🔄</span>
            </button>
          </div>
        </header>
        
        <main className="p-3 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto flex-1 overflow-x-hidden pb-6">
          <header className="mb-6 border-b border-inherit pb-5 print:hidden">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <div>
                <div className={`text-xl sm:text-2xl font-black ${accentText} flex items-center gap-2`}>
                  <span>Halo, {currentSalesName} 👋</span>
                </div>
                <p className={`text-xs ${textMuted} mt-1 font-semibold`}>
                  Live Feed: <code>DATABASE</code> (gid: 602901290) & <code>BNPL DATABASE</code> (gid: 2697970)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleShareDaily}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <span>📲</span>
                  <span>Share Daily</span>
                </button>

                <button
                  onClick={fetchLiveGoogleSheets}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black transition flex items-center gap-1.5 ${innerBg} text-slate-950 dark:text-white`}
                >
                  <span>🔄</span>
                  <span>{isLoading ? "Mengambil Data..." : "Sync Live"}</span>
                </button>

                <span className={`px-3 py-1.5 rounded-lg border text-xs font-black ${
                  isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"
                }`}>
                  Actual: {formatIDR(overviewStats.actual)}
                </span>
              </div>
            </div>

            <div className={`p-3 ${cardBg} border rounded-2xl flex flex-wrap items-center gap-3 justify-between text-xs font-bold`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-black/10 dark:bg-black/20 p-1 rounded-xl">
                  {(["daily", "weekly", "monthly"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPeriodType(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-black capitalize transition ${
                        periodType === mode ? activeTabBtn : "text-slate-800 dark:text-slate-200 hover:opacity-100"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                {periodType === "monthly" && (
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-slate-200">📅 Bulan:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className={`${innerBg} border rounded-xl px-2.5 py-1 font-black focus:outline-none text-slate-950 dark:text-white`}
                    >
                      <option value="ALL">Semua Bulan</option>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}

                {periodType === "weekly" && (
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-slate-200">📊 Week:</span>
                    <select
                      value={selectedWeek}
                      onChange={(e) => setSelectedWeek(e.target.value)}
                      className={`${innerBg} border rounded-xl px-2.5 py-1 font-black focus:outline-none text-slate-950 dark:text-white`}
                    >
                      <option value="ALL">Semua Minggu</option>
                      {AUTO_WEEKS.map((w) => (
                        <option key={w.key} value={w.label}>{w.label} ({w.range})</option>
                      ))}
                    </select>
                  </div>
                )}

                {periodType === "daily" && (
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-slate-200">🗓️ Tanggal:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`${innerBg} border rounded-xl px-2.5 py-1 font-black focus:outline-none text-slate-950 dark:text-white`}
                    />
                  </div>
                )}
              </div>

              <div className={`text-[11px] ${accentText} font-black flex items-center gap-1.5`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Terfilter: {activeTransactions.length} Baris ({periodType.toUpperCase()} - {periodType === "daily" ? selectedDate : periodType === "weekly" ? selectedWeek : selectedMonth})</span>
              </div>
            </div>
          </header>

          {isLoading ? (
            <div className="py-20 text-center text-sm font-black opacity-70 animate-pulse text-slate-950 dark:text-white">
              ⏳ Mengambil dan mengkalkulasi data langsung dari Google Sheets...
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW STORE */}
              {activeTab === "store-overview" && (
                <div className="space-y-6 sm:space-y-8">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl relative overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${innerBg} border flex items-center justify-center text-2xl font-black ${accentText}`}>
                          ⏳
                        </div>
                        <div>
                          <h2 className="text-base font-black tracking-wide text-slate-950 dark:text-white">
                            TIME GONE ANALYTICS ({timeGoneStats.monthName})
                          </h2>
                          <p className={`text-xs ${textMuted}`}>
                            Hari Berjalan: <strong className={textMain}>{timeGoneStats.elapsedDays} hari</strong> dari {timeGoneStats.totalDays} hari ({timeGoneStats.remainingDays} hari tersisa)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-black text-slate-600 dark:text-slate-400 block">Time Elapsed</span>
                          <span className={`text-2xl font-black ${accentText}`}>{timeGoneStats.timeElapsedPct}%</span>
                        </div>
                        <div className="h-8 w-px bg-inherit mx-1 opacity-25"></div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-black text-slate-600 dark:text-slate-400 block">Achv Pace</span>
                          <span className="text-2xl font-black text-emerald-700 dark:text-emerald-500">{overviewStats.achv}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className={textMuted}>Waktu Berjalan (Time Gone):</span>
                          <span className={`font-black ${accentText}`}>{timeGoneStats.timeElapsedPct}%</span>
                        </div>
                        <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                          <div className="bg-sky-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(timeGoneStats.timeElapsedPct, 100)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className={textMuted}>Pencapaian Omset Terfilter:</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-500">{overviewStats.achv}% ({formatIDR(overviewStats.actual)})</span>
                        </div>
                        <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(overviewStats.achv, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-inherit text-xs">
                      <div className={`p-3 ${innerBg} rounded-xl border`}>
                        <span className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">Kesenjangan Pace:</span>
                        <div className="text-sm font-black text-rose-600 mt-0.5">-{(timeGoneStats.timeElapsedPct - overviewStats.achv).toFixed(1)}%</div>
                      </div>
                      <div className={`p-3 ${innerBg} rounded-xl border`}>
                        <span className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">Daily Run Rate Aktual:</span>
                        <div className="text-sm font-black text-sky-700 dark:text-sky-400 mt-0.5">{formatIDR(Math.round(overviewStats.actual / Math.max(timeGoneStats.elapsedDays, 1)))} / hari</div>
                      </div>
                      <div className={`p-3 ${innerBg} rounded-xl border`}>
                        <span className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">Target Periode:</span>
                        <div className={`text-sm font-black ${accentText} mt-0.5`}>{formatIDR(overviewStats.target)}</div>
                      </div>
                      <div className={`p-3 ${innerBg} rounded-xl border`}>
                        <span className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">Penjualan Hari Ini:</span>
                        <div className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{formatIDR(overviewStats.todayActual)}</div>
                      </div>
                    </div>
                  </div>

                  <div className={`p-5 rounded-3xl border ${cardBg} space-y-3 overflow-hidden`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">Trend Daily Sales vs Target Ideal Harian</h3>
                        <p className={`text-xs ${textMuted} mt-0.5`}>Perbandingan omset harian terhadap target flat {formatIDR(Math.round((storeTotalTarget || 8728667173) / timeGoneStats.totalDays))}/hari</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs min-w-[550px]">
                        <thead className={`${innerBg} uppercase text-[10px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="py-3 px-3 font-black">Tanggal</th>
                            <th className="py-3 px-3 text-right font-black">Actual Omset</th>
                            <th className="py-3 px-3 text-right font-black">Target Ideal</th>
                            <th className="py-3 px-3 text-right font-black">Gap Harian</th>
                            <th className="py-3 px-3 text-center font-black">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-bold">
                          {dailyTrendStats.map((d, i) => (
                            <tr key={i} className="hover:opacity-90">
                              <td className="py-3 px-3 font-black text-slate-950 dark:text-white">{d.dayLabel}</td>
                              <td className="py-3 px-3 text-right font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatIDR(d.actual)}</td>
                              <td className="py-3 px-3 text-right text-slate-800 dark:text-slate-300 font-mono">{formatIDR(d.target)}</td>
                              <td className={`py-3 px-3 text-right font-mono font-black ${d.gap >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                                {formatIDR(d.gap)}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-black ${d.actual >= d.target ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400" : "bg-rose-500/20 text-rose-800 dark:text-rose-400"}`}>
                                  {d.actual >= d.target ? "Tercapai" : "Under"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WEEKLY SALES (WEEK TO WEEK) */}
              {activeTab === "weekly-sales" && renderComparisonSection(weeklyComparisonData, true)}

              {/* TAB KHUSUS: QOALA PROTECTION */}
              {activeTab === "qoala-ar" && (
                <div className="space-y-6 sm:space-y-8">
                  <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>🛡️</span>
                          <span>QOALA PROTECTION & ATTACHMENT RATE (AR %)</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-0.5`}>
                          Periode: {periodType.toUpperCase()} ({periodType === "daily" ? selectedDate : periodType === "weekly" ? selectedWeek : selectedMonth})
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                          qoalaAnalytics.storeAR >= 25 
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-400/30" 
                            : qoalaAnalytics.storeAR >= 15 
                            ? "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-400/30" 
                            : "bg-rose-500/15 text-rose-800 dark:text-rose-400 border-rose-400/30"
                        }`}>
                          Benchmark Toko: {qoalaAnalytics.storeAR >= 25 ? "Target Tercapai 🔥" : qoalaAnalytics.storeAR >= 15 ? "Perlu Ditingkatkan ⚠️" : "Under Target ❗"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Store Attachment Rate</span>
                        <div className={`text-2xl sm:text-3xl font-black mt-1 font-mono ${
                          qoalaAnalytics.storeAR >= 25 ? "text-emerald-700 dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
                        }`}>
                          {qoalaAnalytics.storeAR}%
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 mt-1 block">Rasio Polis vs Device</span>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Total Polis Qoala Terjual</span>
                        <div className="text-2xl sm:text-3xl font-black mt-1 text-sky-700 dark:text-sky-400 font-mono">
                          {qoalaAnalytics.totalQoalaQty} Unit
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 mt-1 block">Polis Perlindungan Aktif</span>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Total Perangkat Terjual (Device)</span>
                        <div className="text-2xl sm:text-3xl font-black mt-1 text-slate-950 dark:text-white font-mono">
                          {qoalaAnalytics.totalDeviceQty} Unit
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 mt-1 block">Smartphone, Tablet & Laptop</span>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Total Omset Premi Qoala</span>
                        <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-700 dark:text-emerald-400 font-mono">
                          {formatIDR(qoalaAnalytics.totalQoalaAmount)}
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 mt-1 block">Kontribusi Penjualan Proteksi</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* TAB 3: STAFF PERFORMANCE LEADERBOARD */}
              {activeTab === "staff-performance" && (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2 text-slate-950 dark:text-white">
                        <span>🏆</span>
                        <span>STAFF PERFORMANCE LEADERBOARD ({staffList.length} STAF)</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-0.5`}>
                        Evaluasi pencapaian target, UPT, ATV, rincian kategori produk, dan poin reward staf.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staffList.map((st) => (
                      <div
                        key={st.name}
                        className={`p-5 rounded-3xl border transition-all duration-200 hover:shadow-xl ${
                          isDark
                            ? "bg-gradient-to-b from-[#0F1E36] to-[#0A1324] border-slate-700/70 shadow-2xl shadow-black/50"
                            : "bg-white border-slate-200 shadow-md shadow-slate-200/80 hover:border-sky-300"
                        }`}
                      >
                        <div className={`flex items-center justify-between pb-3.5 border-b ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-sm ${
                              isDark 
                                ? "bg-gradient-to-br from-sky-500 to-indigo-600 shadow-sky-500/25" 
                                : "bg-gradient-to-br from-sky-600 to-blue-700 shadow-sky-600/20"
                            }`}>
                              {st.initials}
                            </div>
                            <div>
                              <h4 className={`text-sm font-black tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                {st.name}
                              </h4>
                              <span className={`text-[11px] font-bold block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                                {st.role || "Senior Sales Specialist"}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`px-3 py-1 rounded-full text-[11px] font-black border shadow-sm ${
                              st.achvPct >= 100
                                ? isDark 
                                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40" 
                                  : "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : st.achvPct >= 70
                                ? isDark 
                                  ? "bg-amber-500/20 text-amber-300 border-amber-400/40" 
                                  : "bg-amber-50 text-amber-700 border-amber-300"
                                : isDark 
                                  ? "bg-rose-500/20 text-rose-300 border-rose-400/40" 
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {st.achvPct >= 100 ? "Productive 🔥" : st.achvPct >= 70 ? "On Track ⚡" : "Need Focus ⚠️"}
                          </span>
                        </div>

                        <div className="py-4 flex justify-between items-end">
                          <div>
                            <span className={`text-[10px] font-black uppercase tracking-wider block ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              Total Penjualan
                            </span>
                            <div className={`text-xl sm:text-2xl font-black font-mono mt-0.5 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                              {formatIDR(st.totalAmount)}
                            </div>
                            <span className={`text-[10px] font-semibold block mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                              Target: <span className={`font-mono font-bold ${isDark ? "text-slate-300" : "text-slate-700"}`}>{formatIDR(st.targetAmount)}</span>
                            </span>
                          </div>

                          <div className="text-right">
                            <span
                              className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                                st.achvPct >= 100 
                                  ? isDark ? "text-emerald-400" : "text-emerald-600"
                                  : st.achvPct >= 70 
                                  ? isDark ? "text-amber-400" : "text-amber-600"
                                  : isDark ? "text-rose-400" : "text-rose-600"
                              }`}
                            >
                              {st.achvPct.toFixed(1)}%
                            </span>
                          </div>
                        </div>

                        <div className={`w-full h-2 rounded-full overflow-hidden mb-4 border ${isDark ? "bg-slate-800 border-slate-700/50" : "bg-slate-100 border-slate-200"}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              st.achvPct >= 100
                                ? "bg-emerald-500"
                                : st.achvPct >= 70
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(st.achvPct, 100)}%` }}
                          />
                        </div>

                        <div className={`grid grid-cols-3 gap-2 py-2.5 px-2 rounded-2xl border ${
                          isDark ? "bg-black/25 border-slate-700/60" : "bg-slate-50/80 border-slate-200/80"
                        }`}>
                          <div className="text-center">
                            <span className={`text-[9px] font-black uppercase block tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>UPT</span>
                            <strong className={`text-xs sm:text-sm font-black font-mono block mt-0.5 ${isDark ? "text-sky-400" : "text-sky-700"}`}>
                              {st.upt || "0.0"}
                            </strong>
                          </div>
                          <div className={`text-center border-x ${isDark ? "border-slate-700/60" : "border-slate-200"}`}>
                            <span className={`text-[9px] font-black uppercase block tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>ATV</span>
                            <strong className={`text-xs sm:text-sm font-black font-mono block mt-0.5 ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                              {formatCompactIDR(st.atv)}
                            </strong>
                          </div>
                          <div className="text-center">
                            <span className={`text-[9px] font-black uppercase block tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}>TRX</span>
                            <strong className={`text-xs sm:text-sm font-black font-mono block mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                              {st.trxCount || 0}
                            </strong>
                          </div>
                        </div>

                        <div className="pt-3.5 space-y-1.5 text-xs font-semibold">
                          <div className="flex justify-between items-center py-0.5">
                            <span className={`flex items-center gap-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-600 font-bold"}`}>
                              <span className="w-2 h-2 rounded-full bg-sky-500"></span> Apple:
                            </span>
                            <span className={`font-mono font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                              {formatIDR(st.appleAmount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className={`flex items-center gap-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-600 font-bold"}`}>
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Android:
                            </span>
                            <span className={`font-mono font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                              {formatIDR(st.androidAmount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className={`flex items-center gap-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-600 font-bold"}`}>
                              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Aksesoris:
                            </span>
                            <span className={`font-mono font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                              {formatIDR(st.accAmount || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-0.5">
                            <span className={`flex items-center gap-1.5 text-[11px] ${isDark ? "text-slate-400" : "text-slate-600 font-bold"}`}>
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span> VAS / Warranty:
                            </span>
                            <span className={`font-mono font-bold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                              {formatIDR(st.vasAmount || 0)}
                            </span>
                          </div>
                        </div>

                        <div className={`mt-4 pt-3 border-t flex justify-between items-center text-xs ${isDark ? "border-slate-700/60" : "border-slate-100"}`}>
                          <span className={`font-black flex items-center gap-1 text-[11px] ${isDark ? "text-amber-400" : "text-amber-700"}`}>
                            <span>⭐</span> Poin Reward
                          </span>
                          <span className={`font-mono font-black text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>
                            {(st.points || 0).toFixed(1)} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: DAILY TARGET */}
              {activeTab === "daily-target" && (
                <div className="space-y-6">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5 overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>🎯</span>
                          <span>TARGET HARIAN VS PENCAPAIAN BERJALAN</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-0.5`}>
                          Tanggal: {selectedDate} • Hari ke-{dailyTargetCalculated.daysPassed} ({dailyTargetCalculated.daysLeft} Hari Tersisa)
                        </p>
                      </div>

                      <button
                        onClick={handleShareTargetWA}
                        className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <span>📲</span>
                        <span>Share Target</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[11px] font-black ${textMuted} uppercase block tracking-wider`}>
                          TARGET TOKO HARI INI
                        </span>
                        <div className={`text-xl sm:text-2xl font-black mt-1 font-mono ${textMain}`}>
                          {formatIDR(dailyTargetCalculated.targetStoreToday)}
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[11px] font-black ${textMuted} uppercase block tracking-wider`}>
                          PENCAPAIAN HARI INI
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                          {formatIDR(dailyTargetCalculated.actualToday)}
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[11px] font-black ${textMuted} uppercase block tracking-wider`}>
                          TARGET PER STAF HARI INI
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400 mt-1 font-mono">
                          {formatIDR(dailyTargetCalculated.targetPerStaffToday)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SCHEDULE */}
              {activeTab === "schedule" && (
                <div className="space-y-6">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4 overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>📅</span>
                          <span>JADWAL OPERASIONAL KERJA 1 MINGGU (SENIN - MINGGU)</span>
                        </h2>
                      </div>

                      <div className="flex items-center gap-2 print:hidden">
                        <button
                          onClick={handlePrintSchedule}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-black transition flex items-center gap-1.5 ${innerBg} text-slate-950 dark:text-white`}
                        >
                          <span>🖨️</span>
                          <span>Print</span>
                        </button>

                        <button
                          onClick={handleShareScheduleWA}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5"
                        >
                          <span>📲</span>
                          <span>Share WA</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
                      {scheduleDaySummary.map((d, i) => {
                        const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
                        return (
                          <div key={d.day} className={`p-3 rounded-2xl border ${innerBg}`}>
                            <span className={`text-xs font-black block ${accentText}`}>{dayNames[i]}</span>
                            <span className="text-base sm:text-lg font-black block mt-0.5 text-slate-950 dark:text-white">{d.totalStaff} Orang</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: MoM GROWTH ANALYSIS */}
              {activeTab === "mom-comparison" && renderComparisonSection(momAnalytics, false)}
            </>
          )}
        </main>
      </div>

      {/* BOTTOM SHEET MODAL DRILLDOWN */}
      {bottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in overflow-hidden p-0 sm:p-4">
          <div className={`w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl ${cardBg} border-2 border-inherit shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300`}>
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-inherit bg-black/10 dark:bg-black/20">
              <h3 className={`text-sm sm:text-base font-black ${textMain} flex items-center gap-2 truncate`}>
                <span>📋</span>
                <span className="truncate">{sheetTitle}</span>
              </h3>

              <button
                onClick={() => setBottomSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700/40 hover:bg-slate-400 dark:hover:bg-slate-700/60 flex items-center justify-center text-sm font-black text-slate-900 dark:text-slate-300 shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs font-semibold">
              {sheetContent}
            </div>
          </div>
        </div>
      )}

      {/* Modal Upload RAW SalesPerson */}
      <UploadRawSalesModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        selectedInvoice=""
        defaultSalesName="Store Leader Admin"
      />
    </div>
  );
}
