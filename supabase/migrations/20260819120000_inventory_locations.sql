-- Depósitos por punto. Cada POP nace con una Despensa (default + vendible).
-- Movimientos y capas FIFO quedan atados a un depósito.

CREATE TABLE IF NOT EXISTS public.inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_sellable BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT inventory_locations_name_nonempty
    CHECK (char_length(trim(name)) > 0),
  CONSTRAINT inventory_locations_default_not_archived
    CHECK (NOT (is_default AND archived_at IS NOT NULL))
);

COMMENT ON TABLE public.inventory_locations IS
  'Depósitos de stock de un punto. El default (Despensa) no se archiva.';

CREATE UNIQUE INDEX IF NOT EXISTS inventory_locations_one_default_uidx
  ON public.inventory_locations (pop_id)
  WHERE is_default AND archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS inventory_locations_pop_name_active_uidx
  ON public.inventory_locations (pop_id, lower(trim(name)))
  WHERE archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_locations_pop
  ON public.inventory_locations (pop_id, archived_at, sort_order, name);

DROP TRIGGER IF EXISTS inventory_locations_set_updated_at ON public.inventory_locations;
CREATE TRIGGER inventory_locations_set_updated_at
  BEFORE UPDATE ON public.inventory_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.inventory_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_locations_select_pop ON public.inventory_locations;
CREATE POLICY inventory_locations_select_pop ON public.inventory_locations
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS inventory_locations_insert_pop ON public.inventory_locations;
CREATE POLICY inventory_locations_insert_pop ON public.inventory_locations
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS inventory_locations_update_pop ON public.inventory_locations;
CREATE POLICY inventory_locations_update_pop ON public.inventory_locations
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS inventory_locations_delete_pop ON public.inventory_locations;
CREATE POLICY inventory_locations_delete_pop ON public.inventory_locations
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id) AND is_default = false);

CREATE OR REPLACE FUNCTION public.ensure_pop_inventory_default_location(p_pop_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id
  INTO v_id
  FROM public.inventory_locations
  WHERE pop_id = p_pop_id
    AND is_default
    AND archived_at IS NULL
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  BEGIN
    INSERT INTO public.inventory_locations (
      pop_id,
      name,
      is_default,
      is_sellable,
      sort_order
    )
    VALUES (p_pop_id, 'Despensa', true, true, 0)
    RETURNING id INTO v_id;
  EXCEPTION
    WHEN unique_violation THEN
      SELECT id
      INTO v_id
      FROM public.inventory_locations
      WHERE pop_id = p_pop_id
        AND is_default
        AND archived_at IS NULL
      LIMIT 1;
  END;

  RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.ensure_pop_inventory_default_location(UUID) IS
  'Devuelve el depósito default del punto; lo crea (Despensa) si no existe.';

GRANT EXECUTE ON FUNCTION public.ensure_pop_inventory_default_location(UUID)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.pops_after_insert_inventory_location()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_pop_inventory_default_location(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pops_after_insert_inventory_location ON public.pops;
CREATE TRIGGER pops_after_insert_inventory_location
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_after_insert_inventory_location();

INSERT INTO public.inventory_locations (pop_id, name, is_default, is_sellable, sort_order)
SELECT p.id, 'Despensa', true, true, 0
FROM public.pops p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.inventory_locations l
  WHERE l.pop_id = p.id
    AND l.is_default
    AND l.archived_at IS NULL
);

ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS location_id UUID
    REFERENCES public.inventory_locations (id) ON DELETE RESTRICT;

ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS transfer_group_id UUID;

ALTER TABLE public.inventory_movements
  ADD COLUMN IF NOT EXISTS counterpart_location_id UUID
    REFERENCES public.inventory_locations (id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.inventory_movements.location_id IS
  'Depósito donde ocurre el movimiento.';
COMMENT ON COLUMN public.inventory_movements.transfer_group_id IS
  'Une transfer_out y transfer_in del mismo traslado.';
COMMENT ON COLUMN public.inventory_movements.counterpart_location_id IS
  'El otro depósito del traslado (origen o destino).';

ALTER TABLE public.inventory_cost_layers
  ADD COLUMN IF NOT EXISTS location_id UUID
    REFERENCES public.inventory_locations (id) ON DELETE RESTRICT;

COMMENT ON COLUMN public.inventory_cost_layers.location_id IS
  'Depósito dueño de la capa FIFO.';

UPDATE public.inventory_movements m
SET location_id = l.id
FROM public.inventory_locations l
WHERE m.location_id IS NULL
  AND l.pop_id = m.pop_id
  AND l.is_default
  AND l.archived_at IS NULL;

UPDATE public.inventory_cost_layers c
SET location_id = l.id
FROM public.inventory_locations l
WHERE c.location_id IS NULL
  AND l.pop_id = c.pop_id
  AND l.is_default
  AND l.archived_at IS NULL;

ALTER TABLE public.inventory_movements
  ALTER COLUMN location_id SET NOT NULL;

ALTER TABLE public.inventory_cost_layers
  ALTER COLUMN location_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_movements_location_article
  ON public.inventory_movements (pop_id, location_id, article_id);

CREATE INDEX IF NOT EXISTS idx_inventory_movements_transfer_group
  ON public.inventory_movements (pop_id, transfer_group_id)
  WHERE transfer_group_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_cost_layers_location_fifo
  ON public.inventory_cost_layers (pop_id, location_id, article_id, received_at);

CREATE OR REPLACE FUNCTION public.inventory_location_belongs_to_pop()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.inventory_locations l
    WHERE l.id = NEW.location_id
      AND l.pop_id = NEW.pop_id
  ) THEN
    RAISE EXCEPTION 'El depósito no pertenece a este punto.';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.inventory_movement_counterpart_belongs_to_pop()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.counterpart_location_id IS NOT NULL
    AND NOT EXISTS (
      SELECT 1
      FROM public.inventory_locations l
      WHERE l.id = NEW.counterpart_location_id
        AND l.pop_id = NEW.pop_id
    )
  THEN
    RAISE EXCEPTION 'El depósito de contraparte no pertenece a este punto.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inventory_movements_location_pop ON public.inventory_movements;
CREATE TRIGGER inventory_movements_location_pop
  BEFORE INSERT OR UPDATE OF location_id, pop_id
  ON public.inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.inventory_location_belongs_to_pop();

DROP TRIGGER IF EXISTS inventory_movements_counterpart_pop ON public.inventory_movements;
CREATE TRIGGER inventory_movements_counterpart_pop
  BEFORE INSERT OR UPDATE OF counterpart_location_id, pop_id
  ON public.inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.inventory_movement_counterpart_belongs_to_pop();

DROP TRIGGER IF EXISTS inventory_cost_layers_location_pop ON public.inventory_cost_layers;
CREATE TRIGGER inventory_cost_layers_location_pop
  BEFORE INSERT OR UPDATE OF location_id, pop_id
  ON public.inventory_cost_layers
  FOR EACH ROW
  EXECUTE FUNCTION public.inventory_location_belongs_to_pop();
