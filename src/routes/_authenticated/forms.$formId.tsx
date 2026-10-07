import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Save } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { AppShell } from "@/components/app-shell";
import { FieldsEditor } from "@/components/fields-editor";
import { FormPresentation } from "@/components/form-presentation";
import { LayoutSelect } from "@/components/layout-select";
import { OfferLogo, OfferLogoField } from "@/components/offer-logo-field";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FormField } from "@/lib/formile";
import type { LayoutType } from "@/lib/starter-templates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/forms/$formId")({
  head: () => ({
    meta: [
      { title: "Edit form — Formile" },
      { name: "description", content: "Customize fields, validation, preview and publish." },
      { property: "og:title", content: "Edit form — Formile" },
      { property: "og:description", content: "Customize and publish your form." },
    ],
  }),
  component: FormBuilder,
});

function FormBuilder() {
  const { formId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["form", formId],
    queryFn: async () => {
      const { data, error } = await supabase.from("forms").select("*").eq("id", formId).single();
      if (error) throw error;
      return data;
    },
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitLabel, setSubmitLabel] = useState("Submit");
  const [successMessage, setSuccessMessage] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [offerId, setOfferId] = useState("");
  const [offerName, setOfferName] = useState("");
  const [offerLogoUrl, setOfferLogoUrl] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [layoutType, setLayoutType] = useState<LayoutType>("executive");

  useEffect(() => {
    if (!data) return;
    setName(data.name);
    setDescription(data.description ?? "");
    setSubmitLabel(data.submit_label);
    setSuccessMessage(data.success_message);
    setFields((data.fields as unknown as FormField[]) ?? []);
    setOfferId(data.offer_id ?? "");
    setOfferName(data.offer_name ?? "");
    setOfferLogoUrl(data.offer_logo_url ?? "");
    setRedirectUrl(data.redirect_url ?? "");
    setLayoutType((data.layout_type as LayoutType) ?? "executive");
  }, [data]);

  const save = useMutation({
    mutationFn: async (status?: "draft" | "published") => {
      const { error } = await supabase
        .from("forms")
        .update({
          name: name.trim(),
          description: description.trim(),
          submit_label: submitLabel.trim() || "Submit",
          success_message: successMessage.trim(),
          fields: fields as never,
          offer_id: offerId.trim() || null,
          offer_name: offerName.trim() || null,
          offer_logo_url: offerLogoUrl || null,
          redirect_url: redirectUrl.trim() || null,
          layout_type: layoutType,
          ...(status ? { status } : {}),
        })
        .eq("id", formId);
      if (error) throw error;
      if (status) {
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user) {
          await supabase.from("activity").insert({
            user_id: auth.user.id,
            kind: status === "published" ? "form_published" : "form_unpublished",
            message: `${status === "published" ? "Published" : "Unpublished"} form "${name.trim()}"`,
          });
        }
      }
      return status;
    },
    onSuccess: (status) => {
      toast.success(
        status === "published"
          ? "Form published — the public link is live."
          : status === "draft"
            ? "Form moved back to draft."
            : "Changes saved.",
      );
      queryClient.invalidateQueries({ queryKey: ["form", formId] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: () => toast.error("Could not save your changes."),
  });

  if (isLoading || !data) {
    return (
      <AppShell title="Form builder">
        <Skeleton className="h-96 rounded-xl" />
      </AppShell>
    );
  }

  const publicUrl = typeof window !== "undefined" ? `${window.location.origin}/f/${data.slug}` : "";

  return (
    <AppShell
      title={name || "Untitled form"}
      description="Fields, validation, preview and publishing"
      actions={
        <>
          <Badge variant={data.status === "published" ? "default" : "secondary"}>
            {data.status}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => save.mutate(undefined)}>
            <Save className="h-4 w-4" /> Save
          </Button>
          <Button
            size="sm"
            onClick={() => save.mutate(data.status === "published" ? "draft" : "published")}
          >
            {data.status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </>
      }
    >
      {(offerName || offerId) ? <div className="mb-4 flex items-center gap-3"><OfferLogo path={offerLogoUrl} alt={offerName || name} /><div><p className="text-sm font-bold">{offerName || "Offer identity"}</p>{offerId ? <p className="text-xs text-muted-foreground">Offer ID · {offerId}</p> : null}</div></div> : null}
      {data.status === "published" ? (
        <div className="surface-card mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
          <div className="min-w-0">
            <p className="eyebrow">Public link</p>
            <p className="truncate text-sm">{publicUrl}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Copy link"
              onClick={() => {
                navigator.clipboard.writeText(publicUrl);
                toast.success("Link copied.");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" asChild aria-label="Open form">
              <a href={`/f/${data.slug}`} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      ) : null}

      <Tabs defaultValue="fields">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="fields" className="flex-1 sm:flex-none">
            Fields
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 sm:flex-none">
            Settings
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1 sm:flex-none">
            Preview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="fields" className="mt-4">
          <FieldsEditor fields={fields} onChange={setFields} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <div className="grid max-w-5xl gap-4 lg:grid-cols-2">
          <div className="surface-card space-y-4 p-5">
            <div><p className="eyebrow">Form details</p><h2 className="mt-1 font-display text-lg font-semibold">Content and response</h2></div>
            <div className="space-y-1.5">
              <Label htmlFor="name">Form name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="desc">Description</Label>
              <Textarea
                id="desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={300}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="submit-label">Submit button label</Label>
              <Input
                id="submit-label"
                value={submitLabel}
                onChange={(e) => setSubmitLabel(e.target.value)}
                maxLength={40}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="success">Success message</Label>
              <Textarea
                id="success"
                rows={2}
                value={successMessage}
                onChange={(e) => setSuccessMessage(e.target.value)}
                maxLength={200}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="layout">Presentation layout</Label>
              <LayoutSelect id="layout" value={layoutType} onChange={(value) => setLayoutType(value as LayoutType)} />
            </div>
          </div>
          <div className="surface-card space-y-5 p-5">
            <div><p className="eyebrow">Offer identity</p><h2 className="mt-1 font-display text-lg font-semibold">Brand this form</h2></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="offer-name">Offer name</Label><Input id="offer-name" value={offerName} onChange={(e) => setOfferName(e.target.value)} placeholder="e.g. Partner Rewards" maxLength={100} /></div><div className="space-y-1.5"><Label htmlFor="offer-id">Offer ID</Label><Input id="offer-id" value={offerId} onChange={(e) => setOfferId(e.target.value)} placeholder="e.g. OFF-2026-104" maxLength={80} /></div></div>
            <OfferLogoField value={offerLogoUrl} onChange={setOfferLogoUrl} />
            <div className="space-y-1.5"><Label htmlFor="redirect">Redirect URL</Label><Input id="redirect" type="url" value={redirectUrl} onChange={(e) => setRedirectUrl(e.target.value)} placeholder="https://example.com/thank-you" maxLength={500} /><p className="text-xs text-muted-foreground">Optional. After a successful submission, visitors are automatically sent to this secure URL.</p></div>
            <Button onClick={() => save.mutate(undefined)} disabled={save.isPending}>
              Save settings
            </Button>
          </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-4">
          <div>
            <FormPresentation name={name || "Untitled form"} description={description} offerName={offerName} offerId={offerId} offerLogoUrl={offerLogoUrl} layoutType={layoutType} fields={fields} submitLabel={submitLabel} disabled />
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Preview mode — submissions are disabled here.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/forms">← Back to all forms</Link>
        </Button>
      </div>
    </AppShell>
  );
}
