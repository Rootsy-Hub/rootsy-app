"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import {
  layoutsOperarCatalogCanvasBodyClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarCatalogCanvasScrollClass,
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarClosedClass,
  layoutsOperarCatalogSidebarInnerClass,
  layoutsOperarCatalogSidebarOpenClass,
  layoutsOperarCatalogToolbarClass,
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarFormDarkSecondaryButtonClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { SaleCatalogBrowserSkeleton } from "@/components/sale-operation/SaleCatalogBrowserSkeleton"
import { SaleCatalogSidebarNav } from "@/components/sale-operation/SaleCatalogSidebarNav"
import { SaleCatalogSidebarNavSkeleton } from "@/components/sale-operation/SaleCatalogSidebarNavSkeleton"
import { ServiceOperateCatalogToolbar } from "@/components/service-operation/ServiceOperateCatalogToolbar"
import { ServiceOperateSelectedServiceDetail } from "@/components/service-operation/ServiceOperateSelectedServiceDetail"
import { ServiceOperateServiceCard } from "@/components/service-operation/ServiceOperateServiceCard"
import type { SaleCatalogViewPersisted } from "@/lib/saleCatalogPreference"
import type {
  ServiceOperateCatalogCategory,
  ServiceOperateCatalogItem,
} from "@/lib/serviceOperateCatalog"
import { CatalogScrollFades } from "@/components/sale-operation/CatalogScrollFades"
import { useCatalogScrollFade } from "@/hooks/useCatalogScrollFade"
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { useMemo, useState } from "react"

const ALL_CATEGORY_NAME = "Todos"

type Props = {
  items: ServiceOperateCatalogItem[]
  categories: ServiceOperateCatalogCategory[]
  loading: boolean
  error: string | null
  selectedServiceId: string | null
  selectedService?: ServiceTypeChargeOption | null
  popId?: string
  catalogSidebarOpen?: boolean
  disabled?: boolean
  onSelectService: (serviceId: string) => void
  onClearSelectedService?: () => void
}

function normalizarBusqueda(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
}

export function ServiceOperateCatalogBrowser({
  items,
  categories,
  loading,
  error,
  selectedServiceId,
  selectedService = null,
  popId,
  catalogSidebarOpen = true,
  disabled = false,
  onSelectService,
  onClearSelectedService,
}: Props) {
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [busqueda, setBusqueda] = useState("")
  const [vistaCatalogo, setVistaCatalogo] = useState<SaleCatalogViewPersisted>({
    modo: "categoria",
    categoria: ALL_CATEGORY_NAME,
  })
  const [clearServiceConfirmOpen, setClearServiceConfirmOpen] = useState(false)
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null)
  const catalogFade = useCatalogScrollFade(scrollRoot)

  const showSelectedDetail = Boolean(selectedService && popId?.trim())

  const handleConfirmClearService = () => {
    setClearServiceConfirmOpen(false)
    onClearSelectedService?.()
  }

  const saleCategories = useMemo((): SaleCatalogCategory[] => {
    return [
      { id: "__all__", name: ALL_CATEGORY_NAME, sortOrder: -1 },
      ...categories.map((category, index) => ({
        id: category.id,
        name: category.name,
        sortOrder: index,
      })),
    ]
  }, [categories])

  const searchNorm = normalizarBusqueda(busqueda.trim())

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (
        vistaCatalogo.modo === "categoria" &&
        vistaCatalogo.categoria !== ALL_CATEGORY_NAME
      ) {
        if (item.categoryName !== vistaCatalogo.categoria) return false
      }
      if (!searchNorm) return true
      return item.searchText.includes(searchNorm)
    })
  }, [items, vistaCatalogo, searchNorm])

  return (
    <>
      <div
        className={cn(
          layoutsOperarCatalogColumnClass,
          showSelectedDetail && "flex-col",
        )}
      >
      {showSelectedDetail ? (
        <>
          <div className={cn(layoutsOperarCatalogToolbarClass, "justify-start")}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setClearServiceConfirmOpen(true)}
              className={layoutsOperarFormDarkSecondaryButtonClass}
            >
              <ChevronLeft className="size-4 shrink-0 opacity-80" aria-hidden />
              Elegir otro servicio
            </button>
          </div>
          <ServiceOperateSelectedServiceDetail
            popId={popId!}
            service={selectedService!}
            className="min-h-0 flex-1"
          />
        </>
      ) : (
        <>
          <aside
            id="data-workspace-sidebar"
            className={cn(
              layoutsOperarCatalogSidebarClass,
              catalogSidebarOpen
                ? layoutsOperarCatalogSidebarOpenClass
                : layoutsOperarCatalogSidebarClosedClass,
            )}
            aria-hidden={!catalogSidebarOpen}
            {...(!catalogSidebarOpen ? { inert: true } : {})}
            aria-label="Categorías de servicios"
          >
            <div className={layoutsOperarCatalogSidebarInnerClass}>
              {loading && !error ? (
                <SaleCatalogSidebarNavSkeleton />
              ) : (
                <SaleCatalogSidebarNav
                  categories={saleCategories}
                  vistaCatalogo={vistaCatalogo}
                  onVistaChange={setVistaCatalogo}
                />
              )}
            </div>
          </aside>

          <section className={layoutsOperarCatalogCanvasClass}>
            <ServiceOperateCatalogToolbar
              modoVista={modoVista}
              onModoVistaChange={setModoVista}
              busqueda={busqueda}
              onBusquedaChange={setBusqueda}
            />

            <div className={layoutsOperarCatalogCanvasBodyClass}>
            <div
              ref={setScrollRoot}
              className={cn(
                "min-h-0 h-full",
                loading && !error
                  ? layoutsOperarCatalogCanvasScrollClass
                  : error
                    ? "flex flex-1 flex-col p-6"
                    : cn(layoutsOperarCatalogCanvasScrollClass),
              )}
            >
              {loading && !error ? (
                <SaleCatalogBrowserSkeleton variant={modoVista} />
              ) : error ? (
                <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
                  <p className="max-w-md text-sm text-rose-300">{error}</p>
                </div>
              ) : visibleItems.length === 0 ? (
                <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm font-medium text-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,transparent)]">
                    No hay servicios para mostrar
                  </p>
                  <p className={cn("max-w-xs text-xs", layoutsOperarFormDarkMutedTextClass)}>
                    Activá servicios en el catálogo o probá otra búsqueda.
                  </p>
                </div>
              ) : (
                <div
                  className={
                    modoVista === "grid"
                      ? layoutsOperarCatalogGridClass
                      : "flex flex-col gap-2"
                  }
                >
                  {visibleItems.map((service) => (
                    <ServiceOperateServiceCard
                      key={service.id}
                      service={service}
                      variant={modoVista}
                      selected={selectedServiceId === service.id}
                      disabled={disabled}
                      onClick={() => onSelectService(service.id)}
                    />
                  ))}
                </div>
              )}
            </div>
            {!loading && !error && visibleItems.length > 0 ? (
              <CatalogScrollFades
                atCeiling={catalogFade.atCeiling}
                atFloor={catalogFade.atFloor}
              />
            ) : null}
            </div>
          </section>
        </>
      )}
      </div>

      <AlertDialog open={clearServiceConfirmOpen} onOpenChange={setClearServiceConfirmOpen}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel
            title="¿Elegir otro servicio?"
            description="Volvés al catálogo. Se quitará el servicio seleccionado y la configuración asociada al cargo."
          />
          <RootsAlertDialogFooter
            cancelLabel="Cancelar"
            confirmLabel="Elegir otro"
            onCancel={() => setClearServiceConfirmOpen(false)}
            onConfirm={handleConfirmClearService}
          />
        </RootsAlertDialogContent>
      </AlertDialog>
    </>
  )
}
