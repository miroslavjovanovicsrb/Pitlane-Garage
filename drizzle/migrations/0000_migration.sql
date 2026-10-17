CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand text NOT NULL,
  model text NOT NULL,
  year int NOT NULL,
  category text NOT NULL CHECK (category IN ('Race Car','Street Car','Classic','Motorcycle','Prototype')),
  engine text NOT NULL DEFAULT '',
  horsepower int NOT NULL DEFAULT 0,
  color text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  image_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vehicles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Vehicles are public" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Owners insert" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners update" ON public.vehicles FOR UPDATE TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete" ON public.vehicles FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base text; uname text; n int := 0;
BEGIN
  base := coalesce(nullif(trim(NEW.raw_user_meta_data->>'username'),''), split_part(NEW.email,'@',1), 'driver');
  uname := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = uname) LOOP
    n := n + 1; uname := base || n;
  END LOOP;
  INSERT INTO public.profiles (id, username) VALUES (NEW.id, uname);
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.get_stats()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT json_build_object('vehicles', (SELECT count(*) FROM public.vehicles), 'users', (SELECT count(*) FROM public.profiles));
$$;
GRANT EXECUTE ON FUNCTION public.get_stats() TO anon, authenticated;