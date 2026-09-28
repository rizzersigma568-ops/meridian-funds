import { formatDate } from "@/lib/funds/format";
import { DATA_SOURCE } from "@/lib/funds/types";

export function DataMeta({
  asOf,
  source = DATA_SOURCE,
}: {
  asOf: string;
  source?: string;
}) {
  return (
    <p className="text-[11px] leading-relaxed text-subtle">
      Source: {source}. Updated {formatDate(asOf)}. Figures are illustrative catalog
      data, not live market quotes. Not investment advice.
    </p>
  );
}

export function LegalNote({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-[11px] leading-relaxed text-subtle"}>
      Meridian is a research and tracking workspace. It does not execute trades or
      provide personalized investment advice. Historical performance is not a
      forecast.
    </p>
  );
}
