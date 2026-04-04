import Link from "next/link";
import { Suspense } from "react";
import { AppShellV2 } from "@/components/layout/AppShellV2";
import { SessionBottomNav } from "@/components/layout/SessionBottomNav";
import { OfferTemplateSettings } from "@/components/settings/OfferTemplateSettings";
import { FieldRepCardSettings } from "@/components/settings/FieldRepCardSettings";

/** Linked from Command Center + AppShell; workspace prefs stay local-first. */
export default function SettingsPage() {
  return (
    <AppShellV2>
      <main className="mx-auto max-w-lg px-4 py-6 pb-[calc(64px+env(safe-area-inset-bottom,0px)+12px)] sm:py-8">
        <h1 className="text-xl font-semibold text-foreground">Settings</h1>
        <p className="mt-2 text-sm text-muted">
          Workspace preferences are stored in this browser (phone-first field use).
        </p>
        <FieldRepCardSettings />
        <OfferTemplateSettings />
        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-accent underline underline-offset-2"
        >
          Back to home
        </Link>
      </main>
      <Suspense fallback={null}>
        <SessionBottomNav />
      </Suspense>
    </AppShellV2>
  );
}
