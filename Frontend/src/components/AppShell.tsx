import { Link, Outlet, useRouter, useLocation } from "@tanstack/react-router";
import { useAuth } from "@/lib/providers";
import { CurrencySelect } from "./CurrencySelect";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  LineChart,
  Sparkles,
  Settings as SettingsIcon,
  LogOut,
  Wallet,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", Icon: Receipt },
  { to: "/summary", label: "Summary", Icon: PieChart },
  { to: "/forecast", label: "Forecast", Icon: LineChart },
  { to: "/recommendations", label: "Tips", Icon: Sparkles },
  { to: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("You've been logged out");
    router.navigate({ to: "/login" });
  };

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link to="/dashboard" className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Wallet className="size-4" />
            </span>
            Flowcast
          </Link>
          <nav className="ml-6 hidden gap-1 md:flex" aria-label="Main">
            {NAV.map(({ to, label, Icon }) => {
              const active = location.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <CurrencySelect className="h-9 w-[120px]" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Account menu" className="rounded-full">
                  <Avatar className="size-9">
                    <AvatarFallback className="bg-accent/30 text-accent-foreground">
                      {user?.name?.slice(0, 1).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/settings">
                    <SettingsIcon className="mr-2 size-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 size-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden" aria-label="Mobile">
          {NAV.map(({ to, label, Icon }) => {
            const active = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
