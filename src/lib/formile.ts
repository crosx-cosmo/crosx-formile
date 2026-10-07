export type FieldType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "textarea"
  | "select"
  | "checkbox"
  | "date";

export type FormField = {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string | undefined;
  helpText?: string | undefined;
  required: boolean;
  minLength?: number | undefined;
  maxLength?: number | undefined;
  options?: string[] | undefined;
};

export const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "email", label: "Email" },
  { value: "number", label: "Number" },
  { value: "phone", label: "Phone" },
  { value: "select", label: "Dropdown" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Date" },
];

export function newField(type: FieldType = "text"): FormField {
  return {
    id: crypto.randomUUID(),
    label: "Untitled field",
    type,
    placeholder: "",
    required: false,
    options: type === "select" ? ["Option 1", "Option 2"] : undefined,
  };
}

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `${base || "form"}-${Math.random().toString(36).slice(2, 7)}`;
}

export function validateValue(field: FormField, raw: unknown): string | null {
  const value = typeof raw === "string" ? raw.trim() : raw;
  if (field.required) {
    if (field.type === "checkbox" ? raw !== true : !value) return `${field.label} is required`;
  }
  if (typeof value !== "string" || value === "") return null;
  if (field.minLength && value.length < field.minLength)
    return `${field.label} must be at least ${field.minLength} characters`;
  if (field.maxLength && value.length > field.maxLength)
    return `${field.label} must be under ${field.maxLength} characters`;
  if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return `${field.label} must be a valid email`;
  if (field.type === "number" && Number.isNaN(Number(value)))
    return `${field.label} must be a number`;
  return null;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export const TEMPLATE_CATEGORIES = [
  "General",
  "Lead gen",
  "Feedback",
  "Event",
  "Support",
  "Recruiting",
];
