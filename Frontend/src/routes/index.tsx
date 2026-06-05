import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Upload,
  Sparkles,
  TrendingUp,
  Bell,
  PieChart,
  LineChart,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  ResponsiveContainer,
  PieChart as RPie,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Flowcast — Know your money before it moves" },
      {
        name: "description",
        content:
          "Personal cash flow predictor. Upload transactions, see weekly inflow vs outflow, forecast 90 days ahead, and get savings tips.",
      },
      { property: "og:title", content: "Flowcast — Personal Cash Flow Predictor" },
      {
        property: "og:description",
        content: "Forecast your cash flow and spot leaks before they happen.",
      },
    ],
  }),
  component: Landing,
});

const heroBars = [
  { w: "W1", In: 42, Out: 28 },
  { w: "W2", In: 38, Out: 31 },
  { w: "W3", In: 45, Out: 22 },
  { w: "W4", In: 40, Out: 35 },
];
const donut = [
  { name: "Housing", v: 35 },
  { name: "Food", v: 22 },
  { name: "Transport", v: 14 },
  { name: "Other", v: 29 },
];
const donutColors = [
  "var(--color-primary)",
  "var(--color-accent)",
  "var(--color-coral)",
  "var(--color-chart-5)",
];

function Landing() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Activity className="size-4" />
          </span>
          Flowcast
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/login">Log in</Link>
          </Button>
          <Button asChild>
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pt-10 pb-20 lg:grid-cols-2 lg:items-center lg:pt-16">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-accent-foreground">
            <Sparkles className="size-3.5" /> AI-powered cash forecasting
          </span>
          <h1 className="mt-5 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Know your money <br />
            <span className="text-primary">before it moves.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-muted-foreground">
            Upload your statement, let Flowcast classify every rupee, and see exactly where you'll
            stand 30, 60, and 90 days from today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild className="rounded-full">
              <Link to="/signup">
                Get Started Free <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full">
              <Link to="/login">I have an account</Link>
            </Button>
          </div>
        </div>

        {/* Hero mini-dashboard */}
        <div className="card-soft p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Predicted balance · Sep 30</div>
              <div className="mt-1 font-display text-3xl font-semibold">₹1,42,860</div>
            </div>
            <span className="rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
              +12.4%
            </span>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 text-xs">
            {[
              { label: "Inflow", v: "₹1,72,500", c: "text-primary" },
              { label: "Outflow", v: "₹84,210", c: "text-coral" },
              { label: "Savings", v: "51%", c: "text-success" },
            ].map((k) => (
              <div key={k.label} className="rounded-xl bg-secondary/60 p-3">
                <div className="text-muted-foreground">{k.label}</div>
                <div className={`mt-1 font-semibold ${k.c}`}>{k.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-[1.4fr_1fr]">
            <div className="rounded-xl bg-secondary/40 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Inflow vs Outflow</div>
              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={heroBars}>
                  <XAxis dataKey="w" tickLine={false} axisLine={false} fontSize={10} />
                  <Bar dataKey="In" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Out" fill="var(--color-coral)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl bg-secondary/40 p-3">
              <div className="mb-1 text-xs text-muted-foreground">Where it goes</div>
              <ResponsiveContainer width="100%" height={120}>
                <RPie>
                  <Pie data={donut} dataKey="v" innerRadius={28} outerRadius={48} paddingAngle={3}>
                    {donut.map((_, i) => (
                      <Cell key={i} fill={donutColors[i]} />
                    ))}
                  </Pie>
                </RPie>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="card-soft grid gap-6 p-6 sm:grid-cols-3 sm:p-8">
          {[
            { n: "01", t: "Upload Transactions", d: "Drop a CSV, Excel, or PDF statement.", Icon: Upload },
            { n: "02", t: "Detect Patterns", d: "We classify and find recurring charges.", Icon: Sparkles },
            { n: "03", t: "Predict & Plan", d: "See your next 90 days and where to save.", Icon: TrendingUp },
          ].map(({ n, t, d, Icon }) => (
            <div key={n} className="flex gap-4">
              <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground">{n}</div>
                <div className="font-display text-lg font-semibold">{t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <h2 className="font-display text-3xl font-semibold">Built to be useful from day one.</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Cash Flow Visualization", d: "Weekly bars, monthly trends, category donuts.", Icon: PieChart },
            { t: "AI Forecasting", d: "90-day prediction with confidence bands.", Icon: LineChart },
            { t: "Savings Tips", d: "Personalized recommendations with rupee impact.", Icon: Sparkles },
            { t: "Low Balance Alerts", d: "Get warned before you go red.", Icon: Bell },
          ].map(({ t, d, Icon }) => (
            <div key={t} className="card-soft p-5">
              <div className="grid size-10 place-items-center rounded-xl bg-accent/20 text-accent-foreground">
                <Icon className="size-5" />
              </div>
              <div className="mt-4 font-display text-base font-semibold">{t}</div>
              <div className="mt-1 text-sm text-muted-foreground">{d}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <Button size="lg" asChild className="rounded-full">
            <Link to="/signup">
              Get Started Free <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Flowcast · Built for clearer money decisions.
      </footer>
    </div>
  );
}
