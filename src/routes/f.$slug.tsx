import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import type { Answers } from "@/components/form-renderer";
import { FormPresentation } from "@/components/form-presentation";
import { FormileLogo } from "@/components/brand";
import { Skeleton } from "@/components/ui/skeleton";
import type { FormField } from "@/lib/formile";

export const Route = createFileRoute("/f/$slug")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Form — Formile" },
      { name: "description", content: "Fill in this form powered by Formile." },
      { property: "og:title", content: "Form — Formile" },
      { property: "og:description", content: "Fill in this form powered by Formile." },
    ],
  }),
  component: PublicForm,
});

function PublicForm() {
  const { slug } = Route.useParams();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["public-form", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("id,user_id,name,description,fields,submit_label,success_message,status,redirect_url,offer_id,offer_name,offer_logo_url,layout_type")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (!data) return;
    // Supabase queries are lazy — must be awaited/then'd to actually run.
    void supabase.rpc("increment_form_view", { form_slug: slug }).then(() => {});
  }, [data, slug]);

  async function submit(answers: Answers) {
    if (!data) return;
    setBusy(true);
    const labelled: Record<string, unknown> = {};
    for (const field of (data.fields as unknown as FormField[]) ?? []) {
      labelled[field.label] = answers[field.id] ?? "";
    }
    const { error } = await supabase.from("submissions").insert({
      form_id: data.id,
      user_id: data.user_id,
      data: labelled as never,
    });
    setBusy(false);
    if (error) {
      toast.error("We couldn't send your response. Please try again.");
      return;
    }
    if (data.redirect_url) {
      try {
        const url = new URL(data.redirect_url);
        if (url.protocol === "https:") { window.location.assign(url.toString()); return; }
      } catch { toast.error("Your response was saved, but the redirect address is invalid."); }
    }
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex justify-center"><FormileLogo className="h-8" /></div>

        {isLoading ? (
          <Skeleton className="h-96 rounded-xl" />
        ) : !data ? (
          <div className="surface-card p-8 text-center">
            <h1 className="font-display text-xl font-bold">Form unavailable</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This form doesn't exist or isn't published right now.
            </p>
          </div>
        ) : done ? (
          <div className="surface-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
            <h1 className="mt-4 font-display text-xl font-bold">Response received</h1>
            <p className="mt-2 text-sm text-muted-foreground">{data.success_message}</p>
          </div>
        ) : (
          <FormPresentation
                name={data.name}
                description={data.description}
                offerName={data.offer_name}
                offerId={data.offer_id}
                offerLogoUrl={data.offer_logo_url}
                layoutType={data.layout_type}
                fields={(data.fields as unknown as FormField[]) ?? []}
                submitLabel={data.submit_label}
                busy={busy}
                onSubmit={submit}
              />
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">Powered by Formile</p>
      </div>
    </div>
  );
}
