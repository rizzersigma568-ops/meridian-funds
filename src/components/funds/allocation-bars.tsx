import { formatPctPlain } from "@/lib/funds/format";

export function AllocationBars({
  items,
}: {
  items: Record<string, number>;
}) {
  const entries = Object.entries(items).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  return (
    <ul className="space-y-3">
      {entries.map(([name, weight]) => {
        const pct = weight / (total > 5 ? total : 1);
        const width = total > 5 ? pct : weight / 100;
        return (
          <li key={name}>
            <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
              <span>{name}</span>
              <span className="font-mono tabular-nums text-muted">
                {formatPctPlain(total > 5 ? pct : weight / 100, 1)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg-subtle">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.min(100, width * 100)}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
