"use client";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { api, money, pct, when, type Campaign } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { CampaignCard, Empty, Notice, Progress } from "@/components/ui";

type Backer = { backer_id: number; backer_name: string; amount: number; timestamp: string };
type Detail = Campaign & { backers: Backer[]; creator_id: number };
type Update = { id: number; title: string; body: string; created_at: string };
type Comment = { id: number; body: string; created_at: string; user_id: number; user_name: string };

const PRESETS = [250, 500, 1000, 2500];
const MILESTONES = [25, 50, 75];
const TABS = ["Story", "Updates", "Comments", "Backers"] as const;

export default function CampaignPage() {
  const { id } = useParams<{ id: string }>();
  const { user, refresh } = useAuth();
  const [c, setC] = useState<Detail | null>(null);
  const [updates, setUpdates] = useState<Update[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [related, setRelated] = useState<Campaign[]>([]);
  const [creator, setCreator] = useState<{ name: string; bio?: string; location?: string } | null>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Story");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [comment, setComment] = useState("");
  const [upd, setUpd] = useState({ title: "", body: "" });
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, u, cm, all] = await Promise.all([
        api<{ campaign: Detail }>(`/campaigns/${id}`, { auth: false }),
        api<{ updates: Update[] }>(`/campaigns/${id}/updates`, { auth: false }),
        api<{ comments: Comment[] }>(`/campaigns/${id}/comments`, { auth: false }),
        api<{ campaigns: Campaign[] }>("/campaigns", { auth: false }),
      ]);
      setC(d.campaign); setUpdates(u.updates); setComments(cm.comments);
      setRelated(all.campaigns.filter((x) => x.id !== d.campaign.id && x.status === "active" && (x.category === d.campaign.category || x.creator_id === d.campaign.creator_id)).slice(0, 3));
      api<{ user: { name: string; bio?: string; location?: string } }>(`/users/${d.campaign.creator_id}/public`, { auth: false }).then((r) => setCreator(r.user)).catch(() => {});
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load this campaign"); }
  }, [id]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!user) return;
    api<{ saved: number[] }>("/saved").then((r) => setSaved(r.saved.includes(Number(id)))).catch(() => {});
  }, [user, id]);

  const myPledge = useMemo(() => (user && c ? c.backers.filter((b) => b.backer_id === user.id).reduce((t, b) => t + Number(b.amount), 0) : 0), [user, c]);

  if (error) return <Notice kind="error">{error}</Notice>;
  if (!c) return <div className="card h-96 animate-pulse bg-[#efece4]" />;

  const isOwner = user?.id === c.creator_id;
  const open = c.status === "active" && !c.is_expired;
  const p = pct(c);
  const goal = Number(c.goal_amount), raised = Number(c.total_pledged);
  const remaining = Math.max(0, goal - raised);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

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
  async function share() {
    if (navigator.share) { try { await navigator.share({ title: c!.title, url: shareUrl }); return; } catch { /* cancelled, fall back to copy */ } }
    await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000);
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
      <div className="grid min-w-0 content-start gap-5">
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
              {open && c.days_remaining <= 7 && <span className="chip bg-amber-100 text-amber-800">Ending soon</span>}
            </div>
            <h1 className="text-3xl font-bold leading-tight">{c.title}</h1>
            {c.summary && <p className="text-lg text-muted">{c.summary}</p>}
            <p className="text-sm text-muted">
              by <Link href={`/creators/${c.creator_id}`} className="font-semibold text-brand-dark hover:underline">{c.creator_name}</Link> · started {when(c.created_at)} · ends {when(c.deadline)}
            </p>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto border-b border-line" role="tablist" aria-label="Campaign sections">
          {TABS.map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
              className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold ${tab === t ? "border-brand text-brand-dark" : "border-transparent text-muted hover:text-ink"}`}>
              {t}{t === "Updates" ? ` (${updates.length})` : t === "Comments" ? ` (${comments.length})` : t === "Backers" ? ` (${c.backers.length})` : ""}
            </button>
          ))}
        </div>

        {tab === "Story" && (
          <article className="card p-6"><p className="whitespace-pre-line leading-relaxed text-[#33423a]">{c.description}</p></article>
        )}

        {tab === "Updates" && (
          <section className="grid gap-3">
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
        )}

        {tab === "Comments" && (
          <section className="grid gap-3">
            {user ? (
              <form onSubmit={sendComment} className="card flex gap-2 p-3">
                <input className="input" placeholder="Ask a question or cheer them on" maxLength={1000} value={comment} onChange={(e) => setComment(e.target.value)} aria-label="Comment" />
                <button className="btn btn-primary">Post</button>
              </form>
            ) : <p className="text-sm text-muted"><Link className="font-semibold text-brand-dark" href="/login">Sign in</Link> to join the conversation.</p>}
            {comments.length === 0 ? <Empty art="cf-empty-activity" title="No comments yet" text="Start the conversation." /> : comments.map((cm) => (
              <div key={cm.id} className="card flex items-start justify-between gap-3 p-4">
                <div><p className="text-sm font-bold">{cm.user_name} {cm.user_id === c.creator_id && <span className="chip ml-1">Creator</span>} <span className="font-normal text-muted">· {when(cm.created_at)}</span></p><p className="mt-1 text-sm">{cm.body}</p></div>
                {(user?.id === cm.user_id || user?.role === "admin") && <button className="text-xs font-semibold text-red-700" onClick={() => removeComment(cm.id)}>Delete</button>}
              </div>
            ))}
          </section>
        )}

        {tab === "Backers" && (
          <section className="card">
            {c.backers.length === 0 ? <Empty art="cf-empty-backers" title="No backers yet" text="Be the first to back this campaign." /> : (
              <ul className="divide-y divide-line">{c.backers.map((b, i) => (
                <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span><b>{b.backer_name}</b><span className="block text-xs text-muted">{when(b.timestamp)}</span></span><b>{money(b.amount)}</b></li>
              ))}</ul>
            )}
          </section>
        )}

        {related.length > 0 && (
          <section className="grid gap-3">
            <h2 className="text-xl font-bold">More like this</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <CampaignCard key={r.id} c={r} />)}</div>
          </section>
        )}
      </div>

      <aside className="grid content-start gap-4 lg:sticky lg:top-24">
        <div className="card grid gap-3 p-5">
          <p className="text-3xl font-bold">{money(raised)}</p>
          <p className="-mt-2 text-sm text-muted">pledged of {money(goal)} goal{remaining > 0 && open ? ` · ${money(remaining)} to go` : ""}</p>
          <div className="relative pb-5">
            <Progress value={p} />
            {MILESTONES.map((m) => (
              <span key={m} className="absolute top-0 -translate-x-1/2" style={{ left: `${m}%` }}>
                <span className={`block h-2 w-0.5 ${p >= m ? "bg-white/70" : "bg-[#c9c4b8]"}`} />
                <span className="mt-1 block text-[10px] text-muted">{m}%</span>
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div><b className="block text-lg">{p}%</b><span className="text-muted">funded</span></div>
            <div><b className="block text-lg">{c.backers_count}</b><span className="text-muted">backers</span></div>
            <div><b className="block text-lg">{open ? c.days_remaining : 0}</b><span className="text-muted">days left</span></div>
          </div>
          {myPledge > 0 && <p className="rounded-xl bg-brand-soft px-3 py-2 text-sm text-brand-dark">You have backed this with <b>{money(myPledge)}</b>.</p>}
          {open && !isOwner && user?.role !== "admin" && (
            user ? (
              <form onSubmit={pledge} className="grid gap-2">
                <label className="label" htmlFor="amt">Your pledge (balance {money(user.wallet_balance)})</label>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((v) => <button type="button" key={v} onClick={() => setAmount(String(v))} className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${amount === String(v) ? "border-brand bg-brand-soft text-brand-dark" : "border-line bg-white"}`}>{money(v)}</button>)}
                </div>
                <input id="amt" className="input" type="number" min={1} step="1" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Or enter an amount" />
                <button className="btn btn-primary">Back this campaign</button>
                <p className="text-xs text-muted">Held until the deadline. If the goal is missed you get every rupee back.</p>
              </form>
            ) : <Link href="/login" className="btn btn-primary">Sign in to back this</Link>
          )}
          {!open && <p className="rounded-xl bg-[#f1efe9] px-3 py-2 text-sm text-muted">{c.status === "successful" ? "This campaign reached its goal." : "This campaign is closed."}</p>}
          {isOwner && c.status === "active" && <Link href={`/campaigns/${c.id}/edit`} className="btn btn-ghost">Edit campaign</Link>}
          <div className="grid grid-cols-2 gap-2">
            <button className="btn btn-ghost" onClick={toggleSave} aria-pressed={saved}>{saved ? "Saved" : "Save"}</button>
            <button className="btn btn-ghost" onClick={share}>{copied ? <><Check className="size-4" />Copied</> : <><Share2 className="size-4" />Share</>}</button>
          </div>
          <button className="inline-flex items-center gap-1.5 justify-self-start text-xs font-semibold text-muted hover:text-ink" onClick={async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}><Link2 className="size-3.5" />Copy link</button>
          {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
        </div>

        <div className="card grid gap-1 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Creator</p>
          <Link href={`/creators/${c.creator_id}`} className="font-bold hover:text-brand">{creator?.name || c.creator_name}</Link>
          {creator?.location && <p className="text-sm text-muted">{creator.location}</p>}
          {creator?.bio && <p className="mt-1 text-sm">{creator.bio}</p>}
        </div>
      </aside>
    </div>
  );
}
