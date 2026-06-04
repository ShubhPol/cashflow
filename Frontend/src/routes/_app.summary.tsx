import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCurrency } from "@/lib/providers";
import { formatCurrency, pickAmount } from "@/lib/currency";
import { TRANSACTIONS, RECURRING, EXPENSE_META } from "@/lib/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

export const Route = createFileRoute("/_app/summary")({
  head: () => ({ meta: [{ title: "Monthly Summary · Flowcast" }] }),
  component: SummaryPage,
});

function SummaryPage() {
  const { currency } = useCurrency();
  const months = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return list;
  }, []);
  const [m, setM] = useState(months[0].key);

  const get = (t: (typeof TRANSACTIONS)[number]) =>
    pickAmount({ inr: t.amount_inr, usd: t.amount_usd, eur: t.amount_eur }, currency);

  const txns = useMemo(() => {
    const [y, mo] = m.split("-").map(Number);
    return TRANSACTIONS.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === mo;
    });
  }, [m]);

  const inflow = txns.filter((t) => t.type === "incoming").reduce((s, t) => s + get(t), 0);
  const outflow = txns.filter((t) => t.type === "outgoing").reduce((s, t) => s + get(t), 0);

  const byCat = useMemo(() => {
    const map = new Map<string, number>();
    txns
      .filter((t) => t.type === "outgoing" && t.expense_type)
      .forEach((t) => map.set(t.expense_type!, (map.get(t.expense_type!) || 0) + get(t)));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [txns, currency]);

  const recurringTotal = RECURRING.reduce(
    (s, r) => s + pickAmount({ inr: r.amount_inr, usd: r.amount_usd, eur: r.amount_eur }, currency),
    0,
  );
  const oneTime = Math.max(0, outflow - recurringTotal);
  const top5 = byCat.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Monthly summary</h1>
          <p className="text-sm text-muted-foreground">Where every rupee, dollar, or euro went.</p>
        </div>
        <Select value={m} onValueChange={setM}>
          <SelectTrigger className="w-[200px]" aria-label="Select month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((mm) => (
              <SelectItem key={mm.key} value={mm.key}>
                {mm.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="card-soft p-5">
        <h2 className="mb-4 font-display text-lg font-semibold">Inflow vs Outflow</h2>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart layout="vertical" data={[{ name: "Total", In: inflow, Out: outflow }]} margin={{ left: 30 }}>
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v, currency)} fontSize={11} />
            <YAxis dataKey="name" type="category" hide />
            <Tooltip formatter={(v: number) => formatCurrency(v, currency)} />
            <Bar dataKey="In" name="Inflow" fill="var(--color-primary)" radius={6} />
            <Bar dataKey="Out" name="Outflow" fill="var(--color-coral)" radius={6} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex gap-6 text-sm">
          <span><span className="inline-block size-2.5 rounded-sm bg-primary mr-2" />Inflow {formatCurrency(inflow, currency)}</span>
          <span><span className="inline-block size-2.5 rounded-sm bg-coral mr-2" />Outflow {formatCurrency(outflow, currency)}</span>
        </div>
      </div>

      <div className="card-soft p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">Outgoing by category</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={byCat} layout="vertical" margin={{ left: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis type="number" tickFormatter={(v) => formatCurrency(v, currency)} fontSize={11} />
            <YAxis dataKey="name" type="category" fontSize={12} width={110} />
            <Tooltip formatter={(v: number) => formatCurrency(v, currency)} />
            <Bar dataKey="value" radius={[0, 8, 8, 0]}>
              {byCat.map((_, i) => (
                <Cell key={i} fill={i === 0 ? "var(--color-coral)" : "var(--color-primary)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card-soft p-5">
          <h2 className="mb-4 font-display text-lg font-semibold">Recurring vs one-time</h2>
          <div className="flex h-6 overflow-hidden rounded-full">
            <div
              className="bg-primary"
              style={{ width: `${(recurringTotal / outflow) * 100 || 0}%` }}
              title="Recurring"
            />
            <div className="bg-accent" style={{ width: `${(oneTime / outflow) * 100 || 0}%` }} title="One-time" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-muted-foreground">Recurring</div>
              <div className="font-display text-xl font-semibold">{formatCurrency(recurringTotal, currency)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">One-time</div>
              <div className="font-display text-xl font-semibold">{formatCurrency(oneTime, currency)}</div>
            </div>
          </div>
        </div>

        <div className="card-soft p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">Top 5 categories</h2>
          <ul className="space-y-2">
            {top5.map((c) => {
              const pct = outflow ? ((c.value / outflow) * 100).toFixed(1) : "0";
              return (
                <li key={c.name} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
                  <span className="flex items-center gap-2">
                    <span>{EXPENSE_META[c.name as keyof typeof EXPENSE_META]?.icon}</span>
                    <span className="font-medium">{c.name}</span>
                    <span className="text-xs text-muted-foreground">{pct}%</span>
                  </span>
                  <span className="font-mono">{formatCurrency(c.value, currency)}</span>
                </li>
              );
            })}
            {top5.length === 0 && <li className="text-sm text-muted-foreground">No outgoing data this month.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
