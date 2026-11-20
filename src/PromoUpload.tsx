import React,{useState} from "react";
import * as XLSX from "xlsx";
import {UploadCloud,FileText,CheckCircle2,AlertCircle} from "lucide-react";

export type UploadedPromo={id:string;status:string;start:string;end:string;brand:string;name:string;price:string;summary:string;lines:string[];internal:string[];sourceName:string;sourceType:string};
const split=(s:string)=>s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const classify=(text:string)=>{const lines=split(text).slice(0,180);return {name:lines.find(x=>/iphone|ipad|airpods|watch|samsung|oppo|motorola|xiaomi/i.test(x))?.slice(0,150)||"",price:lines.find(x=>/rp\s*[\d.,]+/i.test(x))?.slice(0,200)||"",lines:lines.filter(x=>/promo|diskon|cashback|voucher|benefit|pwp|cicilan|trade.in|gratis|free|potongan/i.test(x)).slice(0,60),internal:lines.filter(x=>/kode|remarks|mop|article|sap/i.test(x)).slice(0,30)}};
export default function PromoUpload({onPublished}:{onPublished:()=>Promise<void>|void}){
 const [file,setFile]=useState<File|null>(null);
 const [sourceText,setSourceText]=useState("");
 const [brand,setBrand]=useState("");
 const [name,setName]=useState("");
 const [price,setPrice]=useState("");
 const [summary,setSummary]=useState("");
 const [benefits,setBenefits]=useState("");
 const [internal,setInternal]=useState("");
 const [start,setStart]=useState("");
 const [end,setEnd]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");
 const [preview,setPreview]=useState(false);
 const [id,setId]=useState("");
 const readFile=async(f:File)=>{
  setError("");setSuccess("");setPreview(false);setFile(f);setSourceText("");setName("");setPrice("");setSummary("");setBenefits("");setInternal("");setStart("");setEnd("");
  if(f.size>8*1024*1024){setError("Ukuran maksimum 8 MB.");return}
  const ext=f.name.split(".").pop()?.toLowerCase();
  if(!["pdf","png","jpg","jpeg","xlsx","xls"].includes(ext||"")){setError("Gunakan PDF, JPG, PNG, XLSX atau XLS.");return}
  setBusy(true);
  try{
   let text="";
   if(ext==="xlsx"||ext==="xls"){const workbook=XLSX.read(await f.arrayBuffer(),{type:"array",sheetRows:250});text=workbook.SheetNames.slice(0,6).map(tab=>"SHEET: "+tab+"\n"+XLSX.utils.sheet_to_csv(workbook.Sheets[tab],{blankrows:false})).join("\n").slice(0,25000)}
   else if(ext==="pdf"){const pdfjs=await import("pdfjs-dist");pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();const pdf=await pdfjs.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;const parts:string[]=[];for(let i=1;i<=Math.min(pdf.numPages,15);i++){const page=await pdf.getPage(i);const data=await page.getTextContent();parts.push(data.items.map((item:any)=>"str" in item?item.str:"").join(" "))}text=parts.join("\n").slice(0,25000)}
   else{text="";setError("File gambar diterima. Teks pada gambar tidak diekstraksi otomatis; isi detail promo secara manual sebelum dipublikasikan.")}
   setSourceText(text);
   const draft=classify(text);setName(draft.name);setPrice(draft.price);setBenefits(draft.lines.join("\n"));setInternal(draft.internal.join("\n"));setSummary("Hasil ekstraksi awal — wajib diverifikasi admin");setId("custom_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8));setPreview(true);
   if(ext==="pdf"&&!text.trim())setError("PDF tidak memiliki teks yang dapat dibaca (kemungkinan scan). Isi detail promo secara manual.");
  }catch(e:any){setError("Gagal membaca dokumen: "+(e?.message||"format tidak didukung"))}finally{setBusy(false)}
 };
 const publish=async(active:boolean)=>{
  if(!file||!id||!name.trim()||!brand.trim()||!split(benefits).length){setError("Isi brand, nama produk dan minimal satu benefit sebelum menyimpan.");return}
  if(active&&(!start||!end)){setError("Publikasi aktif memerlukan tanggal mulai dan akhir terverifikasi.");return}
  if(start&&end&&end<start){setError("Tanggal akhir tidak boleh lebih awal dari tanggal mulai.");return}
  if(!window.confirm(active?"Publikasikan promo ini sebagai aktif untuk semua staff?":"Simpan promo sebagai arsip/draft, tidak muncul sebagai promo aktif?"))return;
  setBusy(true);setError("");
  try{const r=await fetch("/api/admin-session?promoUpload=1",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:active?"active":"archived",start,end,brand,name,price,summary,lines:split(benefits),internal:split(internal),sourceName:file.name,sourceType:file.type||file.name.split(".").pop()})});const d=await r.json();if(!r.ok)throw Error(d.error||"Gagal memublikasikan");setSuccess("Promo tersimpan ke Google Sheets untuk seluruh staff. File sumber tidak diunggah ke penyimpanan bersama.");setPreview(false);await onPublished()}catch(e:any){setError(e.message||"Gagal menyimpan")}finally{setBusy(false)}
 };
 return <section className="rounded-2xl border border-blue-500/20 p-4 space-y-4">
  <div className="flex items-center gap-2"><UploadCloud size={20} className="text-blue-500"/><div><h3 className="text-sm font-semibold">Upload Promo · Admin</h3><p className="text-xs opacity-70">PDF, JPG, PNG, Excel · maks. 8 MB · preview sebelum publish</p></div></div>
  <label className="block border border-dashed border-blue-500/40 rounded-xl p-4 text-center cursor-pointer text-sm hover:bg-blue-500/5"><input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls,application/pdf,image/png,image/jpeg" className="sr-only" onChange={e=>{const f=e.target.files?.[0];if(f)readFile(f);e.target.value=""}}/><FileText size={19} className="inline mr-2"/>{file?file.name:"Pilih file PDF / Image / Excel"}</label>
  {busy&&<p className="text-sm text-blue-500">Memproses...</p>}
  {error&&<p role="alert" className="text-xs text-amber-600 flex gap-2"><AlertCircle size={15}/>{error}</p>}
  {success&&<p className="text-xs text-green-600 flex gap-2"><CheckCircle2 size={15}/>{success}</p>}
  {preview&&<div className="space-y-3 border-t border-blue-500/20 pt-4">
   <strong className="text-sm">Preview hasil ekstraksi · periksa dan koreksi seluruh data</strong>
   <div className="grid sm:grid-cols-2 gap-3">{([["Brand",brand,setBrand],["Nama produk / promo",name,setName],["Harga",price,setPrice],["Ringkasan",summary,setSummary]] as [string,string,(v:string)=>void][]).map(([label,value,set],i)=><label key={i} className="text-xs block">{label}<input value={value} onChange={e=>set(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>)}</div>
   <label className="text-xs block">Benefit dan syarat (satu per baris)<textarea rows={5} value={benefits} onChange={e=>setBenefits(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
   <label className="text-xs block">Kode voucher, MOP, remarks internal (satu per baris)<textarea rows={3} value={internal} onChange={e=>setInternal(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
   <div className="grid grid-cols-2 gap-3"><label className="text-xs">Tanggal mulai<input type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label><label className="text-xs">Tanggal akhir<input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label></div>
   <details className="text-xs"><summary className="cursor-pointer">Lihat teks hasil ekstraksi ({sourceText.length} karakter)</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words border rounded-lg p-2">{sourceText||"Tidak ada teks otomatis. Periksa dokumen asli dan isi manual."}</pre></details>
   <p className="text-xs opacity-70">Ekstraksi otomatis adalah draf, bukan verifikasi. Dokumen asli tidak disimpan; hanya data promo yang disetujui masuk Google Sheets.</p>
   <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={()=>publish(true)} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50">Verifikasi & Publish Aktif</button><button disabled={busy} onClick={()=>publish(false)} className="rounded-xl border border-slate-400/30 px-4 py-2 text-sm disabled:opacity-50">Simpan sebagai Arsip</button></div>
  </div>}
 </section>
}
