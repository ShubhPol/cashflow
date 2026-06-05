import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/providers";
import { CurrencySelect } from "@/components/CurrencySelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Flowcast" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  const [notifLow, setNotifLow] = useState(true);
  const [notifRecurring, setNotifRecurring] = useState(true);
  const [notifWeekly, setNotifWeekly] = useState(false);
  const [pw, setPw] = useState("");
  const [name, setName] = useState(user?.name || "");

  const accounts = [
    { id: "1", name: "HDFC Bank — Savings", connected: true },
    { id: "2", name: "ICICI Credit Card", connected: true },
    { id: "3", name: "Zerodha Investments", connected: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">Preferences, accounts, and security.</p>
      </div>

      <section className="card-soft p-6">
        <h2 className="font-display text-lg font-semibold">Profile</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="nm">Full name</Label>
            <Input id="nm" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="em">Email</Label>
            <Input id="em" value={user?.email || ""} disabled className="mt-1.5" />
          </div>
        </div>
        <div className="mt-4">
          <Button
            onClick={() => {
              updateUser({ name });
              toast.success("Profile saved");
            }}
          >
            Save changes
          </Button>
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="font-display text-lg font-semibold">Currency</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Updates instantly across the whole app and saves to your profile.
        </p>
        <div className="mt-4 max-w-xs">
          <CurrencySelect className="h-10" />
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="font-display text-lg font-semibold">Notifications</h2>
        <div className="mt-4 space-y-4">
          <Row label="Low balance alerts" desc="When predicted balance dips below threshold" checked={notifLow} onChange={setNotifLow} />
          <Separator />
          <Row label="Recurring charges" desc="New recurring subscription detected" checked={notifRecurring} onChange={setNotifRecurring} />
          <Separator />
          <Row label="Weekly summary email" desc="Every Monday morning" checked={notifWeekly} onChange={setNotifWeekly} />
        </div>
      </section>

      <section className="card-soft p-6">
        <h2 className="font-display text-lg font-semibold">Connected accounts</h2>
        <ul className="mt-4 space-y-2">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className={`text-xs ${a.connected ? "text-success" : "text-muted-foreground"}`}>
                  {a.connected ? "Connected" : "Not connected"}
                </div>
              </div>
              <Button size="sm" variant={a.connected ? "outline" : "default"}>
                {a.connected ? "Disconnect" : "Connect"}
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-soft p-6">
        <h2 className="font-display text-lg font-semibold">Change password</h2>
        <div className="mt-4 grid max-w-md gap-3">
          <Input type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
          <div>
            <Button
              onClick={() => {
                if (pw.length < 6) return toast.error("Password too short");
                setPw("");
                toast.success("Password updated");
              }}
            >
              Update password
            </Button>
          </div>
        </div>
      </section>

      <section className="card-soft border-coral/30 p-6">
        <h2 className="font-display text-lg font-semibold text-coral">Danger zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">Permanently delete your account and all data.</p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="mt-4">
              Delete account
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete your Flowcast account?</AlertDialogTitle>
              <AlertDialogDescription>
                This action can't be undone. All your transactions, forecasts, and preferences will be erased.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  logout();
                  toast.success("Account deleted");
                  router.navigate({ to: "/" });
                }}
              >
                Yes, delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>
    </div>
  );
}

function Row({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
