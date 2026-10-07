import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, RefreshCw } from "lucide-react";

import { supabase } from "@/integrations/backend/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Formile" },
      {
        name: "description",
        content: "General, notification, security and integration settings for your workspace.",
      },
      { property: "og:title", content: "Settings — Formile" },
      { property: "og:description", content: "Configure your Formile workspace." },
    ],
  }),
  component: SettingsPage,
});

type Settings = {
  workspace_name: string;
  timezone: string;
  date_format: string;
  notify_new_submission: boolean;
  notify_weekly_digest: boolean;
  notify_product_updates: boolean;
  two_factor_enabled: boolean;
  session_timeout_minutes: number;
  api_key: string;
  webhook_url: string | null;
};

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", auth.user!.id)
        .maybeSingle();
      if (error) throw error;
      if (data) return data;
      const created = await supabase
        .from("user_settings")
        .insert({ user_id: auth.user!.id })
        .select("*")
        .single();
      if (created.error) throw created.error;
      return created.data;
    },
  });

  const [form, setForm] = useState<Settings | null>(null);
  useEffect(() => {
    if (data) setForm(data as Settings);
  }, [data]);

  const save = useMutation({
    mutationFn: async (patch: Partial<Settings>) => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("user_settings")
        .update(patch)
        .eq("user_id", auth.user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved.");
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
    onError: () => toast.error("Could not save your settings."),
  });

  if (isLoading || !form) {
    return (
      <AppShell title="Settings">
        <Skeleton className="h-80 rounded-xl" />
      </AppShell>
    );
  }

  const set = (patch: Partial<Settings>) => setForm({ ...form, ...patch });
  const toggle = (patch: Partial<Settings>) => {
    set(patch);
    save.mutate(patch);
  };

  return (
    <AppShell title="Settings" description="Workspace, notifications, security and integrations">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-4">
          <div className="surface-card max-w-xl space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="ws">Workspace name</Label>
              <Input
                id="ws"
                value={form.workspace_name}
                onChange={(e) => set({ workspace_name: e.target.value })}
                maxLength={60}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="tz">Timezone</Label>
              <Select value={form.timezone} onValueChange={(v) => set({ timezone: v })}>
                <SelectTrigger id="tz">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["UTC", "Asia/Kolkata", "Europe/London", "America/New_York", "Asia/Dubai"].map(
                    (tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="df">Date format</Label>
              <Select value={form.date_format} onValueChange={(v) => set({ date_format: v })}>
                <SelectTrigger id="df">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() =>
                save.mutate({
                  workspace_name: form.workspace_name.trim(),
                  timezone: form.timezone,
                  date_format: form.date_format,
                })
              }
            >
              Save general settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <div className="surface-card max-w-xl divide-y divide-border p-5">
            {(
              [
                ["notify_new_submission", "New submissions", "Email me whenever a form is filled"],
                ["notify_weekly_digest", "Weekly digest", "A Monday summary of form performance"],
                ["notify_product_updates", "Product updates", "Occasional Formile product news"],
              ] as const
            ).map(([key, title, description]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{title}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
                <Switch
                  checked={form[key]}
                  onCheckedChange={(checked) => toggle({ [key]: checked } as Partial<Settings>)}
                />
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <div className="surface-card max-w-xl space-y-4 p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">
                  Require a second step when signing in
                </p>
              </div>
              <Switch
                checked={form.two_factor_enabled}
                onCheckedChange={(checked) => toggle({ two_factor_enabled: checked })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="timeout">Session timeout (minutes)</Label>
              <Input
                id="timeout"
                type="number"
                min={15}
                max={1440}
                value={form.session_timeout_minutes}
                onChange={(e) => set({ session_timeout_minutes: Number(e.target.value) })}
              />
            </div>
            <Button
              onClick={() =>
                save.mutate({
                  session_timeout_minutes: Math.min(
                    1440,
                    Math.max(15, form.session_timeout_minutes || 60),
                  ),
                })
              }
            >
              Save security settings
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="api" className="mt-4">
          <div className="surface-card max-w-xl space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="api-key">API key</Label>
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] gap-2">
                <Input id="api-key" value={form.api_key} readOnly className="font-mono text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Copy API key"
                  onClick={() => {
                    navigator.clipboard.writeText(form.api_key);
                    toast.success("API key copied.");
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Regenerate API key"
                  onClick={() => {
                    const key = `fml_live_${crypto.randomUUID().replace(/-/g, "")}`;
                    set({ api_key: key });
                    save.mutate({ api_key: key });
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this secret. Regenerating immediately invalidates the old key.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="webhook">Webhook URL</Label>
              <Input
                id="webhook"
                placeholder="https://example.com/hooks/formile"
                value={form.webhook_url ?? ""}
                onChange={(e) => set({ webhook_url: e.target.value })}
                maxLength={300}
              />
              <p className="text-xs text-muted-foreground">
                We post each new submission to this address.
              </p>
            </div>
            <Button onClick={() => save.mutate({ webhook_url: form.webhook_url?.trim() || null })}>
              Save integration settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
