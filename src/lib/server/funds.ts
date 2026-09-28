import { FUND_CATALOG, FX_USDINR, FX_USDINR_PREV } from "@/lib/funds/catalog";
import type { Fund, FxQuote } from "@/lib/funds/types";

export async function listFunds(): Promise<Fund[]> {
  return FUND_CATALOG;
}

export async function getFund({ data: id }: { data: string }): Promise<Fund | null> {
  return FUND_CATALOG.find((f) => f.id === id) ?? null;
}

export async function getFundsByIds({ data: ids }: { data: string[] }): Promise<Fund[]> {
  const wanted = ids.slice(0, 4);
  return wanted
    .map((id) => FUND_CATALOG.find((f) => f.id === id))
    .filter((f): f is Fund => Boolean(f));
}

export async function getFx(): Promise<{ current: FxQuote; previous: number }> {
  return { current: FX_USDINR, previous: FX_USDINR_PREV };
}
