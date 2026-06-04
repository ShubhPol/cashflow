import { RATES } from "./currency";

export type ExpenseType =
  | "Housing"
  | "Groceries"
  | "Transport"
  | "Dining"
  | "Health"
  | "Utilities"
  | "Entertainment"
  | "Investments"
  | "EMI"
  | "Shopping"
  | "Others";

export const EXPENSE_META: Record<ExpenseType, { icon: string }> = {
  Housing: { icon: "🏠" },
  Groceries: { icon: "🛒" },
  Transport: { icon: "🚗" },
  Dining: { icon: "🍽️" },
  Health: { icon: "💊" },
  Utilities: { icon: "📱" },
  Entertainment: { icon: "🎬" },
  Investments: { icon: "📈" },
  EMI: { icon: "🏦" },
  Shopping: { icon: "🎁" },
  Others: { icon: "📦" },
};

export type Txn = {
  id: string;
  date: string;
  description: string;
  type: "incoming" | "outgoing";
  expense_type?: ExpenseType;
  amount_inr: number;
  amount_usd: number;
  amount_eur: number;
  channel: string;
};

function amt(inr: number): Pick<Txn, "amount_inr" | "amount_usd" | "amount_eur"> {
  return {
    amount_inr: inr,
    amount_usd: +(inr / RATES.USD_TO_INR).toFixed(2),
    amount_eur: +(inr / RATES.EUR_TO_INR).toFixed(2),
  };
}

const today = new Date();
const d = (offset: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() - offset);
  return x.toISOString().slice(0, 10);
};

export const TRANSACTIONS: Txn[] = [
  { id: "1", date: d(1), description: "Salary Credit - Acme Corp", type: "incoming", channel: "Bank Transfer", ...amt(150000) },
  { id: "2", date: d(2), description: "Rent Payment - Landlord", type: "outgoing", expense_type: "Housing", channel: "NEFT", ...amt(35000) },
  { id: "3", date: d(2), description: "SIP - Axis Bluechip", type: "outgoing", expense_type: "Investments", channel: "Auto Debit", ...amt(10000) },
  { id: "4", date: d(3), description: "Swiggy Order", type: "outgoing", expense_type: "Dining", channel: "UPI", ...amt(480) },
  { id: "5", date: d(3), description: "Petrol - HP", type: "outgoing", expense_type: "Transport", channel: "Card", ...amt(2200) },
  { id: "6", date: d(4), description: "Netflix Subscription", type: "outgoing", expense_type: "Entertainment", channel: "Card", ...amt(649) },
  { id: "7", date: d(5), description: "BigBasket Groceries", type: "outgoing", expense_type: "Groceries", channel: "UPI", ...amt(3450) },
  { id: "8", date: d(5), description: "Electricity Bill - BESCOM", type: "outgoing", expense_type: "Utilities", channel: "Auto Debit", ...amt(2800) },
  { id: "9", date: d(6), description: "UPI Received - Friend", type: "incoming", channel: "UPI", ...amt(2500) },
  { id: "10", date: d(7), description: "HDFC Credit Card EMI", type: "outgoing", expense_type: "EMI", channel: "Auto Debit", ...amt(8500) },
  { id: "11", date: d(8), description: "Zomato", type: "outgoing", expense_type: "Dining", channel: "UPI", ...amt(620) },
  { id: "12", date: d(9), description: "Amazon - Headphones", type: "outgoing", expense_type: "Shopping", channel: "Card", ...amt(4999) },
  { id: "13", date: d(10), description: "Uber Ride", type: "outgoing", expense_type: "Transport", channel: "UPI", ...amt(280) },
  { id: "14", date: d(11), description: "Apollo Pharmacy", type: "outgoing", expense_type: "Health", channel: "Card", ...amt(1240) },
  { id: "15", date: d(12), description: "Interest Credited", type: "incoming", channel: "Bank Credit", ...amt(820) },
  { id: "16", date: d(13), description: "Mobile Recharge - Jio", type: "outgoing", expense_type: "Utilities", channel: "UPI", ...amt(399) },
  { id: "17", date: d(14), description: "Blinkit Quick Order", type: "outgoing", expense_type: "Groceries", channel: "UPI", ...amt(890) },
  { id: "18", date: d(15), description: "Hotstar Subscription", type: "outgoing", expense_type: "Entertainment", channel: "Card", ...amt(299) },
  { id: "19", date: d(16), description: "Refund - Flipkart", type: "incoming", channel: "Card Refund", ...amt(1599) },
  { id: "20", date: d(17), description: "Swiggy", type: "outgoing", expense_type: "Dining", channel: "UPI", ...amt(560) },
  { id: "21", date: d(18), description: "Ola Cab", type: "outgoing", expense_type: "Transport", channel: "UPI", ...amt(340) },
  { id: "22", date: d(19), description: "LIC Premium", type: "outgoing", expense_type: "Investments", channel: "Auto Debit", ...amt(6500) },
  { id: "23", date: d(20), description: "Maintenance - Society", type: "outgoing", expense_type: "Housing", channel: "NEFT", ...amt(3200) },
  { id: "24", date: d(21), description: "Internet Bill - ACT", type: "outgoing", expense_type: "Utilities", channel: "Auto Debit", ...amt(1199) },
  { id: "25", date: d(22), description: "Myntra Sale", type: "outgoing", expense_type: "Shopping", channel: "Card", ...amt(2799) },
  { id: "26", date: d(23), description: "Movie - PVR", type: "outgoing", expense_type: "Entertainment", channel: "Card", ...amt(900) },
  { id: "27", date: d(24), description: "Doctor Consultation", type: "outgoing", expense_type: "Health", channel: "UPI", ...amt(800) },
  { id: "28", date: d(25), description: "Freelance Payment", type: "incoming", channel: "Bank Transfer", ...amt(22000) },
  { id: "29", date: d(26), description: "Metro Recharge", type: "outgoing", expense_type: "Transport", channel: "UPI", ...amt(500) },
  { id: "30", date: d(27), description: "Restaurant - Truffles", type: "outgoing", expense_type: "Dining", channel: "Card", ...amt(1850) },
];

export const RECURRING = [
  { name: "Rent", expense_type: "Housing" as ExpenseType, ...amt(35000) },
  { name: "SIP - Axis Bluechip", expense_type: "Investments" as ExpenseType, ...amt(10000) },
  { name: "Netflix", expense_type: "Entertainment" as ExpenseType, ...amt(649) },
  { name: "Hotstar", expense_type: "Entertainment" as ExpenseType, ...amt(299) },
  { name: "Electricity Bill", expense_type: "Utilities" as ExpenseType, ...amt(2800) },
  { name: "Internet Bill", expense_type: "Utilities" as ExpenseType, ...amt(1199) },
  { name: "LIC Premium", expense_type: "Investments" as ExpenseType, ...amt(6500) },
  { name: "Credit Card EMI", expense_type: "EMI" as ExpenseType, ...amt(8500) },
];

export const ALERTS = [
  { id: "a1", type: "low_balance", message: "Predicted balance may dip below ₹10,000 by end of next month.", severity: "high" },
  { id: "a2", type: "recurring", message: "Netflix charge detected for the 6th consecutive month.", severity: "info" },
  { id: "a3", type: "overspend", message: "Dining expenses up 32% vs last month.", severity: "medium" },
  { id: "a4", type: "recurring", message: "New recurring charge spotted: Hotstar ₹299.", severity: "info" },
];

export const RECOMMENDATIONS = [
  { id: "r1", text: "Switch Netflix to annual plan to save ~17%.", category: "Entertainment", ...amt(110) },
  { id: "r2", text: "Cooking 2 more meals/week can cut dining spend.", category: "Dining", ...amt(2400) },
  { id: "r3", text: "Refinance your credit card EMI at lower APR.", category: "EMI", ...amt(1200) },
  { id: "r4", text: "Bundle internet + mobile for a combined discount.", category: "Utilities", ...amt(300) },
  { id: "r5", text: "Use metro pass instead of cabs for daily commute.", category: "Transport", ...amt(1500) },
  { id: "r6", text: "Increase SIP by 5% — your savings rate supports it.", category: "Investments", ...amt(500) },
];

export function generateForecast() {
  const start = new Date();
  const dates: string[] = [];
  const predicted: number[] = [];
  const lower: number[] = [];
  const upper: number[] = [];
  let balance = 125000;
  for (let i = 0; i < 90; i++) {
    const x = new Date(start);
    x.setDate(x.getDate() + i);
    dates.push(x.toISOString().slice(0, 10));
    const trend = Math.sin(i / 8) * 4000 + i * 250;
    balance += (Math.random() - 0.45) * 2500 + 200;
    const v = balance + trend;
    predicted.push(Math.round(v));
    lower.push(Math.round(v - 8000 - i * 80));
    upper.push(Math.round(v + 8000 + i * 80));
  }
  return { dates, predicted, lower, upper };
}
