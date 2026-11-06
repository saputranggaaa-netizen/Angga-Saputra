import {list,put,get,del} from "@vercel/blob";
import {randomUUID,timingSafeEqual} from "node:crypto";
const prefix="customer-engagement/";
const safe=(a:any,b:any)=>{const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));return x.length===y.length&&timingSafeEqual(x,y)};
const clean=(s:any)=>String(s??"").trim().slice(0,120);
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:"Vercel Blob belum dikonfigurasi"});
 try{
  if(req.method==="GET"){
   const rows:any[]=[];let cursor:string|undefined;
   do{const page=await list({prefix,limit:1000,cursor});for(const b of page.blobs){const data=await get(b.pathname,{access:"private"});if(data)rows.push(JSON.parse(await new Response(data.stream).text()));}cursor=page.hasMore?page.cursor:undefined;}while(cursor);
   return res.status(200).json({rows:rows.sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});
  }
  if(req.method==="POST"){
   const {date,salesId,salesName,category,qty,enteredBy}=req.body||{};
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{4,20}$/.test(String(salesId||""))||!["CX","New Member","Google Review"].includes(category)||!Number.isSafeInteger(qty)||qty<1||qty>10000||!clean(salesName)||!/^\d{4,20}$/.test(String(enteredBy||"")))return res.status(400).json({error:"Data tidak valid"});
   const row={id:randomUUID(),date,salesId:clean(salesId),salesName:clean(salesName),category,qty,enteredBy:clean(enteredBy),createdAt:new Date().toISOString()};
   await put(prefix+row.id+".json",JSON.stringify(row),{access:"private",contentType:"application/json",addRandomSuffix:false});
   return res.status(201).json({row});
  }
  if(req.method==="DELETE"){
   if(!process.env.ADMIN_ACCESS_LOG_PASSWORD||!safe(req.headers["x-admin-access-password"],process.env.ADMIN_ACCESS_LOG_PASSWORD))return res.status(403).json({error:"Admin authorization required"});
   const id=clean(req.body?.id);
   if(!/^[a-f0-9-]{36}$/.test(id))return res.status(400).json({error:"Invalid ID"});
   await del(prefix+id+".json");return res.status(200).json({ok:true});
  }
  return res.status(405).json({error:"Method not allowed"});
 }catch(e){console.error("Engagement error",e);return res.status(503).json({error:"Gagal mengakses penyimpanan"});}
}