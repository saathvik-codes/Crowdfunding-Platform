"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Notice } from "@/components/ui";

export default function Login() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    try {
      const u = await login(email.trim(), password);
      router.replace(u.onboarded || u.role === "admin" ? "/dashboard" : "/onboarding");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not sign in"); }
    finally { setBusy(false); }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-5rem)] max-w-4xl items-center gap-8 md:grid-cols-2">
      <form onSubmit={submit} className="card grid gap-4 p-6 sm:p-8">
        <Link href="/" className="text-sm font-semibold text-brand-dark">&larr; Seedling</Link>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <div><label className="label" htmlFor="email">Email</label><input id="email" className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label" htmlFor="password">Password</label><input id="password" className="input" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <Notice kind="error">{error}</Notice>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
        <p className="text-sm text-muted">New here? <Link className="font-semibold text-brand-dark" href="/register">Create an account</Link></p>
      </form>
      <Image src="/art/cf-auth-signin.webp" alt="" width={700} height={600} priority className="hidden h-auto w-full rounded-2xl border border-line bg-white md:block" />
    </div>
  );
}
