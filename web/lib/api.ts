export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type Role = "admin" | "entrepreneur" | "investor";
export type User = { id: number; name: string; email: string; role: Role; onboarded?: number; bio?: string; location?: string; phone?: string; wallet_balance?: number };
export type Campaign = {
  id: number; title: string; description: string; summary?: string | null; category?: string | null; image_url?: string | null;
  goal_amount: number; current_funds: number; total_pledged: number; backers_count: number; progress_percentage: string | number;
  deadline: string; status: string; creator_id: number; creator_name?: string; days_remaining: number; is_expired: boolean; created_at: string;
};

export const CATEGORIES = ["tech", "education", "health", "community", "art", "food", "sustainability", "other"] as const;

const TOKEN_KEY = "cf_token";
export const tokenStore = {
  get: () => (typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY)),
  set: (t: string) => window.localStorage.setItem(TOKEN_KEY, t),
  clear: () => window.localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function api<T = any>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${API}${path}`, {
    method: opts.method || (opts.body ? "POST" : "GET"),
    headers: { "Content-Type": "application/json", ...(token && opts.auth !== false ? { Authorization: `Bearer ${token}` } : {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || data.message || `Request failed (${res.status})`, res.status);
  return data as T;
}

export const money = (n: number | string | undefined | null) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));
export const pct = (c: Campaign) => Math.min(100, Math.round(Number(c.goal_amount) > 0 ? (Number(c.total_pledged || c.current_funds) / Number(c.goal_amount)) * 100 : 0));
export const when = (s: string) => new Date(s.replace(" ", "T") + (s.includes("T") || s.includes("Z") ? "" : "Z")).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
