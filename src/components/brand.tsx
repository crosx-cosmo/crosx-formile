import { FORMILE_LOGO_URL } from "@/assets/formile-logo";
import { cn } from "@/lib/utils";

export function FormileLogo({
  className,
  variant = "light",
}: {
  className?: string;
  variant?: "light" | "dark";
}) {
  return (
    <img
      src={FORMILE_LOGO_URL}
      alt="Formile"
      className={cn(
        "h-8 w-auto object-contain",
        variant === "dark" && "brightness-0 invert",
        className,
      )}
    />
  );
}

export function FormileMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary font-display text-base font-bold text-primary-foreground",
        className,
      )}
    >
      F
    </span>
  );
}

