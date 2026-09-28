import type { BaseCurrency, Country, Fund, Lot, NavPoint } from "./types";
import { AS_OF } from "./types";

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundNav(nav: number, country: Country): number {
  const d = country === "IN" ? 4 : 2;
  const p = 10 ** d;
  return Math.round(nav * p) / p;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function generateNavHistory(opts: {
  id: string;
  lastNav: number;
  cagr: number;
  vol: number;
  country: Country;
  asOf?: string;
}): NavPoint[] {
  const asOf = opts.asOf ?? AS_OF;
  const rng = mulberry32(hashString(opts.id));
  const end = new Date(`${asOf}T00:00:00Z`);
  const points: NavPoint[] = [];
  let nav = opts.lastNav;
  points.push({ date: asOf, nav: roundNav(nav, opts.country) });

  const dailyDrift = Math.log(1 + opts.cagr) / 365;
  const dailyVol = opts.vol / Math.sqrt(252);

  for (let d = 1; d <= 92; d += 1) {
    const dt = new Date(end);
    dt.setUTCDate(dt.getUTCDate() - d);
    const shock = (rng() * 2 - 1) * dailyVol;
    nav = nav / Math.exp(dailyDrift + shock);
    points.push({ date: isoDate(dt), nav: roundNav(nav, opts.country) });
  }

  const monthlyDrift = Math.log(1 + opts.cagr) / 12;
  const monthlyVol = opts.vol / Math.sqrt(12);
  const monthCursor = new Date(`${points[points.length - 1]!.date}T00:00:00Z`);
  for (let m = 0; m < 60; m += 1) {
    monthCursor.setUTCMonth(monthCursor.getUTCMonth() - 1);
    const shock = (rng() * 2 - 1) * monthlyVol;
    nav = nav / Math.exp(monthlyDrift + shock);
    points.push({
      date: isoDate(monthCursor),
      nav: roundNav(Math.max(nav, opts.lastNav * 0.15), opts.country),
    });
  }

  const byDate = new Map<string, number>();
  for (const p of points) byDate.set(p.date, p.nav);
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({ date, nav: value }));
}

function navOnOrBefore(history: NavPoint[], date: string): number | null {
  let best: NavPoint | null = null;
  for (const p of history) {
    if (p.date <= date && (!best || p.date > best.date)) best = p;
  }
  return best?.nav ?? null;
}

export function periodReturn(
  history: NavPoint[],
  asOf: string,
  days: number,
): number | null {
  const end = navOnOrBefore(history, asOf);
  const startDate = new Date(`${asOf}T00:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - days);
  const start = navOnOrBefore(history, isoDate(startDate));
  if (!end || !start || start <= 0) return null;
  return end / start - 1;
}

export function annualizedReturn(
  history: NavPoint[],
  asOf: string,
  years: number,
): number | null {
  const r = periodReturn(history, asOf, Math.round(years * 365.25));
  if (r === null || r <= -1) return null;
  return (1 + r) ** (1 / years) - 1;
}

export function trailingVolatility(
  history: NavPoint[],
  asOf: string,
  days = 252,
): number | null {
  const window = history.filter((p) => p.date <= asOf).slice(-days);
  if (window.length < 20) return null;
  const rets: number[] = [];
  for (let i = 1; i < window.length; i += 1) {
    const prev = window[i - 1]!.nav;
    if (prev > 0) rets.push(window[i]!.nav / prev - 1);
  }
  if (rets.length < 10) return null;
  const mean = rets.reduce((s, x) => s + x, 0) / rets.length;
  const varc =
    rets.reduce((s, x) => s + (x - mean) ** 2, 0) / (rets.length - 1);
  const avgDays = 252;
  return Math.sqrt(varc) * Math.sqrt(avgDays);
}

export function maxDrawdown(history: NavPoint[]): number | null {
  if (history.length < 5) return null;
  let peak = history[0]!.nav;
  let dd = 0;
  for (const p of history) {
    if (p.nav > peak) peak = p.nav;
    const cur = p.nav / peak - 1;
    if (cur < dd) dd = cur;
  }
  return dd;
}

export function dayChange(history: NavPoint[], asOf: string): number | null {
  return periodReturn(history, asOf, 1);
}

export function xirr(
  cashflows: { date: string; amount: number }[],
): number | null {
  if (cashflows.length < 2) return null;
  const sorted = [...cashflows].sort((a, b) => a.date.localeCompare(b.date));
  const t0 = new Date(`${sorted[0]!.date}T00:00:00Z`).getTime();
  const years = (d: string) =>
    (new Date(`${d}T00:00:00Z`).getTime() - t0) / (365.25 * 86400000);
  const npv = (r: number) =>
    sorted.reduce(
      (s, cf) => s + cf.amount / (1 + r) ** years(cf.date),
      0,
    );
  const dnpv = (r: number) =>
    sorted.reduce((s, cf) => {
      const t = years(cf.date);
      return s - (t * cf.amount) / (1 + r) ** (t + 1);
    }, 0);
  let r = 0.12;
  for (let i = 0; i < 64; i += 1) {
    const f = npv(r);
    const df = dnpv(r);
    if (Math.abs(df) < 1e-14) break;
    const next = r - f / df;
    if (!Number.isFinite(next)) return null;
    if (Math.abs(next - r) < 1e-8) {
      return Math.abs(npv(next)) < 1 ? next : null;
    }
    r = Math.min(10, Math.max(-0.95, next));
  }
  return Math.abs(npv(r)) < 1 ? r : null;
}

export function fxToBase(
  amountLocal: number,
  country: Country,
  base: BaseCurrency,
  usdInr: number,
): number {
  if (country === "IN") {
    return base === "INR" ? amountLocal : amountLocal / usdInr;
  }
  return base === "USD" ? amountLocal : amountLocal * usdInr;
}

export type HoldingSnapshot = {
  fund: Fund;
  lots: Lot[];
  units: number;
  avgCost: number;
  costLocal: number;
  valueLocal: number;
  gainLocal: number;
  gainLocalPct: number;
  costBase: number;
  valueBase: number;
  gainBase: number;
  dayChangePct: number | null;
  dayChangeBase: number;
  prevMonthValueBase: number;
};

export function snapshotHolding(
  fund: Fund,
  lots: Lot[],
  base: BaseCurrency,
  usdInr: number,
  asOf = AS_OF,
): HoldingSnapshot {
  const units = lots.reduce((s, l) => s + l.units, 0);
  const costLocal = lots.reduce((s, l) => s + l.units * l.costPerUnit, 0);
  const avgCost = units > 0 ? costLocal / units : 0;
  const valueLocal = units * fund.nav;
  const gainLocal = valueLocal - costLocal;
  const prev = navOnOrBefore(fund.history, asOf);
  const yestDate = new Date(`${asOf}T00:00:00Z`);
  yestDate.setUTCDate(yestDate.getUTCDate() - 1);
  const yest = navOnOrBefore(fund.history, isoDate(yestDate));
  const dayPct =
    prev && yest && yest > 0 ? prev / yest - 1 : dayChange(fund.history, asOf);

  const monthAgo = new Date(`${asOf}T00:00:00Z`);
  monthAgo.setUTCMonth(monthAgo.getUTCMonth() - 1);
  const mNav = navOnOrBefore(fund.history, isoDate(monthAgo)) ?? fund.nav;

  const costBase = fxToBase(costLocal, fund.country, base, usdInr);
  const valueBase = fxToBase(valueLocal, fund.country, base, usdInr);
  const prevMonthValueBase = fxToBase(units * mNav, fund.country, base, usdInr);
  const dayChangeBase = fxToBase(
    units * fund.nav * (dayPct ?? 0),
    fund.country,
    base,
    usdInr,
  );

  return {
    fund,
    lots,
    units,
    avgCost,
    costLocal,
    valueLocal,
    gainLocal,
    gainLocalPct: costLocal > 0 ? gainLocal / costLocal : 0,
    costBase,
    valueBase,
    gainBase: valueBase - costBase,
    dayChangePct: dayPct,
    dayChangeBase,
    prevMonthValueBase,
  };
}

export type AttributionLine = {
  key: string;
  label: string;
  amount: number;
};

export type PortfolioMetrics = {
  invested: number;
  value: number;
  gain: number;
  gainPct: number;
  dayChange: number;
  dayChangePct: number;
  xirr: number | null;
  indiaValue: number;
  usaValue: number;
  indiaPct: number;
  usaPct: number;
  byAsset: Record<string, number>;
  byFund: HoldingSnapshot[];
  attribution: AttributionLine[];
  monthDelta: number;
  valueHistory: NavPoint[];
};

export function portfolioMetrics(
  funds: Fund[],
  lots: Lot[],
  base: BaseCurrency,
  usdInr: number,
  prevUsdInr: number,
  asOf = AS_OF,
): PortfolioMetrics {
  const byFundId = new Map(funds.map((f) => [f.id, f]));
  const grouped = new Map<string, Lot[]>();
  for (const lot of lots) {
    const arr = grouped.get(lot.fundId) ?? [];
    arr.push(lot);
    grouped.set(lot.fundId, arr);
  }

  const snaps: HoldingSnapshot[] = [];
  for (const [fundId, fundLots] of grouped) {
    const fund = byFundId.get(fundId);
    if (!fund) continue;
    snaps.push(snapshotHolding(fund, fundLots, base, usdInr, asOf));
  }

  const value = snaps.reduce((s, x) => s + x.valueBase, 0);
  const invested = snaps.reduce((s, x) => s + x.costBase, 0);
  const gain = value - invested;
  const dayChangeAmt = snaps.reduce((s, x) => s + x.dayChangeBase, 0);
  const indiaValue = snaps
    .filter((s) => s.fund.country === "IN")
    .reduce((s, x) => s + x.valueBase, 0);
  const usaValue = snaps
    .filter((s) => s.fund.country === "US")
    .reduce((s, x) => s + x.valueBase, 0);

  const byAsset: Record<string, number> = {};
  for (const s of snaps) {
    byAsset[s.fund.assetClass] = (byAsset[s.fund.assetClass] ?? 0) + s.valueBase;
  }

  const cashflows: { date: string; amount: number }[] = [];
  for (const lot of lots) {
    const fund = byFundId.get(lot.fundId);
    if (!fund) continue;
    cashflows.push({
      date: lot.purchasedAt,
      amount: -fxToBase(
        lot.units * lot.costPerUnit,
        fund.country,
        base,
        usdInr,
      ),
    });
  }
  if (value > 0) cashflows.push({ date: asOf, amount: value });

  const prevMonthValue = snaps.reduce((s, x) => s + x.prevMonthValueBase, 0);
  const monthContrib = lots
    .filter((l) => l.purchasedAt > monthAgoIso(asOf) && l.purchasedAt <= asOf)
    .reduce((s, l) => {
      const fund = byFundId.get(l.fundId);
      if (!fund) return s;
      return s + fxToBase(l.units * l.costPerUnit, fund.country, base, usdInr);
    }, 0);

  const indiaDelta = snaps
    .filter((s) => s.fund.country === "IN")
    .reduce((s, x) => s + (x.valueBase - x.prevMonthValueBase), 0);
  const usaLocalDelta = snaps
    .filter((s) => s.fund.country === "US")
    .reduce((s, x) => {
      const units = x.units;
      const prevLocal = x.prevMonthValueBase / (base === "USD" ? 1 : prevUsdInr);
      const nowLocal = x.valueLocal;
      const localGain = nowLocal - prevLocal;
      return s + fxToBase(localGain, "US", base, usdInr);
    }, 0);

  const usaValueNowLocal = snaps
    .filter((s) => s.fund.country === "US")
    .reduce((s, x) => s + x.valueLocal, 0);
  const fxEffect =
    base === "INR"
      ? usaValueNowLocal * (usdInr - prevUsdInr)
      : snaps
          .filter((s) => s.fund.country === "IN")
          .reduce((s, x) => s + x.valueLocal, 0) *
        (1 / usdInr - 1 / prevUsdInr);

  const attribution: AttributionLine[] = [
    {
      key: "in-equity",
      label: "Indian fund price movement",
      amount: indiaDelta - monthContribIndia(lots, byFundId, base, usdInr, asOf),
    },
    { key: "us-price", label: "US fund price movement", amount: usaLocalDelta },
    { key: "fx", label: "USD/INR currency movement", amount: fxEffect },
    { key: "flows", label: "Contributions this month", amount: monthContrib },
  ];

  const valueHistory = buildValueHistory(snaps, lots, byFundId, base, usdInr, asOf);

  return {
    invested,
    value,
    gain,
    gainPct: invested > 0 ? gain / invested : 0,
    dayChange: dayChangeAmt,
    dayChangePct: value - dayChangeAmt !== 0 ? dayChangeAmt / (value - dayChangeAmt) : 0,
    xirr: xirr(cashflows),
    indiaValue,
    usaValue,
    indiaPct: value > 0 ? indiaValue / value : 0,
    usaPct: value > 0 ? usaValue / value : 0,
    byAsset,
    byFund: snaps.sort((a, b) => b.valueBase - a.valueBase),
    attribution,
    monthDelta: value - prevMonthValue,
    valueHistory,
  };
}

function monthAgoIso(asOf: string): string {
  const d = new Date(`${asOf}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - 1);
  return isoDate(d);
}

function monthContribIndia(
  lots: Lot[],
  byFundId: Map<string, Fund>,
  base: BaseCurrency,
  usdInr: number,
  asOf: string,
): number {
  const from = monthAgoIso(asOf);
  return lots
    .filter((l) => l.purchasedAt > from && l.purchasedAt <= asOf)
    .reduce((s, l) => {
      const fund = byFundId.get(l.fundId);
      if (!fund || fund.country !== "IN") return s;
      return s + fxToBase(l.units * l.costPerUnit, "IN", base, usdInr);
    }, 0);
}

function buildValueHistory(
  snaps: HoldingSnapshot[],
  lots: Lot[],
  byFundId: Map<string, Fund>,
  base: BaseCurrency,
  usdInr: number,
  asOf: string,
): NavPoint[] {
  const dates = new Set<string>();
  for (const s of snaps) {
    for (const p of s.fund.history) {
      if (p.date <= asOf) dates.add(p.date);
    }
  }
  const sorted = [...dates].sort();
  const sampled =
    sorted.length > 90
      ? sorted.filter((_, i) => i % Math.ceil(sorted.length / 90) === 0 || i === sorted.length - 1)
      : sorted;
  return sampled.map((date) => {
    let total = 0;
    const grouped = new Map<string, number>();
    for (const lot of lots) {
      if (lot.purchasedAt > date) continue;
      grouped.set(lot.fundId, (grouped.get(lot.fundId) ?? 0) + lot.units);
    }
    for (const [fundId, units] of grouped) {
      const fund = byFundId.get(fundId);
      if (!fund) continue;
      const nav = navOnOrBefore(fund.history, date) ?? fund.nav;
      total += fxToBase(units * nav, fund.country, base, usdInr);
    }
    return { date, nav: total };
  });
}

export function sipFutureValue(opts: {
  monthly: number;
  years: number;
  annualReturn: number;
  stepUp: number;
  inflation: number;
}): { nominal: number; invested: number; real: number; points: NavPoint[] } {
  const months = Math.round(opts.years * 12);
  const r = opts.annualReturn / 12;
  let sip = opts.monthly;
  let value = 0;
  let invested = 0;
  const points: NavPoint[] = [];
  const start = new Date(`${AS_OF}T00:00:00Z`);
  for (let m = 1; m <= months; m += 1) {
    invested += sip;
    value = (value + sip) * (1 + r);
    if (m % 12 === 0) sip *= 1 + opts.stepUp;
    if (m % 6 === 0 || m === months) {
      const d = new Date(start);
      d.setUTCMonth(d.getUTCMonth() + m);
      points.push({ date: isoDate(d), nav: value });
    }
  }
  const real = value / (1 + opts.inflation) ** opts.years;
  return { nominal: value, invested, real, points };
}
