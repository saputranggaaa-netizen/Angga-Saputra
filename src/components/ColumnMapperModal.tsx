import React, { useState } from 'react';
import { X, Check, Sliders, AlertCircle } from 'lucide-react';
import { ColumnMapping } from '../types/sales';

interface ColumnMapperModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  currentMapping: ColumnMapping;
  onSaveMapping: (mapping: ColumnMapping) => void;
}

export const ColumnMapperModal: React.FC<ColumnMapperModalProps> = ({
  isOpen,
  onClose,
  headers,
  currentMapping,
  onSaveMapping,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...currentMapping });

  if (!isOpen) return null;

  const handleChange = (field: keyof ColumnMapping, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSaveMapping(mapping);
    onClose();
  };

  const requiredFields: Array<{ key: keyof ColumnMapping; label: string; desc: string; required?: boolean }> = [
    { key: 'totalRevenue', label: 'Total Penjualan / Omset', desc: 'Kolom nominal angka penjualan (Wajib)', required: true },
    { key: 'salesRep', label: 'Nama Sales / PIC', desc: 'Nama perwakilan tim penjualan', required: true },
    { key: 'date', label: 'Tanggal Transaksi', desc: 'Kolom tanggal transaksi (YYYY-MM-DD atau DD/MM/YYYY)', required: true },
    { key: 'product', label: 'Nama Produk / Jasa', desc: 'Nama barang atau layanan', required: false },
    { key: 'category', label: 'Kategori Produk', desc: 'Kategori untuk segmentasi produk', required: false },
    { key: 'region', label: 'Wilayah / Cabang', desc: 'Kota, area atau cabang penjualan', required: false },
    { key: 'customer', label: 'Nama Pelanggan / Klien', desc: 'Perusahaan atau pembeli', required: false },
    { key: 'target', label: 'Target Penjualan', desc: 'Target kuota nominal penjualan', required: false },
    { key: 'status', label: 'Status Deal / Transaksi', desc: 'Closed Won, Negotiation, Proposal, dll.', required: false },
    { key: 'quantity', label: 'Jumlah / Qty', desc: 'Banyaknya unit barang terjual', required: false },
    { key: 'unitPrice', label: 'Harga Satuan', desc: 'Harga per item produk', required: false },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Petakan Kolom Data (Mapping)</h3>
              <p className="text-xs text-slate-500">Sesuaikan kolom di Google Sheet Anda dengan metriks dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-500">
            Pilihlah kolom dari spreadsheet Anda yang sesuai dengan masing-masing data di bawah:
          </p>

          <div className="space-y-3">
            {requiredFields.map((field) => (
              <div
                key={field.key}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{field.label}</span>
                    {field.required && (
                      <span className="text-[10px] text-rose-500 font-semibold">*Wajib</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">{field.desc}</p>
                </div>
                <select
                  value={mapping[field.key] || ''}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  className="w-full sm:w-48 px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Tidak Dipetakan --</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Check className="w-3.5 h-3.5" />
            Terapkan Pemetaan
          </button>
        </div>
      </div>
    </div>
  );
};
