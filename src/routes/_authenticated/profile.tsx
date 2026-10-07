import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Formile" },
      { name: "description", content: "Your personal details and password." },
      { property: "og:title", content: "Profile — Formile" },
      { property: "og:description", content: "Manage your Formile account details." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user!.id)
        .maybeSingle();
      if (error) throw error;
      return { profile: data, email: auth.user?.email ?? "" };
    },
  });

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!data?.profile) return;
    setFullName(data.profile.full_name ?? "");
    setCompany(data.profile.company ?? "");
    setJobTitle(data.profile.job_title ?? "");
  }, [data]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      const { error } = await supabase.from("profiles").upsert({
        id: auth.user!.id,
        full_name: fullName.trim(),
        company: company.trim(),
        job_title: jobTitle.trim(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated.");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: () => toast.error("Could not update your profile."),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Password changed.");
      setCurrentPassword("");
      setNewPassword("");
    },
    onError: (error) =>
      toast.error(error instanceof Error ? error.message : "Could not change your password."),
  });

  if (isLoading) {
    return (
      <AppShell title="Profile">
        <Skeleton className="h-80 rounded-xl" />
      </AppShell>
    );
  }

  const initials = (fullName || data?.email || "F").slice(0, 2).toUpperCase();

  return (
    <AppShell title="Profile" description="Personal details and password">
      <div className="surface-card mb-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 p-5">
        <Avatar className="h-14 w-14 shrink-0">
          <AvatarFallback className="bg-primary font-display text-base font-bold text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold">{fullName || "Your name"}</p>
          <p className="truncate text-sm text-muted-foreground">{data?.email}</p>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="details" className="flex-1 sm:flex-none">
            Personal details
          </TabsTrigger>
          <TabsTrigger value="password" className="flex-1 sm:flex-none">
            Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-4">
          <div className="surface-card max-w-xl space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="full-name">Full name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={data?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="job">Job title</Label>
              <Input
                id="job"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                maxLength={80}
              />
            </div>
            <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>
              Save details
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="password" className="mt-4">
          <div className="surface-card max-w-xl space-y-4 p-5">
            <div className="space-y-1.5">
              <Label htmlFor="current">Current password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new">New password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            <Button
              onClick={() => {
                if (newPassword.length < 6) {
                  toast.error("New password must be at least 6 characters.");
                  return;
                }
                changePassword.mutate();
              }}
              disabled={changePassword.isPending}
            >
              Change password
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
