-- Amplía los elementos del plano de mesas (accesos, amenidades, zonas).
ALTER TABLE public.dining_floor_decors
  DROP CONSTRAINT IF EXISTS dining_floor_decors_kind_check;

ALTER TABLE public.dining_floor_decors
  ADD CONSTRAINT dining_floor_decors_kind_check
  CHECK (
    kind IN (
      'wall_h',
      'wall_v',
      'pillar',
      'entrance',
      'window',
      'bar',
      'register',
      'restroom',
      'kitchen',
      'stairs',
      'plant',
      'planter',
      'label',
      'zone'
    )
  );
