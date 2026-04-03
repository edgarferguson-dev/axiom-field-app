import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { MaterialSummary } from "@/lib/flows/materialEngine";
import { sessionPersistStorage } from "@/lib/storage/sessionPersistStorage";
import { PERSIST_KEY_MATERIALS } from "@/lib/storage/persistKeys";

export type MaterialBlock =
  | { id: string; type: "text"; label?: string; value: string }
  | { id: string; type: "link"; label: string; url: string }
  | { id: string; type: "slide"; title: string; bullets: string[] }
  | { id: string; type: "upload-placeholder"; label: string };

export type MaterialSet = {
  id: string;
  name: string;
  updatedAt: number;
  blocks: MaterialBlock[];
  /** Cached summary for fast selection; can be regenerated from blocks later */
  summary?: MaterialSummary;
};

type MaterialsStore = {
  sets: MaterialSet[];
  selectedSetId: string | null;
  createSet: (name?: string) => string;
  renameSet: (id: string, name: string) => void;
  deleteSet: (id: string) => void;
  selectSet: (id: string | null) => void;
  updateBlocks: (id: string, blocks: MaterialBlock[]) => void;
  setSummary: (id: string, summary: MaterialSummary) => void;
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_SET: MaterialSet = {
  id: "set-default",
  name: "Default pack",
  updatedAt: Date.now(),
  blocks: [
    {
      id: "b-1",
      type: "text",
      label: "Positioning",
      value: "Product: Axiom Field\nTarget: Local service businesses\nPain: Leads go cold when the first response is slow.",
    },
    {
      id: "b-2",
      type: "slide",
      title: "Proof points",
      bullets: ["Respond in minutes", "After-hours coverage", "Objection prompts when momentum breaks"],
    },
    { id: "b-3", type: "upload-placeholder", label: "Uploads (soon)" },
  ],
};

export const useMaterialsStore = create<MaterialsStore>()(
  persist(
    (set) => ({
      sets: [DEFAULT_SET],
      selectedSetId: DEFAULT_SET.id,
      createSet: (name) => {
        const id = makeId("set");
        const next: MaterialSet = {
          id,
          name: name?.trim() || "New pack",
          updatedAt: Date.now(),
          blocks: [{ id: makeId("b"), type: "text", label: "Notes", value: "" }],
        };
        set((s) => ({ sets: [next, ...s.sets], selectedSetId: id }));
        return id;
      },
      renameSet: (id, name) =>
        set((s) => ({
          sets: s.sets.map((x) => (x.id === id ? { ...x, name, updatedAt: Date.now() } : x)),
        })),
      deleteSet: (id) =>
        set((s) => {
          const next = s.sets.filter((x) => x.id !== id);
          const selectedSetId =
            s.selectedSetId === id ? (next[0]?.id ?? null) : s.selectedSetId;
          return { sets: next, selectedSetId };
        }),
      selectSet: (id) => set({ selectedSetId: id }),
      updateBlocks: (id, blocks) =>
        set((s) => ({
          sets: s.sets.map((x) =>
            x.id === id ? { ...x, blocks, updatedAt: Date.now(), summary: x.summary } : x
          ),
        })),
      setSummary: (id, summary) =>
        set((s) => ({
          sets: s.sets.map((x) => (x.id === id ? { ...x, summary, updatedAt: Date.now() } : x)),
        })),
    }),
    { name: PERSIST_KEY_MATERIALS, version: 1, storage: sessionPersistStorage }
  )
);

