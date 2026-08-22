-- Saldo vivo por POP + artículo + depósito.
-- Lo mantiene un trigger sobre inventory_movements; el historial no se recorre para saber cuánto hay.

CREATE TABLE IF NOT EXISTS public.inventory_on_hand (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  article_id UUID NOT NULL REFERENCES public.articles (id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.inventory_locations (id) ON DELETE RESTRICT,
  quantity NUMERIC(18, 6) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, article_id, location_id)
);

COMMENT ON TABLE public.inventory_on_hand IS
  'Saldo actual de stock. Se actualiza con cada fila de inventory_movements.';

CREATE INDEX IF NOT EXISTS idx_inventory_on_hand_pop
  ON public.inventory_on_hand (pop_id);

CREATE INDEX IF NOT EXISTS idx_inventory_on_hand_pop_location
  ON public.inventory_on_hand (pop_id, location_id);

ALTER TABLE public.inventory_on_hand ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS inventory_on_hand_select_pop ON public.inventory_on_hand;
CREATE POLICY inventory_on_hand_select_pop ON public.inventory_on_hand
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

CREATE OR REPLACE FUNCTION public.apply_inventory_on_hand_delta(
  p_pop_id UUID,
  p_article_id UUID,
  p_location_id UUID,
  p_delta NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_location_id IS NULL OR p_delta = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.inventory_on_hand (
    pop_id,
    article_id,
    location_id,
    quantity
  )
  VALUES (
    p_pop_id,
    p_article_id,
    p_location_id,
    p_delta
  )
  ON CONFLICT (pop_id, article_id, location_id)
  DO UPDATE SET
    quantity = public.inventory_on_hand.quantity + EXCLUDED.quantity,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.inventory_movements_sync_on_hand()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM public.apply_inventory_on_hand_delta(
      OLD.pop_id,
      OLD.article_id,
      OLD.location_id,
      -OLD.quantity_delta
    );
    RETURN OLD;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF OLD.pop_id IS DISTINCT FROM NEW.pop_id
      OR OLD.article_id IS DISTINCT FROM NEW.article_id
      OR OLD.location_id IS DISTINCT FROM NEW.location_id
      OR OLD.quantity_delta IS DISTINCT FROM NEW.quantity_delta
    THEN
      PERFORM public.apply_inventory_on_hand_delta(
        OLD.pop_id,
        OLD.article_id,
        OLD.location_id,
        -OLD.quantity_delta
      );
      PERFORM public.apply_inventory_on_hand_delta(
        NEW.pop_id,
        NEW.article_id,
        NEW.location_id,
        NEW.quantity_delta
      );
    END IF;
    RETURN NEW;
  END IF;

  PERFORM public.apply_inventory_on_hand_delta(
    NEW.pop_id,
    NEW.article_id,
    NEW.location_id,
    NEW.quantity_delta
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS inventory_movements_sync_on_hand ON public.inventory_movements;
CREATE TRIGGER inventory_movements_sync_on_hand
  AFTER INSERT
    OR UPDATE OF pop_id, article_id, location_id, quantity_delta
    OR DELETE
  ON public.inventory_movements
  FOR EACH ROW
  EXECUTE FUNCTION public.inventory_movements_sync_on_hand();

INSERT INTO public.inventory_on_hand (
  pop_id,
  article_id,
  location_id,
  quantity
)
SELECT
  pop_id,
  article_id,
  location_id,
  ROUND(SUM(quantity_delta), 6)
FROM public.inventory_movements
GROUP BY pop_id, article_id, location_id
ON CONFLICT (pop_id, article_id, location_id)
DO UPDATE SET
  quantity = EXCLUDED.quantity,
  updated_at = now();
