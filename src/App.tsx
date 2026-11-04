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
  | "access-log"
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
  const [accessRows, setAccessRows] = useState<string[][]>([]);
  const [activityRows, setActivityRows] = useState<string[][]>([]);
  const [accessPassword, setAccessPassword] = useState("");
  const [accessError, setAccessError] = useState("");
  const [accessSearch, setAccessSearch] = useState("");
  const [accessLoading, setAccessLoading] = useState(false);
  const loadAccessLog = async () => {
    setAccessLoading(true); setAccessError("");
    try {
      const response = await fetch("/api/access-log", { headers: { "x-admin-access-password": accessPassword } });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Tidak dapat memuat Access Log");
      setAccessRows((data.rows || []).slice(1).reverse());
      setActivityRows((data.activityRows || []).slice(1));
    } catch (error) {
      setAccessRows([]);
      setAccessError(error instanceof Error ? error.message : "Gagal memuat data");
    } finally { setAccessLoading(false); }
  };
  // Session duration is estimated from 60-second heartbeats while the tab is visible
  // and the user has interacted within the last five minutes.
  useEffect(() => {
    if (!isLoggedIn || !currentSalesId) return;
    const sessionId = crypto.randomUUID();
    let lastInteraction = Date.now();
    let lastTick = Date.now();
    const onInteraction = () => { lastInteraction = Date.now(); };
    const post = (event: string, activeSeconds = 0) => {
      const payload = JSON.stringify({
        event, sessionId, salesId: currentSalesId, salesName: currentSalesName,
        activeSeconds, tabStatus: document.visibilityState
      });
      if (event === "end" && navigator.sendBeacon) {
        navigator.sendBeacon("/api/access-log", new Blob([payload], { type: "application/json" }));
      } else {
        void fetch("/api/access-log", { method: "POST", headers: { "content-type": "application/json" }, body: payload, keepalive: event === "end" }).catch(() => {});
      }
    };
    const tick = () => {
      const now = Date.now();
      const elapsed = Math.min(60, Math.max(0, Math.round((now - lastTick) / 1000)));
      const active = document.visibilityState === "visible" && now - lastInteraction < 5 * 60 * 1000;
      post("heartbeat", active ? elapsed : 0);
      lastTick = now;
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach(name => window.addEventListener(name, onInteraction, { passive: true }));
    const onVisibility = () => { if (document.visibilityState === "visible") { lastInteraction = Date.now(); lastTick = Date.now(); } };
    document.addEventListener("visibilitychange", onVisibility);
    post("start");
    const timer = window.setInterval(tick, 60000);
    const onPageHide = () => post("end");
    window.addEventListener("pagehide", onPageHide);
    return () => {
      window.clearInterval(timer);
      events.forEach(name => window.removeEventListener(name, onInteraction));
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      post("end");
    };
  }, [isLoggedIn, currentSalesId, currentSalesName]);

  const staffActivity = useMemo(() => {
    const sessions = new Map<string, { id: string; name: string; duration: number; last: number; ended: boolean }>();
    for (const row of activityRows) {
      const [timestamp, session, id, name, event, seconds] = row;
      if (!session || !id) continue;
      const time = Date.parse(timestamp);
      if (!Number.isFinite(time)) continue;
      const prev = sessions.get(session) || { id, name, duration: 0, last: 0, ended: false };
      if (event === "heartbeat") prev.duration += Math.min(60, Math.max(0, Number(seconds) || 0));
      if (time >= prev.last) { prev.last = time; prev.ended = event === "end"; }
      sessions.set(session, prev);
    }
    const staff = new Map<string, { id: string; name: string; duration: number; last: number; online: boolean }>();
    for (const session of sessions.values()) {
      const prev = staff.get(session.id) || { id: session.id, name: session.name, duration: 0, last: 0, online: false };
      prev.duration += session.duration;
      if (session.last >= prev.last) { prev.last = session.last; prev.name = session.name; }
      if (!session.ended && Date.now() - session.last < 150000) prev.online = true;
      staff.set(session.id, prev);
    }
    return [...staff.values()].sort((a, b) => b.last - a.last);
  }, [activityRows]);

  const recordAccess = async (salesId: string, salesName: string) => {
    let location = "Tidak dibagikan";
    let locationStatus = "Tidak diizinkan";
    if (window.confirm("Izinkan pencatatan lokasi perkiraan saat login untuk Access Log? Pilih Batal untuk login tanpa lokasi.")) {
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, {enableHighAccuracy:false, timeout:9000}));
          location = position.coords.latitude.toFixed(2) + ", " + position.coords.longitude.toFixed(2);
          locationStatus = "Diizinkan";
        } catch { locationStatus = "Izin ditolak / lokasi tidak tersedia"; }
      } else locationStatus = "Perangkat tidak mendukung lokasi";
    }
    try {
      await fetch("/api/access-log", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({salesId,salesName,location,locationStatus}) });
    } catch { /* Optional log must not block login */ }
  };


  // Live Spreadsheet Data & Targets
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [bnplRecords, setBnplRecords] = useState<BnplRecord[]>([]);
  const [storeTotalTarget, setStoreTotalTarget] = useState<number>(0);
  const [targetSheetMonth, setTargetSheetMonth] = useState<string>("");
  const [staffTargets, setStaffTargets] = useState<Record<string, number>>({});
  const [categoryTargets, setCategoryTargets] = useState<Record<string, number>>({});
  const [scheduleData, setScheduleData] = useState<StaffScheduleItem[]>(INITIAL_SCHEDULE);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [staffDailyTargets, setStaffDailyTargets] = useState<Record<string, StaffDailyTargetDetail>>({});
  const [staffCategoryTargets, setStaffCategoryTargets] = useState<Record<string, Record<string, number>>>({});
  const [selectedDailyStaff, setSelectedDailyStaff] = useState<string>("");

  // Period Filters
  const [periodType, setPeriodType] = useState<PeriodType>("monthly");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Intl.DateTimeFormat("sv-SE", {timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    const names = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    return names[Number(today.slice(5,7))-1] + today.slice(0,4);
  });
  useEffect(() => {
    const syncCurrentMonth = () => {
      const today = new Intl.DateTimeFormat("sv-SE", {timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
      const names = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      const currentMonth = names[Number(today.slice(5,7))-1] + today.slice(0,4);
      setSelectedMonth(currentMonth);
      setPeriodType("monthly");
    };
    const onVisibility = () => { if (document.visibilityState === "visible") syncCurrentMonth(); };
    window.addEventListener("pageshow", syncCurrentMonth);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", syncCurrentMonth);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);
  const [momBaseMonth, setMomBaseMonth] = useState<string>("November2026");
  const [momCompareMonth, setMomCompareMonth] = useState<string>("Oktober2026");
  const [momMode, setMomMode] = useState<"mtd" | "full">("mtd");
  const [showAllQoalaDevices, setShowAllQoalaDevices] = useState(false);
  const [overviewStaffPopupId, setOverviewStaffPopupId] = useState<string | null>(null);
  const [momToday, setMomToday] = useState(() => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [w1Filter, setW1Filter] = useState<string>("");
  const [w2Filter, setW2Filter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(() => new Intl.DateTimeFormat("sv-SE", {timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()));
  const [dateManuallySelected, setDateManuallySelected] = useState(false);
  useEffect(() => { if (!dateManuallySelected) setSelectedDate(momToday); }, [momToday, dateManuallySelected]);

  const [selectedStaffId, setSelectedStaffId] = useState<string>("");
  const [staffExpandedDetail, setStaffExpandedDetail] = useState<string | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [sheetTitle, setSheetTitle] = useState<string>("");
  const [sheetContent, setSheetContent] = useState<React.ReactNode>(null);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSentiment, setFeedbackSentiment] = useState<FeedbackItem["sentiment"]>("Cukup Baik");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackAdminKey, setFeedbackAdminKey] = useState("");
  const [isExportingPptx, setIsExportingPptx] = useState<boolean>(false);

  const loadFeedbacks = async () => {
    try {
      const response = await fetch("/api/feedback",{cache:"no-store"});
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Gagal memuat feedback");
      setFeedbacks(data.feedbacks || []);
      setFeedbackError("");
    } catch(e:any){setFeedbackError(e.message || "Feedback belum tersedia");}
  };
  useEffect(() => {
    void loadFeedbacks();
    const timer = window.setInterval(() => { void loadFeedbacks(); },15000);
    return () => window.clearInterval(timer);
  },[]);
  const submitFeedback = async () => {
    if (feedbackText.trim().length < 5) {setFeedbackError("Isi feedback minimal 5 karakter");return;}
    setFeedbackLoading(true);
    try {
      const response=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({salesName:currentSalesName || "Staff",text:feedbackText.trim(),sentiment:feedbackSentiment})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error || "Gagal mengirim feedback");
      setFeedbackText("");
      await loadFeedbacks();
    } catch(e:any){setFeedbackError(e.message || "Gagal mengirim feedback");}
    finally{setFeedbackLoading(false);}
  };
  const deleteFeedback = async (id:string) => {
    if(!window.confirm("Hapus feedback ini secara permanen?"))return;
    setFeedbackLoading(true);
    try{
      const response=await fetch("/api/feedback",{method:"DELETE",headers:{"Content-Type":"application/json","x-feedback-admin-key":feedbackAdminKey},body:JSON.stringify({id})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error || "Gagal menghapus");
      await loadFeedbacks();
    }catch(e:any){setFeedbackError(e.message || "Gagal menghapus feedback");}
    finally{setFeedbackLoading(false);}
  };

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
    const names = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const monthMatch = cleanRawM.match(/^(.*?)(20\d{2})$/);
    const matchedIndex = monthMatch ? names.findIndex(n=>n.toLowerCase()===monthMatch[1].trim().toLowerCase()) : -1;
    const monthKey = matchedIndex >= 0 ? names[matchedIndex] + monthMatch![2]
      : /^20\d{2}-\d{2}$/.test(isoDate.slice(0,7))
        ? names[Number(isoDate.slice(5,7))-1] + isoDate.slice(0,4)
        : cleanRawM;
    return { isoDate, monthKey };
  };

  const fetchLiveGoogleSheets = async () => {
    setIsLoading(true);
    try {
      const dbUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:json&gid=602901290';
      const bnplUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:json&gid=2697970';
      const targetUrl = 'https://docs.google.com/spreadsheets/d/' + SPREADSHEET_ID + '/gviz/tq?tqx=out:json&gid=685849310';


      const [resDb, resBnpl, resTarget] = await Promise.all([
        fetch(dbUrl),
        fetch(bnplUrl),
        fetch(targetUrl)
      ]);

      const textDb = await resDb.text();
      const textBnpl = await resBnpl.text();
      const textTarget = await resTarget.text();


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
            supplier,
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

      // Single source of truth: Pembagian target, header-driven columns B:W.
      const jsonTarget = JSON.parse(textTarget.substring(textTarget.indexOf("{"), textTarget.lastIndexOf("}") + 1));
      const rows = jsonTarget.table?.rows || [];
      const norm = (name:string) => name.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
      const parseMoney = (cell:any):number => {
        const raw=cell?.v ?? cell?.f ?? 0;
        return typeof raw==="number" ? raw : Number(String(raw).replace(/[^0-9-]/g,"")) || 0;
      };
      const cellText=(c:any[],i:number)=>String(c[i]?.f ?? c[i]?.v ?? "").trim();
      const categories:Record<string,string>={
        "total target mtd":"total","iphone":"iphone","ipad":"ipad","macbook":"macbook",
        "apple watch":"applewatch","total target apple devices":"apple",
        "samsung":"samsung","oppo":"oppo","xiaomi":"xiaomi","huawei":"huawei",
        "motorola":"motorola","infinix":"infinix","total target android devices":"android",
        "accessories":"accessories","qoala":"qoala","telkomsel":"telkomsel",
        "indosat":"indosat","xl":"xl","total target vas":"vas"
      };
      const header=rows.find((r:any)=> {
        const c=r.c || [];
        return c.some((_:any,i:number)=>norm(cellText(c,i))==="nama staff")
          && c.some((_:any,i:number)=>norm(cellText(c,i))==="total target mtd");
      });
      if(!header)throw new Error("Header Pembagian target tidak ditemukan");
      const columns:Record<string,number>={};
      (header.c || []).forEach((_:any,i:number)=>{
        const label=norm(cellText(header.c,i));
        if(categories[label])columns[categories[label]]=i;
        if(label==="nama staff")columns.staff=i;
        if(label==="bulan")columns.month=i;
      });
      const targetMap:Record<string,number>={};
      const categoryByStaff:Record<string,Record<string,number>>={};
      const categoryTotals:Record<string,number>={};
      const monthNames=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      const normalizeMonth=(v:string)=>{
        const m=v.trim().match(/^([a-zA-Z]+)\s*(20\d{2})$/);
        const idx=m?monthNames.findIndex(n=>n.toLowerCase()===m[1].toLowerCase()):-1;
        return idx>=0?monthNames[idx]+m![2]:"";
      };
      const targetMonth=rows.map((r:any)=>normalizeMonth(cellText(r.c||[],columns.month))).find(Boolean) || "";
      const currentMonth=new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit"}).format(new Date());
      const currentMonthKey=monthNames[Number(currentMonth.slice(5,7))-1]+currentMonth.slice(0,4);
      const validMonth=targetMonth && targetMonth===currentMonthKey;
      let parsedGrandTotal=0;
      rows.forEach((r:any)=>{
        const c=r.c || [];
        const rawName=cellText(c,columns.staff);
        const key=norm(rawName);
        const rowMonth=normalizeMonth(cellText(c,columns.month));
        // The Grand Total label is in column B (Bulan), not column C (Nama Staff).
        if(norm(cellText(c,columns.month))==="grand total" || key==="grand total"){
          Object.entries(columns).forEach(([category,i])=>{
            if(!["staff","month"].includes(category))categoryTotals[category]=parseMoney(c[i]);
          });
          parsedGrandTotal=categoryTotals.total || 0;
          return;
        }
        if(!key)return;
        if(!rowMonth || rowMonth!==targetMonth || key==="nama staff")return;
        const perCategory:Record<string,number>={};
        Object.entries(columns).forEach(([category,i])=>{
          if(!["staff","month"].includes(category))perCategory[category]=parseMoney(c[i]);
        });
        categoryByStaff[key]=perCategory;
        targetMap[key]=perCategory.total || 0;
      });
      if(!parsedGrandTotal)parsedGrandTotal=Object.values(targetMap).reduce((a,b)=>a+b,0);
      setTargetSheetMonth(targetMonth);
      setStoreTotalTarget(validMonth?parsedGrandTotal:0);
      setStaffTargets(validMonth?targetMap:{});
      setStaffCategoryTargets(validMonth?categoryByStaff:{});
      setCategoryTargets(validMonth?categoryTotals:{});
      const daysInTargetMonth=Number(currentMonth.slice(5,7))>0
        ? new Date(Number(currentMonth.slice(0,4)),Number(currentMonth.slice(5,7)),0).getDate():30;
      const dailyTargets:Record<string,StaffDailyTargetDetail>={};
      if(validMonth)Object.entries(categoryByStaff).forEach(([name,c])=>{
        dailyTargets[name]={
          total:Math.round((c.total||0)/daysInTargetMonth),
          apple:Math.round((c.apple||0)/daysInTargetMonth),
          android:Math.round((c.android||0)/daysInTargetMonth),
          accessories:Math.round((c.accessories||0)/daysInTargetMonth),
          vas:Math.round((c.vas||0)/daysInTargetMonth)
        };
      });
      setStaffDailyTargets(dailyTargets);
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
    void recordAccess(cleanId, detectedName);
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

  // Prefer DATABASE column O; derive calendar week from transaction date if O is blank/0.
  // Infer the continuous Week number for blank DATABASE labels using an existing labeled transaction.
  const continuousWeekAnchor = useMemo(() => {
    for (const t of transactions) {
      const match=String(t.weekLabel||"").trim().match(/^Week\s+(\d+)$/i);
      if(!match || !/^20\d{2}-\d{2}-\d{2}$/.test(t.isoDate||""))continue;
      const date=new Date(t.isoDate+"T00:00:00Z");
      if(Number.isNaN(date.getTime()))continue;
      const weekStart=date.getTime()-date.getUTCDay()*86400000;
      return weekStart-(Number(match[1])-1)*7*86400000;
    }
    return null as number|null;
  },[transactions]);
  const getTransactionWeek = (t: RawTransaction): string => {
    const date = (t.isoDate || "").trim();
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(date) || date.startsWith("1899-")) return "";
    const month = date.slice(0,7);
    const raw = String(t.weekLabel || "").trim();
    const dateMs=Date.parse(date+"T00:00:00Z");
    const weekStart=dateMs-new Date(dateMs).getUTCDay()*86400000;
    const inferred=continuousWeekAnchor===null?0:Math.floor((weekStart-continuousWeekAnchor)/604800000)+1;
    const week = raw && raw !== "0" && raw !== "-" ? raw : "Week " + (inferred>0?inferred:Math.ceil(Number(date.slice(8,10))/7));
    return month + " · " + week;
  };
  const AUTO_WEEKS = useMemo(() => {
    const map = new Map<string, {label:string;minDate:string;maxDate:string}>();
    transactions.forEach(t => {
      const label = getTransactionWeek(t);
      if (!label) return;
      if (!map.has(label)) map.set(label,{label,minDate:t.isoDate,maxDate:t.isoDate});
      const item=map.get(label)!;
      if (t.isoDate<item.minDate)item.minDate=t.isoDate;
      if (t.isoDate>item.maxDate)item.maxDate=t.isoDate;
    });
    const monthNames=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const monthIdx=monthNames.findIndex(m=>selectedMonth.toLowerCase().startsWith(m.toLowerCase()));
    const year=selectedMonth.match(/20\d{2}/)?.[0];
    const monthPrefix=year && monthIdx>=0 ? year+"-"+String(monthIdx+1).padStart(2,"0") : "";
    return [...map.values()].filter(w=>!monthPrefix || w.minDate.startsWith(monthPrefix)).sort((a,b)=>a.minDate.localeCompare(b.minDate)).map((w,i)=>({
      key:String(i),label:w.label,range:w.minDate+" s.d. "+w.maxDate,days:7
    }));
  },[transactions,selectedMonth]);

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
        const selected = selectedWeek.trim();
        if (selected.includes(" · ")) return getTransactionWeek(t) === selected;
        const raw = String(t.weekLabel || "").trim().toLowerCase();
        return raw !== "" && raw !== "0" && raw === selected.toLowerCase();
      }
      return true;
    });
  }, [transactions, selectedMonth, periodType, selectedDate, selectedWeek]);

  const overviewStats = useMemo(() => {
    const activeTx = activeTransactions || [];
    const actual = activeTx.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    
    const baseTarget = selectedMonth===targetSheetMonth ? storeTotalTarget : 0;
    const target = periodType === "daily"
      ? Math.round(baseTarget / new Date(Number(selectedDate.slice(0,4)),Number(selectedDate.slice(5,7)),0).getDate())
      : periodType === "weekly"
      ? Math.round((baseTarget / new Date(Number(momToday.slice(0,4)),Number(momToday.slice(5,7)),0).getDate()) * (selectedWeek==="ALL" ? 7 : Math.max(1,Math.min(7,new Set(activeTx.map(t=>t.isoDate).filter(Boolean)).size))))
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
    const appleTarget = Math.round((selectedMonth===targetSheetMonth ? (categoryTargets.apple ?? 0) : 0) * (periodType==="monthly" ? 1 : target > 0 && baseTarget > 0 ? target/baseTarget : 0));

    const androidItems = activeTx.filter((t: any) => {
      const pUpper = (t.productName || "").toUpperCase();
      const isCaseOrAcc = pUpper.includes("CASE") || pUpper.includes("GLASS") || pUpper.includes("ADAPTER") || pUpper.includes("CABLE");
      return t.groupCategory === "DEVICES" && t.brand !== "APPLE" && !isCaseOrAcc;
    });
    const androidActual = androidItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const androidTarget = Math.round((selectedMonth===targetSheetMonth ? (categoryTargets.android ?? 0) : 0) * (periodType==="monthly" ? 1 : target > 0 && baseTarget > 0 ? target/baseTarget : 0));

    const accItems = activeTx.filter((t: any) => t.groupCategory === "ACCESSORIES");
    const accActual = accItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const accTarget = Math.round((selectedMonth===targetSheetMonth ? (categoryTargets.accessories ?? 0) : 0) * (periodType==="monthly" ? 1 : target > 0 && baseTarget > 0 ? target/baseTarget : 0));

    const vasItems = activeTx.filter((t: any) => t.groupCategory === "VAS");
    const vasActual = vasItems.reduce((acc: number, t: any) => acc + (Number(t.amount) || 0), 0);
    const vasTarget = Math.round((selectedMonth===targetSheetMonth ? (categoryTargets.vas ?? 0) : 0) * (periodType==="monthly" ? 1 : target > 0 && baseTarget > 0 ? target/baseTarget : 0));

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

  const qoalaDetails = useMemo(() => {
    const tx = activeTransactions || [];
    const isQoala = (t: RawTransaction) => t.brand === "QOALA" || /QOALA|PROTEKSI/i.test(t.productName || "");
    const devices = tx.filter(t => t.groupCategory === "DEVICES");
    const policies = tx.filter(isQoala);
    const staff = new Map<string, { id: string; name: string; devices: number; qoala: number; amount: number }>();
    for (const t of [...devices, ...policies]) {
      const id = t.salesId || "UNKNOWN";
      const item = staff.get(id) || { id, name: t.salesName || id, devices: 0, qoala: 0, amount: 0 };
      if (t.salesName) item.name = t.salesName;
      if (t.groupCategory === "DEVICES") item.devices += Math.max(0, Number(t.qty) || 0);
      if (isQoala(t)) {
        item.qoala += Math.max(0, Number(t.qty) || 0);
        item.amount += Number(t.amount) || 0;
      }
      staff.set(id, item);
    }
    const ranking = [...staff.values()].filter(item => item.devices > 0 || item.qoala > 0)
      .map(item => ({ ...item, ar: item.devices ? item.qoala / item.devices * 100 : 0 }))
      .sort((a, b) => b.ar - a.ar || b.qoala - a.qoala || a.name.localeCompare(b.name));
    const productMap = new Map<string, { name: string; qty: number; amount: number }>();
    const deviceMap = new Map<string, { name: string; qty: number; attached: number }>();
    const invoiceDevices = new Map<string, RawTransaction[]>();
    for (const t of devices) {
      const key = (t.invoice || "").trim().toUpperCase();
      if (key) invoiceDevices.set(key, [...(invoiceDevices.get(key) || []), t]);
      const name = t.productName || "Device tidak diketahui";
      const current = deviceMap.get(name) || { name, qty: 0, attached: 0 };
      current.qty += Math.max(0, Number(t.qty) || 0);
      deviceMap.set(name, current);
    }
    const matched = new Set<string>();
    let unmatchedQty = 0;
    for (const t of policies) {
      const name = t.productName || "Qoala tidak diketahui";
      const item = productMap.get(name) || { name, qty: 0, amount: 0 };
      item.qty += Math.max(0, Number(t.qty) || 0);
      item.amount += Number(t.amount) || 0;
      productMap.set(name, item);
      const invoice = (t.invoice || "").trim().toUpperCase();
      const matches = invoice ? invoiceDevices.get(invoice) || [] : [];
      if (!matches.length) { unmatchedQty += Math.max(0, Number(t.qty) || 0); continue; }
      // Assign a policy to one device unit on the same invoice, without double counting.
      let remaining = Math.max(0, Number(t.qty) || 0);
      for (const device of matches) {
        const key = [invoice, device.sapArticle, device.productName].join("|");
        const used = [...matched].filter(k => k.startsWith(key + "|")).length;
        const capacity = Math.max(0, (Number(device.qty) || 0) - used);
        const attach = Math.min(remaining, capacity);
        const detail = deviceMap.get(device.productName || "Device tidak diketahui");
        if (detail) detail.attached += attach;
        for (let i = 0; i < attach; i++) matched.add(key + "|" + (used + i));
        remaining -= attach;
        if (!remaining) break;
      }
      unmatchedQty += remaining;
    }
    return { ranking, products: [...productMap.values()].sort((a,b) => b.qty - a.qty),
      devices: [...deviceMap.values()].sort((a,b) => b.attached - a.attached || b.qty - a.qty),
      unmatchedQty };
  }, [activeTransactions]);

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
        staffTargets[nameKey] ??
        staffTargets[nameKey.split(" ")[0]] ??
        staffTargets[s.salesId];

      const targetQuota = selectedMonth===targetSheetMonth ? (matchedTarget ?? 0) : 0;
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

  useEffect(() => {
    const timer = window.setInterval(() => {
      setMomToday(new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const momAnalytics = useMemo(() => {
    const todayDay = Number(momToday.slice(-2)) || 1;
    const monthDayLimit = (month: string) => {
      const match = month.match(/(20\d{2})$/);
      const year = match ? Number(match[1]) : new Date().getFullYear();
      const monthName = month.replace(/20\d{2}$/, "").trim().toLowerCase();
      const names = ["januari","februari","maret","april","mei","juni","juli","agustus","september","oktober","november","desember"];
      const monthIndex = names.indexOf(monthName);
      return monthIndex >= 0 ? Math.min(todayDay, new Date(year, monthIndex + 1, 0).getDate()) : todayDay;
    };
    const withinPeriod = (t: RawTransaction, month: string) => {
      if ((t.monthKey || t.month || "").trim() !== month) return false;
      if (momMode === "full") return true;
      const day = Number((t.isoDate || "").slice(8, 10));
      return day >= 1 && day <= monthDayLimit(month);
    };
    const trxM1 = transactions.filter(t => withinPeriod(t, momCompareMonth));
    const trxM2 = transactions.filter(t => withinPeriod(t, momBaseMonth));

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
  }, [transactions, momBaseMonth, momCompareMonth, momMode, momToday]);

  const weeklyComparisonData = useMemo(() => {
    const weekRows = (week: string) => transactions.filter(t => week && getTransactionWeek(t) === week);
    const w1 = weekRows(w1Filter);
    const w2 = weekRows(w2Filter);
    const amount = (rows: RawTransaction[]) => rows.reduce((n,t) => n + (Number(t.amount) || 0),0);
    const qty = (rows: RawTransaction[]) => rows.reduce((n,t) => n + (Number(t.qty) || 0),0);
    const totalM1 = amount(w1), totalM2 = amount(w2);
    const staffIds = [...new Set([...w1,...w2].map(t => t.salesId || t.salesName))];
    const staffSales = staffIds.map(id => {
      const a = w1.filter(t => (t.salesId || t.salesName) === id);
      const b = w2.filter(t => (t.salesId || t.salesName) === id);
      return { id, name: (b[0] || a[0])?.salesName || id, m1: amount(a), m2: amount(b), growth: calcGrowth(amount(b),amount(a)) };
    }).sort((a,b) => b.m2 - a.m2);
    const daily = (rows: RawTransaction[]) => {
      const m = new Map<string,number>();
      rows.forEach(t => { if(t.isoDate) m.set(t.isoDate,(m.get(t.isoDate)||0)+(Number(t.amount)||0)); });
      return [...m.entries()].sort((a,b) => a[0].localeCompare(b[0])).map(([date,value])=>({date,value}));
    };
    const appleTypes = ["iPhone","iPad","MacBook","Apple Watch","AirPods"];
    const categoryOf = (t: RawTransaction) => {
      const name = (t.productName || "").toUpperCase(), type = (t.productType || "").toUpperCase();
      const p = name + " " + type;
      if (t.brand === "APPLE") {
        if (p.includes("IPHONE")) return "iPhone";
        if (p.includes("IPAD")) return "iPad";
        if (p.includes("MAC")) return "MacBook";
        if (p.includes("WATCH")) return "Apple Watch";
        if (p.includes("AIRPOD")) return "AirPods";
        return "Apple Other";
      }
      if (p.includes("TABLET") || p.includes("TAB") || p.includes("PAD")) return "Tablet";
      if (p.includes("WATCH") || p.includes("BAND") || p.includes("FIT")) return "Watch";
      if (p.includes("PHONE") || p.includes("GALAXY") || p.includes("RENO") || p.includes("NOVA") || p.includes("PURA") || p.includes("MATE") || p.includes("FIND")) return "Phone";
      return "Other";
    };
    const build = (filter: (t: RawTransaction) => boolean, types: string[]) => {
      const rows = [w1.filter(filter),w2.filter(filter)];
      const period = rows.map(items => {
        const ids = [...new Set(items.map(t=>t.salesId || t.salesName))];
        return { qty:qty(items), amount:amount(items), staff: ids.map(id => {
          const own = items.filter(t=>(t.salesId || t.salesName)===id);
          return {id,name:own[0]?.salesName || id,qty:qty(own),amount:amount(own),categories:types.map(type=>{
            const matching = own.filter(t=>categoryOf(t)===type);
            return {name:type,qty:qty(matching),amount:amount(matching)};
          }).filter(c=>c.qty || c.amount)};
        }).sort((a,b)=>b.amount-a.amount)};
      });
      return {w1:period[0],w2:period[1],growth:calcGrowth(period[1].amount,period[0].amount),qtyGrowth:calcGrowth(period[1].qty,period[0].qty)};
    };
    return {
      p1Label:w1Filter,p2Label:w2Filter,totalM1,totalM2,storeGrowth:calcGrowth(totalM2,totalM1),
      staffSales, daily1:daily(w1),daily2:daily(w2),
      apple:build(t=>t.brand==="APPLE" && (t.groupCategory==="DEVICES" || (t.productType||"").toUpperCase().includes("AIRPOD")),appleTypes),
      android:["SAMSUNG","HUAWEI","OPPO"].map(brand=>({brand,...build(t=>t.groupCategory==="DEVICES" && (t.brand || "").toUpperCase()===brand,["Phone","Tablet","Watch","Other"])}))
    };
  }, [transactions,w1Filter,w2Filter]);

  const timeGoneStats = useMemo(() => {
    const dates = transactions.map(t => String(t.isoDate || "").trim()).filter(d => {
      if (!/^20\d{2}-\d{2}-\d{2}$/.test(d)) return false;
      const [y,m,day]=d.split("-").map(Number);
      const parsed=new Date(Date.UTC(y,m-1,day));
      return parsed.getUTCFullYear()===y && parsed.getUTCMonth()===m-1 && parsed.getUTCDate()===day;
    }).sort();
    const latestDate = dates[dates.length - 1];
    if (!latestDate) return {monthName:"BELUM ADA DATA",elapsedDays:0,totalDays:0,remainingDays:0,timeElapsedPct:0};
    const [yearText,monthText,dayText] = latestDate.split("-");
    const year = Number(yearText), monthIndex = Number(monthText) - 1;
    const totalDays = new Date(year,monthIndex + 1,0).getDate();
    const elapsedDays = Math.min(totalDays,Math.max(0,Number(dayText)));
    const remainingDays = totalDays - elapsedDays;
    const timeElapsedPct = Number((elapsedDays / totalDays * 100).toFixed(2));
    const monthName = new Date(year,monthIndex,1).toLocaleDateString("id-ID",{month:"long",year:"numeric"}).toUpperCase();
    return {monthName,elapsedDays,totalDays,remainingDays,timeElapsedPct};
  },[transactions]);

  const dailyTrendStats = useMemo(() => {
    const monthMatch=selectedMonth.match(/^(.*?)(20\d{2})$/);
    const monthIdx=monthMatch?["januari","februari","maret","april","mei","juni","juli","agustus","september","oktober","november","desember"].indexOf(monthMatch[1].trim().toLowerCase()):-1;
    const daysInMonth=monthIdx>=0?new Date(Number(monthMatch![2]),monthIdx+1,0).getDate():timeGoneStats.totalDays || 31;
    const idealDaily = Math.round((selectedMonth===targetSheetMonth ? storeTotalTarget : 0) / daysInMonth);
    const arr = [];

    const datePrefix = periodType === "monthly" ? (() => { const m = selectedMonth.match(/^(.*?)(20\d{2})$/); const idx = m ? ["januari","februari","maret","april","mei","juni","juli","agustus","september","oktober","november","desember"].indexOf(m[1].toLowerCase()) : -1; return idx >= 0 ? `${m![2]}-${String(idx+1).padStart(2,"0")}` : momToday.slice(0,7); })() : selectedDate.slice(0,7);

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
  }, [transactions, storeTotalTarget, selectedDate, selectedMonth, periodType, momToday, timeGoneStats]);

  const dailyTargetCalculated = useMemo(() => {
    const [yearText,monthText,dayText]=selectedDate.split("-");
    const year=Number(yearText),month=Number(monthText);
    const totalDaysInMonth=new Date(year,month,0).getDate();
    const daysPassed=Math.max(1,Math.min(totalDaysInMonth,Number(dayText)||1));
    const daysLeft=Math.max(0,totalDaysInMonth-daysPassed);
    const monthKey=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"][month-1]+year;
    const validTarget=targetSheetMonth===monthKey;
    const monthlyTarget=validTarget?storeTotalTarget:0;
    const monthPrefix=selectedDate.slice(0,7);
    const monthTrx=transactions.filter(t=>t.isoDate.startsWith(monthPrefix) && t.isoDate<=selectedDate);
    const actualAchievedSoFar=monthTrx.reduce((a,t)=>a+(Number(t.amount)||0),0);
    const actualToday=monthTrx.filter(t=>t.isoDate===selectedDate).reduce((a,t)=>a+(Number(t.amount)||0),0);
    const remainingTarget=Math.max(0,monthlyTarget-actualAchievedSoFar);
    const targetStoreToday=Math.round(monthlyTarget/totalDaysInMonth);
    const requiredDailyRunRate=remainingTarget/Math.max(1,daysLeft);
    const staffOnDuty=Object.entries(staffTargets).filter(([name])=>!name.includes("admin")&&!name.includes("leader")).map(([name,target])=>({
      name,targetToday:Math.round((validTarget?target:0)/totalDaysInMonth),
      runRate:Math.round(Math.max(0,(validTarget?target:0)-monthTrx.filter(t=>t.salesName.toLowerCase().trim()===name).reduce((a,t)=>a+(Number(t.amount)||0),0))/Math.max(1,daysLeft))
    }));
    const staffCount=staffOnDuty.length;
    const targetPerStaffToday=staffCount?Math.round(targetStoreToday/staffCount):0;
    return {totalMonthTarget:monthlyTarget,totalDays:totalDaysInMonth,daysPassed,daysLeft,
      actualAchievedSoFar,remainingTarget,requiredDailyRunRate:Math.round(requiredDailyRunRate),
      staffOnDuty,staffCount,targetStoreToday,targetPerStaffToday,actualToday,
      achvToday:targetStoreToday>0?Math.round(actualToday/targetStoreToday*100):0};
  },[transactions,selectedDate,storeTotalTarget,targetSheetMonth,staffTargets]);

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

    const iphoneStr = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPHONE"));
    const ipadStr = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPAD"));
    const macbookStr = calcSub((t) => t.brand === "APPLE" && ((t.productName || "").toUpperCase().includes("MAC") || (t.productName || "").toUpperCase().includes("BOOK")));
    const watchStr = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("WATCH"));

    const samsungStr = calcSub((t) => t.brand === "SAMSUNG" && t.groupCategory === "DEVICES");
    const oppoStr = calcSub((t) => t.brand === "OPPO" && t.groupCategory === "DEVICES");
    const huaweiStr = calcSub((t) => t.brand === "HUAWEI" && t.groupCategory === "DEVICES");
    const xiaomiStr = calcSub((t) => (t.brand === "XIAOMI" || t.brand === "REDMI") && t.groupCategory === "DEVICES");
    const motorolaStr = calcSub((t) => t.brand === "MOTOROLA" && t.groupCategory === "DEVICES");
    const infinixStr = calcSub((t) => t.brand === "INFINIX" && t.groupCategory === "DEVICES");

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
      .map((s: any) => `• ${s.name} : ${formatIDR(s.targetToday)} | Run Rate: ${formatIDR(s.runRate)}`)
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

    const iphoneText = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPHONE"));
    const ipadText = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("IPAD"));
    const macbookText = calcSub((t) => t.brand === "APPLE" && ((t.productName || "").toUpperCase().includes("MAC") || (t.productName || "").toUpperCase().includes("BOOK")));
    const watchText = calcSub((t) => t.brand === "APPLE" && (t.productName || "").toUpperCase().includes("WATCH"));

    const samsungText = calcSub((t) => t.brand === "SAMSUNG" && t.groupCategory === "DEVICES");
    const oppoText = calcSub((t) => t.brand === "OPPO" && t.groupCategory === "DEVICES");
    const huaweiText = calcSub((t) => t.brand === "HUAWEI" && t.groupCategory === "DEVICES");
    const xiaomiText = calcSub((t) => (t.brand === "XIAOMI" || t.brand === "REDMI") && t.groupCategory === "DEVICES");
    const motoText = calcSub((t) => t.brand === "MOTOROLA" && t.groupCategory === "DEVICES");
    const infinixText = calcSub((t) => t.brand === "INFINIX" && t.groupCategory === "DEVICES");

    const accText = calcSub((t) => t.groupCategory === "ACCESSORIES");

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
    ? "bg-[#1c222b] border-[#414c5a] shadow-lg" 
    : "bg-white border-[#dce3eb] shadow-sm";

  const innerBg = isDark 
    ? "bg-[#29313c] border-[#414c5a]" 
    : "bg-[#edf1f5] border-[#dce3eb]";

  const textMain = isDark ? "text-[#f4f7fb]" : "text-[#17212f]";
  const textMuted = isDark ? "text-[#b9c6d6]" : "text-[#475569]";
  const accentText = isDark ? "text-[#82c2ff]" : "text-[#075bb5]";
  const activeTabBtn = isDark 
    ? "bg-sky-500/20 text-sky-400 border border-sky-400/40 shadow-sm" 
    : "bg-sky-50 text-sky-700 border border-sky-300 shadow-sm";
  const glassSidebar = isDark 
    ? "bg-[#1c222b]/95 border-[#414c5a]" 
    : "bg-white/95 border-[#dce3eb]";

  const mainNavItems = [
    { id: "store-overview", label: "Overview Store", icon: "📊", color: "bg-emerald-500", shadow: "shadow-emerald-500/30" },
    { id: "weekly-sales", label: "Weekly Sales (WoW)", icon: "📈", color: "bg-blue-600", shadow: "shadow-blue-600/30" },
    { id: "qoala-ar", label: "Qoala Protection (AR %)", icon: "🛡️", color: "bg-rose-500", shadow: "shadow-rose-500/30" },
    { id: "mom-comparison", label: "MoM Growth Analysis", icon: "⚖️", color: "bg-indigo-500", shadow: "shadow-indigo-500/30" },
    { id: "staff-performance", label: "Staff Performance", icon: "🏆", color: "bg-amber-500", shadow: "shadow-amber-500/30" },
    { id: "daily-target", label: "Daily Target & Run Rate", icon: "🎯", color: "bg-orange-500", shadow: "shadow-orange-500/30" },
    { id: "brand-focus", label: "Brand Focus", icon: "🏷️", color: "bg-amber-500", shadow: "shadow-amber-500/30" },
    { id: "schedule", label: "Jadwal Shift 1 Minggu", icon: "📅", color: "bg-sky-500", shadow: "shadow-sky-500/30" },
    { id: "feedback", label: "Feedback Tim", icon: "💬", color: "bg-teal-500", shadow: "shadow-teal-500/30" },
    { id: "bnpl", label: "BNPL Transactions", icon: "💳", color: "bg-purple-500", shadow: "shadow-purple-500/30" },
    { id: "product-search", label: "Cari Produk Terjual", icon: "🔍", color: "bg-pink-500", shadow: "shadow-pink-500/30" },
    { id: "sales-detail", label: "Rincian Transaksi Log", icon: "📋", color: "bg-slate-600", shadow: "shadow-slate-600/30" },
    ...(currentSalesId === ADMIN_ID ? [{ id: "access-log", label: "Access Log (Admin)", icon: "🔐", color: "bg-indigo-600", shadow: "shadow-indigo-600/30" }] : []),
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

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="mom-mode">Mode Perbandingan:</label>
            <select id="mom-mode" value={momMode} onChange={e => setMomMode(e.target.value as "mtd" | "full")} className="rounded-xl border px-3 py-2 bg-white text-slate-950 dark:bg-slate-800 dark:text-white text-xs font-bold">
              <option value="mtd">MTD Otomatis (Tanggal Sama)</option>
              <option value="full">Full Month (Seluruh Bulan)</option>
            </select>
            <span className={textMuted + " text-xs"}>{momMode === "mtd" ? "Periode tanggal 1–" + Number(momToday.slice(-2)) + " (maksimum akhir bulan), WIB" : "Semua tanggal dalam bulan yang dipilih"}</span>
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
                      onChange={(e) => { setDateManuallySelected(true); setSelectedDate(e.target.value); }}
                      className={`${innerBg} border rounded-xl px-2.5 py-1 font-black focus:outline-none text-slate-950 dark:text-white`}
                    >
                    </input>
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
              {activeTab === "access-log" && currentSalesId === ADMIN_ID && (
                <div className={cardBg + " p-5 rounded-3xl border space-y-4"}>
                  <h2 className="font-black text-lg text-slate-950 dark:text-white">🔐 Access Log — Riwayat Login</h2>
                  <p className="text-sm text-slate-700 dark:text-slate-300">Khusus admin. Masukkan password Access Log yang berbeda dari password login sales.</p>
                  <div className="flex flex-wrap gap-2">
                    <input type="password" placeholder="Password khusus Access Log" value={accessPassword} onChange={e=>setAccessPassword(e.target.value)} className="p-2 rounded-lg border bg-white text-slate-950 dark:bg-slate-800 dark:text-white" />
                    <button disabled={!accessPassword || accessLoading} onClick={()=>void loadAccessLog()} className="px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold disabled:opacity-50">{accessLoading ? "Memuat..." : "Buka / Refresh"}</button>
                  </div>
                  {accessError && <p className="text-rose-600 text-sm">{accessError}</p>}
                  <div className="space-y-2">
                    <h3 className="font-black text-slate-950 dark:text-white">📡 Staff Activity Monitor</h3>
                    <p className="text-xs text-slate-700 dark:text-slate-300">Estimasi durasi aktif berdasarkan heartbeat 60 detik saat tab terlihat dan tidak idle. Klik Refresh untuk memperbarui status.</p>
                    <div className="overflow-x-auto"><table className="w-full min-w-[550px] text-xs text-slate-900 dark:text-slate-100">
                      <thead><tr>{["Sales ID", "Nama Staff", "Durasi Aktif", "Terakhir Aktif (WIB)", "Status"].map(h => <th key={h} className="p-2 text-left">{h}</th>)}</tr></thead>
                      <tbody>{staffActivity.filter(item => (item.id + " " + item.name).toLowerCase().includes(accessSearch.toLowerCase())).map(item => <tr key={item.id} className="border-t border-slate-300 dark:border-slate-700">
                        <td className="p-2">{item.id}</td><td className="p-2">{item.name}</td>
                        <td className="p-2">{Math.floor(item.duration / 3600)}j {Math.floor(item.duration % 3600 / 60)}m</td>
                        <td className="p-2">{new Date(item.last).toLocaleString("id-ID", {timeZone:"Asia/Jakarta"})}</td>
                        <td className="p-2">{item.online ? "🟢 Online" : "⚪ Offline"}</td>
                      </tr>)}</tbody>
                    </table></div>
                  </div>
                  <input placeholder="Cari Sales ID / Nama" value={accessSearch} onChange={e=>setAccessSearch(e.target.value)} className="p-2 rounded-lg border bg-white text-slate-950 dark:bg-slate-800 dark:text-white" />
                  <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-xs text-slate-900 dark:text-slate-100">
                    <thead><tr>{["Tanggal","Waktu WIB","Sales ID","Nama Sales","Lokasi","Status Lokasi"].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead>
                    <tbody>{accessRows.filter(row=>row.slice(3,5).join(" ").toLowerCase().includes(accessSearch.toLowerCase())).map((row,i)=><tr key={i} className="border-t border-slate-300 dark:border-slate-700">{[row[1],row[2],row[3],row[4],row[5],row[6]].map((v,j)=><td key={j} className="p-3">{v || "—"}</td>)}</tr>)}</tbody>
                  </table></div>
                </div>
              )}
              {activeTab === "store-overview" && (
                <div className="space-y-6 sm:space-y-8">
                  <section className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl`}>
                    <div className="mb-4">
                      <h2 className="text-base sm:text-lg font-black text-slate-950 dark:text-white">🏆 STAFF RANKING — TARGET VS ACHIEVEMENT</h2>
                      <p className={`text-xs ${textMuted}`}>Diurutkan berdasarkan achievement % tertinggi, kemudian sales value. Klik avatar atau More Details untuk rincian kategori.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {[...staffList].sort((a,b) => b.achvPct - a.achvPct || b.totalAmount - a.totalAmount).map((st, index) => (
                        <button type="button" key={st.salesId} onClick={() => setOverviewStaffPopupId(st.salesId)} className={`text-left p-4 rounded-2xl border ${innerBg} hover:border-sky-400 transition-colors`}>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-sm text-amber-500 w-7">#{index + 1}</span>
                            <span className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-white font-black flex items-center justify-center ring-2 ring-sky-400/30">{st.initials}</span>
                            <div className="min-w-0 flex-1">
                              <p className="font-black text-sm text-slate-950 dark:text-white truncate">{st.name}</p>
                              <p className={`text-[11px] ${textMuted}`}>Sales ID: {st.salesId}</p>
                            </div>
                            <span className={`text-sm font-black ${st.achvPct >= 100 ? "text-emerald-500" : "text-sky-500"}`}>{st.achvPct}%</span>
                          </div>
                          <div className="mt-3 space-y-1 text-xs">
                            <div className="flex justify-between gap-2"><span className={textMuted}>Achievement</span><strong className="text-slate-950 dark:text-white">{formatIDR(st.totalAmount)}</strong></div>
                            <div className="flex justify-between gap-2"><span className={textMuted}>Target</span><strong className="text-slate-950 dark:text-white">{formatIDR(st.targetAmount)}</strong></div>
                            <div className="h-2 rounded-full bg-slate-300/40 overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{width: `${Math.min(100, Math.max(0, st.achvPct))}%`}} /></div>
                          </div>
                          <p className="text-right mt-2 text-xs font-bold text-sky-600 dark:text-sky-300">More Details ↗</p>
                        </button>
                      ))}
                    </div>
                    {staffList.length === 0 && <p className={`text-sm ${textMuted}`}>Belum ada data transaksi untuk periode yang dipilih.</p>}
                  </section>
                  {overviewStaffPopupId && (() => {
                    const st = staffList.find(item => item.salesId === overviewStaffPopupId);
                    if (!st) return null;
                    const cats = [
                      {label:"Apple Devices",value:st.appleAmount},
                      {label:"Android Devices",value:st.androidAmount},
                      {label:"Accessories",value:st.accAmount},
                      {label:"VAS",value:st.vasAmount}
                    ];
                    return <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4" onClick={() => setOverviewStaffPopupId(null)}>
                      <div role="dialog" aria-modal="true" aria-label={`Detail pencapaian ${st.name}`} className={`w-full max-w-md p-5 sm:p-6 rounded-3xl border-2 ${cardBg} shadow-2xl`} onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-indigo-700 text-white flex items-center justify-center font-black">{st.initials}</span>
                            <div><h3 className="font-black text-slate-950 dark:text-white">{st.name}</h3><p className={`text-xs ${textMuted}`}>Achievement {st.achvPct}%</p></div>
                          </div>
                          <button type="button" onClick={() => setOverviewStaffPopupId(null)} aria-label="Tutup" className="px-3 py-2 rounded-lg border text-slate-900 dark:text-white">✕</button>
                        </div>
                        <div className="space-y-3">
                          {cats.map(cat => <div key={cat.label} className={`rounded-xl p-3 border ${innerBg}`}>
                            <div className="flex justify-between gap-3 text-xs"><span className="font-bold text-slate-900 dark:text-white">{cat.label}</span><strong className="text-sky-600 dark:text-sky-300">{formatIDR(cat.value)}</strong></div>
                            <div className="mt-2 h-1.5 bg-slate-300/30 rounded-full overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{width: `${st.totalAmount > 0 ? Math.min(100, cat.value / st.totalAmount * 100) : 0}%`}} /></div>
                          </div>)}
                          <div className="flex justify-between text-sm font-black text-slate-950 dark:text-white pt-2 border-t"><span>Total Achievement</span><span>{formatIDR(st.totalAmount)}</span></div>
                          <div className="flex justify-between text-xs text-slate-900 dark:text-white"><span>Target</span><span>{formatIDR(st.targetAmount)}</span></div>
                        </div>
                      </div>
                    </div>;
                  })()}

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
                                      <span className="font-black text-[#17212f] dark:text-[#f4f7fb] uppercase tracking-wider">{sub.label}</span>
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${subAchv >= 100 ? "bg-emerald-500/15 text-[#087443] dark:text-[#75e4a9]" : "bg-amber-100 text-[#8b5500] dark:bg-amber-900/40 dark:text-[#ffd07d]"}`}>
                                        {subAchv}%
                                      </span>
                                    </div>
                                    <div className="text-[11px] font-mono text-[#334155] dark:text-[#d3dce7] space-y-0.5">
                                      <div><strong>T/A:</strong> {formatIDR(subTarget)} / <span className="font-bold text-[#087443] dark:text-[#75e4a9]">{formatIDR(subActual)}</span></div>
                                      <div><strong>-/+:</strong> <span className={subGap >= 0 ? "text-[#087443] dark:text-[#75e4a9]" : "text-[#b42342] dark:text-[#ff8da4]"}>{subGap >= 0 ? `+${formatIDR(subGap)}` : formatIDR(subGap)}</span></div>
                                      <div><strong>Estimate:</strong> {formatIDR(calcEst(subActual))}</div>
                                    </div>
                                    <div className="pt-1 border-t border-inherit/40 flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => openLobDetailSheet(`Daftar ${sub.label} Terjual`, subItems)}
                                        className="text-[10px] font-black text-[#075bb5] dark:text-[#82c2ff] hover:underline flex items-center gap-1"
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

              {/* TAB 2: WEEKLY SALES (WoW) */}
              {activeTab === "weekly-sales" && (
                <div className="space-y-5">
                  <section className={`p-5 ${cardBg} border-2 rounded-3xl shadow-xl`}>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">📈 WEEK TO WEEK SALES — DATABASE COLUMN O</h2>
                    <p className={`text-xs mt-1 ${textMuted}`}>Pilih dua minggu pada bulan yang dipilih. Jika kolom O kosong atau 0, minggu dihitung otomatis dari tanggal transaksi.</p>
                    <div className="flex flex-wrap items-center gap-3 mt-4">
                      {([{value:w1Filter,set:setW1Filter,label:"WEEK 1 (Baseline)"},{value:w2Filter,set:setW2Filter,label:"WEEK 2 (Pembanding)"}]).map((f,i)=><label key={i} className="flex flex-col gap-1 text-xs font-bold text-slate-950 dark:text-white">{f.label}<select className="rounded-xl border px-3 py-2 bg-white text-slate-950 dark:bg-slate-800 dark:text-white" value={f.value} onChange={e=>f.set(e.target.value)}>{AUTO_WEEKS.length===0 && <option value="">Tidak ada data minggu pada bulan ini</option>}{AUTO_WEEKS.map(w=><option key={w.key} value={w.label}>{w.label} ({w.range})</option>)}</select></label>)}
                    </div>
                  </section>
                  <section className={`p-5 ${cardBg} border-2 rounded-3xl shadow-xl`}>
                    <h3 className="font-black text-slate-950 dark:text-white mb-3">📅 TREND DAILY SALES (BERDASARKAN TANGGAL)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {([{label:weeklyComparisonData.p1Label,rows:weeklyComparisonData.daily1},{label:weeklyComparisonData.p2Label,rows:weeklyComparisonData.daily2}]).map((period,i)=><div key={i} className={`p-3 rounded-xl border ${innerBg}`}>
                        <h4 className="text-xs font-black text-slate-950 dark:text-white mb-2">{i===0?"WEEK 1":"WEEK 2"} — {period.label}</h4>
                        {period.rows.length===0 && <p className={`text-xs ${textMuted}`}>Tidak ada transaksi bertanggal.</p>}
                        {period.rows.map(d=><div key={d.date} className="flex items-center gap-2 py-1.5 text-xs"><span className="w-24 shrink-0 text-slate-700 dark:text-slate-300">{d.date}</span><div className="flex-1 h-3 bg-slate-300/30 rounded-full overflow-hidden"><div className="h-full bg-sky-500" style={{width:`${Math.max(1,d.value/Math.max(...period.rows.map(x=>x.value),1)*100)}%`}} /></div><strong className="text-slate-950 dark:text-white whitespace-nowrap">{formatCompactIDR(d.value)}</strong></div>)}
                      </div>)}
                    </div>
                  </section>
                  <section className={`p-5 ${cardBg} border-2 rounded-3xl shadow-xl`}>
                    <h3 className="font-black text-slate-950 dark:text-white">TOTAL SALES STORE & PER STAFF</h3>
                    <div className="grid md:grid-cols-2 gap-3 mt-3">
                      {([{label:"WEEK 1",week:weeklyComparisonData.p1Label,value:weeklyComparisonData.totalM1,key:"m1" as const},{label:"WEEK 2",week:weeklyComparisonData.p2Label,value:weeklyComparisonData.totalM2,key:"m2" as const}]).map(p=><div key={p.label} className={`p-4 rounded-xl border ${innerBg}`}>
                        <h4 className="text-xs font-black text-slate-950 dark:text-white">{p.label} — {p.week}</h4>
                        <p className="text-xl font-black text-sky-600 dark:text-sky-300 my-2">{formatIDR(p.value)}</p>
                        {weeklyComparisonData.staffSales.map(st=><div key={st.id} className="flex justify-between gap-2 py-1 border-t border-slate-400/20 text-xs"><span className="text-slate-900 dark:text-white">{st.name}</span><strong className="text-slate-950 dark:text-white">{formatIDR(st[p.key])}</strong></div>)}
                      </div>)}
                    </div>
                    <p className={`mt-3 font-black text-sm ${weeklyComparisonData.storeGrowth>=0?"text-emerald-500":"text-rose-500"}`}>{weeklyComparisonData.storeGrowth>=0?"▲ Growth":"▼ Disgrowth"} {weeklyComparisonData.storeGrowth}%</p>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white mt-4 mb-2">GROWTH PER STAFF</h4>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{weeklyComparisonData.staffSales.map(st=><div key={st.id} className={`p-3 border rounded-xl ${innerBg} text-xs flex justify-between gap-2`}><span className="text-slate-900 dark:text-white">{st.name}</span><strong className={st.growth>=0?"text-emerald-500":"text-rose-500"}>{st.growth>=0?"▲ +":"▼ "}{st.growth}%</strong></div>)}</div>
                  </section>
                  {([{title:"APPLE DEVICES",data:weeklyComparisonData.apple,brand:"APPLE"},{...weeklyComparisonData.android[0],title:"SAMSUNG DEVICES",data:weeklyComparisonData.android[0]},{...weeklyComparisonData.android[1],title:"HUAWEI DEVICES",data:weeklyComparisonData.android[1]},{...weeklyComparisonData.android[2],title:"OPPO DEVICES",data:weeklyComparisonData.android[2]}]).map(lob=><section key={lob.title} className={`p-5 ${cardBg} border-2 rounded-3xl shadow-xl`}>
                    <div className="flex flex-wrap justify-between gap-3 items-center mb-4"><h3 className="font-black text-slate-950 dark:text-white">📦 {lob.title}</h3><div className="flex gap-3 text-xs font-black"><span className={lob.data.growth>=0?"text-emerald-500":"text-rose-500"}>{lob.data.growth>=0?"▲ +":"▼ "}{lob.data.growth}% Amount</span><span className={lob.data.qtyGrowth>=0?"text-emerald-500":"text-rose-500"}>{lob.data.qtyGrowth>=0?"▲ +":"▼ "}{lob.data.qtyGrowth}% Qty</span></div></div>
                    <div className="grid lg:grid-cols-2 gap-4">
                      {([{label:"WEEK 1",week:weeklyComparisonData.p1Label,data:lob.data.w1},{label:"WEEK 2",week:weeklyComparisonData.p2Label,data:lob.data.w2}]).map(p=><div key={p.label} className={`rounded-2xl border p-3 ${innerBg}`}>
                        <h4 className="font-black text-sm text-slate-950 dark:text-white">{p.label} — {p.week}</h4><p className="text-xs font-bold text-sky-600 dark:text-sky-300 mt-1 mb-3">{p.data.qty} Qty · {formatIDR(p.data.amount)}</p>
                        {p.data.staff.length===0 && <p className={`text-xs ${textMuted}`}>Tidak ada penjualan.</p>}
                        {p.data.staff.map(st=><div key={st.id} className="border-t border-slate-400/20 py-3">
                          <div className="flex justify-between gap-2 text-xs"><strong className="text-slate-950 dark:text-white">{st.name}</strong><span className="text-slate-900 dark:text-white">{st.qty} Qty · {formatIDR(st.amount)}</span></div>
                          {st.categories.map(cat=><div key={cat.name} className="flex justify-between gap-2 text-[11px] mt-1 pl-3 text-slate-700 dark:text-slate-300"><span>↳ {lob.brand==="APPLE"?cat.name:lob.brand+" "+cat.name}</span><span>{cat.qty} Qty · {formatIDR(cat.amount)}</span></div>)}
                        </div>)}
                      </div>)}
                    </div>
                  </section>)}
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

              {/* QOALA RANKING AND PRODUCT DETAIL */}
              {activeTab === "qoala-ar" && (
                <div className="space-y-6">
                  <div className={cardBg + " p-5 sm:p-6 border rounded-3xl space-y-3"}>
                    <h3 className="text-base font-black text-slate-950 dark:text-white">🏆 Top to Bottom Staff — Qoala AR %</h3>
                    <p className={textMuted + " text-xs"}>AR = Qty Qoala ÷ Qty device terjual × 100%. Staff tanpa penjualan device ditampilkan tanpa AR.</p>
                    <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-xs text-slate-900 dark:text-slate-100">
                      <thead><tr className="border-b border-slate-300 dark:border-slate-700">{["Rank","Staff / Sales ID","Device Qty","Qoala Qty","AR %","Omset Qoala"].map(h=><th key={h} className="p-3 text-left">{h}</th>)}</tr></thead>
                      <tbody>{qoalaDetails.ranking.map((staff,i)=><tr key={staff.id} className="border-b border-slate-200 dark:border-slate-700">
                        <td className="p-3 font-black">{i+1}</td><td className="p-3">{staff.name}<div className="opacity-60">{staff.id}</div></td>
                        <td className="p-3">{staff.devices}</td><td className="p-3">{staff.qoala}</td>
                        <td className="p-3 font-black">{staff.devices ? staff.ar.toFixed(1)+"%" : "N/A"}</td>
                        <td className="p-3">{formatIDR(staff.amount)}</td>
                      </tr>)}</tbody>
                    </table></div>
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <div className={cardBg + " p-5 border rounded-3xl space-y-3"}>
                      <h3 className="font-black text-slate-950 dark:text-white">🛡️ Detail Produk Qoala Terjual</h3>
                      <div className="overflow-x-auto"><table className="w-full text-xs text-slate-900 dark:text-slate-100">
                        <thead><tr><th className="p-2 text-left">Produk Qoala</th><th className="p-2 text-right">Qty</th><th className="p-2 text-right">Omset</th></tr></thead>
                        <tbody>{qoalaDetails.products.map(p=><tr key={p.name} className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">{p.name}</td><td className="p-2 text-right">{p.qty}</td><td className="p-2 text-right">{formatIDR(p.amount)}</td></tr>)}</tbody>
                      </table></div>
                    </div>
                    <div className={cardBg + " p-5 border rounded-3xl space-y-3"}>
                      <h3 className="font-black text-slate-950 dark:text-white">📱 Detail Device Terjual &amp; Attachment</h3>
                      <p className={textMuted + " text-xs"}>Attachment diestimasi dari kecocokan nomor invoice antara Qoala dan device.</p>
                      <div className="overflow-x-auto"><table className="w-full text-xs text-slate-900 dark:text-slate-100">
                        <thead><tr><th className="p-2 text-left">Device</th><th className="p-2 text-right">Terjual</th><th className="p-2 text-right">Qoala Attached</th></tr></thead>
                        <tbody>{(showAllQoalaDevices ? qoalaDetails.devices : qoalaDetails.devices.slice(0, 10)).map(p=><tr key={p.name} className="border-t border-slate-200 dark:border-slate-700"><td className="p-2">{p.name}</td><td className="p-2 text-right">{p.qty}</td><td className="p-2 text-right">{p.attached}</td></tr>)}</tbody>
                      </table></div>
                      {qoalaDetails.devices.length > 10 && (
                        <button type="button" onClick={() => setShowAllQoalaDevices(v => !v)} className="w-full rounded-xl border border-sky-500/40 px-4 py-2 text-xs font-black text-sky-700 dark:text-sky-300 hover:bg-sky-500/10">
                          {showAllQoalaDevices ? "Show Less — Tampilkan 10 Device" : "More Details — Lihat Semua " + qoalaDetails.devices.length + " Device"}
                        </button>
                      )}
                      {qoalaDetails.unmatchedQty > 0 && <p className="text-xs text-amber-600">Sebanyak {qoalaDetails.unmatchedQty} polis belum dapat dipasangkan dengan device berdasarkan invoice.</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MoM GROWTH ANALYSIS */}
              {activeTab === "mom-comparison" && renderComparisonSection(momAnalytics)}

              {/* TAB 3: STAFF PERFORMANCE */}
              {activeTab === "staff-performance" && (
                <div className="space-y-8">
                  {(() => {
                    const st = staffList.find(x => x.salesId === selectedStaffId) || staffList[0];
                    if (!st) return null;
                    const rows = activeTransactions.filter(t => t.salesId === st.salesId);
                    const sum = (items: RawTransaction[]) => ({qty:items.reduce((n,t)=>n+(Number(t.qty)||0),0),amount:items.reduce((n,t)=>n+(Number(t.amount)||0),0)});
                    const apple = rows.filter(t=>t.brand==="APPLE" && (t.groupCategory==="DEVICES" || (t.productType||"").toUpperCase().includes("AIRPOD")));
                    const android = rows.filter(t=>t.groupCategory==="DEVICES" && t.brand!=="APPLE");
                    const accessories = rows.filter(t=>t.groupCategory==="ACCESSORIES");
                    const vas = rows.filter(t=>t.groupCategory==="VAS");
                    const name = (t:RawTransaction)=>(t.productName||"").toUpperCase();
                    const groups = [
                      {title:"Apple Devices",items:apple,sub:[["iPhone",apple.filter(t=>name(t).includes("IPHONE"))],["iPad",apple.filter(t=>name(t).includes("IPAD"))],["MacBook",apple.filter(t=>name(t).includes("MAC"))],["Apple Watch",apple.filter(t=>name(t).includes("WATCH"))],["AirPods",apple.filter(t=>name(t).includes("AIRPOD"))]] as [string,RawTransaction[]][]},
                      {title:"Android Devices",items:android,sub:["SAMSUNG","OPPO","HUAWEI","XIAOMI","MOTOROLA","INFINIX"].map(b=>[b,android.filter(t=>t.brand===b || (b==="XIAOMI" && t.brand==="REDMI"))] as [string,RawTransaction[]])},
                      {title:"Accessories",items:accessories,sub:[...new Set(accessories.map(t=>t.supplier||"Supplier Tidak Diketahui"))].map(b=>[b,accessories.filter(t=>(t.supplier||"Supplier Tidak Diketahui")===b)] as [string,RawTransaction[]])},
                      {title:"VAS",items:vas,sub:["QOALA","TELKOMSEL","SAMSUNG","OPPO","HUAWEI","XIAOMI","MOTOROLA","INFINIX","XL","INDOSAT"].map(b=>[b,vas.filter(t=>t.brand===b || name(t).includes(b))] as [string,RawTransaction[]])}
                    ];
                    const key = st.name.trim().toLowerCase();
                    const target = staffDailyTargets[key] || staffDailyTargets[key.split(" ")[0]];
                    const normalizedStaffKey = st.name.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
                    const categoryTarget = selectedMonth===targetSheetMonth ? (staffCategoryTargets[normalizedStaffKey] || {}) : {};
                    const targetFor = (category:string):number|null => {
                      const value=categoryTarget[category];
                      if(value===undefined)return 0;
                      if(periodType==="monthly")return value;
                      const monthParts=selectedMonth.match(/(20\d{2})$/);
                      const monthIndex=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].findIndex(m=>selectedMonth.toLowerCase().startsWith(m.toLowerCase()));
                      const days=monthParts && monthIndex>=0?new Date(Number(monthParts[1]),monthIndex+1,0).getDate():30;
                      if(periodType==="daily")return Math.round(value/days);
                      if(periodType==="weekly" && selectedWeek!=="ALL"){
                        const weekDates=activeTransactions.map(t=>t.isoDate).filter(Boolean).sort();
                        if(weekDates.length===0)return 0;
                        const first=weekDates[0],last=weekDates[weekDates.length-1];
                        const span=Math.min(7,Math.max(1,Math.round((Date.parse(last+"T00:00:00Z")-Date.parse(first+"T00:00:00Z"))/86400000)+1));
                        return Math.round(value/days*span);
                      }
                      return value;
                    };
                    const dailyTargetFor = (title:string) => targetFor(title==="Apple Devices"?"apple":title==="Android Devices"?"android":title==="Accessories"?"accessories":"vas");
                    const renderMetric = (label:string,items:RawTransaction[],targetValue:number|null,detailKey:string) => {
                      const actual = sum(items);
                      const variance = actual.amount-(targetValue ?? 0);
                      const pct = targetValue !== null && targetValue>0?actual.amount/targetValue*100:0;
                      const estimate = (targetValue ?? 0)-actual.amount;
                      const expanded = staffExpandedDetail===detailKey;
                      return <div key={detailKey} className={`p-3 rounded-xl border ${innerBg}`}>
                        <div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-slate-950 dark:text-white">{label}</strong><button type="button" onClick={()=>setStaffExpandedDetail(expanded?null:detailKey)} className="text-xs font-bold text-sky-600 dark:text-sky-300">{expanded?"⌃ Show Less":"⌄ More Details"}</button></div>
                        <div className="text-xs mt-2 text-slate-900 dark:text-slate-200">T/A: <strong>{formatIDR(targetValue ?? 0)}</strong> / <strong>{formatIDR(actual.amount)}</strong> · {actual.qty} Qty</div>
                        <div className="text-xs mt-1 text-slate-900 dark:text-slate-200">% & +/-: <strong className={variance!==null && variance<0?"text-rose-500":"text-emerald-500"}>{pct.toFixed(1)+"%"} · {variance===null?"—":(variance>=0?"+":"")+formatIDR(variance)}</strong></div>
                        <div className="text-xs mt-1 text-slate-900 dark:text-slate-200">Estimate (sisa target): <strong>{estimate===null?"—":formatIDR(Math.max(0,estimate))}</strong></div>
                        {expanded && <div className="mt-3 pt-2 border-t border-slate-400/30 max-h-64 overflow-y-auto space-y-1">
                          {items.length===0?<p className="text-xs text-slate-500">Tidak ada penjualan pada filter ini.</p>:Object.values(items.reduce((m,t)=>{const k=(t.productName||"Unknown")+"|"+(t.supplier||"");if(!m[k])m[k]={product:t.productName||"Unknown",supplier:t.supplier||"",qty:0,amount:0};m[k].qty+=Number(t.qty)||0;m[k].amount+=Number(t.amount)||0;return m;},{} as Record<string,{product:string,supplier:string,qty:number,amount:number}>)).sort((a,b)=>b.amount-a.amount).map((p,i)=><div key={i} className="flex justify-between gap-2 text-[11px] py-1 border-b border-slate-400/10"><span className="text-slate-900 dark:text-white">{p.product}{label==="Accessories"&&p.supplier?" · "+p.supplier:""}</span><span className="shrink-0 text-slate-900 dark:text-white">{p.qty} Qty / {formatIDR(p.amount)}</span></div>)}
                        </div>}
                      </div>;
                    };
                    return <section className={`p-5 sm:p-6 rounded-3xl border-2 ${cardBg} shadow-xl space-y-4`}>
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-lg text-slate-950 dark:text-white">Target Vs Achievement Per Staff</h2><p className={`text-xs ${textMuted}`}>{st.name} · {periodType.toUpperCase()} · {periodType==="daily"?selectedDate:periodType==="weekly"?selectedWeek:selectedMonth}</p></div><button type="button" onClick={()=>handleShareStaffWA({...st,targetAmount:targetFor("total")??0,achvPct:(targetFor("total")??0)>0?Number((st.totalAmount/(targetFor("total")??1)*100).toFixed(1)):0},rows)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">↗ Share WhatsApp</button></div>
                      {renderMetric("TOTAL STAFF",rows,targetFor("total"),"total")}
                      <p className={`text-xs ${textMuted}`}>Sumber target: Pembagian target (gid 685849310). Staff atau kategori yang tidak ditemukan memiliki target Rp 0. Target Daily/Weekly diprorata dari target bulanan. Estimate adalah sisa target, bukan prediksi penjualan.</p>
                      {groups.map(g=><div key={g.title} className="space-y-2"><h3 className="font-black text-base text-slate-950 dark:text-white">{g.title}</h3>{renderMetric(g.title,g.items,dailyTargetFor(g.title),"group-"+g.title)}<div className="grid md:grid-cols-2 gap-2">{g.sub.map(([label,items])=>renderMetric(label,items,targetFor(({iPhone:"iphone",iPad:"ipad",MacBook:"macbook","Apple Watch":"applewatch",Qoala:"qoala",Telkomsel:"telkomsel",XL:"xl",Indosat:"indosat",SAMSUNG:"samsung",XIAOMI:"xiaomi",OPPO:"oppo",MOTOROLA:"motorola",HUAWEI:"huawei",INFINIX:"infinix"} as Record<string,string>)[label] || label.toLowerCase()),g.title+"-"+label))}</div></div>)}
                    </section>;
                  })()}
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
                </div>
              )}

              {/* TAB 4: DAILY TARGET & RUN RATE PER STAFF */}
              {activeTab === "daily-target" && (
                <div className="space-y-6 sm:space-y-8">
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
                          RUN RATE SISA TARGET / HARI
                        </span>
                        <div className="text-xl sm:text-2xl font-black text-sky-700 dark:text-sky-400 mt-1 font-mono">
                          {formatIDR(dailyTargetCalculated.requiredDailyRunRate)}
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

                        <div className={`p-4 sm:p-5 rounded-2xl border ${innerBg} space-y-3`}>
                          <div className="flex justify-between items-center pb-2 border-b border-inherit/40">
                            <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                              Target Harian (Pembagian target ÷ Hari Bulan)
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

              {/* ========================================================= */}
              {/* TAB: BRAND FOCUS (SUPPLIER DINO, IGA, MEDPOIN, HASTAG, IBACKS, KAIZEN) */}
              {/* ========================================================= */}
              {activeTab === "brand-focus" && (() => {
                const TARGET_SUPPLIERS = ["DINO", "IGA", "MEDPOIN", "HASTAG", "IBACKS", "KAIZEN"];
                const currentFilteredTrx = activeTransactions || [];

                const totalAccAmount = currentFilteredTrx
                  .filter((t) => t.groupCategory === "ACCESSORIES" || (t.brand || "").includes("ACC"))
                  .reduce((acc, t) => acc + (Number(t.amount) || 0), 0);

                const supplierDataMap: Record<string, { qty: number; amount: number; items: RawTransaction[] }> = {};
                TARGET_SUPPLIERS.forEach((sup) => {
                  supplierDataMap[sup] = { qty: 0, amount: 0, items: [] };
                });

                currentFilteredTrx.forEach((t) => {
                  const rawSup = (t.supplier || "").trim().toUpperCase();
                  const rawBrand = (t.brand || "").trim().toUpperCase();
                  const matchedSup = t.groupCategory === "ACCESSORIES" ? TARGET_SUPPLIERS.find((s) => rawSup.includes(s) || rawBrand.includes(s)) : undefined;
                  if (matchedSup) {
                    supplierDataMap[matchedSup].qty += Number(t.qty) || 1;
                    supplierDataMap[matchedSup].amount += Number(t.amount) || 0;
                    supplierDataMap[matchedSup].items.push(t);
                  }
                });

                const staffSupplierMap: Record<string, Record<string, { qty: number; amount: number }>> = {};
                currentFilteredTrx.forEach((t) => {
                  const sName = (t.salesName || "").trim().toUpperCase();
                  const rawSup = (t.supplier || "").trim().toUpperCase();
                  const rawBrand = (t.brand || "").trim().toUpperCase();
                  const matchedSup = t.groupCategory === "ACCESSORIES" ? TARGET_SUPPLIERS.find((s) => rawSup.includes(s) || rawBrand.includes(s)) : undefined;

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
                          Data penjualan supplier: DINO, IGA, MEDPOIN, HASTAG, IBACKS, KAIZEN (Filter: {periodType.toUpperCase()})
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

                    {currentFilteredTrx.length === 0 && <div className={`p-4 rounded-xl border ${innerBg} text-sm text-amber-600`}>Tidak ada transaksi pada filter periode yang dipilih. Periksa tanggal, minggu, atau bulan di bagian atas.</div>}
                    {currentFilteredTrx.length > 0 && TARGET_SUPPLIERS.every(s => supplierDataMap[s].items.length === 0) && <div className={`p-4 rounded-xl border ${innerBg} text-sm text-amber-600`}>Tidak ditemukan transaksi Accessories untuk keenam supplier pada periode ini. Periksa kolom P (Supplier) atau kolom K (Brand Name) di DATABASE.</div>}
                    {/* CUPCARDS */}
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

                    {/* DETAIL TRANSAKSI PER SUPPLIER */}
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
                                          <td className="p-2.5 font-mono font-bold text-slate-700 dark:text-slate-300">{item.invoice || "-"}</td>
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

                    {/* PENJUALAN PER STAFF */}
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
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                    <h2 className="font-black text-lg text-slate-950 dark:text-white">💬 Feedback Tim — Semua Perangkat</h2>
                    <p className="text-xs text-slate-500">Feedback tersimpan online dan dapat dibaca semua pengguna dashboard. Jangan memasukkan data pribadi pelanggan.</p>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pengirim: {currentSalesName || "Staff"}</div>
                    <select value={feedbackSentiment} onChange={e=>setFeedbackSentiment(e.target.value as FeedbackItem["sentiment"])} className="w-full rounded-xl p-3 border bg-white text-slate-900">
                      <option>Luar Biasa</option><option>Cukup Baik</option><option>Kecewa</option>
                    </select>
                    <textarea value={feedbackText} maxLength={1500} onChange={e=>setFeedbackText(e.target.value)} placeholder="Tulis feedback atau masukan untuk tim..." className="w-full min-h-28 rounded-xl p-3 border bg-white text-slate-900"/>
                    <button type="button" disabled={feedbackLoading || feedbackText.trim().length<5} onClick={()=>void submitFeedback()} className="px-5 py-3 bg-sky-600 text-white font-black rounded-xl disabled:opacity-50">Kirim Feedback</button>
                    {feedbackError && <p role="alert" className="text-red-600 text-sm">{feedbackError}</p>}
                  </div>
                  {currentSalesId===ADMIN_ID && (
                    <div className={`p-4 ${cardBg} border rounded-2xl space-y-2`}>
                      <h3 className="font-black text-sm text-slate-950 dark:text-white">Admin — Hapus Feedback</h3>
                      <input type="password" autoComplete="off" value={feedbackAdminKey} onChange={e=>setFeedbackAdminKey(e.target.value)} placeholder="Masukkan kunci admin feedback" className="w-full rounded-xl p-3 border bg-white text-slate-900"/>
                      <p className="text-xs text-slate-500">Penghapusan memerlukan kunci server admin; login admin saja tidak cukup.</p>
                    </div>
                  )}
                  <div className={`p-4 sm:p-6 ${cardBg} border-2 rounded-3xl shadow-xl space-y-3`}>
                    <h2 className="font-black text-lg text-slate-950 dark:text-white">Riwayat Feedback ({feedbacks.length})</h2>
                    {feedbacks.length===0 && <p className="text-sm text-slate-500">Belum ada feedback yang tersimpan.</p>}
                    {feedbacks.map(fb=>(
                      <div key={fb.id} className={`p-4 rounded-2xl border ${innerBg} space-y-2`}>
                        <div className="flex justify-between gap-2 items-start">
                          <div><strong className="text-sm text-slate-950 dark:text-white">{fb.salesName}</strong><p className="text-xs text-slate-500">{fb.sentiment} · {fb.timestamp}</p></div>
                          {currentSalesId===ADMIN_ID && <button disabled={feedbackLoading || !feedbackAdminKey} type="button" onClick={()=>void deleteFeedback(fb.id)} className="text-red-600 text-xs font-black disabled:opacity-40">Hapus</button>}
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words text-slate-800 dark:text-slate-200">{fb.text}</p>
                      </div>
                    ))}
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

      {/* Floating Action Button (FAB) Mobile */}
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

      {/* Modal Upload RAW */}
      <UploadRawSalesModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        selectedInvoice=""
        defaultSalesName="Store Leader Admin"
      />
    </div>
  );
}
