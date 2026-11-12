import React,{useEffect,useMemo,useState} from "react";
import {upload} from "@vercel/blob/client";
type Category="Android"|"Apple"|"Aksesoris"|"Promo";
type Item={pathname:string;url:string;uploadedAt:string;size:number};
type Product={name:string;brand:string;category:Category;variant:string;color:string;article:string;price:number|null;promo:string;source:string;updated:string};
const money=(n:number|null)=>n===null?"Belum tercocokkan":"Rp "+n.toLocaleString("id-ID");
const text=(v:unknown)=>String(v??"").trim();
const number=(v:unknown):number|null=>{if(v==null||text(v)==="")return null;const raw=text(v).replace(/[^\d.,-]/g,"");if(!raw)return null;const normalized=raw.includes(",")?raw.replace(/\./g,"").replace(",","."):raw.replace(/\.(?=\d{3}(?:\D|$))/g,"");const n=Number(normalized);return Number.isFinite(n)&&n>=0?n:null};
const category=(raw:string,fallback:Category):Category=>/accessor|aksesor|casing|case|adapter|charger|earphone|watch|buds|cable/i.test(raw)?"Aksesoris":/apple|iphone|ipad|macbook|airpods/i.test(raw)?"Apple":fallback==="Promo"?"Promo":"Android";
const cleanProduct=(raw:string)=>raw.replace(/\s+/g," ").trim();
const isNonProduct=(name:string)=>/^(description|marketing name|storage|harga|price|article|sap|brand|variant|color|warna|model|cashback|trade.?in|normal|promo|discount|diskon|benefit|program|category|kategori|total|remarks|notes|no\.?|\d[\d.,]*)$/i.test(name.trim())||!/\p{L}/u.test(name);
const inferVariant=(name:string)=>{const match=name.match(/(?:\d{1,2}\s*\/\s*)?(?:\d{2,4}\s*(?:GB|TB)|\d{1,2}\s*TB)(?:\s*\/\s*\d{2,4}\s*(?:GB|TB))?/i);return match?match[0].replace(/\s+/g,"").toUpperCase():"Standar";};
const inferColor=(name:string)=>{const match=name.match(/\b(Black|White|Blue|Pink|Green|Gray|Grey|Graphite|Silver|Gold|Purple|Lavender|Cream|Navy|Titanium|Violet|Red|Teal|Orange)\b/i);return match?match[0]:"Umum";};
const normalizeName=(name:string)=>cleanProduct(name.replace(/\b\d{2,4}\s*(?:GB|TB)(?:\s*\/\s*\d{2,4}\s*(?:GB|TB))?\b/gi,"").replace(/\b(Black|White|Blue|Pink|Green|Gray|Grey|Graphite|Silver|Gold|Purple|Lavender|Cream|Navy|Titanium|Violet|Red|Teal|Orange)\b$/i,""));

export const parseDocument=async(file:File,fallback:Category):Promise<Product[]>=>{
 const ext=file.name.split(".").pop()?.toLowerCase();
 if(ext==="pdf")throw Error("PDF disimpan sebagai referensi; ekstraksi tabel harga dari PDF tidak otomatis dilakukan.");
 const XLSX=await import("xlsx");
 const book=XLSX.read(await file.arrayBuffer(),{type:"array"});
 const upper=file.name.toUpperCase();
 const apple=/DIGIMAP/.test(upper),national=/PRICE LIST PROMO DIGIPLUS/.test(upper),samsung=/LIST PROMO AKTIF SAMSUNG/.test(upper);
 const sheetNames=apple?["PRICE LIST APPLE DEVICE"]:national?["PRICE LIST DIGIPLUS NASIONAL"]:samsung?["List Promo Samsung","PWP FOLDABLE 8","Trade In Foldable 8","Trade In S26FE","Trade In S26 Series","TRADE IN TAB S12","PWP Watch 9 & Watch Ultra 2","PWP Watch 8 Classic"]:book.SheetNames;
 const results:Product[]=[];
 const val=(r:any[],i:number)=>text(r[i]);
 const cash=(v:unknown)=>{const n=number(v);return n!==null&&Number.isInteger(n)&&n>=10000&&n<=300000000?n:null};
 const colorFrom=(raw:string)=>{const m=raw.match(/\b(MIDNIGHT BLACK|TITAN GRAY|SANDY PURPLE|SKY BLUE|PINK GOLD|SILVER SHADOW|COBALT VIOLET|LIGHT BLUE|OAK GREEN|LOTUS PURPLE|BLUEBERRY|PISTACHIO|GRAPHITE|LAVENDER|CREAM|PURPLE|BLACK|WHITE|BLUE|GREEN|GRAY|GREY|PINK|SILVER|GOLD|NAVY|RED|BEIGE)\b$/i);return m?m[0]:"Umum"};
 const add=(raw:string,brand:string,article:string,price:number|null,promo:string,kind:Category,variantHint="")=>{
  if(!raw||!article||!/[A-Z]/i.test(raw)||isNonProduct(raw))return;
  const color=colorFrom(raw);
  const variant=variantHint||inferVariant(raw);
  let name=cleanProduct(raw);
  if(color!=="Umum")name=name.slice(0,-color.length).trim();
  if(variant!=="Standar")name=cleanProduct(name.replace(variant,""));
  name=cleanProduct(name.replace(/\b(?:\d{1,2}\s*\/\s*)?\d{2,4}\s*(?:GB|TB)(?:\s*\/\s*\d{2,4}\s*(?:GB|TB))?\b/gi,""));
  if(!name||isNonProduct(name))return;
  results.push({name,brand:brand||"Lainnya",category:kind,variant,color,article,price,promo,source:file.name,updated:new Date().toISOString()});
 };
 for(const sheetName of sheetNames){
  const ws=book.Sheets[sheetName];if(!ws)continue;
  const rows=XLSX.utils.sheet_to_json<any[]>(ws,{header:1,defval:"",raw:false});
  if(national){for(const r of rows.slice(2)){const brand=val(r,0),article=val(r,1),desc=val(r,2),kind=val(r,3);if(!/^[A-Z0-9-]{5,}$/i.test(article))continue;add(desc,brand,article,cash(r[6]),"",/ACCESSOR|CASE|CABLE|CHARGER|WATCH|BUDS|ADAPTER/i.test(kind)?"Aksesoris":"Android",val(r,4).match(/\d+\s*\/\s*\d+\s*GB/i)?.[0]||"");}continue;}
  if(apple){for(const r of rows.slice(5)){const article=val(r,1),desc=val(r,2),kind=val(r,3);if(!/^[A-Z0-9][A-Z0-9/_-]{5,}$/i.test(article)||!desc)continue;const normal=cash(r[5]),promo=cash(r[6]);add(desc,/MAC/i.test(desc)?"Mac":/IPAD/i.test(desc)?"iPad":/WATCH/i.test(desc)?"Apple Watch":/AIRPODS/i.test(desc)?"AirPods":"iPhone",article,promo??normal,promo!==null&&normal!==null&&promo<normal?"Harga normal Rp "+normal.toLocaleString("id-ID"):"","Apple");}continue;}
  if(samsung){
   if(sheetName==="List Promo Samsung"){for(const r of rows.slice(1)){const name=val(r,2);if(!name)continue;results.push({name,brand:"Samsung",category:"Promo",variant:val(r,1)||"Promo",color:"Umum",article:"",price:null,promo:[val(r,3),val(r,4),val(r,5)].filter(Boolean).join(" | "),source:file.name,updated:new Date().toISOString()});}continue;}
   const header=rows.findIndex(r=>r.some(v=>/description|deskripsi/i.test(text(v)))&&r.some(v=>/article|artikel|sku/i.test(text(v))));
   if(header<0)continue;const h=rows[header].map(v=>text(v).toLowerCase());
   const articleCol=h.findIndex(v=>/article|artikel|sku/.test(v)),descCol=h.findIndex(v=>/description|deskripsi/.test(v)),priceCol=h.findIndex(v=>/harga normal|normal price/.test(v)),cashCol=h.findIndex(v=>/cashback|nilai cashback/.test(v));
   for(const r of rows.slice(header+1)){const article=val(r,articleCol),desc=val(r,descCol);if(!/^[A-Z0-9-]{8,}$/i.test(article)||!desc)continue;const cb=cashCol>=0?cash(r[cashCol]):null;add(desc,"Samsung",article,priceCol>=0?cash(r[priceCol]):null,cb!==null?sheetName+" · Cashback Rp "+cb.toLocaleString("id-ID"):sheetName,"Promo");}
   continue;
  }
  const header=rows.findIndex(r=>r.some(v=>/^(product description|sapdescription|nama produk|description)$/i.test(text(v)))&&r.some(v=>/^(current price|harga|price|normal price|promotion price|current price cicilan\/cash)$/i.test(text(v))));
  if(header<0)throw Error("Header nama produk dan harga tidak ditemukan pada "+sheetName);
  const h=rows[header].map(v=>text(v).toLowerCase());const ix=(re:RegExp)=>h.findIndex(v=>re.test(v));
  const ni=ix(/product description|sapdescription|nama produk|description/),ai=ix(/article|sku/),bi=ix(/^brand$/),pi=ix(/current price|promotion price|harga|^price$/);
  for(const r of rows.slice(header+1))add(val(r,ni),val(r,bi),val(r,ai),cash(r[pi]),"",fallback);
 }
 if(!results.length)throw Error("Tidak ditemukan baris produk valid pada sheet yang dipilih. Periksa format SAP Article dan kolom harga.");
 return results.slice(0,10000);
};
export default function PriceListDocuments({isAdmin,isDark}:{isAdmin:boolean;isDark:boolean}){
 const [tab,setTab]=useState<Category>("Android"),[files,setFiles]=useState<Item[]>([]);
 const [file,setFile]=useState<File|null>(null),[password,setPassword]=useState("");
 const [status,setStatus]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(false);
 const [rows,setRows]=useState<Product[]>([]),[query,setQuery]=useState(""),[brand,setBrand]=useState("Semua"),[chosen,setChosen]=useState(""),[variant,setVariant]=useState("");
 const [preview,setPreview]=useState<Product[]>([]),[showAll,setShowAll]=useState(false); const [importErrors,setImportErrors]=useState<string[]>([]);
 const refresh=async()=>{try{const r=await fetch("/api/price-list-documents",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"Gagal memuat");setFiles(d.files||[]);}catch(e){setStatus(e instanceof Error?e.message:"Gagal memuat");}};
 useEffect(()=>{void refresh()},[]);
 useEffect(()=>{let cancelled=false;const load=async()=>{setLoading(true);const found:Product[]=[];const errors:string[]=[];for(const item of files.filter(f=>/\.(xlsx|xls|csv|pdf)$/i.test(f.pathname)).slice(-20)){try{const response=await fetch(item.url);if(!response.ok){errors.push(item.pathname+": HTTP "+response.status);continue;}const blob=await response.blob();const name=item.pathname.split("/").pop()||"reference.xlsx";const sourceCategory=item.pathname.split("/")[1] as Category;const parsed=await parseDocument(new File([blob],name),sourceCategory);found.push(...parsed.map(p=>({...p,updated:item.uploadedAt,source:name})));}catch(e){errors.push(item.pathname.split("/").pop()+": "+(e instanceof Error?e.message:"Tidak dapat dibaca"));}}if(!cancelled){setRows(found);setImportErrors(errors);setLoading(false);}};void load();return()=>{cancelled=true};},[files]);
 const save=async()=>{if(!file||!password)return setStatus("Pilih file dan masukkan password admin");if(!/\.(pdf|xlsx|xls|csv)$/i.test(file.name)||file.size>20*1048576)return setStatus("PDF/Excel/CSV maksimal 20 MB");setBusy(true);try{await upload("reference-price-promo/"+tab+"/"+file.name,file,{access:"public",handleUploadUrl:"/api/price-list-documents",clientPayload:password});setPassword("");setFile(null);setPreview([]);await refresh();setStatus("Referensi tersimpan. Tidak ada perubahan pada database transaksi, SAP Article atau master harga.");}catch(e){setStatus(e instanceof Error?e.message:"Upload gagal");}finally{setBusy(false);}};
 const visible=useMemo(()=>rows.filter(p=>tab==="Promo"?!!p.promo||p.category==="Promo":p.category===tab),[rows,tab]);
 const brands=useMemo(()=>["Semua",...Array.from(new Set(visible.map(p=>p.brand).filter(b=>!/^(article|brand|current price|telkomsel|harga|price|description|marketing name)$/i.test(b)))).sort()],[visible]);
 const filtered=useMemo(()=>visible.filter(p=>(brand==="Semua"||p.brand===brand)&&(!query||[p.name,p.brand,p.variant,p.article].join(" ").toLowerCase().includes(query.toLowerCase()))),[visible,brand,query]);
 const names=Array.from(new Set(filtered.map(p=>p.name))).sort((a,b)=>a.localeCompare(b,"id",{numeric:true}));
 const current=names.includes(chosen)?chosen:names[0]||"";
 const variants=Array.from(new Set(filtered.filter(p=>p.name===current).map(p=>p.variant)));
 const selectedVariant=variants.includes(variant)?variant:variants[0]||"";
 const selected=filtered.filter(p=>p.name===current&&p.variant===selectedVariant);
 const currentPrice=selected.find(p=>p.price!==null)?.price??null;
 const documents=files.filter(f=>f.pathname.startsWith("reference-price-promo/"+(tab==="Aksesoris"?"Android":tab)+"/")).sort((a,b)=>new Date(b.uploadedAt).getTime()-new Date(a.uploadedAt).getTime());
 return <section className={`space-y-5 rounded-3xl border p-4 sm:p-6 ${isDark?"bg-[#101b33] border-slate-700 text-slate-100":"bg-slate-50 border-slate-200 text-slate-900"}`}>
  <div><p className="text-xs font-bold uppercase tracking-widest text-blue-500">QF01 · Grand Indonesia</p><h2 className="text-2xl font-black mt-1">Price List</h2><p className="text-xs text-slate-400 mt-2">Katalog referensi dari dokumen Excel/PDF · Tidak mengubah database penjualan, master produk, SAP Article, atau SOH</p></div>
  <div className="grid grid-cols-4 gap-1 bg-slate-700/30 rounded-2xl p-1">{(["Android","Apple","Aksesoris","Promo"] as Category[]).map(t=><button key={t} type="button" onClick={()=>{setTab(t);setBrand("Semua");setChosen("");setVariant("");setQuery("");}} className={`rounded-xl py-3 text-xs sm:text-sm font-bold ${tab===t?"bg-blue-600 text-white":"opacity-75 hover:bg-slate-500/10"}`}>{t}</button>)}</div>
  {loading&&<p className="text-xs text-blue-400">Memuat dokumen referensi...</p>}{!loading&&importErrors.length>0&&<div role="alert" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-200"><strong>{importErrors.length} dokumen gagal dibaca sebagai katalog.</strong><p className="mt-1">Periksa format kolom atau unggah file Excel price list yang sesuai. File tetap tersimpan sebagai referensi.</p><ul className="mt-2 list-disc pl-4">{importErrors.slice(0,5).map((e,i)=><li key={i}>{e}</li>)}</ul></div>}{!loading&&files.length===0&&<p className="rounded-xl border border-amber-500/40 p-3 text-xs text-amber-300">Belum ada dokumen referensi yang dapat diakses di lingkungan ini. Periksa koneksi Blob Storage untuk Preview.</p>}
  <div className="flex flex-wrap gap-2 items-center"><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Pilih Brand</span>{brands.map(b=><button key={b} type="button" onClick={()=>{setBrand(b);setChosen("");setVariant("");}} className={`rounded-xl px-3 py-2 text-xs font-bold ${brand===b?"bg-blue-600 text-white":"bg-slate-500/20 hover:bg-slate-500/30"}`}>{b}</button>)}</div>
  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)] gap-4 items-start">
   <div className={`rounded-2xl border p-4 space-y-4 ${isDark?"bg-[#1d293d] border-slate-700":"bg-white border-slate-200"}`}>
    <input value={query} onChange={e=>{setQuery(e.target.value);setChosen("");setVariant("");}} placeholder="Cari tipe produk, kapasitas atau SAP Article..." className={`w-full rounded-xl border px-4 py-3 text-sm ${isDark?"bg-[#111b30] border-slate-600 text-white placeholder:text-slate-400":"bg-white border-slate-200 text-slate-900"}`}/>
    <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Pilih Tipe</h3>
    <div className="flex flex-wrap gap-2">{names.slice(0,showAll?names.length:80).map(name=><button key={name} type="button" onClick={()=>{setChosen(name);setVariant("");}} className={`rounded-xl px-3 py-2 text-xs font-bold ${current===name?"bg-blue-600 text-white":"bg-slate-500/10 hover:bg-blue-500/10"}`}>{name}</button>)}</div>
    {names.length>80&&<button type="button" onClick={()=>setShowAll(!showAll)} className="text-xs font-bold text-blue-500">{showAll?"Lebih sedikit":"Tampilkan semua "+names.length+" produk"}</button>}
    {!names.length&&<p className="text-sm opacity-60 py-8 text-center">Belum ada produk yang cocok. Admin dapat mengunggah dokumen price list.</p>}
   </div>
   <div className={`rounded-2xl border p-5 space-y-4 ${isDark?"bg-[#1d293d] border-slate-700":"bg-white border-slate-200"}`}>
    <div><p className="text-[10px] tracking-widest uppercase font-black text-blue-500">{selected[0]?.brand||tab} · Price List</p><h3 className="text-xl font-black mt-1">{current||"Pilih produk"}</h3></div>
    {current&&<><p className="text-[10px] font-black tracking-widest opacity-60">VARIAN</p><div className="flex flex-wrap gap-2">{variants.map(v=><button key={v} type="button" onClick={()=>setVariant(v)} className={`rounded-xl px-3 py-2 text-xs font-bold ${selectedVariant===v?"bg-blue-600 text-white":"bg-slate-500/20"}`}>{v}</button>)}</div>
    <p className="text-[10px] font-black tracking-widest opacity-60">WARNA · ARTICLE REFERENSI</p><div className="flex flex-wrap gap-2">{selected.map((p,i)=><div key={i} className="rounded-xl bg-blue-500/10 px-3 py-2 text-xs"><strong>{p.color}</strong><p className="opacity-60">{p.article||"Article tidak tersedia"}</p></div>)}</div>
    <div className="rounded-xl bg-blue-500/5 border border-blue-500/10 p-4"><p className="text-[10px] uppercase font-black opacity-60">Harga Referensi</p><p className="text-2xl font-black text-blue-500 mt-1">{money(currentPrice)}</p><p className="text-[11px] opacity-60 mt-2">Stok: tidak ditampilkan · Tidak terhubung ke SOH</p></div>
    {selected.some(p=>p.promo)&&<div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3"><p className="text-xs font-bold text-emerald-500">PROMO REFERENSI</p>{selected.filter(p=>p.promo).map((p,i)=><p key={i} className="text-xs mt-2">{p.promo}</p>)}</div>}
    <p className="text-xs opacity-60">Sumber: {selected[0]?.source} · {selected[0]?.updated?new Date(selected[0].updated).toLocaleDateString("id-ID"):""}</p></>}
   </div>
  </div>
  <div className="space-y-2"><h3 className="text-sm font-bold">Dokumen Referensi {tab}</h3>{documents.length?documents.map(f=><div key={f.url} className="flex flex-wrap justify-between gap-2 border border-slate-500/20 rounded-xl p-3 text-xs"><span className="break-all">{f.pathname.split("/").pop()} · {new Date(f.uploadedAt).toLocaleDateString("id-ID")}</span><a href={f.url} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-500 underline">Lihat / Unduh</a></div>):<p className="text-xs opacity-60">Belum ada dokumen referensi.</p>}</div>
  {isAdmin&&<div className="border border-dashed border-blue-500/30 rounded-2xl p-4 space-y-3"><h3 className="font-bold text-sm">Upload Price List / Promo · Admin</h3><p className="text-xs opacity-70">PDF/Excel/CSV maks. 20 MB. Dokumen disimpan terpisah, tidak menulis data ke database penjualan atau master produk. Tautan file bersifat publik.</p><div className="flex flex-wrap gap-2"><select value={tab==="Aksesoris"?"Android":tab} onChange={e=>setTab(e.target.value as Category)} className="rounded-lg bg-slate-800 text-white p-2 text-xs"><option>Android</option><option>Apple</option><option>Promo</option></select><input type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={e=>{setFile(e.target.files?.[0]||null);setPreview([]);}} className="text-xs max-w-full"/><button type="button" disabled={!file||busy} onClick={async()=>{if(!file)return;setBusy(true);try{const p=await parseDocument(file,tab);setPreview(p);setStatus(p.length+" baris terbaca. Periksa sebelum upload.");}catch(e){setStatus(e instanceof Error?e.message:"Gagal membaca file");}finally{setBusy(false);}}} className="rounded-lg bg-slate-700 px-3 py-2 text-white text-xs font-bold disabled:opacity-40">Baca & Preview</button></div>
   {preview.length>0&&<div className="overflow-x-auto max-h-48"><table className="w-full text-xs"><thead><tr><th className="text-left p-2">Produk</th><th className="text-left p-2">Varian</th><th className="text-right p-2">Harga</th></tr></thead><tbody>{preview.slice(0,15).map((p,i)=><tr key={i} className="border-t border-slate-500/20"><td className="p-2">{p.name}</td><td className="p-2">{p.variant}</td><td className="p-2 text-right">{money(p.price)}</td></tr>)}</tbody></table></div>}
   <input type="password" autoComplete="off" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password admin" className="rounded-lg bg-slate-800 text-white p-3 text-xs w-full sm:w-72"/><button type="button" disabled={busy||!file||!password} onClick={save} className="rounded-lg bg-blue-600 px-4 py-3 text-white text-xs font-bold disabled:opacity-40">{busy?"Mengunggah...":"Upload Referensi"}</button></div>}
  {status&&<p role="status" className="text-xs text-blue-500">{status}</p>}
 </section>;
}