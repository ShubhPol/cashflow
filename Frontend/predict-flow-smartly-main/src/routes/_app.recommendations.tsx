import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useCurrency } from "@/lib/providers";
import { formatCurrency, pickAmount } from "@/lib/currency";
import { RECOMMENDATIONS } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/recommendations")({
  head: () => ({ meta: [{ title: "Savings tips · Flowcast" }] }),
  component: RecommendationsPage,
});

function RecommendationsPage() {
  const { currency } = useCurrency();
  const [feedback, setFeedback] = useState<Record<string, "up" | "down">>({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Savings recommendations</h1>
        <p className="text-sm text-muted-foreground">Personalized tips with their estimated monthly impact.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {RECOMMENDATIONS.map((r) => {
          const v = pickAmount({ inr: r.amount_inr, usd: r.amount_usd, eur: r.amount_eur }, currency);
          const fb = feedback[r.id];
          return (
            <div key={r.id} className="card-soft flex flex-col p-5">
              <div className="flex items-center justify-between">
                <Badge className="bg-accent/20 text-accent-foreground hover:bg-accent/20">{r.category}</Badge>
                <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Sparkles className="size-4" />
                </span>
              </div>
              <p className="mt-4 flex-1 text-sm">{r.text}</p>
              <div className="mt-4">
                <div className="text-xs text-muted-foreground">Estimated monthly saving</div>
                <div className="font-display text-2xl font-semibold text-success">{formatCurrency(v, currency)}</div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant={fb === "up" ? "default" : "outline"}
                  aria-label="Helpful"
                  onClick={() => {
                    setFeedback((p) => ({ ...p, [r.id]: "up" }));
                    toast.success("Thanks for the feedback!");
                  }}
                >
                  <ThumbsUp className="size-4" />
                </Button>
                <Button
                  size="sm"
                  variant={fb === "down" ? "default" : "outline"}
                  aria-label="Not helpful"
                  onClick={() => {
                    setFeedback((p) => ({ ...p, [r.id]: "down" }));
                    toast("Got it — we'll show fewer like this.");
                  }}
                >
                  <ThumbsDown className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
