import {createSign} from "node:crypto";
const ID="14_E-3MB9Fly4nMO3Go2jnU4hev_FgtiMDn0QtLZvh5A";
const b64=(v:any)=>Buffer.from(JSON.stringify(v)).toString("base64url");
async function token(){const raw=process.env.GOOGLE_SERVICE_ACCOUNT_JSON;if(!raw)throw Error("Service account Google Sheets belum dikonfigurasi");const a=JSON.parse(raw),now=Math.floor(Date.now()/1000),unsigned=b64({alg:"RS256",typ:"JWT"})+"."+b64({iss:a.client_email,scope:"https://www.googleapis.com/auth/spreadsheets.readonly",aud:"https://oauth2.googleapis.com/token",iat:now,exp:now+3600});const sign=createSign("RSA-SHA256");sign.update(unsigned);sign.end();const r=await fetch("https://oauth2.googleapis.com/token",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer",assertion:unsigned+"."+sign.sign(a.private_key).toString("base64url")})});const d=await r.json();if(!r.ok)throw Error(d.error_description||"Google OAuth gagal");return d.access_token}
const str=(v:any)=>String(v??"").trim();
const amount=(v:any)=>{const t=str(v).replace(/[^\d.,]/g,"");if(!t)return null;const n=Number(t.replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",","."));return Number.isFinite(n)&&n>0?n:null};
export default async function handler(req:any,res:any){res.setHeader("Cache-Control","no-store");if(req.method!=="GET")return res.status(405).json({error:"Read-only: method not allowed"});try{const auth=await token();const ranges=["'Apple List'!A1:H5000","'Android list'!A1:H5000","'Stock Position Report'!A1:J5000"];const url="https://sheets.googleapis.com/v4/spreadsheets/"+ID+"/values:batchGet?"+ranges.map(r=>"ranges="+encodeURIComponent(r)).join("&");const r=await fetch(url,{headers:{Authorization:"Bearer "+auth}});const d=await r.json();if(!r.ok)throw Error(d.error?.message||"Gagal membaca spreadsheet Product Price List");const [apple,android,stockRows]=(d.valueRanges||[]).map((x:any)=>x.values||[]);const stockProductsByArticle=new Map<string,any>();
const stockByArticle=new Map<string,number>();
// The uploaded SAP Stock Position Report stores "SAP ARTICLE / DESCRIPTION" in column E
// and per-row quantity in column H. Multiple rows of the same SAP article are additive.
for(const row of (stockRows||[]).slice(2)){
  const description=str(row[4]);
  const match=description.match(/^\s*([^\s]+)\s+\/\s+/);
  const article=match?.[1]?.trim().toUpperCase()||"";
  const qty=Number(str(row[7]).replace(/,/g,""));
  if(!article||!Number.isFinite(qty))continue;
  stockByArticle.set(article,(stockByArticle.get(article)||0)+qty);
  const brand=str(row[0]), category=str(row[2]).toUpperCase(), subtype=str(row[3]);
  const name=description.replace(/^\s*[^\s]+\s+\/\s+/,"").trim();
  // Only inventory explicitly classified as DEVICES is eligible for the SOH view.
  if(category!=="DEVICES"||/\b(DEMO|DUMMY|DISPLAY|MOCKUP|SAMPLE|NFS)\b/i.test(name))continue;
  const previous=stockProductsByArticle.get(article);
  stockProductsByArticle.set(article,{
    source:"Stock",brand:brand||"Unknown",article,name,category:subtype||"Devices",
    stock:(previous?.stock||0)+qty,normal:null,price:null,installment12:null,
    installment24:null,promo:"",bundling:null,cashBundling:null,
    updated:"Google Sheets · Stock Position Report"
  });
}
const stock=(article:string)=>stockByArticle.has(article.toUpperCase())?stockByArticle.get(article.toUpperCase()):null;const products:any[]=[];for(const [source,rows] of [["Apple",apple],["Android",android]] as const){for(const row of rows.slice(1)){const brand=str(row[0]),series=str(row[1]),article=str(row[2]),name=str(row[3]);if(!article||!name||!/[A-Z]/i.test(article)||!/^([A-Z0-9]+[\\/_-]?)+$/i.test(article))continue;products.push({source,brand:brand||source,article,name,stock:stock(article),category:series,normal:amount(row[4]),price:amount(row[5]),installment12:amount(row[6]),installment24:amount(row[7]),promo:"",bundling:null,cashBundling:null,updated:"Google Sheets · "+(source==="Apple"?"Apple List":"Android list")});}}return res.status(200).json({products,stockProducts:[...stockProductsByArticle.values()],sourceId:ID,readOnly:true});}catch(e){return res.status(502).json({error:e instanceof Error?e.message:"Google Sheets tidak tersedia",readOnly:true})}}
