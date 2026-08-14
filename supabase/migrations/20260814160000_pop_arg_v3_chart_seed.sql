-- Plan de cuentas arg_v3 completo al crear POP + backfill en POPs existentes.

CREATE OR REPLACE FUNCTION public.ensure_pop_arg_v3_chart_accounts(p_pop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.accounting_chart_of_accounts (
    pop_id,
    code,
    name,
    account_type,
    nature,
    level,
    is_movement_account,
    parent_id,
    metadata
  )
  SELECT
    p_pop_id,
    v.code,
    v.name,
    v.account_type,
    v.nature,
    4,
    true,
    NULL,
    jsonb_build_object('demo_seed', 'arg_v3')
  FROM (
    VALUES
      ('1.1.1.01', 'Caja', 'activo_corriente', 'deudora'),
      ('1.1.1.02', 'Bancos', 'activo_corriente', 'deudora'),
      ('1.1.1.03', 'Tarjetas y plataformas a liquidar', 'activo_corriente', 'deudora'),
      ('1.1.1.04', 'Otros cobros', 'activo_corriente', 'deudora'),
      ('1.1.2.01', 'Cuentas por Cobrar', 'activo_corriente', 'deudora'),
      ('1.1.2.02', 'Documentos por Cobrar', 'activo_corriente', 'deudora'),
      ('1.1.2.03', 'Créditos fiscales IVA', 'activo_corriente', 'deudora'),
      ('1.1.3.01', 'Mercaderías', 'activo_corriente', 'deudora'),
      ('1.1.3.02', 'Productos Terminados', 'activo_corriente', 'deudora'),
      ('1.1.3.03', 'Materias Primas', 'activo_corriente', 'deudora'),
      ('1.1.3.04', 'Insumos', 'activo_corriente', 'deudora'),
      ('1.2.1.01', 'Bienes de uso', 'activo_no_corriente', 'deudora'),
      ('1.2.1.02', 'Amortización acumulada', 'activo_no_corriente', 'acreedora'),
      ('2.1.1.01', 'Proveedores', 'pasivo_corriente', 'acreedora'),
      ('2.1.1.02', 'Documentos a Pagar', 'pasivo_corriente', 'acreedora'),
      ('2.1.1.03', 'Tarjetas de crédito a pagar', 'pasivo_corriente', 'acreedora'),
      ('2.1.2.01', 'IVA a Pagar', 'pasivo_corriente', 'acreedora'),
      ('2.1.2.02', 'Impuestos y retenciones a pagar', 'pasivo_corriente', 'acreedora'),
      ('2.1.2.03', 'Cargas sociales a pagar', 'pasivo_corriente', 'acreedora'),
      ('2.2.1.01', 'Préstamos bancarios', 'pasivo_no_corriente', 'acreedora'),
      ('3.1.1.01', 'Capital social', 'patrimonio_neto', 'acreedora'),
      ('3.2.1.01', 'Resultados no asignados', 'patrimonio_neto', 'acreedora'),
      ('3.2.1.02', 'Ajuste por inventario inicial', 'patrimonio_neto', 'acreedora'),
      ('4.1.1.01', 'Ventas — comercio', 'ingresos', 'acreedora'),
      ('4.1.1.02', 'Ventas — servicios', 'ingresos', 'acreedora'),
      ('4.1.1.03', 'Ventas — mesas', 'ingresos', 'acreedora'),
      ('4.1.1.04', 'Ventas — mostrador', 'ingresos', 'acreedora'),
      ('4.2.1.01', 'Otros ingresos', 'ingresos', 'acreedora'),
      ('5.1.1.01', 'Costo de ventas', 'costos', 'deudora'),
      ('5.2.1.01', 'Costo de producción', 'costos', 'deudora'),
      ('6.1.1.01', 'Alquileres', 'gastos', 'deudora'),
      ('6.1.1.02', 'Servicios públicos', 'gastos', 'deudora'),
      ('6.1.1.03', 'Sueldos y cargas sociales', 'gastos', 'deudora'),
      ('6.1.1.04', 'Honorarios profesionales', 'gastos', 'deudora'),
      ('6.1.1.05', 'Diferencias de arqueo de caja', 'gastos', 'deudora'),
      ('6.2.1.01', 'Publicidad y marketing', 'gastos', 'deudora'),
      ('6.2.1.02', 'Comisiones y gastos comerciales', 'gastos', 'deudora'),
      ('6.2.1.03', 'Mermas y pérdidas de inventario', 'gastos', 'deudora'),
      ('6.2.1.99', 'Gastos generales', 'gastos', 'deudora'),
      ('6.3.1.01', 'Intereses y gastos financieros', 'gastos', 'deudora')
  ) AS v (code, name, account_type, nature)
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.accounting_chart_of_accounts a
    WHERE a.pop_id = p_pop_id
      AND a.code = v.code
  );
END;
$$;

COMMENT ON FUNCTION public.ensure_pop_arg_v3_chart_accounts IS
  'Inserta el plan de cuentas arg_v3 base (39 cuentas) si faltan en el POP.';

CREATE OR REPLACE FUNCTION public.ensure_pop_initial_stock_patrimonio_account(p_pop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.ensure_pop_arg_v3_chart_accounts(p_pop_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.pops_after_insert_baseline_chart_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.ensure_pop_arg_v3_chart_accounts(NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.seed_pop_site_defaults(p_pop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_site text;
  id_cat uuid;
BEGIN
  SELECT COALESCE(settings->>'site_id', 'arg')
  INTO v_site
  FROM public.pops
  WHERE id = p_pop_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_site IS DISTINCT FROM 'arg' THEN
    RETURN;
  END IF;

  PERFORM public.ensure_pop_arg_v3_chart_accounts(p_pop_id);

  IF EXISTS (
    SELECT 1
    FROM public.accounting_entry_lines el
    INNER JOIN public.accounting_chart_of_accounts a ON a.id = el.account_id
    WHERE a.pop_id = p_pop_id
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.articles
    WHERE pop_id = p_pop_id
      AND name LIKE '[Ejemplo]%'
  ) THEN
    RETURN;
  END IF;

  DELETE FROM public.articles
  WHERE pop_id = p_pop_id
    AND name LIKE '[Ejemplo]%';

  DELETE FROM public.categories
  WHERE pop_id = p_pop_id
    AND name LIKE '[Ejemplo]%';

  INSERT INTO public.categories (pop_id, name)
  VALUES (p_pop_id, '[Ejemplo] General')
  RETURNING id INTO id_cat;

  INSERT INTO public.articles (
    pop_id,
    name,
    description,
    sale_price,
    iva,
    category_id,
    is_active
  )
  VALUES (
    p_pop_id,
    '[Ejemplo] Artículo de muestra',
    'Datos de ejemplo: podés editar o eliminar esta categoría y este artículo cuando quieras.',
    100,
    21,
    id_cat,
    true
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.pops_after_insert_seed_defaults()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF COALESCE(NEW.settings->>'seed_site_defaults', 'true') = 'false' THEN
    RETURN NEW;
  END IF;
  PERFORM public.seed_pop_site_defaults(NEW.id);
  RETURN NEW;
END;
$$;

-- Backfill: POPs existentes reciben cuentas arg_v3 faltantes.
DO $$
DECLARE
  pid uuid;
BEGIN
  FOR pid IN SELECT id FROM public.pops LOOP
    PERFORM public.ensure_pop_arg_v3_chart_accounts(pid);
  END LOOP;
END;
$$;

-- Renombrar cuentas base arg_v2 al naming arg_v3 cuando el código coincide.
UPDATE public.accounting_chart_of_accounts AS ac
SET name = v.name
FROM public.pops p
CROSS JOIN (
  VALUES
    ('4.1.1.01', 'Ventas — comercio'),
    ('4.1.1.02', 'Ventas — servicios')
) AS v (code, name)
WHERE ac.pop_id = p.id
  AND ac.code = v.code
  AND ac.name IS DISTINCT FROM v.name
  AND ac.name IN ('Ventas', 'Ventas de servicios', '[Ejemplo] Ventas', '[Ejemplo] Ventas de servicios');
