import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { AppShell, EmptyState } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/formile";
import { STARTER_TEMPLATES } from "@/lib/starter-templates";
import { FormPresentation } from "@/components/form-presentation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/templates/")({
  head: () => ({
    meta: [
      { title: "Manage templates — Formile" },
      { name: "description", content: "Reusable form blueprints you can launch in one click." },
      { property: "og:title", content: "Manage templates — Formile" },
      { property: "og:description", content: "Your reusable Formile templates." },
    ],
  }),
  component: ManageTemplates,
});

function ManageTemplates() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("templates")
        .select("id,name,category,description,fields,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted.");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: () => toast.error("Could not delete that template."),
  });

  return (
    <AppShell
      title="Manage templates"
      description="Reusable field sets for faster form launches"
      actions={
        <Button asChild size="sm">
          <Link to="/templates/new">
            <Plus className="h-4 w-4" /> Create template
          </Link>
        </Button>
      }
    >
      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4"><div><p className="eyebrow text-primary">Formile collection</p><h2 className="mt-1 font-display text-xl font-bold">Premium starter templates</h2><p className="mt-1 text-sm text-muted-foreground">Original responsive layouts designed for high-value campaigns.</p></div><Sparkles className="h-5 w-5 text-primary" /></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {STARTER_TEMPLATES.map((template) => <article key={template.id} className="surface-card group overflow-hidden p-0 hover:-translate-y-0.5 hover:shadow-lift"><div className="border-b bg-muted/40 p-5"><div className="mb-8 flex items-center justify-between"><span className="eyebrow text-primary">{template.eyebrow}</span><Badge variant="secondary">{template.category}</Badge></div><div className="h-1.5 w-14 rounded-full bg-primary" /><h3 className="mt-4 font-display text-lg font-bold">{template.name}</h3><p className="mt-1 min-h-10 text-sm text-muted-foreground">{template.description}</p></div><div className="flex items-center justify-between gap-2 p-4"><Dialog><DialogTrigger asChild><Button size="sm" variant="outline"><Eye className="h-4 w-4" /> Preview</Button></DialogTrigger><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto"><DialogHeader><DialogTitle>{template.name}</DialogTitle></DialogHeader><FormPresentation name={template.name} description={template.description} eyebrow={template.eyebrow} layoutType={template.layoutType} fields={template.fields} submitLabel={template.submitLabel} disabled /></DialogContent></Dialog><Button asChild size="sm"><Link to="/forms/new" search={{ template: template.id }}>Use template</Link></Button></div></article>)}
        </div>
      </section>
      <div className="mb-4"><p className="eyebrow">Your library</p><h2 className="mt-1 font-display text-xl font-bold">Custom templates</h2></div>
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="Save a set of fields as a template and reuse it across campaigns."
          action={
            <Button asChild size="sm">
              <Link to="/templates/new">
                <Plus className="h-4 w-4" /> Create template
              </Link>
            </Button>
          }
        />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {(data ?? []).map((template) => (
            <li key={template.id} className="surface-card flex flex-col p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <h2 className="truncate font-display text-base font-semibold">{template.name}</h2>
                <Badge variant="secondary">{template.category}</Badge>
              </div>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                {template.description || "No description"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {Array.isArray(template.fields) ? template.fields.length : 0} fields • added{" "}
                {formatDate(template.created_at)}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                <Button asChild size="sm" variant="outline">
                  <Link to="/templates/$templateId" params={{ templateId: template.id }}>
                    Edit
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/forms/new" search={{}}>Use in new form</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove.mutate(template.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
