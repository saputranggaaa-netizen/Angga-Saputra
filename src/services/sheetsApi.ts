import { getAccessToken } from './firebase';

export interface DriveSpreadsheetFile {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
  iconLink?: string;
}

export interface SheetDetails {
  id: string;
  title: string;
  tabs: string[];
}

export interface SheetValuesResponse {
  range: string;
  majorDimension: string;
  values: string[][];
}

/**
 * Extracts a Google Spreadsheet ID from either a direct ID or a full Google Sheets URL.
 */
export function extractSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  // Check for docs.google.com/spreadsheets/d/<ID> pattern
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // If it's already an ID (alphanumeric, dashes, underscores, typically 44 characters)
  if (/^[a-zA-Z0-9-_]{20,60}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Fetch list of Google Sheets files available in user's Drive.
 */
export async function listDriveSpreadsheets(): Promise<DriveSpreadsheetFile[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum login dengan akun Google. Silakan login terlebih dahulu.');
  }

  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const fields = encodeURIComponent('files(id, name, modifiedTime, webViewLink, iconLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=modifiedTime%20desc&pageSize=30`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Gagal mengambil daftar spreadsheet (${res.status})`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Fetch spreadsheet metadata including title and list of sheet tabs.
 */
export async function getSpreadsheetDetails(spreadsheetId: string): Promise<SheetDetails> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum login dengan akun Google.');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}?fields=properties.title,sheets.properties.title`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Gagal membaca informasi spreadsheet (${res.status}). Pastikan ID atau URL benar dan Anda memiliki akses.`);
  }

  const data = await res.json();
  const tabs = (data.sheets || []).map((s: any) => s.properties?.title).filter(Boolean);

  return {
    id: cleanId,
    title: data.properties?.title || 'Spreadsheet Penjualan',
    tabs: tabs.length > 0 ? tabs : ['Sheet1'],
  };
}

/**
 * Fetch raw rows/values from a specific tab in the spreadsheet.
 */
export async function getSpreadsheetValues(spreadsheetId: string, sheetTab: string): Promise<string[][]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Belum login dengan akun Google.');
  }

  const cleanId = extractSpreadsheetId(spreadsheetId);
  const range = encodeURIComponent(sheetTab);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}?valueRenderOption=FORMATTED_VALUE`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Gagal membaca isi tab "${sheetTab}" (${res.status})`);
  }

  const data: SheetValuesResponse = await res.json();
  return data.values || [];
}
