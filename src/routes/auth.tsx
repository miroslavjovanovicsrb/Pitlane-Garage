import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({ redirect: typeof s["redirect"] === "string" ? (s["redirect"] as string) : undefined }),
  head: () => ({
    meta: [
      { title: "Log in — PitLane Garage" },
      { name: "description", content: "Log in or register to build your vehicle collection." },
      { property: "og:title", content: "Log in — PitLane Garage" },
      { property: "og:description", content: "Log in or register to build your vehicle collection." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z.string().min(6, "At least 6 characters").max(72),
});
const usernameSchema = z.string().trim().min(3, "At least 3 characters").max(24, "Max 24 characters").regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and _ only");

function safePath(p?: string) {
  if (!p) return "/collection";
  try {
    const u = new URL(p, window.location.origin);
    return u.origin === window.location.origin ? u.pathname + u.search : "/collection";
  } catch { return "/collection"; }
}

function AuthPage() {
  const { redirect } = Route.useSearch();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (session) navigate({ to: safePath(redirect), replace: true });
  }, [session, redirect, navigate]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const errs: { username?: string; email?: string; password?: string } = {};
    const p = schema.safeParse({ email, password });
    if (!p.success) p.error.issues.forEach((i) => (errs[i.path[0] as "email" | "password"] ??= i.message));
    if (mode === "register") {
      const u = usernameSchema.safeParse(username);
      if (!u.success) errs.username = u.error.issues[0]?.message ?? "Invalid username";
    }
    setErrors(errs);
    if (Object.keys(errs).length || !p.success) return;
    setBusy(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword(p.data);
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        ...p.data,
        options: { emailRedirectTo: window.location.origin, data: { username: username.trim() } },
      });
      if (error) toast.error(error.message);
      else if (!data.session) setSent(true);
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="checker-strip mb-6 h-4 w-24 rounded-sm" />
      <h1 className="text-5xl">{mode === "login" ? "Log in" : "Register"}</h1>
      <p className="mt-2 text-muted-foreground">{mode === "login" ? "Back to the pit lane." : "Join the garage and start your collection."}</p>
      {sent ? (
        <div className="race-card mt-8 p-6 pl-7">
          <h2 className="text-2xl">Check your email</h2>
          <p className="mt-2 text-sm text-muted-foreground">We sent a confirmation link to {email}. Click it to activate your account.</p>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="race-card mt-8 space-y-4 p-6 pl-7 hover:transform-none">
          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>
          <Button type="submit" disabled={busy} className="w-full font-display uppercase tracking-widest">
            {busy ? "…" : mode === "login" ? "Log in" : "Create account"}
          </Button>
          <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErrors({}); }} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
            {mode === "login" ? "No account? Register" : "Have an account? Log in"}
          </button>
        </form>
      )}
    </div>
  );
}
