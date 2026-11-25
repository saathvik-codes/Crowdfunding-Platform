"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, tokenStore, type User } from "./api";

type AuthState = {
  user: User | null; loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (input: { name: string; email: string; password: string; role: string }) => Promise<User>;
  logout: () => void; refresh: () => Promise<void>; setUser: (u: User) => void;
};
const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) { setUser(null); setLoading(false); return; }
    try { const { user } = await api<{ user: User }>("/auth/me"); setUser(user); }
    catch { tokenStore.clear(); setUser(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);

  const value = useMemo<AuthState>(() => ({
    user, loading, refresh, setUser,
    login: async (email, password) => { const r = await api<{ user: User; token: string }>("/auth/login", { body: { email, password }, auth: false }); tokenStore.set(r.token); await refresh(); return r.user; },
    register: async (input) => { const r = await api<{ user: User; token: string }>("/auth/register", { body: input, auth: false }); tokenStore.set(r.token); await refresh(); return r.user; },
    logout: () => { tokenStore.clear(); setUser(null); },
  }), [user, loading, refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export const useAuth = () => { const v = useContext(Ctx); if (!v) throw new Error("AuthProvider missing"); return v; };
