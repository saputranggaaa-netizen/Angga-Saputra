import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  BadgePercent,
  Package,
  Layers,
  Tag,
  Crosshair,
  Smartphone,
  ShieldAlert,
  ClipboardList,
  CreditCard,
  CheckSquare,
  FileSpreadsheet,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

export type SidebarMenuItem =
  | 'overview'
  | 'daily-sales'
  | 'daily-summary'
  | 'staff-performance'
  | 'est-incentive'
  | 'soh'
  | 'stokan'
  | 'price-list'
  | 'lob-target-fokus'
  | 'product-fokus'
  | 'vas-fokus'
  | 'android-fokus'
  | 'mading'
  | 'bnpl'
  | 'checklist-spv'
  | 'checklist-staff'
  | 'data-upload';

interface SidebarProps {
  activeItem: SidebarMenuItem;
  onSelectItem: (item: SidebarMenuItem) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenGoogleSheets: () => void;
  connectedSheetTitle?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeItem,
  onSelectItem,
  isMobileOpen,
  onCloseMobile,
  onOpenGoogleSheets,
  connectedSheetTitle,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState({
    dashboard: true,
    targetFokus: true,
    administrasi: true,
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const dashboardItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'daily-sales', label: 'Daily Sales', icon: Calendar },
    { id: 'daily-summary', label: 'Daily Summary', icon: FileText },
    { id: 'staff-performance', label: 'Staff Performance', icon: Users },
    { id: 'est-incentive', label: 'Est. Incentive', icon: BadgePercent },
    { id: 'soh', label: 'SOH', icon: Package },
    { id: 'stokan', label: 'Stokan', icon: Layers },
    { id: 'price-list', label: 'Price List', icon: Tag },
  ];

  const targetFokusItems = [
    { id: 'lob-target-fokus', label: 'LOB Target Fokus', icon: Crosshair },
    { id: 'product-fokus', label: 'Product Fokus 3PP', icon: Package },
    { id: 'vas-fokus', label: 'VAS Fokus', icon: ShieldAlert },
    { id: 'android-fokus', label: 'Android Fokus', icon: Smartphone },
  ];

  const administrasiItems = [
    { id: 'mading', label: 'Mading', icon: FileText },
    { id: 'bnpl', label: 'BNPL & Trade-In', icon: CreditCard },
    { id: 'checklist-spv', label: 'Checklist Store - SPV', icon: CheckSquare },
    { id: 'checklist-staff', label: 'Checklist Store - Staff', icon: CheckSquare },
    { id: 'data-upload', label: 'Data Upload (Google Sheets)', icon: FileSpreadsheet, isSheets: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen bg-[#0d1322] text-slate-300 flex flex-col border-r border-slate-800/80 transition-all duration-300 select-none ${
          collapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-[#2563eb] text-white font-extrabold flex items-center justify-center text-sm shadow-md shadow-blue-500/20 shrink-0">
              QF10
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="text-sm font-bold text-white tracking-tight truncate">
                  Digiplus Kota...
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">Sales Dashboard</p>
                {/* 3 Colored Dots like screenshot */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs font-medium scrollbar-thin scrollbar-thumb-slate-800">
          {/* Section 1: Dashboard */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection('dashboard')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-400" />
                {!collapsed && <span>Dashboard</span>}
              </span>
              {!collapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    openSections.dashboard ? '' : '-rotate-90'
                  }`}
                />
              )}
            </button>

            {openSections.dashboard && (
              <div className="space-y-0.5 pt-1">
                {dashboardItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectItem(item.id as SidebarMenuItem);
                        onCloseMobile();
                      }}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-[#1e293b] text-blue-400 font-bold border-l-3 border-blue-500 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Target Fokus */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection('targetFokus')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5 text-purple-400" />
                {!collapsed && <span>Target Fokus</span>}
              </span>
              {!collapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    openSections.targetFokus ? '' : '-rotate-90'
                  }`}
                />
              )}
            </button>

            {openSections.targetFokus && (
              <div className="space-y-0.5 pt-1">
                {targetFokusItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelectItem(item.id as SidebarMenuItem);
                        onCloseMobile();
                      }}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-[#1e293b] text-purple-400 font-bold border-l-3 border-purple-500'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Administrasi */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleSection('administrasi')}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors ${
                collapsed ? 'justify-center' : ''
              }`}
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="w-3.5 h-3.5 text-amber-400" />
                {!collapsed && <span>Administrasi</span>}
              </span>
              {!collapsed && (
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${
                    openSections.administrasi ? '' : '-rotate-90'
                  }`}
                />
              )}
            </button>

            {openSections.administrasi && (
              <div className="space-y-0.5 pt-1">
                {administrasiItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (item.isSheets) {
                          onOpenGoogleSheets();
                        } else {
                          onSelectItem(item.id as SidebarMenuItem);
                        }
                        onCloseMobile();
                      }}
                      title={item.label}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                        collapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-[#1e293b] text-amber-400 font-bold border-l-3 border-amber-500'
                          : item.isSheets
                          ? 'text-emerald-400 hover:bg-emerald-950/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          item.isSheets ? 'text-emerald-400' : isActive ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer - Connected Sheets Indicator */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
            <button
              type="button"
              onClick={onOpenGoogleSheets}
              className="w-full p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 hover:bg-emerald-900/40 text-left transition-colors flex items-center gap-2.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="truncate text-[11px]">
                <p className="font-bold text-emerald-300 truncate">
                  {connectedSheetTitle || 'Hubungkan Google Sheets'}
                </p>
                <p className="text-[10px] text-emerald-500">Sumber Data Aktif</p>
              </div>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
