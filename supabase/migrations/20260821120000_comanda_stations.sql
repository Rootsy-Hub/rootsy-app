-- Estaciones de comanda por POP. Destino al que una categoría manda la comanda.
-- Semilla: Cocina y Barra (mismo recorte que Fudo / Restó).

CREATE TABLE IF NOT EXISTS public.comanda_stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT comanda_stations_name_nonempty CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS comanda_stations_pop_name_unique
  ON public.comanda_stations (pop_id, lower(trim(name)));

CREATE INDEX IF NOT EXISTS idx_comanda_stations_pop_sort
  ON public.comanda_stations (pop_id, sort_order, name);

ALTER TABLE public.recipe_categories
  ADD COLUMN IF NOT EXISTS station_id UUID
  REFERENCES public.comanda_stations (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recipe_categories_station
  ON public.recipe_categories (station_id)
  WHERE station_id IS NOT NULL;

DROP TRIGGER IF EXISTS comanda_stations_set_updated_at ON public.comanda_stations;
CREATE TRIGGER comanda_stations_set_updated_at
  BEFORE UPDATE ON public.comanda_stations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.comanda_stations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS comanda_stations_select ON public.comanda_stations;
CREATE POLICY comanda_stations_select ON public.comanda_stations
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comanda_stations_insert ON public.comanda_stations;
CREATE POLICY comanda_stations_insert ON public.comanda_stations
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comanda_stations_update ON public.comanda_stations;
CREATE POLICY comanda_stations_update ON public.comanda_stations
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS comanda_stations_delete ON public.comanda_stations;
CREATE POLICY comanda_stations_delete ON public.comanda_stations
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

CREATE OR REPLACE FUNCTION public.seed_pop_comanda_stations (p_pop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.comanda_stations (pop_id, name, sort_order)
  SELECT p_pop_id, v.name, v.sort_order
  FROM (
    VALUES
      ('Cocina', 0),
      ('Barra', 1)
  ) AS v (name, sort_order)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.comanda_stations cs
    WHERE cs.pop_id = p_pop_id
      AND lower(trim(cs.name)) = lower(v.name)
  );
END;
$$;

COMMENT ON FUNCTION public.seed_pop_comanda_stations (UUID) IS
  'Crea las estaciones Cocina y Barra si el POP aún no las tiene.';

GRANT EXECUTE ON FUNCTION public.seed_pop_comanda_stations (UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.pops_after_insert_comanda_stations ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_pop_comanda_stations (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pops_after_insert_comanda_stations ON public.pops;
CREATE TRIGGER pops_after_insert_comanda_stations
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_after_insert_comanda_stations ();

DO $$
DECLARE
  pid UUID;
BEGIN
  FOR pid IN SELECT id FROM public.pops
  LOOP
    PERFORM public.seed_pop_comanda_stations (pid);
  END LOOP;
END $$;

COMMENT ON TABLE public.comanda_stations IS
  'Estaciones de comanda por POP (Cocina, Barra, Parrilla…). Destino, no el ticket.';
COMMENT ON COLUMN public.recipe_categories.station_id IS
  'Estación a la que se manda la comanda de las recetas de esta categoría. Null = no se comanda.';
