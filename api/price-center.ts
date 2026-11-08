import {createSign,timingSafeEqual,randomUUID} from "node:crypto";
const spreadsheet="1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
const tab="'PRICE CENTER IMPORT'";
const headers=["Batch ID","Uploaded At","File Name","Document Type","Article","Product","Brand","Category","Price","Stock Qty","Promo","Valid From","Valid Until","Uploaded By","Status"];
const safe=(a:any,b:any)=>{const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));return x.length===y.length&&timingSafeEqual(x,y)};
const b64=(v:any)=>Buffer.from(typeof v==="string"?v:JSON.stringify(v)).toString("base64url");
async function auth(){
 const account=JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON||"{}");
 if(!account.client_email||!account.private_key)throw Error("Google service account belum dikonfigurasi");
 const now=Math.floor(Date.now()/1000),jwt=b64({alg:"RS256",typ:"JWT"})+"."+b64({iss:account.client_email,scope:"https://www.googleapis.com/auth/spreadsheets",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
 const signer=createSign("RSA-SHA256");signer.update(jwt);signer.end();
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:jwt+"."+signer.sign(account.private_key).toString("base64url")})});
 const d:any=await r.json();if(!r.ok)throw Error("OAuth "+r.status);return d.access_token as string;
}
async function call(token:string,path:string,method="GET",body?:any){
 const r=await fetch("https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheet+path,{method,headers:{Authorization:"Bearer "+token,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const d:any=await r.json();if(!r.ok)throw Error(d.error?.message||"Google Sheets "+r.status);return d;
}
async function ensure(token:string){
 const meta=await call(token,"?fields=sheets.properties.title");
 if(!(meta.sheets||[]).some((s:any)=>s.properties.title==="PRICE CENTER IMPORT"))await call(token,":batchUpdate","POST",{requests:[{addSheet:{properties:{title:"PRICE CENTER IMPORT"}}}]});
 const d=await call(token,"/values/"+encodeURIComponent(tab+"!A1:O1"));
 if(!d.values?.length)await call(token,"/values/"+encodeURIComponent(tab+"!A1:O1")+"?valueInputOption=RAW","PUT",{values:[headers]});
}
const clean=(v:any,max=180)=>String(v??"").trim().slice(0,max).replace(/^[=+@\t\r]/,"'");
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");res.setHeader("X-Content-Type-Options","nosniff");
 if(!["GET","POST"].includes(req.method))return res.status(405).json({error:"Method not allowed"});
 try{
  const token=await auth();await ensure(token);
  if(req.method==="GET"){
   const d=await call(token,"/values/"+encodeURIComponent(tab+"!A2:O"));
   const rows=(d.values||[]).map((v:any[])=>({batch:v[0],at:v[1],filename:v[2],type:v[3],article:v[4],name:v[5],brand:v[6],category:v[7],price:v[8]===""?null:Number(v[8]),qty:v[9]===""?null:Number(v[9]),promo:v[10],from:v[11],until:v[12],status:v[14]}));
   return res.status(200).json({rows});
  }
  if(!process.env.ADMIN_ACCESS_LOG_PASSWORD||!safe(req.headers["x-admin-access-password"],process.env.ADMIN_ACCESS_LOG_PASSWORD))return res.status(403).json({error:"Password Store Leader Admin tidak valid"});
  const {filename,type,rows,uploadedBy}=req.body||{};
  if(!/\.(xlsx|xls|csv|pdf)$/i.test(String(filename||""))||!["Apple","Android","SOH","Promo"].includes(type)||!Array.isArray(rows)||rows.length<1||rows.length>2000)return res.status(400).json({error:"File, jenis, atau jumlah baris tidak valid (maks 2000)"});
  if(JSON.stringify(req.body).length>2_500_000)return res.status(413).json({error:"Data terlalu besar"});
  const batch=randomUUID(),at=new Date().toISOString();
  const values=rows.map((r:any)=>{
   const price=r.price==null||r.price===""?"":Number(r.price),qty=r.qty==null||r.qty===""?"":Number(r.qty);
   if((price!==""&&(!Number.isFinite(price)||price<0||price>1e10))||(qty!==""&&(!Number.isInteger(qty)||qty<0||qty>1e6)))throw Error("Nilai harga atau stok tidak valid");
   if(!r.name&&!r.article)throw Error("Nama produk atau article wajib ada");
   return [batch,at,clean(filename,120),type,clean(r.article,80),clean(r.name),clean(r.brand,80),clean(r.category||type,60),price,qty,clean(r.promo,500),clean(r.from,30),clean(r.until,30),clean(uploadedBy,80),"Active"];
  });
  await call(token,"/values/"+encodeURIComponent(tab+"!A:O")+":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS","POST",{values});
  return res.status(201).json({ok:true,batch,count:values.length});
 }catch(e){console.error("Price import error",e instanceof Error?e.message:"unknown");return res.status(503).json({error:e instanceof Error?e.message:"Import gagal"});}
}
