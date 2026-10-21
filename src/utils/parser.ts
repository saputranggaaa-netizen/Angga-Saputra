import { SalesRecord, ColumnMapping } from '../types/sales';

/**
 * Clean a string representation of money / number
 * e.g. "Rp 125.000.000", "$ 1,500.50", "1500000"
 */
export function parseCleanNumber(val: any): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;

  const str = String(val).trim();
  if (!str) return 0;

  // Remove currency symbols, spaces, Rp, IDR, USD, etc.
  let cleaned = str.replace(/[Rp$€£¥\sA-Za-z]/g, '');

  // If Indonesian style: 125.000.000,00 or 125.000
  if (cleaned.includes('.') && cleaned.includes(',')) {
    // 125.000.000,50 -> dot is thousands, comma is decimal
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (cleaned.includes('.')) {
    // Could be thousands (e.g. 50.000 or 50.000.000) or decimal (e.g. 50.5)
    const dotParts = cleaned.split('.');
    if (dotParts.length > 2) {
      // Multiple dots -> thousands separator
      cleaned = cleaned.replace(/\./g, '');
    } else if (dotParts.length === 2 && dotParts[1].length === 3) {
      // e.g. "50.000" -> likely Indonesian thousands
      cleaned = cleaned.replace(/\./g, '');
    }
  } else if (cleaned.includes(',')) {
    const commaParts = cleaned.split(',');
    if (commaParts.length > 2 || (commaParts.length === 2 && commaParts[1].length === 3)) {
      // English thousands: 125,000,000
      cleaned = cleaned.replace(/,/g, '');
    } else {
      // 50,5 -> decimal
      cleaned = cleaned.replace(',', '.');
    }
  }

  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

/**
 * Standardize dates into YYYY-MM-DD
 */
export function normalizeDate(val: any): string {
  if (!val) return new Date().toISOString().split('T')[0];
  const str = String(val).trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Indonesian / European: DD/MM/YYYY or DD-MM-YYYY
  const dmMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (dmMatch) {
    const day = dmMatch[1].padStart(2, '0');
    const month = dmMatch[2].padStart(2, '0');
    const year = dmMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Attempt standard Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }

  return str;
}

/**
 * Standardize deal status
 */
export function normalizeStatus(val: any): SalesRecord['status'] {
  if (!val) return 'Closed Won';
  const s = String(val).toLowerCase().trim();

  if (s.includes('won') || s.includes('selesai') || s.includes('sukses') || s.includes('lunas') || s.includes('deal') || s.includes('berhasil')) {
    return 'Closed Won';
  }
  if (s.includes('nego') || s.includes('tahap akhir')) {
    return 'Negotiation';
  }
  if (s.includes('propos') || s.includes('penawaran') || s.includes('pitch')) {
    return 'Proposal';
  }
  if (s.includes('lead') || s.includes('prospek') || s.includes('awal')) {
    return 'Lead';
  }
  if (s.includes('lost') || s.includes('gagal') || s.includes('batal') || s.includes('cancel')) {
    return 'Closed Lost';
  }

  return 'Closed Won';
}

/**
 * Auto-detect column mappings based on header text
 */
export function detectColumnMapping(headers: string[]): ColumnMapping {
  const findCol = (patterns: string[]): string => {
    for (const pattern of patterns) {
      const match = headers.find(h => {
        const clean = h.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        const patClean = pattern.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        return clean === patClean || clean.includes(patClean);
      });
      if (match) return match;
    }
    return '';
  };

  return {
    date: findCol(['tanggal', 'date', 'tgl', 'waktu', 'periode', 'createdat', 'hari']),
    salesRep: findCol(['salesrep', 'namasales', 'sales', 'salesperson', 'pic', 'account executive', 'agent', 'salesman', 'represen']),
    customer: findCol(['customer', 'pelanggan', 'klien', 'client', 'namacustomer', 'perusahaan', 'buyer']),
    product: findCol(['produk', 'product', 'nama produk', 'item', 'barang', 'layanan', 'service', 'sku']),
    category: findCol(['kategori', 'category', 'jenis', 'tipe', 'departemen', 'segment', 'divisi']),
    region: findCol(['wilayah', 'region', 'area', 'cabang', 'kota', 'lokasi', 'provinsi', 'branch']),
    quantity: findCol(['qty', 'quantity', 'jumlah', 'unit', 'volume', 'kuantitas', 'banyak']),
    unitPrice: findCol(['hargasatuan', 'unitprice', 'harga', 'price', 'tarif', 'satuan']),
    totalRevenue: findCol(['totalrevenue', 'omset', 'omzet', 'total', 'revenue', 'pendapatan', 'nilai', 'subtotal', 'salesamount', 'nominal']),
    target: findCol(['target', 'targetpenjualan', 'quota', 'goal', 'kuota']),
    status: findCol(['status', 'stage', 'dealstage', 'tahap', 'statusdeal', 'statustransaksi']),
  };
}

/**
 * Parse Google Sheets raw values into typed SalesRecord[]
 */
export function parseSheetData(rawValues: string[][], customMapping?: ColumnMapping): {
  records: SalesRecord[];
  headers: string[];
  mapping: ColumnMapping;
} {
  if (!rawValues || rawValues.length < 2) {
    return {
      records: [],
      headers: [],
      mapping: {
        date: '',
        salesRep: '',
        product: '',
        category: '',
        region: '',
        totalRevenue: '',
      },
    };
  }

  // Find the first non-empty row as header
  let headerIndex = 0;
  for (let i = 0; i < rawValues.length; i++) {
    if (rawValues[i].some(cell => String(cell).trim().length > 0)) {
      headerIndex = i;
      break;
    }
  }

  const headers = rawValues[headerIndex].map(h => String(h || '').trim());
  const mapping = customMapping || detectColumnMapping(headers);

  // Column index lookups
  const getIndex = (colName?: string) => (colName ? headers.indexOf(colName) : -1);

  const idxDate = getIndex(mapping.date);
  const idxSalesRep = getIndex(mapping.salesRep);
  const idxCustomer = getIndex(mapping.customer);
  const idxProduct = getIndex(mapping.product);
  const idxCategory = getIndex(mapping.category);
  const idxRegion = getIndex(mapping.region);
  const idxQuantity = getIndex(mapping.quantity);
  const idxUnitPrice = getIndex(mapping.unitPrice);
  const idxTotalRevenue = getIndex(mapping.totalRevenue);
  const idxTarget = getIndex(mapping.target);
  const idxStatus = getIndex(mapping.status);

  const records: SalesRecord[] = [];

  for (let r = headerIndex + 1; r < rawValues.length; r++) {
    const row = rawValues[r];
    if (!row || row.length === 0 || !row.some(c => String(c).trim().length > 0)) {
      continue;
    }

    const totalRevRaw = idxTotalRevenue !== -1 ? row[idxTotalRevenue] : null;
    const qtyRaw = idxQuantity !== -1 ? row[idxQuantity] : null;
    const unitPriceRaw = idxUnitPrice !== -1 ? row[idxUnitPrice] : null;

    let qty = parseCleanNumber(qtyRaw) || 1;
    let unitPrice = parseCleanNumber(unitPriceRaw);
    let totalRevenue = parseCleanNumber(totalRevRaw);

    // If totalRevenue is missing but qty and unitPrice exist
    if (totalRevenue === 0 && unitPrice > 0) {
      totalRevenue = qty * unitPrice;
    }
    // If unitPrice is missing but totalRevenue and qty exist
    if (unitPrice === 0 && totalRevenue > 0 && qty > 0) {
      unitPrice = totalRevenue / qty;
    }

    const salesRep = (idxSalesRep !== -1 && row[idxSalesRep]) ? String(row[idxSalesRep]).trim() : 'Tim Penjualan';
    const product = (idxProduct !== -1 && row[idxProduct]) ? String(row[idxProduct]).trim() : 'Produk Penjualan';
    const category = (idxCategory !== -1 && row[idxCategory]) ? String(row[idxCategory]).trim() : 'Umum';
    const region = (idxRegion !== -1 && row[idxRegion]) ? String(row[idxRegion]).trim() : 'Nasional';
    const customer = (idxCustomer !== -1 && row[idxCustomer]) ? String(row[idxCustomer]).trim() : 'Klien';
    const date = idxDate !== -1 ? normalizeDate(row[idxDate]) : new Date().toISOString().split('T')[0];
    const status = idxStatus !== -1 ? normalizeStatus(row[idxStatus]) : 'Closed Won';
    const target = idxTarget !== -1 ? parseCleanNumber(row[idxTarget]) : undefined;

    records.push({
      id: `ROW-${r + 1}`,
      date,
      salesRep,
      customer,
      product,
      category,
      region,
      quantity: qty,
      unitPrice,
      totalRevenue,
      target,
      status,
    });
  }

  return { records, headers, mapping };
}
