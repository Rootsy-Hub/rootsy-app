-- Garantiza la cuenta de patrimonio para stock inicial en POPs nuevos.

CREATE OR REPLACE FUNCTION public.ensure_pop_initial_stock_patrimonio_account(p_pop_id uuid)
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
    '3.2.1.02',
    'Ajuste por inventario inicial',
    'patrimonio_neto',
    'acreedora',
    4,
    true,
    NULL,
    jsonb_build_object('demo_seed', 'arg_v3')
  WHERE NOT EXISTS (
    SELECT 1
    FROM public.accounting_chart_of_accounts a
    WHERE a.pop_id = p_pop_id
      AND a.code = '3.2.1.02'
  );
END;
$$;

COMMENT ON FUNCTION public.ensure_pop_initial_stock_patrimonio_account IS
  'Inserta 3.2.1.02 Ajuste por inventario inicial si el POP aún no la tiene (stock inicial).';

CREATE OR REPLACE FUNCTION public.pops_after_insert_baseline_chart_accounts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.ensure_pop_initial_stock_patrimonio_account(NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pops_after_insert_baseline_chart_accounts ON public.pops;

CREATE TRIGGER pops_after_insert_baseline_chart_accounts
  AFTER INSERT ON public.pops
  FOR EACH ROW
  EXECUTE FUNCTION public.pops_after_insert_baseline_chart_accounts();

-- Tras el seed demo, asegurar la cuenta (idempotente si el trigger anterior ya corrió).
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
  PERFORM public.ensure_pop_initial_stock_patrimonio_account(NEW.id);
  RETURN NEW;
END;
$$;
