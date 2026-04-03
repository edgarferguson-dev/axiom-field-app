"use client";

import { useCallback, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import { resolveActiveOfferTemplate } from "@/lib/presentation/resolveActiveOfferTemplate";
import { getPresentationPackDefinition } from "@/lib/presentation/packs/registry";
import type {
  PostRunAskTiming,
  PostRunCapture,
  PostRunProofStrength,
  PostRunResult,
  PostRunReuseIntent,
} from "@/types/postRunCapture";

const RESULTS: { value: PostRunResult; label: string }[] = [
  { value: "no_interest", label: "No interest" },
  { value: "interested", label: "Interested" },
  { value: "follow_up", label: "Follow-up" },
  { value: "soft_commit", label: "Soft commit" },
  { value: "hard_commit", label: "Hard commit" },
];

const PROOF_STRENGTH: { value: PostRunProofStrength; label: string }[] = [
  { value: "strong", label: "Strong" },
  { value: "ok", label: "OK" },
  { value: "weak", label: "Weak" },
];

const REUSE: { value: PostRunReuseIntent; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "No" },
];

const ASK_TIMING: { value: PostRunAskTiming; label: string }[] = [
  { value: "too_early", label: "Too early" },
  { value: "on_time", label: "On time" },
  { value: "too_late", label: "Too late" },
];

/** What on-screen moment drew the strongest reaction */
const MOMENT_PRESETS = [
  "First screen",
  "Before / after",
  "Flow steps",
  "Stat / number",
  "Bridge to pilot",
  "Offer / price",
  "Nothing stood out",
  "Other",
];

const REACTION_PRESETS = [
  "Lit up / leaned in",
  "Nodding",
  "Flat / polite",
  "Skeptical",
  "Price wince",
  "Rushed / distracted",
  "Defensive",
  "Other",
];

const OBJECTION_PRESETS = [
  "Price",
  "Time / busy",
  "Trust",
  "Spouse / partner",
  "Already have tools",
  "Not sure / vague",
  "None",
  "Other",
];

const NEXT_PRESETS = ["Text tonight", "Call tomorrow", "Send terms", "Book setup", "Revisit", "None", "Other"];

function ChipRow({
  options,
  value,
  onPick,
  compact,
}: {
  options: string[];
  value: string;
  onPick: (v: string) => void;
  compact?: boolean;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", compact && "gap-1")}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onPick(o)}
          className={cn(
            "min-h-[36px] rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition",
            value === o
              ? "border-accent bg-accent/15 text-accent"
              : "border-border/80 bg-card text-muted hover:border-accent/30 hover:text-foreground"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Private visit log after a run — local persistence only. */
export function PostRunCapturePanel() {
  const session = useSessionStore((s) => s.session);
  const addPostRunCapture = useSessionStore((s) => s.addPostRunCapture);
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);

  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<PostRunResult | "">("");
  const [proofStrength, setProofStrength] = useState<PostRunProofStrength | "">("");
  const [strongestMoment, setStrongestMoment] = useState("");
  const [reaction, setReaction] = useState("");
  const [objection, setObjection] = useState("");
  const [askMade, setAskMade] = useState<boolean | null>(null);
  const [askTiming, setAskTiming] = useState<PostRunAskTiming | "">("");
  const [reuseSameRun, setReuseSameRun] = useState<PostRunReuseIntent | "">("");
  const [nextStep, setNextStep] = useState("");
  const [notes, setNotes] = useState("");

  const offer = useMemo(
    () =>
      resolveActiveOfferTemplate({
        offerTemplates,
        defaultOfferTemplateId,
        session,
      }),
    [offerTemplates, defaultOfferTemplateId, session]
  );

  const pres = session?.presentation;
  const packDef = useMemo(() => getPresentationPackDefinition(pres?.packId), [pres?.packId]);

  const reset = useCallback(() => {
    setResult("");
    setProofStrength("");
    setStrongestMoment("");
    setReaction("");
    setObjection("");
    setAskMade(null);
    setAskTiming("");
    setReuseSameRun("");
    setNextStep("");
    setNotes("");
  }, []);

  const canSave = Boolean(
    result &&
      proofStrength &&
      reuseSameRun &&
      askMade !== null &&
      (askMade === false ||
        askTiming === "too_early" ||
        askTiming === "on_time" ||
        askTiming === "too_late")
  );

  const save = useCallback(() => {
    if (!session?.id || !canSave || !proofStrength || !reuseSameRun || !result || askMade === null) return;
    const resolvedAskTiming: PostRunAskTiming = askMade
      ? (askTiming as PostRunAskTiming)
      : "n_a";

    const row: Omit<PostRunCapture, "id" | "capturedAt"> = {
      sessionId: session.id,
      businessNameSnapshot: session.business?.name?.trim() || "Unknown",
      businessTypeSnapshot: session.business?.type?.trim() || undefined,
      packId: pres?.packId ?? "—",
      packLabelSnapshot: packDef.label,
      openingMode: pres?.openingMode ?? "proof-snapshot",
      offerTemplateId: offer.id,
      runOfferTemplateIdSnapshot: pres?.runOfferTemplateId ?? null,
      offerLabelSnapshot: offer.label,
      result,
      askMade,
      askTiming: resolvedAskTiming,
      proofStrength,
      reuseSameRun,
      strongestOwnerReaction: reaction.trim() || "—",
      strongestProofMoment: strongestMoment.trim() || "—",
      primaryObjection: objection.trim() || "—",
      nextStepNeeded: nextStep.trim() || "—",
      notes: notes.trim(),
    };
    addPostRunCapture(row);
    reset();
    setOpen(false);
  }, [
    session,
    canSave,
    proofStrength,
    reuseSameRun,
    result,
    askMade,
    askTiming,
    reaction,
    strongestMoment,
    objection,
    nextStep,
    notes,
    pres?.packId,
    pres?.openingMode,
    pres?.runOfferTemplateId,
    packDef.label,
    offer,
    addPostRunCapture,
    reset,
  ]);

  if (!session) return null;

  return (
    <section
      className="rounded-2xl border border-border bg-card px-3 py-3 shadow-soft ring-1 ring-foreground/[0.06]"
      aria-label="Post-run capture"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Visit log</p>
          <p className="mt-0.5 text-xs text-muted">Quick taps — what landed, what to change next time.</p>
        </div>
        <button
          type="button"
          onClick={() => (open ? setOpen(false) : setOpen(true))}
          className="shrink-0 rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white shadow-sm"
        >
          {open ? "Close" : "Log"}
        </button>
      </div>

      {open ? (
        <div className="mt-3 space-y-3 border-t border-border/50 pt-3">
          <p className="text-[11px] text-muted">
            <span className="font-semibold text-foreground">{packDef.label}</span>
            <span className="text-border"> · </span>
            <span>{offer.label}</span>
          </p>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Outcome</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {RESULTS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setResult(r.value)}
                  className={cn(
                    "min-h-[40px] rounded-lg border px-2.5 py-2 text-[11px] font-semibold",
                    result === r.value
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-surface text-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">On-screen proof felt</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {PROOF_STRENGTH.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProofStrength(p.value)}
                  className={cn(
                    "min-h-[40px] rounded-lg border px-3 py-2 text-[11px] font-semibold",
                    proofStrength === p.value
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-card text-muted"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Strongest moment (screen)</p>
            <ChipRow options={MOMENT_PRESETS} value={strongestMoment} onPick={setStrongestMoment} compact />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Strongest owner reaction</p>
            <ChipRow options={REACTION_PRESETS} value={reaction} onPick={setReaction} compact />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Main objection / friction</p>
            <ChipRow options={OBJECTION_PRESETS} value={objection} onPick={setObjection} compact />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Ask made?</p>
            <div className="mt-1.5 flex gap-2">
              {(["yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => {
                    setAskMade(v === "yes");
                    if (v === "no") setAskTiming("");
                  }}
                  className={cn(
                    "min-h-[44px] flex-1 rounded-xl border text-sm font-bold capitalize",
                    askMade === (v === "yes")
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-card text-muted"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {askMade ? (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Ask timing</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {ASK_TIMING.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setAskTiming(t.value)}
                    className={cn(
                      "min-h-[40px] rounded-lg border px-2.5 py-2 text-[11px] font-semibold",
                      askTiming === t.value
                        ? "border-accent bg-accent/12 text-accent"
                        : "border-border bg-surface text-foreground"
                    )}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Same run next time?</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {REUSE.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setReuseSameRun(r.value)}
                  className={cn(
                    "min-h-[40px] flex-1 rounded-lg border px-2 py-2 text-[11px] font-semibold sm:flex-none sm:px-4",
                    reuseSameRun === r.value
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-card text-muted"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Follow-up motion</p>
            <ChipRow options={NEXT_PRESETS} value={nextStep} onPick={setNextStep} compact />
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted">Change next time</span>
            <textarea
              className="mt-1 min-h-[3.25rem] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
              placeholder="One line…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={200}
            />
          </label>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="min-h-[44px] rounded-xl border border-border px-4 text-sm font-semibold text-muted"
              onClick={() => {
                reset();
                setOpen(false);
              }}
            >
              Skip
            </button>
            <button
              type="button"
              disabled={!canSave}
              className="min-h-[44px] rounded-xl bg-accent px-4 text-sm font-bold text-white disabled:opacity-40"
              onClick={() => save()}
            >
              Save log
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
