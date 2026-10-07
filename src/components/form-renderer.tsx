import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validateValue, type FormField } from "@/lib/formile";

export type Answers = Record<string, string | boolean>;

export function FormRenderer({
  fields,
  submitLabel,
  disabled,
  busy,
  onSubmit,
}: {
  fields: FormField[];
  submitLabel: string;
  disabled?: boolean;
  busy?: boolean;
  onSubmit?: (answers: Answers) => void | Promise<void>;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(id: string, value: string | boolean) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    const next: Record<string, string> = {};
    for (const field of fields) {
      const message = validateValue(field, answers[field.id]);
      if (message) next[field.id] = message;
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    await onSubmit?.(answers);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => (
        <div key={field.id} className={field.type === "textarea" || field.type === "checkbox" ? "space-y-1.5 sm:col-span-2" : "space-y-1.5"}>
          {field.type === "checkbox" ? (
            <label className="flex items-start gap-3">
              <Checkbox
                checked={answers[field.id] === true}
                onCheckedChange={(checked) => set(field.id, checked === true)}
                disabled={disabled}
                className="mt-0.5"
              />
              <span className="text-sm font-medium">
                {field.label}
                {field.required ? <span className="text-primary"> *</span> : null}
              </span>
            </label>
          ) : (
            <>
              <Label htmlFor={field.id}>
                {field.label}
                {field.required ? <span className="text-primary"> *</span> : null}
              </Label>
              {field.type === "textarea" ? (
                <Textarea
                  id={field.id}
                  rows={4}
                  placeholder={field.placeholder}
                  value={(answers[field.id] as string) ?? ""}
                  onChange={(e) => set(field.id, e.target.value)}
                  disabled={disabled}
                  maxLength={field.maxLength ?? 2000}
                />
              ) : field.type === "select" ? (
                <Select
                  value={(answers[field.id] as string) ?? ""}
                  onValueChange={(value) => set(field.id, value)}
                  disabled={disabled ?? false}
                >
                  <SelectTrigger id={field.id}>
                    <SelectValue placeholder={field.placeholder || "Select an option"} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options ?? []).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.id}
                  type={
                    field.type === "email"
                      ? "email"
                      : field.type === "number"
                        ? "number"
                        : field.type === "date"
                          ? "date"
                          : field.type === "phone"
                            ? "tel"
                            : "text"
                  }
                  placeholder={field.placeholder}
                  value={(answers[field.id] as string) ?? ""}
                  onChange={(e) => set(field.id, e.target.value)}
                  disabled={disabled}
                  maxLength={field.maxLength ?? 255}
                />
              )}
            </>
          )}
          {field.helpText ? (
            <p className="text-xs text-muted-foreground">{field.helpText}</p>
          ) : null}
          {errors[field.id] ? (
            <p className="text-xs font-medium text-destructive">{errors[field.id]}</p>
          ) : null}
        </div>
      ))}

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground sm:col-span-2">No fields added yet.</p>
      ) : (
        <Button type="submit" size="lg" className="w-full sm:col-span-2" disabled={disabled || busy}>
          {busy ? "Submitting…" : submitLabel}
        </Button>
      )}
    </form>
  );
}
