"use client";

import { cn } from "@/lib/utils/cn";

export function BriefListenForList({ items, className }: { items: string[]; className?: string }) {
  if (items.length === 0) {
    return (
      <p className={cn("text-sm leading-relaxed text-white/50", className)}>
        No scripted listen-fors — watch for how they describe lead flow, follow-up, and who gets blamed when something
        drops.
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2.5", className)}>
      {items.map((line) => (
        <li key={line} className="flex gap-3 text-sm leading-snug text-white/88">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-400" aria-hidden />
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
