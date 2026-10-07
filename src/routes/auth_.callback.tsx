import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/backend/client";
import { FormileLogo } from "@/components/brand";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth_/callback")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Verifying email — Formile" },
      { name: "description", content: "Confirming your Formile account." },
      { property: "og:title", content: "Verifying email — Formile" },
      { property: "og:description", content: "Confirming your Formile account." },
    ],
  }),
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let done = false;
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const query = new URLSearchParams(window.location.search);
    const errDesc = hash.get("error_description") || query.get("error_description");
    if (errDesc) {
      setError(
        /expired|invalid/i.test(errDesc)
          ? "This confirmation link has expired or was already used. Request a new one from the sign-in page."
          : errDesc.replace(/\+/g, " "),
      );
      return;
    }

    async function finish() {
      const code = query.get("code");
      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exErr) {
          setError("This confirmation link is invalid or expired. Request a new one from the sign-in page.");
          return;
        }
      }
      const { data } = await supabase.auth.getUser();
      if (done) return;
      if (data.user?.email_confirmed_at) {
        done = true;
        toast.success("Email confirmed. Welcome to Formile.");
        navigate({ to: "/dashboard", replace: true });
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") finish();
    });
    finish();
    const t = setTimeout(() => {
      if (!done) setError("We couldn't verify this link. It may have expired — sign in to request a new one.");
    }, 8000);
    return () => {
      done = true;
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-5">
      <div className="surface-card w-full max-w-sm p-6 text-center">
        <FormileLogo className="mx-auto mb-6 h-9" />
        {error ? (
          <>
            <AlertTriangle className="mx-auto h-8 w-8 text-destructive" />
            <h1 className="mt-3 font-display text-lg font-bold">Link not valid</h1>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button asChild className="mt-5 w-full">
              <Link to="/auth">Back to sign in</Link>
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto h-7 w-7 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">Confirming your email…</p>
          </>
        )}
      </div>
    </div>
  );
}
