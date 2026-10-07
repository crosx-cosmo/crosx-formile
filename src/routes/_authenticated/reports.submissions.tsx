import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/integrations/backend/client";
import { AppShell, EmptyState } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDateTime } from "@/lib/formile";
import { ExportMenu } from "@/components/export-menu";
import { OfferLogo } from "@/components/offer-logo-field";

export const Route = createFileRoute("/_authenticated/reports/submissions")({
  head: () => ({
    meta: [
      { title: "Submission report — Formile" },
      { name: "description", content: "Every response captured across your Formile forms." },
      { property: "og:title", content: "Submission report — Formile" },
      { property: "og:description", content: "Every response captured by your forms." },
    ],
  }),
  component: SubmissionReport,
});

function SubmissionReport() {
  const [formFilter, setFormFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["submissions-report"],
    queryFn: async () => {
      const [forms, submissions] = await Promise.all([
        supabase.from("forms").select("id,name,offer_id,offer_name,offer_logo_url"),
        supabase
          .from("submissions")
          .select("id,form_id,data,source,created_at")
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
      if (forms.error) throw forms.error;
      if (submissions.error) throw submissions.error;
      return { forms: forms.data ?? [], submissions: submissions.data ?? [] };
    },
  });

  const formName = (id: string) => data?.forms.find((f) => f.id === id)?.name ?? "Deleted form";
  const rows = (data?.submissions ?? []).filter(
    (s) => formFilter === "all" || s.form_id === formFilter,
  );

  const exportRows = rows.map((row) => { const form = data?.forms.find((f) => f.id === row.form_id); return { Form: formName(row.form_id), "Offer name": form?.offer_name ?? "", "Offer ID": form?.offer_id ?? "", Received: new Date(row.created_at).toISOString(), Source: row.source, ...((row.data as Record<string, string | number | boolean>) ?? {}) }; });

  return (
    <AppShell
      title="Submission report"
      description="Every response captured by your forms"
      actions={
        <ExportMenu title="Formile Submission Report" filename="formile-submissions" rows={exportRows} summary={[`${rows.length} submissions`, formFilter === "all" ? "All forms" : formName(formFilter)]} />
      }
    >
      <div className="mb-4 max-w-xs">
        <Select value={formFilter} onValueChange={setFormFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All forms</SelectItem>
            {(data?.forms ?? []).map((form) => (
              <SelectItem key={form.id} value={form.id}>
                {form.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No submissions yet"
          description="Publish a form and share its link — responses will land here in real time."
        />
      ) : (
        <ul className="grid gap-3">
          {rows.map((row) => {
            const answers = Object.entries((row.data as Record<string, unknown>) ?? {});
            return (
              <li key={row.id} className="surface-card p-4">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 gap-3">
                    <OfferLogo path={data?.forms.find((f) => f.id === row.form_id)?.offer_logo_url} alt={formName(row.form_id)} className="h-10 w-10 shrink-0" />
                    <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{formName(row.form_id)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(row.created_at)} • {row.source}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {answers
                        .slice(0, 3)
                        .map(([key, value]) => `${key}: ${String(value)}`)
                        .join(" • ") || "Empty submission"}
                    </p>
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="shrink-0">
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{formName(row.form_id)}</DialogTitle>
                      </DialogHeader>
                      <dl className="space-y-3">
                        {answers.map(([key, value]) => (
                          <div key={key}>
                            <dt className="eyebrow">{key}</dt>
                            <dd className="mt-0.5 break-words text-sm">{String(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </DialogContent>
                  </Dialog>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
