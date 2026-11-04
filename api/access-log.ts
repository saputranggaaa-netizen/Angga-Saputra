import { list, put, get } from "@vercel/blob";
import { timingSafeEqual, randomUUID } from "node:crypto";

const safeEqual=(a:unknown,b:unknown)=>{
  const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));
  return x.length===y.length && timingSafeEqual(x,y);
};
const clean=(v:unknown)=>String(v??"").slice(0,180).replace(/^[=+@-]/,"'");
const readJson=async(path:string)=>{
  const blob=await get(path,{access:"private"});
  if(!blob)return null;
  return JSON.parse(await new Response(blob.stream).text());
};
export default async function handler(req:any,res:any){
  res.setHeader("Cache-Control","no-store");
  if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:"Penyimpanan Access Log belum dikonfigurasi di Vercel"});
  if(req.method!=="GET"&&req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    if(req.method==="GET"){
      const expected=process.env.ADMIN_ACCESS_LOG_PASSWORD;
      if(!expected)return res.status(503).json({error:"Password Access Log belum dikonfigurasi di Vercel"});
      if(!safeEqual(req.headers["x-admin-access-password"],expected))
        return res.status(403).json({error:"Password khusus Access Log tidak sesuai"});
      const readPrefix=async(prefix:string)=>{
        const all:any[]=[];let cursor:string|undefined;
        do{
          const page=await list({prefix,limit:100,cursor});
          all.push(...page.blobs);
          cursor=page.hasMore?page.cursor:undefined;
        }while(cursor&&all.length<1000);
        const entries=await Promise.all(all.slice(-500).map(b=>readJson(b.pathname).catch(()=>null)));
        return entries.filter(Boolean).sort((a:any,b:any)=>a.timestamp.localeCompare(b.timestamp));
      };
      const [access,activity]=await Promise.all([readPrefix("access-log/"),readPrefix("activity-log/")]);
      return res.status(200).json({
        rows:[["Timestamp","Tanggal","Waktu WIB","Sales ID","Nama Sales","Lokasi","Status Lokasi"],...access.map((x:any)=>x.values)],
        activityRows:[["Timestamp","Session ID","Sales ID","Nama Sales","Event","Active Seconds","Tab Status"],...activity.map((x:any)=>x.values)]
      });
    }
    const {salesId,salesName,location,locationStatus,event,sessionId,activeSeconds,tabStatus}=req.body||{};
    if(!/^\d{4,20}$/.test(String(salesId||"")))return res.status(400).json({error:"Sales ID tidak valid"});
    const now=new Date();
    const date=new Intl.DateTimeFormat("id-ID",{day:"2-digit",month:"2-digit",year:"numeric",timeZone:"Asia/Jakarta"}).format(now);
    const time=new Intl.DateTimeFormat("id-ID",{hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:false,timeZone:"Asia/Jakarta"}).format(now).replace(/\./g,":");
    const isActivity=["start","heartbeat","end"].includes(String(event||""));
    if(isActivity&&!/^[a-zA-Z0-9_-]{8,100}$/.test(String(sessionId||"")))
      return res.status(400).json({error:"Session ID tidak valid"});
    const values=isActivity
      ? [now.toISOString(),clean(sessionId),clean(salesId),clean(salesName),clean(event),Math.max(0,Math.min(120,Number(activeSeconds)||0)),clean(tabStatus)]
      : [now.toISOString(),date,time,clean(salesId),clean(salesName),clean(location)||"Tidak dibagikan",clean(locationStatus)||"Tidak tersedia"];
    const prefix=isActivity?"activity-log/":"access-log/";
    await put(prefix+now.toISOString().replace(/[:.]/g,"-")+"-"+randomUUID()+".json",JSON.stringify({timestamp:now.toISOString(),values}),{access:"private",contentType:"application/json",addRandomSuffix:false});
    return res.status(200).json({ok:true});
  }catch(e){console.error("Access Log error",e);return res.status(503).json({error:"Gagal mengakses penyimpanan log. Periksa Vercel Blob."});}
}
