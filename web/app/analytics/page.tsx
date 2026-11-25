"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { api, money } from "@/lib/api";
import { Empty, Notice, Progress, useGuard } from "@/components/ui";

export default function Analytics() {
  const { ready } = useGuard();
  const [d, setD] = useState<any>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    if (!ready) return;
    Promise.all([
      api("/analytics/platform-stats"), api("/analytics/top-campaigns"), api("/analytics/funding-trends?days=30"), api("/analytics/success-rates"),
    ]).then(([platform, top, trends, rates]) => setD({ platform: platform.stats, top: top.campaigns, trends: trends.trends, rates: rates.rates })).catch((e) => setErr(e.message));
  }, [ready]);
  if (!ready) return null;
  if (err) return <Notice kind="error">{err}</Notice>;
  if (!d) return <div className="card h-64 animate-pulse bg-[#efece4]" />;
  const p = d.platform || {};
  const max = Math.max(1, ...d.trends.map((t: any) => Number(t.total_amount)));
  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold">Platform analytics</h1>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-4">
        {[["Campaigns", p.total_campaigns], ["Funds pledged", money(p.total_pledged_amount)], ["Active backers", p.active_backers], ["Success rate", `${Math.round(Number(d.rates?.success_rate || 0))}%`]].map(([l, v]) => (
          <div key={String(l)} className="bg-white p-4"><dt className="text-sm text-muted">{l}</dt><dd className="mt-1 text-2xl font-bold">{v ?? 0}</dd></div>))}
      </dl>
      <section className="card p-5">
        <h2 className="mb-3 text-lg font-bold">Pledges in the last 30 days</h2>
        {d.trends.length === 0 ? <Empty art="cf-analytics" title="No pledges in this window" text="The chart fills in as people back campaigns." /> : (
          <div className="flex h-44 items-end gap-1" role="img" aria-label="Daily pledged amount">
            {d.trends.map((t: any) => <div key={t.date} title={`${t.date}: ${money(t.total_amount)}`} className="flex-1 rounded-t bg-brand" style={{ height: `${Math.max(4, (Number(t.total_amount) / max) * 100)}%` }} />)}
          </div>
        )}
      </section>
      <section className="card p-5">
        <h2 className="mb-3 text-lg font-bold">Top campaigns</h2>
        {d.top.length === 0 ? <p className="text-sm text-muted">No campaigns yet.</p> : (
          <ul className="grid gap-3">{d.top.map((c: any) => (
            <li key={c.id} className="grid gap-1"><div className="flex justify-between text-sm"><Link href={`/campaigns/${c.id}`} className="font-semibold hover:text-brand">{c.title}</Link><span>{money(c.current_funds)} · {c.total_backers} backers</span></div><Progress value={Math.min(100, Math.round(Number(c.funding_percentage || 0)))} /></li>))}</ul>
        )}
      </section>
    </div>
  );
}
