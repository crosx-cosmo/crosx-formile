import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { AppShell } from "@/components/app-shell";
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
import { newField, slugify, type FormField } from "@/lib/formile";
import { STARTER_TEMPLATES, cloneFields } from "@/lib/starter-templates";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormPresentation } from "@/components/form-presentation";

export const Route = createFileRoute("/_authenticated/forms/new")({
  validateSearch: (search: Record<string, unknown>): { template?: string } =>
    typeof search["template"] === "string" ? { template: search["template"] } : {},
  head: () => ({
    meta: [
      { title: "Create form — Formile" },
      { name: "description", content: "Start a new Formile form from scratch or a template." },
      { property: "og:title", content: "Create form — Formile" },
      { property: "og:description", content: "Start a new form in Formile." },
    ],
  }),
  component: CreateForm,
});

function CreateForm() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState(search.template ?? "blank");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const { data: templates } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("id,name,fields,description,offer_id,offer_name,offer_logo_url,layout_type,redirect_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in");

      const template = templates?.find((t) => t.id === templateId);
      const starter = STARTER_TEMPLATES.find((t) => t.id === templateId);
      const fields: FormField[] = template
        ? cloneFields(template.fields as unknown as FormField[])
        : starter ? cloneFields(starter.fields)
        : [
            { ...newField("text"), label: "Full name", required: true },
            { ...newField("email"), label: "Email", required: true },
          ];

      const insertForm = (layout: string) => supabase
        .from("forms")
        .insert({
          user_id: auth.user.id,
          name: name.trim(),
          description: description.trim(),
          slug: slugify(name),
          fields: fields as never,
          offer_id: template?.offer_id ?? null,
          offer_name: template?.offer_name ?? null,
          offer_logo_url: template?.offer_logo_url ?? null,
          redirect_url: template?.redirect_url ?? null,
          layout_type: layout,
          submit_label: starter?.submitLabel ?? "Submit",
        })
        .select("id")
        .single();
      const wanted = template?.layout_type ?? starter?.layoutType ?? "executive";
      let { data, error } = await insertForm(wanted);
      // Older databases only allow the original three layouts — fall back instead of failing.
      if (error?.code === "23514" && wanted !== "executive") {
        ({ data, error } = await insertForm("executive"));
        if (!error) toast.info("Campaign page styles need a small database update — this form uses the Executive layout for now.");
      }
      if (error || !data) throw error ?? new Error("Form not created");

      await supabase.from("activity").insert({
        user_id: auth.user.id,
        kind: "form_created",
        message: `Created form "${name.trim()}"`,
      });
      return data.id as string;
    },
    onSuccess: (id) => {
      toast.success("Form created. Add your fields.");
      navigate({ to: "/forms/$formId", params: { formId: id } });
    },
    onError: () => toast.error("Could not create that form."),
  });

  return (
    <AppShell title="Create form" description="Name it, pick a starting point and start building">
      <div className="mx-auto max-w-xl">
        <form
          className="surface-card space-y-5 p-5 sm:p-6"
          onSubmit={(e) => {
            e.preventDefault();
            if (name.trim().length < 2) {
              toast.error("Give your form a name of at least 2 characters.");
              return;
            }
            create.mutate();
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="form-name">Form name</Label>
            <Input
              id="form-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lead capture — spring campaign"
              maxLength={80}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="form-desc">Description</Label>
            <Textarea
              id="form-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this form for?"
              rows={3}
              maxLength={300}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="template">Start from</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger id="template">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blank">Blank form (name + email)</SelectItem>
                  {STARTER_TEMPLATES.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}
                {(templates ?? []).map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {templateId !== "blank" ? <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewId(templateId)}>Preview selected template</Button> : null}
          </div>
          <Button type="submit" className="w-full" disabled={create.isPending}>
            Create form
          </Button>
        </form>
        <Dialog open={previewId !== null} onOpenChange={(open) => { if (!open) setPreviewId(null); }}><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>Template preview</DialogTitle></DialogHeader>{(() => { const starter = STARTER_TEMPLATES.find((t) => t.id === previewId); const custom = templates?.find((t) => t.id === previewId); if (starter) return <FormPresentation name={starter.name} description={starter.description} eyebrow={starter.eyebrow} layoutType={starter.layoutType} fields={starter.fields} submitLabel={starter.submitLabel} disabled />; if (custom) return <FormPresentation name={custom.name} description={custom.description} offerName={custom.offer_name} offerId={custom.offer_id} offerLogoUrl={custom.offer_logo_url} layoutType={custom.layout_type} fields={custom.fields as unknown as FormField[]} submitLabel="Submit" disabled />; return null; })()}</DialogContent></Dialog>
      </div>
    </AppShell>
  );
}
