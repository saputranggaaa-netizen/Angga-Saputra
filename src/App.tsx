'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  Calendar,
  Users,
  CreditCard,
  MessageSquare,
  Search,
  Share2,
  FileDown,
  RefreshCw,
  Sun,
  Moon,
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldAlert,
  Smartphone,
  Headphones,
  ShieldCheck,
  XCircle,
  Printer,
  Edit3,
  Check,
  Send,
  MessageCircle
} from 'lucide-react';

// ==========================================
// 1. DATA CONTRACTS & INTERFACES
// ==========================================
export interface RawTxRow {
  rowId: string;
  salesId: string;
  salesName: string;
  invoiceNo: string;
  article: string;
  description: string;
  qty: number;
  amount: number;
  transDate: string; // YYYY-MM-DD
  brandName: string;
  categoryRaw: string;
  weekName: string;
}

export interface RawBnplRow {
  transDate: string;
  invoiceNo: string;
  product: string;
  qty: number;
  amount: number;
  tender: string;
}

export interface RawTargetRow {
  salesId: string;
  salesName: string;
  role: string;
  targetMonthly: number;
  dailyCatchUpTarget: number;
}

export interface FeedbackItem {   id: string;   salesName: string;   role?: string;   sentiment?: 'Luar Biasa' | 'Cukup Baik' | 'Perlu Ditingkatkan';   timestamp: string;   text: string;   isEdited?: boolean;   reactions: {     like: number;     heart: number;     fire: number;     dislike: number;     sad: number;   }; } {
  id: string;
  salesName: string;
  timestamp: string;
  text: string;
  isEdited?: boolean;
  reactions: {
    like: number;
    heart: number;
    fire: number;
    dislike: number;
    sad: number;
  };
}

export interface ShiftSchedule {
  salesId: string;
  salesName: string;
  role: string;
  shifts: { [dayKey: string]: string };
}

// ==========================================
// 2. KONFIGURASI SPREADSHEET & GID
// ==========================================
const SPREADSHEET_ID = '1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM';
const GID_DATABASE = '602901290';
const GID_BNPL = '2697970';
const GID_DAILY_TARGET = '789142551';
const ADMIN_SALES_ID = '22008089';

const DAYS_OF_WEEK = [
  { key: 'senin', label: 'Senin', date: '20 Okt' },
  { key: 'selasa', label: 'Selasa', date: '21 Okt' },
  { key: 'rabu', label: 'Rabu', date: '22 Okt' },
  { key: 'kamis', label: 'Kamis', date: '23 Okt' },
  { key: 'jumat', label: 'Jumat', date: '24 Okt' },
  { key: 'sabtu', label: 'Sabtu', date: '25 Okt' },
  { key: 'minggu', label: 'Minggu', date: '26 Okt' }
];

const INITIAL_STAFF_SCHEDULE: ShiftSchedule[] = [
  { salesId: '22008089', salesName: 'Angga', role: 'Store Leader', shifts: { senin: 'D047', selasa: 'D047', rabu: 'D047', kamis: 'D047', jumat: 'D047', sabtu: 'D103', minggu: 'OFF' } },
  { salesId: '22008090', salesName: 'Liesbeth', role: 'Cashier Leader', shifts: { senin: 'D047', selasa: 'D047', rabu: 'D103', kamis: 'OFF', jumat: 'D103', sabtu: 'D103', minggu: 'D047' } },
  { salesId: '22008091', salesName: 'Yunita', role: 'Senior Sales', shifts: { senin: 'D103', selasa: 'D103', rabu: 'OFF', kamis: 'D047', jumat: 'D047', sabtu: 'D047', minggu: 'D103' } },
  { salesId: '22008092', salesName: 'Surya', role: 'Sales Consultant', shifts: { senin: 'OFF', selasa: 'D047', rabu: 'D047', kamis: 'D103', jumat: 'D103', sabtu: 'D047', minggu: 'D047' } },
  { salesId: '22008093', salesName: 'Amel', role: 'Sales Consultant', shifts: { senin: 'D047', selasa: 'OFF', rabu: 'D103', kamis: 'D103', jumat: 'D047', sabtu: 'D103', minggu: 'D103' } },
  { salesId: '22008094', salesName: 'Adli', role: 'Sales Consultant', shifts: { senin: 'D103', selasa: 'D103', rabu: 'D047', kamis: 'OFF', jumat: 'D103', sabtu: 'D047', minggu: 'D047' } },
  { salesId: '22008095', salesName: 'Andrian', role: 'Sales Consultant', shifts: { senin: 'D047', selasa: 'D047', rabu: 'D103', kamis: 'D103', jumat: 'OFF', sabtu: 'D103', minggu: 'D047' } },
  { salesId: '22008096', salesName: 'Bagas', role: 'Sales Consultant', shifts: { senin: 'D103', selasa: 'D103', rabu: 'OFF', kamis: 'D047', jumat: 'D047', sabtu: 'D047', minggu: 'D103' } },
  { salesId: '22008097', salesName: 'Bimo', role: 'Sales Consultant', shifts: { senin: 'OFF', selasa: 'D047', rabu: 'D047', kamis: 'D103', jumat: 'D103', sabtu: 'D103', minggu: 'D047' } },
  { salesId: '22008098', salesName: 'Dimas', role: 'Sales Consultant', shifts: { senin: 'D047', selasa: 'OFF', rabu: 'D047', kamis: 'D047', jumat: 'D103', sabtu: 'D103', minggu: 'D103' } },
  { salesId: '22008099', salesName: 'Amzahri', role: 'Sales Consultant', shifts: { senin: 'D103', selasa: 'D103', rabu: 'D047', kamis: 'OFF', jumat: 'D047', sabtu: 'D047', minggu: 'D103' } }
];

// ==========================================
// 3. UTILITY FORMATTERS & GViz PARSERS
// ==========================================
function formatIDR(val: number): string {
  if (isNaN(val)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);
}

function formatCompactIDR(val: number): string {
  if (isNaN(val)) return 'Rp 0';
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
  }
  if (abs >= 1_000_000) {
    return `Rp ${(val / 1_000_000).toFixed(1)} Jt`;
  }
  if (abs >= 1_000) {
    return `Rp ${(val / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${val}`;
}

function parseGVizCell(cell: any): string {
  if (!cell) return '';
  if (cell.v !== undefined && cell.v !== null) return String(cell.v).trim();
  if (cell.f !== undefined && cell.f !== null) return String(cell.f).trim();
  return '';
}

function parseNormalizedDate(str: string): string {
  if (!str) return '';
  if (str.startsWith('Date(')) {
    const parts = str.replace('Date(', '').replace(')', '').split(',');
    if (parts.length >= 3) {
      const y = parseInt(parts[0], 10);
      const m = String(parseInt(parts[1], 10) + 1).padStart(2, '0');
      const d = String(parseInt(parts[2], 10)).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }
  if (str.includes('/')) {
    const p = str.split('/');
    if (p.length === 3) {
      const year = p[2].length === 2 ? `20${p[2]}` : p[2];
      return `${year}-${p[1].padStart(2, '0')}-${p[0].padStart(2, '0')}`;
    }
  }
  if (str.includes('-')) {
    const p = str.split('-');
    if (p.length === 3 && p[0].length === 4) {
      return `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`;
    }
  }
  return str;
}

function classifyProduct(brand: string, catRaw: string, desc: string): 'Apple Devices' | 'Android Devices' | 'Accessories' | 'VAS' {
  const b = (brand || '').toUpperCase();
  const c = (catRaw || '').toUpperCase();
  const d = (desc || '').toUpperCase();

  if (d.includes('QOALA') || d.includes('TELKOMSEL') || d.includes('INDOSAT') || d.includes('XL') || c === 'VAS') {
    return 'VAS';
  }

  if (b.includes('APPLE')) {
    if (
      c.includes('DEVICE') ||
      d.includes('IPHONE') ||
      d.includes('IPAD') ||
      d.includes('MACBOOK') ||
      d.includes('WATCH') ||
      d.includes('AIRPOD')
    ) {
      return 'Apple Devices';
    }
    return 'Accessories';
  }

  const isAndroidBrand =
    b.includes('SAMSUNG') ||
    b.includes('XIAOMI') ||
    b.includes('REDMI') ||
    b.includes('OPPO') ||
    b.includes('VIVO') ||
    b.includes('HUAWEI') ||
    b.includes('INFINIX') ||
    b.includes('MOTOROLA') ||
    b.includes('REALME');

  if (c.includes('DEVICE') || isAndroidBrand) {
    if (c.includes('ACCESS') || d.includes('CASE') || d.includes('ADAPTER') || d.includes('CABLE') || d.includes('TEMPERED')) {
      return 'Accessories';
    }
    return 'Android Devices';
  }

  return 'Accessories';
}

// ==========================================
// 4. MAIN PAGE COMPONENT
// ==========================================
export default function StoreOperationsPage() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'staff' | 'bnpl' | 'schedule' | 'feedback' | 'search' | 'admin'>('overview');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Filter Bar
  const [filterMode, setFilterMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-26');

  // Login & State
  const [loggedInSalesId] = useState<string>('22008089');
  const [transactions, setTransactions] = useState<RawTxRow[]>([]);
  const [bnplRecords, setBnplRecords] = useState<RawBnplRow[]>([]);
  const [dailyTargetCatchUp, setDailyTargetCatchUp] = useState<RawTargetRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<string>('');

  // UI Interactive States
  const [bottomSheetData, setBottomSheetData] = useState<{ title: string; content: React.ReactNode } | null>(null);
  const [bnplActiveTender, setBnplActiveTender] = useState<string>('ALL');
  const [scheduleState, setScheduleState] = useState<ShiftSchedule[]>(INITIAL_STAFF_SCHEDULE);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Feedback State
  // State feedbacks dengan sinkronisasi otomatis ke localStorage agar tidak hilang const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {   if (typeof window !== 'undefined') {     const saved = localStorage.getItem('store_feedbacks_qf01');     if (saved) {       try {         return JSON.parse(saved);       } catch (e) {         console.error('Gagal membaca storage', e);       }     }   }   return [     {       id: 'fb-1',       salesName: 'Liesbeth Febrina',       role: 'Sales Specialist',       sentiment: 'Luar Biasa',       timestamp: 'Hari ini, 16:15 WIB',       text: 'Hari ini hanya menjual iPad.',       isEdited: false,       reactions: { like: 0, heart: 0, fire: 0, dislike: 0, sad: 0 }     },     {       id: 'fb-2',       salesName: 'Liesbeth Febrina',       role: 'Cashier Leader',       sentiment: 'Luar Biasa',       timestamp: 'Hari ini, 15:20 WIB',       text: 'Pelayanan sangat cepat dan ramah saat transaksi iPhone 17 Pro Max. Penjelasan proteksi garansi Qoala Diamond sangat jelas sehingga customer langsung setuju ambil proteksi 2 tahun.',       isEdited: false,       reactions: { like: 8, heart: 5, fire: 6, dislike: 0, sad: 0 }     },     {       id: 'fb-3',       salesName: 'Yunita Anggraini',       role: 'Cashier',       sentiment: 'Luar Biasa',       timestamp: 'Hari ini, 14:10 WIB',       text: 'Customer Galaxy S26 Ultra dipandu proses trade-in handphone lama dengan lancar. Tambahan bundling casing magnetik dan charger adapter berhasil di-closing.',       isEdited: false,       reactions: { like: 7, heart: 3, fire: 4, dislike: 0, sad: 0 }     },     {       id: 'fb-4',       salesName: 'Surya Adi Permana',       role: 'Sales Assistant',       sentiment: 'Cukup Baik',       timestamp: 'Hari ini, 13:05 WIB',       text: 'Perlu lebih mendalami fitur perbandingan tablet Android dan iPad saat customer bertanya detail spesifikasi. Namun attitude pelayanan tetap sopan dan sabar.',       isEdited: false,       reactions: { like: 3, heart: 1, fire: 1, dislike: 0, sad: 1 }     }   ]; });  // Simpan permanen ke localStorage setiap ada perubahan (tambah, edit, reaksi) useEffect(() => {   if (typeof window !== 'undefined') {     localStorage.setItem('store_feedbacks_qf01', JSON.stringify(feedbacks));   } }, [feedbacks]);  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>('ALL'); const [feedbackInputName, setFeedbackInputName] = useState<string>(''); const [feedbackInputRole, setFeedbackInputRole] = useState<string>('Sales Consultant'); const [feedbackInputSentiment, setFeedbackInputSentiment] = useState<'Luar Biasa' | 'Cukup Baik' | 'Perlu Ditingkatkan'>('Luar Biasa'); const [feedbackInputText, setFeedbackInputText] = useState<string>(''); const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null); const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);  const filteredFeedbacks = useMemo(() => {   if (selectedStaffFilter === 'ALL') return feedbacks;   return feedbacks.filter((fb) => fb.salesName === selectedStaffFilter); }, [feedbacks, selectedStaffFilter]);<FeedbackItem[]>([
    {
      id: 'fb-1',
      salesName: 'Angga Saputra',
      timestamp: '26 Okt 2026, 15:30 WIB',
      text: 'Stok iPhone 18 Pro Max 256GB Desert Titanium habis sore ini. Trafik sangat tinggi di counter aksesoris Belkin.',
      isEdited: false,
      reactions: { like: 8, heart: 5, fire: 12, dislike: 0, sad: 1 }
    },
    {
      id: 'fb-2',
      salesName: 'Yunita',
      timestamp: '26 Okt 2026, 14:15 WIB',
      text: 'Banyak konsumen menanyakan promo cicilan 0% Home Credit & Kredivo untuk Samsung Galaxy Z Fold 8.',
      isEdited: false,
      reactions: { like: 4, heart: 2, fire: 6, dislike: 0, sad: 0 }
    }
  ]);
  const [feedbackInputName, setFeedbackInputName] = useState<string>('');
  const [feedbackInputText, setFeedbackInputText] = useState<string>('');
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ------------------------------------------
  // LIVE FETCHING DARI GVIZ
  // ------------------------------------------
  const fetchAllSpreadsheetData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Fetch DATABASE (gid=602901290)
      const urlDb = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_DATABASE}`;
      const resDb = await fetch(urlDb);
      const textDb = await resDb.text();
      const jsonDb = JSON.parse(textDb.substring(textDb.indexOf('{'), textDb.lastIndexOf('}') + 1));

      const parsedTx: RawTxRow[] = [];
      const rows = jsonDb.table.rows || [];
      rows.forEach((r: any, idx: number) => {
        const c = r.c;
        if (!c || c.length < 5) return;
        const salesId = parseGVizCell(c[1]);
        const salesName = parseGVizCell(c[2]);
        const invoiceNo = parseGVizCell(c[3]);
        const article = parseGVizCell(c[4]);
        const description = parseGVizCell(c[5]);
        const qty = parseFloat(parseGVizCell(c[6])) || 1;
        const amount = parseFloat(parseGVizCell(c[7])) || 0;
        const transDate = parseNormalizedDate(parseGVizCell(c[9]));
        const brandName = parseGVizCell(c[10]);
        const categoryRaw = parseGVizCell(c[11]);
        const weekName = parseGVizCell(c[14]) || 'Week 1';

        if (salesName && amount > 0) {
          parsedTx.push({
            rowId: `tx-${idx}`,
            salesId,
            salesName,
            invoiceNo,
            article,
            description,
            qty,
            amount,
            transDate,
            brandName,
            categoryRaw,
            weekName
          });
        }
      });
      setTransactions(parsedTx);

      // 2. Fetch BNPL DATABASE (gid=2697970)
      const urlBnpl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_BNPL}`;
      const resBnpl = await fetch(urlBnpl);
      const textBnpl = await resBnpl.text();
      const jsonBnpl = JSON.parse(textBnpl.substring(textBnpl.indexOf('{'), textBnpl.lastIndexOf('}') + 1));

      const parsedBnpl: RawBnplRow[] = [];
      const bnplRows = jsonBnpl.table.rows || [];
      bnplRows.forEach((r: any) => {
        const c = r.c;
        if (!c) return;
        const transDate = parseNormalizedDate(parseGVizCell(c[0]));
        const invoiceNo = parseGVizCell(c[1]);
        const product = parseGVizCell(c[2]);
        const qty = parseFloat(parseGVizCell(c[3])) || 1;
        const amount = parseFloat(parseGVizCell(c[4])) || 0;
        const tender = parseGVizCell(c[5]) || 'Other';

        if (amount > 0) {
          parsedBnpl.push({ transDate, invoiceNo, product, qty, amount, tender });
        }
      });
      setBnplRecords(parsedBnpl);

      // 3. Fetch DAILY TARGET CATCH UP (gid=789142551)
      const urlTarget = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_DAILY_TARGET}`;
      const resTarget = await fetch(urlTarget);
      const textTarget = await resTarget.text();
      const jsonTarget = JSON.parse(textTarget.substring(textTarget.indexOf('{'), textTarget.lastIndexOf('}') + 1));

      const parsedTarget: RawTargetRow[] = [];
      const tRows = jsonTarget.table.rows || [];
      tRows.forEach((r: any) => {
        const c = r.c;
        if (!c) return;
        const sId = parseGVizCell(c[0]);
        const sName = parseGVizCell(c[1]);
        const role = parseGVizCell(c[2]);
        const targetMonthly = parseFloat(parseGVizCell(c[3])) || 0;
        const dailyCatchUpTarget = parseFloat(parseGVizCell(c[7])) || 0; // Kolom H (Index 7)

        if (sName) {
          parsedTarget.push({
            salesId: sId,
            salesName: sName,
            role,
            targetMonthly,
            dailyCatchUpTarget
          });
        }
      });
      setDailyTargetCatchUp(parsedTarget);
      setLastSync(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('GViz Fetching Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllSpreadsheetData();
  }, [fetchAllSpreadsheetData]);

  // Sapaan Staf Login
  const loggedInStaffName = useMemo(() => {
    const found = transactions.find((t) => t.salesId === loggedInSalesId);
    if (found) return found.salesName;
    const fromTarget = dailyTargetCatchUp.find((t) => t.salesId === loggedInSalesId);
    return fromTarget ? fromTarget.salesName : 'Angga Saputra';
  }, [loggedInSalesId, transactions, dailyTargetCatchUp]);

  // Deteksi Otomatis Minggu Kolom O
  const dynamicWeeks = useMemo(() => {
    const map = new Map<string, { name: string; minDate: string; maxDate: string }>();
    transactions.forEach((t) => {
      const w = t.weekName || 'Week 1';
      if (!map.has(w)) {
        map.set(w, { name: w, minDate: t.transDate, maxDate: t.transDate });
      } else {
        const item = map.get(w)!;
        if (t.transDate && (!item.minDate || t.transDate < item.minDate)) item.minDate = t.transDate;
        if (t.transDate && (!item.maxDate || t.transDate > item.maxDate)) item.maxDate = t.transDate;
      }
    });
    return Array.from(map.values());
  }, [transactions]);

  // Penyaringan Periode Aktif
  const filteredTransactions = useMemo(() => {
    if (filterMode === 'daily') {
      return transactions.filter((t) => t.transDate === selectedDate);
    }
    if (filterMode === 'weekly') {
      if (selectedWeek === 'ALL') return transactions;
      return transactions.filter((t) => t.weekName === selectedWeek);
    }
    return transactions.filter((t) => t.transDate.startsWith('2026-10') || !t.transDate);
  }, [transactions, filterMode, selectedDate, selectedWeek]);

  // Kalkulasi Metrik Utama Toko
  const storeMetrics = useMemo(() => {
    const totalTarget = 8_728_667_173;
    const dayOfMonth = 24;
    const totalDaysInMonth = 31;
    const timeGonePercent = (dayOfMonth / totalDaysInMonth) * 100;
    const remainingDays = totalDaysInMonth - dayOfMonth;

    let appleActual = 0;
    let androidActual = 0;
    let accActual = 0;
    let vasActual = 0;
    let totalActual = 0;

    const invoices = new Set<string>();
    let totalUnits = 0;

    filteredTransactions.forEach((tx) => {
      totalActual += tx.amount;
      totalUnits += tx.qty;
      if (tx.invoiceNo) invoices.add(tx.invoiceNo);

      const cat = classifyProduct(tx.brandName, tx.categoryRaw, tx.description);
      if (cat === 'Apple Devices') appleActual += tx.amount;
      else if (cat === 'Android Devices') androidActual += tx.amount;
      else if (cat === 'Accessories') accActual += tx.amount;
      else if (cat === 'VAS') vasActual += tx.amount;
    });

    const totalInvoices = invoices.size || 1;
    const overallUpt = totalUnits / totalInvoices;
    const overallGap = totalTarget - totalActual;
    const overallAch = totalTarget > 0 ? (totalActual / totalTarget) * 100 : 0;
    const requiredRunRateDaily = remainingDays > 0 ? Math.max(0, overallGap / remainingDays) : 0;

    return {
      totalTarget,
      totalActual,
      overallAch,
      overallGap,
      timeGonePercent,
      remainingDays,
      requiredRunRateDaily,
      totalInvoices,
      totalUnits,
      overallUpt,
      categories: {
        apple: { target: 4_364_333_586, actual: appleActual },
        android: { target: 2_618_600_152, actual: androidActual },
        acc: { target: 1_309_300_076, actual: accActual },
        vas: { target: 436_433_359, actual: vasActual }
      }
    };
  }, [filteredTransactions]);

  // Leaderboard Staff
  const staffLeaderboard = useMemo(() => {
    const map = new Map<
      string,
      {
        salesId: string;
        salesName: string;
        appleRev: number;
        androidRev: number;
        accRev: number;
        vasRev: number;
        totalRev: number;
        totalUnits: number;
        invoices: Set<string>;
      }
    >();

    filteredTransactions.forEach((tx) => {
      const key = tx.salesName || tx.salesId;
      if (!map.has(key)) {
        map.set(key, {
          salesId: tx.salesId,
          salesName: tx.salesName,
          appleRev: 0,
          androidRev: 0,
          accRev: 0,
          vasRev: 0,
          totalRev: 0,
          totalUnits: 0,
          invoices: new Set<string>()
        });
      }
      const item = map.get(key)!;
      item.totalRev += tx.amount;
      item.totalUnits += tx.qty;
      if (tx.invoiceNo) item.invoices.add(tx.invoiceNo);

      const cat = classifyProduct(tx.brandName, tx.categoryRaw, tx.description);
      if (cat === 'Apple Devices') item.appleRev += tx.amount;
      else if (cat === 'Android Devices') item.androidRev += tx.amount;
      else if (cat === 'Accessories') item.accRev += tx.amount;
      else if (cat === 'VAS') item.vasRev += tx.amount;
    });

    return Array.from(map.values())
      .map((staf) => {
        const invCount = staf.invoices.size || 1;
        const upt = staf.totalUnits / invCount;
        const targetRow = dailyTargetCatchUp.find((t) => t.salesId === staf.salesId || t.salesName.toLowerCase() === staf.salesName.toLowerCase());
        const target = targetRow?.targetMonthly || 793_000_000;
        const ach = target > 0 ? (staf.totalRev / target) * 100 : 0;
        const catchUpTarget = targetRow?.dailyCatchUpTarget || Math.round(target / 31);

        return {
          ...staf,
          target,
          ach,
          upt,
          catchUpTarget,
          invoiceCount: invCount
        };
      })
      .sort((a, b) => b.totalRev - a.totalRev);
  }, [filteredTransactions, dailyTargetCatchUp]);

  // Ekspor PowerPoint Langsung dari Browser
  const handleExportPPTX = async () => {     try {       // Load script pptxgenjs via CDN secara dinamis agar Vite tidak gagal resolve saat build       if (!(window as any).PptxGenJS) {         await new Promise<void>((resolve, reject) => {           const script = document.createElement('script');           script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';           script.onload = () => resolve();           script.onerror = () => reject(new Error('Gagal memuat library PPTX'));           document.body.appendChild(script);         });       }        const PptxGen = (window as any).PptxGenJS;       const pres = new PptxGen();       pres.layout = 'LAYOUT_16x9';        const bgDark = '0F172A';       const textLight = 'F8FAFC';       const emerald = '059669';       const cardBg = '1E293B';        // Slide 1: Overview       const slide1 = pres.addSlide();       slide1.background = { color: bgDark };       slide1.addText('Store Performance & Operations Report', {         x: 0.8,         y: 1.5,         fontSize: 26,         bold: true,         color: textLight       });       slide1.addText('Evaluasi Mingguan (WoW), Kategori Produk, & Suara Lapangan', {         x: 0.8,         y: 2.3,         fontSize: 16,         color: '94A3B8'       });       slide1.addText(`Kode Toko: QF01 | Tanggal: ${selectedDate}`, {         x: 0.8,         y: 3.2,         fontSize: 12,         color: '38BDF8'       });        // Slide 2: Core KPI       const slide2 = pres.addSlide();       slide2.background = { color: bgDark };       slide2.addText('Core KPI Metrics (Target vs Pencapaian)', { x: 0.8, y: 0.6, fontSize: 22, bold: true, color: textLight });        slide2.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.4, w: 3.6, h: 2.2, fill: { color: cardBg } });       slide2.addText('Target Bulanan Toko', { x: 1.0, y: 1.6, fontSize: 13, color: '94A3B8' });       slide2.addText(formatCompactIDR(storeMetrics.totalTarget), { x: 1.0, y: 2.1, fontSize: 20, bold: true, color: textLight });       slide2.addText(`Realisasi: ${formatCompactIDR(storeMetrics.totalActual)} (${storeMetrics.overallAch.toFixed(1)}%)`, { x: 1.0, y: 2.8, fontSize: 11, color: emerald });        await pres.writeFile({ fileName: `Store_Performance_QF01_${selectedDate}.pptx` });     } catch (e) {       console.error('Export PPTX Error:', e);       alert('Gagal mengekspor file PPTX.');     }   };
    if (typeof window === 'undefined') return;
    try {
      const pptxgen = (await import('pptxgenjs')).default;
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';

      const bgDark = '0F172A';
      const textLight = 'F8FAFC';
      const emerald = '059669';
      const cardBg = '1E293B';

      // Slide 1: Executive Overview
      const slide1 = pres.addSlide();
      slide1.background = { color: bgDark };
      slide1.addText('Store Sales Performance & Staff Operations Report', {
        x: 0.8,
        y: 1.5,
        fontSize: 26,
        bold: true,
        color: textLight
      });
      slide1.addText('Evaluasi Mingguan (WoW), Kategori Produk, & Suara Lapangan', {
        x: 0.8,
        y: 2.3,
        fontSize: 16,
        color: '94A3B8'
      });
      slide1.addText(`Kode Toko: QF01 | Periode: Oktober 2026 | Cut-Off: ${selectedDate}`, {
        x: 0.8,
        y: 3.2,
        fontSize: 12,
        color: '38BDF8'
      });

      // Slide 2: Core KPI Metrics
      const slide2 = pres.addSlide();
      slide2.background = { color: bgDark };
      slide2.addText('Core KPI Metrics (Target vs Pencapaian)', { x: 0.8, y: 0.6, fontSize: 22, bold: true, color: textLight });

      slide2.addShape(pres.ShapeType.rect, { x: 0.8, y: 1.4, w: 3.6, h: 2.2, fill: { color: cardBg } });
      slide2.addText('Target Bulanan Toko', { x: 1.0, y: 1.6, fontSize: 13, color: '94A3B8' });
      slide2.addText(formatCompactIDR(storeMetrics.totalTarget), { x: 1.0, y: 2.1, fontSize: 20, bold: true, color: textLight });
      slide2.addText(`Realisasi: ${formatCompactIDR(storeMetrics.totalActual)} (${storeMetrics.overallAch.toFixed(1)}%)`, { x: 1.0, y: 2.8, fontSize: 11, color: emerald });

      slide2.addShape(pres.ShapeType.rect, { x: 4.8, y: 1.4, w: 3.6, h: 2.2, fill: { color: cardBg } });
      slide2.addText('Time Gone & Run Rate', { x: 5.0, y: 1.6, fontSize: 13, color: '94A3B8' });
      slide2.addText(`77,4% Berlalu`, { x: 5.0, y: 2.1, fontSize: 20, bold: true, color: 'F59E0B' });
      slide2.addText(`Diperlukan: ${formatCompactIDR(storeMetrics.requiredRunRateDaily)} / Hari`, { x: 5.0, y: 2.8, fontSize: 11, color: '94A3B8' });

      slide2.addShape(pres.ShapeType.rect, { x: 8.8, y: 1.4, w: 3.6, h: 2.2, fill: { color: cardBg } });
      slide2.addText('Produktivitas Keranjang (UPT)', { x: 9.0, y: 1.6, fontSize: 13, color: '94A3B8' });
      slide2.addText(`${storeMetrics.overallUpt.toFixed(2)} Items/Tx`, { x: 9.0, y: 2.1, fontSize: 20, bold: true, color: '38BDF8' });
      slide2.addText(`Total: ${storeMetrics.totalInvoices} Struk`, { x: 9.0, y: 2.8, fontSize: 11, color: '94A3B8' });

      // Slide 3: Staff Leaderboard
      const slide3 = pres.addSlide();
      slide3.background = { color: bgDark };
      slide3.addText('Staff Performance Leaderboard', { x: 0.8, y: 0.6, fontSize: 22, bold: true, color: textLight });

      const tableData: any[][] = [
        [
          { text: 'Rank', options: { bold: true, fill: { color: '334155' }, color: textLight } },
          { text: 'Nama Sales', options: { bold: true, fill: { color: '334155' }, color: textLight } },
          { text: 'Target (Rp)', options: { bold: true, fill: { color: '334155' }, color: textLight } },
          { text: 'Pencapaian (Rp)', options: { bold: true, fill: { color: '334155' }, color: textLight } },
          { text: 'Ach (%)', options: { bold: true, fill: { color: '334155' }, color: textLight } },
          { text: 'UPT', options: { bold: true, fill: { color: '334155' }, color: textLight } }
        ]
      ];

      staffLeaderboard.slice(0, 7).forEach((st, idx) => {
        tableData.push([
          { text: `#${idx + 1}`, options: { color: textLight } },
          { text: st.salesName, options: { bold: true, color: '38BDF8' } },
          { text: formatCompactIDR(st.target), options: { color: textLight } },
          { text: formatCompactIDR(st.totalRev), options: { color: textLight } },
          { text: `${st.ach.toFixed(1)}%`, options: { color: emerald } },
          { text: st.upt.toFixed(2), options: { color: textLight } }
        ]);
      });

      slide3.addTable(tableData, { x: 0.8, y: 1.4, w: 11.6, fontSize: 11, border: { pt: 1, color: '475569' } });

      // Slide 4: Voice of Field Staff & Action Plan
      const slide4 = pres.addSlide();
      slide4.background = { color: bgDark };
      slide4.addText('Suara Lapangan & Rekomendasi Taktis', { x: 0.8, y: 0.6, fontSize: 22, bold: true, color: textLight });
      slide4.addText('• Kendala Operasional: Kebutuhan restock cepat varian storage iPhone dan Android mid-range.', { x: 1.0, y: 1.5, fontSize: 14, color: textLight });
      slide4.addText('• Penjualan Silang: Optimalkan penawaran perlindungan Qoala dan paket data kartu perdana saat unboxing.', { x: 1.0, y: 2.2, fontSize: 14, color: textLight });
      slide4.addText('• Morning Huddle: Evaluasi target catch up individual setiap pergantian shift pagi ke siang.', { x: 1.0, y: 2.9, fontSize: 14, color: textLight });

      await pres.writeFile({ fileName: `Store_Performance_QF01_${selectedDate}.pptx` });
    } catch (e) {
      console.error('Export PPTX Error:', e);
      alert('Gagal mengekspor file PPTX.');
    }
  };

  // WhatsApp Share Formats
  const generateShareDailyWA = () => {
    const text = `*LAPORAN REALISASI SALES HARIAN TOKO QF01*
📅 Tanggal: ${selectedDate}
━━━━━━━━━━━━━━━━━━
🎯 *Target:* ${formatIDR(storeMetrics.totalTarget)}
💰 *Actual:* ${formatIDR(storeMetrics.totalActual)}
📈 *Achievement:* ${storeMetrics.overallAch.toFixed(1)}%
📉 *Gap:* ${formatIDR(storeMetrics.overallGap)}

*Kategori:*
🍎 Apple Devices: ${formatIDR(storeMetrics.categories.apple.actual)}
🤖 Android Devices: ${formatIDR(storeMetrics.categories.android.actual)}
🔌 Accessories: ${formatIDR(storeMetrics.categories.acc.actual)}
🛡️ VAS: ${formatIDR(storeMetrics.categories.vas.actual)}

*Metrik:*
🛒 Invoice: ${storeMetrics.totalInvoices} Struk
📦 Qty: ${storeMetrics.totalUnits} Units
⚡ UPT: ${storeMetrics.overallUpt.toFixed(2)}

Semangat closing team! 🔥💪`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const generateShareCatchUpTargetWA = () => {
    const staffListText = staffLeaderboard
      .map((s) => `- ${s.salesName} : ${formatIDR(s.catchUpTarget)}`)
      .join('\n');

    const totalCatchUp = staffLeaderboard.reduce((acc, curr) => acc + curr.catchUpTarget, 0);

    const text = `Target ${selectedDate}

Nama Staff:
${staffListText}

Total Target: ${formatIDR(totalCatchUp)}
━━━━━━━━━━━━━━━━━━
Sisa Target Bulan: ${formatIDR(storeMetrics.overallGap)}
Sisa Waktu: ${storeMetrics.remainingDays} Hari Tersisa

Semangat closing team! Fokus capai target hari ini! 🔥💪`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleOpenStaffDetail = (staf: typeof staffLeaderboard[0]) => {
    setBottomSheetData({
      title: `Detail Performa: ${staf.salesName}`,
      content: (
        <div className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[11px]">Total Omzet</span>
              <span className="font-bold text-sm text-blue-600 dark:text-blue-400">{formatIDR(staf.totalRev)}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 block text-[11px]">Capaian & UPT</span>
              <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{staf.ach.toFixed(1)}% | {staf.upt.toFixed(2)} UPT</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Rincian Penjualan Kategori:</div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 font-medium">🍎 Apple Hardware</span>
              <span className="font-bold">{formatIDR(staf.appleRev)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 font-medium">🤖 Android Devices</span>
              <span className="font-bold">{formatIDR(staf.androidRev)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 font-medium">🔌 Accessories</span>
              <span className="font-bold">{formatIDR(staf.accRev)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 font-medium">🛡️ VAS (Qoala / Operator)</span>
              <span className="font-bold text-emerald-600">{formatIDR(staf.vasRev)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-900 dark:text-blue-300">
            💡 <strong>Rekomendasi Singkat:</strong> Perbesar penawaran bundling perlindungan layar Qoala pada transaksi iPhone atau Samsung untuk mendongkrak UPT dan bobot VAS berjalan.
          </div>
        </div>
      )
    });
  };

  // Pencarian Produk
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return filteredTransactions.filter(
      (t) =>
        t.article.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.brandName.toLowerCase().includes(q)
    );
  }, [searchQuery, filteredTransactions]);

  const searchSummary = useMemo(() => {
    const totalAmount = searchResults.reduce((acc, c) => acc + c.amount, 0);
    const totalQty = searchResults.reduce((acc, c) => acc + c.qty, 0);
    return { totalAmount, totalQty, count: searchResults.length };
  }, [searchResults]);

  if (!isMounted) return null;

  return (
    <div className={`min-h-screen w-full max-w-full overflow-x-hidden ${theme === 'dark' ? 'bg-[#1A1831] text-[#FFF6E9]' : 'bg-[#F9F8F3] text-slate-800'}`}>
      {/* ==================================================== */}
      {/* TOP HEADER */}
      {/* ==================================================== */}
      <header className={`w-full border-b px-3 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 backdrop-blur-md ${theme === 'dark' ? 'bg-[#1A1831]/95 border-slate-800' : 'bg-[#F9F8F3]/95 border-slate-200'}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#054ff0] flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
            QF
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight leading-none">
              Store Operations QF01
            </h1>
            <p className="text-[11px] opacity-70 mt-0.5">
              Halo, <span className="font-semibold text-blue-500">{loggedInStaffName}</span> 👋 | Live GViz
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAllSpreadsheetData}
            title="Refresh Data"
            disabled={isLoading}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all ${
              theme === 'dark' ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-500' : ''}`} />
            <span className="hidden md:inline">{lastSync || 'Sync'}</span>
          </button>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Ganti Mode Tema"
            className={`p-2 rounded-lg border text-xs transition-all ${
              theme === 'dark' ? 'bg-slate-800/80 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          <button
            onClick={handleExportPPTX}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PPTX</span>
          </button>
        </div>
      </header>

      {/* ==================================================== */}
      {/* PERIOD SELECTOR BAR */}
      {/* ==================================================== */}
      <section className={`w-full border-b px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2.5 ${theme === 'dark' ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
        <div className="flex items-center gap-1 bg-black/10 dark:bg-white/10 p-1 rounded-xl">
          <button
            onClick={() => setFilterMode('daily')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'daily' ? 'bg-[#054ff0] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setFilterMode('weekly')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'weekly' ? 'bg-[#054ff0] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilterMode('monthly')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filterMode === 'monthly' ? 'bg-[#054ff0] text-white shadow-sm' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Monthly
          </button>
        </div>

        <div className="flex items-center gap-2">
          {filterMode === 'daily' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-2.5 py-1 text-xs rounded-lg border focus:outline-none ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
              }`}
            />
          )}

          {filterMode === 'weekly' && (
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className={`px-2.5 py-1 text-xs rounded-lg border focus:outline-none ${
                theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
              }`}
            >
              <option value="ALL">Semua Minggu</option>
              {dynamicWeeks.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name} ({w.minDate} s.d {w.maxDate})
                </option>
              ))}
            </select>
          )}

          {filterMode === 'monthly' && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-500 border border-blue-500/30">
              Oktober 2026
            </span>
          )}

          <button
            onClick={generateShareDailyWA}
            className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share Daily</span>
          </button>
        </div>
      </section>

      {/* ==================================================== */}
      {/* NAVIGATION TABS */}
      {/* ==================================================== */}
      <nav className={`w-full overflow-x-auto no-scrollbar border-b px-3 sm:px-6 flex gap-1 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
        {[
          { key: 'overview', label: 'Store Overview', icon: BarChart3 },
          { key: 'weekly', label: 'Weekly Sales', icon: TrendingUp },
          { key: 'staff', label: 'Staff Performance', icon: Users },
          { key: 'bnpl', label: 'BNPL', icon: CreditCard },
          { key: 'schedule', label: 'Schedule', icon: Calendar },
          { key: 'feedback', label: 'Feedback', icon: MessageSquare },
          { key: 'search', label: 'Cari Produk', icon: Search },
          ...(loggedInSalesId === ADMIN_SALES_ID ? [{ key: 'admin', label: 'Admin Portal', icon: ShieldAlert }] : [])
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap text-xs font-medium transition-all ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ==================================================== */}
      {/* MAIN VIEW CONTENT */}
      {/* ==================================================== */}
      <main className="w-full max-w-full p-3 sm:p-6 space-y-6">
        {/* TAB 1: OVERVIEW STORE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
                <div className="flex justify-between items-center text-xs opacity-70 mb-1">
                  <span>Target Periode</span>
                  <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <div className="text-sm sm:text-base font-extrabold truncate">{formatCompactIDR(storeMetrics.totalTarget)}</div>
                <div className="text-[10px] sm:text-xs opacity-60 mt-1">Oktober 2026 Toko</div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
                <div className="flex justify-between items-center text-xs opacity-70 mb-1">
                  <span>Actual Omzet</span>
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="text-sm sm:text-base font-extrabold text-emerald-500 truncate">{formatCompactIDR(storeMetrics.totalActual)}</div>
                <div className="text-[10px] sm:text-xs font-medium text-emerald-500 mt-1">{storeMetrics.overallAch.toFixed(1)}% Terpenuhi</div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
                <div className="flex justify-between items-center text-xs opacity-70 mb-1">
                  <span>Sisa Gap</span>
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                </div>
                <div className="text-sm sm:text-base font-extrabold text-rose-500 truncate">{formatCompactIDR(storeMetrics.overallGap)}</div>
                <div className="text-[10px] sm:text-xs opacity-60 mt-1">{storeMetrics.remainingDays} Hari Tersisa</div>
              </div>

              <div className={`p-3.5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
                <div className="flex justify-between items-center text-xs opacity-70 mb-1">
                  <span>Run Rate / Hari</span>
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="text-sm sm:text-base font-extrabold text-amber-500 truncate">{formatCompactIDR(storeMetrics.requiredRunRateDaily)}</div>
                <div className="text-[10px] sm:text-xs opacity-60 mt-1">Time Gone: {storeMetrics.timeGonePercent.toFixed(1)}%</div>
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Apple Devices', icon: Smartphone, color: 'text-blue-500', ...storeMetrics.categories.apple },
                { title: 'Android Devices', icon: Smartphone, color: 'text-emerald-500', ...storeMetrics.categories.android },
                { title: 'Accessories', icon: Headphones, color: 'text-amber-500', ...storeMetrics.categories.acc },
                { title: 'VAS (Proteksi & Data)', icon: ShieldCheck, color: 'text-purple-500', ...storeMetrics.categories.vas }
              ].map((c) => {
                const Icon = c.icon;
                const ach = c.target > 0 ? (c.actual / c.target) * 100 : 0;
                return (
                  <div
                    key={c.title}
                    onClick={() =>
                      setBottomSheetData({
                        title: `Rincian Kategori: ${c.title}`,
                        content: (
                          <div className="space-y-3 text-xs">
                            <div className="flex justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                              <span>Target</span>
                              <span className="font-bold">{formatIDR(c.target)}</span>
                            </div>
                            <div className="flex justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                              <span>Realisasi</span>
                              <span className="font-bold text-blue-500">{formatIDR(c.actual)}</span>
                            </div>
                            <div className="flex justify-between p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                              <span>Pencapaian</span>
                              <span className="font-bold text-emerald-500">{ach.toFixed(1)}%</span>
                            </div>
                          </div>
                        )
                      })
                    }
                    className={`p-3.5 rounded-2xl border cursor-pointer hover:border-blue-500 transition-all ${
                      theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${c.color}`} /> {c.title}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                    </div>
                    <div className="text-sm font-extrabold">{formatCompactIDR(c.actual)}</div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#054ff0] rounded-full"
                        style={{ width: `${Math.min(100, ach)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] opacity-60 mt-1.5">
                      <span>Target: {formatCompactIDR(c.target)}</span>
                      <span className="font-bold text-blue-500">{ach.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Daily Catch-Up Table */}
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2">
                    🎯 Target Harian vs Pencapaian Berjalan (Catch-Up)
                  </h3>
                  <p className="text-[11px] opacity-60">Diambil langsung dari Kolom H sheet target staff</p>
                </div>
                <button
                  onClick={generateShareCatchUpTargetWA}
                  className="px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Target (WhatsApp)</span>
                </button>
              </div>

              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-[11px] sm:text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/80 opacity-70">
                      <th className="py-2 px-1 w-[40%]">Nama Staff</th>
                      <th className="py-2 px-1 w-[35%]">Target Catch Up</th>
                      <th className="py-2 px-1 w-[25%] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {staffLeaderboard.slice(0, 8).map((s) => (
                      <tr key={s.salesId}>
                        <td className="py-2 px-1 font-semibold truncate">{s.salesName}</td>
                        <td className="py-2 px-1 font-bold text-blue-500 truncate">{formatCompactIDR(s.catchUpTarget)}</td>
                        <td className="py-2 px-1 text-right">
                          <button
                            onClick={() => handleOpenStaffDetail(s)}
                            className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
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

        {/* TAB 2: WEEKLY SALES (WoW) */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold">Analisis Penjualan Mingguan (WoW)</h3>
              <p className="text-[11px] opacity-60">Auto-generating weeks dari Kolom O sheet DATABASE</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {dynamicWeeks.map((wk) => {
                const weekTxs = transactions.filter((t) => t.weekName === wk.name);
                const totalWk = weekTxs.reduce((sum, t) => sum + t.amount, 0);
                const isSelected = selectedWeek === wk.name;
                return (
                  <div
                    key={wk.name}
                    onClick={() => setSelectedWeek(isSelected ? 'ALL' : wk.name)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-500/10'
                        : theme === 'dark'
                        ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-xs">{wk.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 font-semibold">
                        {weekTxs.length} Tx
                      </span>
                    </div>
                    <div className="text-sm sm:text-base font-extrabold text-blue-500">{formatCompactIDR(totalWk)}</div>
                    <div className="text-[10px] opacity-60 mt-1">
                      Rentang: {wk.minDate} s.d {wk.maxDate}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
              <h4 className="text-xs font-bold mb-3">Realisasi Tim ({selectedWeek === 'ALL' ? 'Semua Minggu' : selectedWeek})</h4>
              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/80 opacity-70">
                      <th className="py-2 px-1 w-[40%]">Nama Staff</th>
                      <th className="py-2 px-1 w-[30%]">Total Sales</th>
                      <th className="py-2 px-1 w-[15%] text-center">UPT</th>
                      <th className="py-2 px-1 w-[15%] text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {staffLeaderboard.map((s) => (
                      <tr key={s.salesId}>
                        <td className="py-2 px-1 font-semibold truncate">{s.salesName}</td>
                        <td className="py-2 px-1 font-bold text-emerald-500 truncate">{formatCompactIDR(s.totalRev)}</td>
                        <td className="py-2 px-1 text-center font-medium">{s.upt.toFixed(1)}</td>
                        <td className="py-2 px-1 text-right">
                          <button
                            onClick={() => handleOpenStaffDetail(s)}
                            className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold"
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

        {/* TAB 3: STAFF PERFORMANCE DETAIL */}
        {activeTab === 'staff' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold">Performa Seluruh Staf Toko (Leaderboard)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {staffLeaderboard.map((staf, idx) => (
                <div
                  key={staf.salesId}
                  onClick={() => handleOpenStaffDetail(staf)}
                  className={`p-3.5 rounded-2xl border cursor-pointer hover:border-blue-500 transition-all ${
                    theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#054ff0] text-white flex items-center justify-center font-bold text-xs">
                        {staf.salesName.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{staf.salesName}</div>
                        <div className="text-[10px] opacity-60">ID: {staf.salesId} | Rank #{idx + 1}</div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-500">{staf.ach.toFixed(1)}%</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] mt-2 p-2 rounded-xl bg-black/5 dark:bg-white/5">
                    <div>
                      <span className="opacity-60 block">Realisasi</span>
                      <span className="font-bold text-emerald-500">{formatCompactIDR(staf.totalRev)}</span>
                    </div>
                    <div>
                      <span className="opacity-60 block">Keranjang (UPT)</span>
                      <span className="font-bold">{staf.upt.toFixed(2)} Items</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] opacity-60 mt-2">
                    <span>Target: {formatCompactIDR(staf.target)}</span>
                    <span className="text-blue-500 font-bold">Buka Detail &rarr;</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: BNPL REKAPITULASI & TABS */}
        {activeTab === 'bnpl' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Buy Now Pay Later (BNPL) Dashboard</h3>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {['ALL', 'Kredivo', 'Indodana', 'Akulaku', 'ShopeePayLater', 'Home Credit'].map((tnd) => {
                const filteredBnpl = tnd === 'ALL' ? bnplRecords : bnplRecords.filter((b) => b.tender.toLowerCase().includes(tnd.toLowerCase()));
                const tAmount = filteredBnpl.reduce((sum, b) => sum + b.amount, 0);
                const isAct = bnplActiveTender === tnd;

                return (
                  <button
                    key={tnd}
                    onClick={() => setBnplActiveTender(tnd)}
                    className={`px-3 py-2 rounded-xl border text-left whitespace-nowrap min-w-[130px] transition-all ${
                      isAct
                        ? 'border-blue-600 bg-blue-500/10'
                        : theme === 'dark'
                        ? 'bg-slate-800/40 border-slate-700/80 hover:border-slate-600'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-[11px] font-bold">{tnd}</div>
                    <div className="text-xs font-black text-blue-500">{formatCompactIDR(tAmount)}</div>
                    <div className="text-[10px] opacity-60">{filteredBnpl.length} Transaksi</div>
                  </button>
                );
              })}
            </div>

            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
              <h4 className="text-xs font-bold mb-3">Detail Transaksi BNPL ({bnplActiveTender})</h4>
              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700/80 opacity-70">
                      <th className="py-2 px-1 w-[25%]">No Invoice</th>
                      <th className="py-2 px-1 w-[40%]">Produk</th>
                      <th className="py-2 px-1 w-[15%]">Tender</th>
                      <th className="py-2 px-1 w-[20%] text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {bnplRecords
                      .filter((b) => (bnplActiveTender === 'ALL' ? true : b.tender.toLowerCase().includes(bnplActiveTender.toLowerCase())))
                      .slice(0, 10)
                      .map((row, i) => (
                        <tr key={i}>
                          <td className="py-2 px-1 font-mono text-[10px] truncate">{row.invoiceNo}</td>
                          <td className="py-2 px-1 font-semibold truncate">{row.product}</td>
                          <td className="py-2 px-1 text-[10px] opacity-70 truncate">{row.tender}</td>
                          <td className="py-2 px-1 text-right font-bold text-emerald-500 truncate">{formatCompactIDR(row.amount)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SCHEDULE 1 MINGGU */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold">Jadwal Shift Kerja Toko (1 Minggu)</h3>
                <p className="text-[11px] opacity-60">
                  {loggedInSalesId === ADMIN_SALES_ID ? '✏️ Mode Admin: Klik untuk mengganti shift' : '👁️ Mode Baca: Hanya Admin yang dapat mengedit shift'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 text-xs border rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>

            <div className={`p-3 rounded-2xl border overflow-x-auto ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
              <table className="w-full text-[10px] sm:text-xs text-center border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 opacity-70">
                    <th className="py-2 px-2 text-left w-28">Nama</th>
                    {DAYS_OF_WEEK.map((d) => (
                      <th key={d.key} className="py-2 px-1">
                        <div>{d.label}</div>
                        <div className="text-[9px] font-normal opacity-70">{d.date}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scheduleState.map((staf, sIdx) => (
                    <tr key={staf.salesId}>
                      <td className="py-2 px-2 text-left font-semibold truncate">{staf.salesName}</td>
                      {DAYS_OF_WEEK.map((d) => {
                        const shiftVal = staf.shifts[d.key] || 'OFF';
                        const isEditable = loggedInSalesId === ADMIN_SALES_ID;

                        return (
                          <td key={d.key} className="py-1 px-1">
                            {isEditable ? (
                              <select
                                value={shiftVal}
                                onChange={(e) => {
                                  const updated = [...scheduleState];
                                  updated[sIdx].shifts[d.key] = e.target.value;
                                  setScheduleState(updated);
                                }}
                                className="text-[10px] p-1 rounded font-bold bg-transparent border border-slate-300 dark:border-slate-700"
                              >
                                <option value="D047">D047</option>
                                <option value="D103">D103</option>
                                <option value="OFF">OFF</option>
                                <option value="TR">TR</option>
                                <option value="CUTI">CUTI</option>
                              </select>
                            ) : (
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                  shiftVal === 'D047'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                                    : shiftVal === 'D103'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                                }`}
                              >
                                {shiftVal}
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
        )}

        {/* TAB 6: FEEDBACK PENJUALAN DENGAN FITUR EDIT */}
        {activeTab === 'feedback' && (yang memiliki dropdown filter staf, tombol edit ulasan, badge sentimen hijau/kuning, dan tombol reaksi)
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold">Riwayat Feedback Penjualan Hari Ini 📊</h3>
                <p className="text-[11px] opacity-60">Ulasan performa, kendala stok, dan respon promo konsumen</p>
              </div>
              <button
                onClick={() => {
                  setEditingFeedbackId(null);
                  setFeedbackInputName('');
                  setFeedbackInputText('');
                  setShowFeedbackModal(true);
                }}
                className="px-3 py-1.5 bg-[#054ff0] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                + Tulis Feedback
              </button>
            </div>

            <div className="space-y-3">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-blue-500">{fb.salesName}</span>
                      {fb.isEdited && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">
                          edited
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] opacity-50">{fb.timestamp}</span>
                      <button
                        onClick={() => {
                          setEditingFeedbackId(fb.id);
                          setFeedbackInputName(fb.salesName);
                          setFeedbackInputText(fb.text);
                          setShowFeedbackModal(true);
                        }}
                        className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded text-slate-400 hover:text-blue-500"
                        title="Edit Feedback"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{fb.text}</p>
                  <div className="flex items-center gap-1.5 pt-1">
                    {[
                      { key: 'like', icon: '👍', count: fb.reactions.like },
                      { key: 'heart', icon: '🧡', count: fb.reactions.heart },
                      { key: 'fire', icon: '🔥', count: fb.reactions.fire }
                    ].map((rx) => (
                      <button
                        key={rx.key}
                        onClick={() => {
                          setFeedbacks(
                            feedbacks.map((f) =>
                              f.id === fb.id
                                ? {
                                    ...f,
                                    reactions: { ...f.reactions, [rx.key]: (f.reactions as any)[rx.key] + 1 }
                                  }
                                : f
                            )
                          );
                        }}
                        className="px-2 py-0.5 rounded-full text-[10px] border border-slate-200 dark:border-slate-700 hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-1"
                      >
                        <span>{rx.icon}</span>
                        <span>{rx.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: SEARCH PRODUK */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold">Pencarian Produk & Riwayat Transaksi</h3>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari berdasarkan SKU / Article, Deskripsi, atau Brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border focus:outline-none ${
                  theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>

            {searchQuery && (
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
                <div>
                  <span className="opacity-60 block text-[10px]">Total Ditemukan</span>
                  <span className="font-bold">{searchSummary.count} Baris</span>
                </div>
                <div>
                  <span className="opacity-60 block text-[10px]">Total Qty</span>
                  <span className="font-bold">{searchSummary.totalQty} Units</span>
                </div>
                <div>
                  <span className="opacity-60 block text-[10px]">Total Omzet</span>
                  <span className="font-bold text-emerald-500">{formatCompactIDR(searchSummary.totalAmount)}</span>
                </div>
              </div>
            )}

            <div className="w-full overflow-hidden">
              <table className="w-full table-fixed text-[11px] sm:text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 opacity-70">
                    <th className="py-2 px-1 w-[45%]">Produk / Deskripsi</th>
                    <th className="py-2 px-1 w-[20%]">Sales</th>
                    <th className="py-2 px-1 w-[10%] text-center">Qty</th>
                    <th className="py-2 px-1 w-[25%] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {searchResults.slice(0, 15).map((r) => (
                    <tr key={r.rowId}>
                      <td className="py-2 px-1 truncate font-semibold">{r.description}</td>
                      <td className="py-2 px-1 truncate opacity-70">{r.salesName}</td>
                      <td className="py-2 px-1 text-center font-bold">{r.qty}</td>
                      <td className="py-2 px-1 text-right font-bold text-emerald-500 truncate">{formatCompactIDR(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 8: ADMIN SECRET PORTAL */}
        {activeTab === 'admin' && loggedInSalesId === ADMIN_SALES_ID && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-rose-500">
              <ShieldAlert className="w-4 h-4" /> Portal Khusus Admin (22008089) — Activity Log
            </h3>
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-800/40 border-slate-700/80' : 'bg-white border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)]'}`}>
              <div className="text-xs space-y-2 opacity-80">
                <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
                  <span>Sales ID: 22008089 (Angga)</span>
                  <span className="text-emerald-400">Aktif (WIB)</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
                  <span>Perangkat Terdeteksi:</span>
                  <span>Safari / macOS (MacBook Pro)</span>
                </div>
                <div className="flex justify-between border-b pb-1.5 border-slate-700/40">
                  <span>Lokasi Presensi GPS:</span>
                  <span>Grand Indonesia West Mall, Jakarta Pusat</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* BOTTOM SHEET DRAWER MODAL */}
      {/* ==================================================== */}
      {bottomSheetData && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div
            className={`w-full max-w-lg rounded-t-3xl sm:rounded-2xl p-5 space-y-4 shadow-2xl border max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 ${
              theme === 'dark' ? 'bg-[#1E1B3A] border-slate-700 text-[#FFF6E9]' : 'bg-[#FAF9F5] border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-12 h-1.5 bg-slate-400/40 rounded-full mx-auto" />
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold">{bottomSheetData.title}</h3>
              <button
                onClick={() => setBottomSheetData(null)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <XCircle className="w-4 h-4 opacity-70" />
              </button>
            </div>
            <div>{bottomSheetData.content}</div>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT FEEDBACK */}
      {/* MODAL INPUT / EDIT FEEDBACK */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`w-full max-w-md rounded-2xl p-5 space-y-4 border shadow-xl ${
              theme === 'dark' ? 'bg-[#1E1B3A] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-200 dark:border-slate-700">
              <h3 className="text-sm font-bold">
                {editingFeedbackId ? 'Edit Catatan Feedback' : 'Tulis Feedback Penjualan Hari Ini'}
              </h3>
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setEditingFeedbackId(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {/* Nama Sales */}
              <div>
                <label className="text-[11px] font-semibold opacity-70 block mb-1">Nama Sales</label>
                <input
                  type="text"
                  placeholder="Ketik nama sales..."
                  value={feedbackInputName}
                  onChange={(e) => setFeedbackInputName(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:border-[#054FF0]"
                />
              </div>

              {/* Jabatan & Sentimen */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold opacity-70 block mb-1">Peran / Jabatan</label>
                  <select
                    value={feedbackInputRole}
                    onChange={(e) => setFeedbackInputRole(e.target.value)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none"
                  >
                    <option value="Sales Consultant">Sales Consultant</option>
                    <option value="Cashier Leader">Cashier Leader</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Store Leader">Store Leader</option>
                    <option value="Senior Sales">Senior Sales</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold opacity-70 block mb-1">Sentimen</label>
                  <select
                    value={feedbackInputSentiment}
                    onChange={(e) => setFeedbackInputSentiment(e.target.value as any)}
                    className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none"
                  >
                    <option value="Luar Biasa">Luar Biasa</option>
                    <option value="Cukup Baik">Cukup Baik</option>
                    <option value="Perlu Ditingkatkan">Perlu Ditingkatkan</option>
                  </select>
                </div>
              </div>

              {/* Catatan Feedback */}
              <div>
                <label className="text-[11px] font-semibold opacity-70 block mb-1">Ulasan Performa / Kendala Stok</label>
                <textarea
                  placeholder="Tulis ulasan transaksi, kendala pelanggan, atau respon produk..."
                  rows={4}
                  value={feedbackInputText}
                  onChange={(e) => setFeedbackInputText(e.target.value)}
                  className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:outline-none focus:border-[#054FF0]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setEditingFeedbackId(null);
                }}
                className="px-3.5 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-black/5"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (feedbackInputText.trim()) {
                    if (editingFeedbackId) {
                      setFeedbacks(
                        feedbacks.map((f) =>
                          f.id === editingFeedbackId
                            ? {
                                ...f,
                                salesName: feedbackInputName.trim() || f.salesName,
                                role: feedbackInputRole,
                                sentiment: feedbackInputSentiment,
                                text: feedbackInputText.trim(),
                                isEdited: true
                              }
                            : f
                        )
                      );
                    } else {
                      const newFeedback: FeedbackItem = {
                        id: `fb-${Date.now()}`,
                        salesName: feedbackInputName.trim() || loggedInStaffName,
                        role: feedbackInputRole,
                        sentiment: feedbackInputSentiment,
                        timestamp: `Hari ini, ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`,
                        text: feedbackInputText.trim(),
                        isEdited: false,
                        reactions: { like: 0, heart: 0, fire: 0, dislike: 0, sad: 0 }
                      };
                      setFeedbacks([newFeedback, ...feedbacks]);
                    }
                    setFeedbackInputText('');
                    setFeedbackInputName('');
                    setEditingFeedbackId(null);
                    setShowFeedbackModal(false);
                  }
                }}
                className="px-4 py-1.5 text-xs font-bold rounded-xl bg-[#054FF0] hover:bg-[#043ec2] text-white shadow-sm"
              >
                {editingFeedbackId ? 'Simpan Perubahan' : 'Kirim Feedback'}
              </button>
            </div>
          </div>
        </div>
      )}
