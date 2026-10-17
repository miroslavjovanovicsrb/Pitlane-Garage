import { Link } from "@tanstack/react-router";
import { Car } from "lucide-react";

export type VehicleRow = { id: string; brand: string; model: string; year: number; horsepower: number; category: string; image_url: string | null };

export function VehicleCard({ v }: { v: VehicleRow }) {
  return (
    <Link to="/vehicles/$id" params={{ id: v.id }} className="race-card group block">
      <div className="aspect-[16/9] bg-surface">
        {v.image_url ? (
          <img src={v.image_url} alt={`${v.brand} ${v.model}`} loading="lazy" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
        ) : (
          <div className="relative flex h-full items-center justify-center">
            <div className="checker-fade absolute inset-0" />
            <Car className="h-10 w-10 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="p-4 pl-5">
        <p className="font-mono text-[11px] uppercase tracking-widest text-primary">{v.category}</p>
        <h3 className="mt-1 text-2xl">{v.brand} <span className="text-muted-foreground">{v.model}</span></h3>
        <div className="mt-3 flex gap-6 border-t border-border pt-3 font-mono text-sm">
          <div><span className="block text-[10px] uppercase text-muted-foreground">Year</span>{v.year}</div>
          <div><span className="block text-[10px] uppercase text-muted-foreground">Power</span>{v.horsepower} HP</div>
        </div>
      </div>
    </Link>
  );
}
