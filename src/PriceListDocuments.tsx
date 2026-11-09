import React,{useEffect,useState} from "react";
import {upload} from "@vercel/blob/client";
type Item={pathname:string;url:string;uploadedAt:string;size:number};
type Category="Apple"|"Android"|"Promo";
export default function PriceListDocuments({isAdmin,isDark}:{isAdmin:boolean;isDark:boolean}){
 const [tab,setTab]=useState<Category>("Apple");
 const [files,setFiles]=useState<Item[]>([]);
 const [file,setFile]=useState<File|null>(null);
 const [password,setPassword]=useState("");
 const [status,setStatus]=useState("");
 const [busy,setBusy]=useState(false);
 const refresh=async()=>{try{const r=await fetch("/api/price-list-documents",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"Gagal memuat");setFiles(d.files||[]);}catch(e){setStatus(e instanceof Error?e.message:"Gagal memuat");}};
 useEffect(()=>{void refresh()},[]);
 const save=async()=>{if(!file||!password)return setStatus("Pilih file dan masukkan password admin");if(!/\.(pdf|xlsx|xls|csv)$/i.test(file.name)||file.size>20*1024*1024)return setStatus("File harus PDF, Excel atau CSV maksimal 20 MB");setBusy(true);setStatus("");try{await upload("reference-price-promo/"+tab+"/"+file.name,file,{access:"public",handleUploadUrl:"/api/price-list-documents",clientPayload:password});setFile(null);setPassword("");await refresh();setStatus("Dokumen referensi berhasil diunggah. Database penjualan, stok dan master produk tidak berubah.");}catch(e){setStatus(e instanceof Error?e.message:"Upload gagal");}finally{setBusy(false);}};
 const selected=files.filter(f=>f.pathname.startsWith("reference-price-promo/"+tab+"/")).sort((a,b)=>new Date(b.uploadedAt).getTime()-new Date(a.uploadedAt).getTime());
 return <section className={`space-y-5 rounded-3xl border p-5 sm:p-6 ${isDark?"bg-slate-900/70 border-slate-700 text-white":"bg-white border-slate-200 text-slate-900"}`}>
 <div><p className="text-xs uppercase font-bold tracking-widest text-sky-500">QF01 · Grand Indonesia</p><h2 className="text-2xl font-black mt-1">Price List & Promo</h2><p className="text-sm opacity-70 mt-2">Dokumen referensi harga dan promo saja. Tidak terhubung ke proses perubahan SAP Article, stok, transaksi atau master harga.</p></div>
 <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-500/10 p-1">{(["Apple","Android","Promo"] as Category[]).map(t=><button key={t} onClick={()=>{setTab(t);setFile(null);setStatus("");}} className={`rounded-xl p-3 text-xs font-bold ${tab===t?"bg-sky-600 text-white":"opacity-75"}`}>{t}</button>)}</div>
 <div className="space-y-2"><h3 className="font-bold text-sm">Dokumen {tab}</h3>{selected.length?selected.map(f=><div key={f.url} className="rounded-xl border border-slate-500/20 p-3 flex flex-wrap justify-between gap-3 text-sm"><div><p className="font-semibold break-all">{f.pathname.split("/").pop()}</p><p className="text-xs opacity-60">{new Date(f.uploadedAt).toLocaleString("id-ID")} · {(f.size/1048576).toFixed(2)} MB</p></div><a href={f.url} target="_blank" rel="noopener noreferrer" className="text-sky-500 font-bold underline">Lihat / Unduh</a></div>):<p className="text-sm opacity-65 py-6">Belum ada dokumen {tab} yang diunggah.</p>}</div>
 {isAdmin&&<div className="rounded-2xl border border-dashed border-sky-500/40 p-4 space-y-3"><h3 className="text-sm font-bold">📤 Upload Dokumen {tab} · Admin</h3><p className="text-xs opacity-70">PDF, Excel, CSV maksimal 20 MB. File disimpan terpisah sebagai referensi; tidak diekstraksi atau ditulis ke database utama. Tautan dokumen bersifat publik, jangan unggah data rahasia.</p><input type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={e=>setFile(e.target.files?.[0]||null)} className="text-xs max-w-full"/><input type="password" autoComplete="off" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password admin" className="rounded-lg border bg-slate-800 text-white p-3 text-xs w-full sm:w-72"/><button type="button" disabled={busy||!file||!password} onClick={save} className="rounded-lg bg-sky-600 px-4 py-3 text-white text-xs font-black disabled:opacity-40">{busy?"Mengunggah...":"Upload Referensi "+tab}</button></div>}
 {status&&<p role="status" className="text-sm text-sky-500">{status}</p>}
 </section>;
}