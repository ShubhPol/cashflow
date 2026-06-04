import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/providers";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_app")({
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const { isAuthenticated, hydrated } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.navigate({ to: "/login" });
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="grid min-h-dvh place-items-center text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <AppShell />;
}
