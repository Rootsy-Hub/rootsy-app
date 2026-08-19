-- El proveedor queda en article_costs.supplier_id (opcional por forma de compra).
-- Ya no se vinculan proveedores al artículo.

DROP POLICY IF EXISTS article_suppliers_select ON public.article_suppliers;
DROP POLICY IF EXISTS article_suppliers_insert ON public.article_suppliers;
DROP POLICY IF EXISTS article_suppliers_delete ON public.article_suppliers;

DROP TABLE IF EXISTS public.article_suppliers;
