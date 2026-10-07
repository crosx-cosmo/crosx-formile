import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { AppShell } from "@/components/app-shell";
import { FieldsEditor } from "@/components/fields-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TEMPLATE_CATEGORIES, type FormField } from "@/lib/formile";
import { OfferLogoField } from "@/components/offer-logo-field";
import { FormPresentation } from "@/components/form-presentation";
import { LayoutSelect } from "@/components/layout-select";

export const Route = createFileRoute("/_authenticated/templates/$templateId")({
  head: () => ({
    meta: [
      { title: "Edit template — Formile" },
      { name: "description", content: "Update the fields saved in this Formile template." },
      { property: "og:title", content: "Edit template — Formile" },
      { property: "og:description", content: "Update your Formile template." },
    ],
  }),
  component: EditTemplate,
});

function EditTemplate() {
  const { templateId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["template", templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("*")
        .eq("id", templateId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const [name, setName] = useState("");
  const [category, setCategory] = useState("General");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [offerId, setOfferId] = useState("");
  const [offerName, setOfferName] = useState("");
  const [offerLogoUrl, setOfferLogoUrl] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState("");
  const [layoutType, setLayoutType] = useState("executive");

  useEffect(() => {
    if (!data) return;
    setName(data.name);
    setCategory(data.category);
    setDescription(data.description ?? "");
    setFields((data.fields as unknown as FormField[]) ?? []);
    setOfferId(data.offer_id ?? "");
    setOfferName(data.offer_name ?? "");
    setOfferLogoUrl(data.offer_logo_url);
    setRedirectUrl(data.redirect_url ?? "");
    setLayoutType(data.layout_type);
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("templates")
        .update({
          name: name.trim(),
          category,
          description: description.trim(),
          fields: fields as never,
          offer_id: offerId.trim() || null,
          offer_name: offerName.trim() || null,
          offer_logo_url: offerLogoUrl,
          redirect_url: redirectUrl.trim() || null,
          layout_type: layoutType,
        })
        .eq("id", templateId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template updated.");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: () => toast.error("Could not update that template."),
  });

  if (isLoading || !data) {
    return (
      <AppShell title="Template">
        <Skeleton className="h-96 rounded-xl" />
      </AppShell>
    );
  }

  return (
    <AppShell
      title={name || "Template"}
      description="Edit the reusable field set"
      actions={
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
          Save changes
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div className="surface-card h-fit space-y-4 p-5">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">Template name</Label>
            <Input
              id="t-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="t-offer-name">Offer name</Label><Input id="t-offer-name" value={offerName} onChange={(event) => setOfferName(event.target.value)} /></div><div className="space-y-1.5"><Label htmlFor="t-offer-id">Offer ID</Label><Input id="t-offer-id" value={offerId} onChange={(event) => setOfferId(event.target.value)} /></div></div>
          <OfferLogoField value={offerLogoUrl ?? ""} onChange={setOfferLogoUrl} />
          <div className="space-y-1.5"><Label htmlFor="t-layout">Presentation layout</Label><LayoutSelect id="t-layout" value={layoutType} onChange={setLayoutType} /></div>
          <div className="space-y-1.5"><Label htmlFor="t-redirect">Redirect URL</Label><Input id="t-redirect" type="url" value={redirectUrl} onChange={(event) => setRedirectUrl(event.target.value)} placeholder="https://example.com/thank-you" /><p className="text-xs text-muted-foreground">Optional. People are redirected here after a successful submission.</p></div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/templates">← Back to templates</Link>
          </Button>
        </div>

        <div className="space-y-5">
          <FormPresentation name={name} description={description} offerName={offerName} offerId={offerId} offerLogoUrl={offerLogoUrl} layoutType={layoutType} fields={fields} submitLabel="Submit" disabled />
          <h2 className="mb-3 font-display text-base font-semibold">Fields</h2>
          <FieldsEditor fields={fields} onChange={setFields} />
        </div>
      </div>
    </AppShell>
  );
}
