"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { money } from "@/lib/api";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  if (path === "/login" || path === "/register") return null;

  const links = user
    ? [
        { href: "/", label: "Explore" },
        { href: "/dashboard", label: "Dashboard" },
        ...(user.role === "entrepreneur" ? [{ href: "/campaigns/new", label: "Start a campaign" }] : []),
        ...(user.role === "admin" ? [{ href: "/admin", label: "Admin" }] : []),
        { href: "/wallet", label: "Wallet" },
        { href: "/analytics", label: "Analytics" },
      ]
    : [{ href: "/", label: "Explore" }];

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-head)] text-xl font-bold text-brand-dark">
          <Image src="/icon-192.png" alt="" width={32} height={32} className="size-8 rounded-lg" priority />FundStarter
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={`rounded-lg px-3 py-2 text-sm font-medium ${path === l.href ? "bg-brand-soft text-brand-dark" : "text-[#4b5a52] hover:bg-[#ece9e1]"}`}>{l.label}</Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Link href="/wallet" className="hidden rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold sm:block">{money(user.wallet_balance)}</Link>
              <Link href="/settings" className="grid size-9 place-items-center rounded-full bg-brand text-sm font-bold text-white" title={user.name}>{user.name.charAt(0).toUpperCase()}</Link>
              <button className="btn btn-ghost" onClick={() => { logout(); router.push("/"); }}>Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost">Sign in</Link>
              <Link href="/register" className="btn btn-primary">Get started</Link>
            </>
          )}
        </div>
      </div>
      <nav aria-label="Mobile" className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${path === l.href ? "bg-brand-soft text-brand-dark" : "text-[#4b5a52]"}`}>{l.label}</Link>
        ))}
      </nav>
    </header>
  );
}
