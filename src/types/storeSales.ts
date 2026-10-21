export interface LobPerformance {
  id: string;
  name: string; // 'APPLE' | 'ANDROID' | 'ACCESSORIES' | 'VAS'
  currentSales: number;
  target: number;
  achievementPercent: number;
  estSales: number;
  estPercent: number;
  points: number;
  maxPoints: number;
  variance: number;
}

export interface StaffPerformanceRecord {
  id: string;
  name: string;
  role: string;
  totalSales: number;
  target: number;
  achievementPercent: number;
  transactions: number;
  upt: number; // Units Per Transaction
  atv: number; // Average Transaction Value
  points: number;
  status: 'Productive' | 'Need Push';
  estIncentive: number;
}

export interface StoreOverviewData {
  storeCode: string;
  storeName: string;
  periodLabel: string;
  periodDateInfo: string;
  totalSales: number;
  totalTarget: number;
  achievementPercent: number;
  estSales: number;
  estPercent: number;
  totalPoints: number;
  maxPoints: number;
  variance: number;
  lobs: LobPerformance[];
  totalStaff: number;
  productiveStaff: number;
  needPushStaff: number;
  totalTransactions: number;
  avgUpt: number;
  avgAtv: number;
  staffList: StaffPerformanceRecord[];
}
