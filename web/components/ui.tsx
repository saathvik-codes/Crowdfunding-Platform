"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { money, pct, type Campaign } from "@/lib/api";

export function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-[#e9e6dd]" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${value}%` }} />
    </div>
  );
}

export function Empty({ art, title, text, action }: { art: string; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="card grid justify-items-center gap-2 px-6 py-10 text-center">
      <Image src={`/art/${art}.webp`} alt="" width={200} height={150} className="h-auto w-48" />
      <h3 className="text-lg font-bold">{title}</h3>
      {text && <p className="max-w-sm text-sm text-muted">{text}</p>}
      {action}
    </div>
  );
}

export function CampaignCard({ c, saved, onSave }: { c: Campaign; saved?: boolean; onSave?: (id: number) => void }) {
  const p = pct(c);
  return (
    <article className="card flex flex-col overflow-hidden">
      <Link href={`/campaigns/${c.id}`} className="block aspect-[16/9] bg-brand-soft">
        {c.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.image_url} alt="" className="size-full object-cover" loading="lazy" />
        ) : (
          <Image src="/art/cf-hero-seedling.webp" alt="" width={560} height={315} className="size-full object-cover" />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="chip">{c.category || "other"}</span>
          {onSave && (
            <button onClick={() => onSave(c.id)} aria-pressed={saved} className="text-sm font-semibold text-muted hover:text-brand">{saved ? "Saved" : "Save"}</button>
          )}
        </div>
        <Link href={`/campaigns/${c.id}`} className="font-[family-name:var(--font-head)] text-lg font-bold leading-snug hover:text-brand">{c.title}</Link>
        <p className="line-clamp-2 text-sm text-muted">{c.summary || c.description}</p>
        <div className="mt-auto grid gap-2">
          <Progress value={p} />
          <div className="flex justify-between text-sm">
            <span><b>{money(c.total_pledged || c.current_funds)}</b> <span className="text-muted">of {money(c.goal_amount)}</span></span>
            <span className="font-semibold text-brand-dark">{p}%</span>
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>{c.backers_count} backers</span>
            <span>{c.status !== "active" ? c.status : c.is_expired ? "Ended" : `${c.days_remaining} days left`}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

// Sends signed-out visitors to sign in, and people who skipped onboarding to onboarding
export function useGuard(opts: { role?: string[]; needOnboarding?: boolean } = {}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const roles = opts.role?.join(",");
  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/login"); return; }
    if (opts.needOnboarding !== false && !user.onboarded && user.role !== "admin") { router.replace("/onboarding"); return; }
    if (roles && !roles.split(",").includes(user.role)) router.replace("/dashboard");
  }, [user, loading, router, roles, opts.needOnboarding]);
  return { user, ready: !loading && !!user };
}

export function Notice({ kind, children }: { kind: "ok" | "error"; children: React.ReactNode }) {
  return <p role={kind === "error" ? "alert" : "status"} className={`rounded-xl px-3 py-2 text-sm ${kind === "ok" ? "bg-brand-soft text-brand-dark" : "bg-red-50 text-red-700"}`}>{children}</p>;
}
