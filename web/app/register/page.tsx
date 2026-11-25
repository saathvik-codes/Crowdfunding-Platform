"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Notice } from "@/components/ui";

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "investor" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password.length < 6) { setError("Use at least 6 characters for the password."); return; }
    setBusy(true); setError("");
    try { await register({ ...form, name: form.name.trim(), email: form.email.trim() }); router.replace("/onboarding"); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not create the account"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-4xl items-center gap-8 md:grid-cols-2">
      <form onSubmit={submit} className="card grid gap-4 p-6 sm:p-8">
        <Link href="/" className="text-sm font-semibold text-brand-dark">&larr; Seedling</Link>
        <h1 className="text-3xl font-bold">Create your account</h1>
        <fieldset className="grid grid-cols-2 gap-2">
          <legend className="label">I want to</legend>
          {[["investor", "Back campaigns"], ["entrepreneur", "Launch a campaign"]].map(([v, l]) => (
            <label key={v} className={`cursor-pointer rounded-xl border px-3 py-3 text-sm font-semibold ${form.role === v ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white"}`}>
              <input type="radio" name="role" value={v} checked={form.role === v} onChange={() => set("role", v)} className="sr-only" />{l}
            </label>
          ))}
        </fieldset>
        <div><label className="label" htmlFor="name">Full name</label><input id="name" className="input" autoComplete="name" required value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" className="input" type="email" autoComplete="email" required value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" className="input" type="password" autoComplete="new-password" minLength={6} required value={form.password} onChange={(e) => set("password", e.target.value)} /></div>
        {error && <Notice kind="error">{error}</Notice>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create account"}</button>
        <p className="text-sm text-muted">Already registered? <Link className="font-semibold text-brand-dark" href="/login">Sign in</Link></p>
      </form>
      <Image src="/art/cf-auth-signup.webp" alt="" width={700} height={600} priority className="hidden h-auto w-full rounded-2xl border border-line bg-white md:block" />
    </div>
  );
}
