-- Las ventas a cuenta no registran sale_payments al completar:
-- el saldo queda abierto en C/C hasta el cobro o la imputación.

CREATE OR REPLACE FUNCTION public.sales_total_matches_payments_on_complete()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
DECLARE
  pay_sum NUMERIC(15, 2);
BEGIN
  IF NEW.status IN ('draft', 'cancelled') THEN
    RETURN NEW;
  END IF;

  IF COALESCE(NEW.on_account, FALSE) THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(amount), 0)
  INTO pay_sum
  FROM public.sale_payments
  WHERE sale_id = NEW.id
    AND reversed_at IS NULL;

  IF pay_sum <> NEW.total THEN
    RAISE EXCEPTION
      'sales: la suma de pagos (%) debe coincidir con total (%)',
      pay_sum,
      NEW.total;
  END IF;

  RETURN NEW;
END;
$$;
