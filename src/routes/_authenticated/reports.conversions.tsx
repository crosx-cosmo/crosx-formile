import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { supabase } from "@/integrations/backend/client";
import { AppShell, EmptyState, StatCard } from "@/components/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { MousePointerClick, Eye, TrendingUp } from "lucide-react";
import { ExportMenu } from "@/components/export-menu";
import { OfferLogo } from "@/components/offer-logo-field";

export const Route = createFileRoute("/_authenticated/reports/conversions")({
  head: () => ({
    meta: [
      { title: "Conversion report — Formile" },
      { name: "description", content: "See which forms convert views into submissions." },
      { property: "og:title", content: "Conversion report — Formile" },
      { property: "og:description", content: "Which forms convert, and which stall." },
    ],
  }),
  component: ConversionReport,
});

function ConversionReport() {
  const { data, isLoading } = useQuery({
    queryKey: ["conversion-report"],
    queryFn: async () => {
      const [forms, submissions] = await Promise.all([
        supabase.from("forms").select("id,name,views,status,offer_id,offer_name,offer_logo_url"),
        supabase.from("submissions").select("id,form_id,created_at"),
      ]);
      if (forms.error) throw forms.error;
      if (submissions.error) throw submissions.error;
      return { forms: forms.data ?? [], submissions: submissions.data ?? [] };
    },
  });

  const forms = data?.forms ?? [];
  const submissions = data?.submissions ?? [];
  const totalViews = forms.reduce((sum, f) => sum + (f.views ?? 0), 0);
  const overall = totalViews > 0 ? Math.min(100, (submissions.length / totalViews) * 100) : 0;

  const perForm = forms
    .map((form) => {
      const count = submissions.filter((s) => s.form_id === form.id).length;
      const rate = form.views > 0 ? Math.min(100, (count / form.views) * 100) : 0;
      return { id: form.id, name: form.name, views: form.views, conversions: count, rate, offerId: form.offer_id, offerName: form.offer_name, offerLogoUrl: form.offer_logo_url };
    })
    .sort((a, b) => b.rate - a.rate);

  const weeks = Array.from({ length: 8 }, (_, i) => {
    const start = new Date();
    start.setDate(start.getDate() - (7 - i) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return {
      label: start.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
      conversions: submissions.filter((s) => {
        const at = new Date(s.created_at);
        return at >= start && at < end;
      }).length,
    };
  });

  return (
    <AppShell title="Conversion report" description="Views to submissions, form by form" actions={<ExportMenu title="Formile Conversion Report" filename="formile-conversions" rows={perForm.map((form) => ({ Form: form.name, "Offer name": form.offerName ?? "", "Offer ID": form.offerId ?? "", Views: form.views, Conversions: form.conversions, "Conversion rate": `${form.rate.toFixed(1)}%` }))} summary={[`${totalViews} views`, `${submissions.length} conversions`, `${overall.toFixed(1)}% overall conversion rate`]} />}>
      {isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : forms.length === 0 ? (
        <EmptyState
          title="Nothing to measure yet"
          description="Publish your first form to start tracking views and conversion rate."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Views" value={String(totalViews)} hint="Across all forms" icon={Eye} />
            <StatCard
              label="Conversions"
              value={String(submissions.length)}
              hint="Completed submissions"
              icon={TrendingUp}
            />
            <StatCard
              label="Conversion rate"
              value={`${overall.toFixed(1)}%`}
              hint="Overall workspace"
              icon={MousePointerClick}
            />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="surface-card p-4 sm:p-5">
              <h2 className="font-display text-base font-semibold">Conversions by week</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeks} margin={{ left: -22, right: 6, top: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                        fontSize: 12,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface-card p-4 sm:p-5">
              <h2 className="font-display text-base font-semibold">Views vs conversions</h2>
              <div className="mt-4 h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={perForm.slice(0, 6).map((f) => ({
                      name: f.name.length > 12 ? `${f.name.slice(0, 12)}…` : f.name,
                      views: f.views,
                      conversions: f.conversions,
                    }))}
                    margin={{ left: -22, right: 6, top: 6 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--color-muted)" }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--color-border)",
                        background: "var(--color-card)",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="views" fill="var(--color-chart-5)" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="conversions" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="mt-5 surface-card p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold">Form performance</h2>
            <ul className="mt-4 space-y-4">
              {perForm.map((form) => (
                <li key={form.id}>
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <div className="flex min-w-0 items-center gap-3"><OfferLogo path={form.offerLogoUrl} alt={form.offerName || form.name} className="h-9 w-9 shrink-0" /><div className="min-w-0"><p className="truncate text-sm font-medium">{form.name}</p>{form.offerId ? <p className="text-xs text-muted-foreground">Offer ID · {form.offerId}</p> : null}</div></div>
                    <p className="shrink-0 text-sm font-semibold">{form.rate.toFixed(1)}%</p>
                  </div>
                  <Progress value={form.rate} className="mt-2 h-1.5" />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {form.conversions} conversions from {form.views} views
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </AppShell>
  );
}
