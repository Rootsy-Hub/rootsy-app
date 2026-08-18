-- Remove POP cache-revision counters. Invalidation is explicit from the app.

DROP FUNCTION IF EXISTS public.get_pop_cache_revisions (UUID) CASCADE;
DROP FUNCTION IF EXISTS public.bump_pop_cache_revision (UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_pop_cache_revisions_row (UUID) CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_catalog_cache_revision () CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_permissions_on_membership_change () CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_permissions_on_role_change () CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_settings_cache_revision () CASCADE;
DROP FUNCTION IF EXISTS public.trg_pop_cache_revisions_on_pop_insert () CASCADE;

DROP TABLE IF EXISTS public.pop_cache_revisions;
