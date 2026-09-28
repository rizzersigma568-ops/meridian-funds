import { FUND_CATALOG } from "@/lib/funds/catalog";
import { formatExpense, formatPct, formatPctPlain } from "@/lib/funds/format";

const DISCLAIMER =
  "This is an explanation of documented catalog data, not investment advice.";

function fundById(id: string) {
  return FUND_CATALOG.find((f) => f.id === id) ?? null;
}

export async function explainFund({ data: fundId }: { data: string }) {
  const fund = fundById(fundId);
  if (!fund) return { ok: false as const, error: "Fund not found" };

  const top = fund.topHoldings
    .slice(0, 5)
    .map((h) => `${h.name}${h.ticker ? ` (${h.ticker})` : ""} ${h.weight.toFixed(1)}%`)
    .join("; ");
  const sectors = Object.entries(fund.sectorExposure)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k} ${v}%`)
    .join(", ");

  const text = [
    `${fund.name} (${fund.ticker}) is a ${fund.country === "IN" ? "India" : "US"} ${fund.category.toLowerCase()} ${fund.assetClass} product from ${fund.provider}.`,
    `It is built to follow or sit near ${fund.benchmark}. The catalog expense ratio is ${formatExpense(fund.expenseRatio)}.`,
    `Risk in the catalog is marked ${fund.riskLevel.replace("-", " ")}. Trailing figures: 1Y ${formatPct(fund.return1y)}, 3Y ${formatPct(fund.return3y)}, 5Y ${formatPct(fund.return5y)}. Volatility ${formatPctPlain(fund.volatility)}, max drawdown ${formatPct(fund.maxDrawdown)}. Historical performance is not a forecast.`,
    top ? `Largest documented holdings: ${top}.` : "",
    sectors ? `Largest sector weights: ${sectors}.` : "",
    fund.summary,
    DISCLAIMER,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { ok: true as const, text, cached: true };
}

export async function explainCompare({ data: ids }: { data: string[] }) {
  const funds = ids
    .slice(0, 4)
    .map(fundById)
    .filter((f): f is NonNullable<typeof f> => Boolean(f));
  if (funds.length < 2) return { ok: false as const, error: "Pick at least two funds" };

  const lines = funds.map((f) => {
    return `• ${f.name} (${f.ticker}): ${f.country === "IN" ? "India" : "US"} ${f.category.toLowerCase()}, expense ${formatExpense(f.expenseRatio)}, 5Y ${formatPct(f.return5y)}, risk ${f.riskLevel.replace("-", " ")}, benchmark ${f.benchmark}.`;
  });

  const costs = [...funds].sort((a, b) => a.expenseRatio - b.expenseRatio);
  const cheapest = costs[0]!;
  const dearest = costs[costs.length - 1]!;

  const text = [
    "These products are lined up on documented catalog fields only. Meridian does not pick a winner.",
    lines.join("\n"),
    cheapest.id !== dearest.id
      ? `On cost, ${cheapest.ticker} is the cheapest in this set at ${formatExpense(cheapest.expenseRatio)}; ${dearest.ticker} is the most expensive at ${formatExpense(dearest.expenseRatio)}.`
      : "",
    "Markets, mandates, and share classes still differ. A lower fee is not a recommendation.",
    DISCLAIMER,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { ok: true as const, text, cached: true };
}

export async function explainPortfolioMove({
  data,
}: {
  data: {
    baseCurrency: string;
    monthDelta: number;
    attribution: { label: string; amount: number }[];
    indiaPct: number;
    usaPct: number;
    gain: number;
    value: number;
  };
}) {
  const sign = data.monthDelta >= 0 ? "up" : "down";
  const attr = data.attribution
    .slice()
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map((a) => {
      const dir = a.amount >= 0 ? "added" : "subtracted";
      return `${a.label} ${dir} ${Math.abs(a.amount).toFixed(0)} ${data.baseCurrency}`;
    });

  const text = [
    `This month the book is ${sign} ${Math.abs(data.monthDelta).toFixed(0)} ${data.baseCurrency} on a total value of ${data.value.toFixed(0)} ${data.baseCurrency}.`,
    `Allocation in the catalog snapshot is ${(data.indiaPct * 100).toFixed(0)}% India and ${(data.usaPct * 100).toFixed(0)}% United States.`,
    attr.length ? `Largest documented movers: ${attr.join("; ")}.` : "",
    "US holdings reported in INR also move with USD/INR, separate from the local investment return. The reverse is true for Indian holdings in a USD base.",
    `All-time gain in this book is ${data.gain.toFixed(0)} ${data.baseCurrency}. That is a tracking figure, not a forecast.`,
    DISCLAIMER,
  ]
    .filter(Boolean)
    .join("\n\n");

  return { ok: true as const, text, cached: true };
}
