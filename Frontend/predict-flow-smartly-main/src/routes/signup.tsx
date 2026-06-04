import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up · Flowcast" }] }),
  component: SignupPage,
});

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s; // 0..4
}

function SignupPage() {
  const { signup, isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [cpw, setCpw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (hydrated && isAuthenticated) router.navigate({ to: "/dashboard" });
  }, [hydrated, isAuthenticated, router]);

  const s = useMemo(() => strength(pw), [pw]);
  const strengthLabel = ["Too weak", "Weak", "Fair", "Strong", "Excellent"][s];
  const strengthColor = ["bg-coral", "bg-coral", "bg-accent", "bg-primary", "bg-success"][s];

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (pw.length < 6) return setErr("Password must be at least 6 characters.");
    if (pw !== cpw) return setErr("Passwords don't match.");
    setLoading(true);
    try {
      await signup(name, email, pw);
      toast.success("Account created!");
      router.navigate({ to: "/dashboard" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh place-items-center bg-background px-4 py-10">
      <div className="card-soft w-full max-w-sm p-8">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-4" />
          </span>
          Flowcast
        </Link>
        <h1 className="mt-6 font-display text-2xl font-semibold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">It's free. Cancel anytime.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="em">Email</Label>
            <Input id="em" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" required value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5" />
            {pw && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full ${i < s ? strengthColor : "bg-secondary"}`} />
                  ))}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{strengthLabel}</div>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="cpw">Confirm password</Label>
            <Input id="cpw" type="password" required value={cpw} onChange={(e) => setCpw(e.target.value)} className="mt-1.5" />
          </div>
          {err && <div className="rounded-lg bg-coral/15 px-3 py-2 text-sm text-coral">{err}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
