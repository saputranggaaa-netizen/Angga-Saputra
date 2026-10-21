import { StoreOverviewData, StaffPerformanceRecord } from '../types/storeSales';
import { SalesRecord } from '../types/sales';

export const DEFAULT_STORE_DATA: StoreOverviewData = {
  storeCode: 'QF10',
  storeName: 'Digiplus Kota...',
  periodLabel: 'Oktober 2026',
  periodDateInfo: 'Data s/d 21/10 · Time gone 67,7%',
  totalSales: 7543088015,
  totalTarget: 6876812958,
  achievementPercent: 110,
  estSales: 11135034689,
  estPercent: 162,
  totalPoints: 66.5,
  maxPoints: 100,
  variance: 666275057,
  lobs: [
    {
      id: 'apple',
      name: 'APPLE',
      currentSales: 6650295035,
      target: 4707668457,
      achievementPercent: 141,
      estSales: 9817102195,
      estPercent: 209,
      points: 30,
      maxPoints: 30,
      variance: 1942626578,
    },
    {
      id: 'android',
      name: 'ANDROID',
      currentSales: 633979010,
      target: 1501496255,
      achievementPercent: 42,
      estSales: 935873777,
      estPercent: 62,
      points: 13.1,
      maxPoints: 30,
      variance: -867517245,
    },
    {
      id: 'accessories',
      name: 'ACCESSORIES',
      currentSales: 181653970,
      target: 360549883,
      achievementPercent: 50,
      estSales: 268155860,
      estPercent: 74,
      points: 15.6,
      maxPoints: 30,
      variance: -178895913,
    },
    {
      id: 'vas',
      name: 'VAS',
      currentSales: 77160000,
      target: 307098363,
      achievementPercent: 25,
      estSales: 113902857,
      estPercent: 37,
      points: 7.8,
      maxPoints: 10,
      variance: -229938363,
    },
  ],
  totalStaff: 6,
  productiveStaff: 1,
  needPushStaff: 5,
  totalTransactions: 449,
  avgUpt: 1.5,
  avgAtv: 16799751,
  staffList: [
    {
      id: 'STF-01',
      name: 'Budi Santoso',
      role: 'Senior Sales Specialist',
      totalSales: 3250100000,
      target: 2200000000,
      achievementPercent: 147.7,
      transactions: 142,
      upt: 1.8,
      atv: 22888028,
      points: 92.5,
      status: 'Productive',
      estIncentive: 4850000,
    },
    {
      id: 'STF-02',
      name: 'Siti Rahmawati',
      role: 'Sales Specialist',
      totalSales: 1150400000,
      target: 1200000000,
      achievementPercent: 95.8,
      transactions: 88,
      upt: 1.5,
      atv: 13072727,
      points: 68.0,
      status: 'Need Push',
      estIncentive: 1650000,
    },
    {
      id: 'STF-03',
      name: 'Dimas Wicaksono',
      role: 'Sales Consultant',
      totalSales: 1020300000,
      target: 1200000000,
      achievementPercent: 85.0,
      transactions: 75,
      upt: 1.4,
      atv: 13604000,
      points: 62.4,
      status: 'Need Push',
      estIncentive: 1200000,
    },
    {
      id: 'STF-04',
      name: 'Dewi Lestari',
      role: 'Sales Specialist',
      totalSales: 890200000,
      target: 1100000000,
      achievementPercent: 80.9,
      transactions: 64,
      upt: 1.3,
      atv: 13909375,
      points: 58.1,
      status: 'Need Push',
      estIncentive: 950000,
    },
    {
      id: 'STF-05',
      name: 'Rian Pratama',
      role: 'Junior Sales',
      totalSales: 682088015,
      target: 900000000,
      achievementPercent: 75.8,
      transactions: 48,
      upt: 1.2,
      atv: 14210166,
      points: 52.0,
      status: 'Need Push',
      estIncentive: 750000,
    },
    {
      id: 'STF-06',
      name: 'Hendra Wijaya',
      role: 'Junior Sales',
      totalSales: 550000000,
      target: 850000000,
      achievementPercent: 64.7,
      transactions: 32,
      upt: 1.1,
      atv: 17187500,
      points: 44.5,
      status: 'Need Push',
      estIncentive: 500000,
    },
  ],
};

/**
 * Dynamically compute StoreOverviewData from custom Google Sheets records if loaded
 */
export function deriveStoreDataFromRecords(records: SalesRecord[]): StoreOverviewData {
  if (!records || records.length === 0) {
    return DEFAULT_STORE_DATA;
  }

  let totalSales = 0;
  let totalTarget = 0;
  let totalUnits = 0;
  let totalTransactions = records.length;

  const lobMap = new Map<string, { sales: number; target: number }>();
  lobMap.set('APPLE', { sales: 0, target: 4707668457 });
  lobMap.set('ANDROID', { sales: 0, target: 1501496255 });
  lobMap.set('ACCESSORIES', { sales: 0, target: 360549883 });
  lobMap.set('VAS', { sales: 0, target: 307098363 });

  const staffMap = new Map<string, { sales: number; transactions: number; units: number }>();

  records.forEach((r) => {
    const isWon = r.status === 'Closed Won';
    const rev = isWon ? r.totalRevenue : 0;
    totalSales += rev;
    totalUnits += r.quantity || 1;
    if (r.target) totalTarget += r.target;

    // Categorize LOB
    const catUpper = (r.category || '').toUpperCase();
    const prodUpper = (r.product || '').toUpperCase();

    if (catUpper.includes('APPLE') || prodUpper.includes('IPHONE') || prodUpper.includes('MAC') || prodUpper.includes('IPAD')) {
      const cur = lobMap.get('APPLE')!;
      cur.sales += rev;
    } else if (catUpper.includes('ANDROID') || prodUpper.includes('SAMSUNG') || prodUpper.includes('XIAOMI') || prodUpper.includes('OPPO')) {
      const cur = lobMap.get('ANDROID')!;
      cur.sales += rev;
    } else if (catUpper.includes('ACCESSOR') || catUpper.includes('HARDWARE') || prodUpper.includes('CASE') || prodUpper.includes('CHARGER') || prodUpper.includes('AUDIO')) {
      const cur = lobMap.get('ACCESSORIES')!;
      cur.sales += rev;
    } else {
      const cur = lobMap.get('VAS')!;
      cur.sales += rev;
    }

    // Staff
    const rep = r.salesRep || 'Staff';
    if (!staffMap.has(rep)) {
      staffMap.set(rep, { sales: 0, transactions: 0, units: 0 });
    }
    const s = staffMap.get(rep)!;
    s.sales += rev;
    s.transactions += 1;
    s.units += r.quantity || 1;
  });

  if (totalTarget === 0) {
    totalTarget = DEFAULT_STORE_DATA.totalTarget;
  }

  const achievementPercent = totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 100;
  // Estimation based on 67.7% elapsed month
  const estSales = Math.round(totalSales / 0.677);
  const estPercent = totalTarget > 0 ? Math.round((estSales / totalTarget) * 100) : 100;
  const variance = totalSales - totalTarget;

  // Lobs
  const lobs = Array.from(lobMap.entries()).map(([name, data]) => {
    const ach = data.target > 0 ? Math.round((data.sales / data.target) * 100) : 0;
    const est = Math.round(data.sales / 0.677);
    const estPct = data.target > 0 ? Math.round((est / data.target) * 100) : 0;
    const maxPts = name === 'VAS' ? 10 : 30;
    const pts = Math.min(Math.round((ach / 100) * maxPts * 10) / 10, maxPts);
    return {
      id: name.toLowerCase(),
      name,
      currentSales: data.sales,
      target: data.target,
      achievementPercent: ach,
      estSales: est,
      estPercent: estPct,
      points: pts,
      maxPoints: maxPts,
      variance: data.sales - data.target,
    };
  });

  const totalPoints = lobs.reduce((acc, l) => acc + l.points, 0);

  // Staff List
  const staffList: StaffPerformanceRecord[] = Array.from(staffMap.entries()).map(([name, data], idx) => {
    const target = 1200000000;
    const ach = Math.round((data.sales / target) * 1000) / 10;
    const upt = data.transactions > 0 ? Math.round((data.units / data.transactions) * 10) / 10 : 1;
    const atv = data.transactions > 0 ? Math.round(data.sales / data.transactions) : 0;
    const isProd = ach >= 100;
    return {
      id: `STF-0${idx + 1}`,
      name,
      role: isProd ? 'Senior Sales Specialist' : 'Sales Specialist',
      totalSales: data.sales,
      target,
      achievementPercent: ach,
      transactions: data.transactions,
      upt,
      atv,
      points: Math.min(ach, 100),
      status: isProd ? 'Productive' : 'Need Push',
      estIncentive: Math.round(data.sales * 0.0015),
    };
  });

  staffList.sort((a, b) => b.totalSales - a.totalSales);
  const productiveStaff = staffList.filter((s) => s.status === 'Productive').length;
  const needPushStaff = staffList.length - productiveStaff;

  return {
    storeCode: 'QF10',
    storeName: 'Digiplus Kota...',
    periodLabel: 'Oktober 2026',
    periodDateInfo: 'Data s/d 21/10 · Time gone 67,7%',
    totalSales,
    totalTarget,
    achievementPercent,
    estSales,
    estPercent,
    totalPoints: Math.round(totalPoints * 10) / 10,
    maxPoints: 100,
    variance,
    lobs,
    totalStaff: staffList.length || 6,
    productiveStaff: productiveStaff || 1,
    needPushStaff: needPushStaff || 5,
    totalTransactions: totalTransactions || 449,
    avgUpt: totalTransactions > 0 ? Math.round((totalUnits / totalTransactions) * 10) / 10 : 1.5,
    avgAtv: totalTransactions > 0 ? Math.round(totalSales / totalTransactions) : 16799751,
    staffList: staffList.length > 0 ? staffList : DEFAULT_STORE_DATA.staffList,
  };
}
