import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { BaseCurrency } from "@/lib/funds/types";
import { useFx, usePortfolioQuery } from "@/lib/queries";
import { setBaseCurrency } from "@/lib/server/portfolio";

type Ctx = {
  base: BaseCurrency;
  setBase: (c: BaseCurrency) => void;
  usdInr: number;
  prevUsdInr: number;
  asOf: string;
  source: string;
};

const CurrencyContext = createContext<Ctx>({
  base: "INR",
  setBase: () => {},
  usdInr: 87.42,
  prevUsdInr: 86.18,
  asOf: "2026-09-25",
  source: "Illustrative FX snapshot",
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

function readGuestBase(): BaseCurrency {
  if (typeof window === "undefined") return "INR";
  return window.localStorage.getItem("meridian-ccy") === "USD" ? "USD" : "INR";
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const fx = useFx();
  const portfolio = usePortfolioQuery(true);
  const qc = useQueryClient();
  const [guestBase, setGuestBase] = useState<BaseCurrency>(readGuestBase);
  const mutation = useMutation({
    mutationFn: (c: BaseCurrency) => setBaseCurrency({ data: c }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["portfolio"] });
    },
  });

  const setBase = useCallback(
    (c: BaseCurrency) => {
      window.localStorage.setItem("meridian-ccy", c);
      setGuestBase(c);
      mutation.mutate(c);
    },
    [mutation],
  );

  const value = useMemo<Ctx>(
    () => ({
      base: portfolio.data?.settings.baseCurrency ?? guestBase,
      setBase,
      usdInr: fx.data?.current.rate ?? 87.42,
      prevUsdInr: fx.data?.previous ?? 86.18,
      asOf: fx.data?.current.asOf ?? "2026-09-25",
      source: fx.data?.current.source ?? "Illustrative FX snapshot",
    }),
    [fx.data, guestBase, portfolio.data, setBase],
  );

  return (
    <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
  );
}
