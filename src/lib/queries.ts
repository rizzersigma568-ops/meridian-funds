import { useQuery } from "@tanstack/react-query";
import { getFx, listFunds } from "@/lib/server/funds";
import { getPortfolio, listAlerts, listWatchlists } from "@/lib/server/portfolio";
import { dayChange } from "@/lib/funds/calc";
import type { Fund } from "@/lib/funds/types";

export function useFundCatalog() {
  return useQuery({
    queryKey: ["funds"],
    queryFn: () => listFunds(),
    staleTime: 60_000,
  });
}

export function useFx() {
  return useQuery({
    queryKey: ["fx"],
    queryFn: () => getFx(),
    staleTime: 60_000,
  });
}

export function usePortfolioQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["portfolio"],
    queryFn: () => getPortfolio(),
    enabled,
    retry: false,
  });
}

export function useWatchlistsQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["watchlists"],
    queryFn: () => listWatchlists(),
    enabled,
    retry: false,
  });
}

export function useAlertsQuery(enabled: boolean) {
  return useQuery({
    queryKey: ["alerts"],
    queryFn: () => listAlerts(),
    enabled,
    retry: false,
  });
}

export function fundChange(fund: Fund): number | null {
  return dayChange(fund.history, fund.navDate);
}
