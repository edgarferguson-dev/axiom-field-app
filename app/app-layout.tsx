import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Topbar } from "@/components/layout/topbar";
import { LiveCoachingOverlay } from "@/components/coaching/LiveCoachingOverlay";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AppShell>
      <Topbar />
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
      <LiveCoachingOverlay />
    </AppShell>
  );
}
