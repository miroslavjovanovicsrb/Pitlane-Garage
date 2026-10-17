import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PitLane Garage — Your Vehicle Library" },
      { name: "description", content: "Collect and showcase race cars, classics and motorcycles in a shared garage library." },
      { property: "og:title", content: "PitLane Garage — Your Vehicle Library" },
      { property: "og:description", content: "Collect and showcase race cars, classics and motorcycles in a shared garage library." },
    ],
  }),
  component: Index,
});

function Index() {
  const { data } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_stats");
      if (error) throw error;
      return data as { vehicles: number; users: number };
    },
  });

  return (
    <section className="relative overflow-hidden">
      <img src={hero} alt="" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover object-right" />
      <div className="hero-overlay absolute inset-0" />
      <div className="checker-strip absolute right-0 top-0 h-full w-6 opacity-30" />
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-center px-4 py-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Lights out</p>
        <h1 className="mt-4 max-w-2xl text-6xl sm:text-8xl">Your Vehicle<br />Library</h1>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">
          Every machine is a book on the shelf. Browse the shared garage, or park your own race cars, classics and bikes.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" asChild className="font-display uppercase tracking-widest">
            <Link to="/collection">View collection <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="font-display uppercase tracking-widest">
            <Link to="/add">Add vehicle</Link>
          </Button>
        </div>
        <div className="mt-14 flex gap-10">
          {[["Vehicles", data?.vehicles], ["Drivers", data?.users]].map(([label, val]) => (
            <div key={label as string} className="border-l-2 border-primary pl-4">
              <div className="font-mono text-4xl font-semibold">{val ?? "—"}</div>
              <div className="font-display text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
