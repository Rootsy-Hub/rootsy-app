-- Mover módulo "Gastos" de administrar → operar en módulos compartidos
UPDATE public._business_types
SET modules = jsonb_set(
  jsonb_set(
    modules,
    '{shared,operar}',
    (modules->'shared'->'operar') || '[{"key":"expenses","label":"Gastos"}]'::jsonb
  ),
  '{shared,administrar}',
  (
    SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
    FROM jsonb_array_elements(modules->'shared'->'administrar') AS elem
    WHERE elem->>'key' <> 'expenses'
  )
)
WHERE modules->'shared'->'administrar' @> '[{"key":"expenses"}]'::jsonb;
