-- Chat del POP: solo canales del local (no hay hilos 1:1 entre usuarios).
-- Cualquier miembro activo ve y escribe en los canales del punto.

CREATE TABLE IF NOT EXISTS public.pop_chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_chat_channels_slug_format
    CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT pop_chat_channels_title_nonempty
    CHECK (char_length(trim(title)) > 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pop_chat_channels_pop_slug
  ON public.pop_chat_channels (pop_id, slug);

CREATE INDEX IF NOT EXISTS idx_pop_chat_channels_pop_sort
  ON public.pop_chat_channels (pop_id, sort_order, title);

DROP TRIGGER IF EXISTS pop_chat_channels_set_updated_at ON public.pop_chat_channels;
CREATE TRIGGER pop_chat_channels_set_updated_at
  BEFORE UPDATE ON public.pop_chat_channels
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();

ALTER TABLE public.pop_chat_channels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_chat_channels_select_pop ON public.pop_chat_channels;
CREATE POLICY pop_chat_channels_select_pop ON public.pop_chat_channels
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_chat_channels_insert_pop ON public.pop_chat_channels;
CREATE POLICY pop_chat_channels_insert_pop ON public.pop_chat_channels
  FOR INSERT TO authenticated
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_chat_channels_update_pop ON public.pop_chat_channels;
CREATE POLICY pop_chat_channels_update_pop ON public.pop_chat_channels
  FOR UPDATE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id))
  WITH CHECK (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_chat_channels_delete_pop ON public.pop_chat_channels;
CREATE POLICY pop_chat_channels_delete_pop ON public.pop_chat_channels
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

CREATE TABLE IF NOT EXISTS public.pop_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES public.pop_chat_channels (id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE RESTRICT,
  author_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT pop_chat_messages_author_name_nonempty
    CHECK (char_length(trim(author_name)) > 0),
  CONSTRAINT pop_chat_messages_body_nonempty
    CHECK (char_length(trim(body)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_pop_chat_messages_channel_created
  ON public.pop_chat_messages (channel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_pop_chat_messages_pop_created
  ON public.pop_chat_messages (pop_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.pop_chat_messages_touch_channel ()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.pop_chat_channels
  SET last_message_at = NEW.created_at
  WHERE id = NEW.channel_id
    AND pop_id = NEW.pop_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pop_chat_messages_touch_channel ON public.pop_chat_messages;
CREATE TRIGGER pop_chat_messages_touch_channel
  AFTER INSERT ON public.pop_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.pop_chat_messages_touch_channel ();

ALTER TABLE public.pop_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_chat_messages_select_pop ON public.pop_chat_messages;
CREATE POLICY pop_chat_messages_select_pop ON public.pop_chat_messages
  FOR SELECT TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

DROP POLICY IF EXISTS pop_chat_messages_insert_own ON public.pop_chat_messages;
CREATE POLICY pop_chat_messages_insert_own ON public.pop_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.user_is_member_of_active_pop(pop_id)
    AND author_user_id = auth.uid()
  );

DROP POLICY IF EXISTS pop_chat_messages_delete_pop ON public.pop_chat_messages;
CREATE POLICY pop_chat_messages_delete_pop ON public.pop_chat_messages
  FOR DELETE TO authenticated
  USING (public.user_is_member_of_active_pop(pop_id));

CREATE TABLE IF NOT EXISTS public.pop_chat_channel_reads (
  channel_id UUID NOT NULL REFERENCES public.pop_chat_channels (id) ON DELETE CASCADE,
  pop_id UUID NOT NULL REFERENCES public.pops (id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pop_chat_channel_reads_pop_user
  ON public.pop_chat_channel_reads (pop_id, user_id);

ALTER TABLE public.pop_chat_channel_reads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pop_chat_channel_reads_select_own ON public.pop_chat_channel_reads;
CREATE POLICY pop_chat_channel_reads_select_own ON public.pop_chat_channel_reads
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
  );

DROP POLICY IF EXISTS pop_chat_channel_reads_insert_own ON public.pop_chat_channel_reads;
CREATE POLICY pop_chat_channel_reads_insert_own ON public.pop_chat_channel_reads
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
  );

DROP POLICY IF EXISTS pop_chat_channel_reads_update_own ON public.pop_chat_channel_reads;
CREATE POLICY pop_chat_channel_reads_update_own ON public.pop_chat_channel_reads
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
  )
  WITH CHECK (
    user_id = auth.uid()
    AND public.user_is_member_of_active_pop(pop_id)
  );

CREATE OR REPLACE FUNCTION public.seed_pop_chat_channels (p_pop_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.pop_chat_channels (pop_id, slug, title, subtitle, sort_order)
  SELECT p_pop_id, 'equipo', 'Equipo', 'Todos los que entran a Rootsy', 0
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.pop_chat_channels c
    WHERE c.pop_id = p_pop_id
      AND c.slug = 'equipo'
  );
END;
$$;

COMMENT ON FUNCTION public.seed_pop_chat_channels (UUID) IS
  'Crea el canal Equipo si el POP aún no lo tiene.';

GRANT EXECUTE ON FUNCTION public.seed_pop_chat_channels (UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.pops_after_insert_chat_channels ()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_pop_chat_channels (NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pops_after_insert_chat_channels ON public.pops;
CREATE TRIGGER pops_after_insert_chat_channels
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_after_insert_chat_channels ();

DO $$
DECLARE
  pid UUID;
BEGIN
  FOR pid IN SELECT id FROM public.pops
  LOOP
    PERFORM public.seed_pop_chat_channels (pid);
  END LOOP;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'pop_chat_messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.pop_chat_messages;
    END IF;
  END IF;
END $$;

COMMENT ON TABLE public.pop_chat_channels IS
  'Canales de chat del POP. No hay conversaciones privadas entre usuarios.';
COMMENT ON COLUMN public.pop_chat_channels.slug IS
  'Clave estable por POP (equipo, cocina). Sirve para no duplicar el seed.';
COMMENT ON COLUMN public.pop_chat_channels.last_message_at IS
  'Último mensaje del canal. Se actualiza al insertar en pop_chat_messages.';
COMMENT ON TABLE public.pop_chat_messages IS
  'Mensajes de un canal. author_name es snapshot para conservar el nombre si la persona deja el POP.';
COMMENT ON TABLE public.pop_chat_channel_reads IS
  'Hasta cuándo leyó cada usuario un canal. unread = mensajes posteriores a last_read_at.';
