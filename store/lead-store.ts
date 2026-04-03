import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sessionPersistStorage } from "@/lib/storage/sessionPersistStorage";
import { PERSIST_KEY_LEADS } from "@/lib/storage/persistKeys";
import type { Lead, LeadStatus } from "@/types/lead";

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

type LeadStore = {
  leads: Lead[];
  addLead: (partial?: Partial<Omit<Lead, "id" | "updatedAt">>) => string;
  bulkAddLeads: (partials: Partial<Omit<Lead, "id" | "updatedAt">>[]) => string[];
  updateLead: (id: string, patch: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
};

const emptyLead = (): Omit<Lead, "id" | "updatedAt"> => ({
  businessName: "",
  contactName: "",
  phone: "",
  email: "",
  address: "",
  category: "",
  status: "new",
  notes: "",
  lastContact: null,
  nextAction: "",
});

export const useLeadStore = create<LeadStore>()(
  persist(
    (set, get) => ({
      leads: [],

        addLead: (partial) => {
        const id = makeId();
        const base = emptyLead();
        const row: Lead = {
          ...base,
          ...partial,
          id,
          updatedAt: Date.now(),
        };
        set({ leads: [row, ...get().leads] });
        return id;
      },

      bulkAddLeads: (partials) => {
        const ids: string[] = [];
        const now = Date.now();
        const newRows: Lead[] = partials.map((partial) => {
          const id = makeId();
          ids.push(id);
          const base = emptyLead();
          return {
            ...base,
            ...partial,
            id,
            updatedAt: now,
          };
        });
        set({ leads: [...newRows, ...get().leads] });
        return ids;
      },

      updateLead: (id, patch) =>
        set({
          leads: get().leads.map((l) =>
            l.id === id ? { ...l, ...patch, id, updatedAt: Date.now() } : l
          ),
        }),

      deleteLead: (id) => set({ leads: get().leads.filter((l) => l.id !== id) }),
    }),
    { name: PERSIST_KEY_LEADS, version: 1, storage: sessionPersistStorage }
  )
);

export function seedDemoLeadsIfEmpty(): void {
  const { leads, addLead } = useLeadStore.getState();
  if (leads.length > 0) return;
  addLead({
    businessName: "Sample Auto Detail",
    contactName: "Jordan Lee",
    phone: "(555) 010-0199",
    email: "jordan@sample-detail.test",
    address: "1200 Main St",
    category: "Automotive",
    status: "contacted" as LeadStatus,
    notes: "Met at chamber event — asked about missed calls.",
    lastContact: new Date().toISOString().slice(0, 10),
    nextAction: "Field visit — show response-time story",
  });
}
