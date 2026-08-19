-- Categorías de gastos = cuentas del rubro 6.
-- Se borran las categorías sueltas (sin cuenta) y se siembran desde el plan.

DELETE FROM public.expense_categories ec
WHERE NOT EXISTS (
  SELECT 1 FROM public.expenses e WHERE e.category_id = ec.id
);

ALTER TABLE public.expense_categories
  ADD COLUMN IF NOT EXISTS accounting_chart_account_id uuid
    REFERENCES public.accounting_chart_of_accounts (id) ON DELETE RESTRICT;

ALTER TABLE public.expense_categories
  DROP CONSTRAINT IF EXISTS expense_categories_kind_check;

ALTER TABLE public.expense_categories
  ADD CONSTRAINT expense_categories_kind_check
  CHECK (kind = ANY (ARRAY['fijo'::text, 'variable'::text, 'otro'::text]));

CREATE UNIQUE INDEX IF NOT EXISTS expense_categories_pop_chart_live_uidx
  ON public.expense_categories (pop_id, accounting_chart_account_id)
  WHERE accounting_chart_account_id IS NOT NULL AND deleted_at IS NULL;

CREATE OR REPLACE FUNCTION public.expense_category_kind_for_chart_code(p_code text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_code
    WHEN '6.1.1.01' THEN 'fijo'
    WHEN '6.1.1.02' THEN 'fijo'
    WHEN '6.1.1.03' THEN 'otro'
    WHEN '6.1.1.04' THEN 'otro'
    WHEN '6.1.1.05' THEN 'otro'
    WHEN '6.2.1.01' THEN 'variable'
    WHEN '6.2.1.02' THEN 'variable'
    WHEN '6.2.1.03' THEN 'otro'
    WHEN '6.2.1.99' THEN 'variable'
    WHEN '6.3.1.01' THEN 'otro'
    ELSE 'variable'
  END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_pop_expense_categories_from_chart(p_pop_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.expense_categories (
    pop_id,
    name,
    kind,
    sort_order,
    accounting_chart_account_id
  )
  SELECT
    a.pop_id,
    a.name,
    public.expense_category_kind_for_chart_code(a.code),
    COALESCE(NULLIF(regexp_replace(a.code, '[^0-9]', '', 'g'), '')::integer, 0),
    a.id
  FROM public.accounting_chart_of_accounts a
  WHERE a.pop_id = p_pop_id
    AND a.account_type = 'gastos'
    AND a.is_movement_account = true
    AND NOT EXISTS (
      SELECT 1
      FROM public.expense_categories c
      WHERE c.pop_id = p_pop_id
        AND c.accounting_chart_account_id = a.id
    );
END;
$$;

COMMENT ON FUNCTION public.ensure_pop_expense_categories_from_chart IS
  'Crea una categoría de gastos por cada cuenta de movimiento del rubro 6.';

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

  PERFORM public.ensure_pop_expense_categories_from_chart(p_pop_id);
END;
$$;

SELECT public.ensure_pop_expense_categories_from_chart(p.id)
FROM public.pops p;
