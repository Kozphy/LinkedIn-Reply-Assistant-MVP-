const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getDashboard: () => request<DashboardStats>("/dashboard/stats"),
  getCompliance: () => request<{ notice: string }>("/compliance"),

  getContacts: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<Contact[]>(`/contacts${qs}`);
  },
  getContact: (id: number) => request<Contact>(`/contacts/${id}`),
  createContact: (data: Partial<Contact>) =>
    request<Contact>("/contacts", { method: "POST", body: JSON.stringify(data) }),
  updateContact: (id: number, data: Partial<Contact>) =>
    request<Contact>(`/contacts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteContact: (id: number) =>
    request<void>(`/contacts/${id}`, { method: "DELETE" }),

  getCompanies: () => request<Company[]>("/companies"),
  getCompany: (id: number) => request<Company>(`/companies/${id}`),
  createCompany: (data: Partial<Company>) =>
    request<Company>("/companies", { method: "POST", body: JSON.stringify(data) }),
  updateCompany: (id: number, data: Partial<Company>) =>
    request<Company>(`/companies/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteCompany: (id: number) =>
    request<void>(`/companies/${id}`, { method: "DELETE" }),

  getJobs: () => request<Job[]>("/jobs"),
  getJob: (id: number) => request<Job>(`/jobs/${id}`),
  createJob: (data: Partial<Job> & { user_skills?: string[] }) =>
    request<Job>("/jobs", { method: "POST", body: JSON.stringify(data) }),
  updateJob: (id: number, data: Partial<Job> & { user_skills?: string[] }) =>
    request<Job>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteJob: (id: number) =>
    request<void>(`/jobs/${id}`, { method: "DELETE" }),
  computeFitScore: (description: string, user_skills: string[]) =>
    request<FitScoreResult>("/jobs/fit-score", {
      method: "POST",
      body: JSON.stringify({ description, user_skills }),
    }),

  getInteractions: (contactId?: number) => {
    const qs = contactId ? `?contact_id=${contactId}` : "";
    return request<Interaction[]>(`/interactions${qs}`);
  },
  createInteraction: (data: Partial<Interaction>) =>
    request<Interaction>("/interactions", { method: "POST", body: JSON.stringify(data) }),

  generateOutreach: (data: OutreachGenerateRequest) =>
    request<OutreachMessage>("/outreach/generate", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getOutreachMessages: () => request<OutreachMessage[]>("/outreach"),
};

export interface Contact {
  id: number;
  name: string;
  linkedin_url?: string;
  current_title?: string;
  company?: string;
  location?: string;
  relationship_level: string;
  status: string;
  source: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: number;
  name: string;
  industry?: string;
  country?: string;
  target_roles?: string;
  career_value?: string;
  notes?: string;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  url?: string;
  location?: string;
  description?: string;
  status: string;
  fit_score?: number;
  missing_skills?: string;
  next_action?: string;
}

export interface Interaction {
  id: number;
  contact_id: number;
  date: string;
  channel: string;
  message?: string;
  result?: string;
  next_follow_up_date?: string;
}

export interface OutreachMessage {
  id: number;
  contact_id: number;
  goal: string;
  tone: string;
  generated_message: string;
  status: string;
}

export interface DashboardStats {
  total_contacts: number;
  contacted_count: number;
  replied_count: number;
  follow_up_due_count: number;
  top_target_companies: { name: string; career_value: string }[];
  recent_interactions: Interaction[];
}

export interface FitScoreResult {
  fit_score: number;
  missing_skills: string[];
  matched_skills: string[];
}

export interface OutreachGenerateRequest {
  contact_id: number;
  goal: string;
  tone: string;
  user_background: string;
  has_personal_connection: boolean;
}
