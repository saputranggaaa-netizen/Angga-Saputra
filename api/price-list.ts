import { list } from "@vercel/blob";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { timingSafeEqual } from "node:crypto";
export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: "Blob storage belum terhubung" });
  try {
    if (req.method === "GET") {
      const results = await list({ prefix: "price-list/", limit: 100 });
      return res.status(200).json({ files: results.blobs.map(({ pathname, url, uploadedAt, size }) => ({ pathname, url, uploadedAt, size })) });
    }
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const body = req.body as HandleUploadBody;
    if (body?.type !== "blob.generate-client-token") return res.status(400).json({ error: "Permintaan tidak valid" });
    const payload = (body as any).payload;
    const expected = process.env.ADMIN_ACCESS_LOG_PASSWORD;
    const supplied = payload?.clientPayload;
    if (!expected || typeof supplied !== "string") return res.status(403).json({ error: "Akses admin ditolak" });
    const a = Buffer.from(supplied), b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return res.status(403).json({ error: "Password admin salah" });
    const pathname = payload?.pathname;
    if (typeof pathname !== "string" || !/^price-list\/[^/\\]{1,160}\.(pdf|xlsx|xls)$/i.test(pathname))
      return res.status(400).json({ error: "Hanya file Excel/PDF untuk price list" });
    const result = await handleUpload({
      body, request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["application/pdf", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "application/octet-stream"],
        maximumSizeInBytes: 20 * 1024 * 1024, addRandomSuffix: true
      }),
      onUploadCompleted: async () => {}
    });
    return res.status(200).json(result);
  } catch (e) { return res.status(500).json({ error: e instanceof Error ? e.message : "Gagal memproses price list" }); }
}