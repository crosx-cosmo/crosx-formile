import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BarChart3, LayoutTemplate, ShieldCheck, Workflow } from "lucide-react";

import { FormileLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Formile — Build forms, capture submissions, grow conversions" },
      {
        name: "description",
        content:
          "Formile is a premium form platform: build and publish forms, collect submissions and track conversion performance in one clean workspace.",
      },
      { property: "og:title", content: "Formile — Form intelligence platform" },
      {
        property: "og:description",
        content: "Build forms, capture submissions and track conversions in one workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Workflow,
    title: "Form builder",
    body: "Add fields, set validation rules, preview live and publish a shareable link in seconds.",
  },
  {
    icon: LayoutTemplate,
    title: "Templates",
    body: "Save your best-performing structures as templates and spin up new forms instantly.",
  },
  {
    icon: BarChart3,
    title: "Reporting",
    body: "Submission and conversion reports that show which forms earn attention and which stall.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    body: "Every form, submission and report is scoped to your account with strict access rules.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5">
          <FormileLogo className="h-9 sm:h-10" />
          <div className="flex shrink-0 items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.15fr_1fr]">
          <div>
          <p className="eyebrow">Branding • Growth • Performance</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] sm:text-6xl">
            <span className="brand-gradient-text">Forms that carry their weight.</span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Formile gives you a builder, a publishing workflow and conversion reporting in one
            place — so every form you ship is measurable from day one.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/auth">
                Start building <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/auth">Sign in to workspace</Link>
            </Button>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-4 sm:max-w-2xl sm:grid-cols-4">
            {[
              ["Forms", "Unlimited"],
              ["Fields", "8 types"],
              ["Reports", "Live"],
              ["Setup", "60 sec"],
            ].map(([label, value]) => (
              <div key={label} className="surface-card p-4">
                <dt className="eyebrow">{label}</dt>
                <dd className="mt-1.5 font-display text-lg font-bold">{value}</dd>
              </div>
            ))}
          </dl>
          </div>
          <HeroPreview />
        </section>

        <section className="border-t border-border bg-card/60">
          <div className="mx-auto grid max-w-6xl gap-4 px-5 py-16 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="surface-card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <feature.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.body}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-5 py-16">
          <div className="surface-card flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="font-display text-2xl font-bold sm:text-3xl">Ship your first form today.</h2>
              <p className="mt-2 text-sm text-muted-foreground">Start from a premium template or build from scratch.</p>
            </div>
            <Button asChild size="lg">
              <Link to="/auth">Create your workspace <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Formile. Advertising & marketing technology.</span>
          <span>Branding • Growth • Performance</span>
        </div>
      </footer>
    </div>
  );
}

function HeroPreview() {
  return (
    <div aria-hidden className="relative hidden lg:block">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-accent/60 blur-2xl" />
      <div className="surface-card overflow-hidden shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
          <span className="ml-3 text-xs text-muted-foreground">Form preview</span>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <p className="eyebrow">Lead capture</p>
            <p className="mt-1 font-display text-xl font-bold">Request a consultation</p>
          </div>
          {["Full name", "Work email", "Company"].map((l) => (
            <div key={l} className="space-y-1.5">
              <p className="text-xs font-medium">{l}</p>
              <div className="h-10 rounded-md border border-input bg-background" />
            </div>
          ))}
          <div className="grid h-11 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
            Submit request
          </div>
        </div>
      </div>
    </div>
  );
}
