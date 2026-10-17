import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Car, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/vehicles/$id")({
  head: () => ({
    meta: [
      { title: "Spec Sheet — PitLane Garage" },
      { name: "description", content: "Full vehicle spec sheet in the PitLane Garage library." },
      { property: "og:title", content: "Spec Sheet — PitLane Garage" },
      { property: "og:description", content: "Full vehicle spec sheet in the PitLane Garage library." },
    ],
  }),
  component: Detail,
});

function Detail() {
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

  async function remove() {
    const { error } = await supabase.from("vehicles").delete().eq("id", id);
    if (error) return toast.error("Couldn't delete vehicle");
    toast.success("Vehicle removed from the garage");
    qc.invalidateQueries({ queryKey: ["vehicles"] });
    qc.invalidateQueries({ queryKey: ["stats"] });
    navigate({ to: "/collection" });
  }

  if (isLoading) return <div className="mx-auto max-w-5xl px-4 py-12"><Skeleton className="h-96 rounded-lg" /></div>;
  if (!v) return (
    <div className="mx-auto max-w-5xl px-4 py-24 text-center">
      <h1 className="text-4xl">Vehicle not found</h1>
      <Button asChild className="mt-6"><Link to="/collection">Back to collection</Link></Button>
    </div>
  );

  const isOwner = session?.user.id === v.owner_id;
  const specs: [string, string][] = [
    ["Brand", v.brand], ["Model", v.model], ["Year", String(v.year)], ["Category", v.category],
    ["Engine", v.engine], ["Horsepower", `${v.horsepower} HP`], ["Color", v.color],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link to="/collection" className="inline-flex items-center gap-1 font-mono text-xs uppercase text-muted-foreground hover:text-foreground"><ArrowLeft className="h-3.5 w-3.5" /> Collection</Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-primary">{v.category} · {v.year}</p>
          <h1 className="mt-2 text-5xl sm:text-7xl">{v.brand} <span className="text-muted-foreground">{v.model}</span></h1>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="secondary" asChild><Link to="/edit/$id" params={{ id }}><Pencil className="h-4 w-4" /> Edit</Link></Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="h-4 w-4" /> Delete</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
                  <AlertDialogDescription>{v.brand} {v.model} will be permanently removed.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[3fr_2fr]">
        <div className="race-card aspect-[16/10] bg-surface">
          {v.image_url ? <img src={v.image_url} alt={`${v.brand} ${v.model}`} className="h-full w-full object-cover" /> : (
            <div className="relative flex h-full items-center justify-center"><div className="checker-fade absolute inset-0" /><Car className="h-16 w-16 text-muted-foreground" /></div>
          )}
        </div>
        <div className="race-card p-6 pl-7">
          <h2 className="text-xl">Spec sheet</h2>
          <dl className="mt-4 divide-y divide-border">
            {specs.map(([k, val]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="text-right font-mono text-sm">{val || "—"}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 border-t border-border pt-4 font-mono text-xs text-muted-foreground">
            Owner <span className="text-foreground">@{v.profiles?.username ?? "unknown"}</span> · Added {new Date(v.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>

      {v.description && (
        <div className="mt-8 max-w-3xl">
          <h2 className="text-xl">About</h2>
          <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{v.description}</p>
        </div>
      )}
    </div>
  );
}
