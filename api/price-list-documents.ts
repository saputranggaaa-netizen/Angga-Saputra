import { list } from "@vercel/blob";
import { handleUpload } from "@vercel/blob/client";
import { timingSafeEqual } from "node:crypto";
export default async function handler(req:any,res:any){
 res.setHeader("Cache-Control","no-store");
 if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:"Penyimpanan dokumen belum tersedia"});
 try{
  if(req.method==="GET"){const result=await list({prefix:"reference-price-promo/",limit:100});return res.status(200).json({files:result.blobs.map(({pathname,url,uploadedAt,size})=>({pathname,url,uploadedAt,size}))});}
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  const body=req.body;
  if(body?.type!=="blob.generate-client-token")return res.status(400).json({error:"Permintaan tidak valid"});
  const payload=body.payload;
  const supplied=payload?.clientPayload,expected=process.env.ADMIN_ACCESS_LOG_PASSWORD;
  if(typeof supplied!=="string"||!expected)return res.status(403).json({error:"Akses ditolak"});
  const a=Buffer.from(supplied),b=Buffer.from(expected);
  if(a.length!==b.length||!timingSafeEqual(a,b))return res.status(403).json({error:"Password admin salah"});
  if(typeof payload?.pathname!=="string"||!/^reference-price-promo\/(Apple|Android|Promo)\/[^/\\]{1,160}\.(pdf|xlsx|xls|csv)$/i.test(payload.pathname))return res.status(400).json({error:"Kategori atau format file tidak valid"});
  const result=await handleUpload({body,request:req,onBeforeGenerateToken:async()=>({allowedContentTypes:["application/pdf","application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","application/vnd.ms-excel","text/csv","application/octet-stream"],maximumSizeInBytes:20*1024*1024,addRandomSuffix:true}),onUploadCompleted:async()=>{}});
  return res.status(200).json(result);
 }catch(e){return res.status(500).json({error:e instanceof Error?e.message:"Gagal memproses dokumen"});}
}