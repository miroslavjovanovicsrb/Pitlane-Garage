import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { VehicleForm } from "@/components/VehicleForm";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/add")({
  head: () => ({
    meta: [
      { title: "Add Vehicle — PitLane Garage" },
      { name: "description", content: "Park a new vehicle in your PitLane Garage collection." },
      { property: "og:title", content: "Add Vehicle — PitLane Garage" },
      { property: "og:description", content: "Park a new vehicle in your PitLane Garage collection." },
    ],
  }),
  component: AddVehicle,
});

function AddVehicle() {
  const qc = useQueryClient();
  const [saved, setSaved] = useState<{ id: string; name: string } | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-5xl">Add Vehicle</h1>
      <p className="mt-2 text-muted-foreground">Fill in the spec sheet to park a new machine in the library.</p>
      {saved && (
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-success/40 bg-success/10 p-4">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span className="font-medium">{saved.name} added to the garage.</span>
          <Button size="sm" variant="secondary" asChild className="ml-auto"><Link to="/vehicles/$id" params={{ id: saved.id }}>View spec sheet</Link></Button>
        </div>
      )}
      <div className="race-card mt-8 p-6 pl-7 hover:transform-none">
        <VehicleForm
          key={formKey}
          submitLabel="Add to garage"
          onSubmit={async (v) => {
            const { data: u } = await supabase.auth.getUser();
            if (!u.user) return void toast.error("Please log in again");
            const { data, error } = await supabase.from("vehicles")
              .insert({ ...v, image_url: v.image_url || null, owner_id: u.user.id })
              .select("id").single();
            if (error) return void toast.error("Couldn't save vehicle");
            toast.success("Vehicle saved");
            setSaved({ id: data.id, name: `${v.brand} ${v.model}` });
            setFormKey((k) => k + 1);
            qc.invalidateQueries({ queryKey: ["vehicles"] });
            qc.invalidateQueries({ queryKey: ["stats"] });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </div>
  );
}
