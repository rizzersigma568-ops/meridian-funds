import { Link } from "@tanstack/react-router";
import { GitCompare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/funds/performance-chart";
import { useClientStore } from "@/lib/client-store";
import type { Fund } from "@/lib/funds/types";
import { countryLabel, formatExpense, formatNav, formatPct, signedClass } from "@/lib/funds/format";
import { fundChange } from "@/lib/queries";
import { cn } from "@/lib/utils";

export function FundCard({ fund }: { fund: Fund }) {
  const change = fundChange(fund);
  const compareIds = useClientStore((s) => s.compareIds);
  const toggle = useClientStore((s) => s.toggleCompare);
  const selected = compareIds.includes(fund.id);
  return (
    <article className="flex flex-col rounded-xl border border-border bg-surface p-4 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5">
            <Badge variant={fund.country === "IN" ? "india" : "usa"}>
              {countryLabel(fund.country)}
            </Badge>
            <Badge variant="outline">{fund.category}</Badge>
          </div>
          <Link
            to="/funds/$fundId"
            params={{ fundId: fund.id }}
            className="font-display text-lg leading-snug font-medium tracking-tight hover:underline"
          >
            {fund.name}
          </Link>
          <p className="mt-1 font-mono text-xs text-muted">{fund.ticker}</p>
        </div>
        <Sparkline series={fund.history} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xl tabular-nums">{formatNav(fund.nav, fund.country)}</p>
          <p className={cn("text-sm tabular-nums", signedClass(change))}>
            {formatPct(change)} today
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <p>1Y {formatPct(fund.return1y)}</p>
          <p>Exp {formatExpense(fund.expenseRatio)}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button asChild variant="secondary" size="sm" className="flex-1">
          <Link to="/funds/$fundId" params={{ fundId: fund.id }}>
            Research
          </Link>
        </Button>
        <Button
          type="button"
          variant={selected ? "default" : "outline"}
          size="sm"
          onClick={() => toggle(fund.id)}
          aria-pressed={selected}
        >
          <GitCompare className="size-4" />
          {selected ? "Added" : "Compare"}
        </Button>
      </div>
    </article>
  );
}
