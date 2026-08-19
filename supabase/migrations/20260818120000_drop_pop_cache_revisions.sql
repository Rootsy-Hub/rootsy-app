-- Remove POP cache-revision counters. Invalidation is explicit from the app.

DROP TRIGGER IF EXISTS articles_bump_pop_catalog_rev ON public.articles;
DROP TRIGGER IF EXISTS categories_bump_pop_catalog_rev ON public.categories;
DROP TRIGGER IF EXISTS recipes_bump_pop_catalog_rev ON public.recipes;
DROP TRIGGER IF EXISTS recipe_categories_bump_pop_catalog_rev ON public.recipe_categories;
DROP TRIGGER IF EXISTS recipe_ingredients_bump_pop_catalog_rev ON public.recipe_ingredients;
DROP TRIGGER IF EXISTS promotions_bump_pop_catalog_rev ON public.promotions;
DROP TRIGGER IF EXISTS promotion_slots_bump_pop_catalog_rev ON public.promotion_slots;
DROP TRIGGER IF EXISTS promotion_slot_options_bump_pop_catalog_rev ON public.promotion_slot_options;
DROP TRIGGER IF EXISTS user_pop_roles_bump_permissions_rev ON public.user_pop_roles;
DROP TRIGGER IF EXISTS roles_bump_permissions_rev ON public.roles;
DROP TRIGGER IF EXISTS pops_bump_pop_settings_rev ON public.pops;
DROP TRIGGER IF EXISTS pops_ensure_cache_revisions_row ON public.pops;

DROP FUNCTION IF EXISTS public.get_pop_cache_revisions (UUID) CASCADE;
DROP FUNCTION IF EXISTS public.bump_pop_cache_revision (UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.ensure_pop_cache_revisions_row (UUID) CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_catalog_cache_revision () CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_permissions_on_membership_change () CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_permissions_on_role_change () CASCADE;
DROP FUNCTION IF EXISTS public.trg_bump_pop_settings_cache_revision () CASCADE;
DROP FUNCTION IF EXISTS public.trg_pop_cache_revisions_on_pop_insert () CASCADE;

DROP TABLE IF EXISTS public.pop_cache_revisions;
