"use client";

import React, { useState, useEffect, useRef } from "react";

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [salesIdInput, setSalesIdInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[][]>([]);
  const [uploadStatus, setUploadStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; text: string }>({
    type: "idle",
    text: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz2VUsReKqqJgPsG15L1pOAkmqoIWF2vApyD18jr5e_z0OVqagasa9yHXEe5fzMhoQmOw/exec";

  // Load SheetJS CDN secara dinamis
  useEffect(() => {
    if (typeof window !== "undefined" && !(window as any).XLSX) {
      const script = document.createElement("script");
      script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("digiplus_session_user");
      if (savedUser) setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput !== "Welcome@123") {
      setLoginErr("Password salah! Gunakan: Welcome@123");
      return;
    }
    if (salesIdInput.trim() === "") {
      setLoginErr("Masukkan Sales ID!");
      return;
    }
    localStorage.setItem("digiplus_session_user", salesIdInput);
    setIsLoggedIn(true);
    setLoginErr("");
  };

  const handleLogout = () => {
    localStorage.removeItem("digiplus_session_user");
    setIsLoggedIn(false);
  };

  // Baca File Excel .xls / .xlsx
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadStatus({ type: "loading", text: "Membaca struktur file .xls..." });

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const XLSX = (window as any).XLSX;

        if (!XLSX) {
          setUploadStatus({ type: "error", text: "Engine pembaca Excel belum siap. Coba lagi dalam beberapa detik." });
          return;
        }

        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];

        // Konversi sheet ke array JSON
        const rawJson: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Ambil 3 kolom untuk kolom M, N, O
        const mapped = rawJson.map((row) => [
          row[0] !== undefined ? String(row[0]) : "",
          row[1] !== undefined ? String(row[1]) : "",
          row[2] !== undefined ? String(row[2]) : "",
        ]);

        if (mapped.length === 0) {
          setUploadStatus({ type: "error", text: "File kosong atau format tidak sesuai." });
          return;
        }

        setParsedRows(mapped);
        setUploadStatus({
          type: "idle",
          text: `File "${file.name}" terbaca (${mapped.length} baris). Siap dikirim!`,
        });
      } catch (err) {
        setUploadStatus({ type: "error", text: "Gagal membaca format file Excel." });
      }
    };
    reader.readAsBinaryString(file);
  };

  // Eksekusi Kirim ke Kolom M, N, O
  const handleExecuteUpload = async () => {
    if (!selectedFile || parsedRows.length === 0) {
      setUploadStatus({ type: "error", text: "Pilih file .xls terlebih dahulu!" });
      return;
    }

    setUploadStatus({ type: "loading", text: `Mengirim ${parsedRows.length} baris ke Kolom M, N, O...` });

    try {
      await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          data: parsedRows,
        }),
      });

      setUploadStatus({
        type: "success",
        text: `Sukses! ${parsedRows.length} baris dari "${selectedFile.name}" telah dikirim ke Sheet RAW SalesPerson Kolom M, N, O.`,
      });
      setSelectedFile(null);
      setParsedRows([]);
    } catch (err) {
      setUploadStatus({ type: "error", text: "Gagal mengirim data. Periksa koneksi internet." });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center p-4 text-white font-sans">
        <div className="max-w-md w-full bg-[#0d1424] border border-amber-500/30 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-red-600 rounded-2xl mx-auto flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20 mb-3">
              D+
            </div>
            <h1 className="text-xl font-bold text-white">DIGIPLUS GRAND INDONESIA</h1>
            <p className="text-xs text-amber-400 mt-1">Portal Login Sales & Admin (QF01)</p>
          </div>

          {loginErr && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-semibold text-center">
              {loginErr}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase">Sales ID / Admin ID</label>
              <input
                type="text"
                required
                placeholder="22008089 atau ID Anda"
                value={salesIdInput}
                onChange={(e) => setSalesIdInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 uppercase">Password</label>
              <input
                type="password"
                required
                placeholder="Welcome@123"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition mt-2 shadow-lg shadow-amber-400/20"
            >
              Masuk Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#070b14] text-slate-100 font-sans">
      {/* SIDEBAR SEBELAH KIRI */}
      <aside className="w-72 bg-[#0d1424] border-r border-slate-800 flex flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div className="p-4 overflow-y-auto">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-red-600 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-lg shadow-amber-500/20">
              D+
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wider">DIGIPLUS</h2>
              <p className="text-[10px] text-amber-400 font-semibold">QF01 GRAND INDONESIA</p>
            </div>
          </div>

          {/* KOTAK SHORTCUT UPLOAD DI SIDEBAR */}
          <div className="mt-4 p-4 rounded-2xl bg-[#090e1a] border-2 border-amber-500/50 shadow-xl shadow-amber-500/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📤</span>
              <div>
                <h3 className="text-xs font-black text-amber-300 uppercase tracking-wide">Upload Saleswise</h3>
                <a
                  href="https://docs.google.com/spreadsheets/d/1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM/edit#gid=483282286"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-slate-400 hover:text-amber-400 underline block"
                >
                  Sheet RAW (Kolom M, N, O) ↗
                </a>
              </div>
            </div>

            {uploadStatus.text && (
              <div
                className={`my-2 p-2 rounded-xl text-[10px] font-bold text-center leading-tight ${
                  uploadStatus.type === "success"
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                    : uploadStatus.type === "error"
                    ? "bg-red-500/20 border border-red-500/40 text-red-300"
                    : "bg-slate-800 border border-slate-700 text-amber-300"
                }`}
              >
                {uploadStatus.text}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 border border-amber-400/40 hover:border-amber-400 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <span>📁</span>
              <span className="truncate">{selectedFile ? selectedFile.name : "1. Pilih File .xls"}</span>
            </button>

            <button
              type="button"
              onClick={handleExecuteUpload}
              disabled={uploadStatus.type === "loading" || parsedRows.length === 0}
              className={`w-full mt-2 py-2.5 px-3 font-black text-xs rounded-xl shadow-lg uppercase tracking-wider flex items-center justify-center gap-1.5 transition ${
                parsedRows.length > 0 && uploadStatus.type !== "loading"
                  ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 cursor-pointer animate-pulse"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              {uploadStatus.type === "loading" ? "Mengirim..." : "2. Kirim ke Kolom M, N, O"}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA */}
      <main className="flex-1 p-8 overflow-y-auto max-w-7xl mx-auto">
        <header className="mb-6 flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-xl font-bold text-white">DIGIPLUS STORE GRAND INDONESIA (QF01)</h1>
            <p className="text-xs text-slate-400">Target Sinkronisasi: Tab `RAW SalesPerson` Kolom M, N, O</p>
          </div>
          <a
            href="https://docs.google.com/spreadsheets/d/1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM/edit#gid=483282286"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span>📊</span>
            <span>Buka Google Sheets ↗</span>
          </a>
        </header>

        <div className="p-6 bg-[#0d1424] border border-slate-800 rounded-2xl">
          <h2 className="text-base font-bold text-white mb-2">Panduan Update Saleswise</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Gunakan tombol di sidebar sebelah kiri untuk mengunggah file laporan harian <strong>.xls</strong> dari POS/SAP. Data akan secara otomatis dipetakan ke kolom <strong>M, N, dan O</strong> di sheet <code>RAW SalesPerson</code>, dan rumus di kolom A sampai L akan otomatis menghitung transaksi dan omset staf.
          </p>
        </div>
      </main>
    </div>
  );
}
