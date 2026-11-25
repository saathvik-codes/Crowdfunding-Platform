"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, CATEGORIES, type Campaign } from "@/lib/api";
import { Notice } from "@/components/ui";

const toLocal = (s?: string) => (s ? s.replace(" ", "T").slice(0, 16) : "");

export default function CampaignForm({ existing }: { existing?: Campaign }) {
  const router = useRouter();
  const [f, setF] = useState({
    title: existing?.title || "", summary: existing?.summary || "", description: existing?.description || "",
    goal_amount: existing ? String(existing.goal_amount) : "", deadline: toLocal(existing?.deadline),
    category: existing?.category || "other", image_url: existing?.image_url || "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const body = { ...f, goal_amount: Number(f.goal_amount), deadline: new Date(f.deadline).toISOString().slice(0, 19).replace("T", " "), image_url: f.image_url || null };
    try {
      const r = existing
        ? await api<{ campaign: Campaign }>(`/campaigns/${existing.id}`, { method: "PUT", body })
        : await api<{ campaign: Campaign }>("/campaigns", { body });
      router.push(`/campaigns/${r.campaign.id}`);
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save the campaign"); setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="card mx-auto grid max-w-2xl gap-4 p-6 sm:p-8">
      <h1 className="text-3xl font-bold">{existing ? "Edit campaign" : "Start a campaign"}</h1>
      <div><label className="label" htmlFor="title">Title</label><input id="title" className="input" required maxLength={200} value={f.title} onChange={(e) => set("title", e.target.value)} /></div>
      <div><label className="label" htmlFor="summary">One-line summary</label><input id="summary" className="input" maxLength={300} value={f.summary} onChange={(e) => set("summary", e.target.value)} /></div>
      <div><label className="label" htmlFor="desc">The story</label><textarea id="desc" className="input" rows={7} required value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label" htmlFor="goal">Goal (INR)</label><input id="goal" className="input" type="number" min={1} required value={f.goal_amount} onChange={(e) => set("goal_amount", e.target.value)} /></div>
        <div><label className="label" htmlFor="dl">Deadline</label><input id="dl" className="input" type="datetime-local" required value={f.deadline} onChange={(e) => set("deadline", e.target.value)} /></div>
        <div><label className="label" htmlFor="cat">Category</label>
          <select id="cat" className="input capitalize" value={f.category} onChange={(e) => set("category", e.target.value)}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label" htmlFor="img">Cover image link (optional)</label><input id="img" className="input" type="url" placeholder="https://" value={f.image_url} onChange={(e) => set("image_url", e.target.value)} /></div>
      </div>
      {error && <Notice kind="error">{error}</Notice>}
      <div className="flex gap-2"><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : existing ? "Save changes" : "Launch campaign"}</button>
        <button type="button" className="btn btn-ghost" onClick={() => router.back()}>Cancel</button></div>
    </form>
  );
}
