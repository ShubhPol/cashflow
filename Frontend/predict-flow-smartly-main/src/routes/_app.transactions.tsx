import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useRef } from "react";
import { useCurrency } from "@/lib/providers";
import { formatCurrency, pickAmount } from "@/lib/currency";
import { TRANSACTIONS, EXPENSE_META, type Txn } from "@/lib/mockData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText, Upload, FileType2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/transactions")({
  head: () => ({ meta: [{ title: "Transactions · Flowcast" }] }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const { currency } = useCurrency();
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState<Txn[]>([]);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx", "pdf"].includes(ext)) {
      setError("Unsupported file. Please upload CSV, Excel, or PDF.");
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      // mock: pretend we parsed 3 new txns
      const parsed = TRANSACTIONS.slice(0, 3);
      setUploaded(parsed);
      toast.success(`Parsed and classified ${parsed.length} transactions from ${file.name}`);
    }, 1200);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const rows = useMemo(() => [...uploaded, ...TRANSACTIONS], [uploaded]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Transactions</h1>
        <p className="text-sm text-muted-foreground">Upload a statement to auto-classify your activity.</p>
      </div>

      <div
        className="card-soft border-dashed p-8 text-center transition-colors hover:bg-secondary/40"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        aria-label="Upload statement"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.pdf"
          hidden
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Upload className="size-6" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold">Drop your statement here</h2>
        <p className="mt-1 text-sm text-muted-foreground">or click to browse — we'll classify it automatically.</p>
        <div className="mt-4 flex justify-center gap-3 text-xs">
          <FileTypeChip Icon={FileSpreadsheet} label="CSV" />
          <FileTypeChip Icon={FileType2} label="XLSX" />
          <FileTypeChip Icon={FileText} label="PDF" />
        </div>
        {uploading && <div className="mt-4 text-sm text-primary">Parsing bank statement…</div>}
        {error && <div className="mt-4 text-sm text-coral">{error}</div>}
        {uploaded.length > 0 && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs text-success">
            <CheckCircle2 className="size-3.5" /> {uploaded.length} new transactions added
          </div>
        )}
      </div>

      <div className="card-soft overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Expense</TableHead>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((t) => {
              const v = pickAmount({ inr: t.amount_inr, usd: t.amount_usd, eur: t.amount_eur }, currency);
              return (
                <TableRow key={t.id} className="relative">
                  <TableCell className="font-mono text-xs">
                    <span
                      className={`absolute inset-y-2 left-0 w-1 rounded-full ${
                        t.type === "incoming" ? "bg-primary/60" : "bg-coral/60"
                      }`}
                      aria-hidden
                    />
                    <span className="ml-2">{t.date}</span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{t.description}</TableCell>
                  <TableCell>
                    {t.type === "incoming" ? (
                      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Incoming</Badge>
                    ) : (
                      <Badge className="bg-coral/15 text-coral hover:bg-coral/15">Outgoing</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {t.expense_type ? (
                      <>
                        <span className="mr-1">{EXPENSE_META[t.expense_type].icon}</span>
                        {t.expense_type}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{t.channel}</TableCell>
                  <TableCell
                    className={`text-right font-mono font-medium ${
                      t.type === "incoming" ? "text-primary" : "text-coral"
                    }`}
                  >
                    {t.type === "incoming" ? "+" : "−"}
                    {formatCurrency(v, currency)}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div>
        <Button variant="outline" onClick={() => setUploaded([])} disabled={uploaded.length === 0}>
          Clear uploaded
        </Button>
      </div>
    </div>
  );
}

function FileTypeChip({ Icon, label }: { Icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs">
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
