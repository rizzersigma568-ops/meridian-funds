import { cn } from "@/lib/utils";

export function MeridianMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-primary", className)}
      aria-hidden
    >
      <circle cx="16" cy="16" r="13" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <ellipse
        cx="16"
        cy="16"
        rx="6"
        ry="13"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.55"
      />
      <path d="M16 3v26" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 16h23" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <circle cx="11.2" cy="18.5" r="1.15" fill="currentColor" />
      <circle cx="21.4" cy="13.2" r="1.15" fill="currentColor" />
    </svg>
  );
}
