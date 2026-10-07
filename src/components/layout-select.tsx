import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LAYOUT_OPTIONS } from "@/lib/starter-templates";

export function LayoutSelect({ id, value, onChange }: { id?: string; value: string; onChange: (v: string) => void }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}><SelectValue /></SelectTrigger>
      <SelectContent>
        {(["Campaign page", "Form card"] as const).map((group) => (
          <SelectGroup key={group}>
            <SelectLabel>{group}</SelectLabel>
            {LAYOUT_OPTIONS.filter((o) => o.group === group).map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
