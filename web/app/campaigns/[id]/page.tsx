"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, money, pct, when, type Campaign } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Empty, Notice, Progress } from "@/components/ui";

type Detail = Campaign & { backers: { backer_id: number; backer_name: string; amount: number; timestamp: string }[] };
type Update = { id: number; title: string; body: string; created_at: string };
type Comment = { id: number; body: string; created_at: string; user_id: number; user_name: string };

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refresh } = useAuth();
  const [c, setC] = useState<Detail | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [comment, setComment] = useState("");
  const [upd, setUpd] = useState({ title: "", body: "" });

  const load = useCallback(async () => {
    try {
      const [d, u, cm] = await Promise.all([
        api<{ campaign: Detail }>(`/campaigns/${id}`, { auth: false }),
        api<{ updates: Update[] }>(`/campaigns/${id}/updates`, { auth: false }),
        api<{ comments: Comment[] }>(`/campaigns/${id}/comments`, { auth: false }),
      ]);
      setC(d.campaign); setUpdates(u.updates); setComments(cm.comments);
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load this campaign"); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!user) return;
    api<{ saved: number[] }>("/saved").then((r) => setSaved(r.saved.includes(Number(id)))).catch(() => {});
  }, [user, id]);

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!c) return <div className="card h-96 animate-pulse bg-[#efece4]" />;

  const isOwner = user?.id === c.creator_id;
  const open = c.status === "active" && !c.is_expired;
  const p = pct(c);

  async function pledge(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    try {
      await api("/pledges", { body: { campaign_id: c!.id, amount: Number(amount) } });
      setAmount(""); setMsg({ kind: "ok", text: "Thank you. Your pledge is held until the deadline." });
      await Promise.all([load(), refresh()]);
    } catch (err) { setMsg({ kind: "error", text: err instanceof Error ? err.message : "Pledge failed" }); }
  }
  async function toggleSave() {
    if (!user) { window.location.href = "/login"; return; }
    const r = await api<{ saved: boolean }>(`/saved/${c!.id}`, { method: "POST", body: {} });
    setSaved(r.saved);
  }
  async function sendComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    await api(`/campaigns/${c!.id}/comments`, { body: { body: comment } });
    setComment(""); await load();
  }
  async function removeComment(cid: number) { await api(`/comments/${cid}`, { method: "DELETE" }); await load(); }
  async function postUpdate(e: React.FormEvent) {
    e.preventDefault();
    await api(`/campaigns/${c!.id}/updates`, { body: upd });
    setUpd({ title: "", body: "" }); await load();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <div className="grid content-start gap-6">
        <div className="card overflow-hidden">
          {c.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.image_url} alt="" className="aspect-[16/9] w-full object-cover" />
          ) : (
            <Image src="/art/cf-hero-seedling.webp" alt="" width={1100} height={620} className="aspect-[16/9] w-full object-cover" priority />
          )}
          <div className="grid gap-3 p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip">{c.category || "other"}</span>
              {c.status !== "active" && <span className="chip">{c.status}</span>}
            </div>
            <h1 className="text-3xl font-bold">{c.title}</h1>
            <p className="text-sm text-muted">by {c.creator_name} · started {when(c.created_at)}</p>
            <p className="whitespace-pre-line leading-relaxed text-[#33423a]">{c.description}</p>
          </div>
        </div>

        <section aria-labelledby="updates" className="grid gap-3">
          <h2 id="updates" className="text-xl font-bold">Updates</h2>
          {isOwner && (
            <form onSubmit={postUpdate} className="card grid gap-3 p-4">
              <input className="input" placeholder="Update title" required maxLength={140} value={upd.title} onChange={(e) => setUpd({ ...upd, title: e.target.value })} aria-label="Update title" />
              <textarea className="input" rows={3} placeholder="Tell backers what is new" required value={upd.body} onChange={(e) => setUpd({ ...upd, body: e.target.value })} aria-label="Update text" />
              <button className="btn btn-primary justify-self-start">Post update</button>
            </form>
          )}
          {updates.length === 0 ? <Empty art="cf-empty-activity" title="No updates yet" text="Updates from the creator will show up here." /> : updates.map((u) => (
            <article key={u.id} className="card p-4"><h3 className="font-bold">{u.title}</h3><p className="text-xs text-muted">{when(u.created_at)}</p><p className="mt-2 whitespace-pre-line text-sm">{u.body}</p></article>
          ))}
        </section>

        <section aria-labelledby="comments" className="grid gap-3">
          <h2 id="comments" className="text-xl font-bold">Comments ({comments.length})</h2>
          {user ? (
            <form onSubmit={sendComment} className="card flex gap-2 p-3">
              <input className="input" placeholder="Ask a question or cheer them on" maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Comment" />
              <button className="btn btn-primary">Post</button>
            </form>
          ) : <p className="text-sm text-muted"><Link className="font-semibold text-brand-dark" href="/login">Sign in</Link> to join the conversation.</p>}
          {comments.map((cm) => (
            <div key={cm.id} className="card flex items-start justify-between gap-3 p-4">
              <div><p className="text-sm font-bold">{cm.user_name} <span className="font-normal text-muted">· {when(cm.created_at)}</span></p><p className="mt-1 text-sm">{cm.body}</p></div>
              {(user?.id === cm.user_id || user?.role === "admin") && <button className="text-xs font-semibold text-red-700" onClick={() => removeComment(cm.id)}>Delete</button>}
            </div>
          ))}
        </section>
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-24">
        <div className="card grid gap-3 p-5">
          <p className="text-3xl font-bold">{money(c.total_pledged)}</p>
          <p className="-mt-2 text-sm text-muted">pledged of {money(c.goal_amount)} goal</p>
          <Progress value={p} />
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div><b className="block text-lg">{p}%</b><span className="text-muted">funded</span></div>
            <div><b className="block text-lg">{c.backers_count}</b><span className="text-muted">backers</span></div>
            <div><b className="block text-lg">{open ? c.days_remaining : 0}</b><span className="text-muted">days left</span></div>
          </div>
          {open && !isOwner && user?.role !== "admin" && (
            user ? (
              <form onSubmit={pledge} className="grid gap-2">
                <label className="label" htmlFor="amt">Your pledge (balance {money(user.wallet_balance)})</label>
                <input id="amt" className="input" type="number" min={1} step="1" required value={amount} onChange={(e) => setAmount(e.target.value)} />
                <button className="btn btn-primary">Back this campaign</button>
              </form>
            ) : <Link href="/login" className="btn btn-primary">Sign in to back this</Link>
          )}
          {isOwner && c.status === "active" && <Link href={`/campaigns/${c.id}/edit`} className="btn btn-ghost">Edit campaign</Link>}
          <button className="btn btn-ghost" onClick={toggleSave} aria-pressed={saved}>{saved ? "Saved to your list" : "Save for later"}</button>
          {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        </div>
        <div className="card p-5">
          <h2 className="mb-2 font-bold">Recent backers</h2>
          {c.backers.length === 0 ? <p className="text-sm text-muted">No backers yet.</p> : (
            <ul className="grid gap-2 text-sm">{c.backers.slice(0, 8).map((b, i) => <li key={i} className="flex justify-between"><span>{b.backer_name}</span><b>{money(b.amount)}</b></li>)}</ul>
          )}
        </div>
      </aside>
    </div>
  );
}
