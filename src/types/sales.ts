export interface RawSheetRow {
  [key: string]: any;
}

export interface SalesRecord {
  id: string;
  date: string; // YYYY-MM-DD
  salesRep: string;
  customer: string;
  product: string;
  category: string;
  region: string;
  quantity: number;
  unitPrice: number;
  totalRevenue: number;
  target?: number;
  status: 'Closed Won' | 'Negotiation' | 'Proposal' | 'Lead' | 'Closed Lost';
  notes?: string;
}

export interface ColumnMapping {
  date: string;
  salesRep: string;
  customer?: string;
  product: string;
  category: string;
  region: string;
  quantity?: string;
  unitPrice?: string;
  totalRevenue: string;
  target?: string;
  status?: string;
}

export interface SalesRepStats {
  name: string;
  avatar?: string;
  totalRevenue: number;
  totalTarget: number;
  achievementRate: number; // percentage (e.g. 105.4%)
  dealsWon: number;
  totalDeals: number;
  winRate: number; // percentage
  averageDealSize: number;
  rank: number;
  tier: 'Top Tier' | 'Target Met' | 'Need Push' | 'Lagging';
}

export interface SheetMetadata {
  id: string;
  title: string;
  sheetTabs: string[];
  selectedTab: string;
  lastUpdated?: string;
  url?: string;
}

export interface FilterState {
  dateRange: 'all' | 'today' | '7days' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
  salesRep: string;
  category: string;
  region: string;
  status: string;
  searchQuery: string;
}

export interface PeriodComparison {
  label: string;
  periodName: string;
  comparisonPeriodName: string;
  currentRevenue: number;
  previousRevenue: number;
  revenueChangePercent: number;
  isRevenueUp: boolean;
  isRevenueNeutral: boolean;
  currentDeals: number;
  previousDeals: number;
  dealsChangePercent: number;
  isDealsUp: boolean;
}

