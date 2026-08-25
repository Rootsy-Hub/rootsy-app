"use client"

import type { MesasSaleCheckout } from "@/app/[siteId]/[popId]/mesas/useMesasSaleCheckout"
import { PromotionComboWizard } from "@/components/sale-operation/PromotionComboWizard"
import { SaleCatalogBrowser } from "@/components/sale-operation/SaleCatalogBrowser"

type Props = {
  siteId: string
  popId: string
  checkout: MesasSaleCheckout
  catalogSidebarOpen: boolean
  onCatalogSidebarOpenChange?: (open: boolean) => void
}

export function MesasCatalogPanel({
  siteId,
  popId,
  checkout,
  catalogSidebarOpen,
  onCatalogSidebarOpenChange,
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
        onCatalogSidebarOpenChange={onCatalogSidebarOpenChange}
        catalogScope="menu"
        itemsSource="menu"
        itemsEnabled={checkout.catalogLoadEnabled}
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
