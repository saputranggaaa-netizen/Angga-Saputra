"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
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
        // Ganti dengan URL deployment Web App Apps Script Anda
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#131722] border border-white/10 p-6 space-y-4 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/10 pb-3">
          <h3 className="text-sm font-bold text-white">Upload Bukti Transaksi (RAW SalesPerson)</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-xs">✕</button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Pilih File / Foto Bukti:</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
              className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:bg-blue-600 file:text-white"
            />
          </div>

          <div>
            <label className="text-[11px] text-slate-300 block mb-1">Catatan Tambahan (Kolom O):</label>
            <input
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Catatan / keterangan..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-bold rounded-xl text-xs transition"
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
  | "product-search";
type ThemeMode = "dark" | "light";
type PeriodType = "daily" | "weekly" | "monthly";

interface RawTransaction {
  date: string;
  isoDate: string;
  monthKey: string;
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
  targetAcc: number;
  actualAcc: number;
  achvAcc: number;
  targetVas: number;
  actualVas: number;
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

// =========================================================================
// 2. HELPER FUNCTIONS & FORMULAS
// =========================================================================

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

const INITIAL_FEEDBACKS: FeedbackItem[] = [
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
];

export default function DigiplusOperationalEngine() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Theme & Navigation
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [activeTab, setActiveTab] = useState<MenuTab>("store-overview");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [overviewDetailCategory, setOverviewDetailCategory] = useState<"apple" | "android" | "accessories" | "vas">("apple");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

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
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("2026-10-24");

  // Bottom Sheet Drawer State
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);

  // BNPL Tab Filter
  const [selectedBnplTender, setSelectedBnplTender] = useState<string>("ALL");

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(INITIAL_FEEDBACKS);
  const [selectedFeedbackStaff, setSelectedFeedbackStaff] = useState<string>("ALL");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [newFeedbackStaff, setNewFeedbackStaff] = useState<string>("Liesbeth Febrina");
  const [newFeedbackSentiment, setNewFeedbackSentiment] = useState<"Luar Biasa" | "Cukup Baik" | "Kecewa">("Luar Biasa");
  const [newFeedbackText, setNewFeedbackText] = useState<string>("");

  // PPTX Exporting State
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  // Admin Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
  const ADMIN_ID = "22008089";

  // Normalisasi Tanggal & Bulan
  const parseNormalizedDate = (rawDateStr: string, rawMonthStr: string) => {
    let isoDate = "";
    let monthKey = "";

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

    const mClean = String(rawMonthStr || "").trim().toLowerCase();
    if (mClean.includes("okt") || mClean.includes("2026-10") || mClean.includes("10-2026")) {
      monthKey = "Oktober2026";
    } else if (mClean.includes("sep") || mClean.includes("2026-09")) {
      monthKey = "September2026";
    } else if (isoDate) {
      monthKey = isoDate.startsWith("2026-10") ? "Oktober2026" : "September2026";
    } else {
      monthKey = "Oktober2026";
    }

    return { isoDate, monthKey };
  };

  // Live Fetching Hook
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

        // ATURAN KATEGORI KETAT:
        // Jika Kolom L bernilai DEVICES: Wajib masuk ke DEVICES (Xiaomi/Redmi masuk ke Android Devices)
        if (groupCategory === "DEVICES") {
          // Tetap DEVICES

        } else if (groupCategory === "VAS" || brand === "QOALA" || brand === "TELKOMSEL" || brand === "XL" || brand === "INDOSAT" || pUpper.includes("PROTEKSI") || pUpper.includes("MYPRIO")) {
          groupCategory = "VAS";
        } else if (groupCategory === "ACCESSORIES" || pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE") || pUpper.includes("BAND") || pUpper.includes("STRAP")) {
          groupCategory = "ACCESSORIES";
        } else if (brand === "APPLE" && (pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("MAC") || pUpper.includes("WATCH") || pUpper.includes("AIRPOD"))) {
          groupCategory = "DEVICES";
        } else if (["SAMSUNG", "XIAOMI", "OPPO", "MOTOROLA", "HUAWEI", "INFINIX"].includes(brand) && (pUpper.includes("PHONE") || pUpper.includes("GALAXY") || pUpper.includes("REDMI"))) {
          groupCategory = "DEVICES";
        } else {
          groupCategory = "ACCESSORIES";
        }

        if (invoice && amount > 0 && salesName) {
          parsedTrx.push({
            date: String(rawDate),
            isoDate,
            monthKey,
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

      // Parse BNPL Database
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
const fetchOnlineActivityLogs = async () => {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTDbyOKLJBawzRaso45Z2bXTBZBQflG-y2TQnSvru9JBQIPVKQ8dg_CZA5LievEgnV_ocOxKWBSE9uz/pub?gid=422013492&single=true&output=csv";

    try {
      const res = await fetch(csvUrl);
      const text = await res.text();
      const rows = text.split("\n").filter((r) => r.trim() !== "");
      
      if (rows.length <= 1) return;

      const logs = rows.slice(1).map((row, idx) => {
        const cols = row.split(",").map((c) => c.replace(/^"|"$/g, "").trim());
        return {
          id: `online-${idx}`,
          timestamp: cols[0] || "-",
          salesName: cols[1] || "-",
          salesId: "",
          deviceType: cols[2] || "-",
          browser: cols[3] || "-",
          location: cols[4] || "-",
          coords: "-"
        };
      });

      setActivityLogs(logs.reverse());
    } catch (err) {
      console.error("Gagal mengambil log aktivitas:", err);
    }
  };
  useEffect(() => {
    setIsMounted(true);
    fetchLiveGoogleSheets();
    fetchOnlineActivityLogs();

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
        try { setFeedbacks(JSON.parse(savedFeedbacks)); } catch (e) {}
      }
      if (savedUser) {
        setIsLoggedIn(true);
        setCurrentSalesId(savedUser);
        setCurrentSalesName(savedName || `Sales ${savedUser}`);
      }
    }

    fetch(LOG_API_URL)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setActivityLogs(data);
      })
      .catch(() => {
        const savedLogs = localStorage.getItem("digi_ops_activity_logs");
        if (savedLogs) {
          try {
            setActivityLogs(JSON.parse(savedLogs));
          } catch (e) {}
        }
      });
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

    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    const log: ActivityLog = {
      id: Date.now().toString(),
      salesId: cleanId,
      salesName: detectedName,
      timestamp: new Date().toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }) + " WIB",
      deviceType: isMobile ? "Handphone / Mobile" : "Komputer / PC",
      browser: typeof navigator !== "undefined" && navigator.userAgent.includes("Chrome") ? "Chrome" : "Safari",
      location: "Store Grand Indonesia",
      coords: "-",
    };

    setActivityLogs((prev) => {
      const updated = [log, ...prev.slice(0, 49)];
      if (typeof window !== "undefined") {
        localStorage.setItem("digi_ops_activity_logs", JSON.stringify(updated));
      }
      return updated;
    });
  };
  // Kirim data login ke Google Form
    try {
      const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSctv00_5yTd9cwe2xIb8a3-qM-JhWBWNK24WxS_Lo9gNkrx9Q/formResponse";
      const formData = new FormData();
      formData.append("entry.1919952895", `${log.salesName} (${log.salesId})`);
      formData.append("entry.1481318705", log.deviceType);
      formData.append("entry.1018329456", log.browser);
      formData.append("entry.1301782679", log.location);

      fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });
    } catch (err) {
      console.error("Gagal kirim log online:", err);
    }

  const handleLogout = () => {
    localStorage.removeItem("digi_ops_user");
    localStorage.removeItem("digi_ops_name");
    setIsLoggedIn(false);
    setCurrentSalesId("");
    setCurrentSalesName("");
  };

  // DETEKSI MINGGU OTOMATIS DARI KOLOM O
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
      return {
        key,
        label: w.label,
        range,
        days: 7,
      };
    });
  }, [transactions]);

  // Filter Data Transaksi Aktif
  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedMonth !== "ALL" && t.monthKey !== selectedMonth) {
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

  // Kalkulasi Overview Metrics
  const overviewStats = useMemo(() => {
    const actual = activeTransactions.reduce((acc, t) => acc + t.amount, 0);
    const target = periodType === "daily"
      ? Math.round(8728667173 / 31)
      : periodType === "weekly"
      ? Math.round((8728667173 / 31) * 7)
      : 8728667173;

    const achv = calcAchv(actual, target);
    const variance = actual - target;
    const estimate = Math.round(actual * 1.29);
    const qtyTotal = activeTransactions.reduce((acc, t) => acc + t.qty, 0);
    const invoiceCount = new Set(activeTransactions.map((t) => t.invoice)).size;
    const storeUPT = calcUpt(qtyTotal, invoiceCount);

    // Apple Devices: Hardware Murni Apple
    const appleItems = activeTransactions.filter((t) => {
      const pUpper = t.productName.toUpperCase();
      const isHardware = pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("AIRPOD") || pUpper.includes("MACBOOK") || pUpper.includes("WATCH");
      const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE") || pUpper.includes("POWER");
      return t.brand === "APPLE" && (t.groupCategory === "DEVICES" || isHardware) && !isCaseOrAcc;
    });
    const appleActual = appleItems.reduce((acc, t) => acc + t.amount, 0);
    const appleTarget = Math.round(target * 0.794);

    // Android Devices: Termasuk Xiaomi / Redmi selama Group Category = DEVICES
    const androidItems = activeTransactions.filter((t) => {
      const pUpper = t.productName.toUpperCase();
      const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE");
      return (
        t.groupCategory === "DEVICES" &&
        t.brand !== "APPLE" &&
        !isCaseOrAcc
      );
    });
    const androidActual = androidItems.reduce((acc, t) => acc + t.amount, 0);
    const androidTarget = Math.round(target * 0.108);

    // Accessories: Casing UNIQ, KORA, ZAGG, case iPhone, adapter, dll
    const accItems = activeTransactions.filter((t) => t.groupCategory === "ACCESSORIES");
    const accActual = accItems.reduce((acc, t) => acc + t.amount, 0);
    const accTarget = Math.round(target * 0.053);

    // VAS: Qoala, Telkomsel, XL, Indosat
    const vasItems = activeTransactions.filter((t) => t.groupCategory === "VAS");
    const vasActual = vasItems.reduce((acc, t) => acc + t.amount, 0);
    const vasTarget = Math.round(target * 0.045);

    const todayItems = transactions.filter((t) => t.isoDate === selectedDate);
    const todayActual = todayItems.reduce((acc, t) => acc + t.amount, 0);

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
        { name: "Apple Devices (Hardware)", icon: "🍎", actual: appleActual, target: appleTarget, achv: calcAchv(appleActual, appleTarget), variance: appleActual - appleTarget, estimate: Math.round(appleActual * 1.29), color: "text-sky-400" },
        { name: "Android Devices (Samsung, Xiaomi, dll)", icon: "🤖", actual: androidActual, target: androidTarget, achv: calcAchv(androidActual, androidTarget), variance: androidActual - androidTarget, estimate: Math.round(androidActual * 1.29), color: "text-indigo-400" },
        { name: "Accessories (Cases & Acc)", icon: "🔌", actual: accActual, target: accTarget, achv: calcAchv(accActual, accTarget), variance: accActual - accTarget, estimate: Math.round(accActual * 1.29), color: "text-amber-400" },
        { name: "VAS (Qoala, Telkomsel, XL, Indosat)", icon: "🛡️", actual: vasActual, target: vasTarget, achv: calcAchv(vasActual, vasTarget), variance: vasActual - vasTarget, estimate: Math.round(vasActual * 1.29), color: "text-purple-400" },
      ],
      appleItems,
      androidItems,
      accItems,
      vasItems,
    };
  }, [activeTransactions, periodType, selectedDate, transactions]);

  // Trend Harian
  const dailyTrendStats = useMemo(() => {
    const dailyMap = new Map<string, number>();
    transactions.forEach((t) => {
      if (t.isoDate && t.isoDate.startsWith("2026-10")) {
        dailyMap.set(t.isoDate, (dailyMap.get(t.isoDate) || 0) + t.amount);
      }
    });

    const dates = Array.from(dailyMap.keys()).sort();
    const idealDailyTarget = Math.round(8728667173 / 31);

    return dates.map((date) => {
      const actual = dailyMap.get(date) || 0;
      return {
        date,
        dayLabel: date.split("-")[2] + " Okt",
        actual,
        target: idealDailyTarget,
        gap: actual - idealDailyTarget,
      };
    });
  }, [transactions]);

  // Rekap Mingguan Dinamis
  const weeklyReport = useMemo(() => {
    return AUTO_WEEKS.map((wDef, idx) => {
      const match = transactions.filter((t) => t.weekLabel.toLowerCase().includes(wDef.label.toLowerCase()));
      const sales = match.reduce((acc, t) => acc + t.amount, 0);
      const qty = match.reduce((acc, t) => acc + t.qty, 0);
      const invCount = new Set(match.map((t) => t.invoice)).size;
      const target = Math.round((8728667173 / 31) * wDef.days);

      const prevMatch = idx > 0 ? transactions.filter((t) => t.weekLabel.toLowerCase().includes(AUTO_WEEKS[idx - 1].label.toLowerCase())) : [];
      const prevSales = prevMatch.reduce((acc, t) => acc + t.amount, 0);
      const wowGrowth = idx > 0 && prevSales > 0 ? Number((((sales - prevSales) / prevSales) * 100).toFixed(1)) : 0;

      const apple = match.filter((t) => t.brand === "APPLE" && t.groupCategory === "DEVICES").reduce((acc, c) => acc + c.amount, 0);
      const android = match.filter((t) => t.groupCategory === "DEVICES" && t.brand !== "APPLE").reduce((acc, c) => acc + c.amount, 0);
      const acc = match.filter((t) => t.groupCategory === "ACCESSORIES").reduce((acc, c) => acc + c.amount, 0);
      const vas = match.filter((t) => t.groupCategory === "VAS").reduce((acc, c) => acc + c.amount, 0);

      return {
        ...wDef,
        sales,
        qty,
        invCount,
        target,
        achv: calcAchv(sales, target),
        wowGrowth,
        apple,
        android,
        acc,
        vas,
        matchTrx: match,
      };
    });
  }, [transactions, AUTO_WEEKS]);

  // Kalkulasi Kinerja Staf & Sub-LOB
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

      // Apple Devices Hardware Murni
      if (t.brand === "APPLE" && !isCaseAcc && (t.groupCategory === "DEVICES" || pUpper.includes("IPHONE") || pUpper.includes("IPAD") || pUpper.includes("MAC") || pUpper.includes("WATCH") || pUpper.includes("AIRPOD"))) {
        if (pUpper.includes("IPHONE")) { map[id].appleMap["iPhone"].actual += t.amount; map[id].appleMap["iPhone"].qty += t.qty; }
        else if (pUpper.includes("IPAD")) { map[id].appleMap["iPad"].actual += t.amount; map[id].appleMap["iPad"].qty += t.qty; }
        else if (pUpper.includes("MAC") || pUpper.includes("BOOK")) { map[id].appleMap["MacBook"].actual += t.amount; map[id].appleMap["MacBook"].qty += t.qty; }
        else if (pUpper.includes("WATCH")) { map[id].appleMap["Apple Watch"].actual += t.amount; map[id].appleMap["Apple Watch"].qty += t.qty; }
        else if (pUpper.includes("AIRPOD")) { map[id].appleMap["AirPods"].actual += t.amount; map[id].appleMap["AirPods"].qty += t.qty; }
      }

      // Android Devices
      if (t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseAcc) {
        if (t.brand === "SAMSUNG" || pUpper.includes("GALAXY")) { map[id].androidMap["Samsung Devices"].actual += t.amount; map[id].androidMap["Samsung Devices"].qty += t.qty; }
        else if (t.brand === "XIAOMI" || pUpper.includes("REDMI")) { map[id].androidMap["Xiaomi / Redmi Devices"].actual += t.amount; map[id].androidMap["Xiaomi / Redmi Devices"].qty += t.qty; }
        else if (t.brand === "OPPO") { map[id].androidMap["Oppo Devices"].actual += t.amount; map[id].androidMap["Oppo Devices"].qty += t.qty; }
        else if (t.brand === "MOTOROLA") { map[id].androidMap["Motorola Devices"].actual += t.amount; map[id].androidMap["Motorola Devices"].qty += t.qty; }
        else if (t.brand === "HUAWEI") { map[id].androidMap["Huawei Devices"].actual += t.amount; map[id].androidMap["Huawei Devices"].qty += t.qty; }
        else if (t.brand === "INFINIX") { map[id].androidMap["Infinix Devices"].actual += t.amount; map[id].androidMap["Infinix Devices"].qty += t.qty; }
      }

      // Accessories
      if (t.groupCategory === "ACCESSORIES" || isCaseAcc) {
        const item = t.productName.trim() || "Aksesoris";
        if (!map[id].accMap[item]) map[id].accMap[item] = { actual: 0, qty: 0, icon: "🔌" };
        map[id].accMap[item].actual += t.amount;
        map[id].accMap[item].qty += t.qty;
      }

      // VAS
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
      const targetQuota = 1658446763;
      const achv = calcAchv(s.total, targetQuota);
      const variance = s.total - targetQuota;

      const words = s.name.split(" ");
      const initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();

      const sortedAcc = Object.entries(s.accMap)
        .map(([name, d]) => ({ name, ...d }))
        .sort((a, b) => b.actual - a.actual);

      const totalAccActual = sortedAcc.reduce((acc, c) => acc + c.actual, 0);
      const totalVasActual = Object.values(s.vasMap).reduce((acc, c) => acc + c.actual, 0);

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
        initials,
        actual: s.total,
        target: targetQuota,
        achievement: achv,
        variance,
        estimate: Math.round(s.total * 1.29),
        invoicesCount: invCount,
        qty: s.qty,
        upt,
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
  }, [activeTransactions]);

  // Kalkulasi Target Harian
  const dailyTargetCalculated = useMemo(() => {
    const totalMonthTarget = 8728667173;
    const totalDays = 31;
    const daysPassed = 24;
    const daysLeft = totalDays - daysPassed;

    const actualAchievedSoFar = transactions.reduce((acc, t) => acc + t.amount, 0);
    const remainingTarget = Math.max(0, totalMonthTarget - actualAchievedSoFar);
    const requiredDailyRunRate = daysLeft > 0 ? Math.round(remainingTarget / daysLeft) : 0;

    const todayShiftKey = "sat"; // Tanggal 24 Okt = Sabtu
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
  }, [transactions, scheduleData, overviewStats.todayActual]);

  // Kalkulasi BNPL
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

  // Kalkulasi Shift Schedule
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

  // Hak Akses Jadwal
  const updateScheduleShift = (id: string, day: keyof StaffScheduleItem, shift: string) => {
    if (currentSalesId !== ADMIN_ID) {
      alert("Akses Ditolak: Hanya Admin dengan Sales ID 22008089 yang berhak mengubah jadwal shift.");
      return;
    }
    setScheduleData((prev) => {
      const updated = prev.map((item) => (item.id === id ? { ...item, [day]: shift } : item));
      if (typeof window !== "undefined") {
        localStorage.setItem("digi_ops_schedule", JSON.stringify(updated));
      }
      return updated;
    });
  };

  // Feedback Handlers
  const handleToggleReaction = (feedbackId: string, reactionKey: keyof FeedbackItem["reactions"]) => {
    setFeedbacks((prev) => {
      const updated = prev.map((fb) => {
        if (fb.id !== feedbackId) return fb;
        const already = fb.userReactions.includes(reactionKey);
        const newReactions = { ...fb.reactions };
        let newUserReactions = [...fb.userReactions];

        if (already) {
          newReactions[reactionKey] = Math.max(0, newReactions[reactionKey] - 1);
          newUserReactions = newUserReactions.filter((r) => r !== reactionKey);
        } else {
          newReactions[reactionKey] = newReactions[reactionKey] + 1;
          newUserReactions.push(reactionKey);
        }

        return { ...fb, reactions: newReactions, userReactions: newUserReactions };
      });

      if (typeof window !== "undefined") {
        localStorage.setItem("digi_ops_feedbacks", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleCreateFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedbackText.trim()) return;

    const matchedStaff = staffList.find((s) => s.name === newFeedbackStaff);
    const initials = matchedStaff ? matchedStaff.initials : newFeedbackStaff.slice(0, 2).toUpperCase();

    const newFb: FeedbackItem = {
      id: `fb-${Date.now()}`,
      salesName: newFeedbackStaff,
      salesRole: "Sales Specialist",
      initials,
      sentiment: newFeedbackSentiment,
      timestamp: "Hari ini, baru saja",
      text: newFeedbackText.trim(),
      reactions: { thumbsUp: 1, heart: 0, fire: 1, thumbsDown: 0, sad: 0 },
      userReactions: ["thumbsUp", "fire"],
    };
const updated = [newFb, ...feedbacks];
    setFeedbacks(updated);
      // Kirim otomatis ke Google Form (Background)
    try {
      const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLScF95ssD246DesMwuDwDPYJxwM5saSgqnWze8lxuibonKYFLg/formResponse";
      const formData = new FormData();
      formData.append("entry.1072268483", newFb.staffName || newFb.name || currentSalesName);
      formData.append("entry.1945520939", newFb.content || newFb.text || newFeedbackText);

      fetch(formUrl, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });
    } catch (err) {
      console.error("Gagal kirim ke Google Form:", err);
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("digi_ops_feedbacks", JSON.stringify(updated));
    }

    setNewFeedbackText("");
    setFeedbackModalOpen(false);
  };
  // WhatsApp Handlers
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

  const handleShareWeekly = (wLabel: string, sales: number, target: number, achv: number) => {
    const text = 
`*WEEKLY SALES REPORT - DIGIPLUS GRAND INDONESIA*
Periode: ${wLabel}

📈 *Pencapaian Mingguan Store:*
• Sales: ${formatIDR(sales)}
• Target: ${formatIDR(target)}
• Achievement: ${achv}%

🏆 *Top 3 Staff Mingguan:*
${staffList.slice(0, 3).map((s) => `• #${s.rank} ${s.name}: ${formatIDR(s.weekSales[wLabel] || 0)}`).join("\n")}

_Generated via Store Performance Engine._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleShareScheduleWA = () => {
    const daysLabel = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
    const text = 
`*JADWAL SHIFT OPERASIONAL TOKO QF01 GRAND INDONESIA*
Periode: 1 Minggu (Senin s.d. Minggu)

👥 *Personil Standby per Hari:*
${scheduleDaySummary.map((d, i) => `• ${daysLabel[i]}: ${d.totalStaff} Orang (Pagi D047: ${d.morning} | Siang D103: ${d.evening})`).join("\n")}

_Diperbarui via Digiplus Store Operations Engine._`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handlePrintSchedule = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  // ==========================================
  // EXPORT KE SLIDE PPTX (9 SLIDE LENGKAP)
  // ==========================================
  const handleExportToPptx = async () => {
    setIsExportingPptx(true);
    try {
      // Injeksi Library PptxGenJS via CDN secara dinamis
      if (typeof window !== "undefined" && !(window as any).PptxGenJS) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => { script.onload = resolve; });
      }

      const pptx = new (window as any).PptxGenJS();
      pptx.layout = "LAYOUT_16x9";

      // SLIDE 1: Executive Overview
      const slide1 = pptx.addSlide();
      slide1.background = { color: "1A1831" };
      slide1.addText("STORE SALES PERFORMANCE & STAFF OPERATIONS REPORT", { x: 0.8, y: 1.8, fontSize: 24, bold: true, color: "F5BA42" });
      slide1.addText("Evaluasi Mingguan (WoW), Kategori Produk, & Suara Lapangan\nKode Toko: QF01 | Periode: Oktober 2026 | Cut-off: " + selectedDate, { x: 0.8, y: 3.2, fontSize: 14, color: "FFF6E9" });

      // SLIDE 2: Core KPI Metrics
      const slide2 = pptx.addSlide();
      slide2.addText("CORE KPI METRICS (TARGET VS PENCAPAIAN)", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      slide2.addTable([
        ["METRIK RETAIL", "TARGET", "AKTUAL (REALISASI)", "ACHIEVEMENT (%)", "VARIANCE (GAP)"],
        ["Total Penjualan Toko MTD", formatIDR(overviewStats.target), formatIDR(overviewStats.actual), `${overviewStats.achv}%`, formatIDR(overviewStats.variance)],
        ["Target Harian Toko", formatIDR(dailyTargetCalculated.targetStoreToday), formatIDR(dailyTargetCalculated.actualToday), `${dailyTargetCalculated.achvToday}%`, formatIDR(dailyTargetCalculated.actualToday - dailyTargetCalculated.targetStoreToday)],
        ["Target Kuota Rata-rata per Staf", formatIDR(dailyTargetCalculated.targetPerStaffToday), formatIDR(Math.round(dailyTargetCalculated.actualToday / dailyTargetCalculated.staffCount)), "-", "-"],
      ], { x: 0.5, y: 1.5, w: 9.0, fill: "F1F5F9", fontSize: 11, border: { pt: 1, color: "CBD5E1" } });

      // SLIDE 3: Analisis Penjualan Mingguan (WoW)
      const slide3 = pptx.addSlide();
      slide3.addText("ANALISIS PENJUALAN MINGGUAN (WEEKLY TREND WOW)", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      const weeklyRows = [["LABEL MINGGU", "RENTANG TANGGAL", "TOTAL PENJUALAN", "UNIT", "STRUK", "GROWTH WOW"]];
      weeklyReport.forEach((w) => {
        weeklyRows.push([w.label, w.range, formatIDR(w.sales), String(w.qty), String(w.invCount), `${w.wowGrowth}%`]);
      });
      slide3.addTable(weeklyRows, { x: 0.5, y: 1.5, w: 9.0, fill: "F8FAFC", fontSize: 10, border: { pt: 1, color: "CBD5E1" } });

      // SLIDE 4: Kategori 1 - Android Devices
      const slide4 = pptx.addSlide();
      slide4.addText("KATEGORI PRODUK 1: ANDROID DEVICES (ALL BRANDS)", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      slide4.addText("Termasuk seluruh perangkat smartphone/tablet Xiaomi, Redmi, Samsung, Oppo, Vivo, Motorola yang tercatat pada kolom L sebagai DEVICES.", { x: 0.5, y: 1.2, fontSize: 12, color: "475569" });
      slide4.addTable([
        ["KATEGORI LOB", "ACTUAL REVENUE", "TARGET", "ACHIEVEMENT", "STATUS"],
        ["Android Devices Hardware", formatIDR(overviewStats.lobs[1].actual), formatIDR(overviewStats.lobs[1].target), `${overviewStats.lobs[1].achv}%`, "Tertinggal"],
      ], { x: 0.5, y: 2.2, w: 9.0, fill: "F1F5F9", fontSize: 11 });

      // SLIDE 5: Kategori 2 - Apple Ecosystem
      const slide5 = pptx.addSlide();
      slide5.addText("KATEGORI PRODUK 2: APPLE ECOSYSTEM (HARDWARE MURNI)", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      slide5.addText("Hanya mencakup iPhone, iPad, MacBook, Apple Watch, dan AirPods. Aksesoris dan casing pihak ketiga dialokasikan terpisah.", { x: 0.5, y: 1.2, fontSize: 12, color: "475569" });
      slide5.addTable([
        ["KATEGORI LOB", "ACTUAL REVENUE", "TARGET", "ACHIEVEMENT", "STATUS"],
        ["Apple Devices Hardware", formatIDR(overviewStats.lobs[0].actual), formatIDR(overviewStats.lobs[0].target), `${overviewStats.lobs[0].achv}%`, "Tertinggal"],
      ], { x: 0.5, y: 2.2, w: 9.0, fill: "F1F5F9", fontSize: 11 });

      // SLIDE 6: Kategori 3 - Accessories & VAS
      const slide6 = pptx.addSlide();
      slide6.addText("KATEGORI PRODUK 3: ACCESSORIES & VAS (ATTACH RATE)", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      slide6.addTable([
        ["LOB PENDUKUNG", "ACTUAL OMSET", "TARGET", "ACHV %", "KETERANGAN"],
        ["Accessories (Casing, Adapter, dll)", formatIDR(overviewStats.lobs[2].actual), formatIDR(overviewStats.lobs[2].target), `${overviewStats.lobs[2].achv}%`, "Attach Rate Casing & Charger"],
        ["VAS (Qoala, Telkomsel, XL, Indosat)", formatIDR(overviewStats.lobs[3].actual), formatIDR(overviewStats.lobs[3].target), `${overviewStats.lobs[3].achv}%`, "Proteksi Gadget & Data Bundling"],
      ], { x: 0.5, y: 1.8, w: 9.0, fill: "F8FAFC", fontSize: 11 });

      // SLIDE 7: Evaluasi Kinerja Staf
      const slide7 = pptx.addSlide();
      slide7.addText("EVALUASI KINERJA STAF (STAFF LEADERBOARD)", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      const staffRows = [["RANK", "NAMA SALESPERSON", "ACTUAL OMSET", "TARGET KUOTA", "ACHV %", "UPT", "STATUS"]];
      staffList.forEach((s) => {
        staffRows.push([`#${s.rank}`, s.name, formatIDR(s.actual), formatIDR(s.target), `${s.achievement}%`, String(s.upt), s.status]);
      });
      slide7.addTable(staffRows, { x: 0.5, y: 1.4, w: 9.0, fill: "F1F5F9", fontSize: 9 });

      // SLIDE 8: Suara Staf & Kendala Lapangan
      const slide8 = pptx.addSlide();
      slide8.addText("FEEDBACK, KENDALA, & SUARA STAF (VOICE OF FIELD STAFF)", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      const fbRows = [["WAKTU", "SALESPERSON", "SENTIMEN", "CATATAN FEEDBACK / KENDALA LAPANGAN"]];
      feedbacks.slice(0, 4).forEach((f) => {
        fbRows.push([f.timestamp, f.salesName, f.sentiment, f.text]);
      });
      slide8.addTable(fbRows, { x: 0.5, y: 1.4, w: 9.0, fill: "F8FAFC", fontSize: 9 });

      // SLIDE 9: Rencana Aksi & Rekomendasi Taktis
      const slide9 = pptx.addSlide();
      slide9.addText("RENCANA AKSI & REKOMENDASI TAKTIS", { x: 0.5, y: 0.5, fontSize: 20, bold: true, color: "0F172A" });
      slide9.addText("1. Fokus Penutupan Gap: Kejar kekurangan omset melalui kampanye bundling proteksi Qoala dan aksesoris.\n2. Optimalisasi Program BNPL: Tawarkan cicilan 0% Kredivo, Indodana, Akulaku, dan Home Credit kepada customer walk-in.\n3. Daily Huddle & Coaching: Evaluasi harian target individual per shift untuk memastikan seluruh staf mencapai kuota minimum.\n4. Follow-up Prospek: Hubungi kembali database customer yang berminat pada seri iPhone 17 dan Galaxy S26 Ultra.", { x: 0.5, y: 1.6, w: 9.0, fontSize: 13, color: "1E293B", lineSpacing: 26 });

      pptx.writeFile({ fileName: `Laporan_Operasional_QF01_${selectedDate}.pptx` });
    } catch (err) {
      alert("Gagal mengekspor slide PowerPoint: " + err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  // Bottom Sheet Trigger
  const openCustomBottomSheet = (title: string, content: React.ReactNode) => {
    setSheetTitle(title);
    setSheetContent(content);
    setBottomSheetOpen(true);
  };

  const openLobDetailSheet = (lobName: string, items: RawTransaction[]) => {
    openCustomBottomSheet(`Rincian Produk: ${lobName} (${items.length} Item)`, (
      <div className="space-y-4 text-xs">
        <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-slate-700/50">
          <span>Total Nilai Kategori:</span>
          <strong className="text-emerald-400 font-bold text-sm">
            {formatIDR(items.reduce((acc, c) => acc + c.amount, 0))}
          </strong>
        </div>
        <div className="overflow-x-auto rounded-xl border border-inherit">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-black/40 uppercase text-[10px] border-b border-inherit">
              <tr>
                <th className="py-2.5 px-3">Nama Produk</th>
                <th className="py-2.5 px-3">SAP Article</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Nilai (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {items.map((it, idx) => (
                <tr key={idx} className="hover:opacity-90">
                  <td className="py-2.5 px-3 font-semibold">{it.productName}</td>
                  <td className="py-2.5 px-3 font-mono opacity-60 text-[10px]">{it.sapArticle || "-"}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-700/40 text-slate-300 font-bold">
                      {it.brand}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold">{it.qty}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatIDR(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  const openStaffDetailSheet = (staff: StaffFullData) => {
    openCustomBottomSheet(`Rincian Lengkap Salesperson: ${staff.name}`, (
      <div className="space-y-5 text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-xl border bg-black/20 border-slate-700/50">
            <span className="opacity-60 text-[10px] block">Actual</span>
            <strong className="text-emerald-400 font-bold">{formatIDR(staff.actual)}</strong>
          </div>
          <div className="p-2.5 rounded-xl border bg-black/20 border-slate-700/50">
            <span className="opacity-60 text-[10px] block">Target</span>
            <strong className="opacity-80">{formatIDR(staff.target)}</strong>
          </div>
          <div className="p-2.5 rounded-xl border bg-black/20 border-slate-700/50">
            <span className="opacity-60 text-[10px] block">Achv</span>
            <strong className={staff.achievement >= 100 ? "text-emerald-400" : "text-amber-400"}>
              {staff.achievement}%
            </strong>
          </div>
          <div className="p-2.5 rounded-xl border bg-black/20 border-slate-700/50">
            <span className="opacity-60 text-[10px] block">UPT</span>
            <strong className="text-sky-400">{staff.upt}</strong>
          </div>
        </div>

        {/* 1. Sub-Lini Apple Devices */}
        <div>
          <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🍎</span>
            <span>Rincian Apple Devices (Hardware Utama)</span>
          </h4>
          <div className="overflow-x-auto rounded-xl border border-inherit">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 uppercase text-[10px] border-b border-inherit">
                <tr>
                  <th className="py-2 px-3">Produk</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Nilai Omset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {staff.appleSub.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </td>
                    <td className="py-2 px-3 text-center">{p.qty}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">{formatIDR(p.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Sub-Lini Android Devices */}
        <div>
          <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🤖</span>
            <span>Rincian Android Devices (Samsung, Xiaomi, dll)</span>
          </h4>
          <div className="overflow-x-auto rounded-xl border border-inherit">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 uppercase text-[10px] border-b border-inherit">
                <tr>
                  <th className="py-2 px-3">Brand</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Nilai Omset</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {staff.androidSub.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-semibold flex items-center gap-1.5">
                      <span>{p.icon}</span>
                      <span>{p.name}</span>
                    </td>
                    <td className="py-2 px-3 text-center">{p.qty}</td>
                    <td className="py-2 px-3 text-right font-bold text-emerald-400">{formatIDR(p.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Sub-Lini Accessories */}
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🔌</span>
            <span>Accessories (Nominal Besar ke Kecil)</span>
          </h4>
          <div className="overflow-x-auto rounded-xl border border-inherit">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 uppercase text-[10px] border-b border-inherit">
                <tr>
                  <th className="py-2 px-3">Nama Aksesoris</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {staff.accessoriesSub.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-center opacity-60">Tidak ada item aksesoris.</td>
                  </tr>
                ) : (
                  staff.accessoriesSub.map((p, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-semibold">{p.name}</td>
                      <td className="py-2 px-3 text-center">{p.qty}</td>
                      <td className="py-2 px-3 text-right font-bold text-amber-400">{formatIDR(p.actual)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Sub-Lini VAS */}
        <div>
          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🛡️</span>
            <span>VAS (Qoala, Telkomsel, XL, Indosat)</span>
          </h4>
          <div className="overflow-x-auto rounded-xl border border-inherit">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/30 uppercase text-[10px] border-b border-inherit">
                <tr>
                  <th className="py-2 px-3">Layanan</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-inherit">
                {staff.vasSub.map((p, idx) => (
                  <tr key={idx}>
                    <td className="py-2 px-3 font-semibold">{p.name}</td>
                    <td className="py-2 px-3 text-center">{p.qty}</td>
                    <td className="py-2 px-3 text-right font-bold text-purple-400">{formatIDR(p.actual)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ));
  };

  const openWeeklyStaffSheet = (wLabel: string, weekTransactions: RawTransaction[]) => {
    const staffMap: Record<string, { name: string; apple: number; android: number; acc: number; vas: number; total: number; qty: number }> = {};
    weekTransactions.forEach((t) => {
      const sName = t.salesName || "Unknown";
      if (!staffMap[sName]) staffMap[sName] = { name: sName, apple: 0, android: 0, acc: 0, vas: 0, total: 0, qty: 0 };
      staffMap[sName].total += t.amount;
      staffMap[sName].qty += t.qty;
      if (t.brand === "APPLE" && t.groupCategory === "DEVICES") staffMap[sName].apple += t.amount;
      else if (t.groupCategory === "DEVICES") staffMap[sName].android += t.amount;
      else if (t.groupCategory === "ACCESSORIES") staffMap[sName].acc += t.amount;
      else if (t.groupCategory === "VAS") staffMap[sName].vas += t.amount;
    });

    const staffRows = Object.values(staffMap).sort((a, b) => b.total - a.total);

    openCustomBottomSheet(`Pencapaian Staf: ${wLabel}`, (
      <div className="space-y-4 text-xs">
        <div className="flex justify-between items-center p-3 rounded-xl bg-black/20 border border-slate-700/50">
          <span>Total Penjualan Minggu Ini:</span>
          <strong className="text-emerald-400 font-bold text-sm">
            {formatIDR(weekTransactions.reduce((acc, c) => acc + c.amount, 0))}
          </strong>
        </div>
        <div className="overflow-x-auto rounded-xl border border-inherit">
          <table className="w-full text-left text-xs min-w-[600px]">
            <thead className="bg-black/40 uppercase text-[10px] border-b border-inherit">
              <tr>
                <th className="py-2.5 px-3">Salesperson</th>
                <th className="py-2.5 px-3 text-center">Unit</th>
                <th className="py-2.5 px-3 text-right text-sky-400">Apple</th>
                <th className="py-2.5 px-3 text-right text-indigo-400">Android</th>
                <th className="py-2.5 px-3 text-right text-amber-400">Acc</th>
                <th className="py-2.5 px-3 text-right text-purple-400">VAS</th>
                <th className="py-2.5 px-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {staffRows.map((s, idx) => (
                <tr key={idx} className="hover:opacity-90">
                  <td className="py-2.5 px-3 font-bold">{s.name}</td>
                  <td className="py-2.5 px-3 text-center font-bold">{s.qty}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-sky-400">{formatIDR(s.apple)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-indigo-400">{formatIDR(s.android)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400">{formatIDR(s.acc)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-purple-400">{formatIDR(s.vas)}</td>
                  <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatIDR(s.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  if (!isMounted) return null;

  // Styling Dinamis Tema
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#1A1831]" : "bg-[#F9F8F3]";
  const textMain = isDark ? "text-[#FFF6E9]" : "text-[#1E293B]";
  const textMuted = isDark ? "text-[#FFF6E9]/70" : "text-slate-600";
  const cardBg = isDark ? "bg-[#221F40] border-[#3B3666]" : "bg-white border-[#E5E2D9] shadow-sm";
  const innerBg = isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F2EFE9] border-[#E5E2D9]";
  const accentText = isDark ? "text-[#F5BA42]" : "text-[#054ff0]";
  const activeTabBtn = isDark ? "bg-[#F5BA42] text-[#1A1831] font-black shadow-md" : "bg-[#054ff0] text-white font-black shadow-md";

  // =============================================================
  // RENDER: HALAMAN LOGIN SECURE
  // =============================================================
  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4 ${textMain} font-sans`}>
        <div className={`max-w-md w-full ${cardBg} border-2 rounded-3xl p-6 md:p-8 shadow-2xl`}>
          <div className="text-center mb-6 flex flex-col items-center justify-center">
            {/* 1. Logo Digiplus */}
            <img 
              src="/apple-touch-icon.png" 
              alt="Logo Digiplus" 
              className="w-16 h-16 object-contain rounded-2xl bg-white p-1 shadow-md mb-2"
            />
            {/* 2. Tulisan QF01 */}
            <h2 className="font-black text-2xl text-black tracking-wider mb-2">
              QF01
            </h2>
            <h1 className="text-xl font-bold">DIGIPLUS GRAND INDONESIA</h1>
            <p className={`text-xs ${accentText} mt-1 font-semibold`}>PORTAL DASHBOARD SALES</p>
          </div>
          
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

  // =============================================================
  // RENDER: DASHBOARD UTAMA
  // =============================================================
  return (
    <div className={`flex min-h-screen ${bgMain} ${textMain} font-sans relative`}>
      {/* Mobile Drawer Trigger Button */}
      <div className="lg:hidden fixed bottom-5 right-5 z-40 print:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`w-14 h-14 rounded-full ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} font-black text-2xl flex items-center justify-center shadow-2xl transition active:scale-95`}
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 print:hidden" />
      )}

      {/* SIDEBAR SEBELAH KIRI */}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 print:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } w-72 ${isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F2EFE9] border-[#E5E2D9]"} border-r flex flex-col justify-between shrink-0 shadow-2xl lg:shadow-none`}
      >
        <div className="p-4 overflow-y-auto">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 pb-4 border-b border-inherit">
            <div className={`w-10 h-10 ${isDark ? "bg-[#F5BA42] text-[#1A1831]" : "bg-[#054ff0] text-white"} rounded-xl flex items-center justify-center font-black text-lg`}>
              QF10
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider">DIGIPLUS</h2>
              <p className={`text-[10px] ${accentText} font-semibold`}>GRAND INDONESIA</p>
            </div>
          </div>

          {/* User Tag Sapaan */}
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

            {/* PINTASAN EXPORT PPTX DI SIDEBAR */}
            <div className="px-1 py-1">
              <button
                onClick={handleExportToPptx}
                disabled={isExportingPptx}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-[#F5BA42] font-black text-xs shadow-md transition active:scale-95"
              >
                <span>📽️</span>
                <span>{isExportingPptx ? "Membuat Slide..." : "Export ke Slide PPTX"}</span>
              </button>
            </div>

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
              onClick={() => { setActiveTab("daily-target"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "daily-target" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>🎯</span>
              <span>Daily Target & Run Rate</span>
            </button>

            <button
              onClick={() => { setActiveTab("schedule"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "schedule" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>📅</span>
              <span>Schedule 1 Minggu</span>
            </button>

            <button
              onClick={() => { setActiveTab("feedback"); setMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                activeTab === "feedback" ? activeTabBtn : "opacity-70 hover:opacity-100"
              }`}
            >
              <span>💬</span>
              <span>Feedback Ritel</span>
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
            <button
                onClick={() => { setActiveTab("product-search"); setMobileMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition ${
                  activeTab === "product-search" ? activeTabBtn : "opacity-70 hover:opacity-100"
                }`}
              >
                <span>🔍</span>
                <span>Cari Produk Terjual</span>
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
            <button
            onClick={() => { setUploadModalOpen(true); setMobileMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition opacity-70 hover:opacity-100 hover:bg-white/5"
          >
            <span>📤</span>
            <span>Upload Bukti RAW</span>
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
        {/* HEADER: PERSONALISASI & FILTER */}
        <header className="mb-6 border-b border-inherit pb-5 print:hidden">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <div>
              <div className={`text-xl sm:text-2xl font-black ${accentText} flex items-center gap-2`}>
                <span>Halo, {currentSalesName} 👋</span>
              </div>
              <p className={`text-xs ${textMuted} mt-1`}>
                Live Feed: <code>DATABASE</code> (gid: 602901290) & <code>BNPL DATABASE</code> (gid: 2697970)
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
                onClick={fetchLiveGoogleSheets}
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

          {/* Baris Filter Dinamis */}
          <div className={`p-3 ${cardBg} border rounded-2xl flex flex-wrap items-center gap-3 justify-between text-xs`}>
            <div className="flex flex-wrap items-center gap-3">
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

              {periodType === "monthly" && (
                <div className="flex items-center gap-2">
                  <span className="opacity-70 font-semibold">📅 Bulan:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
                  >
                    <option value="Oktober2026">Oktober 2026</option>
                    <option value="September2026">September 2026</option>
                    <option value="ALL">Semua Bulan</option>
                  </select>
                </div>
              )}

              {periodType === "weekly" && (
                <div className="flex items-center gap-2">
                  <span className="opacity-70 font-semibold">📊 Week:</span>
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className={`${innerBg} border rounded-xl px-2.5 py-1 font-bold focus:outline-none`}
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
                      <span className="opacity-60 text-[11px]">Penjualan Hari Ini:</span>
                      <div className="text-sm font-black text-emerald-500 mt-0.5">{formatIDR(overviewStats.todayActual)}</div>
                    </div>
                  </div>
                </div>

                {/* Trend Daily Sales */}
                <div className={`p-5 rounded-3xl border ${cardBg} space-y-3`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider">Trend Daily Sales vs Target Ideal Harian</h3>
                      <p className={`text-xs ${textMuted} mt-0.5`}>Perbandingan omset harian terhadap target flat {formatIDR(Math.round(8728667173 / 31))}/hari</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[600px]">
                      <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                        <tr>
                          <th className="py-2.5 px-3">Tanggal</th>
                          <th className="py-2.5 px-3 text-right">Actual Omset</th>
                          <th className="py-2.5 px-3 text-right">Target Ideal</th>
                          <th className="py-2.5 px-3 text-right">Gap Harian</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit">
                        {dailyTrendStats.map((d, i) => (
                          <tr key={i} className="hover:opacity-90">
                            <td className="py-2.5 px-3 font-bold">{d.dayLabel}</td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-emerald-400">{formatIDR(d.actual)}</td>
                            <td className="py-2.5 px-3 text-right opacity-70 font-mono">{formatIDR(d.target)}</td>
                            <td className={`py-2.5 px-3 text-right font-mono font-bold ${d.gap >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {formatIDR(d.gap)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.actual >= d.target ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                                {d.actual >= d.target ? "Tercapai" : "Under"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Matriks 4 LOB Kategori */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h2 className="text-base font-bold">Matriks Kategori Produk ({periodType.toUpperCase()})</h2>
                    <span className={`text-[11px] ${textMuted} hidden sm:inline`}>Apple Murni Hardware • Android Devices Termasuk Xiaomi</span>
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
                          <th className="py-4 px-4 text-center">Aksi</th>
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
                                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${activeTabBtn}`}
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

                {/* Rank Sales per Staff & UPT */}
                <div className={`p-4 sm:p-6 ${cardBg} border rounded-3xl shadow-xl`}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold">🏆 Rank Sales per Staff & UPT ({periodType.toUpperCase()} Terfilter)</h3>
                  </div>
                  <div className="w-full space-y-3">
            {staffList.map((s: any) => (
              <div 
                key={s.salesId} 
                className={`p-3.5 rounded-2xl ${innerBg} border border-white/10 flex flex-col gap-2.5 shadow-md`}
              >
                {/* Baris Atas: Rank, Info Sales, dan Omzet */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span 
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        s.rank === 1 
                          ? isDark ? "bg-[#F5BA42] text-[#1A1031]" : "bg-[#054ff0] text-white" 
                          : "opacity-60 text-white"
                      }`}
                    >
                      {s.rank}
                    </span>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">
                        {s.name}
                      </h4>
                      <p className="text-[10px] opacity-60 font-mono mt-0.5">
                        ID: {s.salesId}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-400 whitespace-nowrap">
                      {formatIDR(s.actual)}
                    </p>
                  </div>
                </div>

                {/* Baris Tengah: Rincian Unit, Struk, UPT */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
                  <div className="bg-black/20 py-1.5 px-2 rounded-xl">
                    <span className="text-[9px] opacity-60 block uppercase font-medium">Unit</span>
                    <span className="text-xs font-bold text-sky-400">{s.qty}</span>
                  </div>
                  <div className="bg-black/20 py-1.5 px-2 rounded-xl">
                    <span className="text-[9px] opacity-60 block uppercase font-medium">Struk</span>
                    <span className="text-xs font-bold text-slate-200">{s.invoicesCount}</span>
                  </div>
                  <div className="bg-black/20 py-1.5 px-2 rounded-xl">
                    <span className="text-[9px] opacity-60 block uppercase font-medium">UPT</span>
                    <span className="text-xs font-bold text-sky-400">{s.upt}</span>
                  </div>
                </div>

                {/* Baris Bawah: Tombol Detail Drilldown */}
                <button
                  onClick={() => openStaffDetailSheet(s)}
                  className={`w-full py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center ${activeTabBtn}`}
                >
                  Detail Drilldown
                </button>
              </div>
        ))}
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
                        Mendeteksi seluruh minggu otomatis dari Kolom O sheet <code>DATABASE</code> (termasuk W5 dan minggu mendatang).
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

                  {/* Grid Mingguan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {weeklyReport.map((w, idx) => (
                      <div key={idx} className={`p-3.5 ${innerBg} border rounded-2xl flex flex-col justify-between`}>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-xs font-bold ${accentText}`}>{w.label}</span>
                            {idx > 0 && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${w.wowGrowth >= 0 ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500"}`}>
                                {w.wowGrowth > 0 ? `+${w.wowGrowth}%` : `${w.wowGrowth}%`}
                              </span>
                            )}
                          </div>
                          <p className={`text-[9px] ${textMuted} mb-1.5`}>{w.range}</p>
                          <div className="text-base font-black mt-1">{formatIDR(w.sales)}</div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-inherit flex items-center justify-between">
                          <button
                            onClick={() => openWeeklyStaffSheet(w.label, w.matchTrx)}
                            className="text-[10px] font-bold text-sky-400 hover:underline"
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

                  {/* Tabel Breakdown Mingguan */}
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
                          <th className="py-4 px-4 text-center">Aksi</th>
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
                            <td className="py-4 px-4 text-center">
                              <button
                                onClick={() => openWeeklyStaffSheet(w.label, w.matchTrx)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition ${activeTabBtn}`}
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

            {/* ========================================================= */}
            {/* TAB 3: STAFF PERFORMANCE DETAIL (SEMUA STAF DITAMPILKAN)  */}
            {/* ========================================================= */}
            {activeTab === "staff-performance" && (
              <div className="space-y-6 sm:space-y-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-2">
                    <span>👥</span>
                    <span>RINCIAN DETAIL SELURUH STAF SALES ({staffList.length} ORANG)</span>
                  </h2>
                </div>

                {staffList.map((staff) => (
                  <div key={staff.salesId} className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl relative overflow-hidden space-y-5`}>
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
                          <p className={`text-xs ${textMuted} font-mono`}>ID Staf: {staff.salesId} • {staff.invoicesCount} Struk Terbit</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-right">
                        <div className={`px-3 py-1.5 rounded-xl border ${innerBg}`}>
                          <span className="text-[9px] opacity-60 uppercase block">Actual Omset</span>
                          <span className="text-xs sm:text-sm font-black text-emerald-400">{formatIDR(staff.actual)}</span>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl border ${innerBg}`}>
                          <span className="text-[9px] opacity-60 uppercase block">UPT Staf</span>
                          <span className="text-xs sm:text-sm font-black text-sky-400">{staff.upt}</span>
                        </div>
                      </div>
                    </div>

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                            <span>🔌</span>
                            <span>Accessories Pencapaian</span>
                          </span>
                          <span className="text-xs font-black text-amber-400">{formatIDR(staff.totalAccActual)}</span>
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border ${innerBg}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                            <span>🛡️</span>
                            <span>VAS Pencapaian</span>
                          </span>
                          <span className="text-xs font-black text-purple-400">{formatIDR(staff.totalVasActual)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => openStaffDetailSheet(staff)}
                        className={`px-4 py-2.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${activeTabBtn}`}
                      >
                        <span>Detail &gt;</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: MENU DAILY TARGET (TARGET HARIAN VS PENCAPAIAN)     */}
            {/* ========================================================= */}
            {activeTab === "daily-target" && (
              <div className="space-y-6">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                        <span>🎯</span>
                        <span>TARGET HARIAN VS PENCAPAIAN BERJALAN</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-0.5`}>
                        Tanggal: {selectedDate} • Hari ke-{dailyTargetCalculated.daysPassed} ({dailyTargetCalculated.daysLeft} Hari Tersisa)
                      </p>
                    </div>

                    <button
                      onClick={handleShareTargetWA}
                      className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <span>📲</span>
                      <span>Share Target (WhatsApp)</span>
                    </button>
                  </div>

                  {/* Kartu Status Hari Ini & Target Baru */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Target Toko Hari Ini */}
                    <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#141226] border-[#3B3666]" : "bg-white border-slate-200 shadow-sm"}`}>
                      <span className="text-[11px] font-bold text-[#475569] uppercase block tracking-wider">
                        TARGET TOKO HARI INI
                      </span>
                      <div className="text-2xl font-black text-[#0F172A] dark:text-[#FFF6E9] mt-1">
                        {formatIDR(dailyTargetCalculated.targetStoreToday)}
                      </div>
                      <span className="text-[11px] font-bold text-[#B45309] dark:text-amber-400 mt-1 block">
                        Wajib Dikejar per Hari
                      </span>
                    </div>

                    {/* Pencapaian Hari Ini */}
                    <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#141226] border-[#3B3666]" : "bg-white border-slate-200 shadow-sm"}`}>
                      <span className="text-[11px] font-bold text-[#475569] uppercase block tracking-wider">
                        PENCAPAIAN HARI INI
                      </span>
                      <div className="text-2xl font-black text-[#047857] dark:text-emerald-400 mt-1">
                        {formatIDR(dailyTargetCalculated.actualToday)}
                      </div>
                      <span className={`text-[11px] font-bold mt-1 inline-block px-2.5 py-0.5 rounded ${
                        dailyTargetCalculated.actualToday >= dailyTargetCalculated.targetStoreToday 
                          ? "bg-emerald-100 text-[#047857]" 
                          : "bg-[#FEE2E2] text-[#991B1B]"
                      }`}>
                        {dailyTargetCalculated.actualToday >= dailyTargetCalculated.targetStoreToday ? "Tercapai" : "Belum Tercapai"} ({dailyTargetCalculated.achvToday}%)
                      </span>
                    </div>

                    {/* Target per Staff Hari Ini */}
                    <div className={`p-4 rounded-2xl border ${isDark ? "bg-[#141226] border-[#3B3666]" : "bg-white border-slate-200 shadow-sm"}`}>
                      <span className="text-[11px] font-bold text-[#475569] uppercase block tracking-wider">
                        TARGET PER STAF HARI INI
                      </span>
                      <div className="text-2xl font-black text-[#0369A1] dark:text-sky-400 mt-1">
                        {formatIDR(dailyTargetCalculated.targetPerStaffToday)}
                      </div>
                      <span className="text-[11px] text-[#64748B] mt-1 block">
                        Dibagi {dailyTargetCalculated.staffCount} Staf Bertugas
                      </span>
                    </div>
                  </div>

                  {/* Daftar Staf yang Bertugas Hari Ini */}
                  <div className="space-y-2 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-slate-300">
                      DAFTAR STAF BERTUGAS HARI INI & KUOTA TARGET:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                      {dailyTargetCalculated.staffOnDuty.map((s) => (
                        <div key={s.id} className={`p-3 rounded-xl border flex justify-between items-center ${isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#F8FAFC] border-slate-200"}`}>
                          <div>
                            <span className="font-bold text-xs text-[#0F172A] dark:text-white block">{s.name}</span>
                            <span className="text-[10px] text-[#64748B]">{s.role}</span>
                          </div>
                          <span className="font-mono font-bold text-xs text-[#0F172A] dark:text-[#F5BA42]">
                            {formatIDR(dailyTargetCalculated.targetPerStaffToday)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Riwayat Pencapaian Mengikuti Tanggal Berjalan */}
                  <div className="pt-4 border-t border-inherit space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#475569] dark:text-slate-300">
                      RIWAYAT PENCAPAIAN TANGGAL BERJALAN (1 - 31 OKT):
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-inherit">
                      <table className="w-full text-left text-xs min-w-[600px]">
                        <thead className={`${innerBg} uppercase text-[10px] border-b border-inherit`}>
                          <tr>
                            <th className="py-2.5 px-3">Tanggal</th>
                            <th className="py-2.5 px-3 text-right">Target Harian</th>
                            <th className="py-2.5 px-3 text-right">Pencapaian Aktual</th>
                            <th className="py-2.5 px-3 text-center">Progress %</th>
                            <th className="py-2.5 px-3 text-right">Selisih (+/-)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-inherit font-medium">
                          {dailyTrendStats.map((d, i) => {
                            const pAchv = calcAchv(d.actual, d.target);
                            return (
                              <tr key={i} className="hover:opacity-90">
                                <td className="py-2.5 px-3 font-bold">{d.dayLabel} (Hari {i + 1})</td>
                                <td className="py-2.5 px-3 text-right font-mono opacity-70">{formatIDR(d.target)}</td>
                                <td className="py-2.5 px-3 text-right font-extrabold text-[#047857] dark:text-emerald-400">{formatIDR(d.actual)}</td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    pAchv >= 100 
                                      ? "bg-emerald-100 text-[#047857]" 
                                      : pAchv >= 70 
                                      ? "bg-amber-100 text-[#B45309]" 
                                      : "bg-[#FEE2E2] text-[#991B1B]"
                                  }`}>
                                    {pAchv}%
                                  </span>
                                </td>
                                <td className={`py-2.5 px-3 text-right font-mono font-bold ${d.gap >= 0 ? "text-[#047857] dark:text-emerald-400" : "text-[#991B1B] dark:text-red-400"}`}>
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

            {/* ========================================================= */}
            {/* TAB 5: MENU SCHEDULE 1 MINGGU (SENIN S.D. MINGGU)        */}
            {/* ========================================================= */}
            {activeTab === "schedule" && (
              <div className="space-y-6">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
                        <span>📅</span>
                        <span>JADWAL OPERASIONAL KERJA 1 MINGGU (SENIN - MINGGU)</span>
                      </h2>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Shift: ⛅ D047 (Pagi: 09-17) | ☀️ D103 (Siang: 14-22) | 🏠 OFF | 📚 TR (Training)
                      </p>
                    </div>

                    <div className="flex items-center gap-2 print:hidden">
                      <button
                        onClick={handlePrintSchedule}
                        className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${innerBg}`}
                      >
                        <span>🖨️</span>
                        <span>Print / Export PDF</span>
                      </button>

                      <button
                        onClick={handleShareScheduleWA}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <span>📲</span>
                        <span>Share WhatsApp</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-center">
                    {scheduleDaySummary.map((d, i) => {
                      const dayNames = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
                      return (
                        <div key={d.day} className={`p-3 rounded-2xl border ${innerBg}`}>
                          <span className={`text-xs font-bold block ${accentText}`}>{dayNames[i]}</span>
                          <span className="text-lg font-black block mt-0.5">{d.totalStaff} Orang</span>
                          <span className="text-[10px] opacity-60 block mt-1">Pagi: {d.morning} | Siang: {d.evening}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className={`overflow-x-auto rounded-2xl border ${innerBg}`}>
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className={`${innerBg} uppercase text-[11px] border-b border-inherit`}>
                        <tr>
                          <th className="py-3 px-4">Nama Staf</th>
                          <th className="py-3 px-3">Role</th>
                          <th className="py-3 px-3 text-center">Senin</th>
                          <th className="py-3 px-3 text-center">Selasa</th>
                          <th className="py-3 px-3 text-center">Rabu</th>
                          <th className="py-3 px-3 text-center">Kamis</th>
                          <th className="py-3 px-3 text-center">Jumat</th>
                          <th className="py-3 px-3 text-center">Sabtu</th>
                          <th className="py-3 px-3 text-center">Minggu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-inherit font-medium">
                        {scheduleData.map((s) => (
                          <tr key={s.id} className="hover:opacity-90 transition">
                            <td className="py-3 px-4 font-bold text-white">{s.name}</td>
                            <td className="py-3 px-3 opacity-70 text-[11px]">{s.role}</td>
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
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border focus:outline-none cursor-pointer ${
                                        isOff
                                          ? "bg-slate-700/40 text-slate-300 border-slate-600"
                                          : isMorning
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                          : isEvening
                                          ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                                          : "bg-purple-500/20 text-purple-300 border-purple-500/40"
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
                                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border inline-block ${
                                        isOff
                                          ? "bg-slate-700/40 text-slate-300 border-slate-600"
                                          : isMorning
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                          : isEvening
                                          ? "bg-sky-500/20 text-sky-300 border-sky-500/40"
                                          : "bg-purple-500/20 text-purple-300 border-purple-500/40"
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

            {/* ========================================================= */}
            {/* TAB 6: RIWAYAT FEEDBACK (GOOGLE REVIEW STYLE)             */}
            {/* ========================================================= */}
            {activeTab === "feedback" && (
              <div className="space-y-6">
                <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
                  <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
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
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${innerBg} focus:outline-none`}
                      >
                        <option value="ALL">Pilih Semua Staf</option>
                        {staffList.map((s) => (
                          <option key={s.salesId} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => setFeedbackModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-700 text-white text-xs font-bold transition shadow-lg shadow-blue-500/20 active:scale-95"
                      >
                        + Tulis Feedback Baru
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    {feedbacks
                      .filter((f) => selectedFeedbackStaff === "ALL" || f.salesName === selectedFeedbackStaff)
                      .map((fb) => (
                        <div
                          key={fb.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                            isDark ? "bg-[#141226] border-[#3B3666]" : "bg-[#FAF9F5] border-[#E5E2D9] shadow-sm"
                          }`}
                        >
                          <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center text-xs border border-blue-400/40">
                                {fb.initials}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-sm">{fb.salesName}</h4>
                                  <span className="text-[10px] opacity-60">({fb.salesRole})</span>
                                </div>
                                <span className="text-[10px] opacity-50">{fb.timestamp}</span>
                              </div>
                            </div>

                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                                fb.sentiment === "Luar Biasa"
                                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-400/30"
                                  : fb.sentiment === "Cukup Baik"
                                  ? "bg-amber-500/15 text-amber-400 border-amber-400/30"
                                  : "bg-red-500/15 text-red-400 border-red-400/30"
                              }`}
                            >
                              {fb.sentiment}
                            </span>
                          </div>

                          <div
                            className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                              isDark ? "bg-[#1E1B38] border-[#3B3666] text-[#FFF6E9]" : "bg-white border-[#EAE7DC] text-[#1E293B]"
                            }`}
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
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1 active:scale-90 ${
                                    isClicked
                                      ? "bg-blue-500/20 text-blue-400 border-blue-400 shadow-sm"
                                      : `${innerBg} border-inherit opacity-70 hover:opacity-100`
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

                {/* MODAL INPUT FEEDBACK BARU */}
                {feedbackModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className={`w-full max-w-lg rounded-3xl ${cardBg} border-2 border-[#3B3666] p-6 shadow-2xl space-y-4`}>
                      <div className="flex justify-between items-center pb-3 border-b border-inherit">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <span>✍️</span>
                          <span>Tulis Feedback Penjualan Baru</span>
                        </h3>
                        <button
                          onClick={() => setFeedbackModalOpen(false)}
                          className="w-8 h-8 rounded-full bg-slate-700/40 hover:bg-slate-700/60 flex items-center justify-center text-xs"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleCreateFeedback} className="space-y-4 text-xs">
                        <div>
                          <label className="font-bold uppercase tracking-wider block mb-1">Pilih Nama Sales</label>
                          <select
                            value={newFeedbackStaff}
                            onChange={(e) => setNewFeedbackStaff(e.target.value)}
                            className={`w-full px-3 py-2.5 rounded-xl border ${innerBg} focus:outline-none`}
                          >
                            {staffList.map((s) => (
                              <option key={s.salesId} value={s.name}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-bold uppercase tracking-wider block mb-1">Sentimen / Evaluasi Cepat</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["Luar Biasa", "Cukup Baik", "Kecewa"] as const).map((sent) => (
                              <button
                                type="button"
                                key={sent}
                                onClick={() => setNewFeedbackSentiment(sent)}
                                className={`py-2 rounded-xl font-bold border transition ${
                                  newFeedbackSentiment === sent
                                    ? sent === "Luar Biasa"
                                      ? "bg-emerald-500 text-white border-emerald-400"
                                      : sent === "Cukup Baik"
                                      ? "bg-amber-500 text-slate-950 border-amber-400"
                                      : "bg-red-500 text-white border-red-400"
                                    : `${innerBg} opacity-70`
                                }`}
                              >
                                {sent}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="font-bold uppercase tracking-wider block mb-1">Catatan Ulasan Penjualan</label>
                          <textarea
                            rows={4}
                            required
                            placeholder="Tuliskan apresiasi, closing sukses, atau kendala interaksi penjualan..."
                            value={newFeedbackText}
                            onChange={(e) => setNewFeedbackText(e.target.value)}
                            className={`w-full p-3 rounded-xl border ${innerBg} focus:outline-none`}
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setFeedbackModalOpen(false)}
                            className={`px-4 py-2 rounded-xl ${innerBg} border`}
                          >
                            Batal
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-blue-700 text-white font-bold"
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

            {/* ========================================================= */}
            {/* TAB 7: BNPL TRANSACTIONS (BERBASIS TENDER TABS ZERO-RELOAD)*/}
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

                  {/* KARTU PENCAPAIAN PER MITRA TENDER */}
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

                  {/* TABS FILTER MITRA TENDER */}
                  <div className="pt-4">
                    <div className="flex flex-wrap gap-2 pb-2">
                      <button
                        onClick={() => setSelectedBnplTender("ALL")}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          selectedBnplTender === "ALL" ? activeTabBtn : `${innerBg} border opacity-70 hover:opacity-100`
                        }`}
                      >
                        Semua Tender ({bnplRecords.length})
                      </button>
                      {bnplSummary.tenders.map((t) => (
                        <button
                          key={t.tender}
                          onClick={() => setSelectedBnplTender(t.tender)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                            selectedBnplTender.toLowerCase() === t.tender.toLowerCase()
                              ? activeTabBtn
                              : `${innerBg} border opacity-70 hover:opacity-100`
                          }`}
                        >
                          {t.tender} ({t.qty} Unit)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LOG TABEL TRANSAKSI BNPL */}
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
            {/* TAB 8: KHUSUS ADMIN (22008089) - ACTIVITY STAFF           */}
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
                        localStorage.removeItem("digi_ops_activity_logs");
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
            {/* TAB 9: DETAIL LOG TRANSAKSI                               */}
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
        {activeTab === "product-search" && (
            <div className="space-y-6">
              {/* Header & Input Filter */}
              <div className={`p-6 ${cardBg} border rounded-2xl shadow-xl space-y-4`}>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🔍</span> PENCARIAN PRODUK TERJUAL
                </h2>
                <p className="text-xs text-slate-400">
                  Cari histori transaksi berdasarkan Nomor Artikel SAP atau Nama/Deskripsi Produk.
                </p>

                <div className="relative">
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    placeholder="Ketik kode artikel SAP atau nama produk (contoh: iPhone 17, Casing, 102938)..."
                    className={`w-full p-3.5 pl-10 rounded-xl ${innerBg} border text-sm text-white focus:outline-none focus:border-amber-400`}
                  />
                  <span className="absolute left-3.5 top-3.5 text-slate-400">🔎</span>
                </div>
              </div>

              {/* Logika Filter & Perhitungan Ringkasan */}
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
                    {/* Ringkasan Akumulasi Total */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className={`p-5 ${cardBg} border rounded-2xl`}>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Total Unit Terjual</span>
                        <p className="text-2xl font-black text-amber-400 mt-1">{totalQty.toLocaleString("id-ID")} Qty</p>
                      </div>
                      <div className={`p-5 ${cardBg} border rounded-2xl`}>
                        <span className="text-xs text-slate-400 uppercase font-semibold">Total Nilai Penjualan (Amount)</span>
                        <p className="text-2xl font-black text-emerald-400 mt-1">Rp {totalAmount.toLocaleString("id-ID")}</p>
                      </div>
                    </div>

                    {/* Tabel Detail Transaksi */}
                    <div className={`overflow-x-auto rounded-2xl border ${cardBg}`}>
                      <table className="w-full text-left text-xs text-slate-200">
                        <thead className={`${innerBg} uppercase text-[11px] border-b border-white/10 text-slate-400`}>
                          <tr>
                            <th className="py-3 px-4">Tanggal</th>
                            <th className="py-3 px-4">Sales Person</th>
                            <th className="py-3 px-4">Artikel SAP</th>
                            <th className="py-3 px-4">Deskripsi Produk</th>
                            <th className="py-3 px-4 text-center">Qty</th>
                            <th className="py-3 px-4 text-right">Amount (Rp)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filtered.length > 0 ? (
                            filtered.map((item: any, idx: number) => (
                              <tr key={idx} className="hover:bg-white/5">
                                <td className="py-3 px-4 whitespace-nowrap">{item.date || item.isoDate || "-"}</td>
                                <td className="py-3 px-4 font-bold text-white">
                                  {item.salesName || "-"}
                                  <span className="block text-[10px] text-slate-400 font-normal">{item.salesId}</span>
                                </td>
                                <td className="py-3 px-4 font-mono text-amber-400">{item.sapArticle || "-"}</td>
                                <td className="py-3 px-4 max-w-xs">{item.productName || "-"}</td>
                                <td className="py-3 px-4 text-center font-bold text-sky-400">{item.qty || 0}</td>
                                <td className="py-3 px-4 text-right font-bold text-emerald-400">
                                  Rp {(Number(item.amount) || 0).toLocaleString("id-ID")}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="text-center py-8 text-slate-400">
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
      </main>

      {/* ========================================================= */}
      {/* BOTTOM SHEET MODAL DRILLDOWN (DRAWER DARI BAWAH)          */}
      {/* ========================================================= */}
      {bottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm transition-opacity animate-in fade-in">
          <div className={`w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl ${cardBg} border-2 border-[#3B3666] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300`}>
            {/* Header Bottom Sheet */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-inherit bg-black/20">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <span>📋</span>
                <span>{sheetTitle}</span>
              </h3>

              <button
                onClick={() => setBottomSheetOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-700/40 hover:bg-slate-700/60 flex items-center justify-center text-sm font-bold text-slate-300"
              >
                ✕
              </button>
            </div>

            {/* Konten Scrollable */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs">
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
        defaultSalesName={currentSalesName || "Store Leader Admin"}
      />
    </div>
  );
}
