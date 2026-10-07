import { useEffect, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/backend/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LogoItem = { name: string; path: string; url: string };

async function signedUrl(path: string) {
  const { data } = await supabase.storage.from("offer-logos").createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? "";
}

export function OfferLogoField({ value, onChange }: { value: string; onChange: (path: string) => void }) {
  const [logos, setLogos] = useState<LogoItem[]>([]);
  const [preview, setPreview] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    const { data } = await supabase.storage.from("offer-logos").list(auth.user.id, { limit: 50, sortBy: { column: "created_at", order: "desc" } });
    const items = await Promise.all((data ?? []).filter((item) => item.name !== ".emptyFolderPlaceholder").map(async (item) => {
      const path = `${auth.user?.id}/${item.name}`;
      return { name: item.name, path, url: await signedUrl(path) };
    }));
    setLogos(items);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { if (value) signedUrl(value).then(setPreview); else setPreview(""); }, [value]);

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) { toast.error("Choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Logo files must be 5 MB or smaller."); return; }
    setBusy(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) { setBusy(false); return; }
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
    const path = `${auth.user.id}/${crypto.randomUUID()}-${safe}`;
    const { error } = await supabase.storage.from("offer-logos").upload(path, file, { contentType: file.type });
    setBusy(false);
    if (error) { toast.error("Logo upload failed."); return; }
    onChange(path);
    await load();
    toast.success("Offer logo uploaded.");
  }

  return <div className="space-y-3">
    <Label htmlFor="offer-logo">Offer logo</Label>
    <div className="flex flex-wrap items-center gap-3">
      {preview ? <img src={preview} alt="Selected offer logo" className="h-14 w-14 rounded-md border bg-card object-contain p-1.5" /> : <div className="grid h-14 w-14 place-items-center rounded-md border border-dashed bg-muted text-muted-foreground"><ImagePlus className="h-5 w-5" /></div>}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm" className="cursor-pointer">
          <label htmlFor="offer-logo">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Upload logo</label>
        </Button>
        <Input id="offer-logo" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="sr-only" disabled={busy} onChange={(e) => { const file = e.target.files?.[0]; if (file) upload(file); e.target.value = ""; }} />
        {value ? <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")}><Trash2 className="h-4 w-4" /> Remove</Button> : null}
      </div>
    </div>
    {logos.length > 0 ? <div><p className="mb-2 text-xs text-muted-foreground">Or select an uploaded logo</p><div className="flex flex-wrap gap-2">{logos.map((logo) => <button key={logo.path} type="button" aria-label={`Select ${logo.name}`} onClick={() => onChange(logo.path)} className={`grid h-12 w-12 place-items-center rounded-md border bg-card p-1 transition-all hover:border-primary ${value === logo.path ? "border-primary ring-2 ring-primary/15" : ""}`}><img src={logo.url} alt="" className="max-h-full max-w-full object-contain" /></button>)}</div></div> : null}
    <p className="text-xs text-muted-foreground">Use a real PNG, JPG, WebP or SVG logo. It appears only on forms using it.</p>
  </div>;
}

export function OfferLogo({ path, alt, className = "h-10 w-10" }: { path?: string | null | undefined; alt: string; className?: string | undefined }) {
  const [url, setUrl] = useState("");
  useEffect(() => { if (path) signedUrl(path).then(setUrl); else setUrl(""); }, [path]);
  if (!url) return null;
  return <img src={url} alt={alt} className={`${className} rounded-md border bg-card object-contain p-1`} />;
}
