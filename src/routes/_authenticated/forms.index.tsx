import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { AppShell, EmptyState } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/formile";
import { useState } from "react";
import { OfferLogo } from "@/components/offer-logo-field";

export const Route = createFileRoute("/_authenticated/forms/")({
  head: () => ({
    meta: [
      { title: "Manage forms — Formile" },
      { name: "description", content: "Customize fields, validation, preview and publish forms." },
      { property: "og:title", content: "Manage forms — Formile" },
      { property: "og:description", content: "All your Formile forms in one list." },
    ],
  }),
  component: ManageForms,
});

function ManageForms() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["forms"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forms")
        .select("id,name,description,slug,status,views,fields,created_at,offer_id,offer_name,offer_logo_url")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Form deleted.");
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: () => toast.error("Could not delete that form."),
  });

  const forms = (data ?? []).filter((f) =>
    f.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <AppShell
      title="Manage forms"
      description="Field customization, validation, preview and publishing"
      actions={
        <Button asChild size="sm">
          <Link to="/forms/new" search={{}}>
            <Plus className="h-4 w-4" /> Create form
          </Link>
        </Button>
      }
    >
      <div className="mb-4 max-w-sm">
        <Input
          placeholder="Search forms"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxLength={80}
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <EmptyState
          title="No forms found"
          description="Create a form to start capturing submissions from your audience."
          action={
            <Button asChild size="sm">
              <Link to="/forms/new" search={{}}>
                <Plus className="h-4 w-4" /> Create form
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {forms.map((form) => {
            const fieldCount = Array.isArray(form.fields) ? form.fields.length : 0;
            return (
              <li key={form.id} className="surface-card p-4 sm:p-5">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <div className="flex min-w-0 gap-3">
                    <OfferLogo path={form.offer_logo_url} alt={form.offer_name || form.name} className="h-11 w-11 shrink-0" />
                    <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate font-display text-base font-semibold">{form.name}</h2>
                      <Badge variant={form.status === "published" ? "default" : "secondary"}>
                        {form.status}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {form.description || "No description"}
                    </p>
                    {form.offer_id ? <p className="mt-2 text-xs font-semibold text-primary">Offer ID · {form.offer_id}</p> : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {fieldCount} fields • {form.views} views • created {formatDate(form.created_at)}
                    </p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline" className="shrink-0">
                    <Link to="/forms/$formId" params={{ formId: form.id }}>
                      Edit
                    </Link>
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/f/${form.slug}`);
                      toast.success("Public link copied.");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" /> Copy link
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a href={`/f/${form.slug}`} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove.mutate(form.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AppShell>
  );
}
