"use client"

import type { MostradorSaleCheckout } from "@/app/[siteId]/[popId]/mostrador/useMostradorSaleCheckout"
import { PromotionComboWizard } from "@/components/sale-operation/PromotionComboWizard"
import { SaleCatalogBrowser } from "@/components/sale-operation/SaleCatalogBrowser"

type Props = {
  siteId: string
  popId: string
  checkout: MostradorSaleCheckout
  catalogSidebarOpen: boolean
}

export function MostradorCatalogPanel({
  siteId,
  popId,
  checkout,
  catalogSidebarOpen,
}: Props) {
  const {
    catalogLoading,
    catalogError,
    menuCategorySections,
    productosCatalogo,
    agregarAlCarrito,
    promoWizardOpen,
    setPromoWizardOpen,
    promoWizardTarget,
    confirmarPromoWizard,
  } = checkout

  return (
    <>
      <SaleCatalogBrowser
        siteId={siteId}
        popId={popId}
        categories={[]}
        categorySections={menuCategorySections}
        products={productosCatalogo}
        loading={catalogLoading}
        error={catalogError}
        onAddProduct={agregarAlCarrito}
        catalogSidebarOpen={catalogSidebarOpen}
      />
      <PromotionComboWizard
        open={promoWizardOpen}
        promotion={promoWizardTarget}
        onOpenChange={setPromoWizardOpen}
        onConfirm={(selections) => {
          if (promoWizardTarget) {
            confirmarPromoWizard(promoWizardTarget.id, selections)
          }
          setPromoWizardOpen(false)
        }}
      />
    </>
  )
}
