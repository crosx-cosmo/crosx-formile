import type { FormField } from "@/lib/formile";

export type LegacyLayout = "executive" | "centered" | "split";
export type CampaignStyle = "campaign" | "leadgen" | "reward" | "corporate";
export type LayoutType = LegacyLayout | CampaignStyle;
export type StarterTemplate = { id: string; name: string; category: string; description: string; eyebrow: string; submitLabel: string; layoutType: LayoutType; fields: FormField[] };

export const CAMPAIGN_STYLES: CampaignStyle[] = ["campaign", "leadgen", "reward", "corporate"];
export const isCampaignStyle = (v: unknown): v is CampaignStyle => CAMPAIGN_STYLES.includes(v as CampaignStyle);

export const LAYOUT_OPTIONS: { value: LayoutType; label: string; group: "Campaign page" | "Form card" }[] = [
  { value: "campaign", label: "Premium Campaign", group: "Campaign page" },
  { value: "leadgen", label: "High-Converting Lead Capture", group: "Campaign page" },
  { value: "reward", label: "Offer / Reward Campaign", group: "Campaign page" },
  { value: "corporate", label: "Corporate / Finance", group: "Campaign page" },
  { value: "executive", label: "Executive card", group: "Form card" },
  { value: "centered", label: "Centered card", group: "Form card" },
  { value: "split", label: "Split editorial", group: "Form card" },
];

/** Reusable, brand-neutral section copy per campaign style. Brand/offer names are injected at render time. */
export type CampaignCopy = {
  eyebrow: string;
  headline: (offer: string) => string;
  stats: { value: string; label: string }[];
  steps: { title: string; body: string }[];
  notes: string[];
  faq: { q: string; a: (offer: string) => string }[];
  trust: string;
};

const commonFaq = [
  { q: "Who can take part?", a: (o: string) => `Anyone who meets the eligibility shown for ${o} can submit the form. Each person should submit once.` },
  { q: "What happens after I submit?", a: () => "Your details are recorded securely and the campaign team follows up using the contact information you provide." },
  { q: "Is my information safe?", a: () => "Yes. Responses are encrypted in transit and only visible to the campaign owner." },
];

export const CAMPAIGN_COPY: Record<CampaignStyle, CampaignCopy> = {
  campaign: {
    eyebrow: "Featured campaign",
    headline: (o) => `Unlock ${o} in a few simple steps`,
    stats: [{ value: "2 min", label: "To complete" }, { value: "100%", label: "Free to join" }, { value: "24h", label: "Response time" }],
    steps: [{ title: "Fill the form", body: "Share a few details so we can verify your entry." }, { title: "Get verified", body: "The team reviews every submission carefully." }, { title: "Receive your offer", body: "Eligible participants are contacted directly." }],
    notes: ["One submission per person.", "Use accurate contact details so we can reach you.", "Offer availability may be limited."],
    faq: commonFaq,
    trust: "Your data is encrypted and never sold.",
  },
  leadgen: {
    eyebrow: "Limited availability",
    headline: (o) => `Get a personalised ${o} proposal`,
    stats: [{ value: "Fast", label: "Same-day callback" }, { value: "Expert", label: "Dedicated advisor" }, { value: "No", label: "Obligation" }],
    steps: [{ title: "Tell us your needs", body: "A short form — under two minutes." }, { title: "Talk to an advisor", body: "We call you back at a time that suits you." }, { title: "Get your plan", body: "A tailored recommendation, no pressure." }],
    notes: ["We only contact you about this enquiry.", "You can opt out at any time."],
    faq: commonFaq,
    trust: "Private by default. We never share your details.",
  },
  reward: {
    eyebrow: "Exclusive reward",
    headline: (o) => `Claim your ${o} reward today`,
    stats: [{ value: "Instant", label: "Eligibility check" }, { value: "Verified", label: "Genuine reward" }, { value: "Easy", label: "Three-step claim" }],
    steps: [{ title: "Register", body: "Complete the claim form below." }, { title: "Complete the task", body: "Follow the offer requirements shown." }, { title: "Collect the reward", body: "Rewards are issued after verification." }],
    notes: ["Rewards are issued only after successful verification.", "Duplicate or incomplete entries are not eligible.", "Reward terms are set by the offer owner."],
    faq: [...commonFaq, { q: "When will I receive my reward?", a: () => "Rewards are processed after verification. Timelines are shared by the offer owner." }],
    trust: "Verified campaign. Secure submission.",
  },
  corporate: {
    eyebrow: "Official application",
    headline: (o) => `Apply for ${o} with confidence`,
    stats: [{ value: "Secure", label: "Bank-grade encryption" }, { value: "Transparent", label: "Clear terms" }, { value: "Dedicated", label: "Relationship team" }],
    steps: [{ title: "Submit application", body: "Provide accurate personal and contact details." }, { title: "Review & verification", body: "Our team validates your information." }, { title: "Decision & onboarding", body: "You’ll be contacted with the outcome and next steps." }],
    notes: ["Submitting this form does not guarantee approval.", "Keep your identity documents ready for verification.", "Never share OTPs or passwords with anyone."],
    faq: commonFaq,
    trust: "Regulated-grade privacy and data protection.",
  },
};

const f = (id: string, label: string, type: FormField["type"], placeholder: string, required = true): FormField => ({ id, label, type, placeholder, required });

export const STARTER_TEMPLATES: StarterTemplate[] = [
  { id: "premium-campaign", name: "Premium Campaign", category: "Marketing", eyebrow: "Campaign page", description: "A full campaign landing page: hero, benefit cards, form, steps, FAQ and terms.", submitLabel: "Join the campaign", layoutType: "campaign", fields: [f("pc-name","Full name","text","Your full name"),f("pc-email","Email address","email","you@example.com"),f("pc-phone","Mobile number","phone","Your mobile number"),f("pc-city","City","text","Your city",false),{...f("pc-consent","I agree to the terms and conditions","checkbox","")}] },
  { id: "lead-capture-pro", name: "High-Converting Lead Capture", category: "Lead gen", eyebrow: "Campaign page", description: "Form above the fold with trust signals and a decisive CTA for qualified leads.", submitLabel: "Get my callback", layoutType: "leadgen", fields: [f("lc-name","Full name","text","Your full name"),f("lc-email","Work email","email","name@company.com"),f("lc-phone","Phone number","phone","Your number"),{...f("lc-interest","I’m interested in","select","Choose one"),options:["Pricing","Demo","Partnership","Other"]}] },
  { id: "reward-campaign", name: "Offer / Reward Campaign", category: "Marketing", eyebrow: "Campaign page", description: "Reward-first layout with claim steps, important notes and eligibility FAQ.", submitLabel: "Claim my reward", layoutType: "reward", fields: [f("rw-name","Full name","text","Your full name"),f("rw-phone","Mobile number","phone","Registered mobile number"),f("rw-email","Email","email","you@example.com"),{...f("rw-consent","I confirm the details are accurate","checkbox","")}] },
  { id: "corporate-finance", name: "Corporate / Finance Campaign", category: "Finance", eyebrow: "Campaign page", description: "A composed, compliance-friendly layout for financial and corporate offers.", submitLabel: "Submit application", layoutType: "corporate", fields: [f("cf-name","Full name (as per ID)","text","Legal full name"),f("cf-email","Email address","email","you@example.com"),f("cf-phone","Mobile number","phone","Your mobile number"),{...f("cf-income","Monthly income range","select","Select range"),options:["Below 25,000","25,000 – 50,000","50,000 – 1,00,000","Above 1,00,000"]},f("cf-city","City","text","Current city")] },
  { id: "premium-lead", name: "Premium Lead Capture", category: "Lead gen", eyebrow: "High intent", description: "A focused executive layout for qualified campaign leads.", submitLabel: "Request a consultation", layoutType: "executive", fields: [f("lead-name","Full name","text","Your full name"),f("lead-email","Work email","email","name@company.com"),f("lead-phone","Phone number","phone","+91 98765 43210"),f("lead-company","Company","text","Company name",false)] },
  { id: "modern-contact", name: "Modern Contact Form", category: "General", eyebrow: "Start a conversation", description: "A calm, minimal contact experience for premium services.", submitLabel: "Send enquiry", layoutType: "centered", fields: [f("contact-name","Your name","text","How should we address you?"),f("contact-email","Email address","email","you@example.com"),{...f("contact-topic","Topic","select","Choose a topic"),options:["General enquiry","Partnership","Support","Press"]},f("contact-message","How can we help?","textarea","Tell us a little more")] },
  { id: "campaign-registration", name: "Campaign Registration", category: "Event", eyebrow: "Reserve your place", description: "A bold campaign-ready registration flow with clear identity.", submitLabel: "Complete registration", layoutType: "split", fields: [f("reg-name","Full name","text","Your full name"),f("reg-email","Email","email","you@example.com"),f("reg-phone","Mobile number","phone","Your number"),f("reg-date","Preferred date","date","")] },
  { id: "product-enquiry", name: "Product Enquiry", category: "Support", eyebrow: "Product advisory", description: "A structured enquiry designed for considered purchases.", submitLabel: "Request product details", layoutType: "executive", fields: [f("product-name","Name","text","Your name"),f("product-email","Business email","email","name@company.com"),{...f("product-interest","Product of interest","select","Select product"),options:["Platform","Enterprise plan","Integrations","Custom solution"]},f("product-notes","Requirements","textarea","What would you like to achieve?",false)] },
  { id: "application", name: "Application Form", category: "Recruiting", eyebrow: "Your next chapter", description: "A refined candidate application with approachable hierarchy.", submitLabel: "Submit application", layoutType: "centered", fields: [f("app-name","Legal name","text","Full legal name"),f("app-email","Email","email","you@example.com"),f("app-phone","Phone","phone","Contact number"),f("app-role","Role applied for","text","Position title"),f("app-story","Why are you a strong fit?","textarea","Share the relevant highlights")] },
];

export function cloneFields(fields: FormField[]) { return fields.map((field) => ({ ...field, id: crypto.randomUUID(), options: field.options ? [...field.options] : undefined })); }
