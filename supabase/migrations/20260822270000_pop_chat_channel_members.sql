-- Chat: solo se siembra Equipo. Canales extra (máx. 8) con participantes.
-- Ver un canal exige ser miembro. Cocina deja de crearse al alta del POP.

DELETE FROM public.pop_chat_channels
WHERE slug = 'cocina';

ALTER TABLE public.pop_chat_channels
  ADD COLUMN IF NOT EXISTS last_message_body TEXT;

CREATE TABLE IF NOT EXISTS public.pop_chat_channel_members (
  channel_id UUID NOT NULL REFERENCES public.pop_chat_channels (id) ON DELETE CASCADE,
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pop_chat_channel_members_pop_user
  ON public.pop_chat_channel_members (pop_id, user_id);

CREATE OR REPLACE FUNCTION public.user_is_pop_chat_channel_member (p_channel_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pop_chat_channel_members m
    WHERE m.channel_id = p_channel_id
      AND m.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_is_pop_chat_channel_member (UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.pop_chat_channel_count (p_pop_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*)::integer
  FROM public.pop_chat_channels
  WHERE pop_id = p_pop_id;
$$;

GRANT EXECUTE ON FUNCTION public.pop_chat_channel_count (UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.pop_chat_messages_touch_channel ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.pop_chat_channels
  SET
    last_message_at = NEW.created_at,
    last_message_body = NEW.body
  WHERE id = NEW.channel_id
    AND pop_id = NEW.pop_id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.pop_chat_channels_enforce_limit ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF (
    SELECT count(*)
    FROM public.pop_chat_channels
    WHERE pop_id = NEW.pop_id
  ) >= 8 THEN
    RAISE EXCEPTION 'pop_chat_channels: máximo 8 canales por local';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pop_chat_channels_enforce_limit ON public.pop_chat_channels;
CREATE TRIGGER pop_chat_channels_enforce_limit
  BEFORE INSERT ON public.pop_chat_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.pop_chat_channels_enforce_limit ();

CREATE OR REPLACE FUNCTION public.pop_chat_channels_protect_equipo ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.slug = 'equipo' THEN
      RAISE EXCEPTION 'pop_chat_channels: no se puede eliminar Equipo';
    END IF;
    RETURN OLD;
  END IF;

  IF OLD.slug = 'equipo' THEN
    NEW.slug := 'equipo';
    NEW.title := 'Equipo';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pop_chat_channels_protect_equipo ON public.pop_chat_channels;
CREATE TRIGGER pop_chat_channels_protect_equipo
  BEFORE UPDATE OR DELETE ON public.pop_chat_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.pop_chat_channels_protect_equipo ();

ALTER TABLE public.pop_chat_channel_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_chat_channel_members_select ON public.pop_chat_channel_members;
CREATE POLICY pop_chat_channel_members_select ON public.pop_chat_channel_members
  FOR SELECT TO authenticated
  USING (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  );

DROP POLICY IF EXISTS pop_chat_channel_members_insert ON public.pop_chat_channel_members;
CREATE POLICY pop_chat_channel_members_insert ON public.pop_chat_channel_members
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_is_member_of_active_pop(pop_id)
    AND (
      user_id = auth.uid()
      OR public.user_is_pop_chat_channel_member(channel_id)
    )
  );

DROP POLICY IF EXISTS pop_chat_channel_members_delete ON public.pop_chat_channel_members;
CREATE POLICY pop_chat_channel_members_delete ON public.pop_chat_channel_members
  FOR DELETE TO authenticated
  USING (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  );

DROP POLICY IF EXISTS pop_chat_channels_select_pop ON public.pop_chat_channels;
CREATE POLICY pop_chat_channels_select_pop ON public.pop_chat_channels
  FOR SELECT TO authenticated
  USING (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(id)
  );

DROP POLICY IF EXISTS pop_chat_channels_update_pop ON public.pop_chat_channels;
CREATE POLICY pop_chat_channels_update_pop ON public.pop_chat_channels
  FOR UPDATE TO authenticated
  USING (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(id)
  )
  WITH CHECK (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(id)
  );

DROP POLICY IF EXISTS pop_chat_channels_delete_pop ON public.pop_chat_channels;
CREATE POLICY pop_chat_channels_delete_pop ON public.pop_chat_channels
  FOR DELETE TO authenticated
  USING (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(id)
  );

DROP POLICY IF EXISTS pop_chat_messages_select_pop ON public.pop_chat_messages;
CREATE POLICY pop_chat_messages_select_pop ON public.pop_chat_messages
  FOR SELECT TO authenticated
  USING (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  );

DROP POLICY IF EXISTS pop_chat_messages_insert_own ON public.pop_chat_messages;
CREATE POLICY pop_chat_messages_insert_own ON public.pop_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
    AND author_user_id = auth.uid()
  );

DROP POLICY IF EXISTS pop_chat_messages_delete_pop ON public.pop_chat_messages;
CREATE POLICY pop_chat_messages_delete_pop ON public.pop_chat_messages
  FOR DELETE TO authenticated
  USING (
    public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  );

DROP POLICY IF EXISTS pop_chat_channel_reads_select_own ON public.pop_chat_channel_reads;
CREATE POLICY pop_chat_channel_reads_select_own ON public.pop_chat_channel_reads
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  );

DROP POLICY IF EXISTS pop_chat_channel_reads_insert_own ON public.pop_chat_channel_reads;
CREATE POLICY pop_chat_channel_reads_insert_own ON public.pop_chat_channel_reads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  );

DROP POLICY IF EXISTS pop_chat_channel_reads_update_own ON public.pop_chat_channel_reads;
CREATE POLICY pop_chat_channel_reads_update_own ON public.pop_chat_channel_reads
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
    AND public.user_is_pop_chat_channel_member(channel_id)
  );

CREATE OR REPLACE FUNCTION public.seed_pop_chat_channels (p_pop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_channel_id UUID;
BEGIN
  INSERT INTO public.pop_chat_channels (pop_id, slug, title, subtitle, sort_order)
  SELECT p_pop_id, 'equipo', 'Equipo', 'Todos los que entran a Rootsy', 0
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.pop_chat_channels c
    WHERE c.pop_id = p_pop_id
      AND c.slug = 'equipo'
  );

  SELECT id
  INTO v_channel_id
  FROM public.pop_chat_channels
  WHERE pop_id = p_pop_id
    AND slug = 'equipo'
  LIMIT 1;

  IF v_channel_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.pop_chat_channel_members (channel_id, pop_id, user_id)
  SELECT v_channel_id, p_pop_id, upr.user_id
  FROM public.user_pop_roles upr
  WHERE upr.pop_id = p_pop_id
    AND upr.is_active IS NOT FALSE
  ON CONFLICT DO NOTHING;

  INSERT INTO public.pop_chat_channel_members (channel_id, pop_id, user_id)
  SELECT v_channel_id, p_pop_id, p.owner_user_id
  FROM public.pops p
  WHERE p.id = p_pop_id
    AND p.owner_user_id IS NOT NULL
  ON CONFLICT DO NOTHING;
END;
$$;

COMMENT ON FUNCTION public.seed_pop_chat_channels (UUID) IS
  'Crea el canal Equipo y suma a quienes tienen acceso al POP.';

CREATE OR REPLACE FUNCTION public.user_pop_roles_sync_chat_equipo ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_channel_id UUID;
  v_user_id UUID;
  v_pop_id UUID;
  v_active BOOLEAN;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_pop_id := OLD.pop_id;
    v_active := false;
  ELSE
    v_user_id := NEW.user_id;
    v_pop_id := NEW.pop_id;
    v_active := NEW.is_active IS NOT FALSE;
  END IF;

  IF v_active THEN
    SELECT id
    INTO v_channel_id
    FROM public.pop_chat_channels
    WHERE pop_id = v_pop_id
      AND slug = 'equipo'
    LIMIT 1;

    IF v_channel_id IS NOT NULL THEN
      INSERT INTO public.pop_chat_channel_members (channel_id, pop_id, user_id)
      VALUES (v_channel_id, v_pop_id, v_user_id)
      ON CONFLICT DO NOTHING;
    END IF;
  ELSE
    DELETE FROM public.pop_chat_channel_members
    WHERE pop_id = v_pop_id
      AND user_id = v_user_id;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS user_pop_roles_sync_chat_equipo ON public.user_pop_roles;
CREATE TRIGGER user_pop_roles_sync_chat_equipo
  AFTER INSERT OR UPDATE OF is_active OR DELETE ON public.user_pop_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.user_pop_roles_sync_chat_equipo ();

DO $$
DECLARE
  pid UUID;
BEGIN
  FOR pid IN SELECT id FROM public.pops
  LOOP
    PERFORM public.seed_pop_chat_channels (pid);
  END LOOP;
END $$;

COMMENT ON TABLE public.pop_chat_channel_members IS
  'Quién participa en un canal. Sin fila, no ve el canal ni puede escribir.';
COMMENT ON COLUMN public.pop_chat_channels.last_message_body IS
  'Cuerpo del último mensaje. Para el preview del listado.';
