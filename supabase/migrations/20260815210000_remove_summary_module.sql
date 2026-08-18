-- Eliminar módulo "Resumen" del catálogo compartido de suscripción
UPDATE public._business_types
SET modules = jsonb_set(
  modules,
  '{shared,administrar}',
  (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(modules->'shared'->'administrar') AS elem
    WHERE elem->>'key' <> 'summary'
  )
)
WHERE modules->'shared'->'administrar' @> '[{"key":"summary"}]'::jsonb;
