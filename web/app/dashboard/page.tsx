"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, money, when, type Campaign } from "@/lib/api";
import { CampaignCard, Empty, Notice, Progress, useGuard } from "@/components/ui";

type Pledge = { id: number; campaign_id: number; amount: number; campaign_title: string; campaign_status: string; pledge_date: string; funding_percentage: number };
type Note = { id: number; title: string; message: string; is_read: number; created_at: string };

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="bg-white p-4"><dt className="text-sm text-muted">{label}</dt><dd className="mt-1 text-2xl font-bold">{value}</dd></div>;
}
const Strip = ({ children }: { children: React.ReactNode }) => (
  <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">{children}</dl>
);

function Notifications() {
  const [notes, setNotes] = useState<Note[]>([]);
  const load = () => api<{ notifications?: Note[] }>("/dashboard/notifications").then((r) => setNotes(r.notifications || [])).catch(() => setNotes([]));
  useEffect(() => { void load(); }, []);
  if (!notes.length) return null;
  return (
    <section className="card p-5">
      <div className="mb-2 flex items-center justify-between"><h2 className="text-lg font-bold">Notifications</h2>
        <button className="text-sm font-semibold text-brand-dark" onClick={async () => { await api("/dashboard/notifications/read-all", { method: "PUT", body: {} }); void load(); }}>Mark all read</button></div>
      <ul className="grid gap-2">{notes.slice(0, 5).map((n) => <li key={n.id} className={`rounded-xl border px-3 py-2 text-sm ${n.is_read ? "border-line" : "border-brand/30 bg-brand-soft"}`}><b>{n.title}</b><span className="block text-muted">{n.message}</span></li>)}</ul>
    </section>
  );
}

function Investor() {
  const [d, setD] = useState<any>(null);
  const [saved, setSaved] = useState<Campaign[]>([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    api("/dashboard/investor").then(setD).catch((e) => setErr(e.message));
    Promise.all([api<{ saved: number[] }>("/saved"), api<{ campaigns: Campaign[] }>("/campaigns", { auth: false })])
      .then(([s, all]) => setSaved(all.campaigns.filter((c) => s.saved.includes(c.id)))).catch(() => {});
  }, []);
  if (err) return <Notice kind="error">{err}</Notice>;
  if (!d) return <div className="card h-40 animate-pulse bg-[#efece4]" />;
  const s = d.stats || {};
  return (
    <div className="grid gap-6">
      <Strip><Stat label="Wallet" value={money(s.wallet_balance)} /><Stat label="Total backed" value={money(s.total_invested)} /><Stat label="Pledges" value={s.total_pledges || 0} /><Stat label="Campaigns backed" value={s.campaigns_backed || 0} /></Strip>
      <Notifications />
      <section className="grid gap-3"><h2 className="text-xl font-bold">Your pledges</h2>
        {(d.pledges as Pledge[] | undefined)?.length ? (
          <div className="card divide-y divide-line">{(d.pledges as any[]).map((p) => (
            <Link key={p.id} href={`/campaigns/${p.campaign_id}`} className="flex flex-wrap items-center justify-between gap-2 p-4 hover:bg-[#faf9f5]">
              <div><b>{p.campaign_title}</b><p className="text-xs text-muted">{when(p.timestamp)} · {p.campaign_status}</p></div><b>{money(p.amount)}</b></Link>))}</div>
        ) : <Empty art="cf-empty-pledges" title="No pledges yet" text="Find something you believe in and back it." action={<Link href="/" className="btn btn-primary mt-2">Explore campaigns</Link>} />}
      </section>
      <section className="grid gap-3"><h2 className="text-xl font-bold">Saved for later</h2>
        {saved.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{saved.map((c) => <CampaignCard key={c.id} c={c} />)}</div> : <p className="text-sm text-muted">Tap Save on any campaign to keep it here.</p>}
      </section>
    </div>
  );
}

function Entrepreneur() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api("/dashboard/entrepreneur").then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <Notice kind="error">{err}</Notice>;
  if (!d) return <div className="card h-40 animate-pulse bg-[#efece4]" />;
  const s = d.stats || {};
  return (
    <div className="grid gap-6">
      <Strip><Stat label="Raised" value={money(s.total_raised)} /><Stat label="Campaigns" value={s.total_campaigns || 0} /><Stat label="Active" value={s.active_campaigns || 0} /><Stat label="Backers" value={s.total_backers || 0} /></Strip>
      <Notifications />
      <section className="grid gap-3">
        <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Your campaigns</h2><Link href="/campaigns/new" className="btn btn-primary">New campaign</Link></div>
        {d.campaigns?.length ? (
          <div className="card divide-y divide-line">{d.campaigns.map((c: any) => (
            <div key={c.id} className="grid gap-2 p-4 sm:grid-cols-[1fr_12rem_auto] sm:items-center">
              <div><Link href={`/campaigns/${c.id}`} className="font-bold hover:text-brand">{c.title}</Link><p className="text-xs text-muted capitalize">{c.status} · {c.comment_count || 0} comments · {c.update_count || 0} updates</p></div>
              <div className="grid gap-1"><Progress value={Math.min(100, Math.round(c.funding_percentage || 0))} /><span className="text-xs text-muted">{money(c.current_funds)} of {money(c.goal_amount)}</span></div>
              <div className="flex gap-2"><Link className="btn btn-ghost" href={`/campaigns/${c.id}`}>Post update</Link>{c.status === "active" && <Link className="btn btn-ghost" href={`/campaigns/${c.id}/edit`}>Edit</Link>}</div>
            </div>))}</div>
        ) : <Empty art="cf-empty-projects" title="You have not started a campaign" text="Share your idea and set a goal." action={<Link href="/campaigns/new" className="btn btn-primary mt-2">Start a campaign</Link>} />}
      </section>
      <section className="grid gap-3"><h2 className="text-xl font-bold">Latest backers</h2>
        {d.recentPledges?.length ? <div className="card divide-y divide-line">{d.recentPledges.slice(0, 8).map((p: any) => <div key={p.id} className="flex justify-between p-3 text-sm"><span>{p.backer_name}</span><b>{money(p.amount)}</b></div>)}</div> : <Empty art="cf-empty-backers" title="No backers yet" text="Post an update and share the link to get the first pledge." />}
      </section>
    </div>
  );
}

function Admin() {
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => { api("/dashboard/admin").then(setD).catch((e) => setErr(e.message)); }, []);
  if (err) return <Notice kind="error">{err}</Notice>;
  if (!d) return <div className="card h-40 animate-pulse bg-[#efece4]" />;
  const o = d.overview || {};
  return (
    <div className="grid gap-6">
      <Strip><Stat label="Users" value={o.total_users || 0} /><Stat label="Campaigns" value={o.total_campaigns || 0} /><Stat label="Pledges" value={o.total_pledges || 0} /><Stat label="Funds raised" value={money(o.total_funds_raised)} /></Strip>
      <div className="flex gap-2"><Link href="/admin" className="btn btn-primary">Manage users and campaigns</Link><Link href="/analytics" className="btn btn-ghost">Analytics</Link></div>
      <Notifications />
    </div>
  );
}

export default function Dashboard() {
  const { ready, user } = useGuard();
  if (!ready || !user) return null;
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold">Hello, {user.name.split(" ")[0]}</h1>
      {user.role === "admin" ? <Admin /> : user.role === "entrepreneur" ? <Entrepreneur /> : <Investor />}
    </div>
  );
}
