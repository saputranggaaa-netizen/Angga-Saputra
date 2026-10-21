import React from 'react';
import {
  Menu,
  Moon,
  Sun,
  RefreshCw,
  LogOut,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { User } from 'firebase/auth';

interface TopNavProps {
  storeCode: string;
  activeViewTitle: string;
  onOpenMobileMenu: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onLogout: () => void;
  currentUser: User | null;
  onOpenSheetsModal: () => void;
  sheetTitle?: string;
  selectedTab?: string;
}

export const TopNav: React.FC<TopNavProps> = ({
  storeCode = 'QF10',
  activeViewTitle = 'Overview',
  onOpenMobileMenu,
  onRefresh,
  isRefreshing,
  onLogout,
  currentUser,
  onOpenSheetsModal,
  sheetTitle,
  selectedTab,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 3 Colored Dots + Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>

          <span className="font-bold text-slate-700 ml-1">{storeCode}</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-900">{activeViewTitle}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Google Sheets Live Status Pill */}
        <button
          type="button"
          onClick={onOpenSheetsModal}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800 transition-colors shadow-2xs"
          title="Kelola koneksi data Google Sheets"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
          <span className="truncate max-w-[130px]">
            {sheetTitle ? `${sheetTitle} (${selectedTab || 'Sheet1'})` : 'Google Sheets'}
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </button>

        {/* Dark Mode toggle icon button */}
        <button
          type="button"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200/80 shadow-2xs"
          title="Toggle Mode Tampilan"
        >
          <Moon className="w-4 h-4" />
        </button>

        {/* Perbarui (Refresh) Button */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-xl transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
          <span>Perbarui</span>
        </button>

        {/* Keluar (Logout) Button */}
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-white hover:bg-rose-50 border border-rose-200/90 rounded-xl transition-colors shadow-2xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
