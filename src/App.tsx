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
        const scriptUrl = "https://script.google.com/macros/s/AKfycbymMye32fTgxNg4rKtLn5iqVWq4xenaZSJ2bxGW4yfZdMYoYKRbXYYCKrx1n_Uul_JNdw/exec";

        await fetch(scriptUrl, {
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
      <div className="w-full max-w-md rounded-3xl bg-[#09122A] border border-white/15 p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-sm font-black text-white">Upload Bukti Transaksi (RAW SalesPerson)</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xs font-bold p-1">✕</button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-200 block mb-1">Pilih File / Foto Bukti:</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-200 font-semibold file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-sky-600 file:text-white file:font-bold"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-200 block mb-1">Catatan Tambahan (Kolom O):</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan / keterangan..."
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
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

// =========================================================================
// 1. DATA CONTRACTS & INTERFACES
// =========================================================================

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

interface SubCategoryMetric {
  name: string;
  icon: string;
  qty: number;
  actual: number;
}

interface StaffPerformanceData {
  rank: number;
  salesId: string;
  name: string;
  initials: string;
  actual: number;
  target: number;
  achievement: number;
  variance: number;
  estimate: number;
  invoicesCount: number;
  qty: number;
  upt: number;
  totalAccActual: number;
  targetAcc: number;
  achvAcc: number;
  totalVasActual: number;
  targetVas: number;
  achvVas: number;
  status: "Tercapai" | "Perlu Perhatian Khusus" | "Dalam Pantauan";
  ringkasan: string;
  rekomendasi: string;
  appleSub: SubCategoryMetric[];
  androidSub: SubCategoryMetric[];
  accessoriesSub: SubCategoryMetric[];
  vasSub: SubCategoryMetric[];
  weekSales: Record<string, number>;
  rawItems: RawTransaction[];
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
  staffName?: string;
  name?: string;
  salesRole: string;
  initials: string;
  sentiment: "Luar Biasa" | "Cukup Baik" | "Kecewa";
  timestamp: string;
  text: string;
  content?: string;
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
  },
  {
    id: "fb-3",
    salesName: "Surya Adi Permana",
    salesRole: "Sales Assistant",
    initials: "SA",
    sentiment: "Cukup Baik",
    timestamp: "Hari ini, 11:20 WIB",
    text: "Pelayanan sangat ramah dan sabar saat menjelaskan perbandingan spesifikasi tablet. Direkomendasikan untuk lebih aktif menawarkan simulasi cicilan 0%.",
    reactions: { thumbsUp: 4, heart: 1, fire: 2, thumbsDown: 0, sad: 0 },
    userReactions: [],
  },
  {
    id: "fb-4",
    salesName: "Siti Amelia",
    salesRole: "Sales Assistant",
    initials: "SA",
    sentiment: "Luar Biasa",
    timestamp: "Kemarin, 19:10 WIB",
    text: "Penyampaian promo cashback bank partner sangat jelas, customer terdorong menambah pembelian tempered glass dan proteksi layar tambahan.",
    reactions: { thumbsUp: 5, heart: 2, fire: 3, thumbsDown: 0, sad: 0 },
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

  // Live Spreadsheet Data
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [bnplRecords, setBnplRecords] = useState<BnplRecord[]>([]);
  const [scheduleData, setScheduleData] = useState<StaffScheduleItem[]>(INITIAL_SCHEDULE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");

  // Period Filters
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>("Oktober2026");
  const [momBaseMonth, setMomBaseMonth] = useState<string>("Oktober2026");
  const [momCompareMonth, setMomCompareMonth] = useState<string>("Agustus2026");
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");

  // Bottom Sheet Drawer State
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);

  // BNPL Tab Filter
  const [selectedBnplTender, setSelectedBnplTender] = useState<string>("ALL");

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(DEFAULT_FEEDBACKS);
  const [selectedFeedbackStaff, setSelectedFeedbackStaff] = useState<string>("ALL");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [newFeedbackStaff, setNewFeedbackStaff] = useState<string>("Liesbeth Febrina");
  const [newFeedbackSentiment, setNewFeedbackSentiment] = useState<"Luar Biasa" | "Cukup Baik" | "Kecewa">("Luar Biasa");
  const [newFeedbackText, setNewFeedbackText] = useState<string>("");

  // PPTX Exporting State
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  // Admin Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

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

      const [resDb, resBnpl] = await Promise.all([fetch(dbUrl), fetch(bnplUrl)]);
      const textDb = await resDb.text();
      const textBnpl = await resBnpl.text();

      const sDb = textDb.indexOf("{");
      const eDb = textDb.lastIndexOf("}") + 1;
      const jsonDb = JSON.parse(textDb.substring(sDb, eDb));
      const rowsDb = jsonDb.table.rows;

      const parsedTrx: RawTransaction[] = [];
      rowsDb.forEach((r: any) => {
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
          // Tetap DEVICES
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

      const sBnpl = textBnpl.indexOf("{");
      const eBnpl = textBnpl.lastIndexOf("}") + 1;
      const jsonBnpl = JSON.parse(textBnpl.substring(sBnpl, eBnpl));
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
          parsedBnpl.push({ date: String(date), invoice, amount, tender, product, qty, month });
        }
      });

      setTransactions(parsedTrx);
      setBnplRecords(parsedBnpl);
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
      const savedSchedule = localStorage.getItem("digi_ops_schedule");
      const savedFeedbacks = localStorage.getItem("digi_ops_feedbacks");

      if (savedTheme) setTheme(savedTheme);
      if (savedSchedule) {
        try { setScheduleData(JSON.parse(savedSchedule)); } catch (e) {}
      }
      if (savedFeedbacks) {
        try { 
          const parsed = JSON.parse(savedFeedbacks);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFeedbacks(parsed);
          } else {
            setFeedbacks(DEFAULT_FEEDBACKS);
          }
        } catch (e) {
          setFeedbacks(DEFAULT_FEEDBACKS);
        }
      }
      if (savedUser) {
        setIsLoggedIn(true);
        setCurrentSalesId(savedUser);
        setCurrentSalesName(savedName || `Sales ${savedUser}`);
      }
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("digi_ops_theme", next);
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

  // =========================================================================
  // KONFIGURASI TEMA: SIDEBAR TETAP GELAP / NAVY, BODY PUTIH BERSIH DI LIGHT MODE
  // =========================================================================
  const isDark = theme === "dark";

  // Background Body Utama: Putih Murni di Light Mode, Deep Navy di Dark Mode
  const bgMain = isDark 
    ? "bg-[#0A1128] bg-gradient-to-br from-[#070D1E] via-[#0A1128] to-[#0F1B3D]" 
    : "bg-white";

  // Tipografi: Hitam Pekat di Light Mode, Terang di Dark Mode
  const textMain = isDark ? "text-slate-100 font-bold" : "text-black font-black";
  const textMuted = isDark ? "text-slate-300 font-semibold" : "text-slate-800 font-bold";

  // Kartu Konten
  const cardBg = isDark 
    ? "bg-[#0E1A38]/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.35)]" 
    : "bg-white border border-slate-200 shadow-sm";

  // Sub-card / Container Dalam
  const innerBg = isDark 
    ? "bg-[#14234B]/60 backdrop-blur-md border border-white/10" 
    : "bg-slate-50 border border-slate-200";

  const accentText = isDark ? "text-sky-400 font-black" : "text-blue-700 font-black";
  const activeTabBtn = isDark 
    ? "bg-sky-500 text-white font-black shadow-lg shadow-sky-500/30 border border-sky-400/40" 
    : "bg-blue-600 text-white font-black shadow-md shadow-blue-600/20";

  // Sidebar Kiri & Bottom Bar HP: Selalu Gelap Eksklusif di Kedua Mode
  const glassSidebar = isDark
    ? "bg-[#09122A]/95 border-white/10 text-slate-100"
    : "bg-[#0F172A] border-slate-800 text-slate-100";

  const glassBottomBar = isDark
    ? "bg-[#0A1128]/95 border-white/10 text-slate-100"
    : "bg-[#0F172A]/95 border-slate-800 text-slate-100";

  const mainNavItems = [
    { id: "store-overview", label: "Overview Store", icon: "📊" },
    { id: "weekly-sales", label: "Weekly Sales (WoW)", icon: "📈" },
    { id: "mom-comparison", label: "MoM Growth Analysis", icon: "⚖️" },
    { id: "staff-performance", label: "Staff Performance", icon: "🏆" },
    { id: "daily-target", label: "Daily Target & Run Rate", icon: "🎯" },
    { id: "schedule", label: "Jadwal Shift 1 Minggu", icon: "📅" },
    { id: "feedback", label: "Feedback Ritel Tim", icon: "💬" },
    { id: "bnpl", label: "BNPL Transactions", icon: "💳" },
    { id: "product-search", label: "Cari Produk Terjual", icon: "🔍" },
    { id: "sales-detail", label: "Rincian Transaksi Log", icon: "📋" },
  ];

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
    <div className={`min-h-screen flex ${bgMain} ${textMain} font-sans antialiased overflow-x-hidden w-full max-w-full relative`}>
      
      {/* 1. SIDEBAR DESKTOP (TETAP GELAP / NAVY EXCLUSIVE) */}
      <aside
        className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 h-screen sticky top-0 shrink-0 border-r z-30 transition-all ${glassSidebar}`}
      >
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-black text-base flex items-center justify-center shadow-lg shadow-sky-500/20">
              QF01
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wider leading-none text-white">DIGIPLUS</h1>
              <p className="text-[11px] text-sky-400 font-black mt-1">GRAND INDONESIA</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl border bg-white/5 border-white/10 flex items-center justify-between shadow-sm">
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider truncate">Masuk sebagai</span>
              <span className="text-xs font-black block truncate text-white">{currentSalesName}</span>
              <span className="text-[10px] font-mono font-bold text-sky-400">ID: {currentSalesId}</span>
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                    active
                      ? activeTabBtn
                      : "font-bold text-slate-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}

            <div className="pt-2">
              <button
                onClick={handleExportToPptx}
                disabled={isExportingPptx}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 border border-sky-500/40 text-sky-400 font-black text-xs shadow-md transition active:scale-95"
              >
                <span>📽️</span>
                <span className="truncate font-black">{isExportingPptx ? "Membuat Slide..." : "Export ke Slide PPTX"}</span>
              </button>
            </div>

            <button
              onClick={() => setUploadModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-slate-300 hover:text-white hover:bg-white/10"
            >
              <span>📤</span>
              <span>Upload Bukti RAW</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-white/10 space-y-2 shrink-0">
            <button
              onClick={toggleTheme}
              className="w-full py-2 px-3 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs font-black flex items-center justify-center gap-2 transition"
            >
              <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-black flex items-center justify-center gap-2 transition"
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
        className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 max-w-[80vw] z-50 transform transition-transform duration-300 ease-in-out border-r p-5 flex flex-col justify-between print:hidden ${glassSidebar} ${
          mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black text-sm flex items-center justify-center">
                QF01
              </div>
              <span className="font-black text-sm text-white">DIGIPLUS GI</span>
            </div>
            <button
              onClick={() => setMobileDrawerOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white"
            >
              ✕
            </button>
          </div>

          <nav className="mt-4 space-y-1 overflow-y-auto max-h-[60vh] pr-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as MenuTab);
                  setMobileDrawerOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  activeTab === item.id
                    ? activeTabBtn
                    : "text-slate-300 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}

            <button
              onClick={() => { setUploadModalOpen(true); setMobileDrawerOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white"
            >
              <span>📤</span>
              <span>Upload Bukti RAW</span>
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={toggleTheme}
            className="w-full py-2 px-3 rounded-xl border bg-white/5 border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2"
          >
            <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black flex items-center justify-center gap-2"
          >
            <span>🚪 Keluar</span>
          </button>
        </div>
      </div>

      {/* 3. AREA KONTEN UTAMA (BODY LEBAR PENUH & FIT DENGAN PERANGKAT) */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden pb-24 lg:pb-8">
        
        {/* Top Header Mobile */}
        <div className={`lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-20 print:hidden ${glassSidebar}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center">
              QF01
            </div>
            <div>
              <h2 className="text-xs font-black leading-none text-white">DIGIPLUS GI</h2>
              <span className="text-[10px] text-sky-400 font-bold">{currentSalesName}</span>
            </div>
          </div>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/10 text-sky-400 border border-sky-400/30 text-xs font-black flex items-center gap-1.5"
          >
            <span>☰</span>
            <span>Menu</span>
          </button>
        </div>

        {/* Main Content Body */}
        <main className="p-3 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto flex-1 overflow-x-hidden">
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
                  isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-950 border-emerald-300"
                }`}>
                  Actual: {formatIDR(overviewStats.actual)}
                </span>
              </div>
            </div>

            <div className={`p-3 ${cardBg} border rounded-2xl flex flex-wrap items-center gap-3 justify-between text-xs font-bold`}>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-xl">
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
                          <h2 className="text-base font-black tracking-wide text-slate-950 dark:text-white">TIME GONE ANALYTICS (OKTOBER 2026)</h2>
                          <p className={`text-xs ${textMuted}`}>
                            Hari Berjalan: <strong className={textMain}>24 hari</strong> dari 31 hari (7 hari tersisa)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-black text-slate-600 dark:text-slate-400 block">Time Elapsed</span>
                          <span className={`text-2xl font-black ${accentText}`}>77.4%</span>
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
                          <span className={`font-black ${accentText}`}>77.4%</span>
                        </div>
                        <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                          <div className="bg-sky-500 h-full rounded-full" style={{ width: "77.4%" }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className={textMuted}>Pencapaian Omset Terfilter:</span>
                          <span className="font-black text-emerald-700 dark:text-emerald-500">{overviewStats.achv}% ({formatIDR(overviewStats.actual)})</span>
                        </div>
                        <div className={`w-full ${innerBg} h-2.5 rounded-full overflow-hidden`}>
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(overviewStats.achv, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-4 border-t border-inherit text-xs">
                      <div className={`p-3 ${innerBg} rounded-xl border`}>
                        <span className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">Kesenjangan Pace:</span>
                        <div className="text-sm font-black text-rose-600 mt-0.5">-{(77.4 - overviewStats.achv).toFixed(1)}%</div>
                      </div>
                      <div className={`p-3 ${innerBg} rounded-xl border`}>
                        <span className="text-slate-700 dark:text-slate-300 text-[11px] font-bold">Daily Run Rate Aktual:</span>
                        <div className="text-sm font-black text-sky-700 dark:text-sky-400 mt-0.5">{formatIDR(Math.round(overviewStats.actual / 24))} / hari</div>
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
                        <p className={`text-xs ${textMuted} mt-0.5`}>Perbandingan omset harian terhadap target flat {formatIDR(Math.round(8728667173 / 31))}/hari</p>
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

                  <div className="overflow-hidden">
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-base font-black text-slate-950 dark:text-white">Matriks Kategori Produk ({periodType.toUpperCase()})</h2>
                      <span className={`text-[11px] ${textMuted} hidden sm:inline`}>Apple Murni Hardware • Android Devices Termasuk Xiaomi</span>
                    </div>

                    <div className={`${cardBg} border rounded-2xl overflow-x-auto w-full shadow-xl`}>
                      <table className="w-full text-left text-xs min-w-[650px]">
                        <thead className={`${innerBg} uppercase text-[11px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="py-4 px-4 font-black">Kategori Produk</th>
                            <th className="py-4 px-4 text-right font-black">Actual Sales</th>
                            <th className="py-4 px-4 text-right font-black">Target</th>
                            <th className="py-4 px-4 text-center font-black">Achv (%)</th>
                            <th className="py-4 px-4 text-right font-black">Variance</th>
                            <th className="py-4 px-4 text-right font-black">Estimate</th>
                            <th className="py-4 px-4 text-center font-black">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-bold">
                          {overviewStats.lobs.map((row, idx) => (
                            <tr key={idx} className="hover:opacity-90 transition">
                              <td className="py-4 px-4 font-black text-sm text-slate-950 dark:text-white">
                                <span className="mr-2">{row.icon}</span>
                                <span>{row.name}</span>
                              </td>
                              <td className={`py-4 px-4 text-right font-black text-sm font-mono ${row.color}`}>{formatIDR(row.actual)}</td>
                              <td className="py-4 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-300">{formatIDR(row.target)}</td>
                              <td className="py-4 px-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${innerBg} text-slate-950 dark:text-white`}>
                                  {row.achv}%
                                </span>
                              </td>
                              <td className={`py-4 px-4 text-right font-mono font-black ${row.variance >= 0 ? "text-emerald-700 dark:text-emerald-500" : "text-rose-600"}`}>
                                {formatIDR(row.variance)}
                              </td>
                              <td className="py-4 px-4 text-right text-emerald-700 dark:text-emerald-500 font-mono font-black">{formatIDR(row.estimate)}</td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => {
                                    const targetItems = row.name.includes("Apple")
                                      ? overviewStats.appleItems
                                      : row.name.includes("Android")
                                      ? overviewStats.androidItems
                                      : row.name.includes("Accessories")
                                      ? overviewStats.accItems
                                      : overviewStats.vasItems;
                                    openLobDetailSheet(row.name, targetItems);
                                  }}
                                  className={`px-3 py-1 rounded-xl text-xs font-black transition ${activeTabBtn}`}
                                >
                                  Detail
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: WEEKLY SALES */}
              {activeTab === "weekly-sales" && (
                <div className="space-y-6 sm:space-y-8">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4 overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>📈</span>
                          <span>WEEKLY SALES & WEEK-OVER-WEEK (WOW) DARI DATABASE KOLOM O</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-1 font-semibold`}>
                          Mendeteksi seluruh minggu otomatis dari Kolom O sheet <code>DATABASE</code>.
                        </p>
                      </div>

                      <button
                        onClick={handleShareDaily}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                      >
                        <span>📲</span>
                        <span>Share Rekap Mingguan</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {weeklyReport.map((w, idx) => (
                        <div key={idx} className={`p-3.5 ${innerBg} border rounded-2xl flex flex-col justify-between shadow-sm`}>
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className={`text-xs font-black ${accentText}`}>{w.label}</span>
                              {idx > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${w.wowGrowth >= 0 ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-500" : "bg-rose-500/20 text-rose-700"}`}>
                                  {w.wowGrowth > 0 ? `+${w.wowGrowth}%` : `${w.wowGrowth}%`}
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] ${textMuted} mb-1.5 font-bold`}>{w.range}</p>
                            <div className="text-base font-black mt-1 font-mono text-slate-950 dark:text-white">{formatIDR(w.sales)}</div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-inherit flex items-center justify-between">
                            <button
                              onClick={() => openWeeklyStaffSheet(w.label, w.matchTrx)}
                              className="text-[11px] font-black text-sky-700 dark:text-sky-400 hover:underline"
                            >
                              Lihat Per Staff &gt;
                            </button>
                            <button
                              onClick={() => handleShareWeekly(w.label, w.sales, w.target, w.achv)}
                              title="Share Week ini ke WA"
                              className="p-1 rounded bg-emerald-500 text-white text-[10px]"
                            >
                              📲
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className={`overflow-x-auto w-full rounded-2xl border ${innerBg}`}>
                      <table className="w-full text-left text-xs min-w-[650px]">
                        <thead className={`${innerBg} uppercase text-[11px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="py-4 px-4 font-black">Label Kolom O</th>
                            <th className="py-4 px-4 font-black">Rentang Tanggal</th>
                            <th className="py-4 px-4 text-center font-black">Unit</th>
                            <th className="py-4 px-4 text-center font-black">Struk</th>
                            <th className="py-4 px-4 text-right font-black">Target</th>
                            <th className="py-4 px-4 text-right font-black">Total Penjualan</th>
                            <th className="py-4 px-4 text-center font-black">Achv %</th>
                            <th className="py-4 px-4 text-center font-black">WoW Growth</th>
                            <th className="py-4 px-4 text-center font-black">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-bold">
                          {weeklyReport.map((w, i) => (
                            <tr key={i} className="hover:opacity-90 transition">
                              <td className="py-4 px-4 font-black text-slate-950 dark:text-white">{w.label}</td>
                              <td className="py-4 px-4 text-slate-800 dark:text-slate-300 font-bold">{w.range}</td>
                              <td className="py-4 px-4 text-center font-black text-amber-700 dark:text-amber-300">{w.qty}</td>
                              <td className="py-4 px-4 text-center text-slate-800 dark:text-slate-300 font-bold">{w.invCount}</td>
                              <td className="py-4 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-300">{formatIDR(w.target)}</td>
                              <td className="py-4 px-4 text-right font-black text-emerald-700 dark:text-emerald-400 text-sm font-mono">{formatIDR(w.sales)}</td>
                              <td className="py-4 px-4 text-center font-black text-sky-700 dark:text-sky-400">{w.achv}%</td>
                              <td className="py-4 px-4 text-center font-black">
                                {i === 0 ? (
                                  <span className="opacity-60 text-slate-600 dark:text-slate-400">Baseline</span>
                                ) : (
                                  <span className={w.wowGrowth >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}>
                                    {w.wowGrowth > 0 ? `+${w.wowGrowth}%` : `${w.wowGrowth}%`}
                                  </span>
                                )}
                              </td>
                              <td className="py-4 px-4 text-center">
                                <button
                                  onClick={() => openWeeklyStaffSheet(w.label, w.matchTrx)}
                                  className={`px-2.5 py-1 rounded-xl text-xs font-black transition ${activeTabBtn}`}
                                >
                                  Detail Staff
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: STAFF PERFORMANCE DETAIL */}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {staffList.map((staff: any) => {
                      const appleTotal = staff.appleSub.reduce((acc: number, c: any) => acc + (Number(c.actual) || 0), 0);
                      const androidTotal = staff.androidSub.reduce((acc: number, c: any) => acc + (Number(c.actual) || 0), 0);
                      const accTotal = staff.totalAccActual || 0;
                      const vasTotal = staff.totalVasActual || 0;

                      const atvVal = staff.invoicesCount > 0 ? Math.round(staff.actual / staff.invoicesCount) : 0;
                      const formatCompactATV = (num: number) => {
                        if (num >= 1000000) {
                          return `Rp ${(num / 1000000).toFixed(1)}...`;
                        }
                        return formatIDR(num);
                      };

                      const rewardPoints = Math.min(100, Math.max(0, Number(((staff.achievement * 0.6) + (staff.upt * 10)).toFixed(1))));

                      const isProductive = staff.achievement >= 90;
                      const badgeText = isProductive ? "Productive" : staff.achievement >= 60 ? "On Track" : "Need Focus";
                      const badgeColor = isProductive
                        ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-500/40"
                        : staff.achievement >= 60
                        ? "bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/40"
                        : "bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-500/40";

                      return (
                        <div
                          key={staff.salesId}
                          onClick={() => openStaffDetailSheet(staff)}
                          className={`${cardBg} rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/50 overflow-hidden relative flex flex-col justify-between cursor-pointer w-full`}
                        >
                          <div className="h-2 w-full bg-[#10B981] shadow-sm shadow-emerald-500/30" />

                          <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full ${isDark ? "bg-sky-500/20 text-sky-300 border border-sky-400/40" : "bg-blue-100 text-blue-900 border border-blue-300"} shadow-md flex items-center justify-center font-black text-lg sm:text-xl shrink-0 overflow-hidden`}>
                                  {staff.initials}
                                </div>
                                <div className="min-w-0">
                                  <h3 className={`text-sm sm:text-base font-black leading-tight truncate ${textMain}`}>
                                    {staff.name}
                                  </h3>
                                  <p className={`text-[11px] sm:text-xs font-bold mt-0.5 truncate ${textMuted}`}>
                                    Senior Sales Specialist
                                  </p>
                                </div>
                              </div>

                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide shrink-0 ${badgeColor}`}>
                                {badgeText}
                              </span>
                            </div>

                            <div className={`border-t ${isDark ? "border-white/10" : "border-slate-300/80"}`} />

                            <div className="space-y-2">
                              <div className="flex justify-between items-baseline gap-2">
                                <span className={`text-xs font-bold shrink-0 ${textMuted}`}>Total Penjualan:</span>
                                <span className={`text-sm sm:text-lg font-black tracking-tight truncate ${textMain}`}>
                                  {formatIDR(staff.actual)}
                                </span>
                              </div>

                              <div className="flex justify-between items-baseline text-xs gap-2">
                                <span className={`font-bold truncate ${textMuted}`}>
                                  Target: {formatIDR(staff.target)}
                                </span>
                                <span className="font-black text-emerald-700 dark:text-[#10B981] text-xs sm:text-sm shrink-0">
                                  {staff.achievement}%
                                </span>
                              </div>

                              <div className={`w-full h-2.5 rounded-full overflow-hidden ${innerBg}`}>
                                <div
                                  className="h-full bg-[#10B981] rounded-full transition-all duration-500 shadow-sm shadow-emerald-500/50"
                                  style={{ width: `${Math.min(staff.achievement, 100)}%` }}
                                />
                              </div>
                            </div>

                            <div className={`border-t ${isDark ? "border-white/10" : "border-slate-300/80"}`} />

                            <div className="grid grid-cols-3 gap-2">
                              <div className={`${innerBg} py-2.5 px-1.5 rounded-2xl text-center border border-inherit`}>
                                <span className={`text-[10px] font-black block uppercase tracking-wider ${textMuted}`}>UPT</span>
                                <span className={`text-sm sm:text-base font-black mt-0.5 block ${textMain}`}>{staff.upt}</span>
                              </div>

                              <div className={`${innerBg} py-2.5 px-1.5 rounded-2xl text-center border border-inherit`}>
                                <span className={`text-[10px] font-black block uppercase tracking-wider ${textMuted}`}>ATV</span>
                                <span className={`text-xs sm:text-sm font-black mt-0.5 block truncate ${textMain}`}>
                                  {formatCompactATV(atvVal)}
                                </span>
                              </div>

                              <div className={`${innerBg} py-2.5 px-1.5 rounded-2xl text-center border border-inherit`}>
                                <span className={`text-[10px] font-black block uppercase tracking-wider ${textMuted}`}>Trx</span>
                                <span className={`text-sm sm:text-base font-black mt-0.5 block ${textMain}`}>{staff.invoicesCount}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5 pt-1 text-xs">
                              <div className="flex justify-between items-center gap-2">
                                <span className={`font-bold ${textMuted}`}>Apple:</span>
                                <span className={`font-black text-xs sm:text-sm truncate ${textMain}`}>{formatIDR(appleTotal)}</span>
                              </div>

                              <div className="flex justify-between items-center gap-2">
                                <span className={`font-bold ${textMuted}`}>Android:</span>
                                <span className={`font-black text-xs sm:text-sm truncate ${textMain}`}>{formatIDR(androidTotal)}</span>
                              </div>

                              <div className="flex justify-between items-center gap-2">
                                <span className={`font-bold ${textMuted}`}>Aksesoris:</span>
                                <span className={`font-black text-xs sm:text-sm truncate ${textMain}`}>{formatIDR(accTotal)}</span>
                              </div>

                              <div className="flex justify-between items-center gap-2">
                                <span className={`font-bold ${textMuted}`}>VAS / Warranty:</span>
                                <span className={`font-black text-xs sm:text-sm truncate ${textMain}`}>{formatIDR(vasTotal)}</span>
                              </div>
                            </div>

                            <div className={`border-t ${isDark ? "border-white/10" : "border-slate-300/80"}`} />

                            <div className="flex justify-between items-center pt-1">
                              <div className={`flex items-center gap-1.5 text-xs font-bold ${textMuted}`}>
                                <span>🎗️</span>
                                <span>Poin Reward</span>
                              </div>
                              <span className="text-xs sm:text-sm font-black text-sky-700 dark:text-sky-400">
                                {rewardPoints} pts
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
                        <span className="text-[11px] font-black text-amber-700 dark:text-amber-400 mt-1 block">
                          Wajib Dikejar per Hari
                        </span>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[11px] font-black ${textMuted} uppercase block tracking-wider`}>
                          PENCAPAIAN HARI INI
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                          {formatIDR(dailyTargetCalculated.actualToday)}
                        </div>
                        <span className={`text-[11px] font-black mt-1 inline-block px-2.5 py-0.5 rounded ${
                          dailyTargetCalculated.actualToday >= dailyTargetCalculated.targetStoreToday 
                            ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border border-emerald-400/30" 
                            : "bg-rose-500/15 text-rose-800 dark:text-rose-400 border border-rose-400/30"
                        }`}>
                          {dailyTargetCalculated.actualToday >= dailyTargetCalculated.targetStoreToday ? "Tercapai" : "Belum Bersisa"} ({dailyTargetCalculated.achvToday}%)
                        </span>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <span className={`text-[11px] font-black ${textMuted} uppercase block tracking-wider`}>
                          TARGET PER STAF HARI INI
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400 mt-1 font-mono">
                          {formatIDR(dailyTargetCalculated.targetPerStaffToday)}
                        </div>
                        <span className={`text-[11px] ${textMuted} mt-1 block font-bold`}>
                          Dibagi {dailyTargetCalculated.staffCount} Staf Bertugas
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <h3 className={`text-xs font-black uppercase tracking-wider ${textMuted}`}>
                        DAFTAR STAF BERTUGAS HARI INI & KUOTA TARGET:
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {dailyTargetCalculated.staffOnDuty.map((s) => (
                          <div key={s.id} className={`p-3 rounded-xl border flex justify-between items-center ${innerBg}`}>
                            <div>
                              <span className={`font-black text-xs ${textMain} block`}>{s.name}</span>
                              <span className={`text-[10px] ${textMuted}`}>{s.role}</span>
                            </div>
                            <span className={`font-mono font-black text-xs ${accentText}`}>
                              {formatIDR(dailyTargetCalculated.targetPerStaffToday)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-inherit space-y-3">
                      <h3 className={`text-xs font-black uppercase tracking-wider ${textMuted}`}>
                        RIWAYAT PENCAPAIAN TANGGAL BERJALAN (1 - 31 OKT):
                      </h3>
                      <div className="overflow-x-auto w-full rounded-2xl border border-inherit">
                        <table className="w-full text-left text-xs min-w-[550px]">
                          <thead className={`${innerBg} uppercase text-[10px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                            <tr>
                              <th className="py-2.5 px-3 font-black">Tanggal</th>
                              <th className="py-2.5 px-3 text-right font-black">Target Harian</th>
                              <th className="py-2.5 px-3 text-right font-black">Pencapaian Aktual</th>
                              <th className="py-2.5 px-3 text-center font-black">Progress %</th>
                              <th className="py-2.5 px-3 text-right font-black">Selisih (+/-)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-inherit font-bold">
                            {dailyTrendStats.map((d, i) => {
                              const pAchv = calcAchv(d.actual, d.target);
                              return (
                                <tr key={i} className="hover:opacity-90">
                                  <td className="py-2.5 px-3 font-black text-slate-950 dark:text-white">{d.dayLabel} (Hari {i + 1})</td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-300">{formatIDR(d.target)}</td>
                                  <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatIDR(d.actual)}</td>
                                  <td className="py-2.5 px-3 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                      pAchv >= 100 
                                      ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400" 
                                      : pAchv >= 70 
                                      ? "bg-amber-500/20 text-amber-800 dark:text-amber-400" 
                                      : "bg-rose-500/20 text-rose-800 dark:text-rose-400"
                                    }`}>
                                      {pAchv}%
                                    </span>
                                  </td>
                                  <td className={`py-2.5 px-3 text-right font-mono font-black ${d.gap >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                                    {formatIDR(d.gap)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
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
                        <p className={`text-xs ${textMuted} mt-1 font-semibold`}>
                          Shift: ⛅ D047 (Pagi: 09-17) | ☀️ D103 (Siang: 14-22) | 🏠 OFF | 📚 TR (Training)
                        </p>
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
                            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-400 block mt-1">Pagi: {d.morning} | Siang: {d.evening}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className={`overflow-x-auto w-full rounded-2xl border ${innerBg}`}>
                      <table className="w-full text-left text-xs min-w-[650px]">
                        <thead className={`${innerBg} uppercase text-[11px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="py-3 px-4 font-black">Nama Staf</th>
                            <th className="py-3 px-3 font-black">Role</th>
                            <th className="py-3 px-3 text-center font-black">Senin</th>
                            <th className="py-3 px-3 text-center font-black">Selasa</th>
                            <th className="py-3 px-3 text-center font-black">Rabu</th>
                            <th className="py-3 px-3 text-center font-black">Kamis</th>
                            <th className="py-3 px-3 text-center font-black">Jumat</th>
                            <th className="py-3 px-3 text-center font-black">Sabtu</th>
                            <th className="py-3 px-3 text-center font-black">Minggu</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-bold">
                          {scheduleData.map((s) => (
                            <tr key={s.id} className="hover:opacity-90 transition">
                              <td className="py-3 px-4 font-black text-slate-950 dark:text-white">{s.name}</td>
                              <td className="py-3 px-3 text-slate-700 dark:text-slate-400 font-bold text-[11px]">{s.role}</td>
                              {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((dayKey) => {
                                const shift = s[dayKey];
                                const isOff = shift === "OFF";
                                const isMorning = shift === "D047";
                                const isEvening = shift === "D103";
                                const canEdit = currentSalesId === ADMIN_ID;

                                return (
                                  <td key={dayKey} className="py-2.5 px-2 text-center">
                                    {canEdit ? (
                                      <select
                                        value={shift}
                                        onChange={(e) => updateScheduleShift(s.id, dayKey, e.target.value)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-black border focus:outline-none cursor-pointer ${
                                          isOff
                                            ? "bg-slate-300 dark:bg-slate-700/40 text-slate-900 dark:text-slate-300 border-slate-400"
                                            : isMorning
                                            ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40"
                                            : isEvening
                                            ? "bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/40"
                                            : "bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40"
                                        }`}
                                      >
                                        <option value="D047">D047 (Pagi)</option>
                                        <option value="D103">D103 (Siang)</option>
                                        <option value="OFF">OFF (Libur)</option>
                                        <option value="TR">TR (Training)</option>
                                        <option value="CUTI">CUTI / RO</option>
                                      </select>
                                    ) : (
                                      <span
                                        className={`px-2 py-1 rounded-lg text-[10px] font-black border inline-block ${
                                          isOff
                                            ? "bg-slate-300 dark:bg-slate-700/40 text-slate-900 dark:text-slate-300 border-slate-400"
                                            : isMorning
                                            ? "bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/40"
                                            : isEvening
                                            ? "bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/40"
                                            : "bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-500/40"
                                        }`}
                                      >
                                        {shift}
                                      </span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: FEEDBACK RITEL TIM */}
              {activeTab === "feedback" && (
                <div className="space-y-6">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5 overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>💬</span>
                          <span>Riwayat Feedback Penjualan Hari Ini 📊</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-0.5`}>
                          Hari Ini, 26 Okt 2026 • Ulasan performa, kendala, dan apresiasi layanan tim sales
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <select
                          value={selectedFeedbackStaff}
                          onChange={(e) => setSelectedFeedbackStaff(e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black border ${innerBg} focus:outline-none text-slate-950 dark:text-white`}
                        >
                          <option value="ALL">Pilih Semua Staf ({feedbacks.length} Feedback)</option>
                          {staffList.map((s) => (
                            <option key={s.salesId} value={s.name}>
                              {s.name}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => setFeedbackModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-black transition shadow-lg shadow-sky-500/20 active:scale-95"
                        >
                          + Tulis Feedback Baru
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      {feedbacks
                        .filter((f) => selectedFeedbackStaff === "ALL" || f.salesName.toLowerCase().includes(selectedFeedbackStaff.toLowerCase()))
                        .map((fb) => (
                          <div
                            key={fb.id}
                            className={`p-4 sm:p-5 rounded-2xl border transition-all ${innerBg}`}
                          >
                            <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-800 dark:text-sky-400 font-black flex items-center justify-center text-xs border border-sky-400/40">
                                  {fb.initials}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-black text-sm text-slate-950 dark:text-white">{fb.salesName}</h4>
                                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">({fb.salesRole})</span>
                                  </div>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">{fb.timestamp}</span>
                                </div>
                              </div>

                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                  fb.sentiment === "Luar Biasa"
                                  ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-400 border-emerald-400/30"
                                  : fb.sentiment === "Cukup Baik"
                                  ? "bg-amber-500/15 text-amber-800 dark:text-amber-400 border-amber-400/30"
                                  : "bg-rose-500/15 text-rose-800 dark:text-rose-400 border-rose-400/30"
                                }`}
                              >
                                {fb.sentiment}
                              </span>
                            </div>

                            <div
                              className={`p-3.5 rounded-xl border text-xs font-semibold leading-relaxed ${cardBg} text-slate-950 dark:text-slate-100`}
                            >
                              {fb.text}
                            </div>

                            <div className="flex flex-wrap items-center gap-2 mt-3 pt-2">
                              {[
                                { key: "thumbsUp" as const, emoji: "👍" },
                                { key: "heart" as const, emoji: "🧡" },
                                { key: "fire" as const, emoji: "🔥" },
                                { key: "thumbsDown" as const, emoji: "👎🏻" },
                                { key: "sad" as const, emoji: "🥲" },
                              ].map((btn) => {
                                const isClicked = fb.userReactions.includes(btn.key);
                                return (
                                  <button
                                    key={btn.key}
                                    onClick={() => handleToggleReaction(fb.id, btn.key)}
                                    className={`px-2.5 py-1 rounded-full text-xs font-black border transition flex items-center gap-1 active:scale-90 ${
                                      isClicked
                                        ? "bg-sky-500/20 text-sky-800 dark:text-sky-400 border-sky-400 shadow-sm"
                                        : `${innerBg} border-inherit text-slate-800 dark:text-slate-300 hover:opacity-100`
                                    }`}
                                  >
                                    <span>{btn.emoji}</span>
                                    <span>{fb.reactions[btn.key]}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {feedbackModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                      <div className={`w-full max-w-lg rounded-3xl ${cardBg} border-2 border-inherit p-6 shadow-2xl space-y-4`}>
                        <div className="flex justify-between items-center pb-3 border-b border-inherit">
                          <h3 className="font-black text-sm flex items-center gap-2 text-slate-950 dark:text-white">
                            <span>✍️</span>
                            <span>Tulis Feedback Penjualan Baru</span>
                          </h3>
                          <button
                            onClick={() => setFeedbackModalOpen(false)}
                            className="w-8 h-8 rounded-full bg-slate-700/20 dark:bg-slate-700/30 flex items-center justify-center text-xs font-black text-slate-900 dark:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <form onSubmit={handleCreateFeedback} className="space-y-4 text-xs font-bold">
                          <div>
                            <label className="font-black uppercase tracking-wider block mb-1 text-slate-900 dark:text-slate-100">Pilih Nama Sales</label>
                            <select
                              value={newFeedbackStaff}
                              onChange={(e) => setNewFeedbackStaff(e.target.value)}
                              className={`w-full px-3 py-2.5 rounded-xl border ${innerBg} font-bold focus:outline-none text-slate-950 dark:text-white`}
                            >
                              {staffList.map((s) => (
                                <option key={s.salesId} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider block mb-1 text-slate-900 dark:text-slate-100">Sentimen / Evaluasi Cepat</label>
                            <div className="grid grid-cols-3 gap-2">
                              {(["Luar Biasa", "Cukup Baik", "Kecewa"] as const).map((sent) => (
                                <button
                                  type="button"
                                  key={sent}
                                  onClick={() => setNewFeedbackSentiment(sent)}
                                  className={`py-2 rounded-xl font-black border transition ${
                                    newFeedbackSentiment === sent
                                      ? sent === "Luar Biasa"
                                        ? "bg-emerald-500 text-white border-emerald-400"
                                        : sent === "Cukup Baik"
                                        ? "bg-amber-500 text-slate-950 border-amber-400"
                                        : "bg-rose-500 text-white border-rose-400"
                                      : `${innerBg} text-slate-800 dark:text-slate-300`
                                  }`}
                                >
                                  {sent}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider block mb-1 text-slate-900 dark:text-slate-100">Catatan Ulasan Penjualan</label>
                            <textarea
                              rows={4}
                              required
                              placeholder="Tuliskan apresiasi, closing sukses, atau kendala interaksi penjualan..."
                              value={newFeedbackText}
                              onChange={(e) => setNewFeedbackText(e.target.value)}
                              className={`w-full p-3 rounded-xl border ${innerBg} font-semibold focus:outline-none text-slate-950 dark:text-white`}
                            />
                          </div>

                          <div className="flex justify-end gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setFeedbackModalOpen(false)}
                              className={`px-4 py-2 rounded-xl ${innerBg} border font-black text-slate-900 dark:text-white`}
                            >
                              Batal
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-black"
                            >
                              Kirim Feedback
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 7: BNPL */}
              {activeTab === "bnpl" && (
                <div className="space-y-6">
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4 overflow-hidden`}>
                    <div className="flex flex-wrap justify-between items-center gap-4">
                      <div>
                        <h2 className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-950 dark:text-white">
                          <span>💳</span>
                          <span>TRANSAKSI PEMBIAYAAN KONSUMEN (BNPL DATABASE)</span>
                        </h2>
                        <p className={`text-xs ${textMuted} mt-1 font-semibold`}>
                          Sumber Data Live: Sheet <code>BNPL DATABASE</code> (gid: 2697970). Metrik dihitung otomatis.
                        </p>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
                      {bnplSummary.tenders.map((t, idx) => (
                        <div key={idx} className={`p-4 ${innerBg} border rounded-2xl space-y-1.5 shadow-sm`}>
                          <div className="flex justify-between items-center">
                            <span className={`text-xs font-black uppercase ${accentText}`}>{t.tender}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-black bg-slate-200 dark:bg-slate-700/50 text-slate-950 dark:text-slate-200 border border-slate-300 dark:border-transparent">
                              {t.share}% Toko
                            </span>
                          </div>
                          <div className="text-base sm:text-lg font-black font-mono text-black dark:text-white">
                            {formatIDR(t.amount)}
                          </div>
                          <div className="flex justify-between text-[11px] font-bold text-slate-800 dark:text-slate-300">
                            <span>Qty: <strong className="font-black text-amber-700 dark:text-amber-300">{t.qty} Unit</strong></span>
                            <span>Est: <strong className="font-black font-mono text-slate-950 dark:text-slate-200">{formatIDR(t.estimate)}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-4">
                      <div className="flex flex-wrap gap-2 pb-2">
                        <button
                          onClick={() => setSelectedBnplTender("ALL")}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                            selectedBnplTender === "ALL" ? activeTabBtn : `${innerBg} border text-slate-800 dark:text-slate-300 hover:opacity-100`
                          }`}
                        >
                          Semua Tender ({bnplRecords.length})
                        </button>
                        {bnplSummary.tenders.map((t) => (
                          <button
                            key={t.tender}
                            onClick={() => setSelectedBnplTender(t.tender)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                              selectedBnplTender.toLowerCase() === t.tender.toLowerCase()
                                ? activeTabBtn
                                : `${innerBg} border text-slate-800 dark:text-slate-300 hover:opacity-100`
                            }`}
                          >
                            {t.tender} ({t.qty} Unit)
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={`overflow-x-auto w-full rounded-2xl border ${innerBg}`}>
                      <table className="w-full text-left text-xs min-w-[650px]">
                        <thead className={`${innerBg} uppercase text-[11px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="py-3.5 px-4 font-black">Tanggal</th>
                            <th className="py-3.5 px-4 font-black">No. Invoice</th>
                            <th className="py-3.5 px-4 font-black">Mitra BNPL</th>
                            <th className="py-3.5 px-4 font-black">Detail Produk</th>
                            <th className="py-3.5 px-4 text-center font-black">QTY</th>
                            <th className="py-3.5 px-4 text-right font-black">Nilai Pembiayaan (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-bold">
                          {bnplSummary.list.map((b, idx) => (
                            <tr key={idx} className="hover:opacity-90 transition">
                              <td className="py-3 px-4 font-mono text-slate-800 dark:text-slate-300 whitespace-nowrap">{b.date}</td>
                              <td className={`py-3 px-4 font-mono font-black ${accentText}`}>{b.invoice}</td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${innerBg} text-slate-950 dark:text-white`}>
                                  {b.tender}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-black text-slate-950 dark:text-white max-w-md">{b.product}</td>
                              <td className="py-3 px-4 text-center font-black text-amber-700 dark:text-amber-300">{b.qty}</td>
                              <td className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap font-mono">
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

              {/* TAB 8: SALES DETAIL */}
              {activeTab === "sales-detail" && (
                <div className="space-y-4">
                  <div className={`p-4 sm:p-6 ${cardBg} border rounded-3xl overflow-x-auto w-full shadow-xl`}>
                    <h3 className="text-base font-black mb-4 text-slate-950 dark:text-white">Rincian Seluruh Transaksi Penjualan Terfilter (Live Data)</h3>
                    <table className="w-full text-left text-xs min-w-[650px]">
                      <thead className={`${innerBg} uppercase text-[11px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                        <tr>
                          <th className="p-3 font-black">Tanggal</th>
                          <th className="p-3 font-black">No. Invoice</th>
                          <th className="p-3 font-black">Salesperson</th>
                          <th className="p-3 font-black">Nama Produk</th>
                          <th className="p-3 font-black">Kategori</th>
                          <th className="p-3 text-center font-black">Qty</th>
                          <th className="p-3 text-right font-black">Nominal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-bold">
                        {activeTransactions.slice(0, 50).map((t, idx) => (
                          <tr key={idx} className="hover:opacity-90">
                            <td className="p-3 font-mono text-slate-800 dark:text-slate-300 whitespace-nowrap">{t.date}</td>
                            <td className={`p-3 font-mono font-black ${accentText}`}>{t.invoice}</td>
                            <td className="p-3 font-black text-slate-950 dark:text-white">{t.salesName}</td>
                            <td className="p-3 font-bold text-slate-900 dark:text-white">{t.productName}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${innerBg} text-slate-950 dark:text-white`}>
                                {t.groupCategory}
                              </span>
                            </td>
                            <td className="p-3 text-center font-black text-amber-700 dark:text-amber-300">{t.qty}</td>
                            <td className="p-3 text-right font-black text-emerald-700 dark:text-emerald-400 whitespace-nowrap font-mono">
                              {formatIDR(t.amount)}
                            </td>
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
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                      Cari histori transaksi berdasarkan Nomor Artikel SAP atau Nama/Deskripsi Produk.
                    </p>

                    <div className="relative">
                      <input
                        type="text"
                        value={productSearchQuery}
                        onChange={(e) => setProductSearchQuery(e.target.value)}
                        placeholder="Ketik kode artikel SAP atau nama produk (contoh: iPhone 17, Casing, 102938)..."
                        className={`w-full p-3.5 pl-10 rounded-xl ${innerBg} border text-sm font-bold focus:outline-none focus:border-sky-400 text-slate-950 dark:text-white`}
                      />
                      <span className="absolute left-3.5 top-3.5 text-slate-500 font-bold">🔎</span>
                    </div>
                  </div>

                  {(() => {
                    const query = productSearchQuery.trim().toLowerCase();
                    const filtered = query
                      ? transactions.filter((t: any) =>
                          (t.sapArticle && String(t.sapArticle).toLowerCase().includes(query)) ||
                          (t.productName && String(t.productName).toLowerCase().includes(query))
                        )
                      : [];

                    const totalQty = filtered.reduce((acc: number, curr: any) => acc + (Number(curr.qty) || 0), 0);
                    const totalAmount = filtered.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0);

                    return (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className={`p-5 ${cardBg} border rounded-2xl shadow-sm`}>
                            <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider">Total Unit Terjual</span>
                            <p className="text-2xl font-black text-sky-700 dark:text-sky-400 mt-1">{totalQty.toLocaleString("id-ID")} Qty</p>
                          </div>
                          <div className={`p-5 ${cardBg} border rounded-2xl shadow-sm`}>
                            <span className="text-xs text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider">Total Nilai Penjualan (Amount)</span>
                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">Rp {totalAmount.toLocaleString("id-ID")}</p>
                          </div>
                        </div>

                        <div className={`overflow-x-auto w-full rounded-2xl border ${cardBg}`}>
                          <table className="w-full text-left text-xs min-w-[650px]">
                            <thead className={`${innerBg} uppercase text-[11px] font-black border-b border-inherit text-slate-900 dark:text-slate-400`}>
                              <tr>
                                <th className="py-3 px-4 font-black">Tanggal</th>
                                <th className="py-3 px-4 font-black">Sales Person</th>
                                <th className="py-3 px-4 font-black">Artikel SAP</th>
                                <th className="py-3 px-4 font-black">Deskripsi Produk</th>
                                <th className="py-3 px-4 text-center font-black">Qty</th>
                                <th className="py-3 px-4 text-right font-black">Amount (Rp)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-bold">
                              {filtered.length > 0 ? (
                                filtered.map((item: any, idx: number) => (
                                  <tr key={idx} className="hover:opacity-90">
                                    <td className="py-3 px-4 whitespace-nowrap text-slate-800 dark:text-slate-300 font-mono">{item.date || item.isoDate || "-"}</td>
                                    <td className="py-3 px-4 font-black text-slate-950 dark:text-white">
                                      {item.salesName || "-"}
                                      <span className="block text-[10px] text-slate-600 dark:text-slate-400 font-bold">{item.salesId}</span>
                                    </td>
                                    <td className="py-3 px-4 font-mono font-black text-sky-700 dark:text-sky-400">{item.sapArticle || "-"}</td>
                                    <td className="py-3 px-4 max-w-xs font-bold text-slate-950 dark:text-white">{item.productName || "-"}</td>
                                    <td className="py-3 px-4 text-center font-black text-sky-700 dark:text-sky-400">{item.qty || 0}</td>
                                    <td className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400 font-mono">
                                      Rp {(Number(item.amount) || 0).toLocaleString("id-ID")}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="text-center py-8 text-slate-600 dark:text-slate-400 font-bold">
                                    {productSearchQuery
                                      ? "Tidak ada transaksi yang sesuai dengan kata kunci."
                                      : "Silakan ketik nama produk atau kode artikel pada kolom di atas."}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 10: MoM GROWTH ANALYSIS */}
              {activeTab === "mom-comparison" && (
                <div className="space-y-6">
                  <div className={`${cardBg} p-5 rounded-2xl border flex flex-wrap items-center justify-between gap-4`}>
                    <div>
                      <h2 className={`text-base font-black ${textMain} flex items-center gap-2`}>
                        <span>📈</span> Analisis MoM Growth vs Disgrowth
                      </h2>
                      <p className={`text-xs ${textMuted} mt-0.5`}>Bandingkan performa LOB dan produktivitas sales antar 2 periode bulan</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                        <span className={`text-[11px] ${textMuted} font-black`}>Bulan Analisis:</span>
                        <select
                          value={momBaseMonth}
                          onChange={(e) => setMomBaseMonth(e.target.value)}
                          className={`bg-transparent ${accentText} font-black text-xs focus:outline-none`}
                        >
                          {availableMonths.map((m) => (
                            <option key={`base-${m}`} value={m} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>{m}</option>
                          ))}
                        </select>
                      </div>

                      <span className="text-xs font-black text-slate-600 dark:text-slate-400">VS</span>

                      <div className={`flex items-center gap-2 ${innerBg} px-3 py-1.5 rounded-xl border`}>
                        <span className={`text-[11px] ${textMuted} font-black`}>Pembanding:</span>
                        <select
                          value={momCompareMonth}
                          onChange={(e) => setMomCompareMonth(e.target.value)}
                          className={`bg-transparent ${textMain} font-black text-xs focus:outline-none`}
                        >
                          {availableMonths.map((m) => (
                            <option key={`cmp-${m}`} value={m} className={isDark ? "bg-[#0A1128] text-white" : "bg-white text-slate-900"}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Kartu Grid Metrik LOB & UPT */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {momAnalytics.summary.map((item, idx) => {
                      const isClickable = ["Apple Devices", "Android Devices", "Accessories", "VAS & Services"].includes(item.label);
                      
                      const handleCardClick = () => {
                        if (!isClickable) return;
                        
                        const currentMonthTrx = transactions.filter((t: any) => {
                          const rawM = (t.monthKey || t.month || "").toString().trim();
                          return rawM === momBaseMonth;
                        });

                        let targetItems: RawTransaction[] = [];
                        if (item.label === "Apple Devices") {
                          targetItems = currentMonthTrx.filter((t: any) => {
                            const pUpper = (t.productName || "").toUpperCase();
                            const isHardware = pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("AIRPOD") || pUpper.includes("MACBOOK") || pUpper.includes("WATCH");
                            const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE") || pUpper.includes("POWER");
                            return (t.brand === "APPLE" && (t.groupCategory === "DEVICES" || isHardware)) && !isCaseOrAcc;
                          });
                        } else if (item.label === "Android Devices") {
                          targetItems = currentMonthTrx.filter((t: any) => {
                            const pUpper = (t.productName || "").toUpperCase();
                            const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE");
                            return t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseOrAcc;
                          });
                        } else if (item.label === "Accessories") {
                          targetItems = currentMonthTrx.filter((t: any) => {
                            return t.groupCategory === "ACCESSORIES";
                          });
                        } else if (item.label.includes("VAS")) {
                          targetItems = currentMonthTrx.filter((t: any) => {
                            const pUpper = (t.productName || "").toUpperCase();
                            return t.groupCategory === "VAS" || t.brand === "QOALA" || pUpper.includes("PROTEKSI") || t.brand === "TELKOMSEL" || t.brand === "XL" || t.brand === "INDOSAT";
                          });
                        }

                        openLobDetailSheet(`${item.label} (${momBaseMonth})`, targetItems);
                      };

                      return (
                        <div
                          key={idx}
                          onClick={handleCardClick}
                          className={`${cardBg} p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isClickable ? "cursor-pointer hover:border-sky-400/60 hover:scale-[1.01]" : ""
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-xs font-black ${textMuted}`}>{item.label}</span>
                              {isClickable && <span className="text-[10px] text-sky-700 dark:text-sky-400 font-black bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-400/20">Tap Rincian 🔍</span>}
                            </div>
                            <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                              item.growth >= 0 ? "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20" : "bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-500/20"
                            }`}>
                              {item.growth >= 0 ? `▲ +${item.growth.toFixed(1)}%` : `▼ ${item.growth.toFixed(1)}%`}
                            </span>
                          </div>

                          <div className="mt-3">
                            <div className={`text-lg font-black font-mono text-black dark:text-white`}>
                              {item.isCurrency ? `Rp ${item.base.toLocaleString("id-ID")}` : item.base.toFixed(2)}
                            </div>
                            <div className={`text-[11px] font-bold ${textMuted} mt-1 flex justify-between`}>
                              <span>{momCompareMonth}: {item.isCurrency ? `Rp ${item.compare.toLocaleString("id-ID")}` : item.compare.toFixed(2)}</span>
                              <span className={`font-mono font-black ${item.diff >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                                {item.diff >= 0 ? "+" : ""}{item.isCurrency ? `Rp ${item.diff.toLocaleString("id-ID")}` : item.diff.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tabel Performa Sales Person */}
                  <div className={`${cardBg} rounded-2xl border overflow-hidden`}>
                    <div className={`px-5 py-4 border-b border-inherit flex justify-between items-center`}>
                      <div>
                        <h3 className={`text-sm font-black text-slate-950 dark:text-white`}>Perbandingan Penjualan Staff Sales Person</h3>
                        <p className={`text-[11px] ${accentText} mt-0.5`}>💡 Klik pada nama sales untuk melihat rincian barang yang dijual</p>
                      </div>
                      <span className={`text-xs ${textMuted}`}>Total {momAnalytics.staffComparison.length} Staff</span>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs min-w-[600px]">
                        <thead className={`${innerBg} ${textMuted} uppercase text-[10px] tracking-wider border-b border-inherit font-black text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="px-4 py-3 font-black">Nama Sales</th>
                            <th className="px-4 py-3 text-right font-black">{momBaseMonth} (Aktual)</th>
                            <th className="px-4 py-3 text-right font-black">{momCompareMonth} (Lalu)</th>
                            <th className="px-4 py-3 text-right font-black">Selisih (Gap)</th>
                            <th className="px-4 py-3 text-right font-black">Growth (%)</th>
                            <th className="px-4 py-3 text-center font-black">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-bold">
                          {momAnalytics.staffComparison.map((st: any, i: number) => (
                            <tr key={i} className="hover:opacity-90 transition">
                              <td 
                                className="px-4 py-3 font-black text-sky-700 dark:text-sky-400 hover:underline cursor-pointer flex items-center gap-1.5"
                                onClick={() => openLobDetailSheet(`Penjualan ${st.name} (${momBaseMonth})`, st.baseItems || [])}
                              >
                                <span>👤</span>
                                <span>{st.name}</span>
                                <span className="text-[9px] font-black bg-sky-500/10 text-sky-700 dark:text-sky-400 px-1.5 py-0.5 rounded border border-sky-400/20">Lihat Item</span>
                              </td>
                              <td className="px-4 py-3 text-right font-black text-amber-700 dark:text-amber-300 font-mono">
                                Rp {st.base.toLocaleString("id-ID")}
                              </td>
                              <td className={`px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-300 font-mono`}>
                                Rp {st.compare.toLocaleString("id-ID")}
                              </td>
                              <td className={`px-4 py-3 text-right font-black font-mono ${st.diff >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                                {st.diff >= 0 ? "+" : ""}Rp {st.diff.toLocaleString("id-ID")}
                              </td>
                              <td className={`px-4 py-3 text-right font-black font-mono ${st.growth >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                                {st.growth >= 0 ? `+${st.growth.toFixed(1)}%` : `${st.growth.toFixed(1)}%`}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black ${
                                  st.growth >= 0 ? "bg-emerald-500/20 text-emerald-800 dark:text-emerald-400" : "bg-rose-500/20 text-rose-800 dark:text-rose-400"
                                }`}>
                                  {st.growth >= 0 ? "Growth" : "Disgrowth"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Tabel Khusus: Devices Disgrowth */}
                  <div className={`${cardBg} rounded-2xl border border-rose-900/40 overflow-hidden shadow-xl mt-6`}>
                    <div className="px-5 py-4 border-b border-rose-900/30 flex justify-between items-center bg-rose-500/5">
                      <div>
                        <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 flex items-center gap-2">
                          <span>⚠️</span>
                          <span>Daftar Produk Devices yang Turun (Defisit Terbesar)</span>
                        </h3>
                        <p className={`text-xs ${textMuted} mt-0.5 font-semibold`}>
                          Produk smartphone & tablet yang penjualannya merosot dibanding {momCompareMonth}
                        </p>
                      </div>
                      <span className="text-xs text-rose-700 dark:text-rose-400 font-black bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                        {(momAnalytics.droppedDevices || []).length} Produk Defisit
                      </span>
                    </div>

                    <div className="overflow-x-auto w-full">
                      <table className="w-full text-left text-xs min-w-[650px]">
                        <thead className={`${innerBg} ${textMuted} uppercase text-[10px] tracking-wider border-b border-inherit font-black text-slate-900 dark:text-slate-300`}>
                          <tr>
                            <th className="px-4 py-3 font-black">Nama Produk Device</th>
                            <th className="px-4 py-3 font-black">Brand</th>
                            <th className="px-4 py-3 text-center font-black">{momBaseMonth} (Qty)</th>
                            <th className="px-4 py-3 text-right font-black">{momBaseMonth} (Omset)</th>
                            <th className="px-4 py-3 text-center font-black">{momCompareMonth} (Qty)</th>
                            <th className="px-4 py-3 text-right font-black">{momCompareMonth} (Omset)</th>
                            <th className="px-4 py-3 text-right font-black">Defisit Penurunan</th>
                            <th className="px-4 py-3 text-right font-black">Growth (%)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-bold">
                          {(!momAnalytics.droppedDevices || momAnalytics.droppedDevices.length === 0) ? (
                            <tr>
                              <td colSpan={8} className="text-center py-6 text-slate-600 dark:text-slate-400 font-black">
                                Tidak ada produk device yang mengalami penurunan omset.
                              </td>
                            </tr>
                          ) : (
                            momAnalytics.droppedDevices.slice(0, 20).map((d: any, i: number) => (
                              <tr key={i} className="hover:opacity-90 transition">
                                <td className={`px-4 py-3 font-black text-slate-950 dark:text-white max-w-xs`}>{d.name}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    d.brand === "Apple" ? "bg-sky-500/15 text-sky-800 dark:text-sky-400 border border-sky-400/20" : "bg-indigo-500/15 text-indigo-800 dark:text-indigo-400 border border-indigo-400/20"
                                  }`}>
                                    {d.brand}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center font-black text-amber-700 dark:text-amber-300">{d.baseQty}</td>
                                <td className="px-4 py-3 text-right font-black text-amber-700 dark:text-amber-300 font-mono">
                                  Rp {d.base.toLocaleString("id-ID")}
                                </td>
                                <td className={`px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-300`}>{d.compareQty}</td>
                                <td className={`px-4 py-3 text-right font-bold text-slate-800 dark:text-slate-300 font-mono`}>
                                  Rp {d.compare.toLocaleString("id-ID")}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-rose-600 font-mono">
                                  Rp {d.diff.toLocaleString("id-ID")}
                                </td>
                                <td className="px-4 py-3 text-right font-black text-rose-600 font-mono">
                                  {d.growth.toFixed(1)}%
                                </td>
                              </tr>
                            ))
                          )}
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

      {/* 4. BOTTOM BAR KHUSUS HANDPHONE (JEMPOL FRIENDLY) */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t z-40 px-3 py-2 flex justify-around items-center shadow-2xl print:hidden ${glassBottomBar}`}>
        {[
          { id: "store-overview", label: "Overview", icon: "📊" },
          { id: "mom-comparison", label: "MoM", icon: "⚖️" },
          { id: "staff-performance", label: "Staff", icon: "🏆" },
          { id: "daily-target", label: "Target", icon: "🎯" },
        ].map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as MenuTab)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                active ? "text-sky-400 scale-105" : "text-slate-300"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span className={`text-[10px] font-black mt-0.5 ${active ? "text-sky-400" : ""}`}>
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-300"
        >
          <span className="text-base">📑</span>
          <span className="text-[10px] font-black mt-0.5">Lainnya</span>
        </button>
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
