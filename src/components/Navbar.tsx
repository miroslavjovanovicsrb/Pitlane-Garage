import { Link, useNavigate } from "@tanstack/react-router";
import { Flag, LogOut, Plus, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const linkCls = "font-display text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors";

export function Navbar() {
  const { session, username } = useAuth();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="checker-strip h-6 w-6 rounded-sm" />
          <span className="font-display text-xl font-extrabold uppercase tracking-wide">
            PitLane<span className="text-primary">Garage</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 sm:flex">
          <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: "!text-foreground" }}>Home</Link>
          <Link to="/collection" className={linkCls} activeProps={{ className: "!text-foreground" }}>Collection</Link>
          <Link to="/add" className={linkCls} activeProps={{ className: "!text-foreground" }}>Add Vehicle</Link>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {session ? (
            <>
              <span className="hidden items-center gap-1.5 font-mono text-xs text-muted-foreground md:flex">
                <User className="h-3.5 w-3.5" /> {username ?? "…"}
              </span>
              <Button size="sm" variant="ghost" onClick={signOut}><LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Log out</span></Button>
            </>
          ) : (
            <Button size="sm" asChild><Link to="/auth"><Flag className="h-4 w-4" /> Log in</Link></Button>
          )}
        </div>
      </div>
      <nav className="flex justify-around border-t border-border py-2 sm:hidden">
        <Link to="/" className={linkCls} activeOptions={{ exact: true }} activeProps={{ className: "!text-foreground" }}>Home</Link>
        <Link to="/collection" className={linkCls} activeProps={{ className: "!text-foreground" }}>Collection</Link>
        <Link to="/add" className={linkCls} activeProps={{ className: "!text-foreground" }}><Plus className="inline h-3.5 w-3.5" /> Add</Link>
      </nav>
    </header>
  );
}
