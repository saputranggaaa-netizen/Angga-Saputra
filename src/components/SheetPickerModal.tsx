import React, { useState, useEffect } from 'react';
import {
  X,
  FileSpreadsheet,
  Search,
  ExternalLink,
  Layers,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  listDriveSpreadsheets,
  getSpreadsheetDetails,
  DriveSpreadsheetFile,
  extractSpreadsheetId
} from '../services/sheetsApi';
import { GoogleSignInButton } from './GoogleSignInButton';
import { User } from 'firebase/auth';

interface SheetPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: () => Promise<void>;
  isLoggingIn: boolean;
  onSelectSheet: (spreadsheetId: string, sheetTitle: string, selectedTab: string, allTabs: string[]) => Promise<void>;
  onLoadDemo: () => void;
  currentSpreadsheetId?: string;
  currentTab?: string;
}

export const SheetPickerModal: React.FC<SheetPickerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  isLoggingIn,
  onSelectSheet,
  onLoadDemo,
  currentSpreadsheetId,
  currentTab,
}) => {
  const [activeMode, setActiveMode] = useState<'drive' | 'url'>('drive');
  const [driveFiles, setDriveFiles] = useState<DriveSpreadsheetFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Manual URL/ID state
  const [manualInput, setManualInput] = useState('');
  const [selectedFileId, setSelectedFileId] = useState<string>(currentSpreadsheetId || '');
  const [selectedFileTitle, setSelectedFileTitle] = useState<string>('');
  const [availableTabs, setAvailableTabs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>(currentTab || '');
  const [isLoadingTabs, setIsLoadingTabs] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load drive spreadsheets when modal opens or user logs in
  useEffect(() => {
    if (isOpen && currentUser && activeMode === 'drive') {
      fetchDriveFiles();
    }
  }, [isOpen, currentUser, activeMode]);

  const fetchDriveFiles = async () => {
    setIsLoadingFiles(true);
    setError(null);
    try {
      const files = await listDriveSpreadsheets();
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal memuat berkas spreadsheet dari Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSelectFileFromDrive = async (file: DriveSpreadsheetFile) => {
    setSelectedFileId(file.id);
    setSelectedFileTitle(file.name);
    await loadTabsForFile(file.id, file.name);
  };

  const loadTabsForFile = async (fileId: string, titleHint?: string) => {
    setIsLoadingTabs(true);
    setError(null);
    try {
      const details = await getSpreadsheetDetails(fileId);
      setSelectedFileTitle(details.title || titleHint || 'Spreadsheet');
      setAvailableTabs(details.tabs);
      setSelectedTab(details.tabs[0] || 'Sheet1');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal membaca tab dari spreadsheet ini.');
      setAvailableTabs([]);
    } finally {
      setIsLoadingTabs(false);
    }
  };

  const handleInspectManualInput = async () => {
    if (!manualInput.trim()) return;
    const cleanId = extractSpreadsheetId(manualInput);
    if (!cleanId) {
      setError('Format link atau ID spreadsheet tidak valid.');
      return;
    }
    setSelectedFileId(cleanId);
    await loadTabsForFile(cleanId);
  };

  const handleConfirmConnect = async () => {
    if (!selectedFileId || !selectedTab) return;
    setIsConnecting(true);
    setError(null);
    try {
      await onSelectSheet(
        selectedFileId,
        selectedFileTitle || 'Google Sheet Penjualan',
        selectedTab,
        availableTabs.length > 0 ? availableTabs : [selectedTab]
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Gagal menghubungkan dan membaca data spreadsheet.');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  const filteredFiles = driveFiles.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Hubungkan Sumber Google Sheets</h3>
              <p className="text-xs text-slate-500">Pilih spreadsheet penjualan dari Drive atau masukkan URL dokumen</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth prompt if not logged in */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h4 className="text-base font-bold text-slate-900">
                Masuk dengan Akun Google
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Untuk membaca berkas Google Sheets secara aman langsung dari akun Anda, silakan hubungkan akun Google terlebih dahulu.
              </p>
            </div>

            <div className="pt-2 flex flex-col items-center gap-3">
              <GoogleSignInButton onClick={onLogin} isLoading={isLoggingIn} label="Lanjutkan dengan Google" />
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>atau</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onLoadDemo();
                  onClose();
                }}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-4"
              >
                Gunakan Data Demo B2B Indonesia dulu
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{error}</div>
              </div>
            )}

            {/* Mode Tabs */}
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveMode('drive')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeMode === 'drive'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                Pilih dari Google Drive
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('url')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
                  activeMode === 'url'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-4 h-4 text-emerald-600" />
                Masukkan Link / ID Sheet
              </button>
            </div>

            {/* Mode 1: Drive Files List */}
            {activeMode === 'drive' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama spreadsheet di Drive..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={fetchDriveFiles}
                    disabled={isLoadingFiles}
                    title="Segarkan daftar Drive"
                    className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                  {isLoadingFiles ? (
                    <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Memuat spreadsheet dari Google Drive Anda...</span>
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                      <FileSpreadsheet className="w-8 h-8 mx-auto text-slate-300" />
                      <p>Tidak ada berkas Google Sheets ditemukan di Drive Anda.</p>
                      <button
                        onClick={() => setActiveMode('url')}
                        className="text-emerald-600 font-semibold hover:underline"
                      >
                        Atau masukkan link langsung
                      </button>
                    </div>
                  ) : (
                    filteredFiles.map((file) => {
                      const isSelected = selectedFileId === file.id;
                      return (
                        <div
                          key={file.id}
                          onClick={() => handleSelectFileFromDrive(file)}
                          className={`p-3 flex items-center justify-between cursor-pointer transition-colors text-xs ${
                            isSelected
                              ? 'bg-emerald-50/80 border-l-4 border-emerald-600 text-emerald-950'
                              : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 truncate">
                            <FileSpreadsheet className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                            <div className="truncate">
                              <p className="font-semibold truncate">{file.name}</p>
                              <p className="text-[10px] text-slate-400">
                                Diperbarui: {new Date(file.modifiedTime).toLocaleDateString('id-ID')}
                              </p>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Mode 2: Manual URL / ID */}
            {activeMode === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Tautan Google Sheets atau Spreadsheet ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Contoh: https://docs.google.com/spreadsheets/d/1BxiMVs0X.../edit"
                    className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleInspectManualInput}
                    disabled={!manualInput.trim() || isLoadingTabs}
                    className="px-4 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoadingTabs ? 'Mengecek...' : 'Periksa'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Pastikan akun Google yang Anda gunakan memiliki akses baca (View) ke spreadsheet tersebut.
                </p>
              </div>
            )}

            {/* Sheet Tab Selection (Once file is selected) */}
            {selectedFileId && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Berkas Terpilih</span>
                    <h5 className="text-xs font-bold text-slate-800 truncate max-w-sm">
                      {selectedFileTitle || selectedFileId}
                    </h5>
                  </div>
                  {isLoadingTabs && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                      <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                      <span>Mengambil tab...</span>
                    </div>
                  )}
                </div>

                {availableTabs.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      Pilih Lembar Kerja (Tab Sheet):
                    </label>
                    <select
                      value={selectedTab}
                      onChange={(e) => setSelectedTab(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableTabs.map((tab) => (
                        <option key={tab} value={tab}>
                          {tab}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              onLoadDemo();
              onClose();
            }}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Pakai Data Demo
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            {currentUser && (
              <button
                type="button"
                onClick={handleConfirmConnect}
                disabled={!selectedFileId || !selectedTab || isConnecting || isLoadingTabs}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                {isConnecting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Menghubungkan...
                  </>
                ) : (
                  <>
                    Hubungkan Dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
