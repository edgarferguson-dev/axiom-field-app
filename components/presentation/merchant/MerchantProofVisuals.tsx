"use client";

import type { MerchantVisualSurface } from "@/types/merchantProof";
import { cn } from "@/lib/utils/cn";

function PhoneChrome({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-border/80 bg-[#1a1a1e] shadow-xl ring-1 ring-black/20",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-black/40 px-4 py-2.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/50">Messages</span>
        <span className="text-[10px] text-white/40">now</span>
      </div>
      <div className="bg-[#0c0c0e] px-3 py-4">{children}</div>
    </div>
  );
}

function SmsBookingThread({ label }: { label?: string }) {
  return (
    <PhoneChrome>
      <div className="space-y-3 font-sans text-[13px] leading-snug">
        <div className="max-w-[88%] rounded-2xl rounded-bl-md bg-white/10 px-3 py-2.5 text-white/90">
          Hey — can I get a cut tomorrow after 6?
        </div>
        <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-md bg-accent px-3 py-2.5 text-white shadow-md">
          Got it — here are open spots. Tap to hold your chair.
          <div className="mt-2 rounded-lg bg-white/15 px-2 py-1.5 text-center text-[11px] font-semibold">Book · 6:30pm</div>
        </div>
        <p className="text-center text-[10px] text-white/35">Auto-reply · {label ?? "your shop"}</p>
      </div>
    </PhoneChrome>
  );
}

function CompareNoShowBooked() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
      <div className="rounded-xl border border-red-500/30 bg-red-500/[0.06] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-400/90">Before</p>
        <div className="mt-3 space-y-2">
          {["10:00", "10:45", "—", "—", "2:00"].map((t, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-black/20 px-2 py-1.5 text-xs text-white/70">
              <span>{t}</span>
              <span className="text-red-300/80">{t === "—" ? "open" : "risk"}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/[0.07] p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/90">After</p>
        <div className="mt-3 space-y-2">
          {["10:00", "10:45", "11:30", "12:15", "2:00"].map((t) => (
            <div
              key={t}
              className="flex items-center justify-between rounded-lg bg-black/15 px-2 py-1.5 text-xs text-white/85"
            >
              <span>{t}</span>
              <span className="text-emerald-300/90">held</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BookingAutomationFlow() {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-inner" aria-hidden>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {[
          { t: "Text in", d: "Captured" },
          { t: "Reply", d: "< 1 min" },
          { t: "Booked", d: "On calendar" },
        ].map((s, i) => (
          <div key={s.t} className="flex flex-1 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent">
              {i + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{s.t}</p>
              <p className="text-xs text-muted">{s.d}</p>
            </div>
            {i < 2 ? <div className="hidden h-px flex-1 bg-border sm:block" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatNoShows({ stat, contextLine }: { stat?: string; contextLine?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-accent/25 bg-gradient-to-b from-accent/[0.12] to-card px-6 py-10"
      aria-hidden
    >
      <p className="text-5xl font-black tabular-nums tracking-tight text-accent sm:text-6xl">{stat ?? "18%"}</p>
      <p className="mt-2 max-w-xs text-center text-xs font-medium uppercase tracking-wider text-muted">
        No-shows / gaps owners name first
      </p>
      {contextLine ? (
        <p className="mt-3 max-w-sm text-center text-[11px] font-medium leading-snug text-foreground/80">{contextLine}</p>
      ) : null}
    </div>
  );
}

function WebFormLead({ businessLabel }: { businessLabel?: string }) {
  return (
    <div className="rounded-xl border border-border/80 bg-background shadow-sm" aria-hidden>
      <div className="border-b border-border/60 bg-card px-4 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Request a quote</p>
        {businessLabel ? (
          <p className="mt-0.5 text-xs font-medium text-foreground/90">{businessLabel}</p>
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <div className="h-2 w-full rounded bg-border/80" />
        <div className="h-2 rounded bg-border/60" style={{ width: "83%" }} />
        <div className="h-8 w-28 rounded-md bg-accent/90 text-center text-xs font-semibold leading-8 text-white">Send</div>
      </div>
      <div className="border-t border-border/60 bg-accent/[0.06] px-4 py-3 text-xs text-foreground">
        <span className="font-semibold text-accent">Auto-reply sent</span> · We got this — you’ll hear back within minutes.
      </div>
    </div>
  );
}

function CompareResponseTimes() {
  return (
    <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-4">
        <p className="text-[10px] font-bold uppercase text-amber-200/80">Scattered</p>
        <p className="mt-2 text-2xl font-black text-foreground">6h+</p>
        <p className="text-xs text-muted">First human touch (typical)</p>
      </div>
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4">
        <p className="text-[10px] font-bold uppercase text-emerald-200/90">One queue</p>
        <p className="mt-2 text-2xl font-black text-accent">&lt; 2m</p>
        <p className="text-xs text-muted">Auto-ack + route</p>
      </div>
    </div>
  );
}

function RoutingAutomationFlow() {
  return (
    <div className="rounded-2xl border border-border/70 bg-surface p-5" aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {[
          { t: "Inquiry lands", d: "Form / call / DM" },
          { t: "Ack + slot", d: "Expectations set" },
          { t: "Owner alert", d: "Ordered, visible" },
        ].map((s, i) => (
          <div key={s.t} className="flex-1 rounded-xl border border-border/60 bg-card/80 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-accent">{`Step ${i + 1}`}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{s.t}</p>
            <p className="text-xs text-muted">{s.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatMissedLeads({ stat, contextLine }: { stat?: string; contextLine?: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl border border-border/70 bg-card/60 px-6 py-10"
      aria-hidden
    >
      <p className="text-5xl font-black tabular-nums text-accent sm:text-6xl">{stat ?? "22%"}</p>
      <p className="mt-2 max-w-xs text-center text-xs font-medium text-muted">Inquiries that never get a real first touch</p>
      {contextLine ? (
        <p className="mt-3 max-w-sm text-center text-[11px] font-medium leading-snug text-foreground/80">{contextLine}</p>
      ) : null}
    </div>
  );
}

function DecisionBridgeVisual({ businessLabel }: { businessLabel?: string }) {
  return (
    <div
      className="rounded-xl border border-dashed border-accent/35 bg-accent/[0.04] px-6 py-8 text-center"
      aria-hidden
    >
      <p className="text-sm font-medium text-foreground/90">
        {businessLabel ? `Proof landed for ${businessLabel} — next is a simple start.` : "Proof landed — next is a simple start."}
      </p>
    </div>
  );
}

function SimpleAskVisual() {
  return (
    <div className="rounded-xl border border-accent/30 bg-card/50 px-5 py-6 text-center shadow-soft" aria-hidden>
      <p className="text-[10px] font-bold uppercase tracking-wider text-accent">Pilot</p>
      <p className="mt-2 text-2xl font-bold text-foreground">One start tier</p>
      <p className="mt-1 text-sm text-muted">No matrix — match what they said in the room.</p>
    </div>
  );
}

function NextStepVisual() {
  return (
    <div className="rounded-lg border border-border/60 bg-background/60 px-4 py-3 text-center text-sm text-muted" aria-hidden>
      Clear buttons below — let them choose.
    </div>
  );
}

export type MerchantProofVisualProps = {
  surface: MerchantVisualSurface;
  /** For stat slides — pass through headline stat from slide */
  statText?: string;
  businessLabel?: string;
  /** One line tying the mock to their trade (e.g. business type) */
  contextLine?: string;
};

export function MerchantProofVisual({ surface, statText, businessLabel, contextLine }: MerchantProofVisualProps) {
  switch (surface) {
    case "sms-booking-thread":
      return <SmsBookingThread label={businessLabel} />;
    case "compare-no-show-vs-booked":
      return <CompareNoShowBooked />;
    case "booking-automation-flow":
      return <BookingAutomationFlow />;
    case "stat-no-shows":
      return <StatNoShows stat={statText} contextLine={contextLine} />;
    case "web-form-lead":
      return <WebFormLead businessLabel={businessLabel} />;
    case "compare-response-times":
      return <CompareResponseTimes />;
    case "routing-automation-flow":
      return <RoutingAutomationFlow />;
    case "stat-missed-leads":
      return <StatMissedLeads stat={statText} contextLine={contextLine} />;
    case "decision-bridge":
      return <DecisionBridgeVisual businessLabel={businessLabel} />;
    case "simple-ask":
      return <SimpleAskVisual />;
    case "next-step":
      return <NextStepVisual />;
    default:
      return null;
  }
}
