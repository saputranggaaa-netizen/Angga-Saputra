import React,{useState} from "react";
import * as XLSX from "xlsx";
import {UploadCloud,FileText,CheckCircle2,AlertCircle} from "lucide-react";

export type UploadedPromo={id:string;status:string;start:string;end:string;brand:string;name:string;price:string;summary:string;lines:string[];internal:string[];sourceName:string;sourceType:string};
const split=(s:string)=>s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
const classify=(text:string)=>{const lines=split(text).slice(0,180);const joined=lines.join(" ");const brand=/apple|iphone|ipad|airpods|macbook|apple watch/i.test(joined)?"Apple":/samsung|galaxy/i.test(joined)?"Samsung":/motorola/i.test(joined)?"Motorola":/oppo/i.test(joined)?"OPPO":/xiaomi|redmi/i.test(joined)?"Xiaomi":"";const name=lines.find(x=>/program letter|promo|launching/i.test(x)&&/watch|airpods|iphone|ipad|galaxy/i.test(x))?.slice(0,110)||lines.find(x=>/iphone|ipad|airpods|watch|samsung|oppo|motorola|xiaomi/i.test(x))?.slice(0,110)||"";const amounts=[...joined.matchAll(/(?:Rp\\s*)?(\\d{1,3}(?:\\.\\d{3}){2,})(?!\\d)/gi)].map(m=>m[0]);const price=amounts.length===1?amounts[0]:"";const linesOut=lines.filter(x=>/promo|diskon|cashback|voucher|benefit|pwp|cicilan|trade.in|gratis|free|potongan|bnpl|qoala|protection/i.test(x)).map(x=>x.slice(0,350)).slice(0,40);const internal=lines.filter(x=>/kode|remarks|mop|article|sap/i.test(x)).map(x=>x.slice(0,350)).slice(0,25);return {brand,name,price,lines:linesOut,internal}};
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
  setError("");setSuccess("");setPreview(false);setFile(f);setSourceText("");setBrand("");setName("");setPrice("");setSummary("");setBenefits("");setInternal("");setStart("");setEnd("");
  if(f.size>2*1024*1024){setError("Ukuran maksimum 2 MB untuk penyimpanan Google Drive.");return}
  const ext=f.name.split(".").pop()?.toLowerCase();
  if(!["pdf","png","jpg","jpeg","xlsx","xls"].includes(ext||"")){setError("Gunakan PDF, JPG, PNG, XLSX atau XLS.");return}
  setBusy(true);
  try{
   let text="";
   if(ext==="xlsx"||ext==="xls"){const workbook=XLSX.read(await f.arrayBuffer(),{type:"array",sheetRows:250});text=workbook.SheetNames.slice(0,6).map(tab=>"SHEET: "+tab+"\n"+XLSX.utils.sheet_to_csv(workbook.Sheets[tab],{blankrows:false})).join("\n").slice(0,25000)}
   else if(ext==="pdf"){const pdfjs=await import("pdfjs-dist");pdfjs.GlobalWorkerOptions.workerSrc=new URL("pdfjs-dist/build/pdf.worker.min.mjs",import.meta.url).toString();const pdf=await pdfjs.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;const parts:string[]=[];for(let i=1;i<=Math.min(pdf.numPages,15);i++){const page=await pdf.getPage(i);const data=await page.getTextContent();parts.push(data.items.map((item:any)=>"str" in item?item.str:"").join(" "))}text=parts.join("\n").slice(0,25000)}
   else{text="";setError("File gambar diterima. Teks pada gambar tidak diekstraksi otomatis; isi detail promo secara manual sebelum dipublikasikan.")}
   setSourceText(text);
   const draft=classify(text);setBrand(draft.brand);setName(draft.name);setPrice(draft.price);setBenefits(draft.lines.join("\n"));setInternal(draft.internal.join("\n"));setSummary("Draf ekstraksi — cek harga, benefit, tanggal dan dokumen asli sebelum publikasi");setId("custom_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8));setPreview(true);
   if(ext==="pdf"&&!text.trim())setError("PDF tidak memiliki teks yang dapat dibaca (kemungkinan scan). Isi detail promo secara manual.");
  }catch(e:any){setError("Gagal membaca dokumen: "+(e?.message||"format tidak didukung"))}finally{setBusy(false)}
 };
 const publish=async(active:boolean)=>{
  if(!file||!id||!name.trim()||!brand.trim()||!split(benefits).length){setError("Isi brand, nama produk dan minimal satu benefit sebelum menyimpan.");return}
  if(active&&(!start||!end)){setError("Publikasi aktif memerlukan tanggal mulai dan akhir terverifikasi.");return}
  if(price.trim()&&!/^(?:Rp\\s*)?\\d[\\d.,]*(?:\\s*[-–]\\s*(?:Rp\\s*)?\\d[\\d.,]*)?$/.test(price.trim())){setError("Kolom harga hanya boleh nominal rupiah atau rentang harga. Persentase diskon masukkan ke Benefit.");return}
  if(start&&end&&end<start){setError("Tanggal akhir tidak boleh lebih awal dari tanggal mulai.");return}
  if(!window.confirm(active?"Publikasikan promo ini sebagai aktif untuk semua staff?":"Simpan promo sebagai arsip/draft, tidak muncul sebagai promo aktif?"))return;
  setBusy(true);setError("");
  try{
   const fileData=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||"").split(",")[1]||"");reader.onerror=()=>reject(Error("Gagal membaca file"));reader.readAsDataURL(file)});
   const mime=file.type||({pdf:"application/pdf",jpg:"image/jpeg",jpeg:"image/jpeg",png:"image/png",xlsx:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",xls:"application/vnd.ms-excel"} as Record<string,string>)[file.name.split(".").pop()?.toLowerCase()||""]||"";
   const fileResponse=await fetch("/api/admin-session?promoFile=1",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:file.name,mime,data:fileData})});
   const stored=await fileResponse.json();if(!fileResponse.ok)throw Error(stored.error||"Gagal menyimpan file asli");
   const r=await fetch("/api/admin-session?promoUpload=1",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:active?"active":"archived",start,end,brand,name,price,summary,lines:split(benefits),internal:split(internal),sourceName:file.name,sourceType:mime,driveFileId:stored.fileId,driveUrl:stored.url})});const d=await r.json();if(!r.ok)throw Error(d.error||"Gagal memublikasikan");setSuccess("Promo tersimpan ke Google Sheets untuk seluruh staff. File asli disimpan di Google Drive khusus promo.");setPreview(false);await onPublished()}catch(e:any){setError(e.message||"Gagal menyimpan")}finally{setBusy(false)}
 };
 return <section className="rounded-2xl border border-blue-500/20 p-4 space-y-3">
  <div className="flex items-center gap-2"><UploadCloud size={19} className="text-blue-500"/><div><h3 className="text-sm font-semibold">Upload Promo</h3><p className="text-xs opacity-60">Upload → Review → Publish · PDF, gambar, Excel · maks. 2 MB</p></div></div>
  <label className="block border border-dashed border-blue-500/40 rounded-xl p-3 text-center cursor-pointer text-sm hover:bg-blue-500/5"><input type="file" accept=".pdf,.png,.jpg,.jpeg,.xlsx,.xls" className="sr-only" onChange={e=>{const f=e.target.files?.[0];if(f)readFile(f);e.target.value=""}}/><FileText size={16} className="inline mr-2"/>{file?file.name:"Pilih dokumen promo"}</label>
  {busy&&<p className="text-xs text-blue-500">Memproses dokumen...</p>}
  {error&&<p role="alert" className="text-xs text-amber-600 flex gap-2"><AlertCircle size={15}/>{error}</p>}
  {success&&<p className="text-xs text-green-600 flex gap-2"><CheckCircle2 size={15}/>{success}</p>}
  {preview&&<div className="space-y-3 border-t border-blue-500/20 pt-3">
   <div className="flex items-center justify-between"><strong className="text-sm">Review Promo</strong><span className="text-xs opacity-60">Periksa sebelum publish</span></div>
   <div className="grid sm:grid-cols-2 gap-3">
    <label className="text-xs">Brand<input value={brand} onChange={e=>setBrand(e.target.value)} placeholder="Contoh: OPPO" className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
    <label className="text-xs">Nama promo<input value={name} onChange={e=>setName(e.target.value)} placeholder="Contoh: OPPO Find X10 Launching" className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
    <label className="text-xs">Harga (opsional)<input value={price} onChange={e=>setPrice(e.target.value)} placeholder="Rp 20.999.000" className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
    <label className="text-xs">Ringkasan<input value={summary} onChange={e=>setSummary(e.target.value)} placeholder="Promo singkat untuk staff" className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
    <label className="text-xs">Mulai<input type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
    <label className="text-xs">Berakhir<input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
   </div>
   <label className="text-xs block">Benefit utama <span className="opacity-60">(minimal satu baris, ringkas)</span><textarea rows={2} value={benefits} onChange={e=>setBenefits(e.target.value)} placeholder="Contoh: Cashback bank hingga Rp 1.000.000" className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label>
   <details className="rounded-xl border border-slate-400/20 p-3 text-xs"><summary className="cursor-pointer font-medium">More Details · Syarat, kode internal & teks PDF</summary><div className="space-y-3 pt-3"><label className="block">Kode voucher / MOP / remarks<textarea rows={3} value={internal} onChange={e=>setInternal(e.target.value)} className="mt-1 block w-full border border-slate-400/30 rounded-lg bg-transparent p-2 text-sm"/></label><details><summary className="cursor-pointer">Teks asli dokumen ({sourceText.length} karakter)</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-words border border-slate-400/20 rounded-lg p-2">{sourceText||"Tidak ada teks otomatis; isi manual."}</pre></details></div></details>
   <p className="text-xs opacity-60">Hasil ekstraksi adalah draf. Periksa dokumen asli; penyimpanan Drive harus berhasil sebelum publikasi.</p>
   <div className="flex flex-wrap gap-2"><button disabled={busy} onClick={()=>publish(true)} className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm disabled:opacity-50">Publish Aktif</button><button disabled={busy} onClick={()=>publish(false)} className="rounded-xl border border-slate-400/30 px-4 py-2 text-sm disabled:opacity-50">Simpan Arsip</button></div>
  </div>}
 </section>
}
