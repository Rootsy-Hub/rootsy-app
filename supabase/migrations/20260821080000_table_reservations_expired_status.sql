-- Reserva confirmada/pendiente cuya ventana ya pasó, sin sentar ni cancelar.

ALTER TABLE public.table_reservations
  DROP CONSTRAINT IF EXISTS table_reservations_status_check;

ALTER TABLE public.table_reservations
  ADD CONSTRAINT table_reservations_status_check
  CHECK (
    status IN (
      'pending',
      'confirmed',
      'seated',
      'completed',
      'expired',
      'no_show',
      'cancelled'
    )
  );

COMMENT ON COLUMN public.table_reservations.status IS
  'pending | confirmed | seated | completed | expired | no_show | cancelled';
