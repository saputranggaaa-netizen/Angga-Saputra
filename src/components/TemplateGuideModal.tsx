import React, { useState } from 'react';
import { X, Copy, Check, Table, Download, Sparkles, FileSpreadsheet } from 'lucide-react';

interface TemplateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDemoData: () => void;
}

const TEMPLATE_HEADERS = [
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
  'Catatan'
];

const SAMPLE_ROWS = [
  ['2026-10-15', 'Budi Santoso', 'PT Maju Terus', 'Enterprise ERP', 'Software & Cloud', 'DKI Jakarta', '1', '125000000', '125000000', '120000000', 'Closed Won', 'Deal Q4'],
  ['2026-10-16', 'Siti Rahmawati', 'CV Sentosa', 'Cloud Hosting', 'Software & Cloud', 'Surabaya', '2', '28000000', '56000000', '50000000', 'Closed Won', 'Termin 1'],
  ['2026-10-17', 'Dimas Wicaksono', 'PT Graha Logistik', 'Fleet IoT Package', 'Hardware & IoT', 'Bandung', '20', '3200000', '64000000', '60000000', 'Closed Won', 'Termasuk GPS'],
  ['2026-10-18', 'Dewi Lestari', 'RS Sehat Bahagia', 'Medical License', 'Healthcare Tech', 'Yogyakarta', '1', '45000000', '45000000', '50000000', 'Negotiation', 'Follow up Direksi'],
];

export const TemplateGuideModal: React.FC<TemplateGuideModalProps> = ({
  isOpen,
  onClose,
  onLoadDemoData,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyHeaders = () => {
    const headerStr = TEMPLATE_HEADERS.join('\t');
    navigator.clipboard.writeText(headerStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      TEMPLATE_HEADERS.join(','),
      ...SAMPLE_ROWS.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_sales_performance.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Format Google Sheets yang Didukung</h3>
              <p className="text-xs text-slate-500">
                Dashboard otomatis mendeteksi kolom penjualan Anda secara fleksibel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-900">
            <h4 className="font-semibold text-emerald-950 flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Sistem Cerdas Pendeteksi Kolom
            </h4>
            <p className="text-xs leading-relaxed text-emerald-800">
              Anda tidak perlu mengubah nama kolom persis sama. Sistem kami secara otomatis mengenali variasi nama kolom seperti <em>Tanggal/Date</em>, <em>Nama Sales/Salesperson</em>, <em>Omset/Total Revenue/Pendapatan</em>, <em>Kategori</em>, <em>Wilayah/Region</em>, dan <em>Target</em>.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                <Table className="w-4 h-4 text-slate-600" />
                Daftar Kolom Standar Rekomendasi
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyHeaders}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Tersalin ke Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Salin Header Kolom
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh CSV Contoh
                </button>
              </div>
            </div>

            {/* Table Preview */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                    {TEMPLATE_HEADERS.map((header) => (
                      <th key={header} className="p-2.5 whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {SAMPLE_ROWS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      {row.map((cell, c) => (
                        <td key={c} className="p-2.5 whitespace-nowrap text-slate-600">
                          {c === 7 || c === 8 || c === 9
                            ? `Rp ${parseInt(cell).toLocaleString('id-ID')}`
                            : cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              *Tips: Nilai uang bisa ditulis dalam format angka polos (contoh: 125000000) atau berformat Rupiah (Rp 125.000.000). Sistem akan otomatis membersihkan simbol.
            </p>
          </div>

          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-800 text-xs">Belum punya data Google Sheet siap?</p>
              <p className="text-xs text-slate-500">
                Gunakan dataset demo sales retail & B2B Indonesia untuk mencoba semua fitur dashboard.
              </p>
            </div>
            <button
              onClick={() => {
                onLoadDemoData();
                onClose();
              }}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 rounded-lg transition-colors"
            >
              Gunakan Data Demo B2B Indonesia
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
