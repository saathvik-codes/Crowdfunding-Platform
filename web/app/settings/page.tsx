"use client";
import { useEffect, useState } from "react";
import { api, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Notice, useGuard } from "@/components/ui";

export default function Settings() {
  const { ready, user } = useGuard();
  const { setUser } = useAuth();
  const [f, setF] = useState({ name: "", phone: "", location: "", bio: "", currentPassword: "", newPassword: "", confirm: "" });
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    api<{ user: User }>(`/users/${user.id}`).then(({ user: u }) => setF((s) => ({ ...s, name: u.name || "", phone: u.phone || "", location: u.location || "", bio: u.bio || "" }))).catch(() => {});
  }, [user]);
  if (!ready || !user) return null;
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    if (f.newPassword && f.newPassword !== f.confirm) { setMsg({ kind: "error", text: "The new passwords do not match." }); return; }
    try {
      const r = await api<{ user: User }>(`/users/${user!.id}`, { method: "PUT", body: f });
      setUser({ ...user!, name: r.user.name });
      setF((s) => ({ ...s, currentPassword: "", newPassword: "", confirm: "" }));
      setMsg({ kind: "ok", text: "Saved." });
    } catch (err) { setMsg({ kind: "error", text: err instanceof Error ? err.message : "Could not save" }); }
  }

  return (
    <form onSubmit={save} className="card mx-auto grid max-w-2xl gap-5 p-6 sm:p-8">
      <div><h1 className="text-3xl font-bold">Settings</h1><p className="text-sm text-muted">{user.email} · {user.role}</p></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="n">Name</label><input id="n" className="input" required value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="label" htmlFor="p">Phone</label><input id="p" className="input" value={f.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="l">Location</label><input id="l" className="input" value={f.location} onChange={(e) => set("location", e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="b">About you</label><textarea id="b" className="input" rows={3} value={f.bio} onChange={(e) => set("bio", e.target.value)} /></div>
      </div>
      <fieldset className="grid gap-4 border-t border-line pt-4 sm:grid-cols-3">
        <legend className="label">Change password</legend>
        <input className="input" type="password" autoComplete="current-password" placeholder="Current" aria-label="Current password" value={f.currentPassword} onChange={(e) => set("currentPassword", e.target.value)} />
        <input className="input" type="password" autoComplete="new-password" placeholder="New" aria-label="New password" value={f.newPassword} onChange={(e) => set("newPassword", e.target.value)} />
        <input className="input" type="password" autoComplete="new-password" placeholder="Repeat new" aria-label="Repeat new password" value={f.confirm} onChange={(e) => set("confirm", e.target.value)} />
      </fieldset>
      {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
      <button className="btn btn-primary justify-self-start">Save changes</button>
    </form>
  );
}
