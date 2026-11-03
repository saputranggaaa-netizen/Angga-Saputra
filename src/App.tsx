"use client";

import React, { useState, useEffect, useMemo } from "react";
export const UploadRawSalesModal = ({ isOpen, onClose }: any) => {
  return null;
};


            
type MenuTab = 
  | "store-overview"
  | "weekly-sales"
  | "staff-performance"
  | "daily-target"
  | "brand-focus"
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
  supplier?: string;
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
interface StaffDailyTargetDetail {
  total: number;
  apple: number;
  android: number;
  accessories: number;
  vas: number;
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
interface RawTransaction {
  // ... field lainnya ...
  supplier?: string;
}

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

  // Real-time Clock (WIB)
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: "Asia/Jakarta",
      }).format(now);
      setCurrentTime(`${timeStr.replace(/\./g, ":")} WIB`);
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [salesIdInput, setSalesIdInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginErr, setLoginErr] = useState<string>("");
  const [currentSalesId, setCurrentSalesId] = useState<string>("");
  const [currentSalesName, setCurrentSalesName] = useState<string>("");

  // Live Spreadsheet Data & Targets
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
  // State target harian per staf dari gid 789142551
  const [staffDailyTargets, setStaffDailyTargets] = useState<Record<string, StaffDailyTargetDetail>>({});
  const [selectedDailyStaff, setSelectedDailyStaff] = useState<string>("");

  // Period Filters
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>("Oktober2026");
  const [momBaseMonth, setMomBaseMonth] = useState<string>("Oktober2026");
  const [momCompareMonth, setMomCompareMonth] = useState<string>("September2026");
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [w1Filter, setW1Filter] = useState<string>("");
  const [w2Filter, setW2Filter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("2026-11-01");

  // State untuk memilih staf di menu Target Vs Achievement Per Staff
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  
  // Modal State
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(DEFAULT_FEEDBACKS);
  

  // Export State
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
    try {]
      const dbUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:json&gid=602901290';
    const bnplUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:json&gid=2697970';
    const targetUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:json&gid=685849318';
    const dailyTargetSheetUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:json&gid=789142551';

    const [resDb, resBnpl, resTarget, resDailyTarget] = await Promise.all([
      fetch(dbUrl),
      fetch(bnplUrl),
      fetch(targetUrl),
      fetch(dailyTargetSheetUrl)
    ]);

    const textDb = await resDb.text();
    const textBnpl = await resBnpl.text();
    const textTarget = await resTarget.text();
    const textDailyTarget = await resDailyTarget.text();
     

      const jsonDb = JSON.parse(textDb.substring(textDb.indexOf("{"), textDb.lastIndexOf("}") + 1));
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
        const supplier = String(c[15]?.v || c[15]?.f || "").trim().toUpperCase();

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

      const jsonBnpl = JSON.parse(textBnpl.substring(textBnpl.indexOf("{"), textBnpl.lastIndexOf("}") + 1));
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

      const jsonTarget = JSON.parse(textTarget.substring(textTarget.indexOf("{"), textTarget.lastIndexOf("}") + 1));
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
      // Parsing Sheet Daily Target (gid: 789142551)
      const jsonDailyTarget = JSON.parse(
        textDailyTarget.substring(textDailyTarget.indexOf("{"), textDailyTarget.lastIndexOf("}") + 1)
      );

      const parsedStaffDailyTargets: Record<string, StaffDailyTargetDetail> = {};

      (jsonDailyTarget.table.rows || []).forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        // Kolom A (indeks 0) = Nama Staff, Kolom B (indeks 1) = Kategori, Kolom H (indeks 7) = Catch-up Target
        const rawStaffName = String(c[0]?.v || c[0]?.f || "").trim().toLowerCase();
        const rawCategory = String(c[1]?.v || c[1]?.f || "").trim().toUpperCase();
        const rawTargetVal = c[7]?.v;
        const targetVal = typeof rawTargetVal === "number" 
          ? rawTargetVal 
          : Number(String(rawTargetVal || 0).replace(/[^0-9]/g, ""));
        // Abaikan header, baris total, grand total, month, summary, atau target toko
if (
  !rawStaffName ||
  rawStaffName.includes("staff") ||
  rawStaffName.includes("nama") ||
  rawStaffName.includes("total") ||
  rawStaffName.includes("grand") ||
  rawStaffName.includes("month") ||
  rawStaffName.includes("target") ||
  rawStaffName.includes("all") ||
  rawStaffName.length <= 2 ||
  isNaN(targetVal)
) {
  return;
}

        

        if (!parsedStaffDailyTargets[rawStaffName]) {
          parsedStaffDailyTargets[rawStaffName] = { total: 0, apple: 0, android: 0, accessories: 0, vas: 0 };
        }

        if (rawCategory.includes("APPLE")) {
          parsedStaffDailyTargets[rawStaffName].apple += targetVal;
        } else if (rawCategory.includes("ANDROID")) {
          parsedStaffDailyTargets[rawStaffName].android += targetVal;
        } else if (rawCategory.includes("ACCESSORIES") || rawCategory.includes("AKSESORIS")) {
          parsedStaffDailyTargets[rawStaffName].accessories += targetVal;
        } else if (rawCategory.includes("VAS") || rawCategory.includes("QOALA")) {
          parsedStaffDailyTargets[rawStaffName].vas += targetVal;
        }

        parsedStaffDailyTargets[rawStaffName].total += targetVal;
      });

      setStaffDailyTargets(parsedStaffDailyTargets);

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

    (transactions || []).forEach((t) => {
      let wLabel = t.weekLabel ? String(t.weekLabel).trim() : "";

      if (!wLabel && t.isoDate) {
        const parts = t.isoDate.split("-");
        const day = parseInt(parts[2], 10);
        if (!isNaN(day)) {
          const wNum = Math.min(Math.ceil(day / 7), 5);
          wLabel = `W${wNum}`;
        }
      }

      if (!wLabel) return;

      if (!map.has(wLabel)) {
        map.set(wLabel, { label: wLabel, minDate: t.isoDate || "", maxDate: t.isoDate || "", count: 0 });
      }

      const item = map.get(wLabel)!;
      item.count++;
      if (t.isoDate && (!item.minDate || t.isoDate < item.minDate)) item.minDate = t.isoDate;
      if (t.isoDate && (!item.maxDate || t.isoDate > item.maxDate)) item.maxDate = t.isoDate;
    });

    let sorted = Array.from(map.values()).sort((a, b) => (a.minDate || "").localeCompare(b.minDate || ""));

    if (sorted.length === 0) {
      sorted = [
        { label: "W1", minDate: "2026-10-01", maxDate: "2026-10-07", count: 1 },
        { label: "W2", minDate: "2026-10-08", maxDate: "2026-10-14", count: 1 },
        { label: "W3", minDate: "2026-10-15", maxDate: "2026-10-21", count: 1 },
        { label: "W4", minDate: "2026-10-22", maxDate: "2026-10-28", count: 1 },
        { label: "W5", minDate: "2026-10-29", maxDate: "2026-10-31", count: 1 },
      ];
    }

    return sorted.map((w, idx) => {
      const key = `W${idx + 1}`;
      const formatNice = (iso: string) => {
        if (!iso) return "";
        const p = iso.split("-");
        return p.length === 3 ? `${p[2]}/${p[1]}` : iso;
      };
      const range = (w.minDate && w.maxDate) ? `${formatNice(w.minDate)} s.d. ${formatNice(w.maxDate)}` : "Periode Berjalan";
      return { key, label: w.label, range, days: 7 };
    });
  }, [transactions]);

  useEffect(() => {
    if (AUTO_WEEKS.length > 0) {
      if (!w1Filter || !AUTO_WEEKS.some((w) => w.label === w1Filter)) {
        const defaultW1 = AUTO_WEEKS.length >= 2 ? AUTO_WEEKS[AUTO_WEEKS.length - 2].label : AUTO_WEEKS[0].label;
        setW1Filter(defaultW1);
      }
      if (!w2Filter || !AUTO_WEEKS.some((w) => w.label === w2Filter)) {
        const defaultW2 = AUTO_WEEKS[AUTO_WEEKS.length - 1].label;
        setW2Filter(defaultW2);
      }
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
        const rawWl = (t.weekLabel || "").trim().toLowerCase();
        const rawSelected = selectedWeek.trim().toLowerCase();

        if (rawWl === rawSelected || rawSelected.includes(rawWl) || rawWl.includes(rawSelected)) {
          return true;
        }

        const selMatch = rawSelected.match(/(?:week|w)\s*(\d+)/i) || rawSelected.match(/\d+/);
        const selNum = selMatch ? selMatch[1] : "";

        if (selNum) {
          const rowMatch = rawWl.match(/(?:week|w)\s*(\d+)/i) || rawWl.match(/\d+/);
          const rowNum = rowMatch ? rowMatch[1] : "";
          if (rowNum && rowNum === selNum) {
            return true;
          }
        }

        return false;
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

  const targetStoreLOB = overviewStats.target;
  const targetAppleLOB = overviewStats.lobs.find((l) => l.name.includes("Apple"))?.target || Math.round(targetStoreLOB * 0.794);
  const targetAndroidLOB = overviewStats.lobs.find((l) => l.name.includes("Android"))?.target || Math.round(targetStoreLOB * 0.108);
  const targetAccessoriesLOB = overviewStats.lobs.find((l) => l.name.includes("Accessories"))?.target || Math.round(targetStoreLOB * 0.05);
  const targetVasLOB = overviewStats.lobs.find((l) => l.name.includes("VAS"))?.target || Math.round(targetStoreLOB * 0.045);

  const calcEst = (val: number) => Math.round(val * 1.25);

  const qoalaAnalytics = useMemo(() => {
    const activeTx = activeTransactions || [];
    const deviceItems = activeTx.filter((t) => t.groupCategory === "DEVICES");
    const qoalaItems = activeTx.filter((t) => {
      const pUpper = (t.productName || "").toUpperCase();
      return t.brand === "QOALA" || pUpper.includes("QOALA") || pUpper.includes("PROTEKSI");
    });

    const totalDeviceQty = deviceItems.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
    const totalQoalaQty = qoalaItems.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
    const totalQoalaAmount = qoalaItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
    const storeAR = totalDeviceQty > 0 ? Number(((totalQoalaQty / totalDeviceQty) * 100).toFixed(1)) : 0;

    return { totalDeviceQty, totalQoalaQty, totalQoalaAmount, storeAR };
  }, [activeTransactions]);

  // Perhitungan Leaderboard Staf dengan format UPT desimal pasti
  const staffList = useMemo(() => {
    const map: Record<string, {
      salesId: string;
      name: string;
      total: number;
      qty: number;
      invoices: Set<string>;
      appleAmount: number;
      androidAmount: number;
      accAmount: number;
      vasAmount: number;
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
          appleAmount: 0,
          androidAmount: 0,
          accAmount: 0,
          vasAmount: 0,
        };
      }

      map[id].total += t.amount;
      map[id].qty += t.qty;
      if (t.invoice) map[id].invoices.add(t.invoice);

      const pUpper = (t.productName || "").toUpperCase();
      const isCaseAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE");

      if (t.brand === "APPLE" && !isCaseAcc && (t.groupCategory === "DEVICES" || pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("MAC") || pUpper.includes("WATCH") || pUpper.includes("AIRPOD"))) {
        map[id].appleAmount += t.amount;
      } else if (t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseAcc) {
        map[id].androidAmount += t.amount;
      } else if (t.groupCategory === "ACCESSORIES") {
        map[id].accAmount += t.amount;
      } else if (t.groupCategory === "VAS" || t.brand === "QOALA" || pUpper.includes("QOALA") || pUpper.includes("PROTEKSI") || pUpper.includes("TELKOMSEL") || pUpper.includes("MYPRIO")) {
        map[id].vasAmount += t.amount;
      }
    });

    const sorted = Object.values(map).sort((a, b) => b.total - a.total);

    return sorted.map((s, idx) => {
      const invCount = s.invoices.size;
      const rawUpt = calcUpt(s.qty, invCount);
      const upt = typeof rawUpt === "number" && !isNaN(rawUpt) ? rawUpt.toFixed(1) : "0.0";
      const atv = invCount > 0 ? Math.round(s.total / invCount) : 0;

      const nameKey = s.name.trim().toLowerCase();
      const matchedTarget = 
        staffTargets[nameKey] ||
        staffTargets[nameKey.split(" ")[0]] ||
        staffTargets[s.salesId];

      const targetQuota = matchedTarget || Math.round((storeTotalTarget || 8728667173) / Math.max(sorted.length, 1));
      const achv = calcAchv(s.total, targetQuota);
      const words = s.name.split(" ");
      const initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();

      return {
        rank: idx + 1,
        salesId: s.salesId,
        name: s.name,
        role: "Sales Specialist",
        initials,
        totalAmount: s.total,
        targetAmount: targetQuota,
        achvPct: achv,
        trxCount: invCount,
        atv,
        qty: s.qty,
        upt,
        points: Number((achv * 0.15).toFixed(1)),
        appleAmount: s.appleAmount,
        androidAmount: s.androidAmount,
        accAmount: s.accAmount,
        vasAmount: s.vasAmount,
      };
    });
  }, [activeTransactions, staffTargets, storeTotalTarget]);
  // Otomatis pilih staf pertama saat daftar staf sudah dihitung
  useEffect(() => {
    if (!selectedStaffId && staffList && staffList.length > 0) {
      setSelectedStaffId(staffList[0].salesId);
    }
  }, [staffList, selectedStaffId]);

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
      const staffSubList = Array.from(staffSet).filter(Boolean).map((sName) => {
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
        staffList: staffSubList,
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

  // Komparasi MoM
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

  // Komparasi WoW
  const weeklyComparisonData = useMemo(() => {
    const getTrxForWeek = (selectedVal: string) => {
      if (!selectedVal) return [];

      const cleanSelected = selectedVal.trim().toLowerCase();
      const weekMatch = cleanSelected.match(/(?:week|w)\s*(\d+)/i) || cleanSelected.match(/\d+/);
      const targetNum = weekMatch ? weekMatch[1] : "";

      return transactions.filter((t) => {
        if (!t.weekLabel) return false;
        const wl = t.weekLabel.trim().toLowerCase();

        if (wl === cleanSelected || cleanSelected.includes(wl) || wl.includes(cleanSelected)) {
          return true;
        }

        if (targetNum) {
          const rowWeekMatch = wl.match(/(?:week|w)\s*(\d+)/i) || wl.match(/\d+/);
          const rowNum = rowWeekMatch ? rowWeekMatch[1] : "";
          if (rowNum && rowNum === targetNum) {
            return true;
          }
        }

        return false;
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
      trxW2,
    };
  }, [transactions, w1Filter, w2Filter, AUTO_WEEKS]);

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
    // 1. Ambil daftar nama staf aktif toko (QF01)
    const activeStaffNames = (staffList || [])
      .map((s) => s.name.trim().toLowerCase())
      .filter((name) => !name.includes("admin") && !name.includes("leader"));

    // 2. Hitung target harian KHUSUS untuk staf aktif toko
    let totalStaffDailyCatchup = 0;
    activeStaffNames.forEach((name) => {
      // Cocokkan nama staf
      const targetDetail = staffDailyTargets[name] || staffDailyTargets[name.split(" ")[0]];
      if (targetDetail && targetDetail.total > 0) {
        totalStaffDailyCatchup += Number(targetDetail.total) || 0;
      }
    });

    // Fallback: Jika staffList kosong, gunakan total dari staffDailyTargets yang wajar (< Rp 500 jt)
    if (totalStaffDailyCatchup === 0) {
      totalStaffDailyCatchup = Object.values(staffDailyTargets || {}).reduce(
        (acc, curr) => acc + (Number(curr.total) || 0),
        0
      );
    }

    // 3. Transaksi aktual toko hari ini
    const todayTrx = transactions.filter((t) => t.isoDate === selectedDate);
    const actualToday = todayTrx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    // 4. Hitung hari dalam bulan berjalan
    const now = new Date(selectedDate || Date.now());
    const year = now.getFullYear();
    const month = now.getMonth();
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const daysPassed = now.getDate();
    const daysLeft = Math.max(1, totalDaysInMonth - daysPassed);

    const targetStoreToday = totalStaffDailyCatchup;
    const activeStaffCount = activeStaffNames.length || 1;
    const targetPerStaffToday = Math.round(targetStoreToday / activeStaffCount);

    return {
      totalMonthTarget: storeTotalTarget,
      totalDays: totalDaysInMonth,
      daysPassed,
      daysLeft,
      actualAchievedSoFar: 0,
      remainingTarget: 0,
      requiredDailyRunRate: targetStoreToday,
      staffOnDuty: [],
      staffCount: activeStaffCount,
      targetStoreToday,
      targetPerStaffToday,
      actualToday,
      achvToday: targetStoreToday > 0 ? Math.round((actualToday / targetStoreToday) * 100) : 0,
    };
  }, [staffDailyTargets, staffList, transactions, selectedDate, storeTotalTarget]);
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

  const bnplSummary = useMemo(() => {
    const totalAmount = bnplRecords.reduce((acc, b) => acc + b.amount, 0);
    const totalQty = bnplRecords.reduce((acc, b) => acc + b.qty, 0);

    const map: Record<string, { amount: number; qty: number }> = {};
    bnplRecords.forEach((b) => {
      const tKey = b.tender || "Other";
      if (!map[tKey]) map[tKey] = { amount: 0, qty: 0 };
      map[tKey].amount += b.amount;
      map[tKey].qty += b.qty;
    });

    const tenders = Object.entries(map).map(([tender, d]) => {
      const share = overviewStats.actual > 0 ? Number(((d.amount / overviewStats.actual) * 100).toFixed(1)) : 0;
      return { tender, amount: d.amount, qty: d.qty, share };
    }).sort((a, b) => b.amount - a.amount);

    return { totalAmount, totalQty, tenders, list: bnplRecords };
  }, [bnplRecords, overviewStats.actual]);

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
  const handleShareDailyTargetStaffWA = (staffName: string, targetData: StaffDailyTargetDetail, todayTrx: RawTransaction[]) => {
    const calcSub = (filterFn: (t: RawTransaction) => boolean) => {
      const filtered = todayTrx.filter(filterFn);
      const qty = filtered.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
      const amt = filtered.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      return `${qty} / ${formatIDR(amt)}`;
    };

    // Sub Apple
    const iphoneStr = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPHONE"));
    const ipadStr = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPAD"));
    const macbookStr = calcSub((t) => t.brand === "APPLE" && ((t.productName || "").toUpperCase().includes("MAC") || (t.productName || "").toUpperCase().includes("BOOK")));
    const watchStr = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("WATCH"));

    // Sub Android
    const samsungStr = calcSub((t) => t.brand === "SAMSUNG" && t.groupCategory === "DEVICES");
    const oppoStr = calcSub((t) => t.brand === "OPPO" && t.groupCategory === "DEVICES");
    const huaweiStr = calcSub((t) => t.brand === "HUAWEI" && t.groupCategory === "DEVICES");
    const xiaomiStr = calcSub((t) => (t.brand === "XIAOMI" || t.brand === "REDMI") && t.groupCategory === "DEVICES");
    const motorolaStr = calcSub((t) => t.brand === "MOTOROLA" && t.groupCategory === "DEVICES");
    const infinixStr = calcSub((t) => t.brand === "INFINIX" && t.groupCategory === "DEVICES");

    // Accessories & VAS
    const accStr = calcSub((t) => t.groupCategory === "ACCESSORIES");
    const qoalaStr = calcSub((t) => t.groupCategory === "VAS" && (t.brand === "QOALA" || (t.productName || "").toUpperCase().includes("QOALA") || (t.productName || "").toUpperCase().includes("PROTEKSI")));
    const tselStr = calcSub((t) => t.groupCategory === "VAS" && (t.brand.includes("TELKOMSEL") || (t.productName || "").toUpperCase().includes("TELKOMSEL")));
    const xlStr = calcSub((t) => t.groupCategory === "VAS" && (t.brand.includes("XL") || (t.productName || "").toUpperCase().includes("MYPRIO")));
    const isatStr = calcSub((t) => t.groupCategory === "VAS" && (t.brand.includes("INDOSAT") || (t.productName || "").toUpperCase().includes("INDOSAT")));

    const totalAchvAmount = todayTrx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

    const message = 
`Target & Achievement
Tanggal : ${selectedDate}

- ${staffName} -

Total Target : ${formatIDR(targetData.total)}
Apple Devices : ${formatIDR(targetData.apple)}
Android Device : ${formatIDR(targetData.android)}
Accessories : ${formatIDR(targetData.accessories)}
VAS : ${formatIDR(targetData.vas)}

Total Achievement : ${formatIDR(totalAchvAmount)}
1. Apple Devices :
- iPhone : ${iphoneStr}
- iPad : ${ipadStr}
- MacBook : ${macbookStr}
- Apple Watch : ${watchStr}

1. Android Device :
- Samsung : ${samsungStr}
- Oppo : ${oppoStr}
- Huawei : ${huaweiStr}
- Xiaomi : ${xiaomiStr}
- Motorola : ${motorolaStr}
- Infinix : ${infinixStr}

1. Accessories : ${accStr}

2. VAS :
- Qoala : ${qoalaStr}
- Telkomsel : ${tselStr}
- Xl : ${xlStr}
- Indosat : ${isatStr}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
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

  const handleShareStaffWA = (staff: any, staffTrx: RawTransaction[]) => {
    if (!staff) return;
    const currentTrx = staffTrx || [];

    const calcSub = (filterFn: (t: RawTransaction) => boolean) => {
      const filtered = currentTrx.filter(filterFn);
      const qty = filtered.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
      const amt = filtered.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
      return `${qty} Unit / ${formatIDR(amt)}`;
    };

    // Sub-item Apple
    const iphoneText = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPHONE"));
    const ipadText = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPAD"));
    const macbookText = calcSub((t) => t.brand === "APPLE" && ((t.productName || "").toUpperCase().includes("MAC") || (t.productName || "").toUpperCase().includes("BOOK")));
    const watchText = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("WATCH"));

    // Sub-item Android
    const samsungText = calcSub((t) => t.brand === "SAMSUNG" && t.groupCategory === "DEVICES");
    const oppoText = calcSub((t) => t.brand === "OPPO" && t.groupCategory === "DEVICES");
    const huaweiText = calcSub((t) => t.brand === "HUAWEI" && t.groupCategory === "DEVICES");
    const xiaomiText = calcSub((t) => (t.brand === "XIAOMI" || t.brand === "REDMI") && t.groupCategory === "DEVICES");
    const motoText = calcSub((t) => t.brand === "MOTOROLA" && t.groupCategory === "DEVICES");
    const infinixText = calcSub((t) => t.brand === "INFINIX" && t.groupCategory === "DEVICES");

    // Accessories
    const accText = calcSub((t) => t.groupCategory === "ACCESSORIES");

    // VAS
    const qoalaText = calcSub((t) => t.groupCategory === "VAS" && (t.brand === "QOALA" || (t.productName || "").toUpperCase().includes("QOALA") || (t.productName || "").toUpperCase().includes("PROTEKSI")));
    const tselText = calcSub((t) => t.groupCategory === "VAS" && (t.brand.includes("TELKOMSEL") || (t.productName || "").toUpperCase().includes("TELKOMSEL")));
    const xlText = calcSub((t) => t.groupCategory === "VAS" && (t.brand.includes("XL") || (t.productName || "").toUpperCase().includes("MYPRIO")));
    const isatText = calcSub((t) => t.groupCategory === "VAS" && (t.brand.includes("INDOSAT") || (t.productName || "").toUpperCase().includes("INDOSAT")));

    const varianceVal = (staff.totalAmount || 0) - (staff.targetAmount || 0);
    const varianceStr = varianceVal >= 0 ? `+${formatIDR(varianceVal)}` : formatIDR(varianceVal);

    const message = 
`- ${staff.name} -

Target : ${formatIDR(staff.targetAmount || 0)}
Achievement : ${formatIDR(staff.totalAmount || 0)}
% : ${staff.achvPct || 0}%
Variance : ${varianceStr}

Achievement

- Apple Devices
iPhone : ${iphoneText}
iPad : ${ipadText}
MacBook : ${macbookText}
Apple watch : ${watchText}

- Android Devices
Samsung : ${samsungText}
Oppo : ${oppoText}
Huawei : ${huaweiText}
Xiaomi : ${xiaomiText}
Motorola : ${motoText}
Infinix : ${infinixText}

- Accessories
Achievement : ${accText}

- VAS
Qoala Protection : ${qoalaText}
Telkomsel Halo/Data : ${tselText}
XL Prioritas : ${xlText}
Indosat IM3 : ${isatText}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
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
    const activePeriodLabel = 
      periodType === "daily" 
        ? `Tanggal: ${selectedDate}` 
        : periodType === "weekly" 
        ? `Minggu: ${selectedWeek}` 
        : `Bulan: ${selectedMonth}`;

    openCustomBottomSheet(
      `${lobName} • (${activePeriodLabel})`,
      <div className="space-y-4 text-xs font-semibold">
        <div className="flex justify-between items-center p-3.5 rounded-2xl bg-black/10 dark:bg-black/25 border border-inherit shadow-inner">
          <div>
            <span className="font-bold text-slate-800 dark:text-slate-300 block">Total Qty Terjual:</span>
            <strong className="text-sky-600 dark:text-sky-400 font-black text-sm">
              {items.reduce((acc, c) => acc + (Number(c.qty) || 1), 0)} Unit
            </strong>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-800 dark:text-slate-300 block">Total Nilai Transaksi:</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-black text-sm sm:text-base font-mono">
              {formatIDR(items.reduce((acc, c) => acc + (Number(c.amount) || 0), 0))}
            </strong>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-inherit w-full">
          <table className="w-full text-left text-xs min-w-[550px]">
            <thead className="bg-slate-200/70 dark:bg-black/40 uppercase text-[10px] font-black tracking-wider border-b border-inherit text-slate-950 dark:text-slate-300">
              <tr>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Invoice</th>
                <th className="py-3 px-3">Sales Person</th>
                <th className="py-3 px-3">Nama Produk</th>
                <th className="py-3 px-3 text-center">Qty</th>
                <th className="py-3 px-3 text-right">Nilai (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit font-semibold">
              {items.length > 0 ? (
                items.map((it, idx) => (
                  <tr key={idx} className="hover:opacity-90">
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {it.date || it.isoDate}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                      {it.invoice}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {it.salesName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-950 dark:text-white max-w-xs">
                      {it.productName}
                    </td>
                    <td className="py-2.5 px-3 text-center font-black text-amber-600 dark:text-amber-400 font-mono">
                      {it.qty}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-400 font-mono whitespace-nowrap">
                      {formatIDR(it.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-bold italic">
                    Tidak ada transaksi pada periode {activePeriodLabel}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
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
    { id: "daily-target", label: "Daily Target & Run Rate", icon: "🎯", color: "bg-orange-500", shadow: "shadow-orange-500/30" },
    { id: "brand-focus", label: "Brand Focus", icon: "🏷️", color: "bg-amber-500", shadow: "shadow-amber-500/30" },
    { id: "schedule", label: "Jadwal Shift 1 Minggu", icon: "📅", color: "bg-sky-500", shadow: "shadow-sky-500/30" },
    { id: "feedback", label: "Feedback Tim", icon: "💬", color: "bg-teal-500", shadow: "shadow-teal-500/30" },
    { id: "bnpl", label: "BNPL Transactions", icon: "💳", color: "bg-purple-500", shadow: "shadow-purple-500/30" },
    { id: "product-search", label: "Cari Produk Terjual", icon: "🔍", color: "bg-pink-500", shadow: "shadow-pink-500/30" },
    { id: "sales-detail", label: "Rincian Transaksi Log", icon: "📋", color: "bg-slate-600", shadow: "shadow-slate-600/30" },
  ];

  const renderComparisonSection = (data: typeof momAnalytics) => {
    return (
      <div className="space-y-6 sm:space-y-8">
        <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4`}>
          <div>
            <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
              <span>⚖️</span>
              <span>ANALISIS PERTUMBUHAN MONTH TO MONTH (MoM)</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
              <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">Bulan 1:</span>
              <select
                value={momCompareMonth}
                onChange={(e) => setMomCompareMonth(e.target.value)}
                className="bg-transparent font-black text-xs text-slate-950 dark:text-white focus:outline-none"
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
              <span className="text-[11px] font-black text-slate-600 dark:text-slate-400">Bulan 2:</span>
              <select
                value={momBaseMonth}
                onChange={(e) => setMomBaseMonth(e.target.value)}
                className="bg-transparent font-black text-xs text-sky-700 dark:text-sky-400 focus:outline-none"
              >
                {availableMonths.map((m) => (
                  <option key={`base-${m}`} value={m} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
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
              <span>TOTAL SALES PER STAF:</span>
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

        <div className={`${cardBg} rounded-3xl border-2 border-rose-500/30 overflow-hidden shadow-xl`}>
          <div className="px-5 py-4 border-b border-rose-500/20 flex justify-between items-center bg-rose-500/5">
            <div>
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <span>🔍</span>
                <span>ANALISIS PENYEBAB PENURUNAN (ROOT CAUSE BY PRODUCT DEFICIT)</span>
              </h3>
            </div>
            <span className="text-xs text-rose-700 dark:text-rose-400 font-black bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
              {data.droppedProducts.length} Produk Teridentifikasi
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className={`${innerBg} uppercase text-[10px] tracking-wider border-b border-inherit font-black text-slate-900 dark:text-slate-300`}>
                <tr>
                  <th className="px-4 py-3">Nama Produk</th>
                  <th className="px-4 py-3">Brand</th>
                  <th className="px-4 py-3 text-center">{data.p1Label} (Unit)</th>
                  <th className="px-4 py-3 text-right">{data.p1Label} (Omset)</th>
                  <th className="px-4 py-3 text-center">{data.p2Label} (Unit)</th>
                  <th className="px-4 py-3 text-right">{data.p2Label} (Omset)</th>
                  <th className="px-4 py-3 text-right text-rose-600">Nilai Defisit</th>
                  <th className="px-4 py-3 text-right">Penurunan (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit font-bold">
                {data.droppedProducts.slice(0, 25).map((p, i) => (
                  <tr key={i} className="hover:opacity-90">
                    <td className="px-4 py-3 font-black text-slate-950 dark:text-white max-w-xs">{p.name}</td>
                    <td className="px-4 py-3">{p.brand}</td>
                    <td className="px-4 py-3 text-center">{p.p1Qty}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatIDR(p.p1Amt)}</td>
                    <td className="px-4 py-3 text-center font-black text-amber-500">{p.p2Qty}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-amber-500">{formatIDR(p.p2Amt)}</td>
                    <td className="px-4 py-3 text-right font-black text-rose-600 font-mono">{formatIDR(p.diff)}</td>
                    <td className="px-4 py-3 text-right font-black text-rose-600 font-mono">{p.growth}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

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

      {/* 2. DRAWER MOBILE */}
      {mobileDrawerOpen && (
        <div
          onClick={() => setMobileDrawerOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity print:hidden"
        />
      )}

      <div
        className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 max-w-[80vw] z-50 transform transition-transform duration-300 ease-in-out border-r backdrop-blur-2xl p-5 flex flex-col justify-between print:hidden ${glassSidebar} ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-inherit">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center shadow-sm">
                QF01
              </div>
              <span className="font-black text-sm text-slate-950 dark:text-white">DIGIPLUS GI</span>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-slate-700/20 dark:bg-slate-700/30 flex items-center justify-center text-xs font-bold text-slate-950 dark:text-white"
            >
              ✕
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
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold">
                    {currentSalesName || "Store Leader Admin"}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold">
                    • {currentTime}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                  {todayFormatted}
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

                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="px-2.5 py-1 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-400/30 text-xs font-black flex items-center gap-1.5 shadow-sm">
                    <span>🗓️</span>
                    <span>{todayFormatted}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 text-xs font-black font-mono flex items-center gap-1.5 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{currentTime || "Memuat..."}</span>
                  </span>

                  <span className={`text-[11px] ${textMuted} font-semibold hidden md:inline ml-1`}>
                    • Toko: <strong>QF01 (Grand Indonesia)</strong>
                  </span>
                </div>

                <p className={`text-[11px] ${textMuted} mt-1.5 font-semibold`}>
                  Live Feed: <code>DATABASE</code> (gid: 602901290) &amp; <code>BNPL DATABASE</code> (gid: 2697970)
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
                        <option key={w.key} value={w.label}>
                          {w.label} {w.range ? `(${w.range})` : ""}
                        </option>
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
                  {/* TIME GONE ANALYTICS */}
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
                  </div>

                  {/* TREND DAILY SALES */}
                  <div className={`p-5 rounded-3xl border ${cardBg} space-y-3 overflow-hidden`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">Trend Daily Sales vs Target Ideal Harian</h3>
                      </div>
                    </div>
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs min-w-[550px]">
                        <thead className={`${innerBg} uppercase text-[10px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="py-3 px-3">Tanggal</th>
                            <th className="py-3 px-3 text-right">Actual Omset</th>
                            <th className="py-3 px-3 text-right">Target Ideal</th>
                            <th className="py-3 px-3 text-right">Gap Harian</th>
                            <th className="py-3 px-3 text-center">Status</th>
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

                  {/* TARGET VS ACHIEVEMENT (T/A) & DRILLDOWN PRODUK */}
                  <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-6`}>
                    <div className="flex flex-wrap justify-between items-center pb-4 border-b border-inherit gap-3">
                      <div>
                        <h3 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>🎯</span>
                          <span>TARGET VS ACHIEVEMENT (T/A) &amp; DRILLDOWN PRODUK</span>
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-6">
                      {/* Apple Devices */}
                      {(() => {
                        const items = overviewStats.appleItems || [];
                        const actual = items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                        const target = targetAppleLOB;
                        const achv = calcAchv(actual, target);
                        const gap = actual - target;

                        const subList = [
                          { label: "iPhone", filterKey: "IPHONE", targetWeight: 0.72 },
                          { label: "iPad", filterKey: "IPAD", targetWeight: 0.12 },
                          { label: "MacBook", filterKey: "MAC", targetWeight: 0.08 },
                          { label: "Apple Watch", filterKey: "WATCH", targetWeight: 0.05 },
                          { label: "AirPods", filterKey: "AIRPOD", targetWeight: 0.03 },
                        ];

                        return (
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🍎</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400">
                                    Apple Devices
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet("Seluruh Apple Devices Terjual", items)}
                                  className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-400 border border-sky-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                              {subList.map((sub, idx) => {
                                const subItems = items.filter((t) => (t.productName || "").toUpperCase().includes(sub.filterKey));
                                const subActual = subItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                const subTarget = Math.round(target * sub.targetWeight);
                                const subAchv = calcAchv(subActual, subTarget);
                                const subGap = subActual - subTarget;

                                return (
                                  <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">{sub.label}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${subAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                        {subAchv}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                      <div><strong>T/A:</strong> {formatIDR(subTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(subActual)}</span></div>
                                      <div><strong>-/+:</strong> <span className={subGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{subGap >= 0 ? `+${formatIDR(subGap)}` : formatIDR(subGap)}</span></div>
                                      <div><strong>Estimate:</strong> {formatIDR(calcEst(subActual))}</div>
                                    </div>
                                    <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openLobDetailSheet(`Daftar ${sub.label} Terjual`, subItems)}
                                        className="text-[10px] font-black text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                                      >
                                        <span>More Details</span>
                                        <span>➔</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Android Devices */}
                      {(() => {
                        const items = overviewStats.androidItems || [];
                        const actual = items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                        const target = targetAndroidLOB;
                        const achv = calcAchv(actual, target);
                        const gap = actual - target;

                        const androidBrands = [
                          { label: "Samsung Device", brandKey: "SAMSUNG", icon: "📱", weight: 0.55 },
                          { label: "Huawei Device", brandKey: "HUAWEI", icon: "🔴", weight: 0.18 },
                          { label: "Xiaomi / Redmi Device", brandKey: "XIAOMI", icon: "🟠", weight: 0.14 },
                          { label: "Oppo Device", brandKey: "OPPO", icon: "🟢", weight: 0.08 },
                          { label: "Motorola & Lainnya", brandKey: "OTHER", icon: "🤖", weight: 0.05 },
                        ];

                        return (
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🤖</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                                    Android Devices
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet("Seluruh Android Devices Terjual", items)}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 border border-indigo-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                              {androidBrands.map((b, idx) => {
                                const brandItems = b.brandKey === "OTHER"
                                  ? items.filter((t) => !["SAMSUNG", "HUAWEI", "XIAOMI", "OPPO"].includes((t.brand || "").toUpperCase()))
                                  : items.filter((t) => (t.brand || "").toUpperCase().includes(b.brandKey));

                                const bActual = brandItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                const bTarget = Math.round(target * b.weight);
                                const bAchv = calcAchv(bActual, bTarget);
                                const bGap = bActual - bTarget;

                                return (
                                  <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{b.icon}</span>
                                        <span>{b.label}</span>
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${bAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                        {bAchv}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                      <div><strong>T/A:</strong> {formatIDR(bTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(bActual)}</span></div>
                                      <div><strong>-/+:</strong> <span className={bGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{bGap >= 0 ? `+${formatIDR(bGap)}` : formatIDR(bGap)}</span></div>
                                      <div><strong>Estimate:</strong> {formatIDR(calcEst(bActual))}</div>
                                    </div>
                                    <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openLobDetailSheet(`Daftar ${b.label} Terjual`, brandItems)}
                                        className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                      >
                                        <span>More Details</span>
                                        <span>➔</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Accessories */}
                      {(() => {
                        const items = overviewStats.accItems || [];
                        const actual = items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                        const target = targetAccessoriesLOB;
                        const achv = calcAchv(actual, target);
                        const gap = actual - target;

                        return (
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🔌</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                                    Accessories (Cases, Chargers &amp; Audio)
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet("Seluruh Aksesoris Supplier Terjual", items)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* VAS */}
                      {(() => {
                        const items = overviewStats.vasItems || [];
                        const actual = items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                        const target = targetVasLOB;
                        const achv = calcAchv(actual, target);
                        const gap = actual - target;

                        const vasSubs = [
                          { label: "Qoala Protection", filterKey: "QOALA", icon: "🛡️", weight: 0.65 },
                          { label: "Telkomsel Halo/Data", filterKey: "TELKOMSEL", icon: "🔴", weight: 0.15 },
                          { label: "XL Prioritas (MyPrio)", filterKey: "XL", icon: "🔵", weight: 0.12 },
                          { label: "Indosat IM3", filterKey: "INDOSAT", icon: "🟡", weight: 0.08 },
                        ];

                        return (
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🛡️</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400">
                                    Value-Added Services (VAS &amp; Warranty)
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet("Seluruh Transaksi Layanan VAS Terjual", items)}
                                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-400 border border-purple-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                              {vasSubs.map((vs, idx) => {
                                const vsItems = items.filter((t) => {
                                  const pUpper = (t.productName || "").toUpperCase();
                                  const bUpper = (t.brand || "").toUpperCase();
                                  return bUpper.includes(vs.filterKey) || pUpper.includes(vs.filterKey);
                                });

                                const vsActual = vsItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                const vsTarget = Math.round(target * vs.weight);
                                const vsAchv = calcAchv(vsActual, vsTarget);
                                const vsGap = vsActual - vsTarget;

                                return (
                                  <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{vs.icon}</span>
                                        <span>{vs.label}</span>
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${vsAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                        {vsAchv}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                      <div><strong>T/A:</strong> {formatIDR(vsTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(vsActual)}</span></div>
                                      <div><strong>-/+:</strong> <span className={vsGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{vsGap >= 0 ? `+${formatIDR(vsGap)}` : formatIDR(vsGap)}</span></div>
                                      <div><strong>Estimate:</strong> {formatIDR(calcEst(vsActual))}</div>
                                    </div>
                                    <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openLobDetailSheet(`Daftar ${vs.label} Terjual`, vsItems)}
                                        className="text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                      >
                                        <span>More Details</span>
                                        <span>➔</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WEEKLY SALES (WoW) + TARGET VS ACHIEVEMENT (T/A) */}
              {activeTab === "weekly-sales" && (
                <div className="space-y-6 sm:space-y-8">
                  <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4`}>
                    <div>
                      <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                        <span>📈</span>
                        <span>PERBANDINGAN WEEK TO WEEK (WoW) SALES</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-0.5`}>
                        Bandingkan pertumbuhan omset, unit (Qty), dan kontribusi sales per produk
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
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
                    </div>
                  </div>

                  <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
                    <div className="flex flex-wrap justify-between items-center pb-3 border-b border-inherit gap-3">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-slate-500">TOTAL SALES STORE</span>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xl sm:text-2xl font-black font-mono text-slate-950 dark:text-white">
                            {formatIDR(weeklyComparisonData.totalM2)}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 ${
                            weeklyComparisonData.storeGrowth >= 0 
                              ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-400/30" 
                              : "bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-400/30"
                          }`}>
                            <span>{weeklyComparisonData.storeGrowth >= 0 ? "▲ +" : "▼ "}</span>
                            <span>{weeklyComparisonData.storeGrowth}%</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-slate-500">
                          {weeklyComparisonData.p1Label}: {formatIDR(weeklyComparisonData.totalM1)} ➔ {weeklyComparisonData.p2Label}: {formatIDR(weeklyComparisonData.totalM2)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-3">
                        PENCAPAIAN OMSET PER STAF ({weeklyComparisonData.p1Label} VS {weeklyComparisonData.p2Label}):
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {weeklyComparisonData.staffSales.map((st, idx) => (
                          <div key={idx} className={`p-3.5 rounded-2xl border ${innerBg} flex justify-between items-center shadow-sm`}>
                            <div>
                              <span className="text-xs font-black text-slate-950 dark:text-white block">{st.name}</span>
                              <div className="text-[11px] font-bold text-slate-500 mt-0.5">
                                <span>{weeklyComparisonData.p1Label}: {formatIDR(st.m1)}</span>
                                <span className="mx-1">•</span>
                                <span className="text-slate-950 dark:text-slate-200">{weeklyComparisonData.p2Label}: {formatIDR(st.m2)}</span>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                              st.growth >= 0 
                                ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" 
                                : "bg-rose-500/15 text-rose-700 dark:text-rose-400"
                            }`}>
                              {st.growth >= 0 ? `▲ +${st.growth}%` : `▼ ${st.growth}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TARGET VS ACHIEVEMENT (T/A) MINGGUAN */}
                  {(() => {
                    const w2Trx = weeklyComparisonData.trxW2 || [];
                    const weeklyStoreTarget = Math.round(((storeTotalTarget || 8728667173) / 31) * 7);
                    const weeklyAppleTarget = Math.round(weeklyStoreTarget * 0.794);
                    const weeklyAndroidTarget = Math.round(weeklyStoreTarget * 0.108);
                    const weeklyAccTarget = Math.round(weeklyStoreTarget * 0.05);
                    const weeklyVasTarget = Math.round(weeklyStoreTarget * 0.045);

                    const appleW2Items = w2Trx.filter((t) => {
                      const p = (t.productName || "").toUpperCase();
                      const isAcc = p.includes("CASE") || p.includes("GLASS") || p.includes("ADAPTER") || p.includes("CABLE");
                      return t.brand === "APPLE" && !isAcc && (t.groupCategory === "DEVICES" || p.includes("IPHONE") || p.includes("IPAD") || p.includes("MAC") || p.includes("WATCH") || p.includes("AIRPOD"));
                    });

                    const androidW2Items = w2Trx.filter((t) => {
                      const p = (t.productName || "").toUpperCase();
                      const isAcc = p.includes("CASE") || p.includes("GLASS") || p.includes("ADAPTER") || p.includes("CABLE");
                      return t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isAcc;
                    });

                    const accW2Items = w2Trx.filter((t) => t.groupCategory === "ACCESSORIES");
                    const vasW2Items = w2Trx.filter((t) => {
                      const p = (t.productName || "").toUpperCase();
                      return t.groupCategory === "VAS" || t.brand === "QOALA" || p.includes("QOALA") || p.includes("PROTEKSI") || p.includes("TELKOMSEL") || p.includes("MYPRIO");
                    });

                    return (
                      <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-6`}>
                        <div className="flex flex-wrap justify-between items-center pb-4 border-b border-inherit gap-3">
                          <div>
                            <h3 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                              <span>🎯</span>
                              <span>TARGET VS ACHIEVEMENT (T/A) MINGGUAN — {w2Filter || "Minggu Berjalan"}</span>
                            </h3>
                            <p className={`text-xs ${textMuted} mt-0.5`}>
                              Kalkulasi Target Proporsional 7 Hari vs Penjualan Realisasi Periode Terpilih
                            </p>
                          </div>
                          <span className="text-xs font-bold text-slate-500">
                            Klik &quot;More Details ➔&quot; untuk audit nota &amp; rincian produk
                          </span>
                        </div>

                        <div className="space-y-6">
                          {/* 1. Apple Devices */}
                          {(() => {
                            const actual = appleW2Items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                            const target = weeklyAppleTarget;
                            const achv = calcAchv(actual, target);
                            const gap = actual - target;

                            const appleSubList = [
                              { label: "iPhone", filterKey: "IPHONE", targetWeight: 0.72 },
                              { label: "iPad", filterKey: "IPAD", targetWeight: 0.12 },
                              { label: "MacBook", filterKey: "MAC", targetWeight: 0.08 },
                              { label: "Apple Watch", filterKey: "WATCH", targetWeight: 0.05 },
                              { label: "AirPods", filterKey: "AIRPOD", targetWeight: 0.03 },
                            ];

                            return (
                              <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                                <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🍎</span>
                                    <div>
                                      <h4 className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400">
                                        Apple Devices
                                      </h4>
                                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                        <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-right">
                                    <div>
                                      <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                        {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-bold block">
                                        Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => openLobDetailSheet(`Seluruh Apple Devices Terjual (${w2Filter})`, appleW2Items)}
                                      className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-400 border border-sky-400/30 text-xs font-black transition active:scale-95"
                                    >
                                      More Details ➔
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                                  {appleSubList.map((sub, idx) => {
                                    const subItems = appleW2Items.filter((t) => (t.productName || "").toUpperCase().includes(sub.filterKey));
                                    const subActual = subItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                    const subTarget = Math.round(target * sub.targetWeight);
                                    const subAchv = calcAchv(subActual, subTarget);
                                    const subGap = subActual - subTarget;

                                    return (
                                      <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                        <div className="flex justify-between items-center">
                                          <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">{sub.label}</span>
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${subAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                            {subAchv}%
                                          </span>
                                        </div>
                                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                          <div><strong>T/A:</strong> {formatIDR(subTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(subActual)}</span></div>
                                          <div><strong>-/+:</strong> <span className={subGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{subGap >= 0 ? `+${formatIDR(subGap)}` : formatIDR(subGap)}</span></div>
                                          <div><strong>Estimate:</strong> {formatIDR(calcEst(subActual))}</div>
                                        </div>
                                        <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => openLobDetailSheet(`Daftar ${sub.label} Terjual (${w2Filter})`, subItems)}
                                            className="text-[10px] font-black text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                                          >
                                            <span>More Details</span>
                                            <span>➔</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 2. Android Devices */}
                          {(() => {
                            const actual = androidW2Items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                            const target = weeklyAndroidTarget;
                            const achv = calcAchv(actual, target);
                            const gap = actual - target;

                            const androidBrands = [
                              { label: "Samsung Device", brandKey: "SAMSUNG", icon: "📱", weight: 0.55 },
                              { label: "Huawei Device", brandKey: "HUAWEI", icon: "🔴", weight: 0.18 },
                              { label: "Xiaomi / Redmi Device", brandKey: "XIAOMI", icon: "🟠", weight: 0.14 },
                              { label: "Oppo Device", brandKey: "OPPO", icon: "🟢", weight: 0.08 },
                              { label: "Motorola & Lainnya", brandKey: "OTHER", icon: "🤖", weight: 0.05 },
                            ];

                            return (
                              <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                                <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🤖</span>
                                    <div>
                                      <h4 className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                                        Android Devices
                                      </h4>
                                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                        <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-right">
                                    <div>
                                      <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                        {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-bold block">
                                        Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => openLobDetailSheet(`Seluruh Android Devices Terjual (${w2Filter})`, androidW2Items)}
                                      className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 border border-indigo-400/30 text-xs font-black transition active:scale-95"
                                    >
                                      More Details ➔
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                                  {androidBrands.map((b, idx) => {
                                    const brandItems = b.brandKey === "OTHER"
                                      ? androidW2Items.filter((t) => !["SAMSUNG", "HUAWEI", "XIAOMI", "OPPO"].includes((t.brand || "").toUpperCase()))
                                      : androidW2Items.filter((t) => (t.brand || "").toUpperCase().includes(b.brandKey));

                                    const bActual = brandItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                    const bTarget = Math.round(target * b.weight);
                                    const bAchv = calcAchv(bActual, bTarget);
                                    const bGap = bActual - bTarget;

                                    return (
                                      <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                        <div className="flex justify-between items-center">
                                          <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>{b.icon}</span>
                                            <span>{b.label}</span>
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${bAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                            {bAchv}%
                                          </span>
                                        </div>
                                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                          <div><strong>T/A:</strong> {formatIDR(bTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(bActual)}</span></div>
                                          <div><strong>-/+:</strong> <span className={bGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{bGap >= 0 ? `+${formatIDR(bGap)}` : formatIDR(bGap)}</span></div>
                                          <div><strong>Estimate:</strong> {formatIDR(calcEst(bActual))}</div>
                                        </div>
                                        <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => openLobDetailSheet(`Daftar ${b.label} Terjual (${w2Filter})`, brandItems)}
                                            className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                          >
                                            <span>More Details</span>
                                            <span>➔</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}

                          {/* 3. Accessories */}
                          {(() => {
                            const actual = accW2Items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                            const target = weeklyAccTarget;
                            const achv = calcAchv(actual, target);
                            const gap = actual - target;

                            return (
                              <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                                <div className="flex flex-wrap justify-between items-center gap-3">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🔌</span>
                                    <div>
                                      <h4 className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                                        Accessories (Cases, Chargers &amp; Audio)
                                      </h4>
                                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                        <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-right">
                                    <div>
                                      <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                        {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-bold block">
                                        Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => openLobDetailSheet(`Seluruh Aksesoris Supplier Terjual (${w2Filter})`, accW2Items)}
                                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-400/30 text-xs font-black transition active:scale-95"
                                    >
                                      More Details ➔
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}

                          {/* 4. VAS */}
                          {(() => {
                            const actual = vasW2Items.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                            const target = weeklyVasTarget;
                            const achv = calcAchv(actual, target);
                            const gap = actual - target;

                            const vasSubs = [
                              { label: "Qoala Protection", filterKey: "QOALA", icon: "🛡️", weight: 0.65 },
                              { label: "Telkomsel Halo/Data", filterKey: "TELKOMSEL", icon: "🔴", weight: 0.15 },
                              { label: "XL Prioritas (MyPrio)", filterKey: "XL", icon: "🔵", weight: 0.12 },
                              { label: "Indosat IM3", filterKey: "INDOSAT", icon: "🟡", weight: 0.08 },
                            ];

                            return (
                              <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                                <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                                  <div className="flex items-center gap-3">
                                    <span className="text-2xl">🛡️</span>
                                    <div>
                                      <h4 className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400">
                                        Value-Added Services (VAS &amp; Warranty)
                                      </h4>
                                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                        <strong>T/A:</strong> {formatIDR(target)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(actual)}</strong>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-4 text-right">
                                    <div>
                                      <div className={`text-sm sm:text-base font-black font-mono ${achv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                        {achv}% ({gap >= 0 ? `+${formatIDR(gap)}` : formatIDR(gap)})
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-bold block">
                                        Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(actual))}</strong>
                                      </span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => openLobDetailSheet(`Seluruh Layanan VAS Terjual (${w2Filter})`, vasW2Items)}
                                      className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-400 border border-purple-400/30 text-xs font-black transition active:scale-95"
                                    >
                                      More Details ➔
                                    </button>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                                  {vasSubs.map((vs, idx) => {
                                    const vsItems = vasW2Items.filter((t) => {
                                      const pUpper = (t.productName || "").toUpperCase();
                                      const bUpper = (t.brand || "").toUpperCase();
                                      return bUpper.includes(vs.filterKey) || pUpper.includes(vs.filterKey);
                                    });

                                    const vsActual = vsItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                    const vsTarget = Math.round(target * vs.weight);
                                    const vsAchv = calcAchv(vsActual, vsTarget);
                                    const vsGap = vsActual - vsTarget;

                                    return (
                                      <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                        <div className="flex justify-between items-center">
                                          <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <span>{vs.icon}</span>
                                            <span>{vs.label}</span>
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${vsAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                            {vsAchv}%
                                          </span>
                                        </div>
                                        <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                          <div><strong>T/A:</strong> {formatIDR(vsTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(vsActual)}</span></div>
                                          <div><strong>-/+:</strong> <span className={vsGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{vsGap >= 0 ? `+${formatIDR(vsGap)}` : formatIDR(vsGap)}</span></div>
                                          <div><strong>Estimate:</strong> {formatIDR(calcEst(vsActual))}</div>
                                        </div>
                                        <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                          <button
                                            type="button"
                                            onClick={() => openLobDetailSheet(`Daftar ${vs.label} Terjual (${w2Filter})`, vsItems)}
                                            className="text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                          >
                                            <span>More Details</span>
                                            <span>➔</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB KHUSUS: QOALA PROTECTION */}
              {activeTab === "qoala-ar" && (
                <div className="space-y-6 sm:space-y-8">
                  <div className={`p-5 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>🛡️</span>
                          <span>QOALA PROTECTION &amp; ATTACHMENT RATE (AR %)</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-0.5`}>
                          Periode: {periodType.toUpperCase()} ({periodType === "daily" ? selectedDate : periodType === "weekly" ? selectedWeek : selectedMonth})
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Store Attachment Rate</span>
                        <div className="text-2xl sm:text-3xl font-black mt-1 font-mono text-emerald-600 dark:text-emerald-400">
                          {qoalaAnalytics.storeAR}%
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Total Polis Terjual</span>
                        <div className="text-2xl sm:text-3xl font-black mt-1 text-sky-600 dark:text-sky-400 font-mono">
                          {qoalaAnalytics.totalQoalaQty} Unit
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Total Device Terjual</span>
                        <div className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 dark:text-white font-mono">
                          {qoalaAnalytics.totalDeviceQty} Unit
                        </div>
                      </div>
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[10px] font-black uppercase tracking-wider ${textMuted} block`}>Total Omset Premi</span>
                        <div className="text-2xl sm:text-3xl font-black mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                          {formatIDR(qoalaAnalytics.totalQoalaAmount)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 10: MoM GROWTH ANALYSIS */}
              {activeTab === "mom-comparison" && renderComparisonSection(momAnalytics)}

              {/* TAB 3: STAFF PERFORMANCE & TARGET VS ACHIEVEMENT PER STAFF */}
              {activeTab === "staff-performance" && (
                <div className="space-y-8">
                  {/* BAGIAN 1: LEADERBOARD OVERVIEW */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>🏆</span>
                          <span>STAFF PERFORMANCE LEADERBOARD ({staffList.length} STAF)</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-0.5`}>
                          Periode: {periodType.toUpperCase()} ({periodType === "daily" ? selectedDate : periodType === "weekly" ? selectedWeek : selectedMonth})
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {staffList.map((st) => (
                        <div
                          key={st.salesId}
                          onClick={() => setSelectedStaffId(st.salesId)}
                          className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer hover:shadow-xl ${
                            selectedStaffId === st.salesId
                              ? isDark 
                                ? "bg-[#112240] border-sky-400 ring-2 ring-sky-400/40 shadow-xl"
                                : "bg-sky-50/70 border-sky-400 ring-2 ring-sky-400/40 shadow-lg"
                              : isDark
                                ? "bg-gradient-to-b from-[#0F1E36] to-[#0A1324] border-slate-700/70 shadow-2xl shadow-black/50"
                                : "bg-white border-slate-300 shadow-md shadow-slate-200/80 hover:border-sky-400"
                          }`}
                        >
                          {/* Header Kartu */}
                          <div className={`flex items-center justify-between pb-3.5 border-b ${isDark ? "border-slate-700/60" : "border-slate-200"}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shadow-md bg-gradient-to-br from-sky-600 to-blue-700">
                                {st.initials}
                              </div>
                              <div>
                                <h4 className="text-sm font-black tracking-tight text-slate-950 dark:text-white">
                                  {st.name}
                                </h4>
                                <span className="text-[11px] font-bold block text-slate-600 dark:text-slate-400">
                                  {st.role || "Sales Specialist"}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-black border shadow-sm ${
                                st.achvPct >= 100
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/40"
                                  : st.achvPct >= 70
                                  ? "bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400/40"
                                  : "bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-400/40"
                              }`}
                            >
                              {st.achvPct >= 100 ? "Productive 🔥" : st.achvPct >= 70 ? "On Track ⚡" : "Need Focus ⚠️"}
                            </span>
                          </div>

                          {/* Nominal & Persen */}
                          <div className="py-4 flex justify-between items-end">
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">
                                Total Penjualan
                              </span>
                              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5 tracking-tight text-slate-950 dark:text-white">
                                {formatIDR(st.totalAmount)}
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                                  st.achvPct >= 100 
                                    ? "text-emerald-700 dark:text-emerald-400"
                                    : st.achvPct >= 70 
                                    ? "text-amber-700 dark:text-amber-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }`}
                              >
                                {st.achvPct.toFixed(1)}%
                              </span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className={`w-full h-2 rounded-full overflow-hidden mb-4 border ${isDark ? "bg-slate-800 border-slate-700/50" : "bg-slate-200 border-slate-300"}`}>
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                st.achvPct >= 100
                                  ? "bg-emerald-600"
                                  : st.achvPct >= 70
                                  ? "bg-amber-500"
                                  : "bg-rose-500"
                              }`}
                              style={{ width: `${Math.min(st.achvPct, 100)}%` }}
                            />
                          </div>

                          {/* Grid Metrik UPT, ATV, TRX */}
                          <div className={`grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl border ${
                            isDark ? "bg-slate-900/60 border-slate-700/80" : "bg-slate-100/90 border-slate-300 shadow-inner"
                          }`}>
                            <div className="text-center">
                              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">UPT</span>
                              <strong className="text-xs sm:text-sm font-black font-mono block mt-1 text-blue-700 dark:text-sky-400">
                                {st.upt}
                              </strong>
                            </div>
                            <div className={`text-center border-x ${isDark ? "border-slate-700" : "border-slate-300"}`}>
                              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">ATV</span>
                              <strong className="text-xs sm:text-sm font-black font-mono block mt-1 text-slate-900 dark:text-slate-100">
                                {formatCompactIDR(st.atv)}
                              </strong>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">TRX</span>
                              <strong className="text-xs sm:text-sm font-black font-mono block mt-1 text-slate-950 dark:text-white">
                                {st.trxCount || 0}
                              </strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ========================================================
                      BAGIAN 2: TARGET VS ACHIEVEMENT PER STAFF (DRILLDOWN)
                  ======================================================== */}
                  {(() => {
                    const activeStaff = staffList.find((s) => s.salesId === selectedStaffId) || staffList[0];
                    if (!activeStaff) return null;

                    // Filter transaksi hanya milik staf yang dipilih pada periode aktif
                    const currentStaffTrx = activeTransactions.filter((t) => t.salesId === activeStaff.salesId);

                    const targetStaffTotal = activeStaff.targetAmount || 1;
                    const targetApple = Math.round(targetStaffTotal * 0.794);
                    const targetAndroid = Math.round(targetStaffTotal * 0.108);
                    const targetAccessories = Math.round(targetStaffTotal * 0.05);
                    const targetVas = Math.round(targetStaffTotal * 0.045);

                    // Filter LOB items
                    const staffAppleItems = currentStaffTrx.filter((t) => {
                      const p = (t.productName || "").toUpperCase();
                      const isAcc = p.includes("CASE") || p.includes("GLASS") || p.includes("ADAPTER") || p.includes("CABLE");
                      return t.brand === "APPLE" && !isAcc && (t.groupCategory === "DEVICES" || p.includes("IPHONE") || p.includes("IPAD") || p.includes("MAC") || p.includes("WATCH") || p.includes("AIRPOD"));
                    });

                    const staffAndroidItems = currentStaffTrx.filter((t) => {
                      const p = (t.productName || "").toUpperCase();
                      const isAcc = p.includes("CASE") || p.includes("GLASS") || p.includes("ADAPTER") || p.includes("CABLE");
                      return t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isAcc;
                    });

                    const staffAccItems = currentStaffTrx.filter((t) => t.groupCategory === "ACCESSORIES");

                    const staffVasItems = currentStaffTrx.filter((t) => {
                      const p = (t.productName || "").toUpperCase();
                      return t.groupCategory === "VAS" || t.brand === "QOALA" || p.includes("QOALA") || p.includes("PROTEKSI") || p.includes("TELKOMSEL") || p.includes("MYPRIO");
                    });

                    const appleActual = staffAppleItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                    const appleAchv = calcAchv(appleActual, targetApple);
                    const appleGap = appleActual - targetApple;

                    const androidActual = staffAndroidItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                    const androidAchv = calcAchv(androidActual, targetAndroid);
                    const androidGap = androidActual - targetAndroid;

                    const accActual = staffAccItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                    const accAchv = calcAchv(accActual, targetAccessories);
                    const accGap = accActual - targetAccessories;

                    const vasActual = staffVasItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                    const vasAchv = calcAchv(vasActual, targetVas);
                    const vasGap = vasActual - targetVas;

                    return (
                      <div className={`p-5 sm:p-7 ${cardBg} border-2 rounded-3xl shadow-2xl space-y-7`}>
                        {/* Header Section Per Staff & Tombol WA */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-inherit">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">👤</span>
                              <h3 className="text-lg sm:text-xl font-black text-slate-950 dark:text-white">
                                Target Vs Achievement Per Staff
                              </h3>
                            </div>
                            <p className={`text-xs ${textMuted} mt-1`}>
                              Menampilkan rincian pencapaian &amp; drilldown produk untuk: <strong className="text-sky-600 dark:text-sky-400">{activeStaff.name} ({activeStaff.salesId})</strong>
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            {/* Dropdown Pemilihan Staf */}
                            <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                              <span className="text-xs font-bold text-slate-500">Pilih Staf:</span>
                              <select
                                value={selectedStaffId}
                                onChange={(e) => setSelectedStaffId(e.target.value)}
                                className="bg-transparent font-black text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                              >
                                {staffList.map((s) => (
                                  <option key={s.salesId} value={s.salesId} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>
                                    {s.name} ({formatCompactIDR(s.totalAmount)})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Tombol Share WhatsApp Sesuai Format Auto-Text */}
                            <button
                              type="button"
                              onClick={() => handleShareStaffWA(activeStaff, currentStaffTrx)}
                              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                              <span>📲</span>
                              <span>Share WA Staff</span>
                            </button>
                          </div>
                        </div>

                        {/* LIST 4 KATEGORI (LOB) */}
                        <div className="space-y-6">
                          {/* 1. APPLE DEVICES */}
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🍎</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-sky-600 dark:text-sky-400">
                                    Apple Devices
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(targetApple)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(appleActual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${appleAchv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {appleAchv}% ({appleGap >= 0 ? `+${formatIDR(appleGap)}` : formatIDR(appleGap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(appleActual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet(`Apple Devices Terjual - ${activeStaff.name}`, staffAppleItems)}
                                  className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-700 dark:text-sky-400 border border-sky-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>

                            {/* Sub-item Apple: iPhone, iPad, MacBook, Watch, AirPods */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                              {[
                                { label: "iPhone", filterKey: "IPHONE", weight: 0.72 },
                                { label: "iPad", filterKey: "IPAD", weight: 0.12 },
                                { label: "MacBook", filterKey: "MAC", weight: 0.08 },
                                { label: "Apple Watch", filterKey: "WATCH", weight: 0.05 },
                                { label: "AirPods", filterKey: "AIRPOD", weight: 0.03 },
                              ].map((sub, idx) => {
                                const subItems = staffAppleItems.filter((t) => (t.productName || "").toUpperCase().includes(sub.filterKey));
                                const subActual = subItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                const subTarget = Math.round(targetApple * sub.weight);
                                const subAchv = calcAchv(subActual, subTarget);
                                const subGap = subActual - subTarget;

                                return (
                                  <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">{sub.label}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${subAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                        {subAchv}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                      <div><strong>T/A:</strong> {formatIDR(subTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(subActual)}</span></div>
                                      <div><strong>-/+:</strong> <span className={subGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{subGap >= 0 ? `+${formatIDR(subGap)}` : formatIDR(subGap)}</span></div>
                                      <div><strong>Estimate:</strong> {formatIDR(calcEst(subActual))}</div>
                                    </div>
                                    <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openLobDetailSheet(`${sub.label} Terjual - ${activeStaff.name}`, subItems)}
                                        className="text-[10px] font-black text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                                      >
                                        <span>More Details</span>
                                        <span>➔</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 2. ANDROID DEVICES */}
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🤖</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-indigo-600 dark:text-indigo-400">
                                    Android Devices
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(targetAndroid)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(androidActual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${androidAchv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {androidAchv}% ({androidGap >= 0 ? `+${formatIDR(androidGap)}` : formatIDR(androidGap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(androidActual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet(`Android Devices Terjual - ${activeStaff.name}`, staffAndroidItems)}
                                  className="px-3 py-1.5 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-700 dark:text-indigo-400 border border-indigo-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>

                            {/* Sub-item Brand Android: Samsung, Oppo, Huawei, Xiaomi, Motorola, Infinix */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                              {[
                                { label: "Samsung Device", brandKey: "SAMSUNG", icon: "📱", weight: 0.50 },
                                { label: "Oppo Device", brandKey: "OPPO", icon: "🟢", weight: 0.15 },
                                { label: "Huawei Device", brandKey: "HUAWEI", icon: "🔴", weight: 0.15 },
                                { label: "Xiaomi / Redmi", brandKey: "XIAOMI", icon: "🟠", weight: 0.10 },
                                { label: "Motorola", brandKey: "MOTOROLA", icon: "🔷", weight: 0.05 },
                                { label: "Infinix & Lainnya", brandKey: "INFINIX", icon: "⚡", weight: 0.05 },
                              ].map((b, idx) => {
                                const brandItems = staffAndroidItems.filter((t) => {
                                  const br = (t.brand || "").toUpperCase();
                                  if (b.brandKey === "INFINIX") {
                                    return br.includes("INFINIX") || (!["SAMSUNG", "OPPO", "HUAWEI", "XIAOMI", "MOTOROLA"].includes(br));
                                  }
                                  return br.includes(b.brandKey);
                                });

                                const bActual = brandItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                const bTarget = Math.round(targetAndroid * b.weight);
                                const bAchv = calcAchv(bActual, bTarget);
                                const bGap = bActual - bTarget;

                                return (
                                  <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{b.icon}</span>
                                        <span>{b.label}</span>
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${bAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                        {bAchv}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                      <div><strong>T/A:</strong> {formatIDR(bTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(bActual)}</span></div>
                                      <div><strong>-/+:</strong> <span className={bGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{bGap >= 0 ? `+${formatIDR(bGap)}` : formatIDR(bGap)}</span></div>
                                      <div><strong>Estimate:</strong> {formatIDR(calcEst(bActual))}</div>
                                    </div>
                                    <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openLobDetailSheet(`${b.label} Terjual - ${activeStaff.name}`, brandItems)}
                                        className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                      >
                                        <span>More Details</span>
                                        <span>➔</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* 3. ACCESSORIES */}
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🔌</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                                    Accessories (Database Supplier)
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(targetAccessories)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(accActual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${accAchv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {accAchv}% ({accGap >= 0 ? `+${formatIDR(accGap)}` : formatIDR(accGap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(accActual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet(`Accessories Terjual - ${activeStaff.name}`, staffAccItems)}
                                  className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* 4. VALUE-ADDED SERVICES (VAS) */}
                          <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-4`}>
                            <div className="flex flex-wrap justify-between items-center gap-3 pb-3 border-b border-inherit/50">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">🛡️</span>
                                <div>
                                  <h4 className="text-sm sm:text-base font-black text-purple-600 dark:text-purple-400">
                                    Value-Added Services (VAS &amp; Warranty)
                                  </h4>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-0.5">
                                    <strong>T/A:</strong> {formatIDR(targetVas)} / <strong className="text-emerald-600 dark:text-emerald-400">{formatIDR(vasActual)}</strong>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <div className={`text-sm sm:text-base font-black font-mono ${vasAchv >= 100 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                                    {vasAchv}% ({vasGap >= 0 ? `+${formatIDR(vasGap)}` : formatIDR(vasGap)})
                                  </div>
                                  <span className="text-[11px] text-slate-500 font-bold block">
                                    Estimate: <strong className="text-slate-800 dark:text-slate-200">{formatIDR(calcEst(vasActual))}</strong>
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => openLobDetailSheet(`Layanan VAS Terjual - ${activeStaff.name}`, staffVasItems)}
                                  className="px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-700 dark:text-purple-400 border border-purple-400/30 text-xs font-black transition active:scale-95"
                                >
                                  More Details ➔
                                </button>
                              </div>
                            </div>

                            {/* Sub-item VAS: Qoala, Telkomsel, XL, Indosat */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                              {[
                                { label: "Qoala Protection", filterKey: "QOALA", icon: "🛡️", weight: 0.65 },
                                { label: "Telkomsel Halo/Data", filterKey: "TELKOMSEL", icon: "🔴", weight: 0.15 },
                                { label: "XL Prioritas (MyPrio)", filterKey: "XL", icon: "🔵", weight: 0.12 },
                                { label: "Indosat IM3", filterKey: "INDOSAT", icon: "🟡", weight: 0.08 },
                              ].map((vs, idx) => {
                                const vsItems = staffVasItems.filter((t) => {
                                  const pUpper = (t.productName || "").toUpperCase();
                                  const bUpper = (t.brand || "").toUpperCase();
                                  return bUpper.includes(vs.filterKey) || pUpper.includes(vs.filterKey);
                                });

                                const vsActual = vsItems.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                                const vsTarget = Math.round(targetVas * vs.weight);
                                const vsAchv = calcAchv(vsActual, vsTarget);
                                const vsGap = vsActual - vsTarget;

                                return (
                                  <div key={idx} className={`p-3.5 rounded-xl border ${cardBg} text-xs space-y-2 shadow-sm`}>
                                    <div className="flex justify-between items-center">
                                      <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <span>{vs.icon}</span>
                                        <span>{vs.label}</span>
                                      </span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${vsAchv >= 100 ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/15 text-amber-600 dark:text-amber-400"}`}>
                                        {vsAchv}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 space-y-0.5">
                                      <div><strong>T/A:</strong> {formatIDR(vsTarget)} / <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatIDR(vsActual)}</span></div>
                                      <div><strong>-/+:</strong> <span className={vsGap >= 0 ? "text-emerald-600" : "text-rose-600"}>{vsGap >= 0 ? `+${formatIDR(vsGap)}` : formatIDR(vsGap)}</span></div>
                                      <div><strong>Estimate:</strong> {formatIDR(calcEst(vsActual))}</div>
                                    </div>
                                    <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openLobDetailSheet(`${vs.label} Terjual - ${activeStaff.name}`, vsItems)}
                                        className="text-[10px] font-black text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                      >
                                        <span>More Details</span>
                                        <span>➔</span>
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: DAILY TARGET & RUN RATE PER STAFF */}
              {activeTab === "daily-target" && (
                <div className="space-y-6 sm:space-y-8">
                  {/* RINGKASAN TOKO HARIAN */}
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5 overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>🎯</span>
                          <span>DAILY TARGET &amp; RUN RATE HARIAN (QF01)</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-0.5`}>
                          Tanggal: {selectedDate} • Hari ke-{dailyTargetCalculated.daysPassed} ({dailyTargetCalculated.daysLeft} Hari Tersisa)
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleShareTargetWA}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black transition flex items-center gap-2 border border-slate-700 shadow-md active:scale-95"
                        >
                          <span>📢</span>
                          <span>Share Rekap Toko</span>
                        </button>
                      </div>
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
                          PENCAPAIAN TOKO HARI INI
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                          {formatIDR(dailyTargetCalculated.actualToday)}
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[11px] font-black ${textMuted} uppercase block tracking-wider`}>
                          TARGET IDEAL RUN RATE
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400 mt-1 font-mono">
                          {formatIDR(dailyTargetCalculated.targetPerStaffToday)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DETAIL TARGET VS ACHIEVEMENT PER STAFF */}
                  {(() => {
                  const availableStaffNames = (staffList || [])
  .map((s) => s.name.trim().toLowerCase())
  .filter((name) => !name.includes("admin") && !name.includes("leader") && Boolean(staffDailyTargets[name] || staffDailyTargets[name.split(" ")[0]]));
                    
                    const activeName = selectedDailyStaff || availableStaffNames[0] || "";

                    const targetData: StaffDailyTargetDetail = staffDailyTargets[activeName] || 
                      staffDailyTargets[activeName.split(" ")[0]] || {
                        total: 0,
                        apple: 0,
                        android: 0,
                        accessories: 0,
                        vas: 0,
                      };

                    // Filter transaksi tanggal terpilih untuk staf ini
                    const staffTodayTrx = transactions.filter((t) => {
                      const matchDate = t.isoDate === selectedDate;
                      const sName = (t.salesName || "").trim().toLowerCase();
                      const matchStaff = sName === activeName || sName.includes(activeName) || activeName.includes(sName);
                      return matchDate && matchStaff;
                    });

                    const totalAchv = staffTodayTrx.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

                    const getMetrics = (filterFn: (t: RawTransaction) => boolean) => {
                      const filtered = staffTodayTrx.filter(filterFn);
                      const qty = filtered.reduce((acc, t) => acc + (Number(t.qty) || 1), 0);
                      const amount = filtered.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
                      return { qty, amount };
                    };

                    const appleIphone = getMetrics((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPHONE"));
                    const appleIpad = getMetrics((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPAD"));
                    const appleMac = getMetrics((t) => t.brand === "APPLE" && ((t.productName || "").toUpperCase().includes("MAC") || (t.productName || "").toUpperCase().includes("BOOK")));
                    const appleWatch = getMetrics((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("WATCH"));

                    const androidSamsung = getMetrics((t) => t.brand === "SAMSUNG" && t.groupCategory === "DEVICES");
                    const androidOppo = getMetrics((t) => t.brand === "OPPO" && t.groupCategory === "DEVICES");
                    const androidHuawei = getMetrics((t) => t.brand === "HUAWEI" && t.groupCategory === "DEVICES");
                    const androidXiaomi = getMetrics((t) => (t.brand === "XIAOMI" || t.brand === "REDMI") && t.groupCategory === "DEVICES");
                    const androidMoto = getMetrics((t) => t.brand === "MOTOROLA" && t.groupCategory === "DEVICES");
                    const androidInfinix = getMetrics((t) => t.brand === "INFINIX" && t.groupCategory === "DEVICES");

                    const accTotal = getMetrics((t) => t.groupCategory === "ACCESSORIES");

                    const vasQoala = getMetrics((t) => t.groupCategory === "VAS" && (t.brand === "QOALA" || (t.productName || "").toUpperCase().includes("QOALA") || (t.productName || "").toUpperCase().includes("PROTEKSI")));
                    const vasTsel = getMetrics((t) => t.groupCategory === "VAS" && (t.brand.includes("TELKOMSEL") || (t.productName || "").toUpperCase().includes("TELKOMSEL")));
                    const vasXl = getMetrics((t) => t.groupCategory === "VAS" && (t.brand.includes("XL") || (t.productName || "").toUpperCase().includes("MYPRIO")));
                    const vasIsat = getMetrics((t) => t.groupCategory === "VAS" && (t.brand.includes("INDOSAT") || (t.productName || "").toUpperCase().includes("INDOSAT")));

                    const displayName = activeName.toUpperCase();

                    return (
                      <div className={`p-5 sm:p-7 ${cardBg} border-2 rounded-3xl shadow-2xl space-y-6`}>
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-inherit">
                          <div>
                            <span className="text-xs font-black uppercase tracking-wider text-sky-600 dark:text-sky-400 block">
                              Target &amp; Realisasi Per Staf
                            </span>
                            <h3 className="text-xl font-black text-slate-950 dark:text-white mt-1">
                              - Daily Target -
                            </h3>
                            <h4 className="text-lg font-black text-slate-800 dark:text-slate-200 mt-0.5">
                              {displayName}
                            </h4>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                              <span className="text-xs font-bold text-slate-500">Pilih Staf:</span>
                              <select
                                value={activeName}
                                onChange={(e) => setSelectedDailyStaff(e.target.value)}
                                className="bg-transparent font-black text-xs text-slate-900 dark:text-white focus:outline-none cursor-pointer uppercase"
                              >
                                {availableStaffNames.map((name) => (
                                  <option key={name} value={name} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>
                                    {name.toUpperCase()}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleShareDailyTargetStaffWA(displayName, targetData, staffTodayTrx)}
                              className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                            >
                              <span>📲</span>
                              <span>Share WA Daily Target</span>
                            </button>
                          </div>
                        </div>

                        {/* TOTAL TARGET */}
                        <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-3`}>
                          <div className="flex justify-between items-center pb-2 border-b border-inherit/40">
                            <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              Target Harian (Catch-up Sheet)
                            </span>
                            <strong className="text-sm sm:text-base font-black font-mono text-slate-950 dark:text-white">
                              Total Target : {formatIDR(targetData.total)}
                            </strong>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div className={`p-3 rounded-xl border ${cardBg}`}>
                              <span className="text-slate-500 block text-[11px] font-bold">Apple Devices :</span>
                              <strong className="text-sky-600 dark:text-sky-400 font-black font-mono text-xs sm:text-sm">
                                {formatIDR(targetData.apple)}
                              </strong>
                            </div>
                            <div className={`p-3 rounded-xl border ${cardBg}`}>
                              <span className="text-slate-500 block text-[11px] font-bold">Android Device :</span>
                              <strong className="text-indigo-600 dark:text-indigo-400 font-black font-mono text-xs sm:text-sm">
                                {formatIDR(targetData.android)}
                              </strong>
                            </div>
                            <div className={`p-3 rounded-xl border ${cardBg}`}>
                              <span className="text-slate-500 block text-[11px] font-bold">Accessories :</span>
                              <strong className="text-amber-600 dark:text-amber-400 font-black font-mono text-xs sm:text-sm">
                                {formatIDR(targetData.accessories)}
                              </strong>
                            </div>
                            <div className={`p-3 rounded-xl border ${cardBg}`}>
                              <span className="text-slate-500 block text-[11px] font-bold">VAS :</span>
                              <strong className="text-purple-600 dark:text-purple-400 font-black font-mono text-xs sm:text-sm">
                                {formatIDR(targetData.vas)}
                              </strong>
                            </div>
                          </div>
                        </div>

                        {/* TOTAL ACHIEVEMENT */}
                        <div className="space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-inherit/40">
                            <h4 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white flex items-center gap-2">
                              <span>📦</span>
                              <span>Total Achievement :</span>
                            </h4>
                            <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                              {formatIDR(totalAchv)}
                            </span>
                          </div>

                          {/* 1. Apple Devices */}
                          <div className={`p-4 rounded-2xl border ${innerBg} space-y-2.5`}>
                            <span className="text-xs font-black text-sky-600 dark:text-sky-400 flex items-center gap-1.5 uppercase">
                              <span>🍎</span> 1. Apple Devices :
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-semibold">
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- iPhone :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{appleIphone.qty} / {formatIDR(appleIphone.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- iPad :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{appleIpad.qty} / {formatIDR(appleIpad.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- MacBook :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{appleMac.qty} / {formatIDR(appleMac.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- Apple Watch :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{appleWatch.qty} / {formatIDR(appleWatch.amount)}</strong>
                              </div>
                            </div>
                          </div>

                          {/* 1. Android Device */}
                          <div className={`p-4 rounded-2xl border ${innerBg} space-y-2.5`}>
                            <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5 uppercase">
                              <span>🤖</span> 1. Android Device :
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-semibold">
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- Samsung :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{androidSamsung.qty} / {formatIDR(androidSamsung.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- Oppo :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{androidOppo.qty} / {formatIDR(androidOppo.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- Huawei :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{androidHuawei.qty} / {formatIDR(androidHuawei.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- Xiaomi :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{androidXiaomi.qty} / {formatIDR(androidXiaomi.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- Motorola :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{androidMoto.qty} / {formatIDR(androidMoto.amount)}</strong>
                              </div>
                              <div className={`p-2.5 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                <span className="text-slate-700 dark:text-slate-300">- Infinix :</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{androidInfinix.qty} / {formatIDR(androidInfinix.amount)}</strong>
                              </div>
                            </div>
                          </div>

                          {/* 1. Accessories & 2. VAS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className={`p-4 rounded-2xl border ${innerBg} space-y-2.5`}>
                              <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 uppercase">
                                <span>🔌</span> 1. Accessories :
                              </span>
                              <div className={`p-3 rounded-xl border ${cardBg} flex justify-between items-center text-xs font-semibold`}>
                                <span className="text-slate-700 dark:text-slate-300">Total Accessories Terjual:</span>
                                <strong className="font-mono text-slate-950 dark:text-white">{accTotal.qty} Unit / {formatIDR(accTotal.amount)}</strong>
                              </div>
                            </div>

                            <div className={`p-4 rounded-2xl border ${innerBg} space-y-2.5`}>
                              <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1.5 uppercase">
                                <span>🛡️</span> 2. VAS :
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                                <div className={`p-2 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                  <span className="text-slate-700 dark:text-slate-300">- Qoala :</span>
                                  <strong className="font-mono text-slate-950 dark:text-white">{vasQoala.qty} / {formatIDR(vasQoala.amount)}</strong>
                                </div>
                                <div className={`p-2 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                  <span className="text-slate-700 dark:text-slate-300">- Telkomsel :</span>
                                  <strong className="font-mono text-slate-950 dark:text-white">{vasTsel.qty} / {formatIDR(vasTsel.amount)}</strong>
                                </div>
                                <div className={`p-2 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                  <span className="text-slate-700 dark:text-slate-300">- Xl :</span>
                                  <strong className="font-mono text-slate-950 dark:text-white">{vasXl.qty} / {formatIDR(vasXl.amount)}</strong>
                                </div>
                                <div className={`p-2 rounded-xl border ${cardBg} flex justify-between items-center`}>
                                  <span className="text-slate-700 dark:text-slate-300">- Indosat :</span>
                                  <strong className="font-mono text-slate-950 dark:text-white">{vasIsat.qty} / {formatIDR(vasIsat.amount)}</strong>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              <button
  onClick={() => setActiveTab("brand-focus")}
  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
    activeTab === "brand-focus"
      ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60"
  }`}
>
  <span className="text-base">🏷️</span>
  <span>Brand Focus</span>
</button>
              {/* ========================================================= */}
{/* TAB: BRAND FOCUS (SUPPLIER DINO, IGA, MEDPOIN, HASTAG, IBACKS, KAIZEN) */}
{/* ========================================================= */}
{activeTab === "brand-focus" && (() => {
  const TARGET_SUPPLIERS = ["DINO", "IGA", "MEDPOIN", "HASTAG", "IBACKS", "KAIZEN"];

  // 1. Filter transaksi berdasarkan periode aktif (Daily / Weekly / Monthly)
  const currentFilteredTrx = (typeof filteredTrx !== "undefined" ? filteredTrx : transactions) || [];

  // 2. Hitung total pencapaian Accessories secara keseluruhan pada periode ini untuk kalkulasi kontribusi (%)
  const totalAccAmount = currentFilteredTrx
    .filter((t) => t.groupCategory === "ACCESSORIES" || (t.brand || "").includes("ACC"))
    .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

  // 3. Normalisasi & kelompokkan transaksi supplier fokus
  const supplierDataMap: Record<string, { qty: number; amount: number; items: RawTransaction[] }> = {};
  TARGET_SUPPLIERS.forEach((sup) => {
    supplierDataMap[sup] = { qty: 0, amount: 0, items: [] };
  });

  currentFilteredTrx.forEach((t) => {
    const rawSup = (t.supplier || "").toUpperCase();
    const matchedSup = TARGET_SUPPLIERS.find((s) => rawSup.includes(s));
    if (matchedSup) {
      supplierDataMap[matchedSup].qty += Number(t.qty) || 1;
      supplierDataMap[matchedSup].amount += Number(t.amount) || 0;
      supplierDataMap[matchedSup].items.push(t);
    }
  });

  // 4. Hitung rincian per staf untuk masing-masing supplier
  const staffSupplierMap: Record<string, Record<string, { qty: number; amount: number }>> = {};
  currentFilteredTrx.forEach((t) => {
    const sName = (t.salesName || "").trim().toUpperCase();
    const rawSup = (t.supplier || "").toUpperCase();
    const matchedSup = TARGET_SUPPLIERS.find((s) => rawSup.includes(s));

    if (sName && matchedSup) {
      if (!staffSupplierMap[sName]) {
        staffSupplierMap[sName] = {};
        TARGET_SUPPLIERS.forEach((s) => {
          staffSupplierMap[sName][s] = { qty: 0, amount: 0 };
        });
      }
      staffSupplierMap[sName][matchedSup].qty += Number(t.qty) || 1;
      staffSupplierMap[sName][matchedSup].amount += Number(t.amount) || 0;
    }
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* HEADER SECTION & PERIODE INFO */}
      <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl flex flex-wrap justify-between items-center gap-4`}>
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-500 block">
            Supplier Monitoring &amp; Contribution
          </span>
          <h2 className="text-lg sm:text-2xl font-black text-slate-950 dark:text-white mt-0.5 flex items-center gap-2">
            <span>🏷️</span>
            <span>BRAND FOCUS ACCESSORIES</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Data penjualan supplier: DINO, IGA, MEDPOIN, HASTAG, IBACKS, KAIZEN (Filter: {timeFilter.toUpperCase()})
          </p>
        </div>

        <div className={`px-4 py-2.5 rounded-2xl border ${innerBg} text-right`}>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
            Total Achievement Accessories
          </span>
          <span className="text-base sm:text-lg font-black font-mono text-amber-600 dark:text-amber-400">
            {formatIDR(totalAccAmount)}
          </span>
        </div>
      </div>

      {/* 1. CUPCARDS PALING ATAS (6 KARTU SUPPLIER) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {TARGET_SUPPLIERS.map((sup) => {
          const s = supplierDataMap[sup];
          const contribPercent = totalAccAmount > 0 ? ((s.amount / totalAccAmount) * 100).toFixed(1) : "0.0";

          return (
            <div
              key={sup}
              className={`p-4 rounded-2xl border-2 ${cardBg} hover:border-amber-500/50 transition-all shadow-md relative overflow-hidden`}
            >
              <div className="flex justify-between items-center mb-1.5">
                <h3 className="font-black text-sm text-slate-900 dark:text-white tracking-wide">
                  {sup}
                </h3>
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  {contribPercent}%
                </span>
              </div>
              <div className="text-xs text-slate-500 font-bold">Qty: <span className="font-mono text-slate-900 dark:text-white">{s.qty} Unit</span></div>
              <div className="text-xs sm:text-sm font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                {formatIDR(s.amount)}
              </div>
              <div className="text-[9px] text-slate-400 mt-1 font-semibold">
                Kontribusi Sales Acc
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DETAIL PER SUPPLIER (DINO, IGA, HASTAG, MEDPOIN, IBACKS, KAIZEN) */}
      <div className="space-y-5">
        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <span>📋</span>
          <span>Rincian Transaksi Produk Per Supplier</span>
        </h3>

        <div className="grid grid-cols-1 gap-5">
          {TARGET_SUPPLIERS.map((sup, idx) => {
            const s = supplierDataMap[sup];
            const contrib = totalAccAmount > 0 ? ((s.amount / totalAccAmount) * 100).toFixed(1) : "0.0";

            return (
              <div key={sup} className={`p-5 rounded-3xl border-2 ${cardBg} shadow-lg space-y-4`}>
                <div className="flex flex-wrap justify-between items-center pb-3 border-b border-inherit gap-3">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {idx + 1}. {sup}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Total: <strong className="font-mono text-slate-900 dark:text-white">{s.qty} Unit</strong> / <strong className="font-mono text-amber-600 dark:text-amber-400">{formatIDR(s.amount)}</strong> • Kontribusi Acc: <strong className="text-amber-500">{contrib}%</strong>
                    </span>
                  </div>
                </div>

                {/* TABEL DETAIL BARANG TERJUAL */}
                {s.items.length === 0 ? (
                  <div className={`p-4 rounded-xl text-center text-xs font-semibold text-slate-400 ${innerBg}`}>
                    Belum ada penjualan untuk supplier {sup} pada periode ini.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-inherit">
                    <table className="w-full text-left text-xs">
                      <thead className={`text-[10px] uppercase font-black tracking-wider ${innerBg} text-slate-500`}>
                        <tr>
                          <th className="p-2.5">Tanggal</th>
                          <th className="p-2.5">Invoice</th>
                          <th className="p-2.5">Nama Produk</th>
                          <th className="p-2.5">Nama Staff</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Value (Amount)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {s.items.map((item, itemIdx) => (
                          <tr key={itemIdx} className="hover:bg-slate-500/5 transition">
                            <td className="p-2.5 font-mono text-slate-500">{item.isoDate || item.date}</td>
                            <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">{item.invoiceNo || "-"}</td>
                            <td className="p-2.5 font-bold text-slate-900 dark:text-white">{item.productName}</td>
                            <td className="p-2.5 uppercase font-semibold text-sky-600 dark:text-sky-400">{item.salesName || "-"}</td>
                            <td className="p-2.5 text-center font-mono font-bold">{item.qty || 1}</td>
                            <td className="p-2.5 text-right font-mono font-black text-amber-600 dark:text-amber-400">
                              {formatIDR(item.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. PENJUALAN PER STAFF */}
      <div className={`p-5 sm:p-7 rounded-3xl border-2 ${cardBg} shadow-xl space-y-6`}>
        <div className="border-b border-inherit pb-3">
          <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>👤</span>
            <span>Penjualan Supplier Per Staff</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencapaian penjualan masing-masing brand focus per anggota staf
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.keys(staffSupplierMap).length === 0 ? (
            <div className={`col-span-full p-4 rounded-xl text-center text-xs text-slate-400 ${innerBg}`}>
              Tidak ada data penjualan staf untuk brand focus pada periode ini.
            </div>
          ) : (
            Object.entries(staffSupplierMap).map(([staffName, sups]) => {
              const staffTotalAmt = Object.values(sups).reduce((a, b) => a + b.amount, 0);
              const staffTotalQty = Object.values(sups).reduce((a, b) => a + b.qty, 0);

              return (
                <div key={staffName} className={`p-4 rounded-2xl border ${innerBg} space-y-3`}>
                  <div className="flex justify-between items-center pb-2 border-b border-inherit">
                    <span className="font-black text-sm uppercase text-slate-900 dark:text-white">
                      {staffName}
                    </span>
                    <span className="text-xs font-mono font-black text-amber-600 dark:text-amber-400">
                      {staffTotalQty} Unit / {formatIDR(staffTotalAmt)}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {TARGET_SUPPLIERS.map((sup) => (
                      <div key={sup} className="flex justify-between items-center py-0.5">
                        <span className="text-slate-500 font-bold">{sup} :</span>
                        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {sups[sup]?.qty || 0} Unit / {formatIDR(sups[sup]?.amount || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
})()}

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

              {/* TAB 6: FEEDBACK TIM */}
              {activeTab === "feedback" && (
                <div className="space-y-6">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5 overflow-hidden`}>
                    <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                      <span>💬</span>
                      <span>Riwayat Feedback Penjualan Tim</span>
                    </h2>
                    <div className="space-y-3">
                      {feedbacks.map((fb) => (
                        <div key={fb.id} className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                          <div className="flex justify-between items-center">
                            <span className="font-black text-sm text-slate-900 dark:text-white">{fb.salesName}</span>
                            <span className="text-xs text-slate-500">{fb.timestamp}</span>
                          </div>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">{fb.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 7: BNPL TRANSACTIONS */}
              {activeTab === "bnpl" && (
                <div className="space-y-6">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4 overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>💳</span>
                          <span>TRANSAKSI PEMBIAYAAN KONSUMEN (BNPL)</span>
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-400/30">
                          Total BNPL: {formatIDR(bnplSummary.totalAmount)}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-500/15 text-sky-800 dark:text-sky-400 border border-sky-400/30">
                          {bnplSummary.totalQty} Unit
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                      {bnplSummary.tenders.map((td, idx) => (
                        <div key={idx} className={`p-3.5 rounded-2xl border ${innerBg}`}>
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{td.tender}</span>
                          <div className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">{formatIDR(td.amount)}</div>
                          <span className="text-[11px] text-slate-500 block">{td.qty} Transaksi ({td.share}% Share)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: SALES DETAIL LOG */}
              {activeTab === "sales-detail" && (
                <div className="space-y-4">
                  <div className={`p-4 sm:p-6 ${cardBg} border rounded-3xl overflow-x-auto w-full shadow-xl`}>
                    <h3 className="text-base font-black mb-4 text-slate-950 dark:text-white">Rincian Transaksi Log (50 Terkini)</h3>
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className={`${innerBg} uppercase text-[11px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                        <tr>
                          <th className="p-3">Tanggal</th>
                          <th className="p-3">No. Invoice</th>
                          <th className="p-3">Salesperson</th>
                          <th className="p-3">Nama Produk</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-bold">
                        {activeTransactions.slice(0, 50).map((t, idx) => (
                          <tr key={idx} className="hover:opacity-90">
                            <td className="p-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">{t.date}</td>
                            <td className="p-3 font-mono font-black text-sky-600 dark:text-sky-400">{t.invoice}</td>
                            <td className="p-3 font-black text-slate-950 dark:text-white">{t.salesName}</td>
                            <td className="p-3 text-slate-900 dark:text-white">{t.productName}</td>
                            <td className="p-3 text-center text-amber-600 font-mono">{t.qty}</td>
                            <td className="p-3 text-right font-black text-emerald-600 font-mono">{formatIDR(t.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 9: CARI PRODUK TERJUAL */}
              {activeTab === "product-search" && (
                <div className="space-y-6">
                  <div className={`p-6 ${cardBg} border rounded-2xl shadow-xl space-y-4`}>
                    <h2 className="text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                      <span>🔍</span> PENCARIAN PRODUK TERJUAL
                    </h2>
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Ketik kode artikel SAP atau nama produk..."
                      className={`w-full p-3.5 pl-4 rounded-xl ${innerBg} border text-sm font-bold focus:outline-none focus:border-sky-400 text-slate-950 dark:text-white`}
                    />
                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs min-w-[600px]">
                        <thead className={`${innerBg} uppercase text-[10px] font-black border-b border-inherit`}>
                          <tr>
                            <th className="p-3">Tanggal</th>
                            <th className="p-3">Invoice</th>
                            <th className="p-3">Produk</th>
                            <th className="p-3 text-center">Qty</th>
                            <th className="p-3 text-right">Nominal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit">
                          {activeTransactions
                            .filter((t) => t.productName.toLowerCase().includes(productSearchQuery.toLowerCase()) || t.sapArticle.includes(productSearchQuery))
                            .slice(0, 30)
                            .map((t, idx) => (
                              <tr key={idx} className="hover:opacity-90">
                                <td className="p-3 font-mono">{t.date}</td>
                                <td className="p-3 font-mono text-sky-600 font-bold">{t.invoice}</td>
                                <td className="p-3 font-bold">{t.productName}</td>
                                <td className="p-3 text-center text-amber-500 font-bold">{t.qty}</td>
                                <td className="p-3 text-right font-mono font-black text-emerald-600">{formatIDR(t.amount)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Action Button (FAB) Mobile di Pojok Kanan Bawah */}
      <button
        type="button"
        onClick={() => setMobileDrawerOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl bg-sky-500 hover:bg-sky-400 active:scale-95 text-white shadow-xl shadow-sky-500/40 border border-sky-400/30 flex flex-col items-center justify-center gap-0.5 transition-all duration-200"
        aria-label="Buka Menu Navigasi"
      >
        <span className="text-xl leading-none">☰</span>
        <span className="text-[10px] font-black uppercase tracking-wider leading-none">Menu</span>
      </button>

      {/* BOTTOM SHEET MODAL DRILLDOWN */}
      {bottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in overflow-hidden p-0 sm:p-4">
          <div className={`w-full sm:max-w-3xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl ${cardBg} border-2 border-inherit shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300`}>
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
