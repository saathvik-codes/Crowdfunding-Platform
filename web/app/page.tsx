"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, CATEGORIES, money, type Campaign } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CampaignCard, Empty } from "@/components/ui";

type Sort = "newest" | "ending" | "funded" | "popular";

export default function Explore() {
  const { user } = useAuth();
  const [all, setAll] = useState<Campaign[] | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<number[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState<Sort>("newest");

  useEffect(() => {
    api<{ campaigns: Campaign[] }>("/campaigns", { auth: false }).then((r) => setAll(r.campaigns)).catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    if (!user) { setSaved([]); return; }
    api<{ saved: number[] }>("/saved").then((r) => setSaved(r.saved)).catch(() => setSaved([]));
  }, [user]);

  const toggleSave = useCallback(async (id: number) => {
    if (!user) { window.location.href = "/login"; return; }
    const r = await api<{ saved: boolean }>(`/saved/${id}`, { method: "POST", body: {} });
    setSaved((s) => (r.saved ? [...s, id] : s.filter((x) => x !== id)));
  }, [user]);

  const shown = useMemo(() => {
    let list = (all || []).filter((c) => c.status === "active" || c.status === "successful");
    if (cat !== "all") list = list.filter((c) => (c.category || "other") === cat);
    const needle = q.trim().toLowerCase();
    if (needle) list = list.filter((c) => `${c.title} ${c.summary || ""} ${c.description} ${c.creator_name || ""}`.toLowerCase().includes(needle));
    const by: Record<Sort, (a: Campaign, b: Campaign) => number> = {
      newest: (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
      ending: (a, b) => a.days_remaining - b.days_remaining,
      funded: (a, b) => Number(b.total_pledged) / Number(b.goal_amount) - Number(a.total_pledged) / Number(a.goal_amount),
      popular: (a, b) => b.backers_count - a.backers_count,
    };
    return [...list].sort(by[sort]);
  }, [all, q, cat, sort]);

  const totals = useMemo(() => ({
    raised: (all || []).reduce((s, c) => s + Number(c.total_pledged || 0), 0),
    backers: (all || []).reduce((s, c) => s + c.backers_count, 0),
    live: (all || []).filter((c) => c.status === "active" && !c.is_expired).length,
  }), [all]);

  return (
    <div className="grid gap-8">
      <section className="grid items-center gap-6 py-4 md:grid-cols-[1.1fr_1fr]">
        <div className="grid gap-4">
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">Fund ideas that are worth growing.</h1>
          <p className="max-w-lg text-lg text-muted">Back a campaign in a few clicks, or launch your own. Pledges sit in escrow and are paid out only when a campaign reaches its goal.</p>
          <div className="flex flex-wrap gap-2">
            {user ? (
              <Link href="/dashboard" className="btn btn-primary">Go to dashboard</Link>
            ) : (
              <>
                <Link href="/register" className="btn btn-primary">Create an account</Link>
                <Link href="/login" className="btn btn-ghost">Sign in</Link>
              </>
            )}
          </div>
          {all && (
            <dl className="mt-2 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-4 text-sm">
              <div><dt className="text-muted">Pledged</dt><dd className="text-xl font-bold">{money(totals.raised)}</dd></div>
              <div><dt className="text-muted">Backers</dt><dd className="text-xl font-bold">{totals.backers}</dd></div>
              <div><dt className="text-muted">Live now</dt><dd className="text-xl font-bold">{totals.live}</dd></div>
            </dl>
          )}
        </div>
        <Image src="/art/cf-hero-seedling.webp" alt="A seedling growing from a coin" width={900} height={600} priority className="h-auto w-full rounded-2xl border border-line bg-white" />
      </section>

      <section aria-label="Campaigns" className="grid gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <input className="input max-w-sm flex-1" type="search" placeholder="Search campaigns, creators…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search campaigns" />
          <select className="input w-auto" value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort campaigns">
            <option value="newest">Newest</option><option value="ending">Ending soon</option><option value="funded">Most funded</option><option value="popular">Most backers</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
          {["all", ...CATEGORIES].map((c) => (
            <button key={c} role="tab" aria-selected={cat === c} onClick={() => setCat(c)} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold capitalize ${cat === c ? "border-brand bg-brand text-white" : "border-line bg-white text-[#4b5a52] hover:border-[#c9c4b8]"}`}>{c}</button>
          ))}
        </div>

        {error ? (
          <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">Could not load campaigns: {error}</p>
        ) : !all ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="card h-80 animate-pulse bg-[#efece4]" />)}</div>
        ) : shown.length === 0 ? (
          <Empty art="cf-empty-projects" title={all.length ? "Nothing matches your search" : "No campaigns yet"} text={all.length ? "Try a different category or clear the search." : "Be the first to launch one."} action={user?.role === "entrepreneur" ? <Link href="/campaigns/new" className="btn btn-primary mt-2">Start a campaign</Link> : undefined} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((c) => <CampaignCard key={c.id} c={c} saved={saved.includes(c.id)} onSave={toggleSave} />)}
          </div>
        )}
      </section>

      <section aria-label="How it works" className="grid gap-4 sm:grid-cols-3">
        {[
          ["cf-how-create", "Create", "Describe the idea, set a goal and a deadline."],
          ["cf-how-fund", "Back", "Pledge from your wallet. It is held until the deadline."],
          ["cf-how-grow", "Grow", "Goal met: the creator is paid. Missed: every backer is refunded."],
        ].map(([art, t, d]) => (
          <div key={t} className="card grid gap-2 p-5">
            <Image src={`/art/${art}.webp`} alt="" width={160} height={120} className="h-20 w-auto" />
            <h3 className="font-bold">{t}</h3>
            <p className="text-sm text-muted">{d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
