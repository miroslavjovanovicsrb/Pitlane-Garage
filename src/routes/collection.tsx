import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/vehicles";
import { VehicleCard } from "@/components/VehicleCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/collection")({
  head: () => ({
    meta: [
      { title: "Collection — PitLane Garage" },
      { name: "description", content: "Browse every vehicle in the PitLane Garage library." },
      { property: "og:title", content: "Collection — PitLane Garage" },
      { property: "og:description", content: "Browse every vehicle in the PitLane Garage library." },
    ],
  }),
  component: Collection,
});

function Collection() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vehicles").select("id,brand,model,year,horsepower,category,image_url").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (data ?? []).filter((v) =>
      (cat === "All" || v.category === cat) &&
      (!s || `${v.brand} ${v.model} ${v.category}`.toLowerCase().includes(s)));
  }, [data, q, cat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-5xl sm:text-6xl">The Collection</h1>
      <p className="mt-2 font-mono text-sm text-muted-foreground">{data ? `${filtered.length} / ${data.length} vehicles` : "Loading grid…"}</p>

      <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brand, model, category" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          {["All", ...CATEGORIES].map((c) => (
            <Button key={c} size="sm" variant={cat === c ? "default" : "secondary"} onClick={() => setCat(c)} className="font-display uppercase tracking-wider">{c}</Button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading && Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-lg" />)}
      </div>
      {error && <p className="text-destructive">Couldn't load vehicles. Please refresh.</p>}
      {data && filtered.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <h2 className="text-2xl">{data.length === 0 ? "The garage is empty" : "No matches"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{data.length === 0 ? "Be the first to park a vehicle." : "Try a different search or category."}</p>
          {data.length === 0 && <Button asChild className="mt-4"><Link to="/add">Add vehicle</Link></Button>}
        </div>
      )}
      {filtered.length > 0 && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => <VehicleCard key={v.id} v={v} />)}
        </div>
      )}
    </div>
  );
}
