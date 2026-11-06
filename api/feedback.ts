import {createSign,randomUUID,timingSafeEqual} from "node:crypto";
const spreadsheet="1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
const tab="'FEEDBACK TIM'";
const clean=(s:any)=>String(s??"").trim().slice(0,120);
const safe=(a:any,b:any)=>{const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));return x.length===y.length&&timingSafeEqual(x,y)};
const b64=(v:any)=>Buffer.from(typeof v==="string"?v:JSON.stringify(v)).toString("base64url");
let cached:{token:string,until:number}|null=null;
async function token(){
 if(cached&&Date.now()<cached.until)return cached.token;
 const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
 if(!raw)throw Error("GOOGLE_SERVICE_ACCOUNT_JSON belum dikonfigurasi");
 const account=JSON.parse(raw);
 if(!account.client_email||!account.private_key)throw Error("Service account tidak valid");
 const now=Math.floor(Date.now()/1000);
 const jwt=b64({alg:"RS256",typ:"JWT"})+"."+b64({iss:account.client_email,scope:"https://www.googleapis.com/auth/spreadsheets",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
 const signer=createSign("RSA-SHA256");signer.update(jwt);signer.end();
 const assertion=jwt+"."+signer.sign(account.private_key).toString("base64url");
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion})});
 const rawResponse=await r.text();let d:any;try{d=JSON.parse(rawResponse)}catch{throw Error("Google OAuth mengembalikan HTML/non-JSON (HTTP "+r.status+", content-type "+(r.headers.get("content-type")||"unknown")+"). Periksa konfigurasi akses Google OAuth di Vercel.")}if(!r.ok)throw Error("Google OAuth HTTP "+r.status+": "+(d.error_description||d.error||"authentication failed"));
 cached={token:d.access_token,until:Date.now()+Math.max(60,d.expires_in-120)*1000};return cached.token;
}
async function sheets(method:string,range:string,body?:any,extra=""){
 const auth=await token();
 const url="https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheet+"/values/"+encodeURIComponent(range)+(method==="POST"?":append":"")+extra;
 const r=await fetch(url,{method,headers:{Authorization:"Bearer "+auth,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const rawResponse=await r.text();let d:any;try{d=JSON.parse(rawResponse)}catch{throw Error("Google Sheets API mengembalikan HTML/non-JSON (HTTP "+r.status+", content-type "+(r.headers.get("content-type")||"unknown")+").")}if(!r.ok)throw Error("Google Sheets API "+r.status+": "+(d.error?.message||"request failed"));return d;
}

async function allRows(){
 const d=await sheets("GET",tab+"!A1:H");
 return (d.values||[]).slice(1).filter((v:any[])=>v[0]).map((v:any[])=>({id:v[0],salesId:v[1],salesName:v[2],sentiment:v[3],text:v[4],createdAt:v[5],status:v[6]||"Active",updatedAt:v[7]}));
}
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 try{
  if(req.method==="GET"){
   const rows=(await allRows()).filter((r:any)=>r.status!=="Deleted").sort((a:any,b:any)=>String(b.createdAt).localeCompare(String(a.createdAt)));
   return res.status(200).json({feedbacks:rows.map((r:any)=>({...r,salesRole:"Staff",initials:r.salesName.split(/\s+/).slice(0,2).map((w:string)=>w[0]||"").join("").toUpperCase(),timestamp:new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short",timeZone:"Asia/Jakarta"}).format(new Date(r.createdAt)),reactions:{thumbsUp:0,heart:0,fire:0,thumbsDown:0,sad:0},userReactions:[]}))});
  }
  if(req.method==="POST"){
   const {salesId,salesName,sentiment,text}=req.body||{};
   if(!/^\d{4,20}$/.test(String(salesId||""))||!clean(salesName)||!["Luar Biasa","Cukup Baik","Kecewa"].includes(sentiment)||typeof text!=="string"||text.trim().length<5||text.length>1500)return res.status(400).json({error:"Data feedback tidak valid"});
   const row={id:randomUUID(),salesId:clean(salesId),salesName:clean(salesName),sentiment,text:text.trim(),createdAt:new Date().toISOString(),status:"Active"};
   await sheets("POST",tab+"!A:H",{values:[[row.id,row.salesId,row.salesName,row.sentiment,row.text,row.createdAt,row.status,""]]},"?valueInputOption=RAW&insertDataOption=INSERT_ROWS");
   return res.status(201).json({ok:true,id:row.id});
  }
  if(req.method==="DELETE"){
   if(!process.env.FEEDBACK_ADMIN_KEY||!safe(req.headers["x-feedback-admin-key"],process.env.FEEDBACK_ADMIN_KEY))return res.status(403).json({error:"Kunci admin feedback belum diatur atau tidak sesuai"});
   const id=clean(req.body?.id);
   if(!/^[a-f0-9-]{36}$/.test(id))return res.status(400).json({error:"ID tidak valid"});
   const d=await sheets("GET",tab+"!A1:H");const idx=(d.values||[]).findIndex((v:any[])=>v[0]===id);
   if(idx<1)return res.status(404).json({error:"Feedback tidak ditemukan"});
   await sheets("PUT",tab+"!G"+(idx+1)+":H"+(idx+1),{values:[["Deleted",new Date().toISOString()]]},"?valueInputOption=RAW");
   return res.status(200).json({ok:true});
  }
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error("Feedback Sheets error",e);return res.status(503).json({error:"Gagal mengakses penyimpanan feedback Google Sheets"});}
}
