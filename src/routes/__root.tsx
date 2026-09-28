import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AppProviders } from "@/components/providers";
import { AppShell } from "@/components/layout/app-shell";

export const Route = createRootRoute({
  component: RootDocument,
});

function RootDocument() {
  return (
    <AppProviders>
      <AppShell>
        <Outlet />
      </AppShell>
    </AppProviders>
  );
}
