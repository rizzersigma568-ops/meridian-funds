export type Country = "IN" | "US";
export type BaseCurrency = "INR" | "USD";
export type AssetClass =
  | "equity"
  | "debt"
  | "hybrid"
  | "commodity"
  | "money-market";
export type RiskLevel = "low" | "moderate" | "high" | "very-high";
export type DistFreq = "none" | "monthly" | "quarterly" | "annual";
export type HoldingKind = "buy" | "sip";

export type NavPoint = { date: string; nav: number };

export type NamedWeight = { name: string; weight: number; ticker?: string };

export type FundDocument = { label: string; href: string };

export type Distribution = {
  date: string;
  amount: number;
  type: "dividend" | "capital-gains";
};

export type Fund = {
  id: string;
  country: Country;
  name: string;
  ticker: string;
  category: string;
  assetClass: AssetClass;
  provider: string;
  manager: string;
  benchmark: string;
  expenseRatio: number;
  aumMillionLocal: number;
  inceptionDate: string;
  minInvestment: number;
  minSip: number | null;
  nav: number;
  navCurrency: "INR" | "USD";
  navDate: string;
  return1y: number | null;
  return3y: number | null;
  return5y: number | null;
  return10y: number | null;
  volatility: number | null;
  maxDrawdown: number | null;
  yieldTtm: number | null;
  distributionFreq: DistFreq;
  holdingsCount: number;
  riskLevel: RiskLevel;
  geoExposure: Record<string, number>;
  sectorExposure: Record<string, number>;
  assetAllocation: Record<string, number>;
  topHoldings: NamedWeight[];
  history: NavPoint[];
  distributions: Distribution[];
  documents: FundDocument[];
  summary: string;
  dataSource: string;
  updatedAt: string;
};

export type FundListItem = Omit<
  Fund,
  | "geoExposure"
  | "sectorExposure"
  | "assetAllocation"
  | "topHoldings"
  | "history"
  | "distributions"
  | "documents"
  | "summary"
>;

export type FxQuote = {
  pair: "USDINR";
  rate: number;
  asOf: string;
  source: string;
};

export type Lot = {
  id: number;
  fundId: string;
  units: number;
  costPerUnit: number;
  purchasedAt: string;
  kind: HoldingKind;
  note: string | null;
};

export type Watchlist = {
  id: number;
  name: string;
  createdAt: string;
  items: { fundId: string; addedAt: string }[];
};

export type AlertRule = {
  id: number;
  fundId: string | null;
  kind: "move" | "nav" | "distribution" | "allocation" | "info";
  threshold: number | null;
  enabled: boolean;
};

export type AppNotification = {
  id: number;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export type UserSettings = {
  baseCurrency: BaseCurrency;
  sampleSeeded: boolean;
  sampleBannerDismissed: boolean;
};

export const AS_OF = "2026-09-25";
export const DATA_SOURCE =
  "Meridian research catalog — illustrative figures for product preview, not live market data";
export const DATA_UPDATED = "2026-09-25T18:30:00+05:30";
