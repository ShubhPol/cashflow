import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Currency } from "./currency";

type User = { id: string; name: string; email: string; currency: Currency };

type AuthCtx = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  hydrated: boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);
const CurrencyContext = createContext<{
  currency: Currency;
  setCurrency: (c: Currency) => void;
} | null>(null);

const KEY = "cfp:user";

export function AppProviders({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>("INR");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const u = JSON.parse(raw) as User;
        setUser(u);
        setCurrencyState(u.currency || "INR");
      }
    } catch {}
    setHydrated(true);
  }, []);

  const persist = (u: User | null) => {
    setUser(u);
    if (u) localStorage.setItem(KEY, JSON.stringify(u));
    else localStorage.removeItem(KEY);
  };

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!email || password.length < 6) throw new Error("Invalid email or password.");
    const stored = localStorage.getItem("cfp:users:" + email);
    if (!stored) throw new Error("No account found for this email.");
    const parsed = JSON.parse(stored) as { password: string; user: User };
    if (parsed.password !== password) throw new Error("Wrong email or password.");
    const u = { ...parsed.user, currency: parsed.user.currency || "INR" };
    persist(u);
    setCurrencyState(u.currency);
  };

  const signup = async (name: string, email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 400));
    const u: User = { id: crypto.randomUUID(), name, email, currency: "INR" };
    localStorage.setItem("cfp:users:" + email, JSON.stringify({ password, user: u }));
    persist(u);
    setCurrencyState("INR");
  };

  const logout = () => {
    persist(null);
  };

  const updateUser = (patch: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...patch };
    persist(next);
    if (patch.currency) setCurrencyState(patch.currency);
    // also update stored credential record
    const stored = localStorage.getItem("cfp:users:" + next.email);
    if (stored) {
      const p = JSON.parse(stored);
      localStorage.setItem("cfp:users:" + next.email, JSON.stringify({ ...p, user: next }));
    }
  };

  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (user) updateUser({ currency: c });
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, signup, logout, updateUser, hydrated }}
    >
      <CurrencyContext.Provider value={{ currency, setCurrency }}>
        {children}
      </CurrencyContext.Provider>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency outside provider");
  return ctx;
}
