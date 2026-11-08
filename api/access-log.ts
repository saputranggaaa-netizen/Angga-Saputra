import {createSign,randomUUID,timingSafeEqual} from "node:crypto";
const spreadsheet="1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
const tab="'STAFF ACCESS LOG'";
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

const accessTab="'STAFF ACCESS LOG'",activityTab="'STAFF ACTIVITY'";
async function rows(tab:string){
 const d=await sheets("GET",tab+"!A1:G");
 return (d.values||[]).slice(1).filter((v:any[])=>v[0]);
}
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="GET"&&req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  if(req.method==="GET"){
   const expected=process.env.ADMIN_ACCESS_LOG_PASSWORD;
   if(!expected)return res.status(503).json({error:"ADMIN_ACCESS_LOG_PASSWORD belum dikonfigurasi pada Vercel Production"});
   if(!safe(req.headers["x-admin-access-password"],expected))return res.status(403).json({error:"Password khusus Access Log tidak sesuai"});
   const [access,activity]=await Promise.all([rows(accessTab),rows(activityTab)]);
   return res.status(200).json({
    rows:[["Timestamp","Tanggal","Waktu WIB","Sales ID","Nama Sales","Lokasi","Status Lokasi"],...access.slice(-1000)],
    activityRows:[["Timestamp","Session ID","Sales ID","Nama Sales","Event","Active Seconds","Tab Status"],...activity.slice(-3000)]
   });
  }
  const {salesId,salesName,event,sessionId,activeSeconds,tabStatus}=req.body||{};
  if(!/^\d{4,20}$/.test(String(salesId||""))||!clean(salesName))return res.status(400).json({error:"Sales ID tidak valid"});
  const now=new Date();
  const date=new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"Asia/Jakarta"}).format(now);
  const time=new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"Asia/Jakarta"}).format(now).replace(/\./g,":");
  const isActivity=["start","heartbeat","end"].includes(String(event||""));
  if(isActivity&&!/^[a-zA-Z0-9_-]{8,100}$/.test(String(sessionId||"")))return res.status(400).json({error:"Session ID tidak valid"});
  const values=isActivity
   ? [now.toISOString(),clean(sessionId),clean(salesId),clean(salesName),clean(event),Math.max(0,Math.min(120,Number(activeSeconds)||0)),clean(tabStatus)]
   : [now.toISOString(),date,time,clean(salesId),clean(salesName),"Tidak dikumpulkan","Tanpa lokasi"];
  await sheets("POST",(isActivity?activityTab:accessTab)+"!A:G",{values:[values]},"?valueInputOption=RAW&insertDataOption=INSERT_ROWS");
  return res.status(200).json({ok:true});
 }catch(e){console.error("Access Log Sheets error",e);return res.status(503).json({error:"Gagal menyimpan atau membaca Access Log di Google Sheets"});}
}
