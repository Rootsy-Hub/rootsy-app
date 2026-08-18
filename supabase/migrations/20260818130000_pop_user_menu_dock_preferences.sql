-- Preferencias del dock del menú POP por usuario.

CREATE TABLE IF NOT EXISTS public.pop_user_menu_dock_preferences (
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  dock_item_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (pop_id, user_id),
  CONSTRAINT pop_user_menu_dock_preferences_ids_count_check
    CHECK (
      cardinality(dock_item_ids) >= 1
      AND cardinality(dock_item_ids) <= 8
    )
);

CREATE INDEX IF NOT EXISTS idx_pop_user_menu_dock_preferences_user
  ON public.pop_user_menu_dock_preferences (user_id);

COMMENT ON TABLE public.pop_user_menu_dock_preferences IS
  'Accesos directos del dock del menú POP, personalizados por usuario.';

DROP TRIGGER IF EXISTS pop_user_menu_dock_preferences_set_updated_at
  ON public.pop_user_menu_dock_preferences;
CREATE TRIGGER pop_user_menu_dock_preferences_set_updated_at
  BEFORE UPDATE ON public.pop_user_menu_dock_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.pop_user_menu_dock_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_user_menu_dock_preferences_select
  ON public.pop_user_menu_dock_preferences;
CREATE POLICY pop_user_menu_dock_preferences_select
  ON public.pop_user_menu_dock_preferences
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND public.user_has_pop_access(pop_id, auth.uid())
  );

DROP POLICY IF EXISTS pop_user_menu_dock_preferences_insert
  ON public.pop_user_menu_dock_preferences;
CREATE POLICY pop_user_menu_dock_preferences_insert
  ON public.pop_user_menu_dock_preferences
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.user_has_pop_access(pop_id, auth.uid())
  );

DROP POLICY IF EXISTS pop_user_menu_dock_preferences_update
  ON public.pop_user_menu_dock_preferences;
CREATE POLICY pop_user_menu_dock_preferences_update
  ON public.pop_user_menu_dock_preferences
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND public.user_has_pop_access(pop_id, auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.user_has_pop_access(pop_id, auth.uid())
  );

DROP POLICY IF EXISTS pop_user_menu_dock_preferences_delete
  ON public.pop_user_menu_dock_preferences;
CREATE POLICY pop_user_menu_dock_preferences_delete
  ON public.pop_user_menu_dock_preferences
  FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    AND public.user_has_pop_access(pop_id, auth.uid())
  );
