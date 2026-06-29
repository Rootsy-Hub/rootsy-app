"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { SaleCatalogBrowser } from "@/components/sale-operation/SaleCatalogBrowser"

type Props = {
  siteId: string
  popId: string
  checkout: MesasSaleCheckout
  catalogSidebarOpen: boolean
}

export function MesasCatalogPanel({
  siteId,
  popId,
  checkout,
  catalogSidebarOpen,
}: Props) {
  const {
    catalogLoading,
    catalogError,
    saleCategories,
    productosCatalogo,
    agregarAlCarrito,
  } = checkout

  return (
    <SaleCatalogBrowser
      siteId={siteId}
      popId={popId}
      categories={saleCategories}
      products={productosCatalogo}
      loading={catalogLoading}
      error={catalogError}
      onAddProduct={agregarAlCarrito}
      catalogSidebarOpen={catalogSidebarOpen}
    />
  )
}
