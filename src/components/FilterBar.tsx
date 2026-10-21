import React from 'react';
import { Filter, Calendar, Users, MapPin, Tag, CheckSquare, Search, RotateCcw } from 'lucide-react';
import { FilterState, PeriodComparison } from '../types/sales';
import { PeriodComparisonIndicator } from './PeriodComparisonIndicator';

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  availableSalesReps: string[];
  availableCategories: string[];
  availableRegions: string[];
  totalRecordsCount: number;
  filteredCount: number;
  periodComparison?: PeriodComparison;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  availableSalesReps,
  availableCategories,
  availableRegions,
  totalRecordsCount,
  filteredCount,
  periodComparison,
}) => {
  const handleReset = () => {
    onChangeFilters({
      dateRange: 'all',
      salesRep: 'all',
      category: 'all',
      region: 'all',
      status: 'all',
      searchQuery: '',
    });
  };

  const isFiltered =
    filters.dateRange !== 'all' ||
    filters.salesRep !== 'all' ||
    filters.category !== 'all' ||
    filters.region !== 'all' ||
    filters.status !== 'all' ||
    filters.searchQuery.trim() !== '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-4 space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Left: Quick Date Pills & Visual Period Comparison Indicator */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0 mr-0.5 text-[11px] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Periode:
          </span>
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'today', label: 'Hari Ini' },
              { id: '7days', label: '7 Hari' },
              { id: 'month', label: 'Bulan Ini (MTD)' },
              { id: 'quarter', label: 'Kuartal (Q4)' },
            ].map((period) => {
              const isActive = filters.dateRange === period.id;
              return (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => onChangeFilters({ ...filters, dateRange: period.id as any })}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 whitespace-nowrap text-xs cursor-pointer ${
                    isActive
                      ? 'bg-white text-emerald-800 shadow-xs ring-1 ring-emerald-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {period.label}
                </button>
              );
            })}
          </div>

          {/* Inline Visual Indicator for Period Performance vs Previous Period */}
          {periodComparison && (
            <div className="shrink-0 ml-1">
              <PeriodComparisonIndicator comparison={periodComparison} compact={true} />
            </div>
          )}
        </div>

        {/* Right: Search & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi, klien, produk..."
              value={filters.searchQuery}
              onChange={(e) => onChangeFilters({ ...filters, searchQuery: e.target.value })}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              title="Reset semua filter"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Filters Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* Sales Rep Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50/90 hover:bg-white focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 px-3 py-1.5 rounded-xl border border-slate-200 transition-all shadow-2xs">
          <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <select
            value={filters.salesRep}
            onChange={(e) => onChangeFilters({ ...filters, salesRep: e.target.value })}
            className="w-full bg-transparent text-slate-800 font-semibold py-0.5 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Semua Tim Sales</option>
            {availableSalesReps.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <Tag className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.category}
            onChange={(e) => onChangeFilters({ ...filters, category: e.target.value })}
            className="w-full bg-transparent text-slate-700 font-medium py-1 focus:outline-hidden"
          >
            <option value="all">Semua Kategori</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Region Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.region}
            onChange={(e) => onChangeFilters({ ...filters, region: e.target.value })}
            className="w-full bg-transparent text-slate-700 font-medium py-1 focus:outline-hidden"
          >
            <option value="all">Semua Wilayah</option>
            {availableRegions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        {/* Deal Status Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <CheckSquare className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={filters.status}
            onChange={(e) => onChangeFilters({ ...filters, status: e.target.value })}
            className="w-full bg-transparent text-slate-700 font-medium py-1 focus:outline-hidden"
          >
            <option value="all">Semua Status Deal</option>
            <option value="Closed Won">Closed Won (Deal Berhasil)</option>
            <option value="Negotiation">Negosiasi</option>
            <option value="Proposal">Proposal / Penawaran</option>
            <option value="Lead">Lead / Prospek Baru</option>
            <option value="Closed Lost">Closed Lost (Gagal)</option>
          </select>
        </div>
      </div>

      {/* Record Counter indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
        <span>
          Menampilkan <strong className="text-slate-800">{filteredCount}</strong> dari {totalRecordsCount} data transaksi
        </span>
        {filters.salesRep !== 'all' && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
            Filter Aktif: {filters.salesRep}
            <button
              onClick={() => onChangeFilters({ ...filters, salesRep: 'all' })}
              className="hover:text-emerald-950 font-bold ml-1"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
};
