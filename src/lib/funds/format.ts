import type { BaseCurrency, Country, Fund } from "./types";

export function formatMoney(
  amount: number,
  currency: BaseCurrency | "INR" | "USD",
  opts?: { compact?: boolean; digits?: number },
): string {
  const digits = opts?.digits ?? (Math.abs(amount) >= 1000 ? 0 : 2);
  if (opts?.compact) return formatCompact(amount, currency);
  try {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: digits,
      minimumFractionDigits: digits,
    }).format(amount);
  } catch {
    const sym = currency === "INR" ? "₹" : "$";
    return `${sym}${amount.toFixed(digits)}`;
  }
}

export function formatCompact(amount: number, currency: BaseCurrency): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  if (currency === "INR") {
    if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(abs >= 1e8 ? 1 : 2)} Cr`;
    if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
    return formatMoney(amount, "INR");
  }
  if (abs >= 1e9) return `${sign}$${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}K`;
  return formatMoney(amount, "USD");
}

export function formatAum(fund: Fund): string {
  const m = fund.aumMillionLocal;
  if (fund.country === "IN") {
    const cr = m / 10;
    return cr >= 1000 ? `₹${(cr / 1000).toFixed(2)} Lakh Cr` : `₹${cr.toFixed(0)} Cr`;
  }
  if (m >= 1000) return `$${(m / 1000).toFixed(1)}B`;
  return `$${m.toFixed(0)}M`;
}

export function formatPct(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const pct = value * 100;
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct.toFixed(digits)}%`;
}

export function formatPctPlain(value: number | null | undefined, digits = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNav(nav: number, country: Country): string {
  if (country === "IN") return `₹${nav.toFixed(2)}`;
  return `$${nav.toFixed(2)}`;
}

export function formatExpense(ratio: number): string {
  return `${ratio.toFixed(ratio < 0.1 ? 2 : 2)}%`;
}

export function signedClass(value: number | null | undefined): string {
  if (value === null || value === undefined || Math.abs(value) < 1e-8) return "text-muted";
  return value > 0 ? "text-up" : "text-down";
}

export function countryLabel(country: Country): string {
  return country === "IN" ? "India" : "United States";
}

export function assetLabel(asset: string): string {
  const map: Record<string, string> = {
    equity: "Equity",
    debt: "Debt",
    hybrid: "Hybrid",
    commodity: "Commodity",
    "money-market": "Money market",
  };
  return map[asset] ?? asset;
}

export function riskLabel(risk: string): string {
  const map: Record<string, string> = {
    low: "Low",
    moderate: "Moderate",
    high: "High",
    "very-high": "Very high",
  };
  return map[risk] ?? risk;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-");
  if (!y || !m || !d) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`;
}

export function ageYears(inception: string, asOf: string): string {
  const a = new Date(`${inception}T00:00:00Z`).getTime();
  const b = new Date(`${asOf}T00:00:00Z`).getTime();
  const years = (b - a) / (365.25 * 86400000);
  if (years < 1) return `${Math.round(years * 12)} mo`;
  return `${years.toFixed(1)} yrs`;
}
