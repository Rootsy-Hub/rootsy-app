-- Mesas: rotación en plano + tamaño XL rectangular + normalizar sm/md/lg → s/m/l.

ALTER TABLE public.dining_tables
  ADD COLUMN IF NOT EXISTS rotation_deg INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.dining_floor_decors
  ADD COLUMN IF NOT EXISTS rotation_deg INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.dining_tables
  DROP CONSTRAINT IF EXISTS dining_tables_rotation_deg_check;

ALTER TABLE public.dining_tables
  ADD CONSTRAINT dining_tables_rotation_deg_check
  CHECK (rotation_deg >= 0 AND rotation_deg < 360);

ALTER TABLE public.dining_floor_decors
  DROP CONSTRAINT IF EXISTS dining_floor_decors_rotation_deg_check;

ALTER TABLE public.dining_floor_decors
  ADD CONSTRAINT dining_floor_decors_rotation_deg_check
  CHECK (rotation_deg >= 0 AND rotation_deg < 360);

UPDATE public.dining_tables
SET shape = jsonb_set(shape, '{size}', to_jsonb(
  CASE shape->>'size'
    WHEN 'sm' THEN 's'
    WHEN 'md' THEN 'm'
    WHEN 'lg' THEN 'l'
    ELSE shape->>'size'
  END
))
WHERE shape->>'kind' = 'rect'
  AND shape->>'size' IN ('sm', 'md', 'lg');
