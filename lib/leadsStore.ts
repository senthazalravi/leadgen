export type LeadStatus = 'HOT' | 'PROGRESS' | 'DISQUALIFIED';

export type Lead = {
  id: number;
  name: string;
  country?: string | null;
  phoneNumber?: string | null;
  whatsappNumber?: string | null;
  dealProfile?: string | null;
  website?: string | null;
  notes?: string | null;
  status: LeadStatus;
  createdAt: string;
};

let leads: Lead[] = [];
let nextId = 1;

export function listLeads(): Lead[] {
  return [...leads].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function createLead(data: Omit<Lead, 'id' | 'createdAt'>): Lead {
  const now = new Date().toISOString();
  const lead: Lead = {
    id: nextId++,
    createdAt: now,
    ...data,
  };
  leads.push(lead);
  return lead;
}

export function getLeadById(id: number): Lead | undefined {
  return leads.find((lead) => lead.id === id);
}

export function deleteLeadById(id: number): boolean {
  const index = leads.findIndex((lead) => lead.id === id);
  if (index === -1) return false;
  leads.splice(index, 1);
  return true;
}
