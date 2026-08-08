-- Promociones: combos y ofertas por cantidad para Mesas/Mostrador (fase 1 — admin).

CREATE TABLE IF NOT EXISTS public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  promotion_type TEXT NOT NULL,
  pricing_mode TEXT NOT NULL DEFAULT 'fixed_total',
  fixed_price NUMERIC(14, 2),
  discount_mode TEXT,
  discount_value NUMERIC(14, 4),
  buy_quantity INTEGER,
  benefit_quantity INTEGER,
  benefit_discount_pct NUMERIC(5, 2),
  apply_benefit_to TEXT,
  auto_apply BOOLEAN NOT NULL DEFAULT TRUE,
  show_in_menu BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  valid_from DATE,
  valid_until DATE,
  valid_time_start TIME,
  valid_time_end TIME,
  schedule_days SMALLINT[] NOT NULL DEFAULT ARRAY[0, 1, 2, 3, 4, 5, 6]::SMALLINT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT promotions_name_nonempty CHECK (char_length(trim(name)) > 0),
  CONSTRAINT promotions_type_valid CHECK (
    promotion_type IN ('combo', 'quantity_deal')
  ),
  CONSTRAINT promotions_pricing_mode_valid CHECK (
    pricing_mode IN ('fixed_total', 'percent_off', 'fixed_off')
  ),
  CONSTRAINT promotions_discount_mode_valid CHECK (
    discount_mode IS NULL OR discount_mode IN ('porcentaje', 'fijo')
  ),
  CONSTRAINT promotions_apply_benefit_valid CHECK (
    apply_benefit_to IS NULL OR apply_benefit_to IN ('cheapest', 'most_expensive')
  ),
  CONSTRAINT promotions_date_range_valid CHECK (
    valid_from IS NULL
    OR valid_until IS NULL
    OR valid_from <= valid_until
  ),
  CONSTRAINT promotions_schedule_days_valid CHECK (
    cardinality(schedule_days) >= 1
    AND schedule_days <@ ARRAY[0, 1, 2, 3, 4, 5, 6]::SMALLINT[]
  ),
  CONSTRAINT promotions_combo_pricing CHECK (
    promotion_type <> 'combo'
    OR (
      (
        pricing_mode = 'fixed_total'
        AND fixed_price IS NOT NULL
        AND fixed_price >= 0
      )
      OR (
        pricing_mode = 'percent_off'
        AND discount_mode = 'porcentaje'
        AND discount_value IS NOT NULL
        AND discount_value >= 0
        AND discount_value <= 100
      )
      OR (
        pricing_mode = 'fixed_off'
        AND discount_mode = 'fijo'
        AND discount_value IS NOT NULL
        AND discount_value >= 0
      )
    )
  ),
  CONSTRAINT promotions_quantity_deal_fields CHECK (
    promotion_type <> 'quantity_deal'
    OR (
      buy_quantity IS NOT NULL
      AND buy_quantity >= 1
      AND benefit_quantity IS NOT NULL
      AND benefit_quantity >= 1
      AND benefit_discount_pct IS NOT NULL
      AND benefit_discount_pct >= 0
      AND benefit_discount_pct <= 100
      AND apply_benefit_to IS NOT NULL
    )
  )
);

CREATE INDEX IF NOT EXISTS idx_promotions_pop_active
  ON public.promotions (pop_id, is_active, sort_order, name);

CREATE TABLE IF NOT EXISTS public.promotion_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_id UUID NOT NULL REFERENCES public.promotions (id) ON DELETE CASCADE,
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT promotion_slots_label_nonempty CHECK (char_length(trim(label)) > 0),
  CONSTRAINT promotion_slots_quantity_pos CHECK (quantity >= 1)
);

CREATE INDEX IF NOT EXISTS idx_promotion_slots_promotion
  ON public.promotion_slots (promotion_id, sort_order);

CREATE TABLE IF NOT EXISTS public.promotion_slot_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promotion_slot_id UUID NOT NULL REFERENCES public.promotion_slots (id) ON DELETE CASCADE,
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles (id) ON DELETE RESTRICT,
  recipe_id UUID REFERENCES public.recipes (id) ON DELETE RESTRICT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT promotion_slot_options_one_ref CHECK (
    (
      article_id IS NOT NULL
      AND recipe_id IS NULL
    )
    OR (
      article_id IS NULL
      AND recipe_id IS NOT NULL
    )
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_promotion_slot_options_article_unique
  ON public.promotion_slot_options (promotion_slot_id, article_id)
  WHERE article_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_promotion_slot_options_recipe_unique
  ON public.promotion_slot_options (promotion_slot_id, recipe_id)
  WHERE recipe_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_promotion_slot_options_slot
  ON public.promotion_slot_options (promotion_slot_id, sort_order);

DROP TRIGGER IF EXISTS promotions_set_updated_at ON public.promotions;
CREATE TRIGGER promotions_set_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotion_slot_options ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS promotions_select ON public.promotions;
CREATE POLICY promotions_select ON public.promotions
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotions_insert ON public.promotions;
CREATE POLICY promotions_insert ON public.promotions
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotions_update ON public.promotions;
CREATE POLICY promotions_update ON public.promotions
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotions_delete ON public.promotions;
CREATE POLICY promotions_delete ON public.promotions
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slots_select ON public.promotion_slots;
CREATE POLICY promotion_slots_select ON public.promotion_slots
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slots_insert ON public.promotion_slots;
CREATE POLICY promotion_slots_insert ON public.promotion_slots
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slots_update ON public.promotion_slots;
CREATE POLICY promotion_slots_update ON public.promotion_slots
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slots_delete ON public.promotion_slots;
CREATE POLICY promotion_slots_delete ON public.promotion_slots
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slot_options_select ON public.promotion_slot_options;
CREATE POLICY promotion_slot_options_select ON public.promotion_slot_options
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slot_options_insert ON public.promotion_slot_options;
CREATE POLICY promotion_slot_options_insert ON public.promotion_slot_options
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slot_options_update ON public.promotion_slot_options;
CREATE POLICY promotion_slot_options_update ON public.promotion_slot_options
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS promotion_slot_options_delete ON public.promotion_slot_options;
CREATE POLICY promotion_slot_options_delete ON public.promotion_slot_options
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

COMMENT ON TABLE public.promotions IS
  'Promociones de venta: combos multi-ítem u ofertas por cantidad (2x1, etc.).';
COMMENT ON TABLE public.promotion_slots IS
  'Ítems de una promoción combo (ej. cerveza, pizza).';
COMMENT ON TABLE public.promotion_slot_options IS
  'Productos o recetas elegibles dentro de un ítem de promoción.';

DO $$
DECLARE
  r RECORD;
  grants JSONB;
  new_perms JSONB := '["promotions:read","promotions:create","promotions:update","promotions:delete"]'::jsonb;
  p TEXT;
BEGIN
  FOR r IN
    SELECT id, permission_grants
    FROM public.roles
    WHERE lower(name) IN ('administrator', 'owner', 'administrador', 'dueño', 'dueno')
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    FOR p IN SELECT jsonb_array_elements_text(new_perms)
    LOOP
      IF NOT grants @> to_jsonb(p) THEN
        grants := grants || to_jsonb(p);
      END IF;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;
END $$;
