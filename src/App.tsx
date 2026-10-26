'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import {
  Store,
  Calendar,
  Users,
  Search,
  MessageSquare,
  Clock,
  CreditCard,
  Download,
  Share2,
  RefreshCw,
  Sun,
  Moon,
  ChevronUp,
  X,
  Smartphone,
  ShieldCheck,
  Headphones,
  Award,
  TrendingUp,
  FileText
} from 'lucide-react';

// ==========================================
// CONSTANTS & SPREADSHEET CONFIG
// ==========================================
const SPREADSHEET_ID = '1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM';
const GID_DATABASE = '602901290';
const GID_BNPL = '2697970';
const ADMIN_SALES_ID = '22008089';

// ==========================================
// HELPER FORMATTERS
// ==========================================
const formatIDR = (val: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val || 0);
};

const formatCompactIDR = (val: number): string => {
  if (Math.abs(val) >= 1_000_000_000) {
    return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `Rp ${(val / 1_000_000).toFixed(1)} Jt`;
  }
  return formatIDR(val);
};

// ==========================================
// TYPES
// ==========================================
interface Transaction {
  date: string;
  salesId: string;
  salesName: string;
  invoice: string;
  sapArticle: string;
  sapDescription: string;
  qty: number;
  amount: number;
  productType: string;
  brandName: string;
  groupCategory: string;
  month: string;
  week: string;
}

interface BnplItem {
  date: string;
  invoice: string;
  product: string;
  qty: number;
  amount: number;
  tender: string;
}

interface Feedback {
  id: string;
  salesName: string;
  timestamp: string;
  message: string;
  reactions: Record<string, number>;
}

// ==========================================
// MAIN COMPONENT
// ==========================================
export default function RetailOperationsDashboard() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [activeTab, setActiveTab] = useState<'overview' | 'weekly' | 'staff' | 'bnpl' | 'schedule' | 'dailyTarget' | 'search' | 'feedback'>('overview');
  
  // Auth state
  const [currentSalesId, setCurrentSalesId] = useState<string>('24016878'); // default: Yunita Anggraini
  const [data, setData] = useState<Transaction[]>([]);
  const [bnplData, setBnplData] = useState<BnplItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  // Filter Periods
  const [periodFilter, setPeriodFilter] = useState<'MONTHLY' | 'WEEKLY' | 'DAILY'>('MONTHLY');
  const [selectedWeek, setSelectedWeek] = useState<string>('ALL');
  
  // Drawer / Bottom Sheet state
  const [activeBottomSheet, setActiveBottomSheet] = useState<{
    title: string;
    type: 'STAFF_DETAIL' | 'KPI_DETAIL' | 'NONE';
    payload: any;
  }>({ title: '', type: 'NONE', payload: null });

  // Schedule state
  const [scheduleData, setScheduleData] = useState<Record<string, Record<string, string>>>({
    'Yunita Anggraini': { Mon: 'D047', Tue: 'D047', Wed: 'D103', Thu: 'D103', Fri: 'OFF', Sat: 'D047', Sun: 'D103' },
    'Siti Amelia': { Mon: 'D103', Tue: 'D103', Wed: 'OFF', Thu: 'D047', Fri: 'D047', Sat: 'D103', Sun: 'D047' },
    'Surya Adi Permana': { Mon: 'D047', Tue: 'OFF', Wed: 'D047', Thu: 'D047', Fri: 'D103', Sat: 'D103', Sun: 'D103' },
    'Andrian Afi': { Mon: 'D103', Tue: 'D047', Wed: 'D047', Thu: 'OFF', Fri: 'D103', Sat: 'D047', Sun: 'D047' },
    'M. Adlii': { Mon: 'OFF', Tue: 'D103', Wed: 'D103', Thu: 'D047', Fri: 'D047', Sat: 'D103', Sun: 'D103' }
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Feedback state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: '1',
      salesName: 'Yunita Anggraini',
      timestamp: 'Hari ini, 15:30 WIB',
      message: 'Permintaan unit iPhone 17 Pro Max Silver tinggi, namun stok tersisa 1 unit di gudang.',
      reactions: { '👍': 4, '🔥': 2, '🧡': 1 }
    },
    {
      id: '2',
      salesName: 'Surya Adi Permana',
      timestamp: 'Hari ini, 16:45 WIB',
      message: 'Aksesoris bundling kabel charger 60W Verbatim dan case Machino sangat diminati pengunjung.',
      reactions: { '👍': 5, '🔥': 3 }
    }
  ]);
  const [newFeedbackMessage, setNewFeedbackMessage] = useState('');
  const [selectedStaffFeedback, setSelectedStaffFeedback] = useState('Yunita Anggraini');

  // ==========================================
  // LIVE FETCH VIA GVIZ API
  // ==========================================
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch DATABASE tab
      const dbUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_DATABASE}`;
      const resDb = await fetch(dbUrl);
      const textDb = await resDb.text();
      
      // Parse GViz response: "google.visualization.Query.setResponse({...})"
      const jsonDb = JSON.parse(textDb.substring(textDb.indexOf('{'), textDb.lastIndexOf('}') + 1));
      const rows = jsonDb.table.rows;

      const parsedTransactions: Transaction[] = rows
        .map((r: any) => {
          const c = r.c;
          if (!c || !c[0]) return null;
          return {
            date: c[0]?.f || c[0]?.v || '',
            salesId: String(c[1]?.v || ''),
            salesName: String(c[2]?.v || ''),
            invoice: String(c[3]?.v || ''),
            sapArticle: String(c[4]?.v || ''),
            sapDescription: String(c[5]?.v || ''),
            qty: Number(c[7]?.v || 0),
            amount: Number(c[8]?.v || 0),
            productType: String(c[9]?.v || '').toUpperCase(),
            brandName: String(c[10]?.v || '').toUpperCase(),
            groupCategory: String(c[11]?.v || '').toUpperCase(),
            month: String(c[12]?.f || c[12]?.v || ''),
            week: String(c[14]?.v || '').trim(),
          };
        })
        .filter((item: Transaction | null): item is Transaction => item !== null && item.amount > 0);

      setData(parsedTransactions);

      // 2. Fetch BNPL tab
      try {
        const bnplUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${GID_BNPL}`;
        const resBnpl = await fetch(bnplUrl);
        const textBnpl = await resBnpl.text();
        const jsonBnpl = JSON.parse(textBnpl.substring(textBnpl.indexOf('{'), textBnpl.lastIndexOf('}') + 1));
        const bnplRows = jsonBnpl.table.rows;
        
        const parsedBnpl: BnplItem[] = bnplRows.map((r: any) => {
          const c = r.c;
          return {
            date: c[0]?.f || c[0]?.v || '',
            invoice: String(c[1]?.v || ''),
            product: String(c[2]?.v || ''),
            qty: Number(c[3]?.v || 1),
            amount: Number(c[4]?.v || 0),
            tender: String(c[5]?.v || 'Tender Lainnya'),
          };
        }).filter((b: BnplItem) => b.amount > 0);
        setBnplData(parsedBnpl);
      } catch (err) {
        console.warn('BNPL Tab not parsed or missing:', err);
      }

      setLastUpdated(new Date().toLocaleTimeString('id-ID'));
    } catch (error) {
      console.error('Error fetching sheet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Current logged in salesperson name lookup
  const currentSalesName = useMemo(() => {
    const found = data.find((d) => d.salesId === currentSalesId);
    return found ? found.salesName : 'Store Team';
  }, [data, currentSalesId]);

  // Dynamic available weeks from Column O
  const availableWeeks = useMemo(() => {
    const set = new Set<string>();
    data.forEach((d) => {
      if (d.week && d.week !== '0') set.add(d.week);
    });
    return Array.from(set);
  }, [data]);

  // Filtered transactions based on active view filters
  const filteredData = useMemo(() => {
    if (periodFilter === 'WEEKLY' && selectedWeek !== 'ALL') {
      return data.filter((d) => d.week === selectedWeek);
    }
    return data;
  }, [data, periodFilter, selectedWeek]);

  // ==========================================
  // AGGREGATION & BUSINESS CALCULATIONS
  // ==========================================
  const totalStoreSales = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [filteredData]);

  const uniqueInvoicesCount = useMemo(() => {
    return new Set(filteredData.map((d) => d.invoice)).size;
  }, [filteredData]);

  const totalQtySold = useMemo(() => {
    return filteredData.reduce((acc, curr) => acc + curr.qty, 0);
  }, [filteredData]);

  const storeUpt = useMemo(() => {
    return uniqueInvoicesCount > 0 ? (totalQtySold / uniqueInvoicesCount).toFixed(2) : '0';
  }, [totalQtySold, uniqueInvoicesCount]);

  // Categories Breakdown
  const categoriesData = useMemo(() => {
    let apple = 0, android = 0, acc = 0, vas = 0;
    let appleQty = 0, androidQty = 0, accQty = 0, vasQty = 0;

    filteredData.forEach((item) => {
      if (item.groupCategory === 'DEVICES') {
        if (item.brandName === 'APPLE') {
          apple += item.amount;
          appleQty += item.qty;
        } else {
          android += item.amount;
          androidQty += item.qty;
        }
      } else if (item.groupCategory === 'ACCESSORIES') {
        acc += item.amount;
        accQty += item.qty;
      } else if (item.groupCategory === 'VAS') {
        vas += item.amount;
        vasQty += item.qty;
      }
    });

    return {
      apple: { amount: apple, qty: appleQty },
      android: { amount: android, qty: androidQty },
      accessories: { amount: acc, qty: accQty },
      vas: { amount: vas, qty: vasQty },
    };
  }, [filteredData]);

  // Staff Performance Ranking
  const staffLeaderboard = useMemo(() => {
    const map = new Map<string, {
      salesId: string;
      salesName: string;
      totalSales: number;
      qty: number;
      invoices: Set<string>;
      apple: number;
      android: number;
      acc: number;
      vas: number;
    }>();

    filteredData.forEach((d) => {
      if (!d.salesName || d.salesId === '88888888' || d.salesId === '99999999') return;
      if (!map.has(d.salesName)) {
        map.set(d.salesName, {
          salesId: d.salesId,
          salesName: d.salesName,
          totalSales: 0,
          qty: 0,
          invoices: new Set(),
          apple: 0,
          android: 0,
          acc: 0,
          vas: 0,
        });
      }
      const record = map.get(d.salesName)!;
      record.totalSales += d.amount;
      record.qty += d.qty;
      record.invoices.add(d.invoice);

      if (d.groupCategory === 'DEVICES') {
        if (d.brandName === 'APPLE') record.apple += d.amount;
        else record.android += d.amount;
      } else if (d.groupCategory === 'ACCESSORIES') {
        record.acc += d.amount;
      } else if (d.groupCategory === 'VAS') {
        record.vas += d.amount;
      }
    });

    return Array.from(map.values())
      .map((s) => ({
        ...s,
        upt: s.invoices.size > 0 ? (s.qty / s.invoices.size).toFixed(2) : '0',
      }))
      .sort((a, b) => b.totalSales - a.totalSales);
  }, [filteredData]);

  // Target Harian Variables
  const targetBulan = 8728667173;
  const totalHariBulan = 31;
  const hariBerjalan = 26;
  const sisaHari = totalHariBulan - hariBerjalan;
  const targetPerHari = targetBulan / totalHariBulan;
  const requiredRunRate = (targetBulan - totalStoreSales) / (sisaHari > 0 ? sisaHari : 1);
  const timeGonePct = ((hariBerjalan / totalHariBulan) * 100).toFixed(1);

  // ==========================================
  // WHATSAPP SHARE GENERATOR
  // ==========================================
  const handleShareDailyWhatsApp = () => {
    const text = `*DAILY SALES REPORT QF01 - ${new Date().toLocaleDateString('id-ID')}*
━━━━━━━━━━━━━━━━━━
💰 *Total Sales:* ${formatIDR(totalStoreSales)}
🎯 *Target Toko:* ${formatIDR(targetPerHari)}
📊 *Achievement:* ${((totalStoreSales / targetPerHari) * 100).toFixed(1)}%
🧾 *Invoice:* ${uniqueInvoicesCount} | *Qty:* ${totalQtySold}
📦 *UPT:* ${storeUpt}
━━━━━━━━━━━━━━━━━━
🍎 *Apple Devices:* ${formatIDR(categoriesData.apple.amount)} (${categoriesData.apple.qty} unit)
🤖 *Android Devices:* ${formatIDR(categoriesData.android.amount)} (${categoriesData.android.qty} unit)
🔌 *Accessories:* ${formatIDR(categoriesData.accessories.amount)}
🛡️ *VAS:* ${formatIDR(categoriesData.vas.amount)}
━━━━━━━━━━━━━━━━━━
*Top Sales Team:*
${staffLeaderboard.slice(0, 3).map((s, idx) => `${idx + 1}. ${s.salesName}: ${formatCompactIDR(s.totalSales)} (UPT: ${s.upt})`).join('\n')}
━━━━━━━━━━━━━━━━━━
Semangat closing team! Tetap fokus capai target! 🔥💪`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // ==========================================
  // PPTX SLIDE EXPORT
  // ==========================================
  const handleExportPresentation = async () => {
    try {
      // Dynamic import to prevent SSR build break
      const pptxgen = (await import('pptxgenjs')).default;
      const pres = new pptxgen();
      pres.layout = 'LAYOUT_16x9';

      // Slide 1: Cover
      const slide1 = pres.addSlide();
      slide1.background = { color: '0F172A' };
      slide1.addText('STORE PERFORMANCE & OPERATIONS REPORT', {
        x: 0.8,
        y: 2.2,
        fontSize: 28,
        bold: true,
        color: 'FFFFFF',
      });
      slide1.addText(`Store: QF01 | Periode: Oktober 2026 | Cut-off: ${new Date().toLocaleDateString('id-ID')}`, {
        x: 0.8,
        y: 3.2,
        fontSize: 14,
        color: '94A3B8',
      });

      // Slide 2: Core KPI
      const slide2 = pres.addSlide();
      slide2.addText('Core KPI Metrics (Target vs Pencapaian)', { x: 0.8, y: 0.6, fontSize: 22, bold: true, color: '0F172A' });
      slide2.addText(`Total Omset: ${formatIDR(totalStoreSales)}\nTarget Bulanan: ${formatIDR(targetBulan)}\nAchievement: ${((totalStoreSales / targetBulan) * 100).toFixed(1)}%\nTime Gone: ${timeGonePct}%\nRequired Run Rate: ${formatIDR(requiredRunRate)}/hari`, {
        x: 0.8,
        y: 1.8,
        fontSize: 16,
        color: '334155',
      });

      // Slide 3: Category Breakdown
      const slide3 = pres.addSlide();
      slide3.addText('Kategori Penjualan Toko', { x: 0.8, y: 0.6, fontSize: 22, bold: true, color: '0F172A' });
      slide3.addText(`• Apple Devices: ${formatIDR(categoriesData.apple.amount)} (${categoriesData.apple.qty} unit)\n• Android Devices: ${formatIDR(categoriesData.android.amount)} (${categoriesData.android.qty} unit)\n• Accessories: ${formatIDR(categoriesData.accessories.amount)}\n• VAS (Qoala/Telkomsel): ${formatIDR(categoriesData.vas.amount)}`, {
        x: 0.8,
        y: 1.8,
        fontSize: 16,
        color: '334155',
      });

      // Save presentation
      await pres.writeFile({ fileName: `QF01_Report_${new Date().toISOString().slice(0, 10)}.pptx` });
    } catch (e) {
      alert('Fitur ekspor PPTX memerlukan instalasi pptxgenjs di proyek Anda (npm i pptxgenjs).');
    }
  };

  // Feedback action handlers
  const handleAddFeedback = () => {
    if (!newFeedbackMessage.trim()) return;
    const item: Feedback = {
      id: Date.now().toString(),
      salesName: selectedStaffFeedback,
      timestamp: 'Baru saja',
      message: newFeedbackMessage,
      reactions: { '👍': 1 },
    };
    setFeedbacks([item, ...feedbacks]);
    setNewFeedbackMessage('');
  };

  const handleToggleReaction = (feedbackId: string, emoji: string) => {
    setFeedbacks((prev) =>
      prev.map((f) => {
        if (f.id !== feedbackId) return f;
        const currentCount = f.reactions[emoji] || 0;
        return {
          ...f,
          reactions: { ...f.reactions, [emoji]: currentCount + 1 },
        };
      })
    );
  };

  // ==========================================
  // RENDER UI
  // ==========================================
  return (
    <div
      className={`min-h-screen w-full max-w-full overflow-x-hidden transition-colors duration-200 ${
        theme === 'dark' ? 'bg-[#1A1831] text-[#FFF6E9]' : 'bg-[#F9F8F3] text-gray-900'
      }`}
    >
      {/* HEADER SECTION */}
      <header
        className={`w-full border-b px-3 py-3 sm:px-6 sm:py-4 sticky top-0 z-30 backdrop-blur-md ${
          theme === 'dark' ? 'bg-[#1A1831]/90 border-purple-900/40' : 'bg-[#FAF9F5]/90 border-gray-200'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand & Greeting */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
              QF
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm sm:text-lg font-bold leading-none">Halo {currentSalesName} 👋</h1>
                {currentSalesId === ADMIN_SALES_ID && (
                  <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-semibold border border-amber-500/30">
                    ADMIN
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
                {isLoading ? 'Memuat data realtime...' : `Update: ${lastUpdated || 'Baru Saja'}`}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <button
              onClick={fetchData}
              title="Refresh Data"
              className={`p-2 rounded-lg border text-xs flex items-center transition ${
                theme === 'dark'
                  ? 'border-purple-800 hover:bg-purple-900/50 text-gray-300'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleExportPresentation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Slide PPTX</span>
            </button>

            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg border text-xs transition ${
                theme === 'dark'
                  ? 'border-purple-800 text-yellow-400 hover:bg-purple-900/50'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* HORIZONTAL SEGMENTED NAVIGATION TABS */}
      <div
        className={`w-full overflow-x-auto border-b px-2 py-2 sticky top-[57px] z-20 ${
          theme === 'dark' ? 'bg-[#151329] border-purple-900/30' : 'bg-white border-gray-200'
        }`}
      >
        <div className="flex space-x-1 max-w-7xl mx-auto min-w-max text-xs font-medium">
          {[
            { id: 'overview', label: 'Store Overview', icon: Store },
            { id: 'weekly', label: 'Weekly Sales (WoW)', icon: TrendingUp },
            { id: 'staff', label: 'Staff Performance', icon: Users },
            { id: 'dailyTarget', label: 'Daily Target', icon: Clock },
            { id: 'bnpl', label: 'BNPL', icon: CreditCard },
            { id: 'schedule', label: 'Schedule', icon: Calendar },
            { id: 'search', label: 'Pencarian Produk', icon: Search },
            { id: 'feedback', label: 'Feedback', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow'
                    : theme === 'dark'
                    ? 'text-gray-400 hover:text-white hover:bg-white/5'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN CONTAINER (Mobile-First, Strictly No Horizontal Scroll) */}
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 space-y-4">
        {/* ========================================================= */}
        {/* TAB 1: STORE OVERVIEW                                      */}
        {/* ========================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-4 w-full">
            {/* Top Bar Summary / Share WA */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-bold">Ringkasan Operasional Toko</h2>
                <p className="text-xs text-gray-400">Analisis metrik target, time gone, dan kontribusi kategori</p>
              </div>
              <button
                onClick={handleShareDailyWhatsApp}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 shadow"
              >
                <Share2 className="w-4 h-4" />
                <span>Share WhatsApp Daily</span>
              </button>
            </div>

            {/* KPI 4 Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full">
              {/* Total Sales */}
              <div
                onClick={() =>
                  setActiveBottomSheet({
                    title: 'Rincian Omset Toko',
                    type: 'KPI_DETAIL',
                    payload: { label: 'Total Sales Toko', value: totalStoreSales, invoices: uniqueInvoicesCount },
                  })
                }
                className={`p-3.5 sm:p-4 rounded-2xl border cursor-pointer transition hover:scale-[1.01] ${
                  theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Total Aktual Omset</span>
                <div className="text-base sm:text-2xl font-bold text-blue-500 mt-1 truncate">
                  {formatCompactIDR(totalStoreSales)}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-1 flex justify-between items-center">
                  <span>{uniqueInvoicesCount} Transaksi</span>
                  <span className="text-emerald-500 font-semibold">UPT {storeUpt}</span>
                </div>
              </div>

              {/* Time Gone Card */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Waktu Berlalu (Time Gone)</span>
                <div className="text-base sm:text-2xl font-bold text-amber-500 mt-1">{timeGonePct}%</div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-1 flex justify-between">
                  <span>Hari ke-{hariBerjalan}</span>
                  <span>Sisa {sisaHari} Hari</span>
                </div>
              </div>

              {/* Target & Run Rate */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Required Daily Run Rate</span>
                <div className="text-base sm:text-2xl font-bold text-purple-400 mt-1 truncate">
                  {formatCompactIDR(requiredRunRate)}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-1">Target Harian Baru yang Harus Dikejar</div>
              </div>

              {/* Target Bulanan vs Capaian */}
              <div
                className={`p-3.5 sm:p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200 shadow-sm'
                }`}
              >
                <span className="text-[11px] sm:text-xs text-gray-400 font-medium">Pencapaian Target</span>
                <div className="text-base sm:text-2xl font-bold text-emerald-400 mt-1">
                  {((totalStoreSales / targetBulan) * 100).toFixed(1)}%
                </div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-1">Target: {formatCompactIDR(targetBulan)}</div>
              </div>
            </div>

            {/* KATEGORI PRODUK (Responsive Cards) */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold">Rincian Kategori Penjualan</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Apple */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-[#22203F] border-purple-900/30' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold flex items-center space-x-1">
                      <span>🍎 Apple Devices</span>
                    </span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      {categoriesData.apple.qty} unit
                    </span>
                  </div>
                  <div className="text-base font-bold">{formatCompactIDR(categoriesData.apple.amount)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {totalStoreSales > 0 ? ((categoriesData.apple.amount / totalStoreSales) * 100).toFixed(1) : 0}%
                    Kontribusi
                  </div>
                </div>

                {/* Android */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-[#22203F] border-purple-900/30' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold flex items-center space-x-1">
                      <span>🤖 Android Devices</span>
                    </span>
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                      {categoriesData.android.qty} unit
                    </span>
                  </div>
                  <div className="text-base font-bold">{formatCompactIDR(categoriesData.android.amount)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {totalStoreSales > 0 ? ((categoriesData.android.amount / totalStoreSales) * 100).toFixed(1) : 0}%
                    Kontribusi
                  </div>
                </div>

                {/* Accessories */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-[#22203F] border-purple-900/30' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold flex items-center space-x-1">
                      <span>🔌 Accessories</span>
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded">
                      {categoriesData.accessories.qty} unit
                    </span>
                  </div>
                  <div className="text-base font-bold">{formatCompactIDR(categoriesData.accessories.amount)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {totalStoreSales > 0
                      ? ((categoriesData.accessories.amount / totalStoreSales) * 100).toFixed(1)
                      : 0}
                    % Kontribusi
                  </div>
                </div>

                {/* VAS */}
                <div
                  className={`p-3.5 rounded-xl border ${
                    theme === 'dark' ? 'bg-[#22203F] border-purple-900/30' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold flex items-center space-x-1">
                      <span>🛡️ VAS (Qoala/Tsel)</span>
                    </span>
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">
                      {categoriesData.vas.qty} unit
                    </span>
                  </div>
                  <div className="text-base font-bold">{formatCompactIDR(categoriesData.vas.amount)}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    {totalStoreSales > 0 ? ((categoriesData.vas.amount / totalStoreSales) * 100).toFixed(1) : 0}%
                    Kontribusi
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Leaderboard Table (No Horizontal Scroll) */}
            <div
              className={`rounded-2xl border p-3.5 ${
                theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold flex items-center space-x-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Leaderboard Staf (Bulan Berjalan)</span>
                </h3>
              </div>

              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-xs">
                  <thead>
                    <tr className="border-b border-gray-700/40 text-gray-400 text-left">
                      <th className="w-8 py-2">#</th>
                      <th className="w-2/5 py-2">Sales</th>
                      <th className="py-2 text-right">Omset</th>
                      <th className="w-16 py-2 text-right">UPT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/20">
                    {staffLeaderboard.slice(0, 5).map((staff, idx) => (
                      <tr
                        key={staff.salesName}
                        onClick={() =>
                          setActiveBottomSheet({
                            title: `Detail Penjualan: ${staff.salesName}`,
                            type: 'STAFF_DETAIL',
                            payload: staff,
                          })
                        }
                        className="cursor-pointer hover:bg-white/5 transition"
                      >
                        <td className="py-2.5 font-bold text-gray-400">{idx + 1}</td>
                        <td className="py-2.5 font-medium truncate pr-2">{staff.salesName}</td>
                        <td className="py-2.5 text-right font-semibold text-blue-400 truncate">
                          {formatCompactIDR(staff.totalSales)}
                        </td>
                        <td className="py-2.5 text-right font-medium text-emerald-400">{staff.upt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: WEEKLY SALES (WoW)                                 */}
        {/* ========================================================= */}
        {activeTab === 'weekly' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-xl font-bold">Weekly Sales (WoW)</h2>
                <p className="text-xs text-gray-400">Pencapaian minggu ke minggu terdeteksi dinamis dari Kolom O</p>
              </div>
            </div>

            {/* Dynamic Week Selector */}
            <div className="flex space-x-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedWeek('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedWeek === 'ALL'
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark'
                    ? 'bg-[#22203F] text-gray-300'
                    : 'bg-white border text-gray-700'
                }`}
              >
                Semua Minggu
              </button>
              {availableWeeks.map((wk) => (
                <button
                  key={wk}
                  onClick={() => setSelectedWeek(wk)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedWeek === wk
                      ? 'bg-blue-600 text-white'
                      : theme === 'dark'
                      ? 'bg-[#22203F] text-gray-300'
                      : 'bg-white border text-gray-700'
                  }`}
                >
                  {wk}
                </button>
              ))}
            </div>

            {/* Week Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableWeeks.map((wk) => {
                const wkTransactions = data.filter((d) => d.week === wk);
                const totalWkSales = wkTransactions.reduce((acc, curr) => acc + curr.amount, 0);
                const invoices = new Set(wkTransactions.map((d) => d.invoice)).size;
                const qty = wkTransactions.reduce((acc, curr) => acc + curr.qty, 0);

                return (
                  <div
                    key={wk}
                    onClick={() => {
                      setSelectedWeek(wk);
                      setPeriodFilter('WEEKLY');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition hover:border-blue-500 ${
                      theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-blue-400">{wk}</span>
                      <span className="text-[10px] text-gray-400">{invoices} Transaksi</span>
                    </div>
                    <div className="text-lg font-bold mt-1">{formatCompactIDR(totalWkSales)}</div>
                    <div className="text-xs text-gray-400 mt-2 flex justify-between">
                      <span>Total Qty: {qty} unit</span>
                      <span>UPT: {invoices > 0 ? (qty / invoices).toFixed(2) : '0'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: STAFF PERFORMANCE DETAIL                            */}
        {/* ========================================================= */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold">Staff Performance Detail</h2>
              <p className="text-xs text-gray-400">Seluruh staf ditampilkan langsung tanpa dropdown</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {staffLeaderboard.map((staff, idx) => (
                <div
                  key={staff.salesName}
                  onClick={() =>
                    setActiveBottomSheet({
                      title: `Rincian Kinerja: ${staff.salesName}`,
                      type: 'STAFF_DETAIL',
                      payload: staff,
                    })
                  }
                  className={`p-4 rounded-2xl border cursor-pointer hover:border-blue-500 transition ${
                    theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
                      {staff.salesName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="flex-1 truncate">
                      <h4 className="text-sm font-bold truncate">{staff.salesName}</h4>
                      <p className="text-[10px] text-gray-400">ID: {staff.salesId}</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400">#{idx + 1}</span>
                  </div>

                  <div className="text-base font-bold text-blue-400 mb-2">{formatCompactIDR(staff.totalSales)}</div>

                  {/* Sub-line mini grid */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] text-gray-400 pt-2 border-t border-gray-700/30">
                    <div>🍎 Apple: {formatCompactIDR(staff.apple)}</div>
                    <div>🤖 Android: {formatCompactIDR(staff.android)}</div>
                    <div>🔌 Acc: {formatCompactIDR(staff.acc)}</div>
                    <div>🛡️ VAS: {formatCompactIDR(staff.vas)}</div>
                  </div>

                  <div className="mt-2 text-right">
                    <span className="text-[10px] text-emerald-400 font-semibold">UPT: {staff.upt}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: DAILY TARGET                                        */}
        {/* ========================================================= */}
        {activeTab === 'dailyTarget' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-base sm:text-xl font-bold">Target Harian vs Pencapaian</h2>
                <p className="text-xs text-gray-400">Pencapaian hari ke-{hariBerjalan} dari {totalHariBulan} hari</p>
              </div>
              <button
                onClick={handleShareDailyWhatsApp}
                className="w-full sm:w-auto bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Share Target (WhatsApp)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div
                className={`p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
                }`}
              >
                <span className="text-xs text-gray-400">Target Hari Ini</span>
                <div className="text-lg font-bold mt-1">{formatCompactIDR(targetPerHari)}</div>
                <p className="text-[10px] text-gray-400 mt-1">Dihitung rata-rata harian bulan ini</p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
                }`}
              >
                <span className="text-xs text-gray-400">Target Catch Up (Run Rate Baru)</span>
                <div className="text-lg font-bold text-amber-400 mt-1">{formatCompactIDR(requiredRunRate)}</div>
                <p className="text-[10px] text-gray-400 mt-1">Harus dicapai tiap hari selama sisa {sisaHari} hari</p>
              </div>

              <div
                className={`p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
                }`}
              >
                <span className="text-xs text-gray-400">Sisa Target Bulan</span>
                <div className="text-lg font-bold text-purple-400 mt-1">
                  {formatCompactIDR(Math.max(0, targetBulan - totalStoreSales))}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Dari total target {formatCompactIDR(targetBulan)}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: BNPL (Buy Now Pay Later)                           */}
        {/* ========================================================= */}
        {activeTab === 'bnpl' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold">BNPL Database & Tender Breakdown</h2>
              <p className="text-xs text-gray-400">Rekapitulasi transaksi pembiayaan (Kredivo, Indodana, Akulaku, dsb.)</p>
            </div>

            {/* Tender Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Kredivo', 'Indodana', 'Akulaku', 'ShopeePayLater'].map((tender) => {
                const items = bnplData.filter((b) => b.tender.toLowerCase().includes(tender.toLowerCase()));
                const total = items.reduce((acc, curr) => acc + curr.amount, 0);
                return (
                  <div
                    key={tender}
                    className={`p-3.5 rounded-xl border ${
                      theme === 'dark' ? 'bg-[#22203F] border-purple-900/30' : 'bg-white border-gray-200'
                    }`}
                  >
                    <span className="text-xs text-gray-400">{tender}</span>
                    <div className="text-sm sm:text-base font-bold mt-1">{formatCompactIDR(total)}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{items.length} Transaksi</div>
                  </div>
                );
              })}
            </div>

            {/* BNPL Logs Table */}
            <div
              className={`rounded-2xl border p-3.5 ${
                theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className="text-xs font-bold mb-2">Riwayat Transaksi BNPL Terbaru</h3>
              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-xs">
                  <thead>
                    <tr className="border-b border-gray-700/40 text-gray-400 text-left">
                      <th className="w-20 py-2">Invoice</th>
                      <th className="py-2">Produk</th>
                      <th className="w-24 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/20">
                    {bnplData.slice(0, 8).map((b, idx) => (
                      <tr key={idx}>
                        <td className="py-2 text-gray-400 font-mono text-[11px] truncate pr-1">{b.invoice}</td>
                        <td className="py-2 truncate pr-2">{b.product}</td>
                        <td className="py-2 text-right font-medium text-emerald-400 truncate">{formatCompactIDR(b.amount)}</td>
                      </tr>
                    ))}
                    {bnplData.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-gray-400 text-xs">
                          Tidak ada data transaksi BNPL
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: SCHEDULE (Shift Kerja)                             */}
        {/* ========================================================= */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-xl font-bold">Jadwal Shift Staf Toko</h2>
                <p className="text-xs text-gray-400">
                  {currentSalesId === ADMIN_SALES_ID
                    ? 'Mode Admin: Anda memiliki akses penuh untuk mengubah shift'
                    : 'Mode Viewer: Hanya ID 22008089 yang dapat mengubah shift'}
                </p>
              </div>
            </div>

            {/* Shift Legend */}
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium">⛅ D047: Pagi (09-17)</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">☀️ D103: Siang (14-22)</span>
              <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-medium">🏠 OFF: Libur</span>
            </div>

            {/* Schedule Table (Fixed & Non-overflow) */}
            <div
              className={`rounded-2xl border p-3 ${
                theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
              }`}
            >
              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-700/40 text-gray-400 text-center">
                      <th className="text-left w-24 py-2">Nama</th>
                      <th>Sen</th>
                      <th>Sel</th>
                      <th>Rab</th>
                      <th>Kam</th>
                      <th>Jum</th>
                      <th>Sab</th>
                      <th>Min</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/20 text-center">
                    {Object.entries(scheduleData).map(([staff, days]) => (
                      <tr key={staff}>
                        <td className="text-left py-2 font-medium truncate pr-1">{staff}</td>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                          const shift = days[day];
                          return (
                            <td key={day} className="py-2">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded font-mono text-[9px] ${
                                  shift === 'D047'
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : shift === 'D103'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {shift}
                              </span>
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
        {/* TAB 7: PENCARIAN PRODUK                                   */}
        {/* ========================================================= */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-base sm:text-xl font-bold">Pencarian Transaksi Produk</h2>
              <p className="text-xs text-gray-400">Cari berdasarkan SKU/Article, Nama Deskripsi, atau Brand</p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik nama produk (misal: iPhone 17, Galaxy S26, Charger)..."
                className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition ${
                  theme === 'dark'
                    ? 'bg-[#22203F] border-purple-900/40 text-white focus:border-blue-500'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-600'
                }`}
              />
            </div>

            {/* Results */}
            <div
              className={`rounded-2xl border p-3 ${
                theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
              }`}
            >
              <div className="w-full overflow-hidden">
                <table className="w-full table-fixed text-xs">
                  <thead>
                    <tr className="border-b border-gray-700/40 text-gray-400 text-left">
                      <th className="py-2">Produk</th>
                      <th className="w-20 py-2">Sales</th>
                      <th className="w-8 py-2 text-center">Qty</th>
                      <th className="w-24 py-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/20">
                    {data
                      .filter((d) => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          d.sapDescription.toLowerCase().includes(q) ||
                          d.sapArticle.toLowerCase().includes(q) ||
                          d.brandName.toLowerCase().includes(q)
                        );
                      })
                      .slice(0, 15)
                      .map((d, i) => (
                        <tr key={i}>
                          <td className="py-2 pr-2">
                            <div className="font-medium truncate">{d.sapDescription}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{d.sapArticle}</div>
                          </td>
                          <td className="py-2 truncate pr-1 text-gray-400 text-[11px]">{d.salesName}</td>
                          <td className="py-2 text-center">{d.qty}</td>
                          <td className="py-2 text-right font-medium text-blue-400 truncate">
                            {formatCompactIDR(d.amount)}
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
        {/* TAB 8: FEEDBACK HARIAN                                    */}
        {/* ========================================================= */}
        {activeTab === 'feedback' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-base sm:text-xl font-bold">Feedback Penjualan Hari Ini 📊</h2>
                <p className="text-xs text-gray-400">Suara staf lapangan, kendala stok, dan ulasan transaksi</p>
              </div>
            </div>

            {/* Input Form Card */}
            <div
              className={`p-4 rounded-2xl border space-y-3 ${
                theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200'
              }`}
            >
              <h3 className="text-xs font-bold">+ Tulis Feedback Baru</h3>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedStaffFeedback}
                  onChange={(e) => setSelectedStaffFeedback(e.target.value)}
                  className={`text-xs p-2 rounded-lg border outline-none ${
                    theme === 'dark' ? 'bg-[#1A1831] border-purple-800 text-white' : 'bg-gray-50 border-gray-300'
                  }`}
                >
                  {staffLeaderboard.map((s) => (
                    <option key={s.salesName} value={s.salesName}>
                      {s.salesName}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newFeedbackMessage}
                  onChange={(e) => setNewFeedbackMessage(e.target.value)}
                  placeholder="Tulis kendala operasional, ketersediaan unit, atau feedback promo..."
                  className={`flex-1 text-xs p-2 rounded-lg border outline-none ${
                    theme === 'dark' ? 'bg-[#1A1831] border-purple-800 text-white' : 'bg-gray-50 border-gray-300'
                  }`}
                />
                <button
                  onClick={handleAddFeedback}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold"
                >
                  Kirim
                </button>
              </div>
            </div>

            {/* Feedback Reviews List */}
            <div className="space-y-3">
              {feedbacks.map((f) => (
                <div
                  key={f.id}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    theme === 'dark' ? 'bg-[#22203F] border-purple-900/40' : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-400">{f.salesName}</span>
                    <span className="text-[10px] text-gray-400">{f.timestamp}</span>
                  </div>
                  <p className="text-xs leading-relaxed">{f.message}</p>
                  {/* Reactions */}
                  <div className="flex space-x-1.5 pt-1">
                    {['👍', '🔥', '🧡'].map((emoji) => {
                      const count = f.reactions[emoji] || 0;
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleToggleReaction(f.id, emoji)}
                          className={`text-xs px-2 py-0.5 rounded-full border transition flex items-center space-x-1 ${
                            theme === 'dark'
                              ? 'border-purple-800 bg-white/5 hover:bg-white/10'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <span>{emoji}</span>
                          <span className="text-[10px] font-semibold">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* BOTTOM SHEET / SLIDING DRAWER MODAL                       */}
      {/* ========================================================= */}
      {activeBottomSheet.type !== 'NONE' && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className={`w-full max-w-lg rounded-t-3xl p-5 border-t space-y-4 shadow-2xl transition-transform max-h-[85vh] overflow-y-auto ${
              theme === 'dark' ? 'bg-[#1A1831] border-purple-900/50 text-white' : 'bg-white border-gray-200 text-gray-900'
            }`}
          >
            {/* Header Drawer */}
            <div className="flex justify-between items-center border-b pb-3 border-gray-700/30">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                <h3 className="text-sm font-bold truncate">{activeBottomSheet.title}</h3>
              </div>
              <button
                onClick={() => setActiveBottomSheet({ title: '', type: 'NONE', payload: null })}
                className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Drawer: STAFF DETAIL */}
            {activeBottomSheet.type === 'STAFF_DETAIL' && activeBottomSheet.payload && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-xl bg-white/5 border border-purple-800/30">
                    <span className="text-gray-400 text-[10px]">Total Sales</span>
                    <div className="text-base font-bold text-blue-400 mt-0.5">
                      {formatIDR(activeBottomSheet.payload.totalSales)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-purple-800/30">
                    <span className="text-gray-400 text-[10px]">UPT</span>
                    <div className="text-base font-bold text-emerald-400 mt-0.5">
                      {activeBottomSheet.payload.upt}
                    </div>
                  </div>
                </div>

                <h4 className="font-bold text-[11px] pt-1">Rincian Lini Produk:</h4>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between p-2 rounded bg-white/5">
                    <span>🍎 Apple Devices</span>
                    <span className="font-semibold">{formatIDR(activeBottomSheet.payload.apple)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/5">
                    <span>🤖 Android Devices</span>
                    <span className="font-semibold">{formatIDR(activeBottomSheet.payload.android)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/5">
                    <span>🔌 Accessories</span>
                    <span className="font-semibold">{formatIDR(activeBottomSheet.payload.acc)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-white/5">
                    <span>🛡️ VAS (Proteksi & Provider)</span>
                    <span className="font-semibold">{formatIDR(activeBottomSheet.payload.vas)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Content Drawer: KPI DETAIL */}
            {activeBottomSheet.type === 'KPI_DETAIL' && activeBottomSheet.payload && (
              <div className="space-y-3 text-xs">
                <p className="text-gray-400">
                  Total omset berjalan dihitung dari seluruh transaksi valid di sheet DATABASE tanpa konstanta tiruan.
                </p>
                <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/30">
                  <div className="text-lg font-bold text-blue-400">{formatIDR(activeBottomSheet.payload.value)}</div>
                  <div className="text-gray-400 text-[10px] mt-0.5">
                    Dari {activeBottomSheet.payload.invoices} faktur unik
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
