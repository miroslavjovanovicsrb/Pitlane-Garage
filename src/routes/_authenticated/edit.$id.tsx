import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { VehicleForm } from "@/components/VehicleForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/edit/$id")({
  head: () => ({
    meta: [
      { title: "Edit Vehicle — PitLane Garage" },
      { name: "description", content: "Update a vehicle's spec sheet." },
      { property: "og:title", content: "Edit Vehicle — PitLane Garage" },
      { property: "og:description", content: "Update a vehicle's spec sheet." },
    ],
  }),
  component: EditVehicle,
});

function EditVehicle() {
  const { id } = Route.useParams();
  const { session } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: v, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("*, profiles(username)").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading || !session) return <div className="mx-auto max-w-3xl px-4 py-12"><Skeleton className="h-96" /></div>;
  if (!v || v.owner_id !== session.user.id) return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center">
      <h1 className="text-4xl">Not your vehicle</h1>
      <p className="mt-2 text-muted-foreground">Only the owner can edit this spec sheet.</p>
      <Button asChild className="mt-6"><Link to="/collection">Back to collection</Link></Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-5xl">Edit {v.brand} {v.model}</h1>
      <div className="race-card mt-8 p-6 pl-7 hover:transform-none">
        <VehicleForm
          submitLabel="Save changes"
          initial={{
            brand: v.brand, model: v.model, year: String(v.year), category: v.category, engine: v.engine,
            horsepower: String(v.horsepower), color: v.color, description: v.description, image_url: v.image_url ?? "",
          }}
          onSubmit={async (vals) => {
            const { error } = await supabase.from("vehicles").update({ ...vals, image_url: vals.image_url || null }).eq("id", id);
            if (error) return void toast.error("Couldn't save changes");
            toast.success("Changes saved");
            qc.invalidateQueries({ queryKey: ["vehicle", id] });
            qc.invalidateQueries({ queryKey: ["vehicles"] });
            navigate({ to: "/vehicles/$id", params: { id } });
          }}
        />
      </div>
    </div>
  );
}
