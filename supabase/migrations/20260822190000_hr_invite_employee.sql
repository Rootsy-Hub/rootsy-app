-- Invitación atada a la ficha de la persona. Al aceptar se setea user_id,
-- no se crea otro empleado.

ALTER TABLE public.pop_invitations
  ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.pop_employees (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pop_invitations_employee
  ON public.pop_invitations (employee_id)
  WHERE employee_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pop_invitations_one_pending_employee
  ON public.pop_invitations (employee_id)
  WHERE status = 'pending' AND employee_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS pop_employees_one_active_email
  ON public.pop_employees (pop_id, lower(trim(email)))
  WHERE email IS NOT NULL AND trim(email) <> '' AND left_at IS NULL;

COMMENT ON COLUMN public.pop_invitations.employee_id IS
  'Persona del local a la que se le da acceso. Null = invitación suelta legacy.';

UPDATE public.pop_invitations i
SET employee_id = e.id
FROM public.pop_employees e
WHERE i.employee_id IS NULL
  AND i.status = 'pending'
  AND e.pop_id = i.pop_id
  AND e.left_at IS NULL
  AND e.email IS NOT NULL
  AND lower(trim(e.email)) = lower(trim(i.email));

CREATE OR REPLACE FUNCTION public.accept_pop_invitation(p_token text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  inv public.pop_invitations%ROWTYPE;
  auth_email text;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT lower(trim(email)) INTO auth_email
  FROM auth.users
  WHERE id = auth.uid();

  IF auth_email IS NULL OR auth_email = '' THEN
    RETURN json_build_object('ok', false, 'error', 'no_email');
  END IF;

  SELECT * INTO inv
  FROM public.pop_invitations
  WHERE token = p_token
    AND status = 'pending'
    AND expires_at > now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF lower(trim(inv.email)) IS DISTINCT FROM auth_email THEN
    RETURN json_build_object('ok', false, 'error', 'wrong_email');
  END IF;

  INSERT INTO public.user_pop_roles (user_id, pop_id, role_id, is_active, invited_at, updated_at)
  VALUES (auth.uid(), inv.pop_id, inv.role_id, true, now(), now())
  ON CONFLICT (user_id, pop_id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    is_active = true,
    invited_at = COALESCE(public.user_pop_roles.invited_at, EXCLUDED.invited_at),
    updated_at = now();

  IF inv.employee_id IS NOT NULL THEN
    UPDATE public.pop_employees
    SET user_id = auth.uid()
    WHERE id = inv.employee_id
      AND pop_id = inv.pop_id
      AND (user_id IS NULL OR user_id = auth.uid());
  ELSE
    UPDATE public.pop_employees
    SET user_id = auth.uid()
    WHERE pop_id = inv.pop_id
      AND left_at IS NULL
      AND user_id IS NULL
      AND email IS NOT NULL
      AND lower(trim(email)) = auth_email;
  END IF;

  UPDATE public.pop_invitations
  SET status = 'accepted',
      accepted_at = now()
  WHERE id = inv.id;

  RETURN json_build_object('ok', true, 'pop_id', inv.pop_id);
END;
$function$;
