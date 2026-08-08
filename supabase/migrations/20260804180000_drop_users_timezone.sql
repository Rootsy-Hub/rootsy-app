-- La zona horaria operativa sale del POP (site_id / país), no del perfil de usuario.
ALTER TABLE public.users
  DROP COLUMN IF EXISTS timezone;
