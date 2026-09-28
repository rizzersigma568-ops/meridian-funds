import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { NavPoint } from "@/lib/funds/types";
import { formatDate } from "@/lib/funds/format";

export function PerformanceChart({
  series,
  color = "var(--color-primary)",
  formatValue,
  height = 280,
}: {
  series: NavPoint[];
  color?: string;
  formatValue: (n: number) => string;
  height?: number;
}) {
  const data = useMemo(
    () => series.map((p) => ({ date: p.date, value: p.nav })),
    [series],
  );
  if (data.length < 2) {
    return (
      <div className="grid h-48 place-items-center text-sm text-muted">
        Not enough history in the catalog.
      </div>
    );
  }
  const up = data[data.length - 1]!.value >= data[0]!.value;
  const stroke = up ? "var(--color-up)" : "var(--color-down)";
  const fill = color === "auto" ? stroke : color;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fill} stopOpacity={0.16} />
              <stop offset="100%" stopColor={fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => formatDate(String(d)).split(" ").slice(1).join(" ")}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            minTickGap={28}
          />
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => formatValue(Number(v))}
            tick={{ fill: "var(--color-muted)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs shadow-[var(--shadow-soft)]">
                  <p className="text-muted">{formatDate(String(label))}</p>
                  <p className="font-mono tabular-nums">
                    {formatValue(Number(payload[0]?.value))}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={fill}
            strokeWidth={1.6}
            fill="url(#navFill)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ series }: { series: NavPoint[] }) {
  const data = series.slice(-30).map((p) => ({ v: p.nav }));
  if (data.length < 2) return null;
  const up = data[data.length - 1]!.v >= data[0]!.v;
  return (
    <div className="h-8 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="v"
            stroke={up ? "var(--color-up)" : "var(--color-down)"}
            fill="transparent"
            strokeWidth={1.4}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
