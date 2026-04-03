"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { useSessionStore } from "@/store/session-store";
import { resolveActiveOfferTemplate } from "@/lib/presentation/resolveActiveOfferTemplate";
import { getPresentationPackDefinition } from "@/lib/presentation/packs/registry";
import type {
  PostRunAskTiming,
  PostRunCapture,
  PostRunCoachingCueUsed,
  PostRunMerchantCategory,
  PostRunPhoneFormFactor,
  PostRunProofStrength,
  PostRunRelationship,
  PostRunResult,
  PostRunReuseIntent,
  PostRunWouldReuse,
} from "@/types/postRunCapture";
import { computeLocalBusinessIdentityKey } from "@/lib/field/businessIdentity";

const RESULTS: { value: PostRunResult; label: string }[] = [
  { value: "no_interest", label: "No interest" },
  { value: "interested_not_now", label: "Interested · not now" },
  { value: "follow_up_needed", label: "Follow-up needed" },
  { value: "wants_info_sent", label: "Wants info sent" },
  { value: "book_follow_up", label: "Book follow-up" },
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

const RELATIONSHIP: { value: PostRunRelationship; label: string }[] = [
  { value: "stranger", label: "Stranger" },
  { value: "acquaintance", label: "Acquaintance" },
  { value: "friend-family", label: "Friend / family" },
];

const MERCHANT_WEDGE: { value: PostRunMerchantCategory; label: string }[] = [
  { value: "barbershop", label: "Barbershop" },
  { value: "salon-beauty", label: "Salon / beauty" },
  { value: "trainer-fitness", label: "Trainer / fitness" },
  { value: "cpa-tax", label: "CPA / tax" },
  { value: "contractor", label: "Contractor" },
  { value: "other-merchant", label: "Other merchant" },
];

const COACHING_CUE: { value: PostRunCoachingCueUsed; label: string }[] = [
  { value: "helped", label: "Yes, helped" },
  { value: "wrong", label: "Yes, but wrong" },
  { value: "ignored", label: "No, ignored them" },
  { value: "not-needed", label: "Didn’t need them" },
];

const PHONE_FORM: { value: PostRunPhoneFormFactor; label: string }[] = [
  { value: "fine", label: "Worked fine" },
  { value: "awkward", label: "Awkward to hold" },
  { value: "screen-too-small", label: "Screen too small" },
  { value: "other", label: "Other issue" },
];

const WOULD_REUSE: { value: PostRunWouldReuse; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "yes-with-changes", label: "Yes, but needs changes" },
  { value: "no", label: "No" },
];

const INTERACTION_MINUTES: (number | "15+")[] = [1, 2, 3, 5, 10, "15+"];

const WEAKEST_NA = "__na__";

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

const NEXT_PRESETS = [
  "Text tonight",
  "Call tomorrow",
  "Send info / link",
  "Send terms",
  "Book setup",
  "Revisit",
  "None",
  "Other",
];

const LEAD_WITH_PRESETS = [
  "Pick up where proof left off",
  "Their main objection",
  "Confirm timeframe",
  "Deliver what you promised",
  "Light check-in",
  "Other",
];

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

function BeatPickRow({
  options,
  value,
  onPick,
  naLabel,
}: {
  options: { id: string; label: string }[];
  value: string;
  onPick: (id: string) => void;
  naLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onPick(o.id)}
          className={cn(
            "min-h-[36px] max-w-full rounded-lg border px-2.5 py-1.5 text-left text-[11px] font-semibold transition",
            value === o.id
              ? "border-accent bg-accent/15 text-accent"
              : "border-border/80 bg-card text-muted hover:border-accent/30 hover:text-foreground"
          )}
        >
          <span className="line-clamp-2">{o.label}</span>
        </button>
      ))}
      {naLabel ? (
        <button
          type="button"
          onClick={() => onPick(WEAKEST_NA)}
          className={cn(
            "min-h-[36px] rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition",
            value === WEAKEST_NA
              ? "border-accent bg-accent/15 text-accent"
              : "border-border/80 bg-card text-muted hover:border-accent/30 hover:text-foreground"
          )}
        >
          {naLabel}
        </button>
      ) : null}
    </div>
  );
}

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
};

function SurpriseDictateButton({
  value,
  onChange,
  maxLen,
}: {
  value: string;
  onChange: (next: string) => void;
  maxLen: number;
}) {
  const busy = useRef(false);
  type WinSR = Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  const Ctor =
    typeof window !== "undefined"
      ? (window as WinSR).SpeechRecognition ?? (window as WinSR).webkitSpeechRecognition
      : undefined;
  if (!Ctor) return null;

  return (
    <button
      type="button"
      className="mt-1 rounded-lg border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted hover:border-accent/40 hover:text-foreground"
      onClick={() => {
        if (busy.current) return;
        try {
          const r = new Ctor();
          busy.current = true;
          r.lang = "en-US";
          r.continuous = false;
          r.interimResults = false;
          r.onend = () => {
            busy.current = false;
          };
          r.onerror = () => {
            busy.current = false;
          };
          r.onresult = (ev) => {
            const t = ev.results[0]?.[0]?.transcript?.trim() ?? "";
            if (!t) return;
            const spacer = value && !value.endsWith(" ") ? " " : "";
            onChange(`${value}${spacer}${t}`.slice(0, maxLen));
          };
          r.start();
        } catch {
          busy.current = false;
        }
      }}
    >
      Dictate
    </button>
  );
}

/** Private visit log after a run — local persistence only. */
export function PostRunCapturePanel() {
  const session = useSessionStore((s) => s.session);
  const addPostRunCapture = useSessionStore((s) => s.addPostRunCapture);
  const offerTemplates = useSessionStore((s) => s.offerTemplates);
  const defaultOfferTemplateId = useSessionStore((s) => s.defaultOfferTemplateId);

  const [open, setOpen] = useState(false);
  const [relationship, setRelationship] = useState<PostRunRelationship | "">("");
  const [reachedAsk, setReachedAsk] = useState<boolean | null>(null);
  const [strongestBeatId, setStrongestBeatId] = useState("");
  const [weakestBeatId, setWeakestBeatId] = useState("");
  const [coachingCueUsed, setCoachingCueUsed] = useState<PostRunCoachingCueUsed | "">("");
  const [surpriseNote, setSurpriseNote] = useState("");
  const [interactionMinutes, setInteractionMinutes] = useState<number | null>(null);
  const [phoneFormFactor, setPhoneFormFactor] = useState<PostRunPhoneFormFactor | "">("");
  const [wouldReuse, setWouldReuse] = useState<PostRunWouldReuse | "">("");
  const [merchantCategory, setMerchantCategory] = useState<PostRunMerchantCategory | "">("");

  const [result, setResult] = useState<PostRunResult | "">("");
  const [proofStrength, setProofStrength] = useState<PostRunProofStrength | "">("");
  const [strongestMoment, setStrongestMoment] = useState("");
  const [reaction, setReaction] = useState("");
  const [objection, setObjection] = useState("");
  const [askMade, setAskMade] = useState<boolean | null>(null);
  const [askTiming, setAskTiming] = useState<PostRunAskTiming | "">("");
  const [reuseSameRun, setReuseSameRun] = useState<PostRunReuseIntent | "">("");
  const [nextStep, setNextStep] = useState("");
  const [leadWithNext, setLeadWithNext] = useState("");
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

  const beatOptions = useMemo(() => {
    const blocks = session?.proofSequence?.blocks ?? [];
    return blocks.map((b) => ({
      id: b.id,
      label: (b.title?.trim() || b.id).slice(0, 80),
    }));
  }, [session?.proofSequence?.blocks]);

  const reset = useCallback(() => {
    setRelationship("");
    setReachedAsk(null);
    setStrongestBeatId("");
    setWeakestBeatId("");
    setCoachingCueUsed("");
    setSurpriseNote("");
    setInteractionMinutes(null);
    setPhoneFormFactor("");
    setWouldReuse("");
    setMerchantCategory("");
    setResult("");
    setProofStrength("");
    setStrongestMoment("");
    setReaction("");
    setObjection("");
    setAskMade(null);
    setAskTiming("");
    setReuseSameRun("");
    setNextStep("");
    setLeadWithNext("");
    setNotes("");
  }, []);

  const canSave = Boolean(
    relationship &&
      reachedAsk !== null &&
      wouldReuse &&
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
    if (
      !session?.id ||
      !canSave ||
      !proofStrength ||
      !reuseSameRun ||
      !result ||
      askMade === null ||
      !relationship ||
      reachedAsk === null ||
      !wouldReuse
    )
      return;
    const resolvedAskTiming: PostRunAskTiming = askMade ? (askTiming as PostRunAskTiming) : "n_a";

    const biz = session.business;
    const strongestBeat =
      beatOptions.length && strongestBeatId.trim() ? strongestBeatId.trim() : null;
    const weakestBeat =
      !beatOptions.length
        ? null
        : weakestBeatId === WEAKEST_NA || !weakestBeatId.trim()
          ? null
          : weakestBeatId.trim();

    const row: Omit<PostRunCapture, "id" | "capturedAt"> = {
      sessionId: session.id,
      identityKey:
        computeLocalBusinessIdentityKey(biz ?? {}) ||
        computeLocalBusinessIdentityKey({
          name: biz?.name?.trim() || "Unknown",
        }),
      businessNameSnapshot: biz?.name?.trim() || "Unknown",
      businessTypeSnapshot: biz?.type?.trim() || undefined,
      merchantCategory: merchantCategory === "" ? null : merchantCategory,
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
      leadWithNextVisit: leadWithNext.trim() || "—",
      notes: notes.trim(),
      relationship,
      reachedAsk,
      strongestBeat,
      weakestBeat,
      coachingCueUsed: coachingCueUsed === "" ? null : coachingCueUsed,
      surpriseNote: surpriseNote.trim() ? surpriseNote.trim().slice(0, 500) : null,
      interactionMinutes,
      phoneFormFactor: phoneFormFactor === "" ? null : phoneFormFactor,
      wouldReuse,
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
    leadWithNext,
    notes,
    pres?.packId,
    pres?.openingMode,
    pres?.runOfferTemplateId,
    packDef.label,
    offer,
    addPostRunCapture,
    reset,
    relationship,
    reachedAsk,
    strongestBeatId,
    weakestBeatId,
    coachingCueUsed,
    surpriseNote,
    interactionMinutes,
    phoneFormFactor,
    wouldReuse,
    merchantCategory,
    beatOptions.length,
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
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Relationship</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {RELATIONSHIP.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRelationship(r.value)}
                  className={cn(
                    "min-h-[40px] rounded-lg border px-2.5 py-2 text-[11px] font-semibold",
                    relationship === r.value
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
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Did you reach the ask?</p>
            <div className="mt-1.5 flex gap-2">
              {(["yes", "no"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setReachedAsk(v === "yes")}
                  className={cn(
                    "min-h-[44px] flex-1 rounded-xl border text-sm font-bold capitalize",
                    reachedAsk === (v === "yes")
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-card text-muted"
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              Which beat got the best reaction?
            </p>
            {beatOptions.length ? (
              <div className="mt-1.5">
                <BeatPickRow
                  options={beatOptions}
                  value={strongestBeatId}
                  onPick={(id) => setStrongestBeatId((cur) => (cur === id ? "" : id))}
                />
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] text-muted">No beat list in this session yet — leave blank.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              Which beat fell flat or got skipped?
            </p>
            {beatOptions.length ? (
              <div className="mt-1.5">
                <BeatPickRow
                  options={beatOptions}
                  value={weakestBeatId}
                  onPick={(id) => setWeakestBeatId((cur) => (cur === id ? "" : id))}
                  naLabel="N/A"
                />
              </div>
            ) : (
              <p className="mt-1.5 text-[11px] text-muted">No beat list in this session yet — leave blank.</p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Did coaching cues help?</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {COACHING_CUE.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCoachingCueUsed((cur) => (cur === c.value ? "" : c.value))}
                  className={cn(
                    "min-h-[40px] rounded-lg border px-2 py-2 text-[10px] font-semibold leading-tight",
                    coachingCueUsed === c.value
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-surface text-foreground"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted">What surprised you?</span>
            <textarea
              className="mt-1 min-h-[4.5rem] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground"
              placeholder="Anything unexpected — what the owner said, how they reacted, what you wish you had…"
              value={surpriseNote}
              onChange={(e) => setSurpriseNote(e.target.value.slice(0, 500))}
              maxLength={500}
            />
            <SurpriseDictateButton value={surpriseNote} onChange={setSurpriseNote} maxLen={500} />
          </label>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              About how long? (minutes)
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {INTERACTION_MINUTES.map((m) => {
                const val = m === "15+" ? 15 : m;
                const label = m === "15+" ? "15+" : String(m);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setInteractionMinutes((cur) => (cur === val ? null : val))}
                    className={cn(
                      "min-h-[40px] min-w-[2.5rem] rounded-lg border px-2.5 py-2 text-[11px] font-semibold",
                      interactionMinutes === val
                        ? "border-accent bg-accent/12 text-accent"
                        : "border-border bg-card text-muted"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              How did the phone work in the room?
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {PHONE_FORM.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPhoneFormFactor((cur) => (cur === p.value ? "" : p.value))}
                  className={cn(
                    "min-h-[40px] rounded-lg border px-2 py-2 text-[10px] font-semibold leading-tight",
                    phoneFormFactor === p.value
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-surface text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              Would you use the app again for your next visit?
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {WOULD_REUSE.map((w) => (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => setWouldReuse(w.value)}
                  className={cn(
                    "min-h-[40px] flex-1 rounded-lg border px-2 py-2 text-[10px] font-semibold leading-tight sm:flex-none sm:px-3",
                    wouldReuse === w.value
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-card text-muted"
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
              Merchant type (report, optional)
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {MERCHANT_WEDGE.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMerchantCategory((cur) => (cur === m.value ? "" : m.value))}
                  className={cn(
                    "min-h-[36px] rounded-lg border px-2 py-1.5 text-[10px] font-semibold",
                    merchantCategory === m.value
                      ? "border-accent bg-accent/12 text-accent"
                      : "border-border bg-card text-muted"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

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
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Next step (expected)</p>
            <ChipRow options={NEXT_PRESETS} value={nextStep} onPick={setNextStep} compact />
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Lead with next visit</p>
            <ChipRow options={LEAD_WITH_PRESETS} value={leadWithNext} onPick={setLeadWithNext} compact />
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
