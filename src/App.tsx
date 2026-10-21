import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  logout,
} from './services/firebase';
import {
  getSpreadsheetDetails,
  getSpreadsheetValues,
} from './services/sheetsApi';
import {
  SalesRecord,
  SheetMetadata,
  ColumnMapping,
} from './types/sales';
import { MOCK_SALES_DATA } from './data/mockSalesData';
import { DEFAULT_STORE_DATA, deriveStoreDataFromRecords } from './data/storeData';
import { parseSheetData } from './utils/parser';

// Components matching exact screenshot design
import { Sidebar, SidebarMenuItem } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { SubNavTabs, SubNavTabType } from './components/SubNavTabs';
import { PeriodBar } from './components/PeriodBar';
import { StorePerformanceSection } from './components/StorePerformanceSection';
import { TeamPerformanceSection } from './components/TeamPerformanceSection';

// Charts and secondary views
import { SalesTrendChart } from './components/SalesTrendChart';
import { SalesDataTable } from './components/SalesDataTable';
import { SheetPickerModal } from './components/SheetPickerModal';
import { TemplateGuideModal } from './components/TemplateGuideModal';
import { ColumnMapperModal } from './components/ColumnMapperModal';
import { AlertCircle, CheckCircle, Sparkles, FileSpreadsheet } from 'lucide-react';
import { formatRupiah } from './utils/formatters';

export default function App() {
  // Navigation State
  const [activeSidebarItem, setActiveSidebarItem] = useState<SidebarMenuItem>('overview');
  const [activeSubNavTab, setActiveSubNavTab] = useState<SubNavTabType>('bulanan');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('2026-10');

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Google Sheets Data State
  const [isDemoData, setIsDemoData] = useState(true);
  const [sheetMeta, setSheetMeta] = useState<SheetMetadata | null>(null);
  const [rawSheetValues, setRawSheetValues] = useState<string[][]>([]);
  const [sheetHeaders, setSheetHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    date: 'Tanggal',
    salesRep: 'Nama Sales',
    customer: 'Customer',
    product: 'Produk',
    category: 'Kategori',
    region: 'Wilayah',
    quantity: 'Qty',
    unitPrice: 'Harga Satuan',
    totalRevenue: 'Total Penjualan',
    target: 'Target',
    status: 'Status',
  });

  const [allRecords, setAllRecords] = useState<SalesRecord[]>(MOCK_SALES_DATA);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  // Modals State
  const [isSheetPickerOpen, setIsSheetPickerOpen] = useState(false);
  const [isTemplateGuideOpen, setIsTemplateGuideOpen] = useState(false);
  const [isColumnMapperOpen, setIsColumnMapperOpen] = useState(false);

  // Toast notification helper
  const showNotification = useCallback(
    (type: 'success' | 'error' | 'info', message: string) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 4500);
    },
    []
  );

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setCurrentUser(res.user);
        showNotification(
          'success',
          `Berhasil masuk sebagai ${res.user.displayName || res.user.email}`
        );
      }
    } catch (err: any) {
      console.error(err);
      showNotification('error', err?.message || 'Gagal login dengan akun Google');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentUser(null);
      showNotification('info', 'Anda telah keluar dari akun Google.');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Connect Google Sheet
  const handleConnectSheet = async (
    spreadsheetId: string,
    sheetTitle: string,
    selectedTab: string,
    allTabs: string[]
  ) => {
    setIsRefreshing(true);
    try {
      const values = await getSpreadsheetValues(spreadsheetId, selectedTab);
      if (!values || values.length < 2) {
        throw new Error(
          `Tab "${selectedTab}" tidak memiliki cukup baris data (minimal 1 baris header dan 1 baris data).`
        );
      }

      setRawSheetValues(values);
      const parsed = parseSheetData(values);
      setSheetHeaders(parsed.headers);
      setColumnMapping(parsed.mapping);
      setAllRecords(parsed.records);
      setIsDemoData(false);
      setSheetMeta({
        id: spreadsheetId,
        title: sheetTitle,
        sheetTabs: allTabs,
        selectedTab,
        lastUpdated: new Date().toISOString(),
      });

      showNotification(
        'success',
        `Berhasil memuat ${parsed.records.length} data transaksi dari Google Sheet "${sheetTitle}"`
      );
    } catch (err: any) {
      console.error(err);
      showNotification('error', err?.message || 'Gagal membaca isi Google Sheet.');
      throw err;
    } finally {
      setIsRefreshing(false);
    }
  };

  // Refresh data
  const handleRefreshData = async () => {
    if (isDemoData) {
      setIsRefreshing(true);
      setTimeout(() => {
        setIsRefreshing(false);
        showNotification('success', 'Data penjualan berhasil diperbarui.');
      }, 400);
      return;
    }

    if (!sheetMeta) return;
    setIsRefreshing(true);
    try {
      const values = await getSpreadsheetValues(sheetMeta.id, sheetMeta.selectedTab);
      setRawSheetValues(values);
      const parsed = parseSheetData(values, columnMapping);
      setAllRecords(parsed.records);
      showNotification('success', `Data diperbarui dari Google Sheets (${parsed.records.length} baris).`);
    } catch (err: any) {
      console.error(err);
      showNotification('error', err?.message || 'Gagal memperbarui data dari Google Sheets.');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate store overview data
  const storeData = useMemo(() => {
    if (isDemoData) {
      return DEFAULT_STORE_DATA;
    }
    return deriveStoreDataFromRecords(allRecords);
  }, [isDemoData, allRecords]);

  // View title helper
  const getViewTitle = () => {
    switch (activeSidebarItem) {
      case 'overview':
        return 'Overview';
      case 'daily-sales':
        return 'Daily Sales';
      case 'daily-summary':
        return 'Daily Summary';
      case 'staff-performance':
        return 'Staff Performance';
      case 'est-incentive':
        return 'Est. Incentive';
      case 'soh':
        return 'SOH (Stock On Hand)';
      case 'stokan':
        return 'Stokan Toko';
      case 'price-list':
        return 'Price List';
      case 'lob-target-fokus':
        return 'LOB Target Fokus';
      case 'product-fokus':
        return 'Product Fokus 3PP';
      case 'vas-fokus':
        return 'VAS Fokus';
      case 'android-fokus':
        return 'Android Fokus';
      default:
        return 'Overview';
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`p-3.5 rounded-xl shadow-xl border text-xs font-semibold flex items-center gap-2.5 ${
              notification.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : notification.type === 'error'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : notification.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            )}
            <div className="flex-1">{notification.message}</div>
          </div>
        </div>
      )}

      {/* Left Sidebar */}
      <Sidebar
        activeItem={activeSidebarItem}
        onSelectItem={(item) => {
          if (item === 'data-upload') {
            setIsSheetPickerOpen(true);
          } else {
            setActiveSidebarItem(item);
          }
        }}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenGoogleSheets={() => setIsSheetPickerOpen(true)}
        connectedSheetTitle={sheetMeta?.title}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar */}
        <TopNav
          storeCode={storeData.storeCode}
          activeViewTitle={getViewTitle()}
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onRefresh={handleRefreshData}
          isRefreshing={isRefreshing}
          onLogout={handleLogout}
          currentUser={currentUser}
          onOpenSheetsModal={() => setIsSheetPickerOpen(true)}
          sheetTitle={sheetMeta?.title}
          selectedTab={sheetMeta?.selectedTab}
        />

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Top Sub-Nav Tabs: Overview Bulanan, MTM Overview, YTD Overview, Compare 2025 vs 2026 */}
          <SubNavTabs
            activeTab={activeSubNavTab}
            onChangeTab={setActiveSubNavTab}
          />

          {/* Period Selector Card: PERIODE, Bulan Berjalan, Pilih Bulan, Oktober 2026 */}
          <PeriodBar
            periodLabel={storeData.periodLabel}
            dateInfo={storeData.periodDateInfo}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
          />

          {/* Conditional Views based on Sidebar Selection */}
          {activeSidebarItem === 'overview' && (
            <>
              {/* Store Performance Section (TOTAL SALES + APPLE, ANDROID, ACCESSORIES, VAS) */}
              <StorePerformanceSection
                data={storeData}
                onSelectLob={(lobId) => {
                  showNotification('info', `Menampilkan rincian kategori ${lobId.toUpperCase()}`);
                }}
              />

              {/* Team Performance Section (6 KPI cards + Staff table) */}
              <TeamPerformanceSection
                data={storeData}
                onSelectStaff={(staffName) => {
                  showNotification('info', `Memfilter performa staf ${staffName}`);
                }}
              />
            </>
          )}

          {activeSidebarItem === 'daily-sales' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Tren Penjualan Harian (Daily Sales)</h3>
                <p className="text-xs text-slate-500 mb-4">Grafik fluktuasi omzet harian toko Digiplus</p>
                <SalesTrendChart records={allRecords} />
              </div>
              <SalesDataTable records={allRecords} />
            </div>
          )}

          {activeSidebarItem === 'staff-performance' && (
            <div className="space-y-6">
              <TeamPerformanceSection data={storeData} />
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-1">Catatan Transaksi Penjualan Tim</h3>
                <p className="text-xs text-slate-500 mb-4">Data lengkap setiap transaksi per staf</p>
                <SalesDataTable records={allRecords} />
              </div>
            </div>
          )}

          {activeSidebarItem === 'est-incentive' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900">Perhitungan Estimasi Insentif Toko QF10</h3>
              <p className="text-xs text-slate-500">
                Skema insentif dihitung berdasarkan pencapaian target individual dan poin toko (66,5/100 pts).
              </p>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                      <th className="p-3">Nama Staf</th>
                      <th className="p-3">Peran</th>
                      <th className="p-3 text-right">Penjualan Aktual</th>
                      <th className="p-3 text-center">Pencapaian</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Estimasi Insentif</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storeData.staffList.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{s.name}</td>
                        <td className="p-3 text-slate-500">{s.role}</td>
                        <td className="p-3 text-right font-mono font-bold">{formatRupiah(s.totalSales)}</td>
                        <td className="p-3 text-center font-bold text-emerald-700">{s.achievementPercent}%</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.status === 'Productive' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-extrabold text-emerald-700">
                          {formatRupiah(s.estIncentive)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeSidebarItem === 'lob-target-fokus' ||
            activeSidebarItem === 'product-fokus' ||
            activeSidebarItem === 'vas-fokus' ||
            activeSidebarItem === 'android-fokus') && (
            <div className="space-y-6">
              <StorePerformanceSection data={storeData} />
            </div>
          )}

          {/* Google Sheets Live Data Banner */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-tight">
                  {sheetMeta ? `Terhubung: ${sheetMeta.title}` : 'Koneksi Sumber Data Google Sheets'}
                </h4>
                <p className="text-[11px] text-slate-400">
                  {sheetMeta
                    ? `Tab aktif: ${sheetMeta.selectedTab} · Otomatis disinkronkan ke metrik toko`
                    : 'Hubungkan spreadsheet Google Drive toko Anda untuk memperbarui data penjualan aktual secara live.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsTemplateGuideOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg transition-colors border border-white/10 cursor-pointer"
              >
                Format Kolom
              </button>
              <button
                type="button"
                onClick={() => setIsSheetPickerOpen(true)}
                className="px-3.5 py-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                {sheetMeta ? 'Ganti Sheet' : 'Hubungkan Sheets'}
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Modals for Google Sheets Integration */}
      <SheetPickerModal
        isOpen={isSheetPickerOpen}
        onClose={() => setIsSheetPickerOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        isLoggingIn={isLoggingIn}
        onSelectSheet={handleConnectSheet}
        onLoadDemo={() => {
          setIsDemoData(true);
          setSheetMeta(null);
          showNotification('info', 'Menggunakan data demo toko Digiplus QF10');
        }}
        currentSpreadsheetId={sheetMeta?.id}
        currentTab={sheetMeta?.selectedTab}
      />

      <TemplateGuideModal
        isOpen={isTemplateGuideOpen}
        onClose={() => setIsTemplateGuideOpen(false)}
        onLoadDemoData={() => {
          setIsDemoData(true);
          setSheetMeta(null);
          showNotification('info', 'Menggunakan data demo toko Digiplus QF10');
        }}
      />

      <ColumnMapperModal
        isOpen={isColumnMapperOpen}
        onClose={() => setIsColumnMapperOpen(false)}
        headers={
          sheetHeaders.length > 0
            ? sheetHeaders
            : [
                'Tanggal',
                'Nama Sales',
                'Customer',
                'Produk',
                'Kategori',
                'Wilayah',
                'Qty',
                'Harga Satuan',
                'Total Penjualan',
                'Target',
                'Status',
              ]
        }
        currentMapping={columnMapping}
        onSaveMapping={(newMap) => {
          setColumnMapping(newMap);
          if (rawSheetValues.length > 0) {
            const parsed = parseSheetData(rawSheetValues, newMap);
            setAllRecords(parsed.records);
            showNotification('success', 'Pemetaan kolom diterapkan.');
          }
        }}
      />
    </div>
  );
}
