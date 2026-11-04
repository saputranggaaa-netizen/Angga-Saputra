import { list, put, del, get } from "@vercel/blob";
import { timingSafeEqual } from "node:crypto";

const send=(res,status,body)=>res.status(status).json(body);
const validSentiment=new Set(["Luar Biasa","Cukup Baik","Kecewa"]);
const safeEqual=(a,b)=>{
  const x=Buffer.from(String(a||"")),y=Buffer.from(String(b||""));
  return x.length===y.length && timingSafeEqual(x,y);
};

export default async function handler(req,res){
  res.setHeader("Cache-Control","no-store");
  if(!process.env.BLOB_READ_WRITE_TOKEN)return send(res,503,{error:"Penyimpanan feedback belum tersedia"});
  try{
    if(req.method==="GET"){
      const items=[];
      let cursor;
      do{
        const page=await list({prefix:"feedback/",limit:100,cursor});
        items.push(...page.blobs);
        cursor=page.hasMore?page.cursor:undefined;
      }while(cursor && items.length<500);
      const results=await Promise.all(items.slice(-200).map(async b=>{
        try{
          const file=await get(b.pathname,{access:"private"});
          if(!file)return null;
          return JSON.parse(await new Response(file.stream).text());
        }catch{return null;}
      }));
      return send(res,200,{feedbacks:results.filter(Boolean).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))});
    }
    if(req.method==="POST"){
      const body=req.body||{};
      const salesName=String(body.salesName||"").trim().slice(0,100);
      const text=String(body.text||"").trim();
      const sentiment=String(body.sentiment||"Cukup Baik");
      if(!salesName || text.length<5 || text.length>1500 || !validSentiment.has(sentiment))
        return send(res,400,{error:"Nama, sentimen, atau isi feedback tidak valid (5–1500 karakter)"});
      const createdAt=new Date().toISOString();
      const id=crypto.randomUUID();
      const entry={id,salesName,salesRole:"Staff",initials:salesName.split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(),sentiment,createdAt,timestamp:new Date(createdAt).toLocaleString("id-ID",{timeZone:"Asia/Jakarta"}),text,reactions:{thumbsUp:0,heart:0,fire:0,thumbsDown:0,sad:0},userReactions:[]};
      await put("feedback/"+id+".json",JSON.stringify(entry),{access:"private",contentType:"application/json",addRandomSuffix:false,allowOverwrite:false});
      return send(res,201,{feedback:entry});
    }
    if(req.method==="DELETE"){
      const key=req.headers["x-feedback-admin-key"];
      if(!process.env.FEEDBACK_ADMIN_KEY || !safeEqual(key,process.env.FEEDBACK_ADMIN_KEY))
        return send(res,403,{error:"Kunci admin tidak valid"});
      const id=String(req.body?.id||"");
      if(!/^[0-9a-f-]{36}$/i.test(id))return send(res,400,{error:"ID feedback tidak valid"});
      await del("feedback/"+id+".json");
      return send(res,200,{ok:true});
    }
    res.setHeader("Allow","GET, POST, DELETE");
    return send(res,405,{error:"Metode tidak didukung"});
  }catch(e){console.error("Feedback API error",e);return send(res,500,{error:"Layanan feedback gagal memproses permintaan"});}
}
