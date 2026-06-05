import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useCurrency } from "@/lib/providers";
import { formatCurrency, RATES } from "@/lib/currency";
import { generateForecast } from "@/lib/mockData";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_app/forecast")({
  head: () => ({ meta: [{ title: "Forecast · Flowcast" }] }),
  component: ForecastPage,
});

const base = generateForecast();

function ForecastPage() {
  const { currency } = useCurrency();
  const [incomeChange, setIncomeChange] = useState(0);
  const [expenseReduction, setExpenseReduction] = useState(0);
  const [oneTime, setOneTime] = useState(0);

  const conv = currency === "INR" ? 1 : currency === "USD" ? 1 / RATES.USD_TO_INR : 1 / RATES.EUR_TO_INR;

  const data = useMemo(() => {
    const incomeFactor = 1 + incomeChange / 100;
    const expenseFactor = 1 - expenseReduction / 100;
    return base.dates.map((d, i) => {
      const drift = (incomeFactor - 1) * 5000 * i + (expenseFactor - 1) * 3000 * i;
      const offset = i === 0 ? -oneTime : 0;
      const predicted = (base.predicted[i] + drift + offset) * conv;
      const lower = (base.lower[i] + drift + offset) * conv;
      const upper = (base.upper[i] + drift + offset) * conv;
      return { d, predicted, lower, upper, band: [lower, upper] as [number, number] };
    });
  }, [incomeChange, expenseReduction, oneTime, conv]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">90-day forecast</h1>
        <p className="text-sm text-muted-foreground">Drag the sliders to see how your future balance shifts.</p>
      </div>

      <div className="card-soft p-5">
        <ResponsiveContainer width="100%" height={360}>
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="band" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="d"
              tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              minTickGap={40}
              fontSize={11}
            />
            <YAxis tickFormatter={(v) => formatCurrency(v, currency)} width={90} fontSize={11} />
            <Tooltip
              formatter={(v: number) => formatCurrency(v, currency)}
              labelFormatter={(l) => new Date(l).toLocaleDateString()}
              contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }}
            />
            <Area type="monotone" dataKey="band" stroke="none" fill="url(#band)" />
            <Line type="monotone" dataKey="predicted" stroke="var(--color-primary)" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="card-soft p-5">
        <h2 className="mb-5 font-display text-lg font-semibold">Scenario builder</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <div className="flex justify-between text-sm">
              <Label>Income change</Label>
              <span className="font-mono text-muted-foreground">{incomeChange > 0 ? "+" : ""}{incomeChange}%</span>
            </div>
            <Slider value={[incomeChange]} min={-30} max={50} step={1} onValueChange={(v) => setIncomeChange(v[0])} className="mt-3" />
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <Label>Expense reduction</Label>
              <span className="font-mono text-muted-foreground">−{expenseReduction}%</span>
            </div>
            <Slider value={[expenseReduction]} min={0} max={50} step={1} onValueChange={(v) => setExpenseReduction(v[0])} className="mt-3" />
          </div>
          <div>
            <Label htmlFor="ot">One-time expense ({currency})</Label>
            <Input
              id="ot"
              type="number"
              min={0}
              value={oneTime}
              onChange={(e) => setOneTime(Math.max(0, Number(e.target.value) || 0))}
              className="mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
