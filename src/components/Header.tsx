import React, { useState } from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  ChevronDown,
  Layers,
  HelpCircle,
  Sliders,
  CheckCircle2,
  Database
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GoogleSignInButton } from './GoogleSignInButton';
import { SheetMetadata, PeriodComparison } from '../types/sales';
import { PeriodComparisonIndicator } from './PeriodComparisonIndicator';

interface HeaderProps {
  currentUser: User | null;
  onLogin: () => Promise<void>;
  onLogout: () => Promise<void>;
  isLoggingIn: boolean;
  sheetMeta: SheetMetadata | null;
  isDemoData: boolean;
  onOpenSheetPicker: () => void;
  onOpenTemplateGuide: () => void;
  onOpenColumnMapper: () => void;
  onRefreshData: () => Promise<void>;
  isRefreshing: boolean;
  onSwitchTab: (tabName: string) => Promise<void>;
  lastSynced: Date | null;
  periodComparison?: PeriodComparison;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogin,
  onLogout,
  isLoggingIn,
  sheetMeta,
  isDemoData,
  onOpenSheetPicker,
  onOpenTemplateGuide,
  onOpenColumnMapper,
  onRefreshData,
  isRefreshing,
  onSwitchTab,
  lastSynced,
  periodComparison,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  SalesPulse
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                  Sheets Live
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Dashboard Penjualan & Sales Performance
              </p>
            </div>
          </div>

          {/* Period Performance vs Previous Period Comparison Indicator (Header) */}
          {periodComparison && (
            <div className="hidden md:flex items-center">
              <PeriodComparisonIndicator comparison={periodComparison} compact={false} />
            </div>
          )}

          {/* Connected Google Sheet Information */}
          <div className="flex items-center gap-2 max-w-md overflow-hidden">
            {sheetMeta && !isDemoData ? (
              <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-colors">
                <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="truncate text-left max-w-[150px] sm:max-w-[200px]">
                  <p className="font-bold text-slate-800 text-[11px] truncate" title={sheetMeta.title}>
                    {sheetMeta.title}
                  </p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                    <Layers className="w-3 h-3 text-emerald-600" />
                    {sheetMeta.sheetTabs.length > 1 ? (
                      <select
                        value={sheetMeta.selectedTab}
                        onChange={(e) => onSwitchTab(e.target.value)}
                        className="bg-transparent font-medium text-emerald-700 hover:underline cursor-pointer focus:outline-hidden"
                      >
                        {sheetMeta.sheetTabs.map((tab) => (
                          <option key={tab} value={tab}>
                            {tab}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>{sheetMeta.selectedTab}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenSheetPicker}
                  className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 hover:bg-white rounded-md transition-colors"
                  title="Ganti spreadsheet"
                >
                  Ubah
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 p-1 bg-amber-50 border border-amber-200/80 rounded-xl text-xs">
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <div className="hidden md:block text-left pr-1">
                  <span className="font-bold text-amber-900 text-[11px] block">Mode Data Demo</span>
                  <span className="text-[10px] text-amber-700">Retail & B2B Indonesia</span>
                </div>
                <button
                  type="button"
                  onClick={onOpenSheetPicker}
                  className="px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Hubungkan Sheets Anda
                </button>
              </div>
            )}

            {/* Refresh Button */}
            <button
              type="button"
              onClick={onRefreshData}
              disabled={isRefreshing}
              title={`Sinkronkan data ${lastSynced ? `(Terakhir: ${lastSynced.toLocaleTimeString('id-ID')})` : ''}`}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          {/* Actions & User Profile */}
          <div className="flex items-center gap-2">
            {/* Guide & Column Mapping Buttons */}
            <button
              type="button"
              onClick={onOpenTemplateGuide}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Panduan Format Google Sheets"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenColumnMapper}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Sesuaikan Pemetaan Kolom"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-1 pl-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || 'User'}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-emerald-500/30"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[100px] truncate">
                    {currentUser.displayName || currentUser.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.displayName || 'Akun Google'}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenSheetPicker();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      Pilih Spreadsheet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Keluar (Sign Out)
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <GoogleSignInButton
                onClick={onLogin}
                isLoading={isLoggingIn}
                label="Masuk Google"
                className="py-1.5 px-3 text-xs"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
