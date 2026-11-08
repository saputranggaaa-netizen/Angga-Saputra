import React, { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
type FileItem = { pathname: string; url: string; uploadedAt: string; size: number };
export default function PriceListReference() {
  const [files,setFiles]=useState<FileItem[]>([]);
  const [password,setPassword]=useState("");
  const [selected,setSelected]=useState<File|null>(null);
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  const load=async()=>{try{const r=await fetch("/api/price-list",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setFiles(d.files||[]);}catch(e){setMessage(e instanceof Error?e.message:"Gagal memuat");}};
  useEffect(()=>{void load();},[]);
  const submit=async()=>{
    if(!selected||!password)return setMessage("Pilih file dan masukkan password admin");
    if(!/\.(pdf|xlsx|xls)$/i.test(selected.name)||selected.size>20*1024*1024)return setMessage("Hanya PDF/XLS/XLSX maksimal 20 MB");
    setBusy(true);setMessage("");
    try{
      await upload("price-list/"+selected.name,selected,{access:"public",handleUploadUrl:"/api/price-list",clientPayload:password});
      setPassword("");setSelected(null);
      await load();setMessage("Price list berhasil disimpan sebagai referensi. Database dan master harga tidak berubah.");
    }catch(e){setMessage(e instanceof Error?e.message:"Upload gagal");}finally{setBusy(false);}
  };
  return <section className="rounded-2xl border border-slate-300/30 p-5 space-y-4">
    <h2 className="text-lg font-bold">📄 Price List Reference</h2>
    <p className="text-sm opacity-75">Khusus dokumen referensi, tidak mengubah database penjualan atau master harga. File tersimpan dengan tautan publik; jangan unggah dokumen rahasia.</p>
    <div className="flex flex-wrap gap-2">
      <input aria-label="File price list" type="file" accept=".pdf,.xlsx,.xls" onChange={e=>setSelected(e.target.files?.[0]||null)} className="text-sm max-w-full"/>
      <input aria-label="Password admin" type="password" autoComplete="off" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password admin" className="rounded-lg border p-2 text-slate-900 text-sm"/>
      <button type="button" disabled={busy} onClick={submit} className="rounded-lg bg-sky-600 px-4 py-2 text-white font-semibold disabled:opacity-50">{busy?"Mengunggah...":"Upload Price List"}</button>
    </div>
    {message&&<p role="status" className="text-sm">{message}</p>}
    <div className="space-y-2">{files.length?files.map(f=><div key={f.url} className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300/20 py-2 text-sm">
      <span className="break-all">{f.pathname.replace(/^price-list\//,"")} · {(f.size/1048576).toFixed(2)} MB</span>
      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-sky-500 underline">Lihat / Unduh</a>
    </div>):<p className="text-sm opacity-60">Belum ada dokumen price list.</p>}</div>
  </section>;
}