"use client";

import { useCallback, useState } from "react";
import { getFollowUpTemplates } from "@/lib/followUp/templates";
import type { DispositionOutcome } from "@/types/disposition";

export type FollowUpQuickActionsProps = {
  outcome: DispositionOutcome;
  contactEmail?: string;
  contactPhone?: string;
};

function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function FollowUpQuickActions({ outcome, contactEmail, contactPhone }: FollowUpQuickActionsProps) {
  const tpl = getFollowUpTemplates(outcome);
  const [copied, setCopied] = useState<string | null>(null);

  const flash = useCallback((key: string) => {
    setCopied(key);
    window.setTimeout(() => setCopied(null), 2000);
  }, []);

  const copy = useCallback(
    async (key: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        flash(key);
      } catch {
        /* ignore */
      }
    },
    [flash]
  );

  const mailHref =
    contactEmail && contactEmail.includes("@")
      ? `mailto:${encodeURIComponent(contactEmail)}?subject=${encodeURIComponent(tpl.emailSubject)}&body=${encodeURIComponent(tpl.emailBody)}`
      : `mailto:?subject=${encodeURIComponent(tpl.emailSubject)}&body=${encodeURIComponent(tpl.emailBody)}`;

  const phoneDigits = contactPhone ? digitsOnly(contactPhone) : "";
  const smsHref =
    phoneDigits.length >= 10
      ? `sms:${phoneDigits}?body=${encodeURIComponent(tpl.text)}`
      : `sms:?body=${encodeURIComponent(tpl.text)}`;

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <p className="ax-label mb-4">Follow-up</p>
      <p className="mb-4 text-sm text-muted">Copy text or open mail / SMS. One step for you:</p>
      <p className="mb-4 rounded-lg border border-accent/20 bg-accent/5 px-3 py-2 text-sm font-semibold text-foreground">
        {tpl.nextStep}
      </p>

      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Text</p>
          <p className="mt-1 text-sm leading-relaxed text-foreground">{tpl.text}</p>
          <button
            type="button"
            onClick={() => copy("text", tpl.text)}
            className="mt-2 min-h-[44px] w-full rounded-lg border border-border bg-surface px-3 text-sm font-semibold text-foreground transition hover:border-accent/30 sm:w-auto sm:px-4"
          >
            {copied === "text" ? "Copied" : "Copy text"}
          </button>
        </div>

        <div className="border-t border-border/60 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Email</p>
          <p className="mt-1 text-xs text-muted">Subject: {tpl.emailSubject}</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => copy("email", `${tpl.emailSubject}\n\n${tpl.emailBody}`)}
              className="min-h-[44px] flex-1 rounded-lg border border-border bg-surface px-3 text-sm font-semibold transition hover:border-accent/30"
            >
              {copied === "email" ? "Copied" : "Copy email"}
            </button>
            <a
              href={mailHref}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-accent px-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Open mail
            </a>
          </div>
        </div>

        <div className="border-t border-border/60 pt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">SMS</p>
          <a
            href={smsHref}
            className="mt-2 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-semibold transition hover:border-accent/30 sm:w-auto"
          >
            Open SMS
          </a>
        </div>
      </div>
    </div>
  );
}
