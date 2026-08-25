-- Permitir audit en mesas (plano + sesiones + reservas) y mostrador.
CREATE OR REPLACE FUNCTION public.rootsy_apply_with_audit(
  p_kind TEXT,
  p_payload JSONB,
  p_audit JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
  pop UUID;
  op JSONB;
  tbl TEXT;
  row_data JSONB;
  rec_id UUID;
  first_id UUID;
  touched INT;
  col_list TEXT;
  allowed TEXT[] := ARRAY[
    'articles', 'article_costs', 'price_lists', 'price_list_items', 'categories',
    'clients', 'suppliers',
    'promotions', 'promotion_slots', 'promotion_slot_options',
    'recipes', 'recipe_ingredients', 'recipe_categories', 'comanda_stations',
    'services', 'service_categories', 'service_types', 'service_type_articles',
    'service_type_addons', 'service_type_addon_articles',
    'pop_printers',
    'expenses', 'expense_payments', 'expense_categories',
    'inventory_locations', 'inventory_movements', 'inventory_cost_layers',
    'inventory_layer_allocations', 'inventory_on_hand',
    'pop_manufacturing_runs',
    'cash_registers', 'cash_register_sessions', 'cash_register_movements',
    'treasury_accounts', 'treasury_settlements', 'treasury_reconciliation_marks',
    'treasury_pos_acreditations', 'bank_statement_lines',
    'accounting_chart_of_accounts',
    'checks',
    'current_account_receipts', 'current_account_applications',
    'sale_quotes', 'purchase_orders',
    'pops',
    'arca_sale_points',
    'pop_employees', 'pop_employee_attendance', 'pop_employee_francos',
    'pop_employee_payments', 'pop_invitations', 'user_pop_roles', 'roles',
    'accounting_entries', 'accounting_entry_lines',
    'sale_payments', 'purchase_payments', 'service_charge_payments',
    'counter_orders',
    'dining_salons', 'dining_tables', 'dining_floor_decors',
    'table_sessions', 'table_reservations'
  ];
  src TEXT;
  has_pop BOOLEAN;
BEGIN
  IF uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  pop := NULLIF(p_audit->>'pop_id', '')::UUID;
  IF pop IS NULL OR NOT public.user_has_pop_access(pop, uid) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;

  src := COALESCE(p_audit->>'execution_source', 'user');
  IF src NOT IN ('user', 'rootsy_ai', 'system') THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_source');
  END IF;

  FOR op IN SELECT jsonb_array_elements(COALESCE(p_payload->'ops', '[]'::jsonb))
  LOOP
    tbl := op->>'table';
    IF tbl IS NULL OR NOT (tbl = ANY (allowed)) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'table_not_allowed');
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = tbl AND column_name = 'pop_id'
    ) INTO has_pop;

    IF op->>'op' = 'insert' THEN
      row_data := COALESCE(op->'row', '{}'::jsonb);
      IF has_pop THEN
        IF row_data->>'pop_id' IS NULL THEN
          row_data := row_data || jsonb_build_object('pop_id', pop);
        ELSIF (row_data->>'pop_id')::UUID <> pop THEN
          RETURN jsonb_build_object('ok', false, 'error', 'pop_mismatch');
        END IF;
      END IF;
      IF row_data->>'id' IS NULL OR row_data->>'id' = '' THEN
        rec_id := gen_random_uuid();
        row_data := row_data || jsonb_build_object('id', rec_id);
      ELSE
        rec_id := (row_data->>'id')::UUID;
      END IF;
      IF first_id IS NULL THEN
        first_id := rec_id;
      END IF;
      SELECT string_agg(quote_ident(k), ',')
      INTO col_list
      FROM jsonb_object_keys(row_data) AS k;
      EXECUTE format(
        'INSERT INTO %I (%s) SELECT %s FROM jsonb_populate_record(NULL::%I, $1)',
        tbl, col_list, col_list, tbl
      ) USING row_data;

    ELSIF op->>'op' = 'update' THEN
      rec_id := NULLIF(op->>'id', '')::UUID;
      row_data := COALESCE(op->'row', '{}'::jsonb);
      IF rec_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'missing_id');
      END IF;
      row_data := row_data - 'id' - 'pop_id';
      SELECT string_agg(quote_ident(k), ',')
      INTO col_list
      FROM jsonb_object_keys(row_data) AS k;
      IF col_list IS NULL OR col_list = '' THEN
        CONTINUE;
      END IF;
      IF tbl = 'pops' THEN
        EXECUTE format(
          'UPDATE %I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::%I, $1)) WHERE id = $2',
          tbl, col_list, col_list, tbl
        ) USING row_data, pop;
      ELSIF has_pop THEN
        EXECUTE format(
          'UPDATE %I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::%I, $1)) WHERE id = $2 AND pop_id = $3',
          tbl, col_list, col_list, tbl
        ) USING row_data, rec_id, pop;
      ELSE
        EXECUTE format(
          'UPDATE %I SET (%s) = (SELECT %s FROM jsonb_populate_record(NULL::%I, $1)) WHERE id = $2',
          tbl, col_list, col_list, tbl
        ) USING row_data, rec_id;
      END IF;
      GET DIAGNOSTICS touched = ROW_COUNT;
      IF touched = 0 THEN
        RETURN jsonb_build_object('ok', false, 'error', 'not_found');
      END IF;
      IF first_id IS NULL THEN
        first_id := rec_id;
      END IF;

    ELSIF op->>'op' = 'delete' THEN
      rec_id := NULLIF(op->>'id', '')::UUID;
      IF rec_id IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'missing_id');
      END IF;
      IF tbl = 'pops' THEN
        RETURN jsonb_build_object('ok', false, 'error', 'table_not_allowed');
      END IF;
      IF has_pop THEN
        EXECUTE format(
          'DELETE FROM %I WHERE id = $1 AND pop_id = $2',
          tbl
        ) USING rec_id, pop;
      ELSE
        EXECUTE format(
          'DELETE FROM %I WHERE id = $1',
          tbl
        ) USING rec_id;
      END IF;
      IF first_id IS NULL THEN
        first_id := rec_id;
      END IF;
    ELSE
      RETURN jsonb_build_object('ok', false, 'error', 'invalid_op');
    END IF;
  END LOOP;

  INSERT INTO public.audit_events (
    pop_id, occurred_at, expires_at, resource, resource_id, action,
    http_method, path, previous_state, new_state,
    requester_user_id, approver_user_id, execution_source, kind
  ) VALUES (
    pop,
    now(),
    now() + INTERVAL '8 months',
    COALESCE(p_audit->>'resource', 'unknown'),
    COALESCE(NULLIF(p_audit->>'resource_id', '')::UUID, first_id),
    COALESCE(p_audit->>'action', 'update'),
    COALESCE(p_audit->>'http_method', 'POST'),
    COALESCE(p_audit->>'path', ''),
    p_audit->'previous_state',
    p_audit->'new_state',
    COALESCE(NULLIF(p_audit->>'requester_user_id', '')::UUID, uid),
    NULLIF(p_audit->>'approver_user_id', '')::UUID,
    src,
    p_kind
  );

  RETURN jsonb_build_object('ok', true, 'id', first_id);
END;
$$;
