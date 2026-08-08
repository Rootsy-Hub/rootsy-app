-- Número de pedido secuencial por POP (sin reinicio diario).
-- Los pedidos cobrados (sale_id) siguen en la tabla pero no se listan en el tablero activo.

ALTER TABLE public.counter_orders
  DROP CONSTRAINT IF EXISTS counter_orders_pop_day_number_unique;

-- Renumerar pedidos existentes por POP según apertura (incluye cancelados para no reutilizar números).
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY pop_id
      ORDER BY opened_at ASC, id ASC
    ) AS new_number
  FROM public.counter_orders
)
UPDATE public.counter_orders AS co
SET order_number = ranked.new_number
FROM ranked
WHERE co.id = ranked.id;

ALTER TABLE public.counter_orders
  ADD CONSTRAINT counter_orders_pop_number_unique
  UNIQUE (pop_id, order_number);

COMMENT ON COLUMN public.counter_orders.order_number IS
  'Número secuencial del pedido en el POP (1..N, sin reinicio diario).';

COMMENT ON COLUMN public.counter_orders.order_day IS
  'Fecha calendario de apertura (referencia); el número de pedido no se reinicia por día.';
