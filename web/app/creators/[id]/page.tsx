"use client";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, money, when, type Campaign } from "@/lib/api";
import { CampaignCard, Empty, Notice } from "@/components/ui";

type Profile = { user: { id: number; name: string; bio?: string; location?: string; created_at: string }; campaigns: Campaign[]; stats: { campaigns: number; raised: number; backers: number } };

export default function Creator() {
  const { id } = useParams<{ id: string }>();
  const [d, setD] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { api<Profile>(`/users/${id}/public`, { auth: false }).then(setD).catch((e) => setError(e.message)); }, [id]);
  if (error) return <Notice kind="error">{error}</Notice>;
  if (!d) return <div className="card h-64 animate-pulse bg-[#efece4]" />;
  return (
    <div className="grid gap-6">
      <header className="card grid items-center gap-4 overflow-hidden p-6 md:grid-cols-[1fr_auto]">
        <div className="grid gap-2">
          <span className="grid size-14 place-items-center rounded-full bg-brand text-xl font-bold text-white">{d.user.name.charAt(0).toUpperCase()}</span>
          <h1 className="text-3xl font-bold">{d.user.name}</h1>
          <p className="text-sm text-muted">{[d.user.location, `On FundStarter since ${when(d.user.created_at)}`].filter(Boolean).join(" · ")}</p>
          {d.user.bio && <p className="max-w-xl">{d.user.bio}</p>}
          <dl className="mt-2 flex flex-wrap gap-6 text-sm">
            <div><dt className="text-muted">Campaigns</dt><dd className="text-xl font-bold">{d.stats.campaigns}</dd></div>
            <div><dt className="text-muted">Raised</dt><dd className="text-xl font-bold">{money(d.stats.raised)}</dd></div>
            <div><dt className="text-muted">Backers</dt><dd className="text-xl font-bold">{d.stats.backers}</dd></div>
          </dl>
        </div>
        <Image src="/art/cf-admin.webp" alt="" width={260} height={200} className="hidden h-auto w-56 md:block" />
      </header>
      <h2 className="text-xl font-bold">Campaigns</h2>
      {d.campaigns.length === 0 ? <Empty art="cf-empty-projects" title="No public campaigns yet" /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{d.campaigns.map((c) => <CampaignCard key={c.id} c={c} />)}</div>
      )}
    </div>
  );
}
