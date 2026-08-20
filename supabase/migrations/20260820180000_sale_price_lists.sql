-- Listas de precios de venta por POP.
-- Principal (is_default) no se elimina; sale_price de artículo/receta sigue siendo ese precio.

CREATE TABLE IF NOT EXISTS public.price_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT price_lists_name_nonempty CHECK (char_length(trim(name)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS price_lists_pop_name_unique
  ON public.price_lists (pop_id, lower(trim(name)));

CREATE UNIQUE INDEX IF NOT EXISTS price_lists_one_default_per_pop
  ON public.price_lists (pop_id)
  WHERE is_default;

CREATE INDEX IF NOT EXISTS idx_price_lists_pop_sort
  ON public.price_lists (pop_id, sort_order, name);

CREATE TABLE IF NOT EXISTS public.price_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  price_list_id UUID NOT NULL REFERENCES public.price_lists (id) ON DELETE CASCADE,
  item_kind TEXT NOT NULL,
  item_id UUID NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT price_list_items_kind_check CHECK (item_kind IN ('article', 'recipe')),
  CONSTRAINT price_list_items_amount_nonneg CHECK (amount >= 0),
  CONSTRAINT price_list_items_unique UNIQUE (price_list_id, item_kind, item_id)
);

CREATE INDEX IF NOT EXISTS idx_price_list_items_pop_list
  ON public.price_list_items (pop_id, price_list_id, item_kind);

CREATE INDEX IF NOT EXISTS idx_price_list_items_item
  ON public.price_list_items (item_kind, item_id);

CREATE OR REPLACE FUNCTION public.ensure_pop_default_price_list(p_pop_id UUID)
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
  FROM public.price_lists
  WHERE pop_id = p_pop_id
    AND is_default
  LIMIT 1;

  IF v_id IS NOT NULL THEN
    RETURN v_id;
  END IF;

  INSERT INTO public.price_lists (pop_id, name, is_default, sort_order)
  VALUES (p_pop_id, 'Principal', true, 0)
  RETURNING id INTO v_id;

  RETURN v_id;
EXCEPTION
  WHEN unique_violation THEN
    SELECT id
    INTO v_id
    FROM public.price_lists
    WHERE pop_id = p_pop_id
      AND is_default
    LIMIT 1;
    RETURN v_id;
END;
$$;

COMMENT ON FUNCTION public.ensure_pop_default_price_list(UUID) IS
  'Devuelve la lista Principal del punto; la crea si no existe.';

GRANT EXECUTE ON FUNCTION public.ensure_pop_default_price_list(UUID)
  TO authenticated;

CREATE OR REPLACE FUNCTION public.pops_after_insert_price_list()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_pop_default_price_list(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pops_after_insert_price_list ON public.pops;
CREATE TRIGGER pops_after_insert_price_list
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_after_insert_price_list();

CREATE OR REPLACE FUNCTION public.price_lists_protect_default()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.is_default THEN
      RAISE EXCEPTION 'No se puede eliminar la lista principal.';
    END IF;
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' AND OLD.is_default AND NEW.is_default IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'La lista principal no puede dejar de ser la predeterminada.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS price_lists_protect_default ON public.price_lists;
CREATE TRIGGER price_lists_protect_default
  BEFORE UPDATE OR DELETE ON public.price_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.price_lists_protect_default();

DROP TRIGGER IF EXISTS price_lists_set_updated_at ON public.price_lists;
CREATE TRIGGER price_lists_set_updated_at
  BEFORE UPDATE ON public.price_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS price_list_items_set_updated_at ON public.price_list_items;
CREATE TRIGGER price_list_items_set_updated_at
  BEFORE UPDATE ON public.price_list_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.price_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_list_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS price_lists_select ON public.price_lists;
CREATE POLICY price_lists_select ON public.price_lists
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS price_lists_insert ON public.price_lists;
CREATE POLICY price_lists_insert ON public.price_lists
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS price_lists_update ON public.price_lists;
CREATE POLICY price_lists_update ON public.price_lists
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS price_lists_delete ON public.price_lists;
CREATE POLICY price_lists_delete ON public.price_lists
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS price_list_items_select ON public.price_list_items;
CREATE POLICY price_list_items_select ON public.price_list_items
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS price_list_items_insert ON public.price_list_items;
CREATE POLICY price_list_items_insert ON public.price_list_items
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS price_list_items_update ON public.price_list_items;
CREATE POLICY price_list_items_update ON public.price_list_items
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS price_list_items_delete ON public.price_list_items;
CREATE POLICY price_list_items_delete ON public.price_list_items
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

INSERT INTO public.price_lists (pop_id, name, is_default, sort_order)
SELECT p.id, 'Principal', true, 0
FROM public.pops p
WHERE NOT EXISTS (
  SELECT 1
  FROM public.price_lists l
  WHERE l.pop_id = p.id
    AND l.is_default
);

COMMENT ON TABLE public.price_lists IS
  'Listas de precios de venta por POP. is_default es Principal: se renombra, no se borra.';
COMMENT ON TABLE public.price_list_items IS
  'Precio de un artículo o receta en una lista extra. Vacío = usa Principal (sale_price).';
