-- Estados y comensales en reservas de mesa.

ALTER TABLE public.table_reservations
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'confirmed';

ALTER TABLE public.table_reservations
  ADD COLUMN IF NOT EXISTS guest_count SMALLINT
  CHECK (guest_count IS NULL OR guest_count > 0);

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
      'no_show',
      'cancelled'
    )
  );

CREATE INDEX IF NOT EXISTS idx_table_reservations_pop_status_arrival
  ON public.table_reservations (pop_id, status, arrival_at);

COMMENT ON COLUMN public.table_reservations.status IS
  'pending | confirmed (activas en agenda) | seated | completed | no_show | cancelled';
