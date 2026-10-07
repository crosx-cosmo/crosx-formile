import { BadgeCheck, Gift, Headphones, Lock, Mail, ShieldCheck, Sparkles, TrendingUp, Zap, Info, PlayCircle, Building2 } from "lucide-react";
import type { ReactNode } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FormileMark } from "@/components/brand";
import { OfferLogo } from "@/components/offer-logo-field";
import { CAMPAIGN_COPY, type CampaignStyle } from "@/lib/starter-templates";
import { cn } from "@/lib/utils";

const STAT_ICONS = [Zap, BadgeCheck, TrendingUp];

type Props = { style: CampaignStyle; name: string; description?: string | null | undefined; offerName?: string | null | undefined; offerId?: string | null | undefined; offerLogoUrl?: string | null | undefined; submitLabel: string; form: ReactNode; compact?: boolean | undefined };

/** Abstract, token-driven hero artwork — brand neutral, no stock imagery. */
function Artwork({ style }: { style: CampaignStyle }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className={cn("absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl", style === "corporate" ? "bg-primary/15" : "bg-primary/35")} />
      <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <svg className="absolute inset-0 h-full w-full opacity-[0.08]" xmlns="http://www.w3.org/2000/svg"><defs><pattern id={`g-${style}`} width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="currentColor" strokeWidth="1" /></pattern></defs><rect width="100%" height="100%" fill={`url(#g-${style})`} /></svg>
    </div>
  );
}

export function CampaignPage({ style, name, description, offerName, offerId, offerLogoUrl, submitLabel, form, compact }: Props) {
  const copy = CAMPAIGN_COPY[style];
  const brand = offerName || name;
  const dark = style === "campaign" || style === "corporate";
  const pad = compact ? "px-5 sm:px-7" : "px-5 sm:px-10";

  const formCard = (
    <div id="campaign-form" className="rounded-xl border bg-card p-5 text-card-foreground shadow-lift sm:p-7">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div><p className="eyebrow text-primary">Secure form</p><h2 className="mt-1 font-display text-lg font-bold">{style === "reward" ? "Claim your reward" : style === "corporate" ? "Application details" : "Get started"}</h2></div>
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"><Lock className="h-3 w-3" /> Encrypted</span>
      </div>
      {form}
      <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> {copy.trust}</p>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-card">
      {/* Brand header */}
      <header className={cn("flex items-center justify-between gap-3 border-b bg-card py-3.5", pad)}>
        <div className="flex min-w-0 items-center gap-3">
          {offerLogoUrl ? <OfferLogo path={offerLogoUrl} alt={brand} className="h-10 w-10 shrink-0" /> : <FormileMark />}
          <div className="min-w-0"><p className="truncate text-sm font-bold">{brand}</p><p className="truncate text-[11px] text-muted-foreground">{offerId ? `Offer ID · ${offerId}` : "Official campaign"}</p></div>
        </div>
        <a href="#campaign-form" className="hidden shrink-0 rounded-md bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 sm:inline-flex">{submitLabel}</a>
      </header>

      {/* Hero */}
      <section className={cn("relative", dark ? "bg-foreground text-background" : style === "reward" ? "bg-primary/[0.06]" : "bg-muted/40")}>
        <Artwork style={style} />
        <div className={cn("relative grid gap-8 py-10 sm:py-14", pad, style === "leadgen" ? "lg:grid-cols-[1.05fr_.95fr] lg:items-start" : "")}>
          <div className={cn(style === "reward" || style === "campaign" ? "mx-auto max-w-2xl text-center" : "max-w-xl")}>
            <span className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider", dark ? "bg-background/10 text-background" : "bg-primary/10 text-primary")}>
              {style === "reward" ? <Gift className="h-3.5 w-3.5" /> : style === "corporate" ? <Building2 className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}{copy.eyebrow}
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-[1.1] sm:text-4xl">{copy.headline(brand)}</h1>
            <p className={cn("mt-3 text-sm leading-6 sm:text-base", dark ? "text-background/70" : "text-muted-foreground")}>{description || name}</p>
            {style !== "leadgen" ? <a href="#campaign-form" className="mt-6 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lift transition hover:-translate-y-0.5 hover:bg-primary/90">{submitLabel}</a> : null}
          </div>
          {style === "leadgen" ? formCard : null}
        </div>
      </section>

      {/* Stat / benefit cards */}
      <section className={cn("relative -mt-6 grid gap-3 sm:grid-cols-3", pad)}>
        {copy.stats.map((s, i) => { const Icon = STAT_ICONS[i % 3]!; return (
          <div key={s.label} className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-card">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-4.5 w-4.5" /></span>
            <div><p className="font-display text-lg font-bold leading-none">{s.value}</p><p className="mt-1 text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ); })}
      </section>

      {/* Form + How it works */}
      <section className={cn("grid gap-8 py-10", pad, style === "leadgen" ? "" : "lg:grid-cols-[1.1fr_.9fr]")}>
        {style !== "leadgen" ? formCard : null}
        <div>
          <p className="eyebrow text-primary">How it works</p>
          <h2 className="mt-1 font-display text-xl font-bold">Three simple steps</h2>
          <ol className={cn("mt-5 gap-4", style === "leadgen" ? "grid sm:grid-cols-3" : "space-y-4")}>
            {copy.steps.map((step, i) => (
              <li key={step.title} className="flex gap-3 rounded-lg border bg-card p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-foreground font-display text-sm font-bold text-background">{i + 1}</span>
                <div><p className="text-sm font-semibold">{step.title}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{step.body}</p></div>
              </li>
            ))}
          </ol>
          {style === "campaign" || style === "reward" ? (
            <div className="relative mt-5 grid aspect-video place-items-center overflow-hidden rounded-lg border bg-foreground text-background">
              <Artwork style={style} />
              <div className="relative text-center"><PlayCircle className="mx-auto h-10 w-10 text-primary" /><p className="mt-2 text-xs text-background/70">Campaign walkthrough</p></div>
            </div>
          ) : null}
        </div>
      </section>

      {/* Important notes + FAQ */}
      <section className={cn("grid gap-8 border-t bg-muted/30 py-10 lg:grid-cols-[.8fr_1.2fr]", pad)}>
        <div>
          <p className="eyebrow text-primary">Important notes</p>
          <ul className="mt-4 space-y-2.5">
            {copy.notes.map((n) => <li key={n} className="flex gap-2.5 text-sm"><Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span className="text-muted-foreground">{n}</span></li>)}
          </ul>
        </div>
        <div>
          <p className="eyebrow text-primary">Frequently asked</p>
          <Accordion type="single" collapsible className="mt-2">
            {copy.faq.map((item, i) => (
              <AccordionItem key={item.q} value={`q${i}`}><AccordionTrigger className="text-left text-sm">{item.q}</AccordionTrigger><AccordionContent className="text-sm text-muted-foreground">{item.a(brand)}</AccordionContent></AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Support + security */}
      <section className={cn("grid gap-3 py-8 sm:grid-cols-2", pad)}>
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4"><Headphones className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Need help?</p><p className="mt-0.5 text-xs text-muted-foreground">Contact the {brand} campaign team through the official channels shared with you.</p></div></div>
        <div className="flex items-start gap-3 rounded-lg border bg-card p-4"><ShieldCheck className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Privacy & security</p><p className="mt-0.5 text-xs text-muted-foreground">Submissions travel over an encrypted connection and are visible only to the campaign owner.</p></div></div>
      </section>

      {/* Terms + footer */}
      <footer className={cn("border-t py-6", pad)}>
        <details className="group text-xs text-muted-foreground"><summary className="cursor-pointer font-semibold text-foreground">Terms & conditions</summary><p className="mt-2 leading-5">Participation is subject to eligibility and verification by the offer owner. The offer owner may modify or withdraw this campaign at any time. By submitting, you consent to be contacted about this campaign.</p></details>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-[11px] text-muted-foreground">
          <span>© {new Date().getFullYear()} {brand}{offerId ? ` · ${offerId}` : ""}</span>
          <span className="inline-flex items-center gap-1.5"><Mail className="h-3 w-3" /> Powered by Formile</span>
        </div>
      </footer>
    </div>
  );
}
