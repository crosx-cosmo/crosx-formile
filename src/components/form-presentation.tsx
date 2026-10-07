import { FormileMark } from "@/components/brand";
import { OfferLogo } from "@/components/offer-logo-field";
import { FormRenderer, type Answers } from "@/components/form-renderer";
import { CampaignPage } from "@/components/campaign-page";
import type { FormField } from "@/lib/formile";
import { isCampaignStyle, type LayoutType } from "@/lib/starter-templates";
import { cn } from "@/lib/utils";

export function FormPresentation({ name, description, offerName, offerId, offerLogoUrl, layoutType = "executive", fields, submitLabel, disabled, busy, onSubmit, eyebrow, compact }: { name: string; description?: string | null; offerName?: string | null; offerId?: string | null; offerLogoUrl?: string | null; layoutType?: LayoutType | string | null; fields: FormField[]; submitLabel: string; disabled?: boolean; busy?: boolean; onSubmit?: (answers: Answers) => void | Promise<void>; eyebrow?: string; compact?: boolean }) {
  const form = <FormRenderer fields={fields} submitLabel={submitLabel} {...(disabled !== undefined ? { disabled } : {})} {...(busy !== undefined ? { busy } : {})} {...(onSubmit ? { onSubmit } : {})} />;
  if (isCampaignStyle(layoutType)) return <CampaignPage style={layoutType} name={name} description={description} offerName={offerName} offerId={offerId} offerLogoUrl={offerLogoUrl} submitLabel={submitLabel} form={form} compact={compact} />;
  const identity = <div className="flex items-center gap-3"><OfferLogo path={offerLogoUrl} alt={offerName || name} className="h-12 w-12" />{!offerLogoUrl ? <FormileMark /> : null}<div className="min-w-0"><p className="truncate text-sm font-bold">{offerName || name}</p>{offerId ? <p className="text-xs text-muted-foreground">Offer ID · {offerId}</p> : <p className="text-xs text-muted-foreground">Powered by Formile</p>}</div></div>;
  const heading = <div><p className="eyebrow text-primary">{eyebrow || "Secure response"}</p><h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">{name}</h1>{description ? <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p> : null}</div>;
  if (layoutType === "split") return <div className="overflow-hidden rounded-lg border bg-card shadow-lift lg:grid lg:grid-cols-[.85fr_1.15fr]"><div className="flex min-h-64 flex-col justify-between bg-foreground p-7 text-background sm:p-9"><div>{identity}</div><div className="mt-12">{heading}</div></div><div className="p-6 sm:p-9">{form}</div></div>;
  return <div className={cn("overflow-hidden rounded-lg border bg-card shadow-card", layoutType === "centered" ? "mx-auto max-w-2xl" : "")}><div className="border-b bg-muted/35 p-5 sm:p-7">{identity}</div><div className="p-5 sm:p-8">{heading}<div className="mt-7">{form}</div></div></div>;
}
