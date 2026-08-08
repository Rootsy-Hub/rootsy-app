-- Revision counters per POP for client/server cache invalidation (permissions, catalog, settings).

CREATE TABLE IF NOT EXISTS public.pop_cache_revisions (
  pop_id UUID PRIMARY KEY REFERENCES public.pops (id) ON DELETE CASCADE,
  permissions_rev BIGINT NOT NULL DEFAULT 1,
  catalog_rev BIGINT NOT NULL DEFAULT 1,
  pop_settings_rev BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_cache_revisions_permissions_rev_pos CHECK (permissions_rev >= 1),
  CONSTRAINT pop_cache_revisions_catalog_rev_pos CHECK (catalog_rev >= 1),
  CONSTRAINT pop_cache_revisions_pop_settings_rev_pos CHECK (pop_settings_rev >= 1)
);

COMMENT ON TABLE public.pop_cache_revisions IS
  'Monotonic revision counters per POP; cheap invalidation signal for cached bootstrap/catalog data.';
COMMENT ON COLUMN public.pop_cache_revisions.permissions_rev IS
  'Incremented when roles, grants or memberships change for this POP.';
COMMENT ON COLUMN public.pop_cache_revisions.catalog_rev IS
  'Incremented when sale menu catalog data changes (articles, categories, recipes, promotions).';
COMMENT ON COLUMN public.pop_cache_revisions.pop_settings_rev IS
  'Incremented when POP display/settings fields change.';

INSERT INTO public.pop_cache_revisions (pop_id)
SELECT p.id
FROM public.pops p
ON CONFLICT (pop_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Bump helpers (SECURITY DEFINER — called from triggers only)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_pop_cache_revisions_row (p_pop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_pop_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.pop_cache_revisions (pop_id)
  VALUES (p_pop_id)
  ON CONFLICT (pop_id) DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.bump_pop_cache_revision (
  p_pop_id UUID,
  p_kind TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_pop_id IS NULL OR p_kind IS NULL THEN
    RETURN;
  END IF;

  PERFORM public.ensure_pop_cache_revisions_row(p_pop_id);

  UPDATE public.pop_cache_revisions
  SET
    permissions_rev = permissions_rev + CASE WHEN p_kind = 'permissions' THEN 1 ELSE 0 END,
    catalog_rev = catalog_rev + CASE WHEN p_kind = 'catalog' THEN 1 ELSE 0 END,
    pop_settings_rev = pop_settings_rev + CASE WHEN p_kind = 'pop_settings' THEN 1 ELSE 0 END,
    updated_at = now()
  WHERE pop_id = p_pop_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_bump_pop_catalog_cache_revision ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.pop_id, OLD.pop_id);
  PERFORM public.bump_pop_cache_revision(pid, 'catalog');
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_bump_pop_permissions_on_membership_change ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
BEGIN
  pid := COALESCE(NEW.pop_id, OLD.pop_id);
  PERFORM public.bump_pop_cache_revision(pid, 'permissions');
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_bump_pop_permissions_on_role_change ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.pop_id IS NOT NULL THEN
      PERFORM public.bump_pop_cache_revision(OLD.pop_id, 'permissions');
    END IF;
    RETURN OLD;
  END IF;

  IF NEW.pop_id IS NOT NULL THEN
    PERFORM public.bump_pop_cache_revision(NEW.pop_id, 'permissions');
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE'
    AND OLD.permission_grants IS DISTINCT FROM NEW.permission_grants THEN
    UPDATE public.pop_cache_revisions pcr
    SET
      permissions_rev = pcr.permissions_rev + 1,
      updated_at = now()
    WHERE pcr.pop_id IN (
      SELECT DISTINCT upr.pop_id
      FROM public.user_pop_roles upr
      WHERE upr.role_id = NEW.id
        AND upr.is_active = true
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_bump_pop_settings_cache_revision ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND OLD IS NOT DISTINCT FROM NEW THEN
    RETURN NEW;
  END IF;

  PERFORM public.bump_pop_cache_revision(
    COALESCE(NEW.id, OLD.id),
    'pop_settings'
  );
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_pop_cache_revisions_on_pop_insert ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_pop_cache_revisions_row(NEW.id);
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Triggers — catalog
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS articles_bump_pop_catalog_rev ON public.articles;
CREATE TRIGGER articles_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

DROP TRIGGER IF EXISTS categories_bump_pop_catalog_rev ON public.categories;
CREATE TRIGGER categories_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

DROP TRIGGER IF EXISTS recipes_bump_pop_catalog_rev ON public.recipes;
CREATE TRIGGER recipes_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

DROP TRIGGER IF EXISTS recipe_categories_bump_pop_catalog_rev ON public.recipe_categories;
CREATE TRIGGER recipe_categories_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.recipe_categories
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

DROP TRIGGER IF EXISTS recipe_ingredients_bump_pop_catalog_rev ON public.recipe_ingredients;
CREATE TRIGGER recipe_ingredients_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.recipe_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

DROP TRIGGER IF EXISTS promotions_bump_pop_catalog_rev ON public.promotions;
CREATE TRIGGER promotions_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.promotions
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

DROP TRIGGER IF EXISTS promotion_slots_bump_pop_catalog_rev ON public.promotion_slots;
CREATE TRIGGER promotion_slots_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.promotion_slots
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

DROP TRIGGER IF EXISTS promotion_slot_options_bump_pop_catalog_rev ON public.promotion_slot_options;
CREATE TRIGGER promotion_slot_options_bump_pop_catalog_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.promotion_slot_options
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_catalog_cache_revision ();

-- ---------------------------------------------------------------------------
-- Triggers — permissions
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS user_pop_roles_bump_permissions_rev ON public.user_pop_roles;
CREATE TRIGGER user_pop_roles_bump_permissions_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.user_pop_roles
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_permissions_on_membership_change ();

DROP TRIGGER IF EXISTS roles_bump_permissions_rev ON public.roles;
CREATE TRIGGER roles_bump_permissions_rev
  AFTER INSERT OR UPDATE OR DELETE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_permissions_on_role_change ();

-- ---------------------------------------------------------------------------
-- Triggers — POP settings + bootstrap row on new POP
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS pops_bump_pop_settings_rev ON public.pops;
CREATE TRIGGER pops_bump_pop_settings_rev
  AFTER UPDATE ON public.pops
  FOR EACH ROW EXECUTE FUNCTION public.trg_bump_pop_settings_cache_revision ();

DROP TRIGGER IF EXISTS pops_ensure_cache_revisions_row ON public.pops;
CREATE TRIGGER pops_ensure_cache_revisions_row
  AFTER INSERT ON public.pops
  FOR EACH ROW EXECUTE FUNCTION public.trg_pop_cache_revisions_on_pop_insert ();

-- ---------------------------------------------------------------------------
-- RPC — lightweight read for bootstrap / polling
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_pop_cache_revisions (p_pop_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  row public.pop_cache_revisions%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF NOT public.user_has_pop_access(p_pop_id, auth.uid()) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  PERFORM public.ensure_pop_cache_revisions_row(p_pop_id);

  SELECT *
  INTO row
  FROM public.pop_cache_revisions
  WHERE pop_id = p_pop_id;

  RETURN jsonb_build_object(
    'ok',
    true,
    'permissions_rev',
    row.permissions_rev,
    'catalog_rev',
    row.catalog_rev,
    'pop_settings_rev',
    row.pop_settings_rev,
    'updated_at',
    row.updated_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pop_cache_revisions (UUID) TO authenticated;
