import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2, ShieldCheck, LineChart, Layers } from "lucide-react";

import { supabase } from "@/integrations/backend/client";
import { FormileLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign in — Formile" },
      { name: "description", content: "Sign in to your Formile workspace to manage forms." },
      { property: "og:title", content: "Sign in — Formile" },
      { property: "og:description", content: "Access your Formile workspace." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentConfirmation, setSentConfirmation] = useState(false);

  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email_confirmed_at) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  const redirectTo = () => `${window.location.origin}/auth/callback`;

  function showVerify() {
    setSentConfirmation(true);
    toast.info("Please confirm your email address to continue.");
  }

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo() },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Verification email sent. Check your inbox.");
      setCooldown(60);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail) || password.length < 6) {
      toast.error("Enter a valid email and a password of at least 6 characters.");
      return;
    }
    setEmail(cleanEmail);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { full_name: fullName.trim() }, emailRedirectTo: redirectTo() },
        });
        if (error) throw error;
        // Existing account: Supabase returns a user with no identities.
        if (data.user && data.user.identities?.length === 0) {
          toast.error("An account with this email already exists. Sign in instead.");
          setMode("signin");
          return;
        }
        if (data.session && data.user?.email_confirmed_at) {
          navigate({ to: "/dashboard", replace: true });
          return;
        }
        if (data.session) await supabase.auth.signOut();
        setCooldown(60);
        showVerify();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) {
          if (/not confirmed/i.test(error.message)) {
            showVerify();
            return;
          }
          if (/invalid login/i.test(error.message))
            throw new Error("Incorrect email or password.");
          throw error;
        }
        if (!data.user?.email_confirmed_at) {
          await supabase.auth.signOut();
          showVerify();
          return;
        }
        toast.success("Signed in.");
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset() {
    if (!email) {
      toast.error("Enter your email first, then tap reset.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset link sent to your inbox.");
  }

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 lg:flex">
        <Link to="/" className="font-display text-xl font-bold text-sidebar-accent-foreground">
          Formile
        </Link>
        <div className="max-w-sm">
          <h2 className="font-display text-3xl font-bold leading-tight text-sidebar-accent-foreground">
            Forms that actually convert.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-sidebar-foreground/65">
            Build, publish and measure every form from one workspace — with submissions and
            conversion reporting built in.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              { icon: Layers, text: "Drag-free field builder with live preview" },
              { icon: LineChart, text: "Submission and conversion analytics" },
              { icon: ShieldCheck, text: "Private by default, scoped to your account" },
            ].map((item) => (
              <li key={item.text} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sidebar-accent text-sidebar-primary">
                  <item.icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-sm text-sidebar-foreground/80">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-sidebar-foreground/40">
          © {new Date().getFullYear()} Formile. All rights reserved.
        </p>
      </div>

      <div className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-block">
            <FormileLogo className="h-10" />
          </Link>

          {sentConfirmation ? (
            <div className="surface-card p-6">
              <h1 className="font-display text-xl font-bold">Confirm your email</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a confirmation link to <span className="font-medium">{email}</span>. Click
                it to activate your Formile workspace. You'll be signed in automatically.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Didn't get it? Check spam, or resend below.
              </p>
              <Button
                className="mt-5 w-full"
                onClick={handleResend}
                disabled={resending || cooldown > 0}
              >
                {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
              </Button>
              <Button
                className="mt-5 w-full"
                variant="outline"
                onClick={() => {
                  setSentConfirmation(false);
                  setMode("signin");
                }}
              >
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">
                {mode === "signin" ? "Welcome back" : "Create your workspace"}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Sign in to manage your forms and reports."
                  : "Start building forms in under a minute."}
              </p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                {mode === "signup" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ada Lovelace"
                      maxLength={80}
                    />
                  </div>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    maxLength={255}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {mode === "signin" ? (
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Forgot?
                      </button>
                    ) : null}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "New to Formile?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                >
                  {mode === "signin" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
