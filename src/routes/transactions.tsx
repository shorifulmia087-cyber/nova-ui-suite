import { createFileRoute } from "@tanstack/react-router";
import { ScreenHeader } from "@/components/mobile/ScreenHeader";
import { Card } from "@/components/mobile/Primitives";
import { transactions, type Tx } from "@/lib/mock";
import { ArrowDownToLine, ArrowUpFromLine, ListChecks, Gift, Sparkles, Search } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transaction history — Ness" }] }),
  component: TxList,
});

const filters = ["All", "Earn", "Deposit", "Withdraw", "Task", "Referral"] as const;

function TxList() {
  const [f, setF] = useState<(typeof filters)[number]>("All");
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    return transactions.filter((t) => {
      const matchF = f === "All" || t.category.toLowerCase() === f.toLowerCase();
      const matchQ = !q || t.title.toLowerCase().includes(q.toLowerCase());
      return matchF && matchQ;
    });
  }, [f, q]);

  return (
    <div>
      <ScreenHeader title="Transactions" subtitle={`${list.length} activities`} />

      <div className="px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search activity"
            className="text-input w-full h-11 pl-9 pr-3 rounded-md bg-card border border-border outline-none focus:border-[color:var(--accent)]"
          />
        </div>
      </div>

      <div className="px-5 mt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={`text-label shrink-0 h-9 px-3.5 rounded-full transition ৳{f === x ? "bg-gradient-brand text-primary-foreground shadow-glow" : "bg-card border border-border text-muted-foreground hover:text-foreground"}`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 space-y-2">
        {list.map((t) => <Row key={t.id} tx={t} />)}
        {!list.length && (
          <Card className="p-8 text-center text-body-secondary">No transactions found.</Card>
        )}
      </div>
    </div>
  );
}

const colors: Record<Tx["category"], string> = {
  earn: "bg-[color:var(--success)]/12 text-[color:var(--success)]",
  deposit: "bg-[color:var(--accent)]/15 text-[color:var(--accent)]",
  withdraw: "bg-destructive/12 text-destructive",
  task: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
  referral: "bg-primary/10 text-primary",
};
const Icons = { earn: Sparkles, deposit: ArrowDownToLine, withdraw: ArrowUpFromLine, task: ListChecks, referral: Gift } as const;

function Row({ tx }: { tx: Tx }) {
  const Icon = Icons[tx.category];
  const statusTone =
    tx.status === "completed" ? "text-[color:var(--success)]" :
    tx.status === "pending"   ? "text-[color:var(--warning)]" :
                                "text-destructive";
  return (
    <Card className="p-3 flex items-center gap-3">
      <div className={`h-10 w-10 rounded-md flex items-center justify-center ৳{colors[tx.category]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-label truncate">{tx.title}</p>
        <p className="text-caption">
          {tx.date} · <span className={`${statusTone}`}>{tx.status}</span>
        </p>
      </div>
      <p className={`text-label ৳{tx.amount >= 0 ? "text-[color:var(--success)]" : "text-destructive"}`}>
        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
      </p>
    </Card>
  );
}
