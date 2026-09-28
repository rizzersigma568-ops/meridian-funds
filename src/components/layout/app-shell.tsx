import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Bookmark,
  Calculator,
  Compass,
  GitCompare,
  LayoutDashboard,
  Menu,
  PieChart,
  Search,
} from "lucide-react";
import { useState } from "react";
import { MeridianMark } from "@/components/meridian-mark";
import { useCurrency } from "@/components/currency-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useClientStore } from "@/lib/client-store";
import { useAlertsQuery } from "@/lib/queries";
import { markNotificationsRead } from "@/lib/server/portfolio";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { LegalNote } from "@/components/data-meta";

const NAV = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/portfolio", label: "Portfolio", icon: PieChart },
  { to: "/watchlists", label: "Watchlists", icon: Bookmark },
  { to: "/calculators", label: "Calculators", icon: Calculator },
] as const;

function AuthSlot() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return <div className="size-8 animate-pulse rounded-full bg-bg-subtle" />;
  }
  if (!user) {
    return (
      <Button asChild size="sm" variant="secondary">
        <Link to="/login">Sign in</Link>
      </Button>
    );
  }
  return <UserButton />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const compareCount = useClientStore((s) => s.compareIds.length);
  const { base, setBase, usdInr } = useCurrency();
  const { user } = useCurrentUserState();
  const alerts = useAlertsQuery(Boolean(user));
  const unread = alerts.data?.notifications.filter((n) => !n.read).length ?? 0;
  const [notesOpen, setNotesOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const qc = useQueryClient();

  const mobileNav = [
    NAV[0],
    NAV[1],
    NAV[3],
    NAV[4],
  ];

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-border bg-surface/80 px-3 py-5 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2 px-2">
          <MeridianMark className="size-8" />
          <span className="font-display text-xl tracking-tight">Meridian</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium text-muted transition-colors hover:bg-bg-subtle hover:text-fg",
                  active && "bg-bg-subtle text-fg",
                )}
              >
                <Icon className="size-4" />
                {item.label}
                {item.to === "/compare" && compareCount > 0 ? (
                  <span className="ml-auto font-mono text-xs tabular-nums">{compareCount}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <p className="px-2 text-[11px] text-subtle">India + USA · Research</p>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-bg/90 px-3 backdrop-blur-sm sm:px-5">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <MeridianMark className="size-7" />
            <span className="font-display text-lg">Meridian</span>
          </Link>
          <Link
            to="/explore"
            className="ml-auto hidden h-10 max-w-sm flex-1 items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm text-subtle sm:flex"
          >
            <Search className="size-4" />
            Search funds
          </Link>
          <div className="ml-auto flex items-center gap-1 sm:ml-0">
            <div className="mr-1 flex rounded-md border border-border bg-surface p-0.5">
              {(["INR", "USD"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setBase(c)}
                  className={cn(
                    "h-8 rounded-sm px-2.5 font-mono text-xs",
                    base === c ? "bg-primary text-primary-fg" : "text-muted",
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex">
              USD/INR {usdInr.toFixed(2)}
            </Badge>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative"
              onClick={async () => {
                setNotesOpen(true);
                if (user) {
                  await markNotificationsRead();
                  void qc.invalidateQueries({ queryKey: ["alerts"] });
                }
              }}
              aria-label="Alerts"
            >
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-down" />
              ) : null}
            </Button>
            <div className="hidden sm:block">
              <AuthSlot />
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="lg:hidden"
              onClick={() => setMoreOpen(true)}
              aria-label="Menu"
            >
              <Menu className="size-4" />
            </Button>
          </div>
        </header>

        <main className="px-3 pb-24 sm:px-5 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] lg:hidden">
        <ul className="grid grid-cols-4">
          {mobileNav.map((item) => {
            const active =
              item.to === "/"
                ? pathname === "/"
                : pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] text-muted",
                    active && "text-fg",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <Sheet open={notesOpen} onOpenChange={setNotesOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Alerts</SheetTitle>
          </SheetHeader>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {!user ? (
              <p className="text-sm text-muted">
                Sign in to configure price, distribution, and allocation alerts.
              </p>
            ) : (alerts.data?.notifications.length ?? 0) === 0 ? (
              <p className="text-sm text-muted">No notices yet.</p>
            ) : (
              alerts.data?.notifications.map((n) => (
                <article key={n.id} className="rounded-lg border border-border p-3">
                  <h3 className="text-sm font-medium">{n.title}</h3>
                  <p className="mt-1 text-sm text-muted">{n.body}</p>
                </article>
              ))
            )}
            {alerts.data?.rules.length ? (
              <div className="pt-2">
                <p className="mb-2 text-xs font-medium tracking-wide text-muted uppercase">
                  Rules
                </p>
                <ul className="space-y-2 text-sm">
                  {alerts.data.rules.map((r) => (
                    <li key={r.id} className="flex justify-between gap-2 text-muted">
                      <span>
                        {r.kind}
                        {r.fundId ? ` · ${r.fundId}` : ""}
                        {r.threshold != null ? ` · ${r.threshold}%` : ""}
                      </span>
                      <span>{r.enabled ? "On" : "Off"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            <LegalNote />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>More</SheetTitle>
          </SheetHeader>
          <div className="grid gap-2 p-5">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMoreOpen(false)}
                className="flex h-12 items-center gap-3 rounded-md px-2 hover:bg-bg-subtle"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
            <div className="pt-2">
              <AuthSlot />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
