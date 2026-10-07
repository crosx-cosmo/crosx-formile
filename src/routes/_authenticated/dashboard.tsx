import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FileText, Inbox, MousePointerClick, Plus, TrendingUp } from "lucide-react";

import { supabase } from "@/integrations/backend/client";
import { AppShell, EmptyState, StatCard } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { timeAgo } from "@/lib/formile";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Formile" },
      { name: "description", content: "Forms, submissions and conversion performance at a glance." },
      { property: "og:title", content: "Dashboard — Formile" },
      { property: "og:description", content: "Your form performance at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const [forms, submissions, activity] = await Promise.all([
        supabase.from("forms").select("id,name,status,views,created_at"),
        supabase.from("submissions").select("id,form_id,created_at").order("created_at"),
        supabase
          .from("activity")
          .select("id,kind,message,created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      if (forms.error) throw forms.error;
      if (submissions.error) throw submissions.error;
      return {
        forms: forms.data ?? [],
        submissions: submissions.data ?? [],
        activity: activity.data ?? [],
      };
    },
  });

  const forms = data?.forms ?? [];
  const submissions = data?.submissions ?? [];
  const views = forms.reduce((sum, f) => sum + (f.views ?? 0), 0);
  const conversions = submissions.length;
  const rate = views > 0 ? Math.min(100, (conversions / views) * 100) : 0;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().slice(0, 10);
    return {
      label: d.toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
      submissions: submissions.filter((s) => s.created_at.slice(0, 10) === key).length,
    };
  });

  const topForms = [...forms]
    .map((f) => ({
      name: f.name.length > 14 ? `${f.name.slice(0, 14)}…` : f.name,
      submissions: submissions.filter((s) => s.form_id === f.id).length,
    }))
    .sort((a, b) => b.submissions - a.submissions)
    .slice(0, 5);

  return (
    <AppShell
      title="Dashboard"
      description="Performance across every form in your workspace"
      actions={
        <Button asChild size="sm">
          <Link to="/forms/new" search={{}}>
            <Plus className="h-4 w-4" /> New form
          </Link>
        </Button>
      }
    >
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Forms"
              value={String(forms.length)}
              hint={`${forms.filter((f) => f.status === "published").length} published`}
              icon={FileText}
            />
            <StatCard
              label="Submissions"
              value={String(submissions.length)}
              hint="All time"
              icon={Inbox}
            />
            <StatCard
              label="Conversions"
              value={String(conversions)}
              hint="Completed responses"
              icon={TrendingUp}
            />
            <StatCard
              label="Conversion rate"
              value={`${rate.toFixed(1)}%`}
              hint={`${views} form views`}
              icon={MousePointerClick}
            />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div className="surface-card p-4 sm:p-5">
              <h2 className="font-display text-base font-semibold">Submissions, last 14 days</h2>
              <div className="mt-4 h-60">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={days} margin={{ left: -20, right: 4, top: 4 }}>
                    <defs>
                      <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
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
                    <Area
                      type="monotone"
                      dataKey="submissions"
                      stroke="var(--color-primary)"
                      strokeWidth={2}
                      fill="url(#fill)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="surface-card p-4 sm:p-5">
              <h2 className="font-display text-base font-semibold">Top forms</h2>
              <div className="mt-4 h-60">
                {topForms.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topForms} margin={{ left: -24, right: 4, top: 4 }}>
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
                      <Bar dataKey="submissions" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="grid h-full place-items-center text-sm text-muted-foreground">
                    No data yet
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-5 surface-card p-4 sm:p-5">
            <h2 className="font-display text-base font-semibold">Recent activity</h2>
            {data?.activity.length ? (
              <ul className="mt-3 divide-y divide-border">
                {data.activity.map((item) => (
                  <li key={item.id} className="flex items-start gap-3 py-3">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.message}</p>
                      <p className="text-xs text-muted-foreground">{timeAgo(item.created_at)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Activity will appear here as you create, publish and collect responses.
              </p>
            )}
          </div>

          {forms.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="No forms yet"
                description="Create your first form to start collecting submissions and tracking conversions."
                action={
                  <Button asChild size="sm">
                    <Link to="/forms/new" search={{}}>
                      <Plus className="h-4 w-4" /> Create form
                    </Link>
                  </Button>
                }
              />
            </div>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
