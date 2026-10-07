import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FIELD_TYPES, newField, type FieldType, type FormField } from "@/lib/formile";

export function FieldsEditor({
  fields,
  onChange,
}: {
  fields: FormField[];
  onChange: (fields: FormField[]) => void;
}) {
  function update(id: string, patch: Partial<FormField>) {
    onChange(fields.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [item] = next.splice(index, 1);
    if (!item) return;
    next.splice(target, 0, item);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="surface-card p-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <p className="truncate text-sm font-semibold">
              {index + 1}. {field.label || "Untitled field"}
            </p>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Move up"
                onClick={() => move(index, -1)}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Move down"
                onClick={() => move(index, 1)}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                aria-label="Remove field"
                className="text-destructive hover:text-destructive"
                onClick={() => onChange(fields.filter((f) => f.id !== field.id))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`label-${field.id}`}>Label</Label>
              <Input
                id={`label-${field.id}`}
                value={field.label}
                onChange={(e) => update(field.id, { label: e.target.value })}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`type-${field.id}`}>Type</Label>
              <Select
                value={field.type}
                onValueChange={(value) =>
                  update(field.id, {
                    type: value as FieldType,
                    options: value === "select" ? (field.options ?? ["Option 1"]) : undefined,
                  })
                }
              >
                <SelectTrigger id={`type-${field.id}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FIELD_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {field.type !== "checkbox" ? (
              <div className="space-y-1.5">
                <Label htmlFor={`ph-${field.id}`}>Placeholder</Label>
                <Input
                  id={`ph-${field.id}`}
                  value={field.placeholder ?? ""}
                  onChange={(e) => update(field.id, { placeholder: e.target.value })}
                  maxLength={80}
                />
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor={`help-${field.id}`}>Help text</Label>
              <Input
                id={`help-${field.id}`}
                value={field.helpText ?? ""}
                onChange={(e) => update(field.id, { helpText: e.target.value })}
                maxLength={120}
              />
            </div>

            {field.type === "select" ? (
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor={`opts-${field.id}`}>Options (comma separated)</Label>
                <Input
                  id={`opts-${field.id}`}
                  value={(field.options ?? []).join(", ")}
                  onChange={(e) =>
                    update(field.id, {
                      options: e.target.value
                        .split(",")
                        .map((o) => o.trim())
                        .filter(Boolean),
                    })
                  }
                  maxLength={300}
                />
              </div>
            ) : null}

            {field.type !== "checkbox" && field.type !== "select" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor={`min-${field.id}`}>Min length</Label>
                  <Input
                    id={`min-${field.id}`}
                    type="number"
                    min={0}
                    value={field.minLength ?? ""}
                    onChange={(e) =>
                      update(field.id, {
                        minLength: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`max-${field.id}`}>Max length</Label>
                  <Input
                    id={`max-${field.id}`}
                    type="number"
                    min={0}
                    value={field.maxLength ?? ""}
                    onChange={(e) =>
                      update(field.id, {
                        maxLength: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                  />
                </div>
              </>
            ) : null}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
            <Label htmlFor={`req-${field.id}`} className="text-sm">
              Required field
            </Label>
            <Switch
              id={`req-${field.id}`}
              checked={field.required}
              onCheckedChange={(checked) => update(field.id, { required: checked })}
            />
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={() => onChange([...fields, newField()])}>
        <Plus className="h-4 w-4" /> Add field
      </Button>
    </div>
  );
}
