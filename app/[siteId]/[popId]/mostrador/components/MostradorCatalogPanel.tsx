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
    mergeCatalogArticles,
    mergeCatalogRecipes,
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
        catalogScope="menu"
        itemsSource="menu"
        mergeCatalogArticles={mergeCatalogArticles}
        mergeCatalogRecipes={mergeCatalogRecipes}
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
