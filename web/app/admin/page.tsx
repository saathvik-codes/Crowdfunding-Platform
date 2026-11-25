"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { api, money, when } from "@/lib/api";
import { Notice, useGuard } from "@/components/ui";

type U = { id: number; name: string; email: string; role: string; is_active: number; wallet_balance: number; created_at: string };
type C = { id: number; title: string; status: string; creator_name: string; goal_amount: number; current_funds: number };

export default function Admin() {
  const { ready, user } = useGuard({ role: ["admin"], needOnboarding: false });
  const [tab, setTab] = useState<"users" | "campaigns">("users");
  const [users, setUsers] = useState<U[]>([]);
  const [camps, setCamps] = useState<C[]>([]);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const [u, c] = await Promise.all([api<{ users: U[] }>("/admin/users"), api<{ campaigns: C[] }>("/admin/campaigns")]);
      setUsers(u.users); setCamps(c.campaigns);
    } catch (e) { setErr(e instanceof Error ? e.message : "Could not load"); }
  }, []);
  useEffect(() => { if (ready) void load(); }, [ready, load]);
  if (!ready) return null;

  const patchUser = async (id: number, body: object) => { try { await api(`/admin/users/${id}`, { method: "PATCH", body }); await load(); } catch (e) { setErr(e instanceof Error ? e.message : "Failed"); } };
  const patchCamp = async (id: number, status: string) => { await api(`/admin/campaigns/${id}`, { method: "PATCH", body: { status } }); await load(); };
  const needle = q.trim().toLowerCase();

  return (
    <div className="grid gap-5">
      <h1 className="text-3xl font-bold">Admin</h1>
      {err && <Notice kind="error">{err}</Notice>}
      <div className="flex flex-wrap items-center gap-2">
        {(["users", "campaigns"] as const).map((t) => <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t} className={`btn ${tab === t ? "btn-primary" : "btn-ghost"} capitalize`}>{t} ({t === "users" ? users.length : camps.length})</button>)}
        <input className="input ml-auto max-w-xs" type="search" placeholder="Filter" aria-label="Filter" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="card overflow-x-auto">
        {tab === "users" ? (
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted"><tr><th className="p-3">Name</th><th>Role</th><th>Balance</th><th>Joined</th><th>Status</th></tr></thead>
            <tbody>{users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(needle)).map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="p-3"><b>{u.name}</b><span className="block text-xs text-muted">{u.email}</span></td>
                <td><select className="input min-h-9 w-auto py-1" value={u.role} disabled={u.id === user?.id} aria-label={`Role for ${u.name}`} onChange={(e) => patchUser(u.id, { role: e.target.value })}><option>investor</option><option>entrepreneur</option><option>admin</option></select></td>
                <td>{money(u.wallet_balance)}</td><td>{when(u.created_at)}</td>
                <td><button className={`btn ${u.is_active ? "btn-ghost" : "btn-danger"} min-h-8`} disabled={u.id === user?.id} onClick={() => patchUser(u.id, { is_active: !u.is_active })}>{u.is_active ? "Active" : "Disabled"}</button></td>
              </tr>))}</tbody>
          </table>
        ) : (
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase text-muted"><tr><th className="p-3">Campaign</th><th>Creator</th><th>Raised</th><th>Status</th><th /></tr></thead>
            <tbody>{camps.filter((c) => `${c.title} ${c.creator_name}`.toLowerCase().includes(needle)).map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="p-3"><Link className="font-semibold hover:text-brand" href={`/campaigns/${c.id}`}>{c.title}</Link></td><td>{c.creator_name}</td>
                <td>{money(c.current_funds)} / {money(c.goal_amount)}</td><td className="capitalize">{c.status}</td>
                <td className="pr-3 text-right">{c.status === "active" ? <button className="btn btn-danger min-h-8" onClick={() => patchCamp(c.id, "cancelled")}>Take down</button> : c.status === "cancelled" ? <button className="btn btn-ghost min-h-8" onClick={() => patchCamp(c.id, "active")}>Restore</button> : null}</td>
              </tr>))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
