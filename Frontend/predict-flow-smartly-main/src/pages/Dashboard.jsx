import { useEffect, useState } from "react";
import {
  getDashboardSummary,
  getWeeklyFlow,
  getCategoryBreakdown,
} from "../api/cashflow";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#1D9E75","#D85A30","#0F6E56","#BA7517","#534AB7","#9FE1CB"];

const fmt = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const [summary,  setSummary]  = useState(null);
  const [weekly,   setWeekly]   = useState([]);
  const [category, setCategory] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [r1, r2, r3] = await Promise.all([
        getDashboardSummary(),
        getWeeklyFlow(),
        getCategoryBreakdown(),
      ]);
      setSummary(r1.data);
      setWeekly(r2.data);
      setCategory(r3.data);
    } catch (err) {
      setError("Could not reach the backend. Is FastAPI running?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p style={{ padding: "2rem", color: "#888" }}>Loading dashboard…</p>;
  if (error)   return <p style={{ padding: "2rem", color: "#D85A30" }}>{error}</p>;

  const kpis = [
    { label: "Total Inflow",    value: fmt(summary.total_inflow),   color: "#1D9E75" },
    { label: "Total Outflow",   value: fmt(summary.total_outflow),  color: "#D85A30" },
    { label: "Net Cash Flow",   value: fmt(summary.net_cashflow),   color: "#1D9E75" },
    { label: "Savings Rate",    value: `${summary.savings_rate}%`,  color: "#BA7517" },
    { label: "Predicted (30d)", value: fmt(summary.predicted_30d),  color: "#185FA5" },
  ];

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Your cash flow</h1>
          <p style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
            A snapshot of inflow, outflow, and what's coming next.
          </p>
        </div>
        <button onClick={loadAll} style={{ fontSize: 13, padding: "6px 14px", borderRadius: 6, border: "1px solid #ddd", cursor: "pointer" }}>
          ↻ Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: "1.5rem" }}>
        {kpis.map((k) => (
          <div key={k.label} style={{ background: "#f7f7f5", borderRadius: 10, padding: "14px 16px", borderLeft: `3px solid ${k.color}` }}>
            <p style={{ fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 6px" }}>{k.label}</p>
            <p style={{ fontSize: 20, fontWeight: 600, color: k.color, margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: "1.5rem" }}>

        {/* Bar Chart */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 20px" }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Inflow vs Outflow</p>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 16px" }}>Weekly · current month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekly} barCategoryGap="30%">
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 100000 ? `${(v/100000).toFixed(1)}L` : `${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="inflow"  fill="#1D9E75" radius={[4,4,0,0]} name="Inflow" />
              <Bar dataKey="outflow" fill="#D85A30" radius={[4,4,0,0]} name="Outflow" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 12, padding: "16px 20px" }}>
          <p style={{ fontWeight: 600, fontSize: 14, margin: "0 0 4px" }}>Outflow breakdown</p>
          <p style={{ fontSize: 11, color: "#888", margin: "0 0 8px" }}>By category</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={category} dataKey="value" nameKey="category" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
                {category.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
}