"use client";

import React, { useState, useEffect, useMemo } from "react";

// Modal Upload Bukti ke RAW SalesPerson
export const UploadRawSalesModal = ({ isOpen, onClose, selectedInvoice, defaultSalesName }: any) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [catatan, setCatatan] = useState("");
  const [isUploading, setIsUploading] = useState(false);

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
            {isUploading ? "Mengunggah..." : "Upload & Simpan ke Kolom M-O"}
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
  reactions: { thumbsUp: number; heart: number; fire: number; thumbsDown: number; sad: number };
  userReactions: string[];
}

const formatIDR = (n: number): string => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(isNaN(n) ? 0 : n);
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

  // Auth State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [salesIdInput, setSalesIdInput] = useState<string>("");
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [loginErr, setLoginErr] = useState<string>("");
  const [currentSalesId, setCurrentSalesId] = useState<string>("");
  const [currentSalesName, setCurrentSalesName] = useState<string>("");

  // Live Data
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [bnplRecords, setBnplRecords] = useState<BnplRecord[]>([]);
  const [scheduleData, setScheduleData] = useState<StaffScheduleItem[]>(INITIAL_SCHEDULE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter State
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>("Oktober2026");
  const [momBaseMonth, setMomBaseMonth] = useState<string>("Oktober2026");
  const [momCompareMonth, setMomCompareMonth] = useState<string>("Agustus2026");
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [selectedDate, setSelectedDate] = useState<string>("ALL");

  // Bottom Sheet Modal
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);

  // Filter BNPL & Feedback
  const [selectedBnplTender, setSelectedBnplTender] = useState<string>("ALL");
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(DEFAULT_FEEDBACKS);
  const [selectedFeedbackStaff, setSelectedFeedbackStaff] = useState<string>("ALL");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState<boolean>(false);
  const [newFeedbackStaff, setNewFeedbackStaff] = useState<string>("Liesbeth Febrina");
  const [newFeedbackSentiment, setNewFeedbackSentiment] = useState<"Luar Biasa" | "Cukup Baik" | "Kecewa">("Luar Biasa");
  const [newFeedbackText, setNewFeedbackText] = useState<string>("");

  // PPTX State
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
  const ADMIN_ID = "22008089";

  // DEFINISI FUNGSI PPTX DITULIS LENGKAP SEBELUM PEMANGGILAN APAPUN
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
      slide1.addText("STORE SALES PERFORMANCE REPORT", { x: 0.8, y: 1.8, fontSize: 24, bold: true, color: "38BDF8" });
      slide1.addText("Digiplus Grand Indonesia | " + (selectedDate || "Oktober 2026"), { x: 0.8, y: 3.2, fontSize: 14, color: "F8FAFC" });

      pptx.writeFile({ fileName: `Laporan_Digiplus_${Date.now()}.pptx` });
    } catch (err) {
      alert("Gagal membuat slide PPTX.");
    } finally {
      setIsExportingPptx(false);
    }
  };

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

    const cleanRawM = String(rawMonthStr || "").trim().toLowerCase();
    let monthKey = "Oktober2026";
    if (cleanRawM.includes("agu") || cleanRawM.includes("aug") || cleanRawM.includes("08-2026")) monthKey = "Agustus2026";
    else if (cleanRawM.includes("sep") || cleanRawM.includes("09-2026")) monthKey = "September2026";
    else if (cleanRawM.includes("okt") || cleanRawM.includes("oct") || cleanRawM.includes("10-2026")) monthKey = "Oktober2026";

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

      setTransactions(parsedTrx);
      setBnplRecords(parsedBnpl);
      if (currentSalesId && !currentSalesName) {
        if (currentSalesId === ADMIN_ID) setCurrentSalesName("Store Leader Admin");
        else {
          const match = parsedTrx.find((t) => t.salesId === currentSalesId);
          if (match) setCurrentSalesName(match.salesName);
        }
      }
    } catch (err) {
      console.error(err);
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
          if (Array.isArray(parsed) && parsed.length > 0) setFeedbacks(parsed);
        } catch (e) {}
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
    if (typeof window !== "undefined") localStorage.setItem("digi_ops_theme", next);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    const cleanId = salesIdInput.trim();
    if (!cleanId) {
      setLoginErr("Harap masukkan Sales ID!");
      return;
    }
    let detectedName = `Sales ${cleanId}`;
    if (cleanId === ADMIN_ID) detectedName = "Store Leader Admin";
    else {
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

  // Konfigurasi Tema & Tampilan
  const isDark = theme === "dark";
  const bgMain = isDark ? "bg-[#0A1128]" : "bg-white";
  const textMain = isDark ? "text-slate-100 font-bold" : "text-black font-black";
  const textMuted = isDark ? "text-slate-300 font-semibold" : "text-slate-800 font-bold";
  const cardBg = isDark ? "bg-[#0E1A38]/80 border border-white/10" : "bg-white border border-slate-300/80 shadow-sm";
  const innerBg = isDark ? "bg-[#14234B]/60 border border-white/10" : "bg-slate-50 border border-slate-200";
  const accentText = isDark ? "text-sky-400 font-black" : "text-blue-700 font-black";
  const activeTabBtn = isDark ? "bg-sky-500 text-white font-black" : "bg-blue-600 text-white font-black";
  const glassSidebar = isDark ? "bg-[#09122A] text-slate-100" : "bg-[#0F172A] text-slate-100";
  const glassBottomBar = isDark ? "bg-[#0A1128] text-slate-100" : "bg-[#0F172A] text-slate-100";

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

  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t: any) => {
      if (t.monthKey) months.add(t.monthKey);
    });
    return Array.from(months);
  }, [transactions]);

  const AUTO_WEEKS = useMemo(() => {
    const map = new Map<string, { label: string; minDate: string; maxDate: string; count: number }>();
    transactions.forEach((t) => {
      const wLabel = t.weekLabel ? t.weekLabel.trim() : "";
      if (!wLabel) return;
      if (!map.has(wLabel)) map.set(wLabel, { label: wLabel, minDate: t.isoDate, maxDate: t.isoDate, count: 0 });
      const item = map.get(wLabel)!;
      item.count++;
      if (t.isoDate && t.isoDate < item.minDate) item.minDate = t.isoDate;
      if (t.isoDate && t.isoDate > item.maxDate) item.maxDate = t.isoDate;
    });

    const sorted = Array.from(map.values()).sort((a, b) => a.minDate.localeCompare(b.minDate));
    return sorted.map((w, idx) => ({
      key: `W${idx + 1}`,
      label: w.label,
      range: w.minDate ? `${w.minDate} s.d. ${w.maxDate}` : "Periode Berjalan",
      days: 7,
    }));
  }, [transactions]);

  const activeTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedMonth !== "ALL" && t.monthKey !== selectedMonth) return false;
      if (periodType === "daily") return t.isoDate === selectedDate;
      if (periodType === "weekly" && selectedWeek !== "ALL") return t.weekLabel.toLowerCase().includes(selectedWeek.toLowerCase());
      return true;
    });
  }, [transactions, selectedMonth, periodType, selectedDate, selectedWeek]);

  const overviewStats = useMemo(() => {
    const activeTx = activeTransactions || [];
    const actual = activeTx.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const target = periodType === "daily" ? Math.round(6728667173 / 31) : periodType === "weekly" ? Math.round((6728667173 / 31) * 7) : 6728667173;
    const achv = calcAchv(actual, target);
    const variance = actual - target;
    const estimate = Math.round(actual * 1.29);
    const qtyTotal = activeTx.reduce((acc: number, t: any) => acc + (Number(t.qty) || 1), 0);
    const invoiceCount = new Set(activeTx.map((t: any) => t.invoice)).size;
    const storeUPT = calcUpt(qtyTotal, invoiceCount);

    const appleItems = activeTx.filter((t: any) => t.brand === "APPLE");
    const appleActual = appleItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const appleTarget = Math.round(target * 0.794);

    const androidItems = activeTx.filter((t: any) => t.groupCategory === "DEVICES" && t.brand !== "APPLE");
    const androidActual = androidItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const androidTarget = Math.round(target * 0.108);

    const accItems = activeTx.filter((t: any) => t.groupCategory === "ACCESSORIES");
    const accActual = accItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const accTarget = Math.round(target * 0.053);

    const vasItems = activeTx.filter((t: any) => t.groupCategory === "VAS");
    const vasActual = vasItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const vasTarget = Math.round(target * 0.045);

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
        { name: "Apple Devices (Hardware)", icon: "🍎", actual: appleActual, target: appleTarget, achv: calcAchv(appleActual, appleTarget), variance: appleActual - appleTarget, estimate: Math.round(appleActual * 1.29), color: "text-sky-600 dark:text-sky-400" },
        { name: "Android Devices (Samsung, Xiaomi, dll)", icon: "🤖", actual: androidActual, target: androidTarget, achv: calcAchv(androidActual, androidTarget), variance: androidActual - androidTarget, estimate: Math.round(androidActual * 1.29), color: "text-indigo-600 dark:text-indigo-400" },
        { name: "Accessories (Cases & Acc)", icon: "🔌", actual: accActual, target: accTarget, achv: calcAchv(accActual, accTarget), variance: accActual - accTarget, estimate: Math.round(accActual * 1.29), color: "text-amber-600 dark:text-amber-400" },
        { name: "VAS (Qoala, Telkomsel, XL, Indosat)", icon: "🛡️", actual: vasActual, target: vasTarget, achv: calcAchv(vasActual, vasTarget), variance: vasActual - vasTarget, estimate: Math.round(vasActual * 1.29), color: "text-purple-600 dark:text-purple-400" }
      ],
      appleItems,
      androidItems,
      accItems,
      vasItems
    };
  }, [activeTransactions, periodType, selectedDate, transactions]);

  const momAnalytics = useMemo(() => {
    let baseTotal = 0, compareTotal = 0;
    const staffMap: Record<string, { base: number; compare: number; baseItems: any[] }> = {};
    const productDeviceMap: Record<string, { name: string; brand: string; base: number; compare: number; baseQty: number; compareQty: number }> = {};

    transactions.forEach((t: any) => {
      const isBase = t.monthKey === momBaseMonth;
      const isCompare = t.monthKey === momCompareMonth;
      if (!isBase && !isCompare) return;

      const amt = Number(t.amount) || 0;
      const qty = Number(t.qty) || 1;
      const sales = t.salesName || "Unknown";
      const pName = t.productName || "Unknown";

      if (isBase) baseTotal += amt;
      if (isCompare) compareTotal += amt;

      if (!staffMap[sales]) staffMap[sales] = { base: 0, compare: 0, baseItems: [] };
      if (isBase) {
        staffMap[sales].base += amt;
        staffMap[sales].baseItems.push(t);
      }
      if (isCompare) staffMap[sales].compare += amt;

      if (!productDeviceMap[pName]) productDeviceMap[pName] = { name: pName, brand: t.brand || "Device", base: 0, compare: 0, baseQty: 0, compareQty: 0 };
      if (isBase) { productDeviceMap[pName].base += amt; productDeviceMap[pName].baseQty += qty; }
      if (isCompare) { productDeviceMap[pName].compare += amt; productDeviceMap[pName].compareQty += qty; }
    });

    const staffComparison = Object.entries(staffMap).map(([name, val]) => ({
      name,
      base: val.base,
      compare: val.compare,
      diff: val.base - val.compare,
      growth: val.compare > 0 ? ((val.base - val.compare) / val.compare) * 100 : 0,
      baseItems: val.baseItems,
    })).sort((a, b) => b.base - a.base);

    const droppedDevices = Object.values(productDeviceMap)
      .map((p) => ({ ...p, diff: p.base - p.compare, growth: p.compare > 0 ? ((p.base - p.compare) / p.compare) * 100 : 0 }))
      .filter((p) => p.diff < 0)
      .sort((a, b) => a.diff - b.diff);

    return { baseTotal, compareTotal, staffComparison, droppedDevices };
  }, [transactions, momBaseMonth, momCompareMonth]);

  const staffList = useMemo(() => {
    const map: Record<string, any> = {};
    activeTransactions.forEach((t) => {
      const id = t.salesId || "OTHER";
      if (!map[id]) {
        map[id] = { salesId: id, name: t.salesName || `Sales ${id}`, total: 0, qty: 0, invoices: new Set(), appleAmt: 0, androidAmt: 0, accAmt: 0, vasAmt: 0, rawItems: [] };
      }
      map[id].total += t.amount;
      map[id].qty += t.qty;
      map[id].invoices.add(t.invoice);
      map[id].rawItems.push(t);
      if (t.brand === "APPLE") map[id].appleAmt += t.amount;
      else if (t.groupCategory === "DEVICES") map[id].androidAmt += t.amount;
      else if (t.groupCategory === "ACCESSORIES") map[id].accAmt += t.amount;
      else if (t.groupCategory === "VAS") map[id].vasAmt += t.amount;
    });

    return Object.values(map).sort((a: any, b: any) => b.total - a.total).map((s: any, idx) => {
      const invCount = s.invoices.size;
      const targetQuota = 1658446763;
      const achv = calcAchv(s.total, targetQuota);
      return {
        rank: idx + 1,
        salesId: s.salesId,
        name: s.name,
        initials: s.name.slice(0, 2).toUpperCase(),
        actual: s.total,
        target: targetQuota,
        achievement: achv,
        invoicesCount: invCount,
        upt: calcUpt(s.qty, invCount),
        appleAmt: s.appleAmt,
        androidAmt: s.androidAmt,
        accAmt: s.accAmt,
        vasAmt: s.vasAmt,
        rawItems: s.rawItems,
      };
    });
  }, [activeTransactions]);

  const dailyTargetCalculated = useMemo(() => {
    const targetStoreToday = Math.round(8728667173 / 31);
    const staffCount = 7;
    const targetPerStaffToday = Math.round(targetStoreToday / staffCount);
    const actualToday = overviewStats.todayActual;
    const achvToday = calcAchv(actualToday, targetStoreToday);
    return { targetStoreToday, targetPerStaffToday, actualToday, achvToday };
  }, [overviewStats.todayActual]);

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

    const tenders = Object.entries(map).map(([tender, d]) => ({
      tender,
      amount: d.amount,
      qty: d.qty,
      share: overviewStats.actual > 0 ? Number(((d.amount / overviewStats.actual) * 100).toFixed(1)) : 0,
      estimate: Math.round((d.amount / 24) * 31),
    })).sort((a, b) => b.amount - a.amount);

    return { totalAmount, totalQty, tenders, list: selectedBnplTender === "ALL" ? bnplRecords : bnplRecords.filter((b) => b.tender.toLowerCase() === selectedBnplTender.toLowerCase()) };
  }, [bnplRecords, overviewStats.actual, selectedBnplTender]);

  const openCustomBottomSheet = (title: string, content: React.ReactNode) => {
    setSheetTitle(title);
    setSheetContent(content);
    setBottomSheetOpen(true);
  };

  const openLobDetailSheet = (lobName: string, items: RawTransaction[]) => {
    openCustomBottomSheet(`Rincian: ${lobName} (${items.length} Item)`, (
      <div className="space-y-4 text-xs font-semibold">
        <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-100 dark:bg-black/25 border border-inherit">
          <span className="font-bold text-slate-800 dark:text-slate-300">Total Nilai:</span>
          <strong className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{formatIDR(items.reduce((acc, c) => acc + c.amount, 0))}</strong>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-slate-200 dark:bg-black/40 uppercase text-[10px] font-black border-b border-inherit text-slate-950 dark:text-slate-300">
              <tr>
                <th className="py-2.5 px-3">Nama Produk</th>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Nilai</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {items.map((it, idx) => (
                <tr key={idx} className="hover:opacity-90">
                  <td className="py-2.5 px-3 font-bold text-slate-950 dark:text-white">{it.productName}</td>
                  <td className="py-2.5 px-3 text-slate-800 dark:text-slate-300">{it.brand}</td>
                  <td className="py-2.5 px-3 text-center font-black text-amber-700 dark:text-amber-300">{it.qty}</td>
                  <td className="py-2.5 px-3 text-right font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatIDR(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  if (!isMounted) return null;

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgMain} flex items-center justify-center p-4 ${textMain} font-sans w-full`}>
        <div className={`max-w-md w-full ${cardBg} border-2 rounded-3xl p-6 md:p-8 shadow-2xl`}>
          <div className="text-center mb-6">
            <h2 className="font-black text-3xl tracking-wider mb-1 text-slate-950 dark:text-white">QF01</h2>
            <h1 className="text-xl font-black text-slate-950 dark:text-white">DIGIPLUS GRAND INDONESIA</h1>
            <p className={`text-xs ${accentText} mt-1 uppercase tracking-widest`}>PORTAL DASHBOARD SALES</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 font-bold">
            <div>
              <label className="text-xs font-black uppercase tracking-wider block text-slate-900 dark:text-slate-100">Sales ID / NIK</label>
              <input
                type="text"
                required
                placeholder="24004971 / 22008089"
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
            {loginErr && <p className="text-xs text-rose-600 font-black">{loginErr}</p>}
            <button type="submit" className={`w-full py-3.5 ${isDark ? "bg-sky-500 text-white" : "bg-blue-600 text-white"} font-black rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg`}>
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${bgMain} ${textMain} font-sans antialiased overflow-x-hidden w-full max-w-full relative`}>
      {/* 1. SIDEBAR DESKTOP */}
      <aside className={`hidden lg:flex flex-col justify-between w-64 xl:w-72 h-screen sticky top-0 shrink-0 border-r z-30 transition-all ${glassSidebar}`}>
        <div className="p-5 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 pb-5 border-b border-white/10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-sky-400 text-white font-black text-base flex items-center justify-center shadow-lg">QF01</div>
            <div>
              <h1 className="font-black text-sm tracking-wider text-white">DIGIPLUS</h1>
              <p className="text-[11px] text-sky-400 font-black">GRAND INDONESIA</p>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-2xl border bg-white/5 border-white/10 flex items-center justify-between">
            <div className="overflow-hidden">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Masuk sebagai</span>
              <span className="text-xs font-black block truncate text-white">{currentSalesName}</span>
              <span className="text-[10px] font-mono font-bold text-sky-400">ID: {currentSalesId}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></span>
          </div>

          <nav className="mt-5 space-y-1.5 overflow-y-auto flex-1 pr-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as MenuTab)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all ${
                  activeTab === item.id ? activeTabBtn : "font-bold text-slate-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span className="truncate">{item.label}</span>
              </button>
            ))}

            <div className="pt-2">
              <button
                onClick={handleExportToPptx}
                disabled={isExportingPptx}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 border border-sky-500/40 text-sky-400 font-black text-xs shadow-md transition"
              >
                <span>📽️</span>
                <span>{isExportingPptx ? "Membuat..." : "Export ke Slide PPTX"}</span>
              </button>
            </div>

            <button onClick={() => setUploadModalOpen(true)} className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-slate-300 hover:text-white hover:bg-white/10">
              <span>📤</span>
              <span>Upload Bukti RAW</span>
            </button>
          </nav>

          <div className="pt-4 border-t border-white/10 space-y-2 shrink-0">
            <button onClick={toggleTheme} className="w-full py-2 px-3 rounded-xl border bg-white/5 border-white/10 hover:bg-white/10 text-white text-xs font-black flex items-center justify-center gap-2">
              <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
            </button>
            <button onClick={handleLogout} className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-black flex items-center justify-center gap-2">
              <span>🚪 Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* 2. DRAWER MOBILE */}
      {mobileDrawerOpen && (
        <div onClick={() => setMobileDrawerOpen(false)} className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 print:hidden" />
      )}
      <div className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 max-w-[80vw] z-50 border-r p-5 flex flex-col justify-between print:hidden ${glassSidebar} ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300`}>
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <span className="font-black text-sm text-white">DIGIPLUS GI</span>
            <button onClick={() => setMobileDrawerOpen(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">✕</button>
          </div>
          <nav className="mt-4 space-y-1">
            {mainNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id as MenuTab); setMobileDrawerOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold ${activeTab === item.id ? activeTabBtn : "text-slate-300"}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button onClick={toggleTheme} className="w-full py-2 px-3 rounded-xl border bg-white/5 border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2">
            <span>{isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
          </button>
          <button onClick={handleLogout} className="w-full py-2 px-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-black flex items-center justify-center gap-2">
            <span>🚪 Keluar</span>
          </button>
        </div>
      </div>

      {/* 3. AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden pb-24 lg:pb-8">
        <div className={`lg:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-20 print:hidden ${glassSidebar}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center">QF01</div>
            <h2 className="text-xs font-black leading-none text-white">DIGIPLUS GI</h2>
          </div>
          <button onClick={() => setMobileDrawerOpen(true)} className="px-3 py-1.5 rounded-xl bg-white/10 text-sky-400 border border-sky-400/30 text-xs font-black">
            ☰ Menu
          </button>
        </div>

        <main className="p-3 sm:p-6 lg:p-8 w-full max-w-[1650px] mx-auto flex-1 overflow-x-hidden">
          <header className="mb-6 border-b border-inherit pb-5 print:hidden">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <div>
                <h1 className={`text-xl sm:text-2xl font-black ${accentText}`}>Halo, {currentSalesName} 👋</h1>
                <p className={`text-xs ${textMuted} mt-1 font-semibold`}>Portal Operasional Retail Digiplus Grand Indonesia</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={fetchLiveGoogleSheets} disabled={isLoading} className={`px-3 py-1.5 rounded-xl border text-xs font-black ${innerBg} text-slate-950 dark:text-white`}>
                  🔄 {isLoading ? "Sync..." : "Sync Live"}
                </button>
                <span className={`px-3 py-1.5 rounded-lg border text-xs font-black ${isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : "bg-emerald-50 text-emerald-950 border-emerald-300"}`}>
                  Actual: {formatIDR(overviewStats.actual)}
                </span>
              </div>
            </div>

            <div className={`p-3 ${cardBg} border rounded-2xl flex flex-wrap items-center gap-3 justify-between text-xs font-bold`}>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/20 p-1 rounded-xl">
                {(["daily", "weekly", "monthly"] as const).map((mode) => (
                  <button key={mode} onClick={() => setPeriodType(mode)} className={`px-3 py-1 rounded-lg text-xs font-black capitalize ${periodType === mode ? activeTabBtn : "text-slate-800 dark:text-slate-200"}`}>
                    {mode}
                  </button>
                ))}
              </div>

              {periodType === "monthly" && (
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-slate-200">Bulan:</span>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className={`${innerBg} border rounded-xl px-2.5 py-1 font-black text-slate-950 dark:text-white`}>
                    <option value="ALL">Semua Bulan</option>
                    {availableMonths.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                </div>
              )}
              {periodType === "weekly" && (
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-slate-200">Week:</span>
                  <select value={selectedWeek} onChange={(e) => setSelectedWeek(e.target.value)} className={`${innerBg} border rounded-xl px-2.5 py-1 font-black text-slate-950 dark:text-white`}>
                    <option value="ALL">Semua Minggu</option>
                    {AUTO_WEEKS.map((w) => (<option key={w.key} value={w.label}>{w.label}</option>))}
                  </select>
                </div>
              )}
              {periodType === "daily" && (
                <div className="flex items-center gap-2">
                  <span className="font-black text-slate-900 dark:text-slate-200">Tanggal:</span>
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={`${innerBg} border rounded-xl px-2.5 py-1 font-black text-slate-950 dark:text-white`} />
                </div>
              )}
            </div>
          </header>

          {/* TAB 1: OVERVIEW STORE */}
          {activeTab === "store-overview" && (
            <div className="space-y-6">
              <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl`}>
                <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white mb-3">Matriks Kategori Produk ({periodType.toUpperCase()})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {overviewStats.lobs.map((row, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl ${innerBg} border flex flex-col justify-between`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{row.icon}</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded-full border border-inherit text-slate-950 dark:text-white">{row.achv}%</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">{row.name}</span>
                        <span className={`text-base font-black font-mono block mt-1 ${row.color}`}>{formatIDR(row.actual)}</span>
                        <span className="text-[10px] text-slate-500 font-bold block">Target: {formatIDR(row.target)}</span>
                      </div>
                      <button
                        onClick={() => openLobDetailSheet(row.name, row.name.includes("Apple") ? overviewStats.appleItems : row.name.includes("Android") ? overviewStats.androidItems : row.name.includes("Accessories") ? overviewStats.accItems : overviewStats.vasItems)}
                        className={`mt-3 w-full py-1.5 rounded-xl text-xs font-black ${activeTabBtn}`}
                      >
                        Detail
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WEEKLY SALES */}
          {activeTab === "weekly-sales" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <h2 className="text-base font-black text-slate-950 dark:text-white">WEEKLY SALES & WoW GROWTH</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {weeklyReport.map((w, idx) => (
                  <div key={idx} className={`p-4 ${innerBg} border rounded-2xl shadow-sm`}>
                    <span className={`text-xs font-black ${accentText}`}>{w.label}</span>
                    <div className="text-base font-black font-mono mt-1 text-slate-950 dark:text-white">{formatIDR(w.sales)}</div>
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold block">{w.range}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STAFF PERFORMANCE */}
          {activeTab === "staff-performance" && (
            <div className="space-y-6">
              <h2 className="text-base font-black text-slate-950 dark:text-white">LEADERBOARD PERFORMA STAF SALES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {staffList.map((staff: any) => (
                  <div key={staff.salesId} className={`${cardBg} rounded-3xl border overflow-hidden p-5 space-y-4 shadow-sm`}>
                    <div className="h-2 w-full bg-[#10B981] -mt-5 -mx-5 mb-4" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-black flex items-center justify-center text-base">{staff.initials}</div>
                        <div>
                          <h3 className={`text-sm font-black text-slate-950 dark:text-white`}>{staff.name}</h3>
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">ID: {staff.salesId}</span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300">{staff.achievement}%</span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Penjualan:</span>
                      <span className="text-base font-black text-slate-950 dark:text-white font-mono">{formatIDR(staff.actual)}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className={`${innerBg} py-2 rounded-xl text-center border`}>
                        <span className="text-[10px] font-black text-slate-500 block">UPT</span>
                        <span className="text-sm font-black text-slate-950 dark:text-white">{staff.upt}</span>
                      </div>
                      <div className={`${innerBg} py-2 rounded-xl text-center border`}>
                        <span className="text-[10px] font-black text-slate-500 block">Struk</span>
                        <span className="text-sm font-black text-slate-950 dark:text-white">{staff.invoicesCount}</span>
                      </div>
                      <div className={`${innerBg} py-2 rounded-xl text-center border`}>
                        <span className="text-[10px] font-black text-slate-500 block">Apple</span>
                        <span className="text-[11px] font-black text-sky-600 dark:text-sky-400 truncate block px-1">{formatIDR(staff.appleAmt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DAILY TARGET */}
          {activeTab === "daily-target" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <h2 className="text-base font-black text-slate-950 dark:text-white">TARGET HARIAN & RUN RATE</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className={`p-4 rounded-2xl ${innerBg} border`}>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 block uppercase">Target Toko Hari Ini</span>
                  <div className="text-xl font-black font-mono text-slate-950 dark:text-white mt-1">{formatIDR(dailyTargetCalculated.targetStoreToday)}</div>
                </div>
                <div className={`p-4 rounded-2xl ${innerBg} border`}>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 block uppercase">Pencapaian Hari Ini</span>
                  <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">{formatIDR(dailyTargetCalculated.actualToday)}</div>
                </div>
                <div className={`p-4 rounded-2xl ${innerBg} border`}>
                  <span className="text-[11px] font-black text-slate-600 dark:text-slate-400 block uppercase">Target Per Staf Hari Ini</span>
                  <div className="text-xl font-black font-mono text-sky-700 dark:text-sky-400 mt-1">{formatIDR(dailyTargetCalculated.targetPerStaffToday)}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCHEDULE */}
          {activeTab === "schedule" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <div className="flex justify-between items-center">
                <h2 className="text-base font-black text-slate-950 dark:text-white">JADWAL SHIFT OPERASIONAL 1 MINGGU</h2>
                <button onClick={handlePrintSchedule} className={`px-3 py-1.5 rounded-xl border text-xs font-black ${innerBg}`}>Print</button>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead className={`${innerBg} uppercase text-[10px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                    <tr>
                      <th className="py-2.5 px-3">Nama</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-2 text-center">Senin</th>
                      <th className="py-2.5 px-2 text-center">Selasa</th>
                      <th className="py-2.5 px-2 text-center">Rabu</th>
                      <th className="py-2.5 px-2 text-center">Kamis</th>
                      <th className="py-2.5 px-2 text-center">Jumat</th>
                      <th className="py-2.5 px-2 text-center">Sabtu</th>
                      <th className="py-2.5 px-2 text-center">Minggu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit font-bold">
                    {scheduleData.map((s) => (
                      <tr key={s.id} className="hover:opacity-90">
                        <td className="py-2.5 px-3 font-black text-slate-950 dark:text-white">{s.name}</td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 text-[11px]">{s.role}</td>
                        {(["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const).map((d) => (
                          <td key={d} className="py-2 px-2 text-center">
                            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200 dark:bg-slate-700/50 text-slate-900 dark:text-slate-200">{s[d]}</span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: FEEDBACK */}
          {activeTab === "feedback" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <div className="flex justify-between items-center">
                <h2 className="text-base font-black text-slate-950 dark:text-white">FEEDBACK RITEL TIM</h2>
                <button onClick={() => setFeedbackModalOpen(true)} className="px-3.5 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-black">+ Tulis Feedback</button>
              </div>
              <div className="space-y-3">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-sm text-slate-950 dark:text-white">{fb.salesName} ({fb.salesRole})</span>
                      <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-300">{fb.sentiment}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{fb.text}</p>
                    <span className="text-[10px] text-slate-500 font-bold block">{fb.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: BNPL */}
          {activeTab === "bnpl" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <div className="flex justify-between items-center">
                <h2 className="text-base font-black text-slate-950 dark:text-white">TRANSAKSI PEMBIAYAAN KONSUMEN (BNPL)</h2>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">Total: {formatIDR(bnplSummary.totalAmount)}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
                {bnplSummary.tenders.map((t, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border ${innerBg} space-y-1`}>
                    <span className="text-xs font-black uppercase text-sky-700 dark:text-sky-400">{t.tender}</span>
                    <div className="text-sm font-black font-mono text-black dark:text-white">{formatIDR(t.amount)}</div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-400 font-bold block">{t.qty} Unit</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: CARI PRODUK */}
          {activeTab === "product-search" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <h2 className="text-base font-black text-slate-950 dark:text-white">CARI PRODUK TERJUAL</h2>
              <input
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Ketik nama produk atau nomor artikel..."
                className={`w-full p-3 rounded-xl border ${innerBg} text-xs font-bold text-slate-950 dark:text-white focus:outline-none`}
              />
            </div>
          )}

          {/* TAB 9: MoM COMPARISON */}
          {activeTab === "mom-comparison" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-base font-black text-slate-950 dark:text-white">ANALISIS MoM PERFORMA STAF</h2>
                <div className="flex items-center gap-2">
                  <select value={momBaseMonth} onChange={(e) => setMomBaseMonth(e.target.value)} className={`${innerBg} border rounded-xl px-2 py-1 text-xs font-black text-slate-950 dark:text-white`}>
                    {availableMonths.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                  <span className="text-xs font-black text-slate-500">VS</span>
                  <select value={momCompareMonth} onChange={(e) => setMomCompareMonth(e.target.value)} className={`${innerBg} border rounded-xl px-2 py-1 text-xs font-black text-slate-950 dark:text-white`}>
                    {availableMonths.map((m) => (<option key={m} value={m}>{m}</option>))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className={`${innerBg} uppercase text-[10px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                    <tr>
                      <th className="py-2.5 px-3">Nama Sales</th>
                      <th className="py-2.5 px-3 text-right">{momBaseMonth}</th>
                      <th className="py-2.5 px-3 text-right">{momCompareMonth}</th>
                      <th className="py-2.5 px-3 text-right">Growth (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit font-bold">
                    {momAnalytics.staffComparison.map((st: any, i: number) => (
                      <tr key={i} className="hover:opacity-90">
                        <td className="py-2.5 px-3 font-black text-sky-700 dark:text-sky-400 cursor-pointer" onClick={() => openLobDetailSheet(`Penjualan ${st.name}`, st.baseItems)}>
                          {st.name}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-950 dark:text-white">{formatIDR(st.base)}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-600 dark:text-slate-400">{formatIDR(st.compare)}</td>
                        <td className={`py-2.5 px-3 text-right font-mono font-black ${st.growth >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-600"}`}>
                          {st.growth >= 0 ? `+${st.growth.toFixed(1)}%` : `${st.growth.toFixed(1)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 10: SALES DETAIL */}
          {activeTab === "sales-detail" && (
            <div className={`p-5 rounded-3xl ${cardBg} border shadow-xl space-y-4`}>
              <h2 className="text-base font-black text-slate-950 dark:text-white">LOG DETAIL TRANSAKSI (50 TERAKHIR)</h2>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className={`${innerBg} uppercase text-[10px] font-black border-b border-inherit text-slate-900 dark:text-slate-300`}>
                    <tr>
                      <th className="p-2.5">Tanggal</th>
                      <th className="p-2.5">No. Invoice</th>
                      <th className="p-2.5">Sales</th>
                      <th className="p-2.5">Produk</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Nominal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-inherit font-bold">
                    {activeTransactions.slice(0, 50).map((t, idx) => (
                      <tr key={idx} className="hover:opacity-90">
                        <td className="p-2.5 text-slate-700 dark:text-slate-300 font-mono">{t.date}</td>
                        <td className={`p-2.5 font-mono font-black ${accentText}`}>{t.invoice}</td>
                        <td className="p-2.5 text-slate-950 dark:text-white">{t.salesName}</td>
                        <td className="p-2.5 text-slate-950 dark:text-white">{t.productName}</td>
                        <td className="p-2.5 text-center font-black text-amber-700 dark:text-amber-300">{t.qty}</td>
                        <td className="p-2.5 text-right font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatIDR(t.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 4. BOTTOM BAR MOBILE */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 border-t z-40 px-3 py-2 flex justify-around items-center shadow-2xl print:hidden ${glassBottomBar}`}>
        {[
          { id: "store-overview", label: "Overview", icon: "📊" },
          { id: "mom-comparison", label: "MoM", icon: "⚖️" },
          { id: "staff-performance", label: "Staff", icon: "🏆" },
          { id: "daily-target", label: "Target", icon: "🎯" },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as MenuTab)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${activeTab === item.id ? "text-sky-400 scale-105" : "text-slate-300"}`}
          >
            <span className="text-base">{item.icon}</span>
            <span className={`text-[10px] font-black mt-0.5 ${activeTab === item.id ? "text-sky-400" : ""}`}>{item.label}</span>
          </button>
        ))}
        <button onClick={() => setMobileDrawerOpen(true)} className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-300">
          <span className="text-base">📑</span>
          <span className="text-[10px] font-black mt-0.5">Lainnya</span>
        </button>
      </div>

      {/* BOTTOM SHEET MODAL DRILLDOWN */}
      {bottomSheetOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4 overflow-hidden">
          <div className={`w-full sm:max-w-2xl max-h-[85vh] rounded-t-3xl sm:rounded-3xl ${cardBg} border-2 border-inherit shadow-2xl flex flex-col overflow-hidden`}>
            <div className="flex items-center justify-between p-4 border-b border-inherit bg-black/5 dark:bg-black/20">
              <h3 className={`text-sm font-black ${textMain} truncate`}>{sheetTitle}</h3>
              <button onClick={() => setBottomSheetOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700/40 flex items-center justify-center text-sm font-black text-slate-900 dark:text-slate-300">✕</button>
            </div>
            <div className="p-4 overflow-y-auto">{sheetContent}</div>
          </div>
        </div>
      )}

      {/* Modal Upload RAW */}
      <UploadRawSalesModal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} selectedInvoice="" defaultSalesName="Store Leader Admin" />
    </div>
  );
}
