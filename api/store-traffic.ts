import {createSign,timingSafeEqual} from "node:crypto";
const spreadsheet="1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
const range="'STORE_TRAFFIC'!A:H";
const b64=(v:any)=>Buffer.from(JSON.stringify(v)).toString("base64url");
const equal=(a:string,b:string)=>{const x=Buffer.from(a),y=Buffer.from(b);return x.length===y.length&&timingSafeEqual(x,y)};
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
  const values=(await request("GET",range)).values||[];
  const rows=values.slice(1).map((v:any[],i:number)=>({index:i+2,date:String(v[0]||""),traffic:Number(v[2]),notes:String(v[3]||""),createdBy:String(v[5]||"")})).filter((v:any)=>/^\d{4}-\d{2}-\d{2}$/.test(v.date));
  if(req.method==="GET")return res.status(200).json({rows:rows.map(({index,...rest}:any)=>rest)});
  const {date,traffic,notes,salesId,salesName}=req.body||{};
  const d=String(date||""),n=Number(traffic),id=String(salesId||""),name=String(salesName||"").trim();
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||new Date(d+"T12:00:00Z").toISOString().slice(0,10)!==d||!Number.isSafeInteger(n)||n<0||n>100000||!/^[0-9]{4,20}$/.test(id)||!name||name.length>120||String(notes||"").length>500)return res.status(400).json({error:"Input traffic tidak valid"});
  const existing=rows.find((v:any)=>v.date===d),now=new Date().toISOString(),safeNotes=String(notes||"").trim().replace(/^[=+@-]/,"'");
  if(existing){
   const expected=process.env.ADMIN_ACCESS_LOG_PASSWORD;
   if(!expected||!equal(String(req.headers["x-admin-access-password"]||""),expected))return res.status(409).json({error:"Tanggal sudah diinput. Hanya admin dengan otorisasi khusus yang boleh mengedit."});
   await request("PUT","'STORE_TRAFFIC'!C"+existing.index+":H"+existing.index,{values:[[n,safeNotes,values[existing.index-1]?.[4]||now,values[existing.index-1]?.[5]||id,now,id]]},"?valueInputOption=RAW");
   return res.status(200).json({ok:true,updated:true});
  }
  await request("POST",range,{values:[[d,"QF01",n,safeNotes,now,id,"",""]]} ,":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS");
  return res.status(201).json({ok:true,updated:false});
 }catch(e:any){return res.status(500).json({error:e.message||"Gagal menyimpan traffic"})}
}
