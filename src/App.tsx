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
  staffName?: string;
  name?: string;
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

  // PPTX State & Handler (Dideklarasikan di awal agar tidak undefined)
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  const SPREADSHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
  const ADMIN_ID = "22008089";

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
      alert("Ekspor slide sedang dipersiapkan atau gagal dimuat.");
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
          isoDate = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; } } }  const cleanRawM = String(rawMonthStr \vert{}\vert{} "").trim(); const mLower = cleanRawM.toLowerCase(); let monthKey = "";  if (mLower.includes("agu") \vert{}\vert{} mLower.includes("aug") \vert{}\vert{} mLower.includes("08-2026") \vert{}\vert{} mLower.includes("2026-08")) { monthKey = "Agustus2026"; } else if (mLower.includes("sep") \vert{}\vert{} mLower.includes("09-2026") \vert{}\vert{} mLower.includes("2026-09")) { monthKey = "September2026"; } else if (mLower.includes("okt") \vert{}\vert{} mLower.includes("oct") \vert{}\vert{} mLower.includes("10-2026") \vert{}\vert{} mLower.includes("2026-10")) { monthKey = "Oktober2026"; } else if (cleanRawM !== "") { monthKey = cleanRawM; } else { monthKey = "Oktober2026"; }  return { isoDate, monthKey }; };  const fetchLiveGoogleSheets = async () => { setIsLoading(true); try { const dbUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=602901290`;
      const bnplUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=2697970`;  const [resDb, resBnpl] = await Promise.all([fetch(dbUrl), fetch(bnplUrl)]); const textDb = await resDb.text(); const textBnpl = await resBnpl.text();  const sDb = textDb.indexOf("{"); const eDb = textDb.lastIndexOf("}") + 1; const jsonDb = JSON.parse(textDb.substring(sDb, eDb)); const rowsDb = jsonDb.table.rows;  const parsedTrx: RawTransaction[] = []; rowsDb.forEach((r: any) => { const c = r.c; if (!c) return;  const rawDate = c[0]?.f \vert{}\vert{} c[0]?.v \vert{}\vert{} ""; const rawMonth = c[12]?.f \vert{}\vert{} c[12]?.v \vert{}\vert{} ""; const { isoDate, monthKey } = parseNormalizedDate(String(rawDate), String(rawMonth));  const salesId = String(c[1]?.v \vert{}\vert{} "").trim(); const salesName = String(c[2]?.v \vert{}\vert{} "").trim(); const invoice = String(c[3]?.v \vert{}\vert{} "").trim(); const sapArticle = String(c[4]?.v \vert{}\vert{} "").trim(); const productName = String(c[5]?.v \vert{}\vert{} "").trim(); const qty = Number(c[7]?.v) \vert{}\vert{} 1; const rawAmount = c[8]?.v; const amount = typeof rawAmount === "number" ? rawAmount : Number(String(rawAmount \vert{}\vert{} 0).replace(/[^0-9]/g, "")); const productType = String(c[9]?.v \vert{}\vert{} "").trim(); const brand = String(c[10]?.v \vert{}\vert{} "").trim().toUpperCase(); let groupCategory = String(c[11]?.v \vert{}\vert{} "").trim().toUpperCase(); const weekLabel = String(c[14]?.v \vert{}\vert{} "").trim();  const pUpper = productName.toUpperCase();  if (groupCategory === "DEVICES") { // Tetap DEVICES } else if (groupCategory === "VAS" \vert{}\vert{} brand === "QOALA" \vert{}\vert{} brand === "TELKOMSEL" \vert{}\vert{} brand === "XL" \vert{}\vert{} brand === "INDOSAT" \vert{}\vert{} pUpper.includes("PROTEKSI") \vert{}\vert{} pUpper.includes("MYPRIO")) { groupCategory = "VAS"; } else if (groupCategory === "ACCESSORIES") { groupCategory = "ACCESSORIES"; } else if (brand === "APPLE" && (pUpper.includes("IPHONE") \vert{}\vert{} pUpper.includes("IPAD") \vert{}\vert{} pUpper.includes("MAC") \vert{}\vert{} pUpper.includes("WATCH") \vert{}\vert{} pUpper.includes("AIRPOD"))) { groupCategory = "DEVICES"; } else if (["SAMSUNG", "XIAOMI", "OPPO", "MOTOROLA", "HUAWEI", "INFINIX"].includes(brand) && (pUpper.includes("PHONE") \vert{}\vert{} pUpper.includes("GALAXY") \vert{}\vert{} pUpper.includes("REDMI"))) { groupCategory = "DEVICES"; } else { groupCategory = "OTHER"; }  if (invoice && amount > 0 && salesName) { parsedTrx.push({ date: String(rawDate), isoDate, monthKey, month: monthKey, salesId, salesName, invoice, sapArticle, productName, qty, amount, productType, brand, groupCategory, weekLabel, }); } });  const sBnpl = textBnpl.indexOf("{"); const eBnpl = textBnpl.lastIndexOf("}") + 1; const jsonBnpl = JSON.parse(textBnpl.substring(sBnpl, eBnpl)); const rowsBnpl = jsonBnpl.table.rows;  const parsedBnpl: BnplRecord[] = []; rowsBnpl.forEach((r: any) => { const c = r.c; if (!c) return;  const date = c[0]?.f \vert{}\vert{} c[0]?.v \vert{}\vert{} ""; const invoice = String(c[1]?.v \vert{}\vert{} "").trim(); const rawAmount = c[2]?.v; const amount = typeof rawAmount === "number" ? rawAmount : Number(String(rawAmount \vert{}\vert{} 0).replace(/[^0-9]/g, "")); const tender = String(c[3]?.v \vert{}\vert{} "Other").trim(); const product = String(c[4]?.v \vert{}\vert{} "").trim(); const qty = Number(c[5]?.v) \vert{}\vert{} 1; const month = String(c[6]?.v \vert{}\vert{} "").trim();  if (invoice && amount > 0) { parsedBnpl.push({ date: String(date), invoice, amount, tender, product, qty, month }); } });  setTransactions(parsedTrx); setBnplRecords(parsedBnpl);  if (currentSalesId && !currentSalesName) { if (currentSalesId === ADMIN_ID) { setCurrentSalesName("Store Leader Admin"); } else { const match = parsedTrx.find((t) => t.salesId === currentSalesId); if (match) setCurrentSalesName(match.salesName); } } } catch (err) { console.error("Gagal live fetch:", err); } finally { setIsLoading(false); } };  useEffect(() => { setIsMounted(true); fetchLiveGoogleSheets();  if (typeof window !== "undefined") { const savedUser = localStorage.getItem("digi_ops_user"); const savedName = localStorage.getItem("digi_ops_name"); const savedTheme = localStorage.getItem("digi_ops_theme") as ThemeMode; const savedSchedule = localStorage.getItem("digi_ops_schedule"); const savedFeedbacks = localStorage.getItem("digi_ops_feedbacks");  if (savedTheme) setTheme(savedTheme); if (savedSchedule) { try { setScheduleData(JSON.parse(savedSchedule)); } catch (e) {} } if (savedFeedbacks) { try { const parsed = JSON.parse(savedFeedbacks); if (Array.isArray(parsed) && parsed.length > 0) { setFeedbacks(parsed); } } catch (e) {} } if (savedUser) { setIsLoggedIn(true); setCurrentSalesId(savedUser); setCurrentSalesName(savedName \vert{}\vert{} `Sales ${savedUser}`);
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

    let detectedName = `Sales ${cleanId}`; if (cleanId === ADMIN_ID) { detectedName = "Store Leader Admin"; } else { const match = transactions.find((t) => t.salesId === cleanId); if (match) detectedName = match.salesName; }  localStorage.setItem("digi_ops_user", cleanId); localStorage.setItem("digi_ops_name", detectedName); setCurrentSalesId(cleanId); setCurrentSalesName(detectedName); setIsLoggedIn(true); setLoginErr(""); };  const handleLogout = () => { localStorage.removeItem("digi_ops_user"); localStorage.removeItem("digi_ops_name"); setIsLoggedIn(false); setCurrentSalesId(""); setCurrentSalesName(""); };  // Konfigurasi Tema const isDark = theme === "dark"; const bgMain = isDark ? "bg-[#0A1128] bg-gradient-to-br from-[#070D1E] via-[#0A1128] to-[#0F1B3D]" : "bg-white";  const textMain = isDark ? "text-slate-100 font-bold" : "text-black font-black"; const textMuted = isDark ? "text-slate-300 font-semibold" : "text-slate-800 font-bold";  const cardBg = isDark ? "bg-[#0E1A38]/75 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.35)]" : "bg-white border border-slate-200 shadow-sm";  const innerBg = isDark ? "bg-[#14234B]/60 backdrop-blur-md border border-white/10" : "bg-slate-50 border border-slate-200";  const accentText = isDark ? "text-sky-400 font-black" : "text-blue-700 font-black"; const activeTabBtn = isDark ? "bg-sky-500 text-white font-black shadow-lg shadow-sky-500/30 border border-sky-400/40" : "bg-blue-600 text-white font-black shadow-md shadow-blue-600/20";  const glassSidebar = isDark ? "bg-[#09122A]/95 border-white/10 text-slate-100" : "bg-[#0F172A] border-slate-800 text-slate-100";  const glassBottomBar = isDark ? "bg-[#0A1128]/95 border-white/10 text-slate-100" : "bg-[#0F172A]/95 border-slate-800 text-slate-100";  const mainNavItems = [ { id: "store-overview", label: "Overview Store", icon: "📊" }, { id: "weekly-sales", label: "Weekly Sales (WoW)", icon: "📈" }, { id: "mom-comparison", label: "MoM Growth Analysis", icon: "⚖️" }, { id: "staff-performance", label: "Staff Performance", icon: "🏆" }, { id: "daily-target", label: "Daily Target & Run Rate", icon: "🎯" }, { id: "schedule", label: "Jadwal Shift 1 Minggu", icon: "📅" }, { id: "feedback", label: "Feedback Ritel Tim", icon: "💬" }, { id: "bnpl", label: "BNPL Transactions", icon: "💳" }, { id: "product-search", label: "Cari Produk Terjual", icon: "🔍" }, { id: "sales-detail", label: "Rincian Transaksi Log", icon: "📋" }, ];  const availableMonths = useMemo(() => { const months = new Set<string>(); transactions.forEach((t: any) => { if (t.month && String(t.month).trim() !== "") { months.add(String(t.month).trim()); } else if (t.monthKey && String(t.monthKey).trim() !== "") { months.add(String(t.monthKey).trim()); } }); return Array.from(months); }, [transactions]);  const AUTO_WEEKS = useMemo(() => { const map = new Map<string, { label: string; minDate: string; maxDate: string; count: number }>();  transactions.forEach((t) => { const wLabel = t.weekLabel ? t.weekLabel.trim() : ""; if (!wLabel) return;  if (!map.has(wLabel)) { map.set(wLabel, { label: wLabel, minDate: t.isoDate, maxDate: t.isoDate, count: 0 }); }  const item = map.get(wLabel)!; item.count++; if (t.isoDate && t.isoDate < item.minDate) item.minDate = t.isoDate; if (t.isoDate && t.isoDate > item.maxDate) item.maxDate = t.isoDate; });  const sorted = Array.from(map.values()).sort((a, b) => a.minDate.localeCompare(b.minDate));  return sorted.map((w, idx) => { const key = `W${idx + 1}`;
      const formatNice = (iso: string) => {
        if (!iso) return "";
        const p = iso.split("-");
        return p.length === 3 ? `${p[2]}/${p[1]}` : iso;
      };
      const range = w.minDate ? `${formatNice(w.minDate)} s.d.${formatNice(w.maxDate)}` : "Periode Berjalan";
      return { key, label: w.label, range, days: 7 };
    });
  }, [transactions]);

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
    const target = periodType === "daily" 
      ? Math.round(6728667173 / 31) 
      : periodType === "weekly" 
      ? Math.round((6728667173 / 31) * 7) 
      : 6728667173;

    const achv = calcAchv(actual, target);
    const variance = actual - target;
    const estimate = Math.round(actual * 1.29);
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
    const appleTarget = Math.round(target * 0.794);

    const androidItems = activeTx.filter((t: any) => {
      const pUpper = (t.productName || "").toUpperCase();
      const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE");
      return t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseOrAcc;
    });
    const androidActual = androidItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const androidTarget = Math.round(target * 0.108);

    const accItems = activeTx.filter((t: any) => t.groupCategory === "ACCESSORIES");
    const accActual = accItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const accTarget = Math.round(target * 0.053);

    const vasItems = activeTx.filter((t: any) => t.groupCategory === "VAS");
    const vasActual = vasItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const vasTarget = Math.round(target * 0.045);

    const todayItems = (transactions || []).filter((t: any) => t.isoDate === selectedDate);
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
    const initMetrics = () => ({
      totalSales: 0,
      appleSales: 0,
      androidSales: 0,
      accessoriesSales: 0,
      vasSales: 0,
      totalQty: 0,
      invoices: new Set<string>(),
    });

    const baseMetrics = initMetrics();
    const compareMetrics = initMetrics();

    const staffMap: Record<string, { base: number; compare: number; baseItems: any[]; compareItems: any[] }> = {};
    const productDeviceMap: Record<string, { name: string; brand: string; base: number; compare: number; baseQty: number; compareQty: number }> = {};

    transactions.forEach((t: any) => {
      const rawMonth = (t.monthKey || t.month || "").toString().trim();
      const isBase = rawMonth === momBaseMonth;
      const isCompare = rawMonth === momCompareMonth;

      if (!isBase && !isCompare) return;

      const amt = Number(t.amount) || 0;
      const qty = Number(t.qty) || 1;
      const cat = (t.productType || t.groupCategory || "").toString().toUpperCase();
      const brand = (t.brandName || t.brand || "").toString().toUpperCase();
      const inv = (t.invoice || "").toString().trim();
      const sales = (t.salesName || "Unknown").toString().trim();
      const pName = (t.productName || "Unknown").trim();

      const targetObj = isBase ? baseMetrics : compareMetrics;
      targetObj.totalSales += amt;
      targetObj.totalQty += qty;
      if (inv) targetObj.invoices.add(inv);

      const isAppleDev = brand.includes("APPLE") && (cat.includes("DEVICES") || pName.toUpperCase().includes("IPHONE") || pName.toUpperCase().includes("IPAD") || pName.toUpperCase().includes("MAC"));
      const isAndroidDev = cat.includes("DEVICES") && !brand.includes("APPLE");

      if (isAppleDev) {
        targetObj.appleSales += amt;
      } else if (isAndroidDev) {
        targetObj.androidSales += amt;
      } else if (cat.includes("VAS") || cat.includes("PROTEKSI") || cat.includes("TELKOMSEL")) {
        targetObj.vasSales += amt;
      } else if (cat.includes("ACCESSORIES")) {
        targetObj.accessoriesSales += amt;
      }

      if (isAppleDev || isAndroidDev) {
        if (!productDeviceMap[pName]) {
          productDeviceMap[pName] = { name: pName, brand: isAppleDev ? "Apple" : "Android", base: 0, compare: 0, baseQty: 0, compareQty: 0 };
        }
        if (isBase) {
          productDeviceMap[pName].base += amt;
          productDeviceMap[pName].baseQty += qty;
        }
        if (isCompare) {
          productDeviceMap[pName].compare += amt;
          productDeviceMap[pName].compareQty += qty;
        }
      }

      if (!staffMap[sales]) {
        staffMap[sales] = { base: 0, compare: 0, baseItems: [], compareItems: [] };
      }
      if (isBase) {
        staffMap[sales].base += amt;
        staffMap[sales].baseItems.push(t);
      }
      if (isCompare) {
        staffMap[sales].compare += amt;
        staffMap[sales].compareItems.push(t);
      }
    });

    const uptBase = baseMetrics.invoices.size > 0 ? (baseMetrics.totalQty / baseMetrics.invoices.size) : 0;
    const uptCompare = compareMetrics.invoices.size > 0 ? (compareMetrics.totalQty / compareMetrics.invoices.size) : 0;

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    const summary = [
      { label: "Total MTD Sales", base: baseMetrics.totalSales, compare: compareMetrics.totalSales, isCurrency: true },
      { label: "Apple Devices", base: baseMetrics.appleSales, compare: compareMetrics.appleSales, isCurrency: true },
      { label: "Android Devices", base: baseMetrics.androidSales, compare: compareMetrics.androidSales, isCurrency: true },
      { label: "Accessories", base: baseMetrics.accessoriesSales, compare: compareMetrics.accessoriesSales, isCurrency: true },
      { label: "VAS & Services", base: baseMetrics.vasSales, compare: compareMetrics.vasSales, isCurrency: true },
      { label: "UPT (Units Per Trx)", base: uptBase, compare: uptCompare, isCurrency: false },
    ].map((item) => {
      const diff = item.base - item.compare;
      const growth = calcGrowth(item.base, item.compare);
      return { ...item, diff, growth };
    });

    const staffComparison = Object.entries(staffMap).map(([name, val]) => {
      const diff = val.base - val.compare;
      const growth = calcGrowth(val.base, val.compare);
      return { name, base: val.base, compare: val.compare, diff, growth, baseItems: val.baseItems, compareItems: val.compareItems };
    }).sort((a, b) => b.base - a.base);

    const droppedDevices = Object.values(productDeviceMap)
      .map((p) => {
        const diff = p.base - p.compare;
        const growth = calcGrowth(p.base, p.compare);
        return { ...p, diff, growth };
      })
      .filter((p) => p.diff < 0)
      .sort((a, b) => a.diff - b.diff);

    return { summary, staffComparison, droppedDevices };
  }, [transactions, momBaseMonth, momCompareMonth]);

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
          name: t.salesName || `Sales ${id}`, total: 0, qty: 0, invoices: new Set(), appleMap: { "iPhone": { actual: 0, qty: 0, icon: "📱" }, "iPad": { actual: 0, qty: 0, icon: "📟" }, "MacBook": { actual: 0, qty: 0, icon: "💻" }, "Apple Watch": { actual: 0, qty: 0, icon: "⌚" }, "AirPods": { actual: 0, qty: 0, icon: "🎧" }, }, androidMap: { "Samsung Devices": { actual: 0, qty: 0, icon: "📱" }, "Xiaomi / Redmi Devices": { actual: 0, qty: 0, icon: "🟠" }, "Oppo Devices": { actual: 0, qty: 0, icon: "🟢" }, "Motorola Devices": { actual: 0, qty: 0, icon: "Ⓜ️" }, "Huawei Devices": { actual: 0, qty: 0, icon: "🔴" }, "Infinix Devices": { actual: 0, qty: 0, icon: "⚡" }, }, accMap: {}, vasMap: { "Qoala Proteksi Gadget": { actual: 0, qty: 0, icon: "🛡️" }, "Telkomsel Halo/Data": { actual: 0, qty: 0, icon: "🔴" }, "XL Prioritas": { actual: 0, qty: 0, icon: "🔵" }, "Indosat IM3": { actual: 0, qty: 0, icon: "🟡" }, }, weekSales: {}, rawItems: [], }; }  map[id].total += t.amount; map[id].qty += t.qty; map[id].rawItems.push(t); if (t.invoice) map[id].invoices.add(t.invoice);  const wLabel = t.weekLabel \vert{}\vert{} "W_Other"; map[id].weekSales[wLabel] = (map[id].weekSales[wLabel] \vert{}\vert{} 0) + t.amount;  const pUpper = t.productName.toUpperCase(); const isCaseAcc = pUpper.includes("CASE") \vert{}\vert{} pUpper.includes("GLASS") \vert{}\vert{} pUpper.includes("ADAPTER") \vert{}\vert{} pUpper.includes("CABLE") \vert{}\vert{} pUpper.includes("BAND");  if (t.brand === "APPLE" && !isCaseAcc && (t.groupCategory === "DEVICES" \vert{}\vert{} pUpper.includes("IPHONE") \vert{}\vert{} pUpper.includes("IPAD") \vert{}\vert{} pUpper.includes("MAC") \vert{}\vert{} pUpper.includes("WATCH") \vert{}\vert{} pUpper.includes("AIRPOD"))) { if (pUpper.includes("IPHONE")) { map[id].appleMap["iPhone"].actual += t.amount; map[id].appleMap["iPhone"].qty += t.qty; } else if (pUpper.includes("IPAD")) { map[id].appleMap["iPad"].actual += t.amount; map[id].appleMap["iPad"].qty += t.qty; } else if (pUpper.includes("MAC") \vert{}\vert{} pUpper.includes("BOOK")) { map[id].appleMap["MacBook"].actual += t.amount; map[id].appleMap["MacBook"].qty += t.qty; } else if (pUpper.includes("WATCH")) { map[id].appleMap["Apple Watch"].actual += t.amount; map[id].appleMap["Apple Watch"].qty += t.qty; } else if (pUpper.includes("AIRPOD")) { map[id].appleMap["AirPods"].actual += t.amount; map[id].appleMap["AirPods"].qty += t.qty; } }  if (t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseAcc) { if (t.brand === "SAMSUNG" \vert{}\vert{} pUpper.includes("GALAXY")) { map[id].androidMap["Samsung Devices"].actual += t.amount; map[id].androidMap["Samsung Devices"].qty += t.qty; } else if (t.brand === "XIAOMI" \vert{}\vert{} pUpper.includes("REDMI")) { map[id].androidMap["Xiaomi / Redmi Devices"].actual += t.amount; map[id].androidMap["Xiaomi / Redmi Devices"].qty += t.qty; } else if (t.brand === "OPPO") { map[id].androidMap["Oppo Devices"].actual += t.amount; map[id].androidMap["Oppo Devices"].qty += t.qty; } else if (t.brand === "MOTOROLA") { map[id].androidMap["Motorola Devices"].actual += t.amount; map[id].androidMap["Motorola Devices"].qty += t.qty; } else if (t.brand === "HUAWEI") { map[id].androidMap["Huawei Devices"].actual += t.amount; map[id].androidMap["Huawei Devices"].qty += t.qty; } else if (t.brand === "INFINIX") { map[id].androidMap["Infinix Devices"].actual += t.amount; map[id].androidMap["Infinix Devices"].qty += t.qty; } }  if (t.groupCategory === "ACCESSORIES") { const item = t.productName.trim() \vert{}\vert{} "Aksesoris"; if (!map[id].accMap[item]) map[id].accMap[item] = { actual: 0, qty: 0, icon: "🔌" }; map[id].accMap[item].actual += t.amount; map[id].accMap[item].qty += t.qty; }  if (t.brand === "QOALA" \vert{}\vert{} pUpper.includes("QOALA") \vert{}\vert{} pUpper.includes("PROTEKSI")) { map[id].vasMap["Qoala Proteksi Gadget"].actual += t.amount; map[id].vasMap["Qoala Proteksi Gadget"].qty += t.qty; } else if (t.brand === "TELKOMSEL" \vert{}\vert{} pUpper.includes("TELKOMSEL")) { map[id].vasMap["Telkomsel Halo/Data"].actual += t.amount; map[id].vasMap["Telkomsel Halo/Data"].qty += t.qty; } else if (t.brand === "XL" \vert{}\vert{} pUpper.includes("MYPRIO")) { map[id].vasMap["XL Prioritas"].actual += t.amount; map[id].vasMap["XL Prioritas"].qty += t.qty; } else if (t.brand === "INDOSAT") { map[id].vasMap["Indosat IM3"].actual += t.amount; map[id].vasMap["Indosat IM3"].qty += t.qty; } });  const sorted = Object.values(map).sort((a, b) => b.total - a.total);  return sorted.map((s, idx) => { const invCount = s.invoices.size; const upt = calcUpt(s.qty, invCount); const targetQuota = 1658446763; const achv = calcAchv(s.total, targetQuota); const variance = s.total - targetQuota;  const words = s.name.split(" "); const initials = words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : words[0].slice(0, 2).toUpperCase();  const sortedAcc = Object.entries(s.accMap) .map(([name, d]) => ({ name, ...d })) .sort((a, b) => b.actual - a.actual);  const totalAccActual = sortedAcc.reduce((acc, c) => acc + c.actual, 0); const totalVasActual = Object.values(s.vasMap).reduce((acc, c) => acc + c.actual, 0);  const targetAcc = 80000000; const targetVas = 60000000;  let status: "Tercapai" \vert{} "Perlu Perhatian Khusus" \vert{} "Dalam Pantauan" = "Dalam Pantauan"; let ringkasan = `Pencapaian ${achv}% terhadap target kuota.`;
      let rekomendasi = "Tingkatkan penawaran bundling aksesoris dan layanan proteksi pada setiap nota penjualan.";

      if (achv >= 100) {
        status = "Tercapai";
        ringkasan = `Performa sangat prima! Target tercapai ${achv}\% dengan total${invCount} struk nota.`;
        rekomendasi = "Pertahankan konsistensi penjualan unit dan maksimalkan attachment rate aksesoris premium.";
      } else if (achv < 20) {
        status = "Perlu Perhatian Khusus";
        ringkasan = `Pencapaian sangat tertinggal (${achv}%), defisit omset mencapai ${formatIDR(variance)}.`; rekomendasi = "Evaluasi interaksi prospek customer harian dan manfaatkan program cicilan/BNPL 0\%."; }  return { rank: idx + 1, salesId: s.salesId, name: s.name, initials, actual: s.total, target: targetQuota, achievement: achv, variance, estimate: Math.round(s.total * 1.29), invoicesCount: invCount, qty: s.qty, upt, totalAccActual, targetAcc, achvAcc: calcAchv(totalAccActual, targetAcc), totalVasActual, targetVas, achvVas: calcAchv(totalVasActual, targetVas), status, ringkasan, rekomendasi, appleSub: Object.entries(s.appleMap).map(([name, d]) => ({ name, ...d })), androidSub: Object.entries(s.androidMap).map(([name, d]) => ({ name, ...d })), accessoriesSub: sortedAcc, vasSub: Object.entries(s.vasMap).map(([name, d]) => ({ name, ...d })), weekSales: s.weekSales, rawItems: s.rawItems, }; }); }, [activeTransactions]);  const dailyTargetCalculated = useMemo(() => { const totalMonthTarget = 8728667173; const totalDays = 31; const daysPassed = 24; const daysLeft = totalDays - daysPassed;  const actualAchievedSoFar = transactions.reduce((acc, t) => acc + t.amount, 0); const remainingTarget = Math.max(0, totalMonthTarget - actualAchievedSoFar); const requiredDailyRunRate = daysLeft > 0 ? Math.round(remainingTarget / daysLeft) : 0;  const todayShiftKey = "sat"; const staffOnDuty = scheduleData.filter((s) => s[todayShiftKey] !== "OFF" && s[todayShiftKey] !== "CUTI"); const staffCount = staffOnDuty.length \vert{}\vert{} 7;  const targetStoreToday = requiredDailyRunRate; const targetPerStaffToday = Math.round(targetStoreToday / staffCount);  const actualToday = overviewStats.todayActual; const achvToday = calcAchv(actualToday, targetStoreToday);  return { totalMonthTarget, totalDays, daysPassed, daysLeft, actualAchievedSoFar, remainingTarget, requiredDailyRunRate, staffOnDuty, staffCount, targetStoreToday, targetPerStaffToday, actualToday, achvToday, }; }, [transactions, scheduleData, overviewStats.todayActual]);  const bnplSummary = useMemo(() => { const totalAmount = bnplRecords.reduce((acc, b) => acc + b.amount, 0); const totalQty = bnplRecords.reduce((acc, b) => acc + b.qty, 0); const storeActual = overviewStats.actual;  const map: Record<string, { amount: number; qty: number }> = {}; bnplRecords.forEach((b) => { const tKey = b.tender \vert{}\vert{} "Other"; if (!map[tKey]) map[tKey] = { amount: 0, qty: 0 }; map[tKey].amount += b.amount; map[tKey].qty += b.qty; });  const tenders = Object.entries(map).map(([tender, d]) => { const share = storeActual > 0 ? Number(((d.amount / storeActual) * 100).toFixed(1)) : 0; const estimate = Math.round((d.amount / 24) * 31); return { tender, amount: d.amount, qty: d.qty, share, estimate }; }).sort((a, b) => b.amount - a.amount);  const filteredRecords = selectedBnplTender === "ALL" ? bnplRecords : bnplRecords.filter((b) => b.tender.toLowerCase() === selectedBnplTender.toLowerCase());  return { totalAmount, totalQty, tenders, list: filteredRecords }; }, [bnplRecords, overviewStats.actual, selectedBnplTender]);  const scheduleDaySummary = useMemo(() => { const days = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const; return days.map((day) => { let morning = 0; let evening = 0; let off = 0; scheduleData.forEach((s) => { const val = s[day]; if (val === "D047") morning++; else if (val === "D103") evening++; else if (val === "OFF") off++; }); return { day, morning, evening, off, totalStaff: morning + evening }; }); }, [scheduleData]);  const updateScheduleShift = (id: string, day: keyof StaffScheduleItem, shift: string) => { if (currentSalesId !== ADMIN_ID) { alert("Akses Ditolak: Hanya Admin dengan Sales ID 22008089 yang berhak mengubah jadwal shift."); return; } setScheduleData((prev) => { const updated = prev.map((item) => (item.id === id ? { ...item, [day]: shift } : item)); if (typeof window !== "undefined") { localStorage.setItem("digi_ops_schedule", JSON.stringify(updated)); } return updated; }); };  const handleToggleReaction = (feedbackId: string, reactionKey: keyof FeedbackItem["reactions"]) => { setFeedbacks((prev) => { const updated = prev.map((fb) => { if (fb.id !== feedbackId) return fb; const already = fb.userReactions.includes(reactionKey); const newReactions = { ...fb.reactions }; let newUserReactions = [...fb.userReactions];  if (already) { newReactions[reactionKey] = Math.max(0, newReactions[reactionKey] - 1); newUserReactions = newUserReactions.filter((r) => r !== reactionKey); } else { newReactions[reactionKey] = newReactions[reactionKey] + 1; newUserReactions.push(reactionKey); }  return { ...fb, reactions: newReactions, userReactions: newUserReactions }; });  if (typeof window !== "undefined") { localStorage.setItem("digi_ops_feedbacks", JSON.stringify(updated)); } return updated; }); };  const handleCreateFeedback = (e: React.FormEvent) => { e.preventDefault(); if (!newFeedbackText.trim()) return;  const matchedStaff = staffList.find((s) => s.name === newFeedbackStaff); const initials = matchedStaff ? matchedStaff.initials : newFeedbackStaff.slice(0, 2).toUpperCase();  const newFb: FeedbackItem = { id: `fb-${Date.now()}`,
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
    
    if (typeof window !== "undefined") {
      localStorage.setItem("digi_ops_feedbacks", JSON.stringify(updated));
    }

    setNewFeedbackText("");
    setFeedbackModalOpen(false);
  };

  const handleShareDaily = () => {
    const appleVal = overviewStats.lobs.find((l) => l.name.includes("Apple"))?.actual || 0;
    const androidVal = overviewStats.lobs.find((l) => l.name.includes("Android"))?.actual || 0;
    const accVal = overviewStats.lobs.find((l) => l.name.includes("Accessories"))?.actual || 0;
    const vasVal = overviewStats.lobs.find((l) => l.name.includes("VAS"))?.actual || 0;

    const text = 
`*DAILY RETAIL SALES REPORT - DIGIPLUS GRAND INDONESIA*
Tanggal: ${selectedDate} (Filter:${periodType.toUpperCase()})

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

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"); };  const handleShareTargetWA = () => { const staffListMsg = dailyTargetCalculated.staffOnDuty .map((s) => `• ${s.name} : ${formatIDR(dailyTargetCalculated.targetPerStaffToday)}`) .join("\n");  const text = `Target ${selectedDate}

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
- Sales: ${formatIDR(sales)}
- Target: ${formatIDR(target)}
- Achievement: ${achv}%

🏆 *Top 3 Staff Mingguan:*
${staffList.slice(0, 3).map((s) => `• #${s.rank} ${s.name}: ${formatIDR(s.weekSales[wLabel] || 0)}`).join("\n")}

_Generated via Store Performance Engine._`;

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
        <div className="overflow-x-auto rounded-2xl border border-inherit w-full">
          <table className="w-full text-left text-xs min-w-[500px]">
            <thead className="bg-slate-200/70 dark:bg-black/40 uppercase text-[10px] font-black tracking-wider border-b border-inherit text-slate-950 dark:text-slate-300">
              <tr>
                <th className="py-3 px-4 font-black">Nama Produk</th>
                <th className="py-3 px-4 font-black">SAP Article</th>
                <th className="py-3 px-4 font-black">Brand</th>
                <th className="py-3 px-4 text-center font-black">Qty</th>
                <th className="py-3 px-4 text-right font-black">Nilai (Rp)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit font-semibold">
              {items.map((it, idx) => (
                <tr key={idx} className="hover:opacity-90">
                  <td className="py-3 px-4 font-black text-slate-950 dark:text-white">{it.productName}</td>
                  <td className="py-3 px-4 font-mono font-bold opacity-80 text-[11px] text-slate-900 dark:text-slate-300">{it.sapArticle || "-"}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700/50 text-slate-950 dark:text-slate-200 font-black border border-slate-300 dark:border-slate-600/40">
                      {it.brand}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-black text-amber-700 dark:text-amber-300">{it.qty}</td>
                  <td className="py-3 px-4 text-right font-black text-emerald-700 dark:text-emerald-400 font-mono">{formatIDR(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ));
  };

  const openStaffDetailSheet = (staff: StaffPerformanceData) => {
    openCustomBottomSheet(`Rincian Lengkap Salesperson: ${staff.name}`, (
      <div className="space-y-5 text-xs font-semibold">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-3 rounded-2xl border bg-black/5 dark:bg-black/25 border-inherit shadow-sm">
            <span className="text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase block tracking-wider">Actual</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-black text-sm block mt-0.5">{formatIDR(staff.actual)}</strong>
          </div>
          <div className="p-3 rounded-2xl border bg-black/5 dark:bg-black/25 border-inherit shadow-sm">
            <span className="text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase block tracking-wider">Target</span>
            <strong className="text-slate-950 dark:text-slate-200 font-black text-sm block mt-0.5">{formatIDR(staff.target)}</strong>
          </div>
          <div className="p-3 rounded-2xl border bg-black/5 dark:bg-black/25 border-inherit shadow-sm">
            <span className="text-slate-600 dark:text-slate-400 font-black text-[10px] uppercase block tracking-wider">Achv</span>
            <strong className={`font-black text-sm block mt-0
