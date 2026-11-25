"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, CATEGORIES, type User } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Notice, useGuard } from "@/components/ui";

export default function Onboarding() {
  const { ready, user } = useGuard({ needOnboarding: false });
  const { refresh } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<string>("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!ready || !user) return null;
  const current = role || user.role;

  async function finish(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      await api<{ user: User }>("/onboarding", { body: { role: current, bio, location, interests } });
      await refresh();
      router.replace("/dashboard");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save your profile"); }
    finally { setBusy(false); }
  }

  return (
    <form onSubmit={finish} className="card mx-auto grid max-w-2xl gap-5 p-6 sm:p-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-muted">Three quick things so the platform fits you. You can change them later in settings.</p>
      </div>
      {user.role !== "admin" && (
        <fieldset className="grid gap-2 sm:grid-cols-2">
          <legend className="label">How will you use Seedling?</legend>
          {[["investor", "Back campaigns", "Browse, pledge and follow the ones you believe in."], ["entrepreneur", "Launch campaigns", "Raise money for your idea and post updates."]].map(([v, t, d]) => (
            <label key={v} className={`cursor-pointer rounded-xl border p-4 ${current === v ? "border-brand bg-brand-soft" : "border-line bg-white"}`}>
              <input type="radio" name="role" className="sr-only" checked={current === v} onChange={() => setRole(v)} />
              <span className="block font-bold">{t}</span><span className="text-sm text-muted">{d}</span>
            </label>
          ))}
        </fieldset>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="loc">City or country</label><input id="loc" className="input" value={location} onChange={(e) => setLocation(e.target.value)} /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="bio">A line about you</label><textarea id="bio" className="input" rows={3} maxLength={300} value={bio} onChange={(e) => setBio(e.target.value)} /></div>
      </div>
      <fieldset>
        <legend className="label">Causes you care about</legend>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const on = interests.includes(c);
            return <button type="button" key={c} aria-pressed={on} onClick={() => setInterests((s) => (on ? s.filter((x) => x !== c) : [...s, c].slice(0, 8)))} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold capitalize ${on ? "border-brand bg-brand text-white" : "border-line bg-white"}`}>{c}</button>;
          })}
        </div>
      </fieldset>
      {error && <Notice kind="error">{error}</Notice>}
      <button className="btn btn-primary justify-self-start" disabled={busy}>{busy ? "Saving…" : "Finish setup"}</button>
    </form>
  );
}
