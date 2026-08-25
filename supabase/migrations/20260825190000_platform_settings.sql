-- Configuración de plataforma editable desde Uroboros (ej. POP Rootsy interno).

CREATE TABLE IF NOT EXISTS public._platform_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public._platform_settings IS
  'Settings transversales de plataforma. Ej: rootsy_pop_id = POP interno para operaciones SaaS.';

DROP TRIGGER IF EXISTS _platform_settings_set_updated_at ON public._platform_settings;
CREATE TRIGGER _platform_settings_set_updated_at
  BEFORE UPDATE ON public._platform_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at ();
