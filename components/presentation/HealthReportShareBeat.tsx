"use client";

import { ProofRunReportHandoff } from "@/components/presentation/proof-beats/ProofRunReportHandoff";

/** Beat 6 — health report handoff in the proof run deck. */
export function HealthReportShareBeat({ tone = "default" }: { tone?: "default" | "dani" }) {
  return <ProofRunReportHandoff tone={tone} />;
}
