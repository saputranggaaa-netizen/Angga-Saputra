import {createSign} from "node:crypto";
const spreadsheet="1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
const range="'NIRWANA_TRACKING'!A:N";
const b64=(v:any)=>Buffer.from(JSON.stringify(v)).toString("base64url");
async function accessToken(){
 const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;if(!raw)throw Error("Google Sheets service account belum dikonfigurasi");
 const a=JSON.parse(raw),now=Math.floor(Date.now()/1000);
 const unsigned=b64({alg:"RS256",typ:"JWT"})+"."+b64({iss:a.client_email,scope:"https://www.googleapis.com/auth/spreadsheets",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});
 const sign=createSign("RSA-SHA256");sign.update(unsigned);sign.end();
 const assertion=unsigned+"."+sign.sign(a.private_key).toString("base64url");
 const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion})});
 const d=await r.json();if(!r.ok)throw Error(d.error_description||"Google OAuth gagal");return d.access_token;
}
async function request(method:string,rangeName:string,body?:any,suffix=""){
 const auth=await accessToken(),url="https://sheets.googleapis.com/v4/spreadsheets/"+spreadsheet+"/values/"+encodeURIComponent(rangeName)+suffix;
 const r=await fetch(url,{method,headers:{Authorization:"Bearer "+auth,"Content-Type":"application/json"},body:body?JSON.stringify(body):undefined});
 const d=await r.json();if(!r.ok)throw Error(d.error?.message||"Google Sheets gagal");return d;
}
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 if(req.method!=="GET"&&req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
 try{
  if(req.method==="GET"){
   const values=(await request("GET",range)).values||[];
   return res.status(200).json({rows:values.slice(1).map((v:any[],i:number)=>({id:i+2,date:String(v[0]||""),salesId:String(v[1]||""),salesName:String(v[2]||""),features:[3,4,5,6,7].map(j=>String(v[j]||"").toUpperCase()==="TRUE"),status:String(v[8]||""),notes:String(v[9]||""),createdAt:String(v[10]||"")})).filter((r:any)=>/^\d{4}-\d{2}-\d{2}$/.test(r.date))});
  }
  const {date,salesId,salesName,features,notes,createdBy}=req.body||{};
  const d=String(date||""),id=String(salesId||"").trim(),name=String(salesName||"").trim(),by=String(createdBy||"").trim(),n=String(notes||"").trim();
  const validDate=/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(Date.parse(d+"T12:00:00Z"))&&new Date(d+"T12:00:00Z").toISOString().slice(0,10)===d;
  if(!validDate||d>new Intl.DateTimeFormat("sv-SE",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date())||!/^\d{4,20}$/.test(id)||!name||name.length>120||!/^\d{4,20}$/.test(by)||!Array.isArray(features)||features.length!==5||!features.every((v:any)=>typeof v==="boolean")||!features.some(Boolean)||n.length>500)return res.status(400).json({error:"Data demo tidak valid. Pilih tanggal, sales, dan minimal satu fitur."});
  const safe=(v:string)=>v.replace(/^[=+@-]/,"'");
  const status=features.every(Boolean)?"FULL":"PARTIAL",now=new Date().toISOString();
  await request("POST",range,{values:[[d,id,safe(name),...features.map(Boolean),status,safe(n),now,by,"",""]]},":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS");
  return res.status(201).json({ok:true,status});
 }catch(e:any){return res.status(500).json({error:e.message||"Gagal mengakses data Nirwana"})}
}
