export type LeadStatus =
  | "new"
  | "contacted"
  | "visited"
  | "follow_up"
  | "won"
  | "lost"
  | "not_qualified";

export type Lead = {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  status: LeadStatus;
  notes: string;
  lastContact: string | null;
  nextAction: string;
  updatedAt: number;
  /** Geocoded for route planner (optional). */
  lat?: number;
  lng?: number;
  /** Order in last planned route (1 = first stop after start). */
  routeOrder?: number;
};
