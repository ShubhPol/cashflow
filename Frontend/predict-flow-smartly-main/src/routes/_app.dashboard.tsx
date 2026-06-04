import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCurrency } from "@/lib/providers";
import { formatCurrency, pickAmount } from "@/lib/currency";
import { TRANSACTIONS, ALERTS, EXPENSE_META, generateForecast } from "@/lib/mockData";
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
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Sparkles, AlertTriangle, Bell } from "lucide-react";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard · Flowcast" }] }),
  component: DashboardPage,
});

function monthLabel(d: Date) {
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function DashboardPage() {
  const { currency } = useCurrency();
  const months = useMemo(() => {
    const list: { key: string; label: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      list.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d) });
    }
    return list;
  }, []);
  const [selectedMonth, setSelectedMonth] = useState(months[0].key);

  const monthlyTxns = useMemo(() => {
    const [y, m] = selectedMonth.split("-").map(Number);
    return TRANSACTIONS.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === y && d.getMonth() === m;
    });
  }, [selectedMonth]);

  const get = (t: (typeof TRANSACTIONS)[number]) =>
    pickAmount({ inr: t.amount_inr, usd: t.amount_usd, eur: t.amount_eur }, currency);

  const inflow = monthlyTxns.filter((t) => t.type === "incoming").reduce((s, t) => s + get(t), 0);
  const outflow = monthlyTxns.filter((t) => t.type === "outgoing").reduce((s, t) => s + get(t), 0);
  const net = inflow - outflow;
  const savingsRate = inflow > 0 ? (net / inflow) * 100 : 0;
  const predictedBalance = useMemo(() => {
    const f = generateForecast();
    return f.predicted[29] / (currency === "INR" ? 1 : currency === "USD" ? 83.5 : 90);
  }, [currency]);

  // Weeks
  const weeks = useMemo(() => {
    const buckets = [
      { w: "Week 1", In: 0, Out: 0 },
      { w: "Week 2", In: 0, Out: 0 },
      { w: "Week 3", In: 0, Out: 0 },
      { w: "Week 4", In: 0, Out: 0 },
      { w: "Week 5", In: 0, Out: 0 },
    ];
    monthlyTxns.forEach((t) => {
      const day = new Date(t.date).getDate();
      const idx = Math.min(4, Math.floor((day - 1) / 7));
      if (t.type === "incoming") buckets[idx].In += get(t);
      else buckets[idx].Out += get(t);
    });
    return buckets.filter((b) => b.In || b.Out);
  }, [monthlyTxns, currency]);

  const breakdown = useMemo(() => {
    const map = new Map<string, number>();
    monthlyTxns
      .filter((t) => t.type === "outgoing" && t.expense_type)
      .forEach((t) => map.set(t.expense_type!, (map.get(t.expense_type!) || 0) + get(t)));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [monthlyTxns, currency]);

  const donutColors = [
    "var(--color-primary)",
    "var(--color-accent)",
    "var(--color-coral)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "#a78bfa",
    "#fb923c",
    "#34d399",
    "#60a5fa",
    "#f472b6",
    "#94a3b8",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold">Your cash flow</h1>
          <p className="text-sm text-muted-foreground">A snapshot of inflow, outflow, and what's coming next.</p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[200px]" aria-label="Select month">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.key} value={m.key}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Kpi label="Total Inflow" value={formatCurrency(inflow, currency)} Icon={TrendingUp} tone="primary" />
        <Kpi label="Total Outflow" value={formatCurrency(outflow, currency)} Icon={TrendingDown} tone="coral" />
        <Kpi
          label="Net Cash Flow"
          value={formatCurrency(net, currency)}
          Icon={Wallet}
          tone={net >= 0 ? "success" : "coral"}
        />
        <Kpi label="Savings Rate" value={`${savingsRate.toFixed(1)}%`} Icon={PiggyBank} tone="accent" />
        <Kpi
          label="Predicted (30d)"
          value={formatCurrency(predictedBalance, currency)}
          Icon={Sparkles}
          tone="primary"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card-soft p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Inflow vs Outflow</h2>
            <span className="text-xs text-muted-foreground">Weekly · {monthLabel(new Date(...(selectedMonth.split("-").map(Number) as [number, number]), 1))}</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeks}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="w" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => formatCurrency(v, currency)} width={80} />
              <Tooltip
                formatter={(v: number) => formatCurrency(v, currency)}
                contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
              />
              <Legend />
              <Bar dataKey="In" name="Inflow" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Out" name="Outflow" fill="var(--color-coral)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-soft p-5">
          <h2 className="mb-3 font-display text-lg font-semibold">Outflow Breakdown</h2>
          {breakdown.length === 0 ? (
            <div className="grid h-[280px] place-items-center text-sm text-muted-foreground">No outflow this month.</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={breakdown} dataKey="value" innerRadius={55} outerRadius={95} paddingAngle={2}>
                  {breakdown.map((_, i) => (
                    <Cell key={i} fill={donutColors[i % donutColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v, currency)} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-3 grid grid-cols-2 gap-1.5 text-xs">
            {breakdown.slice(0, 6).map((b, i) => (
              <div key={b.name} className="flex items-center gap-2">
                <span className="size-2.5 rounded-sm" style={{ background: donutColors[i % donutColors.length] }} />
                <span>{EXPENSE_META[b.name as keyof typeof EXPENSE_META]?.icon} {b.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-soft p-5">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="size-4 text-coral" />
          <h2 className="font-display text-lg font-semibold">Alerts</h2>
        </div>
        <ul className="space-y-2">
          {ALERTS.map((a) => (
            <li
              key={a.id}
              className={`flex items-start gap-3 rounded-xl p-3 ${
                a.severity === "high"
                  ? "bg-coral/10"
                  : a.severity === "medium"
                  ? "bg-accent/15"
                  : "bg-secondary"
              }`}
            >
              <AlertTriangle className={`mt-0.5 size-4 ${a.severity === "high" ? "text-coral" : a.severity === "medium" ? "text-accent-foreground" : "text-muted-foreground"}`} />
              <div className="text-sm">{a.message}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  Icon,
  tone,
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "coral" | "accent" | "success";
}) {
  const toneClass = {
    primary: "text-primary bg-primary/10",
    coral: "text-coral bg-coral/10",
    accent: "text-accent-foreground bg-accent/20",
    success: "text-success bg-success/10",
  }[tone];
  return (
    <div className="card-soft p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={`grid size-8 place-items-center rounded-lg ${toneClass}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className={`mt-2 font-display text-2xl font-semibold ${tone === "coral" ? "text-coral" : tone === "success" ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}
