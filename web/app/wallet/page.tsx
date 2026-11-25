"use client";
import { useCallback, useEffect, useState } from "react";
import { api, money, when } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Empty, Notice, useGuard } from "@/components/ui";

type Tx = { id: number; transaction_type: string; amount: number; balance_after: number; description?: string; timestamp: string };

export default function Wallet() {
  const { ready, user } = useGuard();
  const { refresh } = useAuth();
  const [txs, setTxs] = useState<Tx[] | null>(null);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const r = await api<{ transactions: Tx[] }>(`/wallet/${user.id}`);
    setTxs(r.transactions);
  }, [user]);
  useEffect(() => { if (ready) void load().catch((e) => setMsg({ kind: "error", text: e.message })); }, [ready, load]);

  if (!ready || !user) return null;
  async function add(e: React.FormEvent) {
    e.preventDefault(); setMsg(null);
    try {
      await api(`/wallet/${user!.id}/add-funds`, { body: { amount: Number(amount) } });
      setAmount(""); setMsg({ kind: "ok", text: "Funds added." }); await Promise.all([load(), refresh()]);
    } catch (err) { setMsg({ kind: "error", text: err instanceof Error ? err.message : "Could not add funds" }); }
  }

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold">Wallet</h1>
      <div className="grid gap-4 md:grid-cols-[1fr_1.4fr]">
        <div className="card grid content-start gap-4 p-5">
          <div><p className="text-sm text-muted">Available balance</p><p className="text-4xl font-bold">{money(user.wallet_balance)}</p></div>
          <form onSubmit={add} className="grid gap-2">
            <label className="label" htmlFor="amt">Add funds</label>
            <div className="flex gap-2"><input id="amt" className="input" type="number" min={1} step="1" required value={amount} onChange={(e) => setAmount(e.target.value)} /><button className="btn btn-primary">Add</button></div>
            {msg && <Notice kind={msg.kind}>{msg.text}</Notice>}
          </form>
        </div>
        <div className="card">
          <h2 className="border-b border-line p-4 font-bold">History</h2>
          {!txs ? <div className="h-32 animate-pulse bg-[#efece4]" /> : txs.length === 0 ? <div className="p-4"><Empty art="cf-empty-activity" title="Nothing here yet" text="Pledges, refunds and deposits appear here." /></div> : (
            <ul className="divide-y divide-line">{txs.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div><b className="capitalize">{t.transaction_type}</b><p className="text-xs text-muted">{t.description || "Wallet activity"} · {when(t.timestamp)}</p></div>
                <div className="text-right"><b className={t.transaction_type === "debit" ? "text-red-700" : "text-brand-dark"}>{t.transaction_type === "debit" ? "-" : "+"}{money(t.amount)}</b><p className="text-xs text-muted">Balance {money(t.balance_after)}</p></div>
              </li>))}</ul>
          )}
        </div>
      </div>
    </div>
  );
}
