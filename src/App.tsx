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
  | "mom-comparison"
  | "est-incentive"
  | "customer-engagement";

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
  incentives: [number, number, number, number, number];
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
  const [incentiveChartMode, setIncentiveChartMode] = useState<"stacked" | "grouped">("stacked");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);
  // Floating mobile shortcut: solid at top, faded while scrolling content.
  const [isMobileScrolled, setIsMobileScrolled] = useState(false);
  useEffect(() => {
    const updateScroll = () => setIsMobileScrolled(window.scrollY > 80);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);


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
    try {
      const response = await fetch("/api/access-log", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ salesId, salesName })
      });
      if (!response.ok) console.warn("Access Log tidak tersimpan (HTTP " + response.status + ")");
    } catch {
      console.warn("Access Log tidak dapat dihubungi");
    }
  };

  // Live Spreadsheet Data & Targets
  const [transactions, setTransactions] = useState<RawTransaction[]>([]);
  const [bnplRecords, setBnplRecords] = useState<BnplRecord[]>([]);
  const [engRows,setEngRows]=useState<any[]>([]);
  const [engStaff,setEngStaff]=useState("");
  const [engCategory,setEngCategory]=useState("CX");
  const [engQty,setEngQty]=useState("1");
  const [engDate,setEngDate]=useState(()=>new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date()));
  const [engPeriod,setEngPeriod]=useState("month");
  const [engError,setEngError]=useState("");
  const [engBusy,setEngBusy]=useState(false);
  const [engPassword,setEngPassword]=useState("");
  const loadEng=async()=>{try{const r=await fetch("/api/customer-engagement",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setEngRows(d.rows||[]);setEngError("");}catch(e){setEngError(String(e))}};
  useEffect(()=>{if(activeTab==="customer-engagement")void loadEng()},[activeTab]);

  const [expandedSupplierDetails, setExpandedSupplierDetails] = useState<Record<string,boolean>>({});
  const [expandedBnplTenders, setExpandedBnplTenders] = useState<Record<string,boolean>>({});
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
  // Preserve a user-selected month across page visibility changes and refreshes.
  useEffect(() => {
    const saved=window.sessionStorage.getItem("digi_ops_selected_month");
    if(saved && (/^(Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)20\d{2}$/.test(saved) || saved==="ALL")) {
      setSelectedMonth(saved);
    }
  },[]);
  useEffect(() => {window.sessionStorage.setItem("digi_ops_selected_month",selectedMonth);},[selectedMonth]);
  const [momBaseMonth, setMomBaseMonth] = useState<string>("November2026");
  const [momCompareMonth, setMomCompareMonth] = useState<string>("Oktober2026");
  const [momMode, setMomMode] = useState<"mtd" | "full">("mtd");
  const [showAllQoalaDevices, setShowAllQoalaDevices] = useState(false);
  const [expandedIncentiveStaff, setExpandedIncentiveStaff] = useState<string | null>(null);
  const [overviewStaffPopupId, setOverviewStaffPopupId] = useState<string | null>(null);
  const [momToday, setMomToday] = useState(() => new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()));
  const [selectedWeek, setSelectedWeek] = useState<string>("ALL");
  const [calendarWeekIndex, setCalendarWeekIndex] = useState(0);
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
  const [dataLoadError, setDataLoadError] = useState("");
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
    const raw=String(rawDateStr||"").trim();
    let isoDate="";
    const gviz=raw.match(/^Date\((\d{4}),(\d{1,2}),(\d{1,2})(?:,.*)?\)$/i);
    if(gviz){
      isoDate=gviz[1]+"-"+String(Number(gviz[2])+1).padStart(2,"0")+"-"+gviz[3].padStart(2,"0");
    }else{
      const parts=raw.replace(/\//g,"-").split("-");
      if(parts.length===3){
        const [a,b,c]=parts.map(Number);
        const y=parts[0].length===4?a:c;
        const m=b,d=parts[0].length===4?c:a;
        if(y>=2000 && m>=1 && m<=12 && d>=1 && d<=31)isoDate=y+"-"+String(m).padStart(2,"0")+"-"+String(d).padStart(2,"0");
      }
    }
    if(isoDate){
      const [y,m,d]=isoDate.split("-").map(Number);
      const date=new Date(Date.UTC(y,m-1,d));
      if(date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)isoDate="";
    }
    const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const rawMonth=String(rawMonthStr||"").trim();
    const match=rawMonth.match(/^([a-zA-Z]+)\s*(20\d{2})$/);
    const idx=match?names.findIndex(n=>n.toLowerCase()===match[1].toLowerCase()):-1;
    const monthKey=isoDate?names[Number(isoDate.slice(5,7))-1]+isoDate.slice(0,4):idx>=0?names[idx]+match![2]:rawMonth;
    return {isoDate,monthKey};
  };

  const fetchLiveGoogleSheets = async () => {
    setIsLoading(true);
    setDataLoadError("");
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
      if(!resDb.ok || !resBnpl.ok || !resTarget.ok)throw new Error("Google Sheets HTTP: DATABASE "+resDb.status+", BNPL "+resBnpl.status+", TARGET "+resTarget.status);
      const parseGviz=(value:string,label:string)=>{
        const start=value.indexOf("{"),end=value.lastIndexOf("}");
        if(start<0||end<start)throw new Error(label+" tidak mengembalikan JSON. Periksa akses publik spreadsheet dan koneksi internet.");
        const result=JSON.parse(value.slice(start,end+1));
        if(result.status==="error")throw new Error(label+": "+(result.errors||[]).map((e:any)=>e.detailed_message||e.message).join("; "));
        if(!result.table?.rows)throw new Error(label+" tidak memiliki baris data.");
        return result;
      };


      const jsonDb = parseGviz(textDb,"DATABASE");
      const parsedTrx: RawTransaction[] = [];
      // DATABASE R:V are recorded incentive amounts, not rates.
      const parseIncentive = (cell: any): number => {
        const raw = cell?.v ?? cell?.f ?? 0;
        if (typeof raw === "number") return Number.isFinite(raw) && raw > 0 ? raw : 0;
        const normalized = String(raw).trim().replace(/Rp\\s*/gi, "").replace(/\\s/g, "");
        if (!normalized) return 0;
        const cleaned = normalized.replace(/\\./g, "").replace(/,/g, ".");
        const value = Number(cleaned);
        return Number.isFinite(value) && value > 0 ? value : 0;
      };
      (jsonDb.table.rows || []).forEach((r: any) => {
        const c = r.c;
        if (!c) return;

        const rawDate = c[0]?.v || c[0]?.f || "";
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
            incentives: [17, 18, 19, 20, 21].map(i => parseIncentive(c[i])) as [number, number, number, number, number],
          });
        }
      });

      const jsonBnpl = parseGviz(textBnpl,"BNPL DATABASE");
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
      const jsonTarget = parseGviz(textTarget,"Pembagian target");
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
      // Google Visualization may omit textual headers due to mixed column types.
      // Use the fixed Pembagian target B:W column layout as a safe fallback.
      const columns:Record<string,number>={month:1,staff:2,total:4,iphone:5,ipad:6,macbook:7,applewatch:8,apple:9,samsung:10,oppo:11,xiaomi:12,huawei:13,motorola:14,infinix:15,android:16,accessories:17,qoala:18,telkomsel:19,indosat:20,xl:21,vas:22};
      (header?.c || []).forEach((_:any,i:number)=>{
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
      const validMonth=Boolean(targetMonth);
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
      const targetMonthIndex=monthNames.findIndex(n=>targetMonth.startsWith(n));
      const daysInTargetMonth=targetMonthIndex>=0
        ? new Date(Number(targetMonth.slice(-4)),targetMonthIndex+1,0).getDate():30;
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
      if(parsedTrx.length===0)throw new Error("DATABASE tidak menghasilkan transaksi valid. Periksa format tanggal, invoice, nominal dan kolom staff.");
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
      setDataLoadError(err instanceof Error ? err.message : "Gagal membaca Google Sheets");
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
    const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const months=new Set<string>();
    transactions.forEach(t=>{
      const iso=String(t.isoDate||"");
      if(/^20\d{2}-\d{2}-\d{2}$/.test(iso)){
        const idx=Number(iso.slice(5,7))-1;
        if(idx>=0&&idx<12)months.add(names[idx]+iso.slice(0,4));
      }
    });
    if(targetSheetMonth)months.add(targetSheetMonth);
    if(selectedMonth!=="ALL")months.add(selectedMonth);
    return [...months].sort((a,b)=>{
      const parse=(x:string)=>Number(x.slice(-4))*12+names.findIndex(n=>x.startsWith(n));
      return parse(b)-parse(a);
    });
  },[transactions,targetSheetMonth,selectedMonth]);

  // Column O is the authoritative week label; never derive a new week number.
  const getTransactionWeek = (t: RawTransaction): string => {
    const date=String(t.isoDate||"").trim();
    const raw=String(t.weekLabel||"").trim();
    const match=raw.match(/^Week\s*(\d+)$/i);
    if(!/^20\d{2}-\d{2}-\d{2}$/.test(date)||!match)return "";
    return date.slice(0,7)+" · Week "+Number(match[1]);
  };
  const AUTO_WEEKS = useMemo(() => {
    const map=new Map<string,{label:string;minDate:string;maxDate:string;weekNumber:number}>();
    const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const idx=names.findIndex(n=>selectedMonth.startsWith(n));
    const prefix=idx>=0?selectedMonth.slice(-4)+"-"+String(idx+1).padStart(2,"0"):"";
    transactions.forEach(t=>{
      if(prefix&&!String(t.isoDate||"").startsWith(prefix))return;
      const label=getTransactionWeek(t);
      if(!label)return;
      const weekNumber=Number(label.match(/Week (\d+)$/)?.[1]||0);
      if(!map.has(label))map.set(label,{label,minDate:t.isoDate,maxDate:t.isoDate,weekNumber});
      const item=map.get(label)!;
      if(t.isoDate<item.minDate)item.minDate=t.isoDate;
      if(t.isoDate>item.maxDate)item.maxDate=t.isoDate;
    });
    return [...map.values()].sort((a,b)=>a.minDate.localeCompare(b.minDate)||a.weekNumber-b.weekNumber).map((w,i)=>({
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
      if (selectedMonth !== "ALL" && selectedMonth !== "Semua Bulan" && !availableMonths.includes(selectedMonth)) return false;
      if (selectedMonth !== "ALL" && selectedMonth !== "Semua Bulan" && (()=>{const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];const idx=names.findIndex(n=>selectedMonth.startsWith(n));const prefix=idx>=0?selectedMonth.slice(-4)+"-"+String(idx+1).padStart(2,"0"):"";return !prefix || !t.isoDate.startsWith(prefix);})()) {
        return false;
      }
      if (periodType === "daily") {
        return t.isoDate === selectedDate;
      }
      if (periodType === "weekly" && selectedWeek !== "ALL") {
        const selected = selectedWeek.trim();
        if (selected.includes(" · ")) return getTransactionWeek(t) === selected;
        return getTransactionWeek(t).toLowerCase().endsWith(" · "+selected.toLowerCase());
      }
      return true;
    });
  }, [transactions, selectedMonth, periodType, selectedDate, selectedWeek, availableMonths]);

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

  // Staff Performance weekly filter is independent of DATABASE column O.
  // Every selected week is Sunday 00:00 through Saturday 23:59, even across months.
  const staffCalendarWeeks = useMemo(() => {
    const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const m=names.findIndex(n=>selectedMonth.toLowerCase().startsWith(n.toLowerCase()));
    const y=Number(selectedMonth.slice(-4));
    if(m<0||!Number.isFinite(y))return [] as {label:string;start:string;end:string;monthDays:number}[];
    const pad=(d:Date)=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    const first=new Date(y,m,1),last=new Date(y,m+1,0),start=new Date(first);
    start.setDate(start.getDate()-start.getDay());
    const weeks:{label:string;start:string;end:string;monthDays:number}[]=[];
    for(let d=new Date(start);d<=last;d.setDate(d.getDate()+7)){
      const end=new Date(d);end.setDate(d.getDate()+6);
      let monthDays=0;
      for(let n=0;n<7;n++){const x=new Date(d);x.setDate(d.getDate()+n);if(x.getMonth()===m&&x.getFullYear()===y)monthDays++;}
      weeks.push({label:"W"+(weeks.length+1),start:pad(d),end:pad(end),monthDays});
    }
    return weeks;
  },[selectedMonth]);
  const staffSelectedWeek=staffCalendarWeeks[Math.min(calendarWeekIndex,staffCalendarWeeks.length-1)];
  const staffPeriodTransactions=useMemo(()=>{
    if(periodType!=="weekly"||!staffSelectedWeek)return activeTransactions;
    return transactions.filter(t=>t.isoDate>=staffSelectedWeek.start&&t.isoDate<=staffSelectedWeek.end);
  },[activeTransactions,transactions,periodType,staffSelectedWeek?.start,staffSelectedWeek?.end]);

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

    staffPeriodTransactions.forEach((t) => {
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

      const nameKey = s.name.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
      const matchedTarget = staffTargets[nameKey];

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
  }, [staffPeriodTransactions, staffTargets, storeTotalTarget, selectedMonth, targetSheetMonth]);

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

  const calendarWeekly = useMemo(() => {
    const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const monthIndex=names.findIndex(n=>selectedMonth.toLowerCase().startsWith(n.toLowerCase()));
    const year=Number(selectedMonth.slice(-4));
    type CalendarWeek={label:string;start:string;end:string;days:number;rows:RawTransaction[];amount:number;target:number;observedDays:number};
    if(monthIndex<0||!Number.isFinite(year))return {weeks:[] as CalendarWeek[],current:null as CalendarWeek|null,previous:null as CalendarWeek|null,monthRows:[] as RawTransaction[],dailyTarget:0};
    const pad=(d:Date)=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
    const firstOfMonth=new Date(year,monthIndex,1);
    const lastOfMonth=new Date(year,monthIndex+1,0);
    const prefix=year+"-"+String(monthIndex+1).padStart(2,"0")+"-";
    const monthRows=transactions.filter(t=>t.isoDate.startsWith(prefix));
    const dailyTarget=selectedMonth===targetSheetMonth?storeTotalTarget/lastOfMonth.getDate():0;
    const today=new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
    const makeWeek=(label:string,first:Date):CalendarWeek=>{
      const final=new Date(first);final.setDate(first.getDate()+6);
      const start=pad(first),end=pad(final);
      const rows=transactions.filter(t=>t.isoDate>=start&&t.isoDate<=end);
      const overlap=Array.from({length:7},(_,i)=>{const d=new Date(first);d.setDate(first.getDate()+i);return d;}).filter(d=>d.getFullYear()===year&&d.getMonth()===monthIndex).length;
      const observedDays=today<start?0:today>=end?7:Math.max(0,Math.min(7,Math.round((Date.parse(today+"T12:00:00")-Date.parse(start+"T12:00:00"))/86400000)+1));
      return {label,start,end,days:7,rows,observedDays,amount:rows.reduce((n,t)=>n+(Number(t.amount)||0),0),target:dailyTarget*overlap};
    };
    const start=new Date(firstOfMonth);start.setDate(start.getDate()-start.getDay());
    const weeks:CalendarWeek[]=[];
    for(let d=new Date(start);d<=lastOfMonth;d.setDate(d.getDate()+7))weeks.push(makeWeek("W"+(weeks.length+1),new Date(d)));
    const index=Math.max(0,Math.min(calendarWeekIndex,weeks.length-1));
    const current=weeks[index]||null;
    let previous:CalendarWeek|null=null;
    if(current){const d=new Date(current.start+"T12:00:00");d.setDate(d.getDate()-7);previous=makeWeek("Week sebelumnya",d);}
    return {weeks,current,previous,monthRows,dailyTarget};
  },[transactions,selectedMonth,calendarWeekIndex,targetSheetMonth,storeTotalTarget]);

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
    const latestRecordedDay=monthTrx.reduce((max,t)=>Math.max(max,Number(t.isoDate.slice(8,10))||0),0);
    const remainingSellingDays=Math.max(0,totalDaysInMonth-latestRecordedDay);
    const actualAchievedSoFar=monthTrx.reduce((a,t)=>a+(Number(t.amount)||0),0);
    const actualToday=monthTrx.filter(t=>t.isoDate===selectedDate).reduce((a,t)=>a+(Number(t.amount)||0),0);
    const remainingTarget=Math.max(0,monthlyTarget-actualAchievedSoFar);
    const targetStoreToday=Math.round(monthlyTarget/totalDaysInMonth);
    const requiredDailyRunRate=remainingTarget/Math.max(1,remainingSellingDays);
    const staffOnDuty=Object.entries(staffTargets).filter(([name])=>!name.includes("admin")&&!name.includes("leader")).map(([name,target])=>({
      name,targetToday:Math.round((validTarget?target:0)/totalDaysInMonth),
      runRate:Math.round(Math.max(0,(validTarget?target:0)-monthTrx.filter(t=>t.salesName.toLowerCase().trim()===name).reduce((a,t)=>a+(Number(t.amount)||0),0))/Math.max(1,remainingSellingDays))
    }));
    const staffCount=staffOnDuty.length;
    const targetPerStaffToday=staffCount?Math.round(targetStoreToday/staffCount):0;
    return {totalMonthTarget:monthlyTarget,totalDays:totalDaysInMonth,daysPassed,daysLeft,
      actualAchievedSoFar,remainingTarget,requiredDailyRunRate:Math.round(requiredDailyRunRate),
      staffOnDuty,staffCount,targetStoreToday,targetPerStaffToday,actualToday,remainingSellingDays,
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
    const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const selectedIdx=names.findIndex(n=>selectedMonth.toLowerCase().startsWith(n.toLowerCase()));
    const selectedPrefix=selectedIdx>=0?selectedMonth.slice(-4)+"-"+String(selectedIdx+1).padStart(2,"0"):"";
    // Resolve missing product descriptions in the WEBSITE, not only the PPTX export.
    const invoiceKey=(v:unknown)=>String(v??"").replace(/[^0-9A-Za-z]/g,"").toUpperCase();
    const productsByInvoice=new Map<string,Set<string>>();
    transactions.forEach(t=>{
      const key=invoiceKey(t.invoice);
      const product=String(t.productName||"").trim();
      if(!key||!product)return;
      if(!productsByInvoice.has(key))productsByInvoice.set(key,new Set());
      productsByInvoice.get(key)!.add(product);
    });
    const enrichedBnpl=bnplRecords.map(b=>({
      ...b,
      product:String(b.product||"").trim() ||
        [...(productsByInvoice.get(invoiceKey(b.invoice))||[])].join(" ; ") ||
        "Produk belum teridentifikasi (Invoice "+b.invoice+")"
    }));
    const filtered=enrichedBnpl.filter(b=>{
      const iso=parseNormalizedDate(b.date,b.month).isoDate;
      if(selectedPrefix && !iso.startsWith(selectedPrefix))return false;
      if(periodType==="daily")return iso===selectedDate;
      if(periodType==="weekly" && selectedWeek!=="ALL"){
        const weekMatch=selectedWeek.match(/Week\s*(\d+)/i);
        if(weekMatch){
          const matched=transactions.some(t=>t.isoDate===iso && String(t.weekLabel||"").trim().toLowerCase()==="week "+weekMatch[1]);
          if(!matched)return false;
        }
      }
      return true;
    });
    const map:Record<string,{amount:number;qty:number;records:BnplRecord[]}>={};
    filtered.forEach(b=>{
      const key=b.tender||"Other";
      if(!map[key])map[key]={amount:0,qty:0,records:[]};
      map[key].amount+=b.amount;
      map[key].qty+=b.qty;
      map[key].records.push(b);
    });
    const totalAmount=filtered.reduce((n,b)=>n+b.amount,0);
    const totalQty=filtered.reduce((n,b)=>n+b.qty,0);
    const tenders=Object.entries(map).map(([tender,d])=>({
      tender,...d,share:totalAmount>0?Number((d.amount/totalAmount*100).toFixed(1)):0
    })).sort((a,b)=>b.amount-a.amount);
    return {totalAmount,totalQty,tenders,list:filtered};
  },[bnplRecords,selectedMonth,selectedDate,selectedWeek,periodType,transactions]);

  const handleShareBnplWhatsApp = () => {
    const lines=[
      "*Pencapaian "+selectedMonth+" Tender BNPL*",
      "DIGIPLUS GRAND INDONESIA",
      "Periode: "+periodType.toUpperCase()+(periodType==="daily"?" ("+selectedDate+")":""),
      "",
      ...bnplSummary.tenders.map(t=>"*"+t.tender+"*\nQty: "+t.qty+"\nAmount Achievement: "+formatIDR(t.amount)),
      "",
      "*TOTAL BNPL*",
      "Qty: "+bnplSummary.totalQty,
      "Amount Achievement: "+formatIDR(bnplSummary.totalAmount)
    ];
    window.open("https://wa.me/?text="+encodeURIComponent(lines.join("\n")),"_blank","noopener,noreferrer");
  };

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
      const qty = filtered.reduce((acc, t) => acc + (Number(t.qty) || 0), 0);
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
Sisa Waktu Berdasarkan Data: ${dailyTargetCalculated.remainingSellingDays} Hari Tersisa

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

    const varianceVal = currentTrx.reduce((acc,t)=>acc+(Number(t.amount)||0),0) - (staff.targetAmount || 0);
    const varianceStr = varianceVal >= 0 ? `+${formatIDR(varianceVal)}` : formatIDR(varianceVal);

    const message = 
`- ${staff.name} -

Target : ${formatIDR(staff.targetAmount || 0)}
Achievement : ${formatIDR(currentTrx.reduce((acc,t)=>acc+(Number(t.amount)||0),0))}
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
      if (!transactions.length) throw new Error("Data penjualan belum tersedia. Refresh dashboard terlebih dahulu.");
      if (!(window as any).PptxGenJS) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Library PowerPoint gagal dimuat."));
          document.body.appendChild(script);
        });
      }
      const pptx = new (window as any).PptxGenJS();
      pptx.layout = "LAYOUT_WIDE";
      pptx.author = "Digiplus Grand Indonesia";
      pptx.subject = "Live store performance report";
      pptx.title = "Digiplus Grand Indonesia - Sales Performance";
      const BLUE = "174EA6", NAVY = "102D59", MUTED = "64748B", LIGHT = "EAF3FF", WHITE = "FFFFFF", RED = "B42318", GREEN = "147D64";
      // Embed the existing Digiplus brand asset into the PPTX (no external image links in exported file).
      let digiplusLogoData = "";
      try {
        const logoResponse = await fetch("/apple-touch-icon.png");
        if (logoResponse.ok) {
          const blob = await logoResponse.blob();
          digiplusLogoData = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Logo gagal dibaca"));
            reader.readAsDataURL(blob);
          });
        }
      } catch (logoError) {
        console.warn("Logo Digiplus tidak dapat dimuat untuk PPTX", logoError);
      }

      const fmt = (n: number) => "Rp " + Math.round(n).toLocaleString("id-ID");
      const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
      const cutoff = day; // always use today's Jakarta cut-off, independent of dashboard filter
      const [yy, mm, dd] = cutoff.split("-").map(Number);
      const previousMonth = new Date(Date.UTC(yy, mm - 2, 1));
      const previousPrefix = previousMonth.toISOString().slice(0, 7);
      const currentPrefix = cutoff.slice(0, 7);
      const prevLastDay = new Date(Date.UTC(yy, mm - 1, 0)).getUTCDate();
      const priorCutoff = previousPrefix + "-" + String(Math.min(dd, prevLastDay)).padStart(2, "0");
      const currentMTD = transactions.filter(t => t.isoDate >= currentPrefix + "-01" && t.isoDate <= cutoff);
      const previousMTD = transactions.filter(t => t.isoDate >= previousPrefix + "-01" && t.isoDate <= priorCutoff);
      const asDate = (iso: string) => new Date(iso + "T00:00:00Z");
      const sundayStart = (d: Date) => { const x = new Date(d); x.setUTCDate(x.getUTCDate() - x.getUTCDay()); return x; };
      const toIso = (d: Date) => d.toISOString().slice(0, 10);
      const thisWeekStart = sundayStart(asDate(cutoff));
      const lastWeekStart = new Date(thisWeekStart); lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);
      const elapsedDays = Math.floor((asDate(cutoff).getTime() - thisWeekStart.getTime()) / 86400000);
      const lastWeekCutoff = new Date(lastWeekStart); lastWeekCutoff.setUTCDate(lastWeekCutoff.getUTCDate() + elapsedDays);
      const currentWeek = transactions.filter(t => t.isoDate >= toIso(thisWeekStart) && t.isoDate <= cutoff);
      const previousWeek = transactions.filter(t => t.isoDate >= toIso(lastWeekStart) && t.isoDate <= toIso(lastWeekCutoff));
      const groups = ["Total Amount", "Apple Devices", "Android Devices", "Accessories", "VAS"];
      const classify = (t: RawTransaction) => {
        const p = (t.productName || "").toUpperCase();
        const brand = (t.brand || "").toUpperCase();
        const g = (t.groupCategory || "").toUpperCase();
        if (g === "VAS" || /QOALA|PROTECTION|PROTEKSI/.test(p)) return "VAS";
        if (g === "ACCESSORIES") return "Accessories";
        if (brand === "APPLE" && (g === "DEVICES" || /IPHONE|IPAD|MAC|WATCH/.test(p))) return "Apple Devices";
        if (g === "DEVICES" || /SAMSUNG|MOTOROLA|XIAOMI|OPPO|VIVO|HUAWEI|INFINIX/.test(brand)) return "Android Devices";
        return "Other";
      };
      const detail = (t: RawTransaction) => {
        const group = classify(t);
        if (group === "Apple Devices") return /IPHONE/i.test(t.productName) ? "iPhone" : /IPAD/i.test(t.productName) ? "iPad" : /MAC/i.test(t.productName) ? "Mac" : /WATCH/i.test(t.productName) ? "Watch" : "Other Apple";
        if (group === "Android Devices") return t.brand || "Other Android";
        if (group === "VAS") return /QOALA/i.test(t.productName + " " + t.brand) ? "Qoala" : (t.brand || t.productType || "Other VAS");
        if (group === "Accessories") return t.productType || t.brand || "Other Accessories";
        return "Other";
      };
      const amount = (arr: RawTransaction[], group?: string, sub?: string) => arr.reduce((sum, t) => sum + ((!group || group === "Total Amount" || classify(t) === group) && (!sub || detail(t) === sub) ? (Number(t.amount) || 0) : 0), 0);
      const growth = (now: number, before: number) => before > 0 ? ((now - before) / before) * 100 : now > 0 ? null : 0;
      const growthText = (now: number, before: number) => { const g = growth(now, before); return g === null ? "NEW" : (g > 0 ? "+" : "") + g.toFixed(1) + "%"; };
      const growthColor = (now: number, before: number) => { const g = growth(now, before); return g === null ? BLUE : g < 0 ? RED : GREEN; };
      const makeSlide = (heading: string, subtitle: string) => {
        const slide = pptx.addSlide();
        slide.background = { color: WHITE };
        if (digiplusLogoData) slide.addImage({ data: digiplusLogoData, x: 0.6, y: 0.34, w: 1.43, h: 0.6 });

        slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.11, line: { color: BLUE }, fill: { color: BLUE } });
        slide.addText(heading, { x: 2.25, y: 0.4, w: 10.45, h: 0.4, fontFace: "Aptos Display", fontSize: 23, bold: true, color: NAVY, margin: 0 });
        slide.addText(subtitle, { x: 2.25, y: 0.92, w: 10.45, h: 0.32, fontSize: 10, color: MUTED, margin: 0 });
        slide.addText("DIGIPLUS GRAND INDONESIA  •  QF01", { x: 0.6, y: 7.13, w: 8, h: 0.18, fontSize: 8, color: MUTED, margin: 0 });
        slide.addText("Cut-off " + cutoff, { x: 10.4, y: 7.13, w: 2.3, h: 0.18, align: "right", fontSize: 8, color: MUTED, margin: 0 });
        return slide;
      };
      const row = (slide: any, name: string, current: number, previous: number, y: number, height = 0.38, fontSize = 10, indent = 0) => {
        slide.addShape(pptx.ShapeType.rect, { x: 0.6, y, w: 12.1, h: height, line: { color: "EDF2F8", transparency: 100 }, fill: { color: Math.round(y * 10) % 2 ? "F8FAFD" : WHITE } });
        slide.addText(name, { x: 0.78 + indent, y: y + 0.04, w: 4.2 - indent, h: height - 0.06, fontSize, bold: indent === 0, color: indent ? MUTED : NAVY, margin: 0, breakLine: false });
        slide.addText(fmt(current), { x: 5.1, y: y + 0.04, w: 2.7, h: height - 0.06, fontSize, align: "right", color: NAVY, margin: 0 });
        slide.addText(fmt(previous), { x: 8.0, y: y + 0.04, w: 2.7, h: height - 0.06, fontSize, align: "right", color: MUTED, margin: 0 });
        slide.addText(growthText(current, previous), { x: 11, y: y + 0.04, w: 1.45, h: height - 0.06, fontSize, bold: true, align: "right", color: growthColor(current, previous), margin: 0 });
      };
      const tableHeader = (slide: any, nowLabel: string, beforeLabel: string) => {
        slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.5, w: 12.1, h: 0.48, rectRadius: 0.1, line: { color: LIGHT }, fill: { color: LIGHT } });
        [["Kategori", 0.78, 4.1], [nowLabel, 5.1, 2.7], [beforeLabel, 8, 2.7], ["Growth", 11, 1.45]].forEach(([label, x, w]: any) => slide.addText(label, { x, y: 1.62, w, h: 0.2, fontSize: 10, bold: true, color: NAVY, align: x > 4 ? "right" : "left", margin: 0 }));
      };
      const summaryRows = (slide: any, now: RawTransaction[], before: RawTransaction[], subcategories = false) => {
        const items: { label: string; group: string; sub?: string; indent: number }[] = [];
        groups.forEach(group => {
          items.push({ label: group, group, indent: 0 });
          if (subcategories && group !== "Total Amount") {
            const names = new Set([...now, ...before].filter(t => classify(t) === group).map(detail));
            [...names].sort((a, b) => amount(now, group, b) - amount(now, group, a)).forEach(name => items.push({ label: "↳ " + name, group, sub: name, indent: 0.28 }));
          }
        });
        // Keep all categories in the slide; adapt row height and font size to fit.
        const available = 4.78, height = Math.min(0.43, available / Math.max(items.length, 1)), fontSize = items.length > 16 ? 7 : items.length > 12 ? 8 : 10;
        items.forEach((item, i) => row(slide, item.label, amount(now, item.group, item.sub), amount(before, item.group, item.sub), 2.05 + i * height, height, fontSize, item.indent));
        if (!items.length) slide.addText("Belum ada transaksi pada periode ini.", { x: 0.7, y: 2.3, w: 11, h: 0.4, color: MUTED });
      };
      // Slide 1: store and active staff.
      {
        const slide = makeSlide("STORE OVERVIEW", "Ringkasan store dan staff aktif berdasarkan transaksi MTD.");
        slide.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.6, w: 12.1, h: 1.35, rectRadius: 0.2, line: { color: LIGHT }, fill: { color: LIGHT } });
        slide.addText("DIGIPLUS GRAND INDONESIA", { x: 0.92, y: 1.92, w: 8, h: 0.35, fontSize: 24, bold: true, color: NAVY, margin: 0 });
        slide.addText("Store QF01  •  " + currentPrefix + " MTD  •  " + fmt(amount(currentMTD)), { x: 0.92, y: 2.4, w: 10, h: 0.25, fontSize: 13, color: BLUE, margin: 0 });
        const staff = [...new Map(currentMTD.filter(t => t.salesId || t.salesName).map(t => [t.salesId || t.salesName, t.salesName])).values()].sort();
        slide.addText("ACTIVE STAFF (" + staff.length + ")", { x: 0.7, y: 3.35, w: 8, h: 0.3, fontSize: 17, bold: true, color: NAVY });
        const perCol = Math.max(1, Math.ceil(staff.length / 3));
        staff.forEach((name, i) => slide.addText(String(i + 1) + ". " + name, { x: 0.8 + Math.floor(i / perCol) * 4.1, y: 3.92 + (i % perCol) * Math.min(0.35, 2.85 / perCol), w: 3.9, h: 0.25, fontSize: 12, color: NAVY, margin: 0 }));
        if (!staff.length) slide.addText("Tidak ada staff dengan transaksi MTD.", { x: 0.8, y: 4, w: 10, h: 0.4, color: MUTED });
      }
      // Slide 2: month-on-month same elapsed calendar days.
      {
        const slide = makeSlide("MONTH ON MONTH • SAME DAY CUT-OFF", currentPrefix + "-01 s/d " + cutoff + " vs " + previousPrefix + "-01 s/d " + priorCutoff);
        tableHeader(slide, "Bulan ini", "Bulan lalu");
        summaryRows(slide, currentMTD, previousMTD, true);
      }
      // Slide 3: weekly Sunday-to-cutoff, previous Sunday-to-same-weekday.
      {
        const slide = makeSlide("WEEK TO WEEK • SAME WEEKDAY CUT-OFF", toIso(thisWeekStart) + " s/d " + cutoff + " vs " + toIso(lastWeekStart) + " s/d " + toIso(lastWeekCutoff));
        tableHeader(slide, "Minggu ini", "Minggu lalu");
        summaryRows(slide, currentWeek, previousWeek);
      }
      // Slide 4: MTD performance by category, same-day last month as benchmark.
      {
        const slide = makeSlide("MTD SALES • CATEGORY BREAKDOWN", "Penjualan 1–" + dd + " bulan ini dibanding tanggal yang sama bulan lalu; semua nominal adalah sales amount.");
        tableHeader(slide, "MTD saat ini", "MTD bulan lalu");
        summaryRows(slide, currentMTD, previousMTD, true);
      }
      // Slide 5: ranking staff, and category contribution per staff.
      {
        const slide = makeSlide("STAFF SALES PERFORMANCE", "Ranking berdasarkan total penjualan MTD tertinggi ke terendah. Kolom kategori adalah nominal sales.");
        const staff = [...new Map(currentMTD.map(t => [t.salesId || t.salesName, t.salesName])).entries()].map(([id, name]) => ({ id, name, tx: currentMTD.filter(t => (t.salesId || t.salesName) === id) })).sort((a, b) => amount(b.tx) - amount(a.tx));
        const headers = ["Rank / Staff", "Total Amount", "Apple", "Android", "Accessories", "VAS"];
        const x = [0.65, 4.4, 6.2, 7.9, 9.6, 11.25], w = [3.65, 1.7, 1.6, 1.6, 1.55, 1.45];
        slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: 1.48, w: 12.1, h: 0.5, line: { color: LIGHT }, fill: { color: LIGHT } });
        headers.forEach((h, i) => slide.addText(h, { x: x[i], y: 1.62, w: w[i], h: 0.2, fontSize: 9, bold: true, color: NAVY, align: i ? "right" : "left", margin: 0 }));
        const h = Math.min(0.46, 4.65 / Math.max(staff.length, 1));
        staff.forEach((s, i) => {
          const y = 2.08 + i * h;
          const values = [String(i + 1) + ". " + s.name, fmt(amount(s.tx)), ...groups.slice(1).map(g => fmt(amount(s.tx, g)))];
          values.forEach((v, j) => slide.addText(v, { x: x[j], y, w: w[j], h: Math.max(0.14, h - 0.05), fontSize: staff.length > 15 ? 7 : 9, bold: j === 0, color: j === 0 ? NAVY : MUTED, align: j ? "right" : "left", margin: 0 }));
        });
        if (!staff.length) slide.addText("Belum ada staff aktif pada MTD.", { x: 0.8, y: 2.2, w: 10, h: 0.3, color: MUTED });
      }
      // Slide 6: evidence-led decline, staff review, and stock opportunities.
      {
        const slide = makeSlide("ACTION PLAN • NEED REVIEW", "Analisa otomatis berbasis data transaksi. Indikasi, bukan penilaian personal atau keputusan stok final.");
        const insights: string[] = [];
        const mtdDiff = amount(currentMTD) - amount(previousMTD);
        const weekDiff = amount(currentWeek) - amount(previousWeek);
        insights.push("MTD: " + growthText(amount(currentMTD), amount(previousMTD)) + " (" + fmt(mtdDiff) + ") dibanding bulan lalu pada cut-off sama.");
        insights.push("Weekly: " + growthText(amount(currentWeek), amount(previousWeek)) + " (" + fmt(weekDiff) + ") dibanding minggu lalu pada hari setara.");
        groups.slice(1).forEach(g => {
          const m = amount(currentMTD, g), p = amount(previousMTD, g);
          if (p > m) insights.push("Penurunan " + g + ": " + fmt(p - m) + " (" + growthText(m, p) + "). Tinjau stok dan attach rate.");
        });
        const staffIds = new Set([...currentMTD, ...previousMTD].map(t => t.salesId || t.salesName));
        const review = [...staffIds].map(id => {
          const curr = currentMTD.filter(t => (t.salesId || t.salesName) === id);
          const prev = previousMTD.filter(t => (t.salesId || t.salesName) === id);
          return { name: curr[0]?.salesName || prev[0]?.salesName || id, now: amount(curr), before: amount(prev) };
        }).filter(v => v.before > v.now && v.before > 0).sort((a, b) => (b.before - b.now) - (a.before - a.now)).slice(0, 4);
        const productMap = new Map<string, { name: string; current: number; previous: number }>();
        [...currentMTD, ...previousMTD].forEach(t => {
          const key = t.sapArticle || t.productName;
          if (!key) return;
          if (!productMap.has(key)) productMap.set(key, { name: t.productName, current: 0, previous: 0 });
          const item = productMap.get(key)!;
          if (currentMTD.includes(t)) item.current += t.qty;
          else item.previous += t.qty;
        });
        const opportunities = [...productMap.values()].filter(v => v.previous > v.current && v.previous >= 2).sort((a, b) => b.previous - b.current - (a.previous - a.current)).slice(0, 4);
        const blocks = [
          { heading: "PERFORMANCE ANALYSIS", lines: insights.slice(0, 6) },
          { heading: "STAFF NEED REVIEW", lines: review.length ? review.map(v => v.name + ": " + fmt(v.now) + " vs " + fmt(v.before) + " (" + growthText(v.now, v.before) + ")") : ["Tidak ada penurunan staff yang dapat dibandingkan dari data MTD."] },
          { heading: "PRODUCTS TO REVIEW / REPLENISH", lines: opportunities.length ? opportunities.map(v => v.name.slice(0, 65) + " • Qty " + v.current + " vs " + v.previous + " (cek stok & demand)") : ["Belum ada indikasi produk menurun yang memenuhi ambang perbandingan."] }
        ];
        let y = 1.5;
        blocks.forEach(block => {
          slide.addText(block.heading, { x: 0.7, y, w: 12, h: 0.25, fontSize: 12, bold: true, color: BLUE, margin: 0 });
          y += 0.34;
          block.lines.forEach(line => {
            slide.addText("• " + line, { x: 0.83, y, w: 11.6, h: 0.24, fontSize: 9, color: NAVY, margin: 0 });
            y += 0.28;
          });
          y += 0.22;
        });
        slide.addText("Catatan: evaluasi staff harus mempertimbangkan jadwal, jam kerja, traffic, ketersediaan stok, dan target individual. Rekomendasi stok perlu validasi inventory.", { x: 0.7, y: 6.75, w: 12, h: 0.26, fontSize: 8, italic: true, color: MUTED, margin: 0 });
      }
      // Slide 7: BNPL tender, quantity, amount, product and contribution.
      {
        const slide = makeSlide("BNPL • TENDER & PRODUCT CONTRIBUTION", "BNPL DATABASE • MTD " + currentPrefix + "-01 s/d " + cutoff + " • nominal, qty, dan kontribusi tender.");
        // Resolve missing BNPL product labels from all matching sales invoice lines.
        // Invoice normalization handles numeric/string and punctuation differences.
        const invoiceKey = (v: unknown) => String(v ?? "").replace(/[^0-9A-Za-z]/g, "").toUpperCase();
        const salesByInvoice = new Map<string, Set<string>>();
        transactions.forEach(t => {
          const key = invoiceKey(t.invoice);
          const product = String(t.productName || "").trim();
          if (!key || !product) return;
          if (!salesByInvoice.has(key)) salesByInvoice.set(key, new Set());
          salesByInvoice.get(key)!.add(product);
        });
        const dated = bnplRecords.map(b => {
          const linked = [...(salesByInvoice.get(invoiceKey(b.invoice)) || [])];
          return {
            ...b,
            product: String(b.product || "").trim() || linked.join(" ; ") || "Produk belum teridentifikasi (Invoice " + b.invoice + ")",
            iso: parseNormalizedDate(b.date, b.month).isoDate
          };
        });
        const bnpl = dated.filter(b => b.iso >= currentPrefix + "-01" && b.iso <= cutoff);
        const priorBnpl = dated.filter(b => b.iso >= previousPrefix + "-01" && b.iso <= priorCutoff);
        const bnplAmount = bnpl.reduce((n, b) => n + b.amount, 0);
        const priorBnplAmount = priorBnpl.reduce((n, b) => n + b.amount, 0);
        const bnplQty = bnpl.reduce((n, b) => n + b.qty, 0);
        const contribution = amount(currentMTD) > 0 ? bnplAmount / amount(currentMTD) * 100 : 0;
        const tenders = [...new Set(bnpl.map(b => b.tender || "Other"))].map(name => ({
          name, amount: bnpl.filter(b => (b.tender || "Other") === name).reduce((n, b) => n + b.amount, 0),
          qty: bnpl.filter(b => (b.tender || "Other") === name).reduce((n, b) => n + b.qty, 0)
        })).sort((a, b) => b.amount - a.amount);
        const products = [...new Set(bnpl.map(b => b.product || "Unknown"))].map(name => ({
          name, amount: bnpl.filter(b => (b.product || "Unknown") === name).reduce((n, b) => n + b.amount, 0),
          qty: bnpl.filter(b => (b.product || "Unknown") === name).reduce((n, b) => n + b.qty, 0)
        })).sort((a, b) => b.amount - a.amount);
        const card = (x: number, label: string, value: string, foot: string) => {
          slide.addShape(pptx.ShapeType.roundRect, { x, y: 1.4, w: 3.85, h: 1.05, rectRadius: 0.13, line: { color: "D8E6F7" }, fill: { color: "F5F9FF" } });
          slide.addText(label, { x: x + 0.17, y: 1.55, w: 3.5, h: 0.19, fontSize: 9, color: MUTED, margin: 0 });
          slide.addText(value, { x: x + 0.17, y: 1.83, w: 3.5, h: 0.28, fontSize: 18, bold: true, color: NAVY, margin: 0 });
          slide.addText(foot, { x: x + 0.17, y: 2.19, w: 3.5, h: 0.16, fontSize: 8, color: BLUE, margin: 0 });
        };
        card(0.6, "Total BNPL Amount", fmt(bnplAmount), "MoM " + growthText(bnplAmount, priorBnplAmount));
        card(4.74, "Qty BNPL", String(bnplQty), "Qty transaksi produk BNPL");
        card(8.88, "Kontribusi ke Total Sales", contribution.toFixed(1) + "%", "BNPL / Total Amount MTD");
        slide.addText("BNPL PER TENDER", { x: 0.65, y: 2.76, w: 6, h: 0.28, fontSize: 13, bold: true, color: NAVY, margin: 0 });
        slide.addText("DETAIL PRODUCT BNPL", { x: 7.05, y: 2.76, w: 5.7, h: 0.28, fontSize: 13, bold: true, color: NAVY, margin: 0 });
        const addHeading = (labels: { text: string; x: number; w: number; align?: string }[], y: number) => labels.forEach(h => slide.addText(h.text, { x: h.x, y, w: h.w, h: 0.2, fontSize: 9, bold: true, color: BLUE, align: h.align || "left", margin: 0 }));
        addHeading([{text:"Tender",x:0.7,w:2.3},{text:"Qty",x:3.2,w:0.7,align:"right"},{text:"Amount",x:4.1,w:1.7,align:"right"},{text:"Share",x:5.9,w:0.7,align:"right"}],3.18);
        addHeading([{text:"Product",x:7.08,w:3.2},{text:"Qty",x:10.3,w:0.5,align:"right"},{text:"Amount",x:10.95,w:1.65,align:"right"}],3.18);
        const tenderRows = tenders.slice(0, 10);
        tenderRows.forEach((t, i) => {
          const y = 3.52 + i * 0.29;
          slide.addText(t.name, { x:0.7,y,w:2.4,h:0.21,fontSize:9,color:NAVY,margin:0 });
          slide.addText(String(t.qty), { x:3.2,y,w:0.7,h:0.21,fontSize:9,color:NAVY,align:"right",margin:0 });
          slide.addText(fmt(t.amount), { x:4.1,y,w:1.7,h:0.21,fontSize:9,color:NAVY,align:"right",margin:0 });
          slide.addText(bnplAmount ? (t.amount/bnplAmount*100).toFixed(1)+"%" : "0%", { x:5.9,y,w:0.7,h:0.21,fontSize:9,bold:true,color:BLUE,align:"right",margin:0 });
        });
        products.slice(0, 10).forEach((p, i) => {
          const y = 3.52 + i * 0.29;
          slide.addText(p.name, { x:7.08,y,w:3.15,h:0.21,fontSize:8,color:NAVY,margin:0 });
          slide.addText(String(p.qty), { x:10.3,y,w:0.5,h:0.21,fontSize:9,color:NAVY,align:"right",margin:0 });
          slide.addText(fmt(p.amount), { x:10.95,y,w:1.65,h:0.21,fontSize:9,color:NAVY,align:"right",margin:0 });
        });
        if (!bnpl.length) slide.addText("Tidak ada data BNPL pada periode MTD.", { x:0.7,y:3.8,w:11,h:0.4,fontSize:12,color:MUTED });
        const more = (tenders.length > 10 ? " • " + (tenders.length - 10) + " tender lain" : "") + (products.length > 10 ? " • " + (products.length - 10) + " produk lain" : "");
        slide.addText("Top tender: " + (tenders[0]?.name || "—") + " • " + fmt(tenders[0]?.amount || 0) + more + " | Sumber: BNPL DATABASE", { x:0.7,y:6.75,w:12,h:0.23,fontSize:9,color:MUTED,margin:0 });
      }
      await pptx.writeFile({ fileName: "Digiplus_GI_7_Slide_Sales_Review_" + cutoff + ".pptx" });
    } catch (err) {
      alert("Gagal mengekspor slide PowerPoint: " + (err instanceof Error ? err.message : String(err)));
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
    { id: "est-incentive", label: "Est. Incentive", icon: "💰", color: "bg-emerald-500", shadow: "shadow-emerald-500/30" },
    { id: "customer-engagement", label: "Customer Engagement", icon: "🤝", color: "bg-sky-500", shadow: "shadow-sky-500/30" },
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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

      {/* 2. MOBILE NAVIGATION — compact iOS-inspired drawer; desktop unchanged */}
      {mobileDrawerOpen && (
        <div onClick={() => setMobileDrawerOpen(false)} className="lg:hidden fixed inset-0 bg-slate-950/65 backdrop-blur-[5px] z-50 print:hidden" />
      )}
      <aside
        aria-label="Navigasi mobile Digiplus GI"
        aria-hidden={!mobileDrawerOpen}
        className={`lg:hidden fixed inset-y-0 left-0 w-[min(328px,88vw)] z-50 transform transition-transform duration-300 ease-out border-r flex flex-col overflow-hidden print:hidden ${isDark ? "bg-[#161b23] border-white/10" : "bg-[#f8fafc] border-slate-200"} ${mobileDrawerOpen ? "translate-x-0" : "-translate-x-full pointer-events-none"}`}
        style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="px-5 pt-5 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0a9fe8] text-white text-[15px] font-extrabold tracking-tight flex items-center justify-center">QF01</div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-bold tracking-tight text-slate-950 dark:text-white">DIGIPLUS GI</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Store dashboard</p>
            </div>
            <button aria-label="Tutup menu" onClick={() => setMobileDrawerOpen(false)} className="w-9 h-9 rounded-full bg-slate-200/80 dark:bg-white/10 text-slate-700 dark:text-slate-200 flex items-center justify-center text-lg active:scale-95">×</button>
          </div>
        </div>
        <div className="px-5 pb-2 shrink-0"><p className="text-[10px] font-bold tracking-[0.14em] uppercase text-slate-400">Navigation</p></div>
        <nav className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3 pb-3 space-y-0.5 custom-scrollbar">
          {mainNavItems.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => { setActiveTab(item.id as MenuTab); setMobileDrawerOpen(false); }}
                className={`w-full min-h-[48px] flex items-center gap-3 px-3 py-2 rounded-2xl text-left transition-colors active:scale-[0.99] ${active ? "bg-sky-500/12 dark:bg-sky-400/15 text-sky-700 dark:text-sky-300" : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-white/5"}`}
              >
                <span className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-[17px] ${active ? "bg-sky-500/15 dark:bg-sky-400/15" : "bg-slate-200/70 dark:bg-white/[0.07]"}`}>{item.icon}</span>
                <span className={`flex-1 min-w-0 text-[13px] leading-tight ${active ? "font-bold" : "font-medium"}`}>{item.label}</span>
                {active && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />}
              </button>
            );
          })}
        </nav>
        <div className="shrink-0 px-4 pt-3 pb-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <button onClick={toggleTheme} className="w-full min-h-[44px] rounded-xl bg-slate-200/70 dark:bg-white/[0.07] text-slate-800 dark:text-slate-200 text-[13px] font-semibold flex items-center justify-center gap-2">{isDark ? "☀️ Mode Terang" : "🌙 Mode Gelap"}</button>
          <button onClick={handleLogout} className="w-full min-h-[44px] rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[13px] font-semibold flex items-center justify-center gap-2">🚪 Keluar</button>
        </div>
      </aside>

      {/* 3. KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className={`lg:hidden flex items-center justify-between gap-2 px-3 py-2 min-h-[56px] border-b backdrop-blur-xl sticky top-0 z-30 print:hidden ${glassSidebar}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="h-10 w-10 shrink-0 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-400/20 flex items-center justify-center active:scale-95 transition"
              aria-label="Buka Menu"
            >
              <span className="text-lg leading-none">☰</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 shrink-0 rounded-xl bg-sky-500 flex items-center justify-center font-black text-xs text-white shadow-sm">
                QF01
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-black leading-none text-slate-900 dark:text-white">DIGIPLUS GI</h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-sky-600 dark:text-sky-400 font-bold truncate max-w-[150px]">
                    {currentSalesName || "Store Leader Admin"}
                  </span>
                  <span className="hidden sm:inline text-[9px] text-emerald-400 font-mono font-bold">
                    • {currentTime}
                  </span>
                </div>
                <span className="hidden sm:block text-[9px] text-slate-400 font-mono mt-0.5">
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
        
        <main className="p-3 sm:p-6 lg:p-8 w-full max-w-[1700px] mx-auto flex-1 overflow-x-hidden pb-20 lg:pb-6">
          <header className="mb-3 sm:mb-6 border-b border-inherit pb-3 sm:pb-5 print:hidden">
            <div className="flex flex-wrap justify-between items-center gap-2 sm:gap-4 mb-2 sm:mb-4">
              <div>
                <div className={`hidden sm:flex text-xl sm:text-2xl font-black ${accentText} items-center gap-2`}>
                  <span>Halo, {currentSalesName} 👋</span>
                </div>

                <div className="hidden sm:flex flex-wrap items-center gap-2 mt-1.5">
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

                <p className={`hidden sm:block text-[11px] ${textMuted} mt-1.5 font-semibold`}>
                  Live Feed: <code>DATABASE</code> (gid: 602901290) &amp; <code>BNPL DATABASE</code> (gid: 2697970)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
                <button
                  onClick={handleShareDaily}
                  className="px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                >
                  <span>📲</span>
                  <span className="hidden sm:inline">Share Daily</span><span className="sm:hidden">Share</span>
                </button>

                <button
                  onClick={fetchLiveGoogleSheets}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-black transition flex items-center gap-1.5 ${innerBg} text-slate-950 dark:text-white`}
                >
                  <span>🔄</span>
                  <span className="hidden sm:inline">{isLoading ? "Mengambil Data..." : "Sync Live"}</span><span className="sm:hidden">{isLoading ? "Sync..." : "Sync"}</span>
                </button>

                <span className={`px-2 sm:px-3 py-1.5 rounded-lg border text-[11px] sm:text-xs font-black ${
                  isDark ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" : "bg-emerald-100 text-emerald-950 border-emerald-300"
                }`}>
                  Actual: {formatIDR(overviewStats.actual)}
                </span>
              </div>
            </div>

            <div className={`p-2 sm:p-3 ${cardBg} border rounded-2xl flex flex-wrap items-center gap-2 sm:gap-3 justify-between text-xs font-bold`}>
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

                {(
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-slate-200">📅 Bulan:</span>
                    <select
                      value={selectedMonth}
                      onChange={(e) => { setSelectedMonth(e.target.value); setSelectedWeek("ALL"); setDateManuallySelected(false); const month=e.target.value; const names=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];const idx=names.findIndex(n=>month.startsWith(n));if(idx>=0)setSelectedDate(month.slice(-4)+"-"+String(idx+1).padStart(2,"0")+"-01"); }}
                      className={`${innerBg} border rounded-xl px-2.5 py-1 font-black focus:outline-none text-slate-950 dark:text-white`}
                    >
                      <option value="ALL">Semua Bulan</option>
                      {availableMonths.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                )}

                {dataLoadError && <div role="alert" className="w-full p-3 rounded-xl bg-red-50 border border-red-300 text-red-800 text-xs font-bold">⚠️ Data Google Sheets gagal dimuat: {dataLoadError}. Periksa akses Google Sheets, lalu klik Sync Live.</div>}
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
                  <section className={`p-5 ${cardBg} border-2 rounded-3xl shadow-xl space-y-5`}>
                    <div className="flex justify-between items-center flex-wrap gap-3">
                      <div><h2 className="text-lg font-black text-slate-950 dark:text-white">📊 WEEKLY PERFORMANCE — MINGGU–SABTU</h2><p className="text-xs text-slate-500">Target mingguan = target bulanan ÷ jumlah hari bulan × hari dalam week. Week selalu Minggu–Sabtu (7 hari), termasuk lintas bulan. Target hanya dihitung untuk hari pada bulan terpilih.</p></div>
                      <select className="rounded-xl border px-3 py-2 bg-white text-slate-950 dark:bg-slate-800 dark:text-white" value={Math.min(calendarWeekIndex,Math.max(0,calendarWeekly.weeks.length-1))} onChange={e=>setCalendarWeekIndex(Number(e.target.value))}>{calendarWeekly.weeks.map((w,i)=><option key={i} value={i}>{w.label} · {w.start} s.d. {w.end}</option>)}</select>
                    </div>
                    {calendarWeekly.current && (() => {
                      const w=calendarWeekly.current, prev=calendarWeekly.previous;
                      const amount=(rows:RawTransaction[])=>rows.reduce((n,t)=>n+t.amount,0);
                      const qty=(rows:RawTransaction[])=>rows.reduce((n,t)=>n+t.qty,0);
                      const growth=prev&&prev.amount>0?(w.amount-prev.amount)/prev.amount*100:null;
                      const dailyGrowth=prev&&prev.amount>0&&w.observedDays>0&&prev.observedDays>0?((w.amount/w.observedDays)/(prev.amount/prev.observedDays)-1)*100:null;
                      const inv=new Set(w.rows.map(t=>t.invoice).filter(Boolean)).size;
                      const groups=["Apple","Android","ACC","VAS"];
                      const groupOf=(t:RawTransaction)=>{const g=(t.groupCategory||"").toUpperCase(),p=(t.productType||"").toUpperCase(),b=(t.brand||"").toUpperCase();return g.includes("VAS")||p.includes("VAS")?"VAS":g.includes("ACC")||p.includes("ACC")?"ACC":g.includes("APPLE")||b.includes("APPLE")||b.includes("IPHONE")?"Apple":"Android";};
                      const staff=[...new Set(w.rows.map(t=>t.salesId||t.salesName))].map(id=>{const rows=w.rows.filter(t=>(t.salesId||t.salesName)===id);const monthly=staffTargets[id]||0;return {id,name:rows[0]?.salesName||id,amount:amount(rows),qty:qty(rows),invoices:new Set(rows.map(t=>t.invoice)).size,target:monthly/(new Date(Number(selectedMonth.slice(-4)),["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].findIndex(n=>selectedMonth.startsWith(n))+1,0).getDate()||30)*w.days,acc:amount(rows.filter(t=>groupOf(t)==="ACC")),vas:amount(rows.filter(t=>groupOf(t)==="VAS"))};}).sort((a,b)=>b.amount-a.amount);
                      const products=[...new Set(w.rows.map(t=>t.productName))].map(name=>{const rows=w.rows.filter(t=>t.productName===name);return {name,qty:qty(rows),amount:amount(rows)};}).sort((a,b)=>b.qty-a.qty).slice(0,10);
                      const days=Array.from({length:w.days},(_,i)=>{const d=new Date(w.start+"T12:00:00");d.setDate(d.getDate()+i);const iso=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");const rows=w.rows.filter(t=>t.isoDate===iso);return {iso,amount:amount(rows),rows};});
                      const maxDay=Math.max(calendarWeekly.dailyTarget,...days.map(d=>d.amount),1);
                      return <div className="space-y-5">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                          {([{label:"SALES "+w.label,value:formatIDR(w.amount),detail:"Target "+formatIDR(w.target)+" · "+(w.target>0?(w.amount/w.target*100).toFixed(1)+"%":"Target belum tersedia")},{label:"GROWTH ACTUAL",value:growth===null?"—":(growth>=0?"+":"")+growth.toFixed(1)+"%",detail:prev?prev.start+" – "+prev.end:"Week sebelumnya tidak tersedia"},{label:"TRANSAKSI · UPT",value:inv+" · "+(inv?qty(w.rows)/inv:0).toFixed(2),detail:qty(w.rows)+" unit"},{label:"GROWTH DAILY AVG",value:dailyGrowth===null?"—":(dailyGrowth>=0?"+":"")+dailyGrowth.toFixed(1)+"%",detail:w.observedDays+" hari teramati vs "+(prev?.observedDays||0)+" hari sebelumnya"}] as const).map(k=><div key={k.label} className={`p-4 rounded-2xl border ${innerBg}`}><div className="text-xs font-bold text-slate-500">{k.label}</div><div className="text-lg font-black text-slate-950 dark:text-white">{k.value}</div><div className="text-xs text-slate-500">{k.detail}</div></div>)}
                        </div>
                        <div className={`p-4 rounded-2xl border ${innerBg}`}><h3 className="font-black text-slate-950 dark:text-white mb-3">Harian Minggu–Sabtu · Target/Hari {formatIDR(calendarWeekly.dailyTarget)}</h3><div className="grid grid-cols-7 gap-2 items-end h-44">{days.map(d=><div key={d.iso} className="flex flex-col items-center justify-end h-full gap-1"><span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{formatCompactIDR(d.amount)}</span><div className={`w-full rounded-t-lg ${d.amount>=calendarWeekly.dailyTarget?"bg-blue-500":"bg-rose-400"}`} style={{height:Math.max(3,d.amount/maxDay*115)+"px"}}/><span className="text-[10px] text-slate-500">{d.iso.slice(8)}</span></div>)}</div><div className="overflow-x-auto mt-4"><table className="w-full min-w-[620px] text-xs"><thead><tr>{["Hari","Sales","Apple","Android","ACC","VAS","Inv","UPT","ACH"].map(h=><th key={h} className="p-2 text-left">{h}</th>)}</tr></thead><tbody>{days.map(d=><tr key={d.iso} className="border-t border-slate-400/20"><td className="p-2">{d.iso}</td><td className="p-2 font-bold">{formatCompactIDR(d.amount)}</td>{groups.map(g=><td key={g} className="p-2">{formatCompactIDR(amount(d.rows.filter(t=>groupOf(t)===g)))}</td>)}<td className="p-2">{new Set(d.rows.map(t=>t.invoice)).size}</td><td className="p-2">{(qty(d.rows)/Math.max(1,new Set(d.rows.map(t=>t.invoice)).size)).toFixed(1)}</td><td className="p-2">{calendarWeekly.dailyTarget?(d.amount/calendarWeekly.dailyTarget*100).toFixed(0)+"%":"—"}</td></tr>)}</tbody></table></div></div>
                        <div className="grid lg:grid-cols-2 gap-4">
                          <div className={`p-4 rounded-2xl border ${innerBg}`}><h3 className="font-black text-slate-950 dark:text-white mb-3">Per Grup · Actual vs Target Week</h3>{groups.map(g=>{const actual=amount(w.rows.filter(t=>groupOf(t)===g));return <div key={g} className="py-2 border-b border-slate-400/20 text-xs"><div className="flex justify-between"><strong>{g}</strong><span>{formatIDR(actual)}</span></div><div className="h-2 bg-slate-400/20 rounded-full mt-1"><div className="h-full bg-blue-500 rounded-full" style={{width:Math.min(100,w.amount?actual/w.amount*100:0)+"%"}}/></div></div>})}</div>
                          <div className={`p-4 rounded-2xl border ${innerBg}`}><h3 className="font-black text-slate-950 dark:text-white mb-3">Staff {w.label} · Ranking</h3>{staff.map((st,i)=><div key={st.id} className="flex justify-between gap-2 py-2 border-b border-slate-400/20 text-xs"><span>{i+1}. {st.name}<span className="block text-[10px] text-slate-500">ACC {formatCompactIDR(st.acc)} · VAS {formatCompactIDR(st.vas)} · {st.invoices} trx</span></span><strong>{formatCompactIDR(st.amount)} · {st.target?(st.amount/st.target*100).toFixed(0)+"%":"—"}</strong></div>)}</div>
                          <div className={`p-4 rounded-2xl border ${innerBg}`}><h3 className="font-black text-slate-950 dark:text-white mb-3">Top Produk {w.label}</h3>{products.map((p,i)=><div key={p.name} className="flex justify-between gap-2 py-2 border-b border-slate-400/20 text-xs"><span>{i+1}. {p.name}</span><strong>{p.qty} · {formatCompactIDR(p.amount)}</strong></div>)}</div>
                          <div className={`p-4 rounded-2xl border ${innerBg}`}><h3 className="font-black text-slate-950 dark:text-white mb-3">Tren Week Bulan Ini</h3><div className="flex items-end gap-3 h-36">{calendarWeekly.weeks.map((wk,i)=><button key={i} onClick={()=>setCalendarWeekIndex(i)} className="flex-1 flex flex-col items-center justify-end h-full gap-1"><span className="text-[10px]">{formatCompactIDR(wk.amount)}</span><div className="w-full bg-blue-500 rounded-t" style={{height:Math.max(3,wk.amount/Math.max(1,...calendarWeekly.weeks.map(x=>x.amount))*95)+"px"}}/><span className="text-xs">{wk.label}</span></button>)}</div></div>
                        </div>
                        <div className={`p-4 rounded-2xl border overflow-x-auto ${innerBg}`}><h3 className="font-black text-slate-950 dark:text-white mb-3">Comparison per LOB · {w.label} vs Week Lalu</h3><table className="w-full min-w-[600px] text-xs"><thead><tr>{["LOB","Qty Ini","Qty Lalu","Δ Qty","Value Ini","Value Lalu","Δ Value","Growth"].map(h=><th key={h} className="p-2 text-left">{h}</th>)}</tr></thead><tbody>{groups.map(g=>{const a=w.rows.filter(t=>groupOf(t)===g),b=prev?.rows.filter(t=>groupOf(t)===g)||[];const va=amount(a),vb=amount(b);return <tr key={g} className="border-t border-slate-400/20"><td className="p-2 font-bold">{g}</td><td className="p-2">{qty(a)}</td><td className="p-2">{prev?qty(b):"—"}</td><td className="p-2">{prev?qty(a)-qty(b):"—"}</td><td className="p-2">{formatIDR(va)}</td><td className="p-2">{prev?formatIDR(vb):"—"}</td><td className="p-2">{prev?formatIDR(va-vb):"—"}</td><td className="p-2">{prev&&vb?(va/vb*100-100).toFixed(1)+"%":"—"}</td></tr>})}</tbody></table></div>
                      </div>;
                    })()}
                  </section>
                  <section className={`p-5 ${cardBg} border-2 rounded-3xl shadow-xl space-y-4`}>
                    <h2 className="text-lg font-black text-slate-950 dark:text-white">📦 RINCIAN PENJUALAN WEEK BERJALAN VS WEEK SEBELUMNYA</h2>
                    <p className="text-xs text-slate-500">Pembanding lintas bulan otomatis. Growth Actual = perubahan omzet total; Growth Daily Average = perubahan rata-rata omzet per hari teramati.</p>
                    {calendarWeekly.current && (() => {
                      const w=calendarWeekly.current,prev=calendarWeekly.previous;
                      const focus=["AVANA","INCASE","INCIPIO","ITSKIN","RIVERCASE","TUCANO","UAG","IFROGZ","ZAG","ZAAG","MUTUALL","KRATOS","VERBATIM","MEDPOIN","ARC PULSE","FLAUNT","CARE","KATE SPADE","IBACKS","KAIZEN","RAPTIC"];
                      const sum=(rows:RawTransaction[])=>({qty:rows.reduce((n,t)=>n+(Number(t.qty)||0),0),amount:rows.reduce((n,t)=>n+(Number(t.amount)||0),0)});
                      const category=(t:RawTransaction)=>{
                        const group=(t.groupCategory||"").toUpperCase(),type=(t.productType||"").toUpperCase(),brand=(t.brand||"").toUpperCase(),name=(t.productName||"").toUpperCase();
                        if(group.includes("VAS")||type.includes("VAS")||/QOALA|TELKOMSEL|INDOSAT|\bXL\b/.test(name+" "+brand+" "+group))return "VAS";
                        if(group.includes("ACC")||type.includes("ACC")||group.includes("ACCESSOR"))return "Accessories";
                        if(group.includes("APPLE")||brand.includes("APPLE")||/IPHONE|IPAD|MACBOOK|AIRPODS|APPLE WATCH/.test(name))return "Apple Devices";
                        if(group.includes("ANDROID")||/SAMSUNG|OPPO|HUAWEI|XIAOMI|MOTOROLA|INFINIX/.test(brand+" "+name))return "Android Devices";
                        return "Lainnya";
                      };
                      const specs=[
                        {title:"Apple Devices",filter:(t:RawTransaction)=>category(t)==="Apple Devices",detail:(t:RawTransaction)=>/IPHONE|IPAD|MACBOOK|AIRPODS|WATCH/i.exec(t.productName)?.[0]||t.productType||"Apple"},
                        {title:"Android Devices",filter:(t:RawTransaction)=>category(t)==="Android Devices",detail:(t:RawTransaction)=>["SAMSUNG","OPPO","HUAWEI","XIAOMI","MOTOROLA","INFINIX"].find(x=>(t.brand+" "+t.productName).toUpperCase().includes(x))||t.brand||"Android Lainnya"},
                        {title:"Accessories (All Category)",filter:(t:RawTransaction)=>category(t)==="Accessories",detail:(t:RawTransaction)=>t.productType||t.brand||"Accessories"},
                        {title:"Accessories Referensi (Brand Focus)",filter:(t:RawTransaction)=>category(t)==="Accessories"&&focus.some(x=>(t.supplier+" "+t.brand+" "+t.productName).toUpperCase().includes(x)),detail:(t:RawTransaction)=>focus.find(x=>(t.supplier+" "+t.brand+" "+t.productName).toUpperCase().includes(x))||"Lainnya"},
                        {title:"VAS",filter:(t:RawTransaction)=>category(t)==="VAS",detail:(t:RawTransaction)=>["QOALA","TELKOMSEL","INDOSAT","XL"].find(x=>(t.brand+" "+t.productName+" "+t.productType).toUpperCase().includes(x))||"VAS Lainnya"}
                      ];
                      return <div className="space-y-4">{specs.map(spec=>{
                        const current=w.rows.filter(spec.filter),prior=(prev?.rows||[]).filter(spec.filter),now=sum(current),before=sum(prior);
                        const names=[...new Set([...current,...prior].map(spec.detail))].sort();
                        const actualGrowth=prev&&before.amount>0?(now.amount/before.amount-1)*100:null;
                        const dailyAvgGrowth=prev&&before.amount>0&&w.observedDays&&prev.observedDays?((now.amount/w.observedDays)/(before.amount/prev.observedDays)-1)*100:null;
                        return <div key={spec.title} className={`p-4 rounded-2xl border ${innerBg} space-y-3`}>
                          <div className="flex flex-wrap justify-between gap-3 items-center"><h3 className="font-black text-slate-950 dark:text-white">{spec.title}</h3><span className="text-xs text-slate-500">{w.label} ({w.start} – {w.end}) {prev?"vs "+prev.label+" ("+prev.start+" – "+prev.end+")":"· belum ada week sebelumnya"}</span></div>
                          <div className="grid grid-cols-2 gap-3 text-xs"><div className="p-3 rounded-xl bg-blue-500/10"><strong className="block">Week Berjalan · {w.label}</strong><span>{now.qty} Qty · {formatIDR(now.amount)}</span></div><div className="p-3 rounded-xl bg-slate-500/10"><strong className="block">Week Sebelumnya · {prev?.label||"—"}</strong><span>{prev?before.qty+" Qty · "+formatIDR(before.amount):"Belum tersedia"}</span></div></div>
                          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">Growth Actual: {actualGrowth===null?"—":actualGrowth.toFixed(1)+"%"} · Growth Daily Average: {dailyAvgGrowth===null?"—":dailyAvgGrowth.toFixed(1)+"%"}</div><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-xs text-left"><thead><tr className="border-b border-slate-400/30">{["Brand / Kategori","Qty Week Ini","Amount Week Ini","Qty Week Lalu","Amount Week Lalu","Δ Qty","Δ Amount","Growth Actual","Growth Daily Avg"].map(h=><th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{names.map(name=>{const a=sum(current.filter(t=>spec.detail(t)===name)),b=sum(prior.filter(t=>spec.detail(t)===name));return <tr key={name} className="border-b border-slate-400/20"><td className="p-2 font-bold">{name}</td><td className="p-2">{a.qty}</td><td className="p-2">{formatIDR(a.amount)}</td><td className="p-2">{prev?b.qty:"—"}</td><td className="p-2">{prev?formatIDR(b.amount):"—"}</td><td className="p-2">{prev?a.qty-b.qty:"—"}</td><td className="p-2">{prev?formatIDR(a.amount-b.amount):"—"}</td><td className="p-2">{prev&&b.amount?((a.amount/b.amount-1)*100).toFixed(1)+"%":"—"}</td><td className="p-2">{prev&&b.amount&&w.observedDays&&prev.observedDays?(((a.amount/w.observedDays)/(b.amount/prev.observedDays)-1)*100).toFixed(1)+"%":"—"}</td></tr>})}</tbody></table>{names.length===0&&<p className="text-xs text-slate-500 py-3">Belum ada penjualan pada kategori ini.</p>}</div>
                        </div>;
                      })}</div>;
                    })()}
                  </section>
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

              {/* CUSTOMER ENGAGEMENT TRACKER */}
{activeTab==="customer-engagement"&&(()=>{
const people=new Map<string,string>();transactions.forEach(t=>{if(t.salesId&&t.salesName)people.set(t.salesId,t.salesName)});
const now=new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
const from=engPeriod==="today"?now:engPeriod==="week"?(()=>{const d=new Date(now+"T12:00:00Z");d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return d.toISOString().slice(0,10)})():now.slice(0,7)+"-01";
const within=(d:string)=>d>=from&&d<=now;
const rows=engRows.filter(r=>within(r.date)),sales=transactions.filter(t=>within(t.isoDate));
const cats=["CX","New Member","Google Review"];
const sums=cats.map(c=>rows.filter(r=>r.category===c).reduce((n,r)=>n+Number(r.qty||0),0));
const invoices=new Map<string,Set<string>>();sales.forEach(t=>{if(!t.invoice?.trim())return;if(!invoices.has(t.salesId))invoices.set(t.salesId,new Set());invoices.get(t.salesId)!.add(t.invoice.trim().toUpperCase())});
const grand=new Set(sales.map(t=>t.invoice?.trim().toUpperCase()).filter(Boolean)).size;
const staff=[...new Set([...invoices.keys(),...rows.map(r=>r.salesId)])].filter(Boolean).map(id=>({id,name:people.get(id)||rows.find(r=>r.salesId===id)?.salesName||id,invoice:invoices.get(id)?.size||0,values:cats.map(c=>rows.filter(r=>r.salesId===id&&r.category===c).reduce((n,r)=>n+Number(r.qty||0),0))})).sort((a,b)=>b.invoice-a.invoice);
const save=async(e:React.FormEvent)=>{e.preventDefault();setEngBusy(true);try{const r=await fetch("/api/customer-engagement",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date:engDate,salesId:engStaff,salesName:people.get(engStaff),category:engCategory,qty:Number(engQty),enteredBy:currentSalesId})});const d=await r.json();if(!r.ok)throw Error(d.error);setEngQty("1");await loadEng()}catch(e){setEngError(String(e))}finally{setEngBusy(false)}};
const remove=async(id:string)=>{if(!window.confirm("Hapus aktivitas ini?"))return;setEngBusy(true);try{const r=await fetch("/api/customer-engagement",{method:"DELETE",headers:{"Content-Type":"application/json","x-admin-access-password":engPassword},body:JSON.stringify({id})});const d=await r.json();if(!r.ok)throw Error(d.error);await loadEng()}catch(e){setEngError(String(e))}finally{setEngBusy(false)}};
return <div className="space-y-5">
<div className={`rounded-3xl border p-5 ${cardBg}`}><h2 className="text-2xl font-bold">Customer Engagement Tracker</h2><p className="opacity-70 text-sm">Manual CX · New Member · Google Review vs unique invoices</p><div className="flex gap-2 mt-4">{[["today","Today"],["week","This Week"],["month","MTD"]].map(([v,l])=><button key={v} onClick={()=>setEngPeriod(v)} className={`px-4 py-2 rounded-xl border ${engPeriod===v?"bg-blue-600 text-white":""}`}>{l}</button>)}</div></div>
<div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{[["Unique Invoice",grand],...cats.map((c,i)=>[c,sums[i]])].map(([label,value])=><div key={label} className={`rounded-2xl border p-4 ${cardBg}`}><p className="opacity-70 text-sm">{label}</p><p className="text-3xl font-bold mt-2">{value}</p></div>)}</div>
<form onSubmit={save} className={`rounded-3xl border p-5 space-y-4 ${cardBg}`}><h3 className="text-xl font-bold">Manual Input</h3><div className="grid md:grid-cols-2 gap-3"><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Activity Date<input type="date" required value={engDate} onChange={e=>setEngDate(e.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark] dark:focus:border-sky-400"/></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Staff<select required value={engStaff} onChange={e=>setEngStaff(e.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark] dark:focus:border-sky-400"><option value="">Pilih staff</option>{[...people.entries()].sort((a,b)=>a[1].localeCompare(b[1])).map(([id,name])=><option key={id} value={id}>{name} · {id}</option>)}</select></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Category<select value={engCategory} onChange={e=>setEngCategory(e.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark] dark:focus:border-sky-400">{cats.map(c=><option key={c}>{c}</option>)}</select></label><label className="block text-sm font-medium text-slate-700 dark:text-slate-200">Qty<input type="number" min="1" max="10000" required value={engQty} onChange={e=>setEngQty(e.target.value)} className="mt-1.5 block w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-slate-900 shadow-sm outline-none transition-colors focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:[color-scheme:dark] dark:focus:border-sky-400"/></label></div><button disabled={engBusy||!currentSalesId} type="submit" className="bg-blue-600 text-white px-5 py-3 rounded-xl disabled:opacity-50">{engBusy?"Menyimpan...":"Simpan Aktivitas"}</button>{engError&&<p role="alert" className="text-rose-500 text-sm">{engError}</p>}</form>
<div className={`rounded-3xl border p-5 overflow-x-auto ${cardBg}`}><h3 className="text-xl font-bold mb-3">Staff Performance · COUNTUNIQUE Invoice</h3><table className="w-full text-sm"><thead><tr><th className="p-2 text-left">Staff</th><th className="p-2">Invoice</th>{cats.map(c=><th className="p-2" key={c}>{c}</th>)}</tr></thead><tbody>{staff.map(r=><tr key={r.id} className="border-t border-gray-500/20"><td className="p-2">{r.name}</td><td className="p-2 text-center">{r.invoice}</td>{r.values.map((v,i)=><td className="p-2 text-center" key={i}>{v}</td>)}</tr>)}<tr className="font-bold border-t"><td className="p-2">GRAND TOTAL</td><td className="p-2 text-center">{grand}</td>{sums.map((v,i)=><td className="p-2 text-center" key={i}>{v}</td>)}</tr></tbody></table><p className="opacity-60 text-xs mt-3">Grand total invoice dihitung unik untuk seluruh store.</p></div>
<div className={`rounded-3xl border p-5 overflow-x-auto ${cardBg}`}><h3 className="text-xl font-bold mb-3">Riwayat Input</h3>{currentSalesId===ADMIN_ID&&<input type="password" placeholder="Admin password untuk hapus" value={engPassword} onChange={e=>setEngPassword(e.target.value)} className="p-2 rounded-xl text-gray-900 mb-3"/>}<table className="w-full text-sm"><thead><tr><th>Date</th><th>Staff</th><th>Category</th><th>Qty</th>{currentSalesId===ADMIN_ID&&<th>Action</th>}</tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t border-gray-500/20"><td className="p-2">{r.date}</td><td className="p-2">{r.salesName}</td><td className="p-2">{r.category}</td><td className="p-2 text-center">{r.qty}</td>{currentSalesId===ADMIN_ID&&<td className="p-2"><button className="text-rose-500" onClick={()=>void remove(r.id)}>Hapus</button></td>}</tr>)}</tbody></table></div>
</div>})()}
{/* EST. INCENTIVE V2 — finance-blue responsive dashboard, sourced from DATABASE R:V. */}
              {activeTab === "est-incentive" && (() => {
                const labels = ["Apple", "3rd Party", "Android", "Qoala", "Accessories"];
                const colors = ["#0B3D91", "#1266D6", "#3293E6", "#74B6EF", "#C3DFF8"];
                const sums = [0, 0, 0, 0, 0];
                const staffMap = new Map<string, { id: string; name: string; amounts: number[]; transactions: RawTransaction[] }>();
                activeTransactions.forEach(t => {
                  const key = t.salesId || t.salesName.toLowerCase();
                  if (!key) return;
                  if (!staffMap.has(key)) staffMap.set(key, { id: t.salesId, name: t.salesName, amounts: [0, 0, 0, 0, 0], transactions: [] });
                  const entry = staffMap.get(key)!;
                  entry.transactions.push(t);
                  t.incentives.forEach((v, i) => { entry.amounts[i] += v; sums[i] += v; });
                });
                const staff = [...staffMap.values()].map(v => ({ ...v, total: v.amounts.reduce((a, b) => a + b, 0) })).sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));
                const total = sums.reduce((a, b) => a + b, 0);
                const topIndex = sums.indexOf(Math.max(...sums));
                const maxStaff = Math.max(1, ...staff.map(v => v.total));
                const percent = (v: number, base = total) => base ? (100 * v / base).toFixed(1).replace(".", ",") + "%" : "0%";
                const donut = total ? "conic-gradient(" + sums.map((v, i) => {
                  const from = sums.slice(0, i).reduce((a, b) => a + b, 0) / total * 100;
                  return colors[i] + " " + from + "% " + (from + v / total * 100) + "%";
                }).join(",") + ")" : "conic-gradient(#e2e8f0 0% 100%)";
                const currentStaff = staff.find(v => (v.id || v.name) === expandedIncentiveStaff);
                const recommendations = [
                  { title: "Devices + Accessories", body: "Tawarkan case, charger, audio, atau aksesori kompatibel bersama perangkat.", index: 4 },
                  { title: "Devices + Qoala", body: "Jelaskan manfaat perlindungan dan persyaratannya; tawarkan hanya jika sesuai kebutuhan pelanggan.", index: 3 },
                  { title: "Apple / Android + 3rd Party", body: "Periksa produk pelengkap yang relevan, stok, dan nominal insentif tercatat.", index: 1 }
                ];
                return <div className="space-y-4 sm:space-y-6 text-slate-900">
                  <div className="rounded-3xl border border-blue-100 bg-white p-4 sm:p-6 dark:bg-slate-950 dark:border-blue-900/40 dark:text-white">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><div className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-600">Finance Blue · V2</div><h2 className="mt-1 text-2xl font-black tracking-tight">Est. Incentive</h2><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Executive Dashboard · Digiplus Grand Indonesia</p></div>
                      <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-bold text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Estimasi dari DATABASE R–V</span>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Periode: {periodType === "daily" ? selectedDate : periodType === "weekly" ? selectedWeek : selectedMonth} · {staff.length} staff terdata. Mengikuti filter periode global.</p>
                  </div>
                  <div className="rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 p-5 sm:p-7 text-white shadow-lg shadow-blue-900/10">
                    <p className="text-sm font-medium text-blue-100">Total Est. Incentive</p><div className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">{formatIDR(total)}</div>
                    <p className="mt-3 text-xs text-blue-100">Akumulasi insentif tercatat pada periode yang dipilih · bukan nominal payout final</p>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { title: "Top Incentive Staff", value: staff[0]?.name || "—", sub: staff[0] ? formatIDR(staff[0].total) : "Belum ada data" },
                      { title: "Active Staff", value: String(staff.length), sub: "Staff dengan transaksi" },
                      { title: "Top Category", value: total ? labels[topIndex] : "—", sub: total ? percent(sums[topIndex]) + " kontribusi" : "Belum ada insentif" }
                    ].map(item => <div key={item.title} className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/40 dark:bg-slate-950 dark:text-white"><p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{item.title}</p><div className="mt-2 text-lg sm:text-xl font-black break-words">{item.value}</div><p className="mt-1 text-xs text-blue-700 dark:text-blue-300">{item.sub}</p></div>)}
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    <section className="rounded-3xl border border-blue-100 bg-white p-4 sm:p-6 dark:border-blue-900/40 dark:bg-slate-950 dark:text-white">
                      <h3 className="font-bold text-base">Kontribusi Incentive per Kategori</h3>
                      <div className="mt-5 flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative h-48 w-48 shrink-0 rounded-full" style={{ background: donut }}><div className="absolute inset-8 flex flex-col items-center justify-center rounded-full bg-white dark:bg-slate-950"><strong className="text-sm">{formatIDR(total)}</strong><span className="text-[10px] text-slate-500">Total Incentive</span></div></div>
                        <div className="w-full space-y-3">{labels.map((name, i) => <div key={name} className="flex justify-between gap-3 text-xs"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: colors[i] }}/>{name}</span><span className="text-right"><b>{percent(sums[i])}</b><span className="block text-slate-500 dark:text-slate-400">{formatIDR(sums[i])}</span></span></div>)}</div>
                      </div>
                    </section>
                    <section className="rounded-3xl border border-blue-100 bg-white p-4 sm:p-6 dark:border-blue-900/40 dark:bg-slate-950 dark:text-white">
                      <div className="flex flex-wrap justify-between items-center gap-2"><h3 className="font-bold text-base">Perbandingan Incentive per Staff</h3><div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">{(["stacked","grouped"] as const).map(mode => <button key={mode} type="button" onClick={() => setIncentiveChartMode(mode)} className={"rounded-lg px-3 py-1.5 text-xs font-semibold " + (incentiveChartMode === mode ? "bg-blue-700 text-white" : "text-slate-600 dark:text-slate-300")}>{mode === "stacked" ? "Stacked" : "Grouped"}</button>)}</div></div>
                      <div className="mt-5 space-y-3 max-h-72 overflow-y-auto">{staff.length === 0 && <p className="text-sm text-slate-500">Tidak ada transaksi pada periode ini.</p>}{staff.map(v => <div key={v.id || v.name} className="grid grid-cols-[90px_1fr] sm:grid-cols-[120px_1fr] items-center gap-2 text-xs"><span className="truncate font-semibold" title={v.name}>{v.name}</span><div><div className="flex h-4 w-full overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800" style={incentiveChartMode === "grouped" ? { gap: "3px", background: "transparent" } : {}}>{v.amounts.map((amount, i) => <div key={i} title={labels[i] + ": " + formatIDR(amount)} style={{ width: (incentiveChartMode === "grouped" ? 20 : amount / maxStaff * 100) + "%", height: incentiveChartMode === "grouped" ? (amount / maxStaff * 100) + "%" : "100%", minHeight: incentiveChartMode === "grouped" && amount > 0 ? "3px" : undefined, backgroundColor: colors[i] }} className="rounded-sm" />)}</div><span className="text-[10px] text-slate-500 dark:text-slate-400">{formatIDR(v.total)}</span></div></div>)}</div>
                      <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2">{labels.map((name, i) => <span key={name} className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400"><i className="h-2 w-2 rounded-sm" style={{ backgroundColor: colors[i] }}/>{name}</span>)}</div>
                    </section>
                  </div>
                  <section className="rounded-3xl border border-blue-100 bg-white p-4 sm:p-6 dark:border-blue-900/40 dark:bg-slate-950 dark:text-white">
                    <h3 className="font-bold text-base">Ranking Est. Incentive per Staff</h3>
                    <div className="mt-4 space-y-2">{staff.map((v, index) => <button type="button" key={v.id || v.name} onClick={() => setExpandedIncentiveStaff(v.id || v.name)} className="flex w-full items-center gap-3 rounded-xl border border-blue-50 p-3 text-left hover:bg-blue-50/60 dark:border-blue-900/30 dark:hover:bg-blue-900/20"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-black text-blue-800 dark:bg-blue-900 dark:text-blue-100">{index + 1}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{v.name}</div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-blue-600" style={{ width: (v.total / maxStaff * 100) + "%" }}/></div></div><div className="text-right"><strong className="block text-xs sm:text-sm">{formatIDR(v.total)}</strong><span className="text-[10px] text-slate-500">{percent(v.total)}</span></div><span className="text-blue-600">›</span></button>)}{staff.length === 0 && <p className="text-sm text-slate-500">Tidak ada data staff.</p>}</div>
                  </section>
                  <section className="rounded-3xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-white">
                    <h3 className="font-bold text-base">Tips & Trick · Incentive Booster</h3><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Rekomendasi kombinasi produk, bukan jaminan tambahan insentif. Pastikan kecocokan, kebutuhan pelanggan, dan program yang berlaku.</p>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">{recommendations.map(rec => <div key={rec.title} className="rounded-2xl border border-blue-100 bg-white p-4 dark:border-blue-900/40 dark:bg-slate-950"><h4 className="text-sm font-bold">{rec.title}</h4><p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{rec.body}</p><p className="mt-3 text-xs font-bold text-blue-700 dark:text-blue-300">Insentif kategori tercatat: {formatIDR(sums[rec.index])}</p></div>)}</div>
                  </section>
                  {currentStaff && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" role="presentation" onClick={() => setExpandedIncentiveStaff(null)}>
                    <section role="dialog" aria-modal="true" aria-label={"Detail incentive " + currentStaff.name} onClick={e => e.stopPropagation()} className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 sm:p-7 text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-white">
                      <div className="flex justify-between gap-3"><div><h3 className="text-xl font-black">{currentStaff.name}</h3><p className="text-xs text-slate-500">Detail Est. Incentive · {currentStaff.id || "Sales ID tidak tersedia"}</p></div><button type="button" aria-label="Tutup detail" onClick={() => setExpandedIncentiveStaff(null)} className="rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800">✕</button></div>
                      <div className="mt-4 rounded-2xl bg-blue-800 p-4 text-white"><p className="text-xs text-blue-100">Total Est. Incentive</p><strong className="text-2xl">{formatIDR(currentStaff.total)}</strong></div>
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">{labels.map((name, i) => <div key={name} className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/40"><p className="text-[10px] text-slate-500">{name}</p><strong className="text-xs">{formatIDR(currentStaff.amounts[i])}</strong></div>)}</div>
                      <h4 className="mt-5 font-bold">Rincian Transaksi</h4><div className="mt-2 overflow-x-auto"><table className="w-full min-w-[650px] text-xs"><thead><tr className="border-b text-left">{["Tanggal","Invoice","Produk","Qty",...labels].map(v => <th key={v} className="p-2">{v}</th>)}</tr></thead><tbody>{currentStaff.transactions.map((t, i) => <tr key={t.invoice + t.sapArticle + i} className="border-b border-slate-100 dark:border-slate-800"><td className="p-2">{t.isoDate}</td><td className="p-2">{t.invoice}</td><td className="p-2">{t.productName}</td><td className="p-2">{t.qty}</td>{t.incentives.map((v, j) => <td key={j} className="p-2 whitespace-nowrap">{formatIDR(v)}</td>)}</tr>)}</tbody></table></div>
                    </section>
                  </div>}
                </div>;
              })()}

              {/* TAB: MoM GROWTH ANALYSIS */}
              {activeTab === "mom-comparison" && renderComparisonSection(momAnalytics)}

              {/* TAB 3: STAFF PERFORMANCE */}
              {activeTab === "staff-performance" && (
                <div className="space-y-8">{periodType==="weekly"&&<div className={`p-3 rounded-2xl border ${cardBg} flex flex-wrap gap-2 items-center`}><strong className="text-xs">Week Minggu–Sabtu:</strong>{staffCalendarWeeks.map((w,i)=><button key={w.label} type="button" onClick={()=>setCalendarWeekIndex(i)} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${calendarWeekIndex===i?"bg-sky-600 text-white":"bg-slate-500/10 text-slate-800 dark:text-slate-100"}`}>{w.label} · {w.start.slice(5)}–{w.end.slice(5)}</button>)}</div>}
                  {(() => {
                    const st = staffList.find(x => x.salesId === selectedStaffId) || staffList[0];
                    if (!st) return null;
                    const rows = staffPeriodTransactions.filter(t => t.salesId === st.salesId);
                    const sum = (items: RawTransaction[]) => ({qty:items.reduce((n,t)=>n+(Number(t.qty)||0),0),amount:items.reduce((n,t)=>n+(Number(t.amount)||0),0)});
                    const apple = rows.filter(t=>t.brand==="APPLE" && t.groupCategory==="DEVICES");
                    const android = rows.filter(t=>t.groupCategory==="DEVICES" && ["SAMSUNG","OPPO","HUAWEI","XIAOMI","REDMI","MOTOROLA","INFINIX"].includes(t.brand));
                    const accessories = rows.filter(t=>t.groupCategory==="ACCESSORIES");
                    const vas = rows.filter(t=>t.groupCategory==="VAS");
                    const name = (t:RawTransaction)=>(t.productName||"").toUpperCase();
                    const groups = [
                      {title:"Apple Devices",items:apple,sub:[["iPhone",apple.filter(t=>name(t).includes("IPHONE"))],["iPad",apple.filter(t=>name(t).includes("IPAD"))],["MacBook",apple.filter(t=>name(t).includes("MAC"))],["Apple Watch",apple.filter(t=>name(t).includes("WATCH"))],["AirPods",apple.filter(t=>name(t).includes("AIRPOD"))]] as [string,RawTransaction[]][]},
                      {title:"Android Devices",items:android,sub:["SAMSUNG","OPPO","HUAWEI","XIAOMI","MOTOROLA","INFINIX"].map(b=>[b,android.filter(t=>t.brand===b || (b==="XIAOMI" && t.brand==="REDMI"))] as [string,RawTransaction[]])},
                      {title:"Accessories",items:accessories,sub:[...new Set(accessories.map(t=>t.supplier||"Supplier Tidak Diketahui"))].map(b=>[b,accessories.filter(t=>(t.supplier||"Supplier Tidak Diketahui")===b)] as [string,RawTransaction[]])},
                      {title:"VAS",items:vas,sub:["QOALA","TELKOMSEL","INDOSAT","XL"].map(b=>[b,vas.filter(t=>t.brand===b || name(t).includes(b))] as [string,RawTransaction[]])}
                    ];
                    
                    // Target matched by exact normalized staff name; missing names have target zero.
                    const normalizedStaffKey = st.name.toLowerCase().normalize("NFKC").replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
                    const categoryTarget = selectedMonth===targetSheetMonth ? (staffCategoryTargets[normalizedStaffKey] || {}) : {};
                    const targetFor = (category:string):number => {
                      const value=Number(categoryTarget[category])||0;
                      if(periodType==="monthly")return value;
                      const monthIndex=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"].findIndex(m=>selectedMonth.toLowerCase().startsWith(m.toLowerCase()));
                      const year=Number(selectedMonth.slice(-4));
                      const days=monthIndex>=0&&Number.isFinite(year)?new Date(year,monthIndex+1,0).getDate():30;
                      if(periodType==="daily")return Math.round(value/days);
                      if(periodType==="weekly"){
                        const week=staffSelectedWeek;
                        const dates=week?[week.start,week.end]:[];
                        const count=dates.length>=2?Math.max(1,Math.min(7,Math.round((Date.parse(dates[1]+"T00:00:00Z")-Date.parse(dates[0]+"T00:00:00Z"))/86400000)+1)):7;
                        return Math.round(value/days*(week?.monthDays||count));
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
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-lg text-slate-950 dark:text-white">Target Vs Achievement Per Staff</h2><p className={`text-xs ${textMuted}`}>#{st.rank} · {st.name} · {periodType.toUpperCase()} · {periodType==="daily"?selectedDate:periodType==="weekly"?(staffSelectedWeek?.label+" · "+staffSelectedWeek?.start+" – "+staffSelectedWeek?.end):selectedMonth}</p></div><button type="button" onClick={()=>handleShareStaffWA({...st,targetAmount:targetFor("total"),achvPct:targetFor("total")>0?Number((st.totalAmount/targetFor("total")*100).toFixed(1)):0},rows)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">↗ Share WhatsApp</button></div>
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
                          Periode: {periodType.toUpperCase()} ({periodType === "daily" ? selectedDate : periodType === "weekly" ? (staffSelectedWeek?.label+" · "+staffSelectedWeek?.start+" – "+staffSelectedWeek?.end) : selectedMonth})
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

                          <div className={`grid grid-cols-4 gap-2 py-3 px-2 rounded-2xl border ${
                            isDark ? "bg-slate-900/60 border-slate-700/80" : "bg-slate-100/90 border-slate-300 shadow-inner"
                          }`}>
                            <div className="text-center">
                              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">UPT</span>
                              <strong className="text-xs sm:text-sm font-black font-mono block mt-1 text-blue-700 dark:text-sky-400">
                                {st.upt}
                              </strong>
                            </div>
                            <div className={`text-center border-x ${isDark ? "border-slate-700" : "border-slate-300"}`}>
                              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">UNIT</span>
                              <strong className="text-xs sm:text-sm font-black font-mono block mt-1 text-slate-900 dark:text-slate-100">
                                {st.qty}
                              </strong>
                            </div>
                            <div className="text-center">
                              <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">INVOICE</span>
                              <strong className="text-xs sm:text-sm font-black font-mono block mt-1 text-slate-950 dark:text-white">
                                {st.trxCount || 0}
                              </strong>
                            </div>
                            <div className="text-center"><span className="text-[10px] font-black uppercase tracking-wider block text-slate-500 dark:text-slate-400">ATV</span><strong className="text-xs sm:text-sm font-black font-mono block mt-1 text-slate-900 dark:text-slate-100">{formatCompactIDR(st.atv)}</strong></div>
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
                    const availableStaffNames = Object.keys(staffDailyTargets).filter(name => !name.includes("admin") && !name.includes("leader"));
                    
                    const activeName = selectedDailyStaff || availableStaffNames[0] || "";

                    const targetData: StaffDailyTargetDetail = (targetSheetMonth===selectedMonth ? staffDailyTargets[activeName] : undefined) || {
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
              {/* TAB: BRAND FOCUS (20 SELECTED ACCESSORIES BRANDS) */}
              {/* ========================================================= */}
              {activeTab === "brand-focus" && (() => {
                const TARGET_SUPPLIERS = ["AVANA","INCASE","INCIPIO","ITSKIN","RIVERCASE","TUCANO","UAG","IFROGZ","ZAAG","MUTUALL","KRATOS","VERBATIM","MEDPOIN","FLAUNT","CARE","KATE SPADE","IBACKS","KAIZEN","RAPTIC"];
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
                          Data penjualan supplier: AVANA, INCASE, INCIPIO, ITSKIN, RIVERCASE, TUCANO, UAG, IFROGZ, ZAG, MUTUALL, KRATOS, VERBATIM, MEDPOIN, ARC PULSE, FLAUNT, CARE, KATE SPADE, IBACKS, KAIZEN, RAPTIC (Filter: {periodType.toUpperCase()})
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
                    {currentFilteredTrx.length > 0 && TARGET_SUPPLIERS.every(s => supplierDataMap[s].items.length === 0) && <div className={`p-4 rounded-xl border ${innerBg} text-sm text-amber-600`}>Tidak ditemukan transaksi Accessories untuk supplier Brand Focus pada periode ini. Periksa kolom P (Supplier) atau kolom K (Brand Name) di DATABASE.</div>}
                    {/* CUPCARDS */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
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
                                      {(expandedSupplierDetails[sup] ? s.items : s.items.slice(0,3)).map((item, itemIdx) => (
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
                                  {s.items.length>3 && (
                                    <button type="button" onClick={()=>setExpandedSupplierDetails(prev=>({...prev,[sup]:!prev[sup]}))} className="w-full py-3 text-sm font-bold text-sky-600 hover:underline">
                                      {expandedSupplierDetails[sup]?"Show Less":"Show More ("+(s.items.length-3)+" transaksi lainnya)"}
                                    </button>
                                  )}
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <button type="button" onClick={handleShareBnplWhatsApp} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black">📲 Share WhatsApp</button>
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
                    <div className="space-y-4 pt-3">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">📋 Rincian Transaksi per Tender BNPL — {selectedMonth}</h3>
                      {bnplSummary.tenders.length===0 && <p className="text-sm text-slate-500">Tidak ada transaksi BNPL pada periode terpilih.</p>}
                      {bnplSummary.tenders.map(td=>(
                        <div key={td.tender} className={`rounded-2xl border ${innerBg} p-3 space-y-3`}>
                          <div className="flex justify-between items-center gap-3 flex-wrap">
                            <div><strong className="text-slate-900 dark:text-white">{td.tender}</strong><p className="text-xs text-slate-500">{td.qty} Qty · {formatIDR(td.amount)}</p></div>
                            <button type="button" onClick={()=>setExpandedBnplTenders(prev=>({...prev,[td.tender]:!prev[td.tender]}))} className="text-xs font-bold text-sky-600">{expandedBnplTenders[td.tender]?"Show Less":"Show More ("+td.records.length+" transaksi)"}</button>
                          </div>
                          {expandedBnplTenders[td.tender] && <div className="overflow-x-auto">
                            <table className="w-full min-w-[700px] text-xs text-left">
                              <thead><tr className="border-b"><th className="p-2">Date</th><th className="p-2">Invoice</th><th className="p-2">Qty</th><th className="p-2 text-right">Amount Tender</th><th className="p-2">Description Product</th></tr></thead>
                              <tbody>{td.records.map((rec,i)=><tr key={i} className="border-b border-slate-200/20"><td className="p-2">{rec.date}</td><td className="p-2">{rec.invoice}</td><td className="p-2">{rec.qty}</td><td className="p-2 text-right">{formatIDR(rec.amount)}</td><td className="p-2">{rec.product||"-"}</td></tr>)}</tbody>
                            </table>
                          </div>}
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
        className={`lg:hidden fixed bottom-[calc(env(safe-area-inset-bottom)+12px)] left-3 z-40 w-11 h-11 rounded-full flex items-center justify-center border backdrop-blur-md active:scale-95 focus-visible:opacity-100 hover:opacity-100 transition-all duration-300 print:hidden ${isMobileScrolled ? "bg-slate-200/50 dark:bg-white/15 text-slate-500 dark:text-slate-300 border-slate-300/30 dark:border-white/10 opacity-30 shadow-none" : "bg-slate-900 dark:bg-sky-500 text-white border-slate-700 dark:border-sky-400/30 opacity-100 shadow-lg shadow-slate-900/20 dark:shadow-sky-500/25"}`}
        aria-label="Buka Menu Navigasi"
      >
        <span className="text-lg leading-none" aria-hidden="true">☰</span>
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
