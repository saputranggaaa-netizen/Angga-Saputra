import { createSign } from "node:crypto";

const SHEET_ID = "1v_QCLTDKORjVnByrzo9qRiivdU8CGO99nJri9jBETWM";
const RANGE = "'ACCESS LOG'!A:G";

async function googleToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) throw new Error("Google Sheets service account belum dikonfigurasi");
  const now = Math.floor(Date.now() / 1000);
  const enc = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const input = enc({ alg: "RS256", typ: "JWT" }) + "." + enc({
    iss: email, scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600
  });
  const signer = createSign("RSA-SHA256");
  signer.update(input);
  const assertion = input + "." + signer.sign(key, "base64url");
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion })
  });
  if (!response.ok) throw new Error("Autentikasi Google gagal");
  return (await response.json()).access_token as string;
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  try {
    if (req.method === "GET") {
      const expected = process.env.ADMIN_ACCESS_LOG_PASSWORD;
      if (!expected || req.headers["x-admin-access-password"] !== expected)
        return res.status(403).json({ error: "Akses admin ditolak" });
      const token = await googleToken();
      const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(RANGE), {
        headers: { Authorization: "Bearer " + token }
      });
      if (!response.ok) throw new Error("Gagal membaca Access Log");
      return res.status(200).json({ rows: (await response.json()).values || [] });
    }
    const { salesId, salesName, location, locationStatus } = req.body || {};
    if (!/^\\d{4,20}$/.test(String(salesId || ""))) return res.status(400).json({ error: "Sales ID tidak valid" });
    const clean = (value: unknown) => String(value || "").slice(0, 180).replace(/^[=+@-]/, "'");
    const now = new Date();
    const date = new Intl.DateTimeFormat("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Jakarta" }).format(now);
    const time = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone: "Asia/Jakarta" }).format(now).replace(/\\./g, ":");
    const token = await googleToken();
    const response = await fetch("https://sheets.googleapis.com/v4/spreadsheets/" + SHEET_ID + "/values/" + encodeURIComponent(RANGE) + ":append?valueInputOption=RAW&insertDataOption=INSERT_ROWS", {
      method: "POST", headers: { Authorization: "Bearer " + token, "content-type": "application/json" },
      body: JSON.stringify({ values: [[now.toISOString(), date, time, clean(salesId), clean(salesName), clean(location) || "Tidak dibagikan", clean(locationStatus) || "Tidak tersedia"]] })
    });
    if (!response.ok) throw new Error("Gagal menyimpan Access Log");
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(503).json({ error: error instanceof Error ? error.message : "Layanan tidak tersedia" });
  }
}
