import { useState, type FormEvent } from "react";
import { CATEGORIES, vehicleSchema, type VehicleInput } from "@/lib/vehicles";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type Values = Record<keyof VehicleInput, string>;
const empty: Values = { brand: "", model: "", year: "", category: "", engine: "", horsepower: "", color: "", description: "", image_url: "" };

const selectCls = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function VehicleForm({ initial, submitLabel, onSubmit }: { initial?: Partial<Values>; submitLabel: string; onSubmit: (v: VehicleInput) => Promise<void> }) {
  const [values, setValues] = useState<Values>({ ...empty, ...initial });
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [busy, setBusy] = useState(false);

  const set = (k: keyof Values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function handle(e: FormEvent) {
    e.preventDefault();
    const parsed = vehicleSchema.safeParse(values);
    if (!parsed.success) {
      const errs: typeof errors = {};
      for (const i of parsed.error.issues) errs[i.path[0] as keyof Values] ??= i.message;
      setErrors(errs);
      return;
    }
    setErrors({});
    setBusy(true);
    try { await onSubmit(parsed.data); } finally { setBusy(false); }
  }

  const field = (k: keyof Values, label: string, props: Record<string, unknown> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={k} className="font-display text-xs uppercase tracking-widest text-muted-foreground">{label}</Label>
      <Input id={k} value={values[k]} onChange={set(k)} aria-invalid={!!errors[k]} {...props} />
      {errors[k] && <p className="text-xs text-destructive">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={handle} noValidate className="grid gap-5 sm:grid-cols-2">
      {field("brand", "Brand", { placeholder: "Ferrari" })}
      {field("model", "Model", { placeholder: "F40" })}
      {field("year", "Year", { type: "number", inputMode: "numeric", placeholder: "1987" })}
      <div className="space-y-1.5">
        <Label htmlFor="category" className="font-display text-xs uppercase tracking-widest text-muted-foreground">Category</Label>
        <select id="category" value={values.category} onChange={set("category")} className={selectCls} aria-invalid={!!errors.category}>
          <option value="" className="bg-card">Select category…</option>
          {CATEGORIES.map((c) => <option key={c} value={c} className="bg-card">{c}</option>)}
        </select>
        {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
      </div>
      {field("engine", "Engine", { placeholder: "2.9L twin-turbo V8" })}
      {field("horsepower", "Horsepower", { type: "number", inputMode: "numeric", placeholder: "471" })}
      {field("color", "Color", { placeholder: "Rosso Corsa" })}
      {field("image_url", "Image URL (optional)", { type: "url", placeholder: "https://…" })}
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="description" className="font-display text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
        <Textarea id="description" rows={5} value={values.description} onChange={set("description")} placeholder="Tell its story…" />
        {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="lg" disabled={busy} className="w-full font-display uppercase tracking-widest sm:w-auto">
          {busy ? "Saving…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}
