"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AxiomFieldLogo } from "@/components/branding/AxiomFieldLogo";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-soft ring-1 ring-foreground/[0.04]">
        <div className="mb-6">
          <AxiomFieldLogo size="lg" />
        </div>

        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-foreground">
          Enter the system
        </h1>
        <p className="mb-6 text-sm text-muted">
          Sign in with your name to open your workspace.
        </p>

        <input
          className="mb-4 w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-foreground shadow-sm outline-none ring-slate-900/5 transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-dark"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
