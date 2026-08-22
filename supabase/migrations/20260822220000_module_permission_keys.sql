-- Permisos propios por módulo (reportes, estadísticas, alertas, chat,
-- fabricación, comandas, presupuestos, compras y OC).
-- El template administrator tiene que incluirlos: el editor de RRHH
-- solo deja asignar keys que estén en esa plantilla.

DO $$
DECLARE
  r RECORD;
  grants JSONB;
  p TEXT;
  verb TEXT;
  new_admin_perms JSONB := '[
    "reports:read", "reports:create", "reports:update", "reports:delete",
    "statistics:read", "statistics:create", "statistics:update", "statistics:delete",
    "alerts:read", "alerts:create", "alerts:update", "alerts:delete",
    "chat:read", "chat:create", "chat:update", "chat:delete",
    "manufacturing:read", "manufacturing:create", "manufacturing:update", "manufacturing:delete",
    "comandas:read", "comandas:create", "comandas:update", "comandas:delete",
    "quotes:read", "quotes:create", "quotes:update", "quotes:delete",
    "purchases:read", "purchases:create", "purchases:update", "purchases:delete",
    "purchase_orders:read", "purchase_orders:create", "purchase_orders:update", "purchase_orders:delete"
  ]'::jsonb;
BEGIN
  FOR r IN
    SELECT id, permission_grants
    FROM public.roles
    WHERE lower(name) IN ('administrator', 'owner', 'administrador', 'dueño', 'dueno')
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    FOR p IN SELECT jsonb_array_elements_text(new_admin_perms)
    LOOP
      IF NOT grants @> to_jsonb(p) THEN
        grants := grants || to_jsonb(p);
      END IF;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;

  -- Roles que ya veían presupuestos/compras/OC vía sale u operations
  -- conservan el acceso con las keys nuevas.
  FOR r IN SELECT id, permission_grants FROM public.roles
  LOOP
    grants := COALESCE(r.permission_grants, '[]'::jsonb);
    FOREACH verb IN ARRAY ARRAY['read', 'create', 'update', 'delete']
    LOOP
      IF grants @> to_jsonb(('sale:' || verb)::text)
         AND NOT grants @> to_jsonb(('quotes:' || verb)::text) THEN
        grants := grants || to_jsonb(('quotes:' || verb)::text);
      END IF;
      IF grants @> to_jsonb(('operations:' || verb)::text) THEN
        IF NOT grants @> to_jsonb(('purchases:' || verb)::text) THEN
          grants := grants || to_jsonb(('purchases:' || verb)::text);
        END IF;
        IF NOT grants @> to_jsonb(('purchase_orders:' || verb)::text) THEN
          grants := grants || to_jsonb(('purchase_orders:' || verb)::text);
        END IF;
      END IF;
    END LOOP;
    UPDATE public.roles SET permission_grants = grants WHERE id = r.id;
  END LOOP;
END $$;
