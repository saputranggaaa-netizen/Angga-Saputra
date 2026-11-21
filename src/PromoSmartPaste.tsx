import React,{useState} from "react";
import {ClipboardPaste,CheckCircle2,AlertCircle} from "lucide-react";
type Draft={brand:string;name:string;price:string;normalPrice:string;discount:string;cashback:string;bnpl:string;tradein:string;voucher:string;protection:string;tender:string;summary:string;terms:string;start:string;end:string;article:string};
const empty:Draft={brand:"",name:"",price:"",normalPrice:"",discount:"",cashback:"",bnpl:"",tradein:"",voucher:"",protection:"",tender:"",summary:"",terms:"",start:"",end:"",article:""};
const brands=[["Apple",/\bapple|iphone|ipad|macbook|airpods/i],["Samsung",/samsung|galaxy/i],["OPPO",/\boppo\b/i],["Motorola",/motorola|moto g/i],["Xiaomi",/xiaomi|redmi|poco/i],["vivo",/\bvivo\b/i],["HONOR",/\bhonor\b/i]] as const;
const labels:Record<string,keyof Draft>={"brand":"brand","merek":"brand","produk":"name","product":"name","nama produk":"name","nama promo":"name","harga promo":"price","promo price":"price","price":"price","harga normal":"normalPrice","diskon":"discount","cashback":"cashback","cashback bank":"cashback","bnpl":"bnpl","cicilan":"bnpl","bnpl / cicilan":"bnpl","trade-in":"tradein","trade in":"tradein","voucher":"voucher","voucher / gift":"voucher","protection":"protection","bank":"tender","bank / tender":"tender","ringkasan":"summary","ringkasan untuk staff":"summary","syarat":"terms","syarat & ketentuan":"terms","tanggal mulai":"start","start date":"start","tanggal berakhir":"end","end date":"end","sap article":"article","sap article (opsional)":"article"};
const iso=(s:string)=>{const t=s.trim();if(/^\d{4}-\d{2}-\d{2}$/.test(t))return t;const m=t.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);return m?`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`:""};
const money=(s:string)=>{const m=s.match(/(?:Rp\s*)?(\d{1,3}(?:[.,]\d{3})+|\d{5,15})(?!\d)/i);return m?m[1].replace(/[.,]/g,""):""};
const parse=(raw:string):{data:Draft;kind:string;warnings:string[]}=>{
 const d={...empty},warnings:string[]=[];
 const lines=raw.trim().split(/\r?\n/).filter(Boolean);
 const delim=lines[0]?.includes("\t")?"\t":lines[0]?.includes(";")?";":"";
 const header=delim?lines[0].split(delim).map(x=>labels[x.trim().toLowerCase()]):[];
 if(delim&&header.filter(Boolean).length>=2&&lines.length>1){
  const vals=lines[1].split(delim);header.forEach((key,i)=>{if(key)d[key]=vals[i]?.trim()||""});
  if(lines.length>2)warnings.push("Tabel memiliki beberapa baris. Hanya baris pertama diambil; tempel dan simpan baris lain secara terpisah.");
  d.start=iso(d.start);d.end=iso(d.end);
  for(const k of ["price","normalPrice","discount"] as const)d[k]=money(d[k]);
  return {data:d,kind:"Tabel ber-header",warnings};
 }
 const found=brands.filter(([_,re])=>re.test(raw));if(found.length===1)d.brand=found[0][0];else warnings.push("Brand belum pasti. Pilih secara manual.");
 const productLine=lines.find(x=>/iphone|ipad|macbook|airpods|galaxy|oppo|motorola|xiaomi|redmi|vivo|honor/i.test(x)&&x.length<120);d.name=productLine?.replace(/^promo\s*[:\-]?\s*/i,"").slice(0,120)||"";
 const priceLines=lines.filter(x=>/harga promo|special price|harga jual/i.test(x));if(priceLines.length===1)d.price=money(priceLines[0]);else warnings.push("Harga promo belum pasti. Verifikasi manual.");
 d.cashback=lines.filter(x=>/cashback/i.test(x)).join("; ").slice(0,500);
 d.bnpl=lines.filter(x=>/bnpl|cicilan|indodana|kredivo|akulaku/i.test(x)).join("; ").slice(0,500);
 d.tradein=lines.filter(x=>/trade.?in|tukar tambah/i.test(x)).join("; ").slice(0,500);
 d.voucher=lines.filter(x=>/voucher|gift|hadiah/i.test(x)).join("; ").slice(0,500);
 d.protection=lines.filter(x=>/protection|qoala|asuransi/i.test(x)).join("; ").slice(0,500);
 const dateLine=lines.find(x=>/periode|berlaku|tanggal/i.test(x))||"";
 const dates=[...dateLine.matchAll(/\d{4}-\d{2}-\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/g)].map(x=>iso(x[0]));if(dates.length===2){d.start=dates[0];d.end=dates[1]}else warnings.push("Tanggal mulai dan akhir harus diperiksa manual.");
 d.summary=lines.find(x=>/promo|program/i.test(x))?.slice(0,250)||"";
 return {data:d,kind:"Teks bebas",warnings};
};
export default function PromoSmartPaste({onSaved}:{onSaved:()=>Promise<void>|void}){
 const [raw,setRaw]=useState(""),[draft,setDraft]=useState<Draft>({...empty}),[kind,setKind]=useState(""),[warnings,setWarnings]=useState<string[]>([]),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const analyze=()=>{setError("");setMessage("");if(!raw.trim()){setError("Tempel teks atau tabel terlebih dahulu.");return}const r=parse(raw);setDraft(r.data);setKind(r.kind);setWarnings(r.warnings)};
 const save=async(publish:boolean)=>{setError("");setMessage("");if(!draft.brand||!draft.name){setError("Brand dan nama produk wajib diisi.");return}if(publish&&(!draft.start||!draft.end)){setError("Tanggal mulai dan berakhir wajib sebelum Publish.");return}if(draft.start&&draft.end&&draft.end<draft.start){setError("Tanggal berakhir lebih awal dari tanggal mulai.");return}if(!window.confirm(publish?"Publish promo ini untuk staff?":"Simpan sebagai Draft di Google Sheets?"))return;setBusy(true);try{const r=await fetch("/api/admin-session?promoManual=1",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({...draft,publish,raw,inputType:kind})});const d=await r.json();if(!r.ok)throw Error(d.error||"Gagal menyimpan");setMessage(publish?"Promo Published tersimpan di Sheets.":"Draft tersimpan di Sheets.");setRaw("");setKind("");setDraft({...empty});await onSaved()}catch(e:any){setError(e.message||"Gagal menyimpan")}finally{setBusy(false)}};
 const inputClass="mt-1 w-full rounded-lg border border-slate-400/30 bg-transparent p-2 text-sm";
 const fields:[keyof Draft,string,string?][]=[["brand","Brand"],["name","Nama Produk / Promo"],["price","Harga Promo (angka Rp)"],["normalPrice","Harga Normal (angka Rp)"],["cashback","Cashback Bank"],["bnpl","BNPL / Cicilan"],["tradein","Trade-in"],["voucher","Voucher / Gift"],["protection","Protection"],["tender","Bank / Tender"],["start","Tanggal Mulai","date"],["end","Tanggal Berakhir","date"],["summary","Ringkasan Staff"],["terms","Syarat & Ketentuan"]];
 return <section className="rounded-2xl border border-blue-500/20 p-4 space-y-3">
 <div className="flex items-center gap-2"><ClipboardPaste size={19} className="text-blue-500"/><div><h3 className="text-sm font-semibold">Hybrid Smart Paste · Promo Intelligence</h3><p className="text-xs opacity-60">Paste teks bebas atau tabel dengan header → Review → Simpan ke Google Sheets khusus promo</p></div></div>
 <textarea value={raw} onChange={e=>setRaw(e.target.value)} rows={5} maxLength={25000} placeholder={"Tempel teks promo WhatsApp, atau tabel dengan baris pertama berisi judul kolom (Brand, Nama Produk, Harga Promo, dll)."} className={inputClass}/>
 <button type="button" onClick={analyze} className="rounded-xl bg-blue-600 px-4 py-2 text-sm text-white">Analisis Paste</button>
 {kind&&<div className="space-y-3 border-t border-blue-500/20 pt-3"><p className="text-xs font-semibold">Review · {kind} · Data belum dipublikasikan</p>{warnings.map((w,i)=><p key={i} className="text-xs text-amber-600">• {w}</p>)}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{fields.map(([key,label,type])=><label key={key} className="text-xs">{label}<input type={type||"text"} value={draft[key]} onChange={e=>setDraft({...draft,[key]:e.target.value})} className={inputClass}/></label>)}</div>
 <p className="text-xs opacity-60">Harga hanya angka rupiah. Hasil deteksi perlu diverifikasi sebelum Published. Data hanya masuk ke PROMO_CHEATSHEET_MANUAL.</p>
 <div className="flex gap-2 flex-wrap"><button disabled={busy} onClick={()=>save(false)} className="rounded-xl border border-slate-400/30 px-4 py-2 text-sm disabled:opacity-50">Save Draft</button><button disabled={busy} onClick={()=>save(true)} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50">Publish</button></div></div>}
 {error&&<p role="alert" className="text-xs text-amber-600 flex gap-2"><AlertCircle size={15}/>{error}</p>}{message&&<p className="text-xs text-green-600 flex gap-2"><CheckCircle2 size={15}/>{message}</p>}
 </section>
}
