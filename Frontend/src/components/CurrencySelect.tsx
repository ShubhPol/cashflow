import { useCurrency } from "@/lib/providers";
import { CURRENCIES, type Currency } from "@/lib/currency";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CurrencySelect({ className }: { className?: string }) {
  const { currency, setCurrency } = useCurrency();
  return (
    <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
      <SelectTrigger className={className} aria-label="Select currency">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(CURRENCIES) as Currency[]).map((c) => (
          <SelectItem key={c} value={c}>
            <span className="mr-2">{CURRENCIES[c].flag}</span>
            {c} ({CURRENCIES[c].symbol})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
