import {createHmac,createSign} from "node:crypto";

const COOKIE="digiplus_admin_session";
const secret=()=>process.env.PRICE_LIST_UPLOAD_ADMIN_KEY||"";
function issueSession(){const key=secret();if(key.length<20)throw Error("Admin session secret belum dikonfigurasi");const payload=Buffer.from(JSON.stringify({role:"store-leader",exp:Date.now()+8*60*60*1000})).toString("base64url");const signature=createHmac("sha256",key).update(payload).digest("base64url");return payload+"."+signature}
function validSession(req:any){const raw=String(req.headers.cookie||"").split(";").map(x=>x.trim()).find(x=>x.startsWith(COOKIE+"="))?.slice(COOKIE.length+1)||"";const [payload,signature,...extra]=raw.split(".");if(!payload||!signature||extra.length||secret().length<20)return false;const expected=createHmac("sha256",secret()).update(payload).digest();let provided:Buffer;try{provided=Buffer.from(signature,"base64url")}catch{return false}if(provided.length!==expected.length||!timingSafeEqual(provided,expected))return false;try{const p=JSON.parse(Buffer.from(payload,"base64url").toString());return p.role==="store-leader"&&typeof p.exp==="number"&&p.exp>Date.now()}catch{return false}}
function sessionCookie(value:string,maxAge:number){return COOKIE+"="+value+"; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age="+maxAge}

import {timingSafeEqual} from "node:crypto";

const spreadsheet=process.env.PROMO_SPREADSHEET_ID||"";
const tab="PROMO_MASTER";
const headers=["Promo ID","Status","Start Date","End Date","Updated At","Updated By","Brand","Product","Price","Summary","Benefits JSON","Internal JSON","Source Filename","Source Type","Drive File ID","Drive URL"];
const ids=new Set(["iphone15","iphone17","iphone18","ipada16","ipadair","watch","airpods","oppoa7","oppoa7max"]);
async function token(){const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;if(!raw||!spreadsheet)throw Error("Promo Google Sheets service account / spreadsheet not configured");const a=JSON.parse(raw),now=Math.floor(Date.now()/1000);const b64=(v:any)=>Buffer.from(JSON.stringify(v)).toString("base64url");const unsigned=b64({alg:"RS256",typ:"JWT"})+"."+b64({iss:a.client_email,scope:"https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});const signer=createSign("RSA-SHA256");signer.update(unsigned);signer.end();const assertion=unsigned+"."+signer.sign(a.private_key).toString("base64url");const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion})});const d=await r.json();if(!r.ok)throw Error(d.error_description||"Google authentication failed");return d.access_token}
async function call(path:string,method="GET",body?:any){const t=await token();const r=await fetch("https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheet+path,{method,headers:{Authorization:"Bearer "+t,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Object.assign(new Error(d.error?.message||"Google Sheets error"),{status:r.status});return d}
async function read(){try{return (await call("/values/"+encodeURIComponent("'"+tab+"'!A:P"))).values||[]}catch(e:any){if(e.status===400&&/Unable to parse range|not found/i.test(e.message))return [];throw e}}
async function ensure(){const metadata=await call("?fields=sheets.properties.title");if((metadata.sheets||[]).some((s:any)=>s.properties.title===tab))return;try{await call(":batchUpdate","POST",{requests:[{addSheet:{properties:{title:tab}}}]})}catch(e:any){if(!/already exists/i.test(e.message))throw e}await call("/values/"+encodeURIComponent("'"+tab+"'!A1:P1")+"?valueInputOption=RAW","PUT",{values:[headers]})}
const customId=(v:any)=>typeof v==="string"&&/^custom_[a-z0-9_-]{8,60}$/.test(v);
const validPromoDate=(s:any)=>typeof s==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+"T12:00:00Z"))&&new Date(s+"T12:00:00Z").toISOString().slice(0,10)===s;

async function promoRequest(req:any,res:any){try{if(req.method==="GET"){const rows=(await read()).slice(1);return res.status(200).json({items:rows.filter((v:any[])=>(ids.has(String(v[0]))||customId(v[0]))).map((v:any[])=>({id:v[0],status:v[1],start:v[2]||"",end:v[3]||"",updatedAt:v[4]||""}))})}if(!validSession(req))return res.status(403).json({error:"Sesi admin Store Leader diperlukan"});const {id,status,start,end}=req.body||{};if(!(ids.has(id)||customId(id))||!["active","archived","deleted"].includes(status)||start&&!validPromoDate(start)||end&&!validPromoDate(end)||start&&end&&end<start)return res.status(400).json({error:"Data periode atau status promo tidak valid"});if(status==="active"&&(!start||!end))return res.status(400).json({error:"Aktivasi promo membutuhkan tanggal mulai dan tanggal akhir yang terkonfirmasi"});await ensure();const rows=await read();const index=rows.findIndex((v:any[],i:number)=>i>0&&v[0]===id);const values=[[id,status,start||"",end||"",new Date().toISOString(),"Store Leader Admin"]];if(index>=0)await call("/values/"+encodeURIComponent("'"+tab+"'!A"+(index+1)+":F"+(index+1))+"?valueInputOption=RAW","PUT",{values});else await call("/values/"+encodeURIComponent("'"+tab+"'!A:F")+":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS","POST",{values});return res.status(200).json({ok:true})}catch(e:any){console.error("Promo management:",e);return res.status(503).json({error:"Gagal mengakses PROMO_MANAGEMENT: "+String(e.message||"unknown")})}}

async function uploadFileRequest(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 if(!validSession(req))return res.status(403).json({error:"Sesi admin diperlukan"});
 try{
  const folder=process.env.PROMO_DRIVE_FOLDER_ID;if(!folder)throw Error("Promo Drive folder belum dikonfigurasi");
  const {name,mime,data}=req.body||{};
  if(typeof name!=="string"||name.length>180||typeof mime!=="string"||typeof data!=="string"||data.length>3*1024*1024)return res.status(400).json({error:"File tidak valid atau melebihi batas 2 MB"});
  const types=new Set(["application/pdf","image/jpeg","image/png","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel"]);
  if(!types.has(mime))return res.status(400).json({error:"Format file tidak didukung"});
  const bytes=Buffer.from(data,"base64");if(bytes.length>2*1024*1024||bytes.length<1)return res.status(400).json({error:"Ukuran file tidak valid"});
  const auth=await token(),boundary="qf01promo"+Date.now().toString(36);
  const metadata=JSON.stringify({name:name.replace(/[\\/]/g,"_"),mimeType:mime,parents:[folder]});
  const body=Buffer.concat([Buffer.from("--"+boundary+"\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n"+metadata+"\r\n--"+boundary+"\r\nContent-Type: "+mime+"\r\n\r\n"),bytes,Buffer.from("\r\n--"+boundary+"--")]);
  const response=await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,name",{method:"POST",headers:{Authorization:"Bearer "+auth,"Content-Type":"multipart/related; boundary="+boundary},body});
  const result=await response.json();if(!response.ok)throw Error(result.error?.message||"Drive upload failed");
  return res.status(200).json({fileId:result.id,url:result.webViewLink||"https://drive.google.com/file/d/"+encodeURIComponent(result.id)+"/view"});
 }catch(e:any){return res.status(503).json({error:"Upload Google Drive gagal: "+String(e.message||"unknown")})}
}
async function uploadPromoRequest(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 try{
  if(req.method==="GET"){const rows=(await read()).slice(1);return res.status(200).json({items:rows.filter((v:any[])=>(customId(v[0])&&v[1]!=="deleted")).map((v:any[])=>({id:v[0],status:v[1],start:v[2]||"",end:v[3]||"",updatedAt:v[4]||"",brand:v[6]||"",name:v[7]||"",price:v[8]||"",summary:v[9]||"",lines:parseList(v[10]),internal:parseList(v[11]),sourceName:v[12]||"",sourceType:v[13]||"",driveUrl:v[15]||""}))})}
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!validSession(req))return res.status(403).json({error:"Sesi admin diperlukan untuk publikasi"});
  const b=req.body||{},id=String(b.id||""),status=String(b.status||"archived"),start=String(b.start||""),end=String(b.end||"");
  const clean=(x:any,n=500)=>String(x||"").trim().slice(0,n).replace(/^[=+@-]/,"'");
  const lines=Array.isArray(b.lines)?b.lines.map((x:any)=>clean(x,700)).filter(Boolean).slice(0,80):[];
  const internal=Array.isArray(b.internal)?b.internal.map((x:any)=>clean(x,700)).filter(Boolean).slice(0,40):[];
  if(!customId(id)||!["active","archived"].includes(status)||!clean(b.name,150)||!clean(b.brand,60)||!lines.length||start&&!validPromoDate(start)||end&&!validPromoDate(end)||start&&end&&end<start)return res.status(400).json({error:"Data promo tidak valid atau benefit kosong"});
  if(status==="active"&&(!start||!end))return res.status(400).json({error:"Tanggal mulai dan akhir wajib untuk publikasi aktif"});
  await ensure();const rows=await read(),index=rows.findIndex((v:any[],i:number)=>i>0&&v[0]===id);
  const values=[[id,status,start,end,new Date().toISOString(),"Store Leader Admin",clean(b.brand,60),clean(b.name,150),clean(b.price,200),clean(b.summary,300),JSON.stringify(lines),JSON.stringify(internal),clean(b.sourceName,200),clean(b.sourceType,40),clean(b.driveFileId,150),clean(b.driveUrl,400)]];
  if(index>=0)await call("/values/"+encodeURIComponent("'"+tab+"'!A"+(index+1)+":N"+(index+1))+"?valueInputOption=RAW","PUT",{values});
  else await call("/values/"+encodeURIComponent("'"+tab+"'!A:N")+":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS","POST",{values});
  return res.status(200).json({ok:true,id});
 }catch(e:any){console.error("Upload promo:",e);return res.status(503).json({error:"Gagal menyimpan promo: "+String(e.message||"unknown")})}
}
function parseList(v:any){try{const x=JSON.parse(String(v||"[]"));return Array.isArray(x)?x.filter((s:any)=>typeof s==="string"):[]}catch{return []}}

const manualTab="PROMO_CHEATSHEET_MANUAL";
async function manualPromoRequest(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 try{
  if(req.method==="GET"){
   const data=await call("/values/"+encodeURIComponent("'"+manualTab+"'!A2:U1000")+"?valueRenderOption=UNFORMATTED_VALUE");
   const today=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
   const items=(data.values||[]).filter((r:any[])=>r[0]&&String(r[1]).toLowerCase()==="published").map((r:any[])=>{
    const date=(v:any)=>{if(v===null||v===undefined||v==="")return "";if(typeof v==="number"){const dt=new Date(Date.UTC(1899,11,30)+v*86400000);return dt.toISOString().slice(0,10)}const str=String(v).trim();if(/^\d{4}-\d{2}-\d{2}$/.test(str))return str;const m=str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);if(m){const months:Record<string,string>={jan:"01",feb:"02",mar:"03",apr:"04",mei:"05",may:"05",jun:"06",jul:"07",agu:"08",aug:"08",sep:"09",okt:"10",oct:"10",nov:"11",des:"12",dec:"12"};const month=months[m[2].toLowerCase().slice(0,3)];if(month)return m[3]+"-"+month+"-"+m[1].padStart(2,"0")}return ""};
    const start=date(r[16]),end=date(r[17]);
    return {id:String(r[0]),brand:String(r[2]||""),name:String(r[3]||""),price:String(r[6]||""),summary:String(r[14]||""),lines:[r[8]&&"Cashback: "+r[8],r[9]&&"BNPL/Cicilan: "+r[9],r[10]&&"Trade-in: "+r[10],r[11]&&"Voucher: "+r[11],r[12]&&"Protection: "+r[12],r[15]&&"Syarat: "+r[15]].filter(Boolean),start,end,status:start&&end?(today<start?"scheduled":today>end?"expired":"active"):"verify"};
   });
   return res.status(200).json({items});
  }
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  if(!validSession(req))return res.status(403).json({error:"Sesi admin diperlukan"});
  const b=req.body||{};
  const clean=(v:any,n=500)=>String(v??"").trim().slice(0,n).replace(/^[=+@-]/,"'");
  const id="manual_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,7);
  const start=clean(b.start,10),end=clean(b.end,10);
  if(!clean(b.brand,60)||!clean(b.name,160)||start&&!validPromoDate(start)||end&&!validPromoDate(end)||start&&end&&end<start)return res.status(400).json({error:"Brand, produk, atau periode tidak valid"});
  if(b.publish&&(!start||!end))return res.status(400).json({error:"Periode wajib lengkap sebelum publish"});
  const amount=(v:any)=>{const s=String(v??"").trim();if(!s)return "";if(!/^\d{1,15}$/.test(s))throw Error("Harga harus angka rupiah tanpa pemisah");return Number(s)};
  const row=[id,b.publish?"Published":"Draft",clean(b.brand,60),clean(b.name,160),clean(b.article,80),amount(b.normalPrice),amount(b.price),amount(b.discount),clean(b.cashback),clean(b.bnpl),clean(b.tradein),clean(b.voucher),clean(b.protection),clean(b.tender),clean(b.summary),clean(b.terms,2000),start,end,"Store Leader Admin",new Date().toISOString()];
  await call("/values/"+encodeURIComponent("'"+manualTab+"'!A:T")+":append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS","POST",{values:[row]});
  if(clean(b.raw,25000)){
   const log=[id,clean(b.inputType,30),clean(b.raw,25000),clean(b.brand,60),clean(b.name,160),String(b.price||""),[start,end].filter(Boolean).join(" - "),"Reviewed",new Date().toISOString()];
   try{await call("/values/"+encodeURIComponent("'PROMO_SMART_PASTE'!A:I")+":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS","POST",{values:[log]})}catch(e){console.error("Promo raw paste log failed",e)}
  }
  return res.status(200).json({ok:true,id});
 }catch(e:any){return res.status(503).json({error:"Promo Smart Paste: "+String(e.message||"unknown")})}
}

export default async function handler(req:any,res:any){if(req.query?.promoManual==="1")return manualPromoRequest(req,res);if(req.query?.promoFile==="1")return uploadFileRequest(req,res);if(req.query?.promoUpload==="1")return uploadPromoRequest(req,res);if(req.query?.promo==="1")return promoRequest(req,res);res.setHeader("Cache-Control","no-store");if(req.method==="GET")return res.status(200).json({admin:validSession(req)});if(req.method==="DELETE"){res.setHeader("Set-Cookie",sessionCookie("",0));return res.status(200).json({admin:false})}if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});const password=String(req.body?.password||"");const expected=process.env.ADMIN_ACCESS_LOG_PASSWORD||"";if(expected.length<12)return res.status(503).json({error:"Password admin server belum dikonfigurasi dengan aman"});const a=Buffer.from(password),b=Buffer.from(expected);if(a.length!==b.length||!timingSafeEqual(a,b))return res.status(401).json({error:"Password Store Leader Admin tidak sesuai"});try{res.setHeader("Set-Cookie",sessionCookie(issueSession(),8*60*60));return res.status(200).json({admin:true})}catch(e){return res.status(503).json({error:e instanceof Error?e.message:"Gagal membuat sesi admin"})}}
