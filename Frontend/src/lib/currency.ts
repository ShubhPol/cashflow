export type Currency = "INR" | "USD" | "EUR";

export const CURRENCIES: Record<Currency, { symbol: string; flag: string; label: string }> = {
  INR: { symbol: "₹", flag: "🇮🇳", label: "Indian Rupee" },
  USD: { symbol: "$", flag: "🇺🇸", label: "US Dollar" },
  EUR: { symbol: "€", flag: "🇪🇺", label: "Euro" },
};

export const RATES = { USD_TO_INR: 83.5, EUR_TO_INR: 90.0, EUR_TO_USD: 1.08 };

export function formatCurrency(value: number, currency: Currency): string {
  const symbol = CURRENCIES[currency].symbol;
  const negative = value < 0;
  const abs = Math.abs(value);
  let body: string;
  if (currency === "INR") {
    // Indian numbering
    const fixed = abs.toFixed(0);
    const lastThree = fixed.slice(-3);
    const rest = fixed.slice(0, -3);
    body = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree : lastThree;
  } else {
    body = abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return `${negative ? "-" : ""}${symbol}${body}`;
}

export function pickAmount(
  amounts: { inr: number; usd: number; eur: number },
  currency: Currency,
): number {
  if (currency === "INR") return amounts.inr;
  if (currency === "USD") return amounts.usd;
  return amounts.eur;
}
