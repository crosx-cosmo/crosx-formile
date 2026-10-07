import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { AppShell } from "@/components/app-shell";
import { FieldsEditor } from "@/components/fields-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { newField, TEMPLATE_CATEGORIES, type FormField } from "@/lib/formile";
import { OfferLogoField } from "@/components/offer-logo-field";
import { FormPresentation } from "@/components/form-presentation";
import { LayoutSelect } from "@/components/layout-select";

export const Route = createFileRoute("/_authenticated/templates/new")({
  head: () => ({
    meta: [
      { title: "Create template — Formile" },
      { name: "description", content: "Save a reusable set of fields as a Formile template." },
      { property: "og:title", content: "Create template — Formile" },
      { property: "og:description", content: "Build a reusable Formile template." },
    ],
  }),
  component: CreateTemplate,
});

function CreateTemplate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [offerId, setOfferId] = useState("");
  const [offerName, setOfferName] = useState("");
  const [offerLogoUrl, setOfferLogoUrl] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [layoutType, setLayoutType] = useState("executive");
  const [fields, setFields] = useState<FormField[]>([
    { ...newField("text"), label: "Full name", required: true },
    { ...newField("email"), label: "Email", required: true },
  ]);

  const create = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");
      const { error } = await supabase.from("templates").insert({
        user_id: auth.user.id,
        name: name.trim(),
        category,
        description: description.trim(),
        fields: fields as never,
        offer_id: offerId.trim() || null,
        offer_name: offerName.trim() || null,
        offer_logo_url: offerLogoUrl,
        redirect_url: redirectUrl.trim() || null,
        layout_type: layoutType,
      });
      if (error) throw error;
      await supabase.from("activity").insert({
        user_id: auth.user.id,
        kind: "template_created",
        message: `Created template "${name.trim()}"`,
      });
    },
    onSuccess: () => {
      toast.success("Template saved.");
      navigate({ to: "/templates" });
    },
    onError: () => toast.error("Could not save that template."),
  });

  return (
    <AppShell title="Create template" description="Define a reusable field set">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="surface-card h-fit space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">Template name</Label>
            <Input
              id="t-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Standard lead capture"
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-cat">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="t-cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea
              id="t-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label htmlFor="t-offer-name">Offer name</Label><Input id="t-offer-name" value={offerName} onChange={(event) => setOfferName(event.target.value)} placeholder="Campaign or product" /></div>
            <div className="space-y-1.5"><Label htmlFor="t-offer-id">Offer ID</Label><Input id="t-offer-id" value={offerId} onChange={(event) => setOfferId(event.target.value)} placeholder="OFF-001" /></div>
          </div>
          <OfferLogoField value={offerLogoUrl ?? ""} onChange={setOfferLogoUrl} />
          <div className="space-y-1.5"><Label htmlFor="t-layout">Presentation layout</Label><LayoutSelect id="t-layout" value={layoutType} onChange={setLayoutType} /></div>
          <div className="space-y-1.5"><Label htmlFor="t-redirect">Redirect URL</Label><Input id="t-redirect" type="url" value={redirectUrl} onChange={(event) => setRedirectUrl(event.target.value)} placeholder="https://example.com/thank-you" /><p className="text-xs text-muted-foreground">Optional. People are redirected here after a successful submission.</p></div>
          <Button
            className="w-full"
            disabled={create.isPending}
            onClick={() => {
              if (name.trim().length < 2) {
                toast.error("Give your template a name.");
                return;
              }
              create.mutate();
            }}
          >
            Save template
          </Button>
        </div>

        <div className="space-y-5">
          <FormPresentation name={name || "Untitled template"} description={description} offerName={offerName} offerId={offerId} offerLogoUrl={offerLogoUrl} layoutType={layoutType} fields={fields} submitLabel="Submit" disabled />
          <h2 className="mb-3 font-display text-base font-semibold">Fields</h2>
          <FieldsEditor fields={fields} onChange={setFields} />
        </div>
      </div>
    </AppShell>
  );
}
