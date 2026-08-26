"use client"

import type { ServiceTypeChargeOption } from "@/app/[siteId]/[popId]/active-services/actions"
import type { SaleCatalogCategory } from "@/app/[siteId]/[popId]/sale/actions"
import { MenuSidebar } from "@/components/MenuSidebar"
import {
  layoutsOperarCatalogCanvasBodyClass,
  layoutsOperarCatalogCanvasClass,
  layoutsOperarCatalogCanvasScrollClass,
  layoutsOperarCatalogColumnClass,
  layoutsOperarCatalogGridClass,
  layoutsOperarCatalogGridStyle,
  layoutsOperarCatalogSidebarClass,
  layoutsOperarCatalogSidebarClosedClass,
  layoutsOperarCatalogSidebarOpenClass,
  layoutsOperarFormDarkMutedTextClass,
  layoutsOperarScrollMinimalClass,
} from "@/app/library/layouts/layoutsOperarStyles"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
} from "@/components/rootsy-dialog"
import { AlertDialog } from "@/components/ui/alert-dialog"
import { SaleCatalogBrowserSkeleton } from "@/components/sale-operation/SaleCatalogBrowserSkeleton"
import { useRegisterOperarMobileCategoryPicker } from "@/components/layouts-module/OperarMobileStage"
import { SaleCatalogMobileCategoryBar } from "@/components/sale-operation/SaleCatalogMobileCategoryBar"
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
import { cn } from "@/lib/utils"
import { ChevronLeft } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

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
  onCatalogSidebarOpenChange?: (open: boolean) => void
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
  onCatalogSidebarOpenChange,
  disabled = false,
  onSelectService,
  onClearSelectedService,
}: Props) {
  const [modoVista, setModoVista] = useState<"grid" | "lista">("grid")
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false)
  const [busqueda, setBusqueda] = useState("")
  const [vistaCatalogo, setVistaCatalogo] = useState<SaleCatalogViewPersisted>({
    modo: "categoria",
    categoria: ALL_CATEGORY_NAME,
  })
  const [clearServiceConfirmOpen, setClearServiceConfirmOpen] = useState(false)

  const showSelectedDetail = Boolean(selectedService && popId?.trim())
  const vistaEfectiva = isMobileViewport ? "lista" : modoVista
  const categoryLabel =
    vistaCatalogo.modo === "categoria"
      ? vistaCatalogo.categoria || "Categoría"
      : "Categoría"
  const usesMobileStage = useRegisterOperarMobileCategoryPicker(
    categoryLabel,
    categoryPickerOpen,
    setCategoryPickerOpen,
  )

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const apply = () => setIsMobileViewport(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  useEffect(() => {
    const categoryName = selectedService?.categoryName.trim()
    if (!categoryName) return
    setVistaCatalogo({ modo: "categoria", categoria: categoryName })
  }, [selectedService?.id, selectedService?.categoryName])

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
      <div className={layoutsOperarCatalogColumnClass}>
        {showSelectedDetail ? null : (
          <MenuSidebar
            id="data-workspace-sidebar"
            collapseBelow={false}
            padded={false}
            fixedWidth={false}
            className={cn(
              "max-md:hidden",
              layoutsOperarCatalogSidebarClass,
              catalogSidebarOpen
                ? layoutsOperarCatalogSidebarOpenClass
                : layoutsOperarCatalogSidebarClosedClass,
            )}
            aria-hidden={!catalogSidebarOpen}
            inert={!catalogSidebarOpen}
            aria-label="Categorías de servicios"
          >
            {loading && !error ? (
              <SaleCatalogSidebarNavSkeleton />
            ) : (
              <SaleCatalogSidebarNav
                categories={saleCategories}
                vistaCatalogo={vistaCatalogo}
                onVistaChange={setVistaCatalogo}
              />
            )}
          </MenuSidebar>
        )}

        <section
          className={cn(
            layoutsOperarCatalogCanvasClass,
            "relative",
            showSelectedDetail && "[grid-template-rows:minmax(0,1fr)]",
            !showSelectedDetail &&
              !usesMobileStage &&
              "max-md:[grid-template-rows:var(--layouts-operar-catalog-toolbar-h)_var(--layouts-operar-catalog-toolbar-h)_minmax(0,1fr)]",
          )}
        >
          {showSelectedDetail ? (
            <div className={layoutsOperarCatalogCanvasBodyClass}>
              <div
                className={cn(
                  layoutsOperarScrollMinimalClass,
                  "h-full min-h-0 overflow-y-auto overscroll-contain",
                  "px-6 py-5 sm:px-8 sm:py-6",
                )}
              >
                <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => setClearServiceConfirmOpen(true)}
                    className={cn(
                      "inline-flex w-fit items-center gap-1 text-xs font-medium",
                      layoutsOperarFormDarkMutedTextClass,
                      "transition-colors hover:text-[var(--layouts-operar-product-card-title)]",
                      "focus-visible:outline-none focus-visible:text-[var(--layouts-operar-product-card-title)]",
                      "disabled:pointer-events-none disabled:opacity-45",
                    )}
                  >
                    <ChevronLeft className="size-3.5 shrink-0" aria-hidden />
                    Elegir otro servicio
                  </button>
                  <ServiceOperateSelectedServiceDetail
                    popId={popId!}
                    service={selectedService!}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {!usesMobileStage ? (
                <SaleCatalogMobileCategoryBar
                  label={categoryLabel}
                  open={categoryPickerOpen}
                  onToggle={() => setCategoryPickerOpen((current) => !current)}
                />
              ) : null}
              {categoryPickerOpen ? (
                <div
                  className={cn(
                    "absolute z-30 overflow-hidden md:hidden",
                    "bg-[var(--rootsy-sombra-800)]",
                    usesMobileStage
                      ? "inset-0"
                      : "inset-x-0 bottom-0 top-[var(--layouts-operar-catalog-toolbar-h)] max-md:col-start-1 max-md:row-start-1",
                  )}
                >
                  <SaleCatalogSidebarNav
                    categories={saleCategories}
                    vistaCatalogo={vistaCatalogo}
                    onVistaChange={(view) => {
                      setVistaCatalogo(view)
                      setCategoryPickerOpen(false)
                    }}
                    density="comfortable"
                  />
                </div>
              ) : null}
              <ServiceOperateCatalogToolbar
                modoVista={vistaEfectiva}
                onModoVistaChange={setModoVista}
                busqueda={busqueda}
                onBusquedaChange={setBusqueda}
              />

              <div className={layoutsOperarCatalogCanvasBodyClass}>
                <div
                  className={cn(
                    "min-h-0 h-full",
                    loading && !error
                      ? layoutsOperarCatalogCanvasScrollClass
                      : error
                        ? "flex flex-1 flex-col p-6"
                        : layoutsOperarCatalogCanvasScrollClass,
                  )}
                >
                  {loading && !error ? (
                    <SaleCatalogBrowserSkeleton variant={vistaEfectiva} />
                  ) : error ? (
                    <div className="flex min-h-[200px] flex-1 flex-col items-center justify-center gap-2 text-center">
                      <p className="max-w-md text-sm text-rose-300">{error}</p>
                    </div>
                  ) : visibleItems.length === 0 ? (
                    <div className="flex min-h-[16rem] flex-col items-center justify-center gap-2 px-6 text-center">
                      <p className="text-sm font-medium text-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,transparent)]">
                        No hay servicios para mostrar
                      </p>
                      <p
                        className={cn(
                          "max-w-xs text-xs",
                          layoutsOperarFormDarkMutedTextClass,
                        )}
                      >
                        Activá servicios en el catálogo o probá otra búsqueda.
                      </p>
                    </div>
                  ) : (
                    <div
                      className={
                        vistaEfectiva === "grid"
                          ? layoutsOperarCatalogGridClass
                          : "flex flex-col gap-2"
                      }
                      style={
                        vistaEfectiva === "grid"
                          ? layoutsOperarCatalogGridStyle
                          : undefined
                      }
                    >
                      {visibleItems.map((service) => (
                        <ServiceOperateServiceCard
                          key={service.id}
                          service={service}
                          variant={vistaEfectiva}
                          selected={selectedServiceId === service.id}
                          disabled={disabled}
                          onClick={() => onSelectService(service.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      <AlertDialog
        open={clearServiceConfirmOpen}
        onOpenChange={setClearServiceConfirmOpen}
      >
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
