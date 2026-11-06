import {createSign,randomUUID,timingSafeEqual} from "node:crypto";
const spreadsheet="1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
const tab="'CUSTOMER ENGAGEMENT'";
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
 const d=await r.json();if(!r.ok)throw Error("Google OAuth failed");
 cached={token:d.access_token,until:Date.now()+Math.max(60,d.expires_in-120)*1000};return cached.token;
}
async function sheets(method:string,range:string,body?:any,extra=""){
 const auth=await token();
 const url="https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheet+"/values/"+encodeURIComponent(range)+extra;
 const r=await fetch(url,{method,headers:{Authorization:"Bearer "+auth,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const d=await r.json();if(!r.ok)throw Error("Google Sheets API "+r.status+": "+(d.error?.message||"request failed"));return d;
}
async function allRows(){
 const d=await sheets("GET",tab+"!A1:J");
 return (d.values||[]).slice(1).filter((v:any[])=>v[0]).map((v:any[])=>({id:v[0],date:v[1],salesId:v[2],salesName:v[3],category:v[4],qty:Number(v[5])||0,enteredBy:v[6],createdAt:v[7],status:v[8]||"Active",updatedAt:v[9]}));
}
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 try{
  if(req.method==="GET")return res.status(200).json({rows:(await allRows()).filter((r:any)=>r.status!=="Deleted").sort((a:any,b:any)=>String(b.createdAt).localeCompare(String(a.createdAt)))});
  if(req.method==="POST"){
   const {date,salesId,salesName,category,qty,enteredBy}=req.body||{};
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{4,20}$/.test(String(salesId||""))||!["CX","New Member","Google Review"].includes(category)||!Number.isSafeInteger(qty)||qty<1||qty>10000||!clean(salesName)||!/^\d{4,20}$/.test(String(enteredBy||"")))return res.status(400).json({error:"Data tidak valid"});
   const row={id:randomUUID(),date,salesId:clean(salesId),salesName:clean(salesName),category,qty,enteredBy:clean(enteredBy),createdAt:new Date().toISOString(),status:"Active"};
   await sheets("POST",tab+"!A:J",{values:[[row.id,row.date,row.salesId,row.salesName,row.category,row.qty,row.enteredBy,row.createdAt,row.status,""]]},"?valueInputOption=RAW&insertDataOption=INSERT_ROWS");
   return res.status(201).json({row});
  }
  if(req.method==="DELETE"){
   if(!process.env.ADMIN_ACCESS_LOG_PASSWORD||!safe(req.headers["x-admin-access-password"],process.env.ADMIN_ACCESS_LOG_PASSWORD))return res.status(403).json({error:"Admin authorization required"});
   const id=clean(req.body?.id);if(!/^[a-f0-9-]{36}$/.test(id))return res.status(400).json({error:"Invalid ID"});
   const d=await sheets("GET",tab+"!A1:J");const idx=(d.values||[]).findIndex((v:any[])=>v[0]===id);
   if(idx<1)return res.status(404).json({error:"Aktivitas tidak ditemukan"});
   await sheets("PUT",tab+"!I"+(idx+1)+":J"+(idx+1),{values:[["Deleted",new Date().toISOString()]]},"?valueInputOption=RAW");
   return res.status(200).json({ok:true});
  }
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error("Engagement Sheets error",e);return res.status(503).json({error:e instanceof Error?e.message:"Gagal mengakses Google Sheets"});}
}
