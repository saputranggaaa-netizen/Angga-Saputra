import React, { useState, useMemo } from 'react';
import {
  Table,
  ArrowUpDown,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  FileText,
  GitCommit,
  XCircle
} from 'lucide-react';
import { SalesRecord } from '../types/sales';
import { formatRupiah, formatDate } from '../utils/formatters';

interface SalesDataTableProps {
  records: SalesRecord[];
}

export const SalesDataTable: React.FC<SalesDataTableProps> = ({ records }) => {
  const [sortField, setSortField] = useState<keyof SalesRecord>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const handleSort = (field: keyof SalesRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const filteredAndSortedRecords = useMemo(() => {
    let result = records.filter((r) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;
      return (
        r.salesRep.toLowerCase().includes(q) ||
        r.customer.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });

    result.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return sortOrder === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    return result;
  }, [records, search, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedRecords.slice(start, start + pageSize);
  }, [filteredAndSortedRecords, currentPage, pageSize]);

  const handleExportCSV = () => {
    const headers = [
      'ID Transaksi',
      'Tanggal',
      'Nama Sales',
      'Customer',
      'Produk',
      'Kategori',
      'Wilayah',
      'Qty',
      'Harga Satuan',
      'Total Penjualan',
      'Status',
    ];

    const rows = filteredAndSortedRecords.map((r) => [
      r.id,
      r.date,
      `"${r.salesRep}"`,
      `"${r.customer}"`,
      `"${r.product}"`,
      `"${r.category}"`,
      `"${r.region}"`,
      r.quantity,
      r.unitPrice,
      r.totalRevenue,
      r.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data_penjualan_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderStatusBadge = (status: SalesRecord['status']) => {
    switch (status) {
      case 'Closed Won':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Won
          </span>
        );
      case 'Negotiation':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
            <GitCommit className="w-3 h-3" /> Nego
          </span>
        );
      case 'Proposal':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            <FileText className="w-3 h-3" /> Proposal
          </span>
        );
      case 'Lead':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
            <Clock className="w-3 h-3" /> Lead
          </span>
        );
      case 'Closed Lost':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
            <XCircle className="w-3 h-3" /> Lost
          </span>
        );
      default:
        return <span className="text-slate-600 text-xs">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
      {/* Table Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            Detail Catatan Transaksi Penjualan
          </h3>
          <p className="text-xs text-slate-500">
            Data mentah yang dibaca langsung dari Google Sheet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Ekspor CSV
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
              <th
                onClick={() => handleSort('date')}
                className="p-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Tanggal</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('salesRep')}
                className="p-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Sales Rep</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('customer')}
                className="p-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Klien / Customer</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('product')}
                className="p-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Produk</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('region')}
                className="p-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Wilayah</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 whitespace-nowrap text-right">Qty</th>
              <th
                onClick={() => handleSort('totalRevenue')}
                className="p-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Omzet</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="p-3 whitespace-nowrap text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                  Tidak ada catatan transaksi yang sesuai dengan filter.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {formatDate(record.date)}
                  </td>
                  <td className="p-3 whitespace-nowrap font-bold text-slate-900">
                    {record.salesRep}
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-700">
                    {record.customer}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    <span className="font-semibold text-slate-800">{record.product}</span>
                    <span className="block text-[10px] text-slate-400">{record.category}</span>
                  </td>
                  <td className="p-3 whitespace-nowrap text-slate-600">
                    {record.region}
                  </td>
                  <td className="p-3 whitespace-nowrap text-right text-slate-600 font-mono">
                    {record.quantity}
                  </td>
                  <td className="p-3 whitespace-nowrap text-right font-extrabold text-emerald-700 font-mono">
                    {formatRupiah(record.totalRevenue)}
                  </td>
                  <td className="p-3 whitespace-nowrap text-center">
                    {renderStatusBadge(record.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Halaman <strong className="text-slate-800">{currentPage}</strong> dari{' '}
          <strong className="text-slate-800">{totalPages}</strong> ({filteredAndSortedRecords.length} total baris)
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white text-slate-600 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
