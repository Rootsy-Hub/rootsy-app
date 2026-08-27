"use client"

import { HrPersonCard } from "@/app/[siteId]/[popId]/hr/HrPersonCard"
import type { EmployeeRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import {
  ComponentView,
  type ComponentViewProps,
  type ComponentViewRenderContext,
} from "@/components/ComponentView"
import {
  DataWorkspaceListActiveFiltersBar,
} from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import {
  DataWorkspaceTableMoney,
  WorkspaceTableStatusBadge,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import {
  workspaceTableNatureStockDangerClass,
  workspaceTableNatureStockOkClass,
  workspaceTableNatureStockWarningClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import {
  OperarMobileToolboxIcons,
  OperarMobileToolboxProvider,
  useRegisterOperarMobileToolbox,
  type OperarMobileToolboxItem,
} from "@/components/layouts-module/OperarMobileToolbox"
import { OperarTicketEmptyState } from "@/components/layouts-module/OperarTicketEmptyState"
import { PurchaseCatalogProductCard } from "@/components/purchase-operation/PurchaseCatalogProductCard"
import type { PurchaseCatalogProduct } from "@/components/purchase-operation/purchaseCatalogTypes"
import { PurchaseOperationToolbox } from "@/components/purchase-operation/PurchaseOperationToolbox"
import { ReportHubCard } from "@/components/reports/ReportHubCard"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsButtonAtmosphereProvider,
  RootsDangerButton,
  RootsDangerSubtleButton,
  RootsDefaultButton,
  RootsIconButton,
  RootsLinkButton,
  RootsPrimaryButton,
  RootsProgressButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import {
  RootsAlertDialogContent,
  RootsAlertDialogFooter,
  RootsAlertDialogPanel,
  RootsConfirmDialog,
  RootsDialogBody,
  RootsDialogContent,
  RootsDialogDualActionFooter,
  RootsDialogErrorBanner,
  RootsDialogHeader,
  RootsDialogLoadingState,
} from "@/components/rootsy-dialog"
import {
  RootsDropdownContent,
  RootsDropdownItem,
  RootsDropdownMenu,
  RootsDropdownSeparator,
  RootsDropdownTrigger,
} from "@/components/rootsy-dropdown"
import { RootsyEmptyState } from "@/components/rootsy-empty-state"
import {
  RootsFormCheckboxChoiceRow,
  RootsFormCheckboxField,
  RootsFormDateField,
  RootsFormDiscountField,
  RootsFormImageUploadField,
  RootsFormIntegerField,
  RootsFormMoneyField,
  RootsFormPhoneField,
  RootsFormQuantityField,
  RootsFormSearchField,
  RootsFormSegmentField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormSwitchField,
  RootsFormTaxDocumentField,
  RootsFormTextareaField,
  RootsFormTextField,
  RootsFormTimeField,
} from "@/components/rootsy-form"
import { RootsImageLightbox } from "@/components/rootsy-lightbox/RootsImageLightbox"
import { RootsSortableActionList } from "@/components/rootsy-list/RootsSortableActionList"
import { showRootsyMensajeToast } from "@/components/rootsy-mensaje"
import { RootsNaturePill } from "@/components/rootsy-pill/RootsNaturePill"
import { RootsSpinner } from "@/components/rootsy-spinner"
import { RootsyThinkingHalo } from "@/components/rootsy-thinking/RootsyThinkingHalo"
import { showRootsyToast } from "@/components/rootsy-toast/showRootsyToast"
import { SaleCatalogEmptyMascot } from "@/components/sale-operation/SaleCatalogEmptyMascot"
import { SaleCatalogProductCard } from "@/components/sale-operation/SaleCatalogProductCard"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import { SaleCatalogSidebarNav } from "@/components/sale-operation/SaleCatalogSidebarNav"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import { ServiceOperateServiceCard } from "@/components/service-operation/ServiceOperateServiceCard"
import { PopSettingsSectionNav } from "@/components/settings/PopSettingsSectionNav"
import { StatisticsSectionNav } from "@/components/statistics/StatisticsSectionNav"
import { AlertDialog } from "@/components/ui/alert-dialog"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { POP_SETTINGS_SECTIONS } from "@/lib/popSettingsCatalog"
import type { SaleCatalogViewPersisted } from "@/lib/saleCatalogPreference"
import { STATISTICS_SECTIONS } from "@/lib/statisticsCatalog"
import { cn } from "@/lib/utils"
import {
  ArrowRight,
  BarChart3,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  Users,
} from "lucide-react"
import { useMemo, useState, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

const BRUMA = "var(--rootsy-bruma-100)"
const ETER = "var(--rootsy-eter-950)"
const SOMBRA = "var(--rootsy-sombra-800)"
const noop = () => undefined

const FIELD_STATES = [
  { items: [{ name: "idle" }, { name: "hint" }, { name: "error" }, { name: "warning" }, { name: "success" }, { name: "deshabilitado" }] },
] as const

const IDLE_DISABLED = [
  { items: [{ name: "idle" }, { name: "deshabilitado" }] },
] as const

const SAMPLE_PRODUCT: SaleCatalogProduct = {
  id: "demo",
  nombre: "Medialuna",
  descripcion: "Hojaldre",
  precio: 1200,
  categoria: "Panadería",
  imagen: "",
}

const SAMPLE_PURCHASE: PurchaseCatalogProduct = {
  id: "demo",
  nombre: "Harina 000",
  descripcion: "Kilo",
  iva: 21,
  categoria: "Insumos",
  categoriaFiltro: "item:1",
  imagen: "",
  unitOfMeasure: "kg",
  costs: [],
}

const SAMPLE_PERSON: EmployeeRow = {
  id: "demo",
  userId: "u1",
  firstName: "María",
  lastName: "González",
  jobTitle: "Cajera",
  documentNumber: null,
  email: "mail@demo",
  phone: null,
  monthlySalary: null,
  hiredAt: null,
  leftAt: null,
  notes: null,
  isClockedIn: false,
  clockedInAt: null,
}

function fieldAssist(state: string) {
  return {
    disabled: state === "deshabilitado",
    hint: state === "hint" ? "Texto de ayuda." : undefined,
    error: state === "error" ? "Corregí este dato." : undefined,
    warning: state === "warning" ? "Revisá este dato." : undefined,
    success: state === "success" ? "Verificado." : undefined,
    invalid: state === "error",
  }
}

function FieldShell({ children }: { children: ReactNode }) {
  return <div className="w-full max-w-sm">{children}</div>
}

function atmosphereTheme(worldId: ComponentViewRenderContext["worldId"]) {
  switch (worldId) {
    case "eter":
      return "rootsy-theme-landing"
    case "sombra":
      return "rootsy-theme-pos"
    default:
      return "rootsy-theme-workspace"
  }
}

function Stack({ children }: { children: ReactNode }) {
  return <div className="flex flex-col gap-4">{children}</div>
}

function LiveView(props: ComponentViewProps) {
  return <ComponentView {...props} />
}

/* —— Navegación · Sidebar / paginación / piezas de header —— */

function SidebarFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={SOMBRA}
        componentName="SaleCatalogSidebarNav"
        componentProperties={[
          { name: "categories", values: ["SaleCatalogCategory[]"] },
          { name: "vistaCatalogo", values: ["SaleCatalogViewPersisted"] },
          { name: "density", values: ["default", "comfortable"] },
        ]}
        variants={[{ name: "default" }, { name: "comfortable" }]}
        render={(variant) => <SaleSidebarLive density={variant === "comfortable" ? "comfortable" : "default"} />}
      />
      <LiveView
        background={SOMBRA}
        componentName="DataWorkspaceSectionMenu"
        componentProperties={[
          { name: "viewItems", values: ["{ id, label }[]"] },
          { name: "headerVariant", values: ["dark", "default"] },
        ]}
        variants={[{ name: "dark" }, { name: "default" }]}
        render={(variant) => <SectionMenuLive headerVariant={variant === "default" ? "default" : "dark"} />}
      />
      <LiveView
        background={SOMBRA}
        componentName="StatisticsSectionNav"
        componentProperties={[
          { name: "sections", values: ["StatisticsSection[]"] },
          { name: "activeSectionId", values: ["string"] },
        ]}
        variants={[{ name: "Estadísticas" }]}
        render={() => (
          <div className="overflow-x-auto rounded-xl p-3">
            <StatisticsSectionNav
              sections={STATISTICS_SECTIONS.slice(0, 4)}
              activeSectionId="sales"
              getSectionHref={() => "#"}
            />
          </div>
        )}
      />
      <LiveView
        background={SOMBRA}
        componentName="PopSettingsSectionNav"
        componentProperties={[
          { name: "sections", values: ["PopSettingsSection[]"] },
          { name: "activeSectionId", values: ["string"] },
          { name: "onSectionSelect", values: ["(id: string) => void"] },
        ]}
        variants={[{ name: "Ajustes" }]}
        render={() => <PopSettingsNavLive />}
      />
    </Stack>
  )
}

function SaleSidebarLive({ density }: { density: "default" | "comfortable" }) {
  const [vista, setVista] = useState<SaleCatalogViewPersisted>({
    modo: "categoria",
    categoria: "A",
  })
  return (
    <div className="h-56 overflow-auto rounded-xl p-3">
      <SaleCatalogSidebarNav
        density={density}
        categories={[
          { id: "1", name: "Panadería", sortOrder: 0 },
          { id: "2", name: "Bebidas", sortOrder: 1 },
        ]}
        vistaCatalogo={vista}
        onVistaChange={setVista}
      />
    </div>
  )
}

function SectionMenuLive({ headerVariant }: { headerVariant: "dark" | "default" }) {
  const [activeId, setActiveId] = useState("a")
  return (
    <div className={cn("rounded-xl p-3", headerVariant === "dark" && "bg-[var(--rootsy-sombra-800)]")}>
      <DataWorkspaceSectionMenu
        headerVariant={headerVariant}
        activeId={activeId}
        onSelect={setActiveId}
        viewItems={[
          { id: "a", label: "Vista A" },
          { id: "b", label: "Vista B" },
        ]}
      />
    </div>
  )
}

function PopSettingsNavLive() {
  const [id, setId] = useState(POP_SETTINGS_SECTIONS[0]!.id)
  return (
    <div className="overflow-x-auto rounded-xl p-3">
      <PopSettingsSectionNav
        sections={POP_SETTINGS_SECTIONS}
        activeSectionId={id}
        onSectionSelect={setId}
      />
    </div>
  )
}

function PaginationFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="DataWorkspaceListPaginationFooter"
      componentProperties={[
        { name: "variant", values: ["default", "dark", "earth", "tables"] },
        { name: "floating", values: ["true", "false"] },
        { name: "listFetching", values: ["true", "false"] },
        { name: "totalCount", values: ["number"] },
        { name: "pageSize", values: ["20", "50"] },
      ]}
      variants={[
        { name: "default" },
        { name: "dark" },
        { name: "earth" },
        { name: "tables" },
      ]}
      extras={[
        { items: [{ name: "idle" }, { name: "cargando" }] },
        { items: [{ name: "anclado" }, { name: "flotante" }] },
      ]}
      render={(variant, extras) => (
        <div
          className={cn(
            "overflow-hidden rounded-xl",
            variant === "dark" && "bg-[var(--rootsy-sombra-800)]",
          )}
        >
          <DataWorkspaceListPaginationFooter
            listFetching={extras[0] === "cargando"}
            floating={extras[1] === "flotante"}
            variant={variant as "default" | "dark" | "earth" | "tables"}
            totalCount={48}
            rangeStart={1}
            rangeEnd={20}
            currentPage={1}
            totalPages={3}
            pageSize={20}
            pageSizeOptions={[20, 50]}
            paginationItems={[1, 2, 3]}
            onPageChange={noop}
            onPageSizeChange={noop}
            pageSizeLabelId="handbook-final-page-size"
          />
        </div>
      )}
    />
  )
}

function HeaderPiecesFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="DataWorkspaceHeaderIconButton"
        componentProperties={[
          { name: "label", values: ["string"] },
          { name: "headerVariant", values: ["default", "dark"] },
          { name: "primary", values: ["true", "false"] },
        ]}
        variants={[{ name: "claro" }, { name: "oscuro" }]}
        extras={IDLE_DISABLED}
        render={(variant, extras) => (
          <div className={cn("rounded-xl p-3", variant === "oscuro" && "bg-[var(--rootsy-sombra-800)]")}>
            <DataWorkspaceHeaderIconButton
              label="Acción"
              headerVariant={variant === "oscuro" ? "dark" : "default"}
              disabled={extras[0] === "deshabilitado"}
            >
              <Plus />
            </DataWorkspaceHeaderIconButton>
          </div>
        )}
      />
      <LiveView
        background={SOMBRA}
        componentName="DataWorkspaceHeaderUserMenu"
        componentProperties={[
          { name: "userName", values: ["string"] },
          { name: "isOnline", values: ["true", "false"] },
          { name: "headerVariant", values: ["dark", "default"] },
        ]}
        variants={[{ name: "online" }, { name: "offline" }]}
        render={(variant) => (
          <div className="rounded-xl p-3">
            <DataWorkspaceHeaderUserMenu
              userName="María González"
              isOnline={variant === "online"}
              headerVariant="dark"
              roleLabel="Administradora"
            />
          </div>
        )}
      />
      <LiveView
        background={ETER}
        componentName="RootsIconButton"
        componentProperties={[
          { name: "semantic", values: ["tertiary"] },
          { name: "atmosphere", values: ["eter"] },
        ]}
        variants={[{ name: "ícono" }, { name: "más" }]}
        render={(variant) => (
          <div className="rounded-xl p-3">
            <RootsIconButton
              label={variant === "más" ? "Más acciones" : "Editar"}
              semantic="tertiary"
              atmosphere="eter"
              size="default"
              onClick={noop}
            >
              {variant === "más" ? <MoreHorizontal /> : <Pencil />}
            </RootsIconButton>
          </div>
        )}
      />
    </Stack>
  )
}

/* —— Acciones —— */

function ButtonsFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsSemanticButton"
      componentProperties={[
        { name: "semantic", values: ["primary", "default", "subtle", "danger", "dangerSubtle", "link"] },
        { name: "size", values: ["compact", "default", "large"] },
        { name: "shape", values: ["default", "pill"] },
        { name: "atmosphere", values: ["bruma", "sombra", "eter"] },
        { name: "icon", values: ["LucideIcon"] },
        { name: "iconPosition", values: ["left", "right"] },
        { name: "loading", values: ["true", "false"] },
        { name: "disabled", values: ["true", "false"] },
      ]}
      variants={[
        { name: "Primary" },
        { name: "Default" },
        { name: "Subtle" },
        { name: "Danger" },
        { name: "Danger subtle" },
        { name: "Link" },
        { name: "Progress" },
      ]}
      extras={[
        { items: [{ name: "idle" }, { name: "deshabilitado" }, { name: "cargando" }] },
        { items: [{ name: "default" }, { name: "compact" }, { name: "large" }], initial: "default" },
        { items: [{ name: "default" }, { name: "pill" }], initial: "default" },
        { items: [{ name: "sin ícono" }, { name: "ícono izq." }, { name: "ícono der." }], initial: "sin ícono" },
      ]}
      render={(variant, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <RootsButtonAtmosphereProvider
            atmosphere={buttonAtmosphereFromWorld(context.worldId)}
          >
            <ButtonLive variant={variant} extras={extras} />
          </RootsButtonAtmosphereProvider>
        </div>
      )}
    />
  )
}

function buttonAtmosphereFromWorld(
  worldId: ComponentViewRenderContext["worldId"],
) {
  if (worldId === "sombra" || worldId === "eter") return worldId
  return "bruma" as const
}

function ButtonLive({ variant, extras }: { variant: string; extras: readonly string[] }) {
  const disabled = extras[0] === "deshabilitado"
  const loading = extras[0] === "cargando"
  const size = (extras[1] ?? "default") as "compact" | "default" | "large"
  const shape = extras[2] === "pill" ? "pill" : "default"
  const iconSlot = extras[3] ?? "sin ícono"
  const icon =
    iconSlot === "sin ícono"
      ? undefined
      : variant === "Danger" || variant === "Danger subtle"
        ? Trash2
        : iconSlot === "ícono der."
          ? ArrowRight
          : Plus
  const iconPosition = iconSlot === "ícono der." ? "right" : "left"
  const props = { size, shape, icon, iconPosition, disabled, loading, children: variant }
  switch (variant) {
    case "Default":
      return <RootsDefaultButton {...props} />
    case "Subtle":
      return <RootsSubtleButton {...props} />
    case "Danger":
      return <RootsDangerButton {...props} />
    case "Danger subtle":
      return <RootsDangerSubtleButton {...props} />
    case "Link":
      return <RootsLinkButton {...props} />
    case "Progress":
      return <RootsProgressButton {...props} loading={loading} />
    default:
      return <RootsPrimaryButton {...props} />
  }
}

function iconButtonSemantic(variant: string) {
  switch (variant) {
    case "Default":
      return "secondary" as const
    case "Subtle":
      return "tertiary" as const
    case "Danger":
      return "destructive" as const
    case "Danger subtle":
      return "destructiveSubtle" as const
    default:
      return "primary" as const
  }
}

function IconButtonLive({ variant, extras }: { variant: string; extras: readonly string[] }) {
  const disabled = extras[0] === "deshabilitado"
  const loading = extras[0] === "cargando"
  const size = (extras[1] ?? "default") as "compact" | "default" | "large"
  const shape = extras[2] === "pill" ? "pill" : "default"
  const icon =
    variant === "Danger" || variant === "Danger subtle" ? <Trash2 /> : <Plus />

  return (
    <RootsIconButton
      label={variant}
      semantic={iconButtonSemantic(variant)}
      size={size}
      shape={shape}
      disabled={disabled}
      loading={loading}
    >
      {icon}
    </RootsIconButton>
  )
}

function IconButtonsFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsIconButton"
        componentProperties={[
          { name: "label", values: ["string"] },
          { name: "semantic", values: ["primary", "default", "subtle", "danger", "dangerSubtle"] },
          { name: "size", values: ["compact", "default", "large"] },
          { name: "shape", values: ["default", "pill"] },
          { name: "atmosphere", values: ["bruma", "sombra", "eter"] },
          { name: "loading", values: ["true", "false"] },
          { name: "disabled", values: ["true", "false"] },
        ]}
        variants={[
          { name: "Primary" },
          { name: "Default" },
          { name: "Subtle" },
          { name: "Danger" },
          { name: "Danger subtle" },
        ]}
        extras={[
          { items: [{ name: "idle" }, { name: "deshabilitado" }, { name: "cargando" }] },
          { items: [{ name: "default" }, { name: "compact" }, { name: "large" }], initial: "default" },
          { items: [{ name: "default" }, { name: "pill" }], initial: "default" },
        ]}
        render={(variant, extras, context) => (
          <div className={atmosphereTheme(context.worldId)}>
            <RootsButtonAtmosphereProvider
              atmosphere={buttonAtmosphereFromWorld(context.worldId)}
            >
              <IconButtonLive variant={variant} extras={extras} />
            </RootsButtonAtmosphereProvider>
          </div>
        )}
      />
    </Stack>
  )
}

function DropdownFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsDropdownMenu"
      componentProperties={[
        { name: "atmosphere", values: ["bruma", "sombra", "eter"] },
        { name: "variant", values: ["default", "destructive"] },
      ]}
      variants={[{ name: "Menú" }]}
      extras={[{ items: [{ name: "con destructivo" }, { name: "sin destructivo" }] }]}
      render={(_variant, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <RootsButtonAtmosphereProvider
            atmosphere={buttonAtmosphereFromWorld(context.worldId)}
          >
            <RootsDropdownMenu>
              <RootsDropdownTrigger asChild>
                <RootsIconButton label="Menú">
                  <MoreHorizontal />
                </RootsIconButton>
              </RootsDropdownTrigger>
              <RootsDropdownContent>
                <RootsDropdownItem>Editar</RootsDropdownItem>
                <RootsDropdownItem>Duplicar</RootsDropdownItem>
                {extras[0] === "con destructivo" ? (
                  <>
                    <RootsDropdownSeparator />
                    <RootsDropdownItem variant="destructive">Eliminar</RootsDropdownItem>
                  </>
                ) : null}
              </RootsDropdownContent>
            </RootsDropdownMenu>
          </RootsButtonAtmosphereProvider>
        </div>
      )}
    />
  )
}

function TooltipFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="Tooltip"
      componentProperties={[
        { name: "children", values: ["trigger + content"] },
        { name: "atmosphere", values: ["bruma", "sombra", "eter"] },
      ]}
      variants={[{ name: "Icon button" }]}
      extras={[{ items: [{ name: "con tooltip" }, { name: "sin tooltip" }] }]}
      render={(_variant, extras, context) => {
        const button = (
          <RootsIconButton label="Editar">
            <Pencil />
          </RootsIconButton>
        )
        if (extras[0] === "sin tooltip") {
          return (
            <div className={atmosphereTheme(context.worldId)}>
              <RootsButtonAtmosphereProvider
                atmosphere={buttonAtmosphereFromWorld(context.worldId)}
              >
                {button}
              </RootsButtonAtmosphereProvider>
            </div>
          )
        }
        return (
          <div className={atmosphereTheme(context.worldId)}>
            <RootsButtonAtmosphereProvider
              atmosphere={buttonAtmosphereFromWorld(context.worldId)}
            >
              <Tooltip>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent>Editar</TooltipContent>
              </Tooltip>
            </RootsButtonAtmosphereProvider>
          </div>
        )
      }}
    />
  )
}

/* —— Formularios —— */

function TextFieldsFinalSpecimen() {
  return (
    <Stack>
      <FormTextView />
      <FormTextareaView />
      <FormSearchView />
      <FormMoneyView />
      <FormQuantityView />
      <FormIntegerView />
      <FormPhoneView />
      <FormTaxView />
      <FormDiscountView />
      <FormImageView />
    </Stack>
  )
}

function FormTextView() {
  const [value, setValue] = useState("Medialuna")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormTextField"
      componentProperties={[
        { name: "label", values: ["string"] },
        { name: "value", values: ["string"] },
        { name: "error / warning / success / hint", values: ["ReactNode"] },
        { name: "disabled", values: ["true", "false"] },
      ]}
      variants={[{ name: "Texto" }]}
      extras={FIELD_STATES}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormTextField
              label="Nombre"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              {...fieldAssist(extras[0] ?? "idle")}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormTextareaView() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormTextareaField"
      componentProperties={[
        { name: "label", values: ["string"] },
        { name: "error / warning / success / hint", values: ["ReactNode"] },
      ]}
      variants={[{ name: "Área" }]}
      extras={FIELD_STATES}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormTextareaField
              label="Notas"
              defaultValue="Sin TACC"
              {...fieldAssist(extras[0] ?? "idle")}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormSearchView() {
  const [value, setValue] = useState("")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormSearchField"
      componentProperties={[
        { name: "label", values: ["string"] },
        { name: "value", values: ["string"] },
      ]}
      variants={[{ name: "Búsqueda" }]}
      extras={IDLE_DISABLED}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormSearchField
              label="Buscar"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              disabled={extras[0] === "deshabilitado"}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormMoneyView() {
  const [value, setValue] = useState("4800")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormMoneyField"
      componentProperties={[
        { name: "label", values: ["string"] },
        { name: "value", values: ["string"] },
      ]}
      variants={[{ name: "Monto" }]}
      extras={FIELD_STATES}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormMoneyField
              label="Precio"
              value={value}
              onChange={setValue}
              {...fieldAssist(extras[0] ?? "idle")}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormQuantityView() {
  const [value, setValue] = useState("2")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormQuantityField"
      componentProperties={[{ name: "label", values: ["string"] }, { name: "value", values: ["string"] }]}
      variants={[{ name: "Cantidad" }]}
      extras={FIELD_STATES}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormQuantityField
              label="Cantidad"
              value={value}
              onChange={setValue}
              {...fieldAssist(extras[0] ?? "idle")}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormIntegerView() {
  const [value, setValue] = useState("4")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormIntegerField"
      componentProperties={[{ name: "label", values: ["string"] }, { name: "value", values: ["string"] }]}
      variants={[{ name: "Entero" }]}
      extras={FIELD_STATES}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormIntegerField
              label="Mesas"
              value={value}
              onChange={setValue}
              {...fieldAssist(extras[0] ?? "idle")}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormPhoneView() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormPhoneField"
      componentProperties={[{ name: "label", values: ["string"] }]}
      variants={[{ name: "Teléfono" }]}
      extras={FIELD_STATES}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormPhoneField
              label="Teléfono"
              defaultValue="1111111111"
              {...fieldAssist(extras[0] ?? "idle")}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormTaxView() {
  const [value, setValue] = useState("20111111112")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormTaxDocumentField"
      componentProperties={[
        { name: "valueMode", values: ["cuit_only", "digits_only"] },
        { name: "action", values: ["opcional"] },
      ]}
      variants={[{ name: "cuit_only" }, { name: "digits_only" }]}
      extras={[
        { items: [{ name: "idle" }, { name: "con acción" }, { name: "deshabilitado" }] },
      ]}
      render={(variant, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormTaxDocumentField
              label="CUIT"
              value={value}
              onChange={setValue}
              valueMode={variant === "digits_only" ? "digits_only" : "cuit_only"}
              disabled={extras[0] === "deshabilitado"}
              action={
                extras[0] === "con acción"
                  ? { label: "Validar", onClick: noop }
                  : undefined
              }
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormDiscountView() {
  const [mode, setMode] = useState<"porcentaje" | "fijo">("porcentaje")
  const [value, setValue] = useState("10")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormDiscountField"
      componentProperties={[
        { name: "mode", values: ["porcentaje", "fijo"] },
        { name: "value", values: ["string"] },
      ]}
      variants={[{ name: "porcentaje" }, { name: "fijo" }]}
      extras={FIELD_STATES}
      render={(variant, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormDiscountField
              label="Descuento"
              mode={variant === "fijo" ? "fijo" : mode}
              onModeChange={setMode}
              value={value}
              onChange={setValue}
              {...fieldAssist(extras[0] ?? "idle")}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function FormImageView() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormImageUploadField"
      componentProperties={[{ name: "label", values: ["string"] }, { name: "onFileSelect", values: ["(file) => void"] }]}
      variants={[{ name: "Imagen" }]}
      extras={IDLE_DISABLED}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormImageUploadField
              label="Foto"
              onFileSelect={noop}
              disabled={extras[0] === "deshabilitado"}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

function SelectsFinalSpecimen() {
  const [value, setValue] = useState("a")
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormSelectField"
      componentProperties={[
        { name: "label", values: ["string"] },
        { name: "value", values: ["string"] },
        { name: "disabled", values: ["true", "false"] },
      ]}
      variants={[{ name: "Select" }]}
      extras={FIELD_STATES}
      render={(_v, extras, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormSelectField
              label="Categoría"
              value={value}
              onValueChange={setValue}
              {...fieldAssist(extras[0] ?? "idle")}
            >
              <RootsFormSelectItem value="a">Panadería</RootsFormSelectItem>
              <RootsFormSelectItem value="b">Bebidas</RootsFormSelectItem>
            </RootsFormSelectField>
          </FieldShell>
        </div>
      )}
    />
  )
}

function CheckboxesFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsFormCheckboxField"
        componentProperties={[
          { name: "label", values: ["string"] },
          { name: "checked", values: ["true", "false"] },
        ]}
        variants={[{ name: "Campo" }]}
        extras={[{ items: [{ name: "marcado" }, { name: "libre" }, { name: "deshabilitado" }] }]}
        render={(_v, extras, context) => (
          <CheckboxFieldLive extras={extras} theme={atmosphereTheme(context.worldId)} />
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="RootsFormCheckboxChoiceRow"
        componentProperties={[
          { name: "label", values: ["string"] },
          { name: "checked", values: ["true", "false"] },
        ]}
        variants={[{ name: "Fila" }]}
        extras={[{ items: [{ name: "marcado" }, { name: "libre" }, { name: "deshabilitado" }] }]}
        render={(_v, extras) => <CheckboxRowLive extras={extras} />}
      />
    </Stack>
  )
}

function CheckboxFieldLive({ extras, theme }: { extras: readonly string[]; theme: string }) {
  const [checked, setChecked] = useState(extras[0] !== "libre")
  return (
    <div className={theme}>
      <RootsFormCheckboxField
        label="Aplica a venta"
        checked={checked}
        onCheckedChange={setChecked}
        disabled={extras[0] === "deshabilitado"}
      />
    </div>
  )
}

function CheckboxRowLive({ extras }: { extras: readonly string[] }) {
  const [checked, setChecked] = useState(extras[0] !== "libre")
  return (
    <RootsFormCheckboxChoiceRow
      label="Incluir en el reporte"
      checked={checked}
      onCheckedChange={setChecked}
      disabled={extras[0] === "deshabilitado"}
    />
  )
}

function RadiosFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormSegmentField"
      componentProperties={[
        { name: "layout", values: ["grid", "inline"] },
        { name: "disabled", values: ["true", "false"] },
      ]}
      variants={[{ name: "Formulario" }, { name: "Filtro" }]}
      extras={IDLE_DISABLED}
      render={(variant, extras, context) => (
        <RadiosLive
          variant={variant}
          disabled={extras[0] === "deshabilitado"}
          theme={atmosphereTheme(context.worldId)}
        />
      )}
    />
  )
}

function RadiosLive({
  variant,
  disabled,
  theme,
}: {
  variant: string
  disabled: boolean
  theme: string
}) {
  const isFilter = variant === "Filtro"
  const [value, setValue] = useState(isFilter ? "all" : "product")
  return (
    <div className={cn(theme, isFilter ? "w-full" : "w-full max-w-sm")}>
      <RootsFormSegmentField
        label={isFilter ? "Ver" : "Tipo"}
        layout={isFilter ? "inline" : "grid"}
        className={isFilter ? "[&>span:first-child]:sr-only" : undefined}
        groupClassName={isFilter ? "border-0" : undefined}
        value={value}
        onValueChange={setValue}
        disabled={disabled}
        options={
          isFilter
            ? [
                { value: "all", label: "Todos" },
                { value: "operativo", label: "Operativo" },
                { value: "fiscal", label: "Fiscal" },
              ]
            : [
                { value: "product", label: "Producto" },
                { value: "service", label: "Servicio" },
              ]
        }
      />
    </div>
  )
}

function SwitchFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormSwitchField"
      componentProperties={[
        { name: "label", values: ["string"] },
        { name: "checked", values: ["true", "false"] },
      ]}
      variants={[{ name: "Switch" }]}
      extras={[{ items: [{ name: "encendido" }, { name: "apagado" }, { name: "deshabilitado" }] }]}
      render={(_v, extras, context) => (
        <SwitchLive extras={extras} theme={atmosphereTheme(context.worldId)} />
      )}
    />
  )
}

function SwitchLive({ extras, theme }: { extras: readonly string[]; theme: string }) {
  const [checked, setChecked] = useState(extras[0] !== "apagado")
  return (
    <div className={theme}>
      <RootsFormSwitchField
        label="Activo"
        checked={checked}
        onCheckedChange={setChecked}
        disabled={extras[0] === "deshabilitado"}
      />
    </div>
  )
}

function DatesFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsFormDateField"
        componentProperties={[
          { name: "label", values: ["string"] },
          { name: "value", values: ["ISO date"] },
        ]}
        variants={[{ name: "Fecha" }]}
        extras={FIELD_STATES}
        render={(_v, extras, context) => <DateLive extras={extras} theme={atmosphereTheme(context.worldId)} />}
      />
      <LiveView
        background={BRUMA}
        componentName="RootsFormTimeField"
        componentProperties={[{ name: "label", values: ["string"] }, { name: "value", values: ["HH:mm"] }]}
        variants={[{ name: "Hora" }]}
        extras={IDLE_DISABLED}
        render={(_v, extras, context) => <TimeLive extras={extras} theme={atmosphereTheme(context.worldId)} />}
      />
      <LiveView
        background={BRUMA}
        componentName="DataWorkspacePeriodFilter"
        componentProperties={[
          { name: "variant", values: ["panel", "compact", "layout"] },
          { name: "preset", values: ["this_month", "custom", "…"] },
        ]}
        variants={[{ name: "panel" }, { name: "compact" }, { name: "layout" }]}
        render={(variant) => (
          <PeriodLive variant={variant as "panel" | "compact" | "layout"} />
        )}
      />
    </Stack>
  )
}

function DateLive({ extras, theme }: { extras: readonly string[]; theme: string }) {
  const [value, setValue] = useState("2026-08-26")
  return (
    <div className={theme}>
      <FieldShell>
        <RootsFormDateField
          label="Fecha"
          value={value}
          onChange={setValue}
          {...fieldAssist(extras[0] ?? "idle")}
        />
      </FieldShell>
    </div>
  )
}

function TimeLive({ extras, theme }: { extras: readonly string[]; theme: string }) {
  const [value, setValue] = useState("09:00")
  return (
    <div className={theme}>
      <FieldShell>
        <RootsFormTimeField
          label="Apertura"
          value={value}
          onChange={setValue}
          disabled={extras[0] === "deshabilitado"}
        />
      </FieldShell>
    </div>
  )
}

function PeriodLive({ variant }: { variant: "panel" | "compact" | "layout" }) {
  const [preset, setPreset] = useState<DataWorkspaceDatePreset>("this_month")
  const bounds = useMemo(
    () => computeDataWorkspaceDateBounds(preset, undefined),
    [preset],
  )
  return (
    <DataWorkspacePeriodFilter
      variant={variant}
      preset={preset}
      customRange={undefined}
      onPresetChange={setPreset}
      onCustomRangeChange={noop}
      bounds={bounds}
    />
  )
}

function ValidationFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsFormField"
      componentProperties={[
        { name: "error", values: ["ReactNode"] },
        { name: "warning", values: ["ReactNode"] },
        { name: "success", values: ["ReactNode"] },
        { name: "invalid", values: ["true", "false"] },
      ]}
      variants={[{ name: "error" }, { name: "warning" }, { name: "success" }, { name: "hint" }]}
      render={(variant, _e, context) => (
        <div className={atmosphereTheme(context.worldId)}>
          <FieldShell>
            <RootsFormTextField
              label="Campo"
              defaultValue="Valor"
              {...fieldAssist(variant)}
            />
          </FieldShell>
        </div>
      )}
    />
  )
}

/* —— Datos —— */

function TablesFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="WorkspaceTableHeader · WorkspaceTableBodyRow"
        componentProperties={[
          { name: "signal", values: ["undefined", "warning", "danger"] },
          { name: "inactive", values: ["true", "false"] },
        ]}
        variants={[
          { name: "idle" },
          { name: "warning" },
          { name: "danger" },
          { name: "inactive" },
        ]}
        extras={[{ items: [{ name: "con sort" }, { name: "sin sort" }] }]}
        render={(variant, extras) => (
          <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
            <Table>
              <WorkspaceTableHeader>
                <WorkspaceTableHeaderRow>
                  {extras[0] === "con sort" ? (
                    <WorkspaceTableSortHead label="Nombre" direction="asc" onSort={noop} />
                  ) : (
                    <WorkspaceTableHead tone="nature">Nombre</WorkspaceTableHead>
                  )}
                  <WorkspaceTableHead tone="nature" align="right">
                    Monto
                  </WorkspaceTableHead>
                </WorkspaceTableHeaderRow>
              </WorkspaceTableHeader>
              <TableBody>
                <WorkspaceTableBodyRow
                  index={0}
                  signal={
                    variant === "warning" || variant === "danger"
                      ? variant
                      : undefined
                  }
                  inactive={variant === "inactive"}
                >
                  <TableCell>Medialuna</TableCell>
                  <TableCell className="text-right">
                    <DataWorkspaceTableMoney muted={variant === "inactive"}>
                      $ 1.200
                    </DataWorkspaceTableMoney>
                  </TableCell>
                </WorkspaceTableBodyRow>
              </TableBody>
            </Table>
          </div>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="DataWorkspaceTableMoney"
        componentProperties={[{ name: "muted", values: ["true", "false"] }]}
        variants={[{ name: "default" }, { name: "muted" }]}
        render={(variant) => (
          <DataWorkspaceTableMoney muted={variant === "muted"}>
            $ 4.800
          </DataWorkspaceTableMoney>
        )}
      />
    </Stack>
  )
}

function CardsFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={SOMBRA}
        componentName="SaleCatalogProductCard"
        componentProperties={[
          { name: "variant", values: ["grid", "lista"] },
          { name: "disabled", values: ["true", "false"] },
        ]}
        variants={[{ name: "grid" }, { name: "lista" }]}
        extras={IDLE_DISABLED}
        render={(variant, extras) => (
          <div className={cn(variant === "lista" ? "max-w-lg" : "max-w-xs")}>
            <SaleCatalogProductCard
              product={SAMPLE_PRODUCT}
              variant={variant === "lista" ? "lista" : "grid"}
              disabled={extras[0] === "deshabilitado"}
              onClick={noop}
            />
          </div>
        )}
      />
      <LiveView
        background={SOMBRA}
        componentName="PurchaseCatalogProductCard"
        componentProperties={[{ name: "variant", values: ["grid", "lista"] }]}
        variants={[{ name: "grid" }, { name: "lista" }]}
        render={(variant) => (
          <div className={cn(variant === "lista" ? "max-w-lg" : "max-w-xs")}>
            <PurchaseCatalogProductCard
              product={SAMPLE_PURCHASE}
              variant={variant === "lista" ? "lista" : "grid"}
              onClick={noop}
            />
          </div>
        )}
      />
      <LiveView
        background={SOMBRA}
        componentName="ServiceOperateServiceCard"
        componentProperties={[
          { name: "variant", values: ["grid", "lista"] },
          { name: "selected", values: ["true", "false"] },
        ]}
        variants={[{ name: "grid" }, { name: "lista" }]}
        extras={[{ items: [{ name: "idle" }, { name: "seleccionado" }] }]}
        render={(variant, extras) => (
          <div className={cn(variant === "lista" ? "max-w-lg" : "max-w-xs")}>
            <ServiceOperateServiceCard
              service={{
                id: "demo",
                name: "Clase",
                price: 5000,
                billingLabel: "Mensual",
                categoryId: null,
                categoryName: "Servicios",
                searchText: "clase",
              }}
              variant={variant === "lista" ? "lista" : "grid"}
              selected={extras[0] === "seleccionado"}
              onClick={noop}
            />
          </div>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="CheckoutOptionCard"
        componentProperties={[
          { name: "tone", values: ["light", "dark"] },
          { name: "selected", values: ["true", "false"] },
        ]}
        variants={[{ name: "light" }, { name: "dark" }]}
        extras={[{ items: [{ name: "idle" }, { name: "seleccionado" }, { name: "deshabilitado" }] }]}
        render={(variant, extras) => (
          <div className={cn("max-w-sm rounded-xl p-3", variant === "dark" && "bg-[var(--rootsy-sombra-800)]")}>
            <CheckoutOptionCard
              title="Efectivo"
              subtitle="Al momento"
              icon={Receipt}
              tone={variant === "dark" ? "dark" : "light"}
              selected={extras[0] === "seleccionado"}
              disabled={extras[0] === "deshabilitado"}
              onClick={noop}
            />
          </div>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="HrPersonCard"
        componentProperties={[
          { name: "isOwner", values: ["true", "false"] },
          { name: "clockBusy", values: ["true", "false"] },
        ]}
        variants={[{ name: "Persona" }]}
        extras={[{ items: [{ name: "idle" }, { name: "fichando" }] }]}
        render={(_v, extras) => (
          <div className="max-w-sm">
            <HrPersonCard
              person={SAMPLE_PERSON}
              isOwner={false}
              canManagePeople={false}
              canManageInvites={false}
              clockBusy={extras[0] === "fichando"}
              detailHref="/handbook"
              onOpen={noop}
              onClock={noop}
              onInvite={noop}
              onLeave={noop}
            />
          </div>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="ReportHubCard"
        componentProperties={[
          { name: "selected", values: ["true", "false"] },
          { name: "planned", values: ["true", "false"] },
        ]}
        variants={[{ name: "link" }, { name: "selected" }, { name: "planned" }]}
        render={(variant) => (
          <div className="max-w-sm">
            {variant === "planned" ? (
              <ReportHubCard
                title="Ventas del día"
                description="Cobrado y tickets"
                icon={BarChart3}
                planned
              />
            ) : variant === "selected" ? (
              <ReportHubCard
                title="Ventas del día"
                description="Cobrado y tickets"
                icon={BarChart3}
                selected
                onSelect={noop}
              />
            ) : (
              <ReportHubCard
                title="Ventas del día"
                description="Cobrado y tickets"
                icon={BarChart3}
                href="#"
              />
            )}
          </div>
        )}
      />
    </Stack>
  )
}

function ListsFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsSortableActionList"
        componentProperties={[
          { name: "canReorder", values: ["true", "false"] },
          { name: "canEdit", values: ["true", "false"] },
          { name: "canDelete", values: ["true", "false"] },
        ]}
        variants={[{ name: "solo orden" }, { name: "con acciones" }]}
        render={(variant) => <SortableLive withActions={variant === "con acciones"} />}
      />
      <LiveView
        background={BRUMA}
        componentName="DataWorkspaceListFilterChip"
        componentProperties={[
          { name: "label", values: ["string"] },
          { name: "onRemove", values: ["() => void"] },
        ]}
        variants={[{ name: "Chip" }]}
        render={() => (
          <DataWorkspaceListFilterChip
            label="Categoría · Panadería"
            onRemove={noop}
            removeAriaLabel="Quitar filtro"
          />
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="DataWorkspaceListActiveFiltersBar"
        componentProperties={[
          { name: "activeCount", values: ["number"] },
          { name: "onClearAll", values: ["() => void"] },
        ]}
        variants={[{ name: "con chips" }, { name: "vacía" }]}
        render={(variant) => (
          <DataWorkspaceListActiveFiltersBar
            activeCount={variant === "vacía" ? 0 : 1}
            onClearAll={noop}
          >
            {variant === "vacía" ? null : (
              <DataWorkspaceListFilterChip
                label="Categoría · Panadería"
                onRemove={noop}
                removeAriaLabel="Quitar filtro"
              />
            )}
          </DataWorkspaceListActiveFiltersBar>
        )}
      />
    </Stack>
  )
}

function SortableLive({ withActions }: { withActions: boolean }) {
  const [items, setItems] = useState([
    { id: "1", label: "Panadería" },
    { id: "2", label: "Bebidas" },
  ])
  return (
    <RootsSortableActionList
      items={items}
      onReorder={setItems}
      canReorder
      canEdit={withActions}
      canDelete={withActions}
      canToggleVisibility={withActions}
      editingId={null}
      editingValue=""
      editSaveBusy={false}
      onStartEdit={noop}
      onCancelEdit={noop}
      onEditingValueChange={noop}
      onSaveEdit={noop}
      onDelete={noop}
      onToggleVisibility={noop}
    />
  )
}

function BadgesFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsNaturePill"
        componentProperties={[
          { name: "variant", values: ["savia", "bruma", "brumaMuted", "warning", "danger", "saviaSolid"] },
        ]}
        variants={[
          { name: "savia" },
          { name: "bruma" },
          { name: "brumaMuted" },
          { name: "warning" },
          { name: "danger" },
          { name: "saviaSolid" },
        ]}
        render={(variant) => (
          <RootsNaturePill
            variant={
              variant as
                | "savia"
                | "bruma"
                | "brumaMuted"
                | "warning"
                | "danger"
                | "saviaSolid"
            }
          >
            {variant === "savia" ? "Activo" : variant === "warning" ? "Pendiente" : variant === "danger" ? "Vencido" : "Tipo"}
          </RootsNaturePill>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="WorkspaceTableStatusBadge"
        componentProperties={[
          { name: "status", values: ["activo", "pendiente", "inactivo", "vencido", "info"] },
        ]}
        variants={[
          { name: "activo" },
          { name: "pendiente" },
          { name: "inactivo" },
          { name: "vencido" },
          { name: "info" },
        ]}
        render={(variant) => (
          <WorkspaceTableStatusBadge
            status={variant as "activo" | "pendiente" | "inactivo" | "vencido" | "info"}
          >
            {variant}
          </WorkspaceTableStatusBadge>
        )}
      />
    </Stack>
  )
}

function MetricsFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="ReportStatValue"
      componentProperties={[
        { name: "loading", values: ["true", "false"] },
        { name: "children", values: ["ReactNode"] },
      ]}
      variants={[{ name: "dato" }, { name: "loading" }]}
      render={(variant) => (
        <ReportStatValue loading={variant === "loading"}>$ 48.320</ReportStatValue>
      )}
    />
  )
}

const chartConfig = {
  total: { label: "Serie", color: "var(--rootsy-savia-500)" },
} satisfies ChartConfig

function ChartFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="ChartContainer"
      componentProperties={[
        { name: "config", values: ["ChartConfig"] },
        { name: "children", values: ["Recharts"] },
      ]}
      variants={[{ name: "Barras" }]}
      render={() => (
        <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
          <BarChart data={[{ x: "Lun", total: 4 }, { x: "Mar", total: 9 }, { x: "Mié", total: 6 }]}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="x" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={6} />
          </BarChart>
        </ChartContainer>
      )}
    />
  )
}

function StockFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="WorkspaceTableBodyRow · signal"
      componentProperties={[
        { name: "signal", values: ["undefined", "warning", "danger"] },
      ]}
      variants={[{ name: "ok" }, { name: "warning" }, { name: "danger" }]}
      render={(variant) => (
        <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
          <Table>
            <TableBody>
              <WorkspaceTableBodyRow
                index={0}
                signal={variant === "ok" ? undefined : (variant as "warning" | "danger")}
              >
                <TableCell>Medialuna</TableCell>
                <TableCell
                  className={cn(
                    "text-right font-numeric",
                    variant === "ok" && workspaceTableNatureStockOkClass,
                    variant === "warning" && workspaceTableNatureStockWarningClass,
                    variant === "danger" && workspaceTableNatureStockDangerClass,
                  )}
                >
                  {variant === "ok" ? "12" : variant === "warning" ? "3" : "0"}
                </TableCell>
              </WorkspaceTableBodyRow>
            </TableBody>
          </Table>
        </div>
      )}
    />
  )
}

/* —— Feedback —— */

function ToastsFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="showRootsyToast"
        componentProperties={[
          { name: "intent", values: ["success", "danger"] },
          { name: "title", values: ["string"] },
        ]}
        variants={[{ name: "success" }, { name: "danger" }]}
        render={(variant) => (
          <RootsPrimaryButton
            onClick={() =>
              showRootsyToast({
                title: variant === "danger" ? "No se pudo guardar" : "Guardado",
                intent: variant === "danger" ? "danger" : "success",
              })
            }
          >
            Disparar toast
          </RootsPrimaryButton>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="showRootsyMensajeToast"
        componentProperties={[
          { name: "title", values: ["string"] },
          { name: "message", values: ["string"] },
        ]}
        variants={[{ name: "Mensaje" }]}
        render={() => (
          <RootsPrimaryButton
            onClick={() =>
              showRootsyMensajeToast({
                title: "Caja abierta",
                message: "Mostrador · $ 48.320",
              })
            }
          >
            Disparar mensaje
          </RootsPrimaryButton>
        )}
      />
    </Stack>
  )
}

function BannerFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsBanner"
      componentProperties={[
        { name: "intent", values: ["neutral", "info", "success", "warning", "danger"] },
        { name: "variant", values: ["default", "strip"] },
        { name: "actionLabel", values: ["string"] },
        { name: "onDismiss", values: ["() => void"] },
        { name: "showIcon", values: ["true", "false"] },
      ]}
      variants={[
        { name: "info" },
        { name: "success" },
        { name: "warning" },
        { name: "danger" },
        { name: "neutral" },
      ]}
      extras={[
        { items: [{ name: "solo mensaje" }, { name: "con acción" }, { name: "cerrable" }] },
        { items: [{ name: "default" }, { name: "strip" }] },
      ]}
      render={(variant, extras) => (
        <RootsBanner
          intent={variant as "info" | "success" | "warning" | "danger" | "neutral"}
          title={variant === "neutral" ? "Aviso" : variant}
          message="El producto habla en contexto."
          variant={extras[1] === "strip" ? "strip" : "default"}
          actionLabel={extras[0] === "con acción" ? "Ver" : undefined}
          onAction={extras[0] === "con acción" ? noop : undefined}
          onDismiss={extras[0] === "cerrable" ? noop : undefined}
        />
      )}
    />
  )
}

function DialogFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsDialogContent"
        componentProperties={[
          { name: "title", values: ["string"] },
          { name: "description", values: ["string"] },
        ]}
        variants={[{ name: "Formulario" }]}
        extras={[{ items: [{ name: "idle" }, { name: "con error" }, { name: "cargando" }] }]}
        render={(_v, extras) => (
          <Dialog>
            <DialogTrigger asChild>
              <RootsPrimaryButton>Abrir diálogo</RootsPrimaryButton>
            </DialogTrigger>
            <RootsDialogContent>
              <RootsDialogHeader title="Nueva venta" description="Un dato, un campo." />
              {extras[0] === "cargando" ? (
                <RootsDialogLoadingState message="Cargando" />
              ) : (
                <>
                  <RootsDialogBody>
                    {extras[0] === "con error" ? (
                      <RootsDialogErrorBanner>No se pudo guardar.</RootsDialogErrorBanner>
                    ) : null}
                    <RootsFormTextField label="Producto" defaultValue="Medialuna" />
                  </RootsDialogBody>
                  <RootsDialogDualActionFooter
                    cancelLabel="Cancelar"
                    confirmLabel="Guardar"
                    onCancel={noop}
                    onConfirm={noop}
                  />
                </>
              )}
            </RootsDialogContent>
          </Dialog>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="RootsImageLightbox"
        componentProperties={[
          { name: "open", values: ["true", "false"] },
          { name: "src", values: ["string"] },
        ]}
        variants={[{ name: "Lightbox" }]}
        render={() => <LightboxLive />}
      />
    </Stack>
  )
}

function LightboxLive() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RootsDefaultButton onClick={() => setOpen(true)}>Abrir lightbox</RootsDefaultButton>
      <RootsImageLightbox
        open={open}
        onOpenChange={setOpen}
        src="/rootsy/rootsy-alerta-amable.png"
        title="Rootsy"
      />
    </>
  )
}

function ConfirmFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsConfirmDialog"
        componentProperties={[
          { name: "destructive", values: ["true", "false"] },
          { name: "busy", values: ["true", "false"] },
          { name: "error", values: ["ReactNode"] },
        ]}
        variants={[{ name: "default" }, { name: "destructive" }]}
        extras={[
          { items: [{ name: "idle" }, { name: "ocupado" }, { name: "con error" }] },
        ]}
        render={(variant, extras) => (
          <ConfirmLive
            destructive={variant === "destructive"}
            busy={extras[0] === "ocupado"}
            error={extras[0] === "con error"}
          />
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="RootsAlertDialogContent"
        componentProperties={[
          { name: "title", values: ["string"] },
          { name: "destructive", values: ["true", "false"] },
        ]}
        variants={[{ name: "Alert" }]}
        extras={[{ items: [{ name: "default" }, { name: "destructive" }] }]}
        render={(_v, extras) => <AlertLive destructive={extras[0] === "destructive"} />}
      />
    </Stack>
  )
}

function ConfirmLive({
  destructive,
  busy,
  error,
}: {
  destructive: boolean
  busy: boolean
  error: boolean
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RootsDangerButton onClick={() => setOpen(true)}>
        {destructive ? "Eliminar" : "Confirmar"}
      </RootsDangerButton>
      <RootsConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={destructive ? "¿Eliminar?" : "¿Confirmar?"}
        description="Este paso no se deshace."
        confirmLabel={destructive ? "Eliminar" : "Confirmar"}
        destructive={destructive}
        busy={busy}
        error={error ? "No se pudo completar." : null}
        onConfirm={() => {
          if (!busy) setOpen(false)
        }}
      />
    </>
  )
}

function AlertLive({ destructive }: { destructive: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RootsDefaultButton onClick={() => setOpen(true)}>Abrir alert</RootsDefaultButton>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel title="¿Salir sin guardar?" description="Se pierden los cambios." />
          <RootsAlertDialogFooter
            cancelLabel="Seguir"
            confirmLabel="Salir"
            destructive={destructive}
            onCancel={() => setOpen(false)}
            onConfirm={() => setOpen(false)}
          />
        </RootsAlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ErrorFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="RootsDialogErrorBanner"
      componentProperties={[{ name: "children", values: ["ReactNode"] }]}
      variants={[{ name: "Error" }]}
      render={() => <RootsDialogErrorBanner>No se pudo guardar.</RootsDialogErrorBanner>}
    />
  )
}

function LoadingFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsSpinner"
        componentProperties={[{ name: "className", values: ["string"] }]}
        variants={[{ name: "Spinner" }]}
        render={() => <RootsSpinner />}
      />
      <LiveView
        background={BRUMA}
        componentName="RootsDialogLoadingState"
        componentProperties={[{ name: "message", values: ["string"] }]}
        variants={[{ name: "Diálogo" }]}
        extras={[{ items: [{ name: "Cargando" }, { name: "Guardando" }] }]}
        render={(_v, extras) => (
          <div className="min-h-28">
            <RootsDialogLoadingState message={extras[0] ?? "Cargando"} />
          </div>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="WorkspaceTableSkeletonRows"
        componentProperties={[
          { name: "rowCount", values: ["number"] },
          { name: "columns", values: ["text | money | actions"] },
        ]}
        variants={[{ name: "3 filas" }, { name: "5 filas" }]}
        render={(variant) => (
          <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
            <Table>
              <TableBody>
                <WorkspaceTableSkeletonRows
                  rowCount={variant === "5 filas" ? 5 : 3}
                  columns={[
                    { kind: "text" },
                    { kind: "money" },
                    { kind: "actions", actionCount: 2 },
                  ]}
                />
              </TableBody>
            </Table>
          </div>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="RootsyThinkingHalo"
        componentProperties={[
          { name: "showDots", values: ["true", "false"] },
          { name: "label", values: ["string"] },
        ]}
        variants={[{ name: "con puntos" }, { name: "sin puntos" }]}
        render={(variant) => (
          <div className="relative h-24">
            <RootsyThinkingHalo label="Pensando" showDots={variant !== "sin puntos"} />
          </div>
        )}
      />
    </Stack>
  )
}

function EmptyFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={BRUMA}
        componentName="RootsyEmptyState"
        componentProperties={[
          { name: "world", values: ["bruma", "sombra", "eter", "…"] },
          { name: "title", values: ["string"] },
        ]}
        variants={[{ name: "bruma" }, { name: "sombra" }, { name: "éter" }]}
        render={(variant) => (
          <div className="mx-auto max-w-md">
            <RootsyEmptyState
              world={variant === "sombra" ? "sombra" : variant === "éter" ? "eter" : "bruma"}
              title="No hay artículos"
              description="Cuando cargues el primero, aparece acá."
            />
          </div>
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="DataWorkspaceDetailEmptyState"
        componentProperties={[
          { name: "title", values: ["string"] },
          { name: "icon", values: ["LucideIcon"] },
        ]}
        variants={[{ name: "Detalle" }]}
        render={() => (
          <DataWorkspaceDetailEmptyState
            icon={Package}
            title="Elegí un artículo"
            description="El detalle aparece a la derecha."
          />
        )}
      />
      <LiveView
        background={BRUMA}
        componentName="DataWorkspaceTableEmptyMascot"
        componentProperties={[]}
        variants={[{ name: "Mascota" }]}
        render={() => (
          <div className="relative flex h-40 items-end justify-end overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/empty-products-mascot.png"
              alt=""
              className="h-auto w-[min(200px,40vw)] object-contain object-right-bottom"
            />
          </div>
        )}
      />
      <LiveView
        background={SOMBRA}
        componentName="OperarTicketEmptyState"
        componentProperties={[{ name: "kind", values: ["order", "purchase", "service"] }]}
        variants={[{ name: "order" }, { name: "purchase" }, { name: "service" }]}
        render={(variant) => (
          <div className="h-64 overflow-hidden rounded-xl">
            <OperarTicketEmptyState kind={variant as "order" | "purchase" | "service"} />
          </div>
        )}
      />
      <LiveView
        background={SOMBRA}
        componentName="SaleCatalogEmptyMascot"
        componentProperties={[]}
        variants={[{ name: "Catálogo" }]}
        render={() => (
          <div className="h-64 overflow-hidden rounded-xl">
            <SaleCatalogEmptyMascot />
          </div>
        )}
      />
    </Stack>
  )
}

/* —— Overlays —— */

function PopoverFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="Popover"
      componentProperties={[
        { name: "children", values: ["trigger + content"] },
      ]}
      variants={[{ name: "Anclado" }]}
      render={() => (
        <Popover>
          <PopoverTrigger asChild>
            <RootsDefaultButton>Abrir popover</RootsDefaultButton>
          </PopoverTrigger>
          <PopoverContent>
            <p className="rootsy-text-body">Calendario, color, un control corto.</p>
          </PopoverContent>
        </Popover>
      )}
    />
  )
}

function DrawerFinalSpecimen() {
  return (
    <LiveView
      background={BRUMA}
      componentName="Sheet"
      componentProperties={[
        { name: "side", values: ["right", "left", "bottom"] },
      ]}
      variants={[{ name: "derecha" }, { name: "izquierda" }]}
      render={(variant) => (
        <Sheet>
          <SheetTrigger asChild>
            <RootsDefaultButton>Abrir sheet</RootsDefaultButton>
          </SheetTrigger>
          <SheetContent side={variant === "izquierda" ? "left" : "right"}>
            <SheetHeader>
              <SheetTitle>Panel</SheetTitle>
              <SheetDescription>Acompaña la vista, no la reemplaza.</SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      )}
    />
  )
}

function ToolboxFinalSpecimen() {
  return (
    <Stack>
      <LiveView
        background={SOMBRA}
        componentName="SaleOperationToolbox"
        componentProperties={[
          { name: "clienteLabel", values: ["string"] },
          { name: "comprobanteConfigurado", values: ["true", "false"] },
        ]}
        variants={[{ name: "Venta" }]}
        extras={[{ items: [{ name: "configurado" }, { name: "vacío" }] }]}
        render={(_v, extras) => {
          const ready = extras[0] !== "vacío"
          return (
            <SaleOperationToolbox
              clienteLabel={ready ? "María González" : "Cliente"}
              clienteIvaLabel={null}
              comprobanteLabel={ready ? "Ticket" : "Comprobante"}
              comprobanteConfigurado={ready}
              pagoLabel={ready ? "Efectivo" : "Pago"}
              pagoConfigurado={ready}
              descuentoLabel={ready ? "10%" : "Sin descuento"}
              hayDescuento={ready}
              onClienteClick={noop}
              onComprobanteClick={noop}
              onPagoClick={noop}
              onDescuentoClick={noop}
            />
          )
        }}
      />
      <LiveView
        background={SOMBRA}
        componentName="PurchaseOperationToolbox"
        componentProperties={[
          { name: "proveedorLabel", values: ["string"] },
        ]}
        variants={[{ name: "Compra" }]}
        extras={[{ items: [{ name: "configurado" }, { name: "vacío" }] }]}
        render={(_v, extras) => {
          const ready = extras[0] !== "vacío"
          return (
            <PurchaseOperationToolbox
              proveedorLabel={ready ? "Molino" : "Proveedor"}
              proveedorIvaLabel={null}
              comprobanteLabel={ready ? "Remito" : "Comprobante"}
              comprobanteConfigurado={ready}
              pagoLabel={ready ? "Cuenta" : "Pago"}
              pagoConfigurado={ready}
              descuentoLabel="Sin descuento"
              hayDescuento={false}
              onProveedorClick={noop}
              onComprobanteClick={noop}
              onPagoClick={noop}
              onDescuentoClick={noop}
            />
          )
        }}
      />
      <LiveView
        background={SOMBRA}
        componentName="OperarMobileToolboxIcons"
        componentProperties={[
          { name: "configured", values: ["true", "false"] },
        ]}
        variants={[{ name: "Mobile" }]}
        extras={[{ items: [{ name: "mixto" }, { name: "todo listo" }] }]}
        render={(_v, extras) => <MobileToolboxLive allReady={extras[0] === "todo listo"} />}
      />
    </Stack>
  )
}

function MobileToolboxRegister({ items }: { items: OperarMobileToolboxItem[] }) {
  useRegisterOperarMobileToolbox(items)
  return null
}

function MobileToolboxLive({ allReady }: { allReady: boolean }) {
  const items: OperarMobileToolboxItem[] = [
    { id: "a", icon: Users, configured: true, ariaLabel: "Cliente", onClick: noop },
    { id: "b", icon: Receipt, configured: allReady, ariaLabel: "Pago", onClick: noop },
  ]
  return (
    <div className="rounded-xl p-3">
      <OperarMobileToolboxProvider>
        <MobileToolboxRegister items={items} />
        <OperarMobileToolboxIcons />
      </OperarMobileToolboxProvider>
    </div>
  )
}

export const HANDBOOK_FINAL_SECTION_SPECIMENS: Record<string, () => ReactNode> = {
  sidebar: () => <SidebarFinalSpecimen />,
  paginacion: () => <PaginationFinalSpecimen />,
  "header-pieces": () => <HeaderPiecesFinalSpecimen />,
  botones: () => <ButtonsFinalSpecimen />,
  "botones-de-icono": () => <IconButtonsFinalSpecimen />,
  "menus-de-acciones": () => <DropdownFinalSpecimen />,
  tooltips: () => <TooltipFinalSpecimen />,
  inputs: () => <TextFieldsFinalSpecimen />,
  selects: () => <SelectsFinalSpecimen />,
  checkboxes: () => <CheckboxesFinalSpecimen />,
  radios: () => <RadiosFinalSpecimen />,
  switches: () => <SwitchFinalSpecimen />,
  "date-pickers": () => <DatesFinalSpecimen />,
  validacion: () => <ValidationFinalSpecimen />,
  tablas: () => <TablesFinalSpecimen />,
  cards: () => <CardsFinalSpecimen />,
  listas: () => <ListsFinalSpecimen />,
  badges: () => <BadgesFinalSpecimen />,
  metricas: () => <MetricsFinalSpecimen />,
  graficos: () => <ChartFinalSpecimen />,
  "estados-de-stock": () => <StockFinalSpecimen />,
  toasts: () => <ToastsFinalSpecimen />,
  alertas: () => <BannerFinalSpecimen />,
  banners: () => <BannerFinalSpecimen />,
  modals: () => <DialogFinalSpecimen />,
  confirmaciones: () => <ConfirmFinalSpecimen />,
  errores: () => <ErrorFinalSpecimen />,
  "estados-de-carga": () => <LoadingFinalSpecimen />,
  "empty-states": () => <EmptyFinalSpecimen />,
  dropdowns: () => <DropdownFinalSpecimen />,
  popovers: () => <PopoverFinalSpecimen />,
  drawers: () => <DrawerFinalSpecimen />,
  dialogs: () => <DialogFinalSpecimen />,
  toolboxes: () => <ToolboxFinalSpecimen />,
}
