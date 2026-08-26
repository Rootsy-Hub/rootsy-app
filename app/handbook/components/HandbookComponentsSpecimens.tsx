"use client"

import { MenuSectionNavigator } from "@/app/[siteId]/[popId]/menu/MenuSectionNavigator"
import { HrPersonCard } from "@/app/[siteId]/[popId]/hr/HrPersonCard"
import type { EmployeeRow } from "@/app/[siteId]/[popId]/hr/hrTypes"
import { SaleCatalogSidebarNav } from "@/components/sale-operation/SaleCatalogSidebarNav"
import { SaleCatalogProductCard } from "@/components/sale-operation/SaleCatalogProductCard"
import { SaleCatalogEmptyMascot } from "@/components/sale-operation/SaleCatalogEmptyMascot"
import { SaleOperationToolbox } from "@/components/sale-operation/SaleOperationToolbox"
import type { SaleCatalogProduct } from "@/components/sale-operation/saleCatalogProduct"
import { PurchaseCatalogProductCard } from "@/components/purchase-operation/PurchaseCatalogProductCard"
import { PurchaseOperationToolbox } from "@/components/purchase-operation/PurchaseOperationToolbox"
import type { PurchaseCatalogProduct } from "@/components/purchase-operation/purchaseCatalogTypes"
import { ServiceOperateServiceCard } from "@/components/service-operation/ServiceOperateServiceCard"
import { ServiceOperateStepToolbox } from "@/components/service-operation/ServiceOperateStepToolbox"
import { SERVICE_OPERATE_STEP_LIST } from "@/components/service-operation/serviceOperateStepMeta"
import { CheckoutOptionCard } from "@/components/checkout/CheckoutOptionCard"
import { ReportHubCard } from "@/components/reports/ReportHubCard"
import { ReportStatValue } from "@/components/reports/ReportStatValue"
import {
  DataWorkspaceTableMoney,
  DataWorkspaceTableIconAction,
  WorkspaceTableStatusBadge,
} from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import {
  workspaceTableNatureStockDangerClass,
  workspaceTableNatureStockOkClass,
  workspaceTableNatureStockWarningClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { DataWorkspaceListFilterChip } from "@/components/data-workspace/DataWorkspaceListFilterChip"
import { DataWorkspaceListActiveFiltersBar } from "@/components/data-workspace/DataWorkspaceListActiveFiltersBar"
import { DataWorkspaceListPaginationFooter } from "@/components/data-workspace/DataWorkspaceListPaginationFooter"
import { DataWorkspacePeriodFilter } from "@/components/data-workspace/DataWorkspacePeriodFilter"
import { DataWorkspaceDetailEmptyState } from "@/components/data-workspace/DataWorkspaceDetailEmptyState"
import { WorkspaceTableSkeletonRows } from "@/components/data-workspace/WorkspaceTableSkeleton"
import { WorkspaceTableSortHead } from "@/components/data-workspace/WorkspaceTableSortHead"
import {
  WorkspaceTableBodyRow,
  WorkspaceTableHead,
  WorkspaceTableHeader,
  WorkspaceTableHeaderRow,
} from "@/components/data-workspace/WorkspaceTableHeader"
import { DataWorkspaceSectionMenu } from "@/components/layouts/DataWorkspaceSectionMenu"
import { DataWorkspaceSidebar } from "@/components/layouts/DataWorkspaceSidebar"
import { MenuSidebar } from "@/components/MenuSidebar"
import { HANDBOOK_DESIGN_SYSTEM_BACK_HREF } from "@/app/handbook/handbookDesignSystem"
import { HandbookDesignSystemNav } from "@/app/handbook/HandbookDesignSystemNav"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { DataWorkspaceHeaderMoreMenu } from "@/components/layouts/DataWorkspaceHeaderMoreMenu"
import { DataWorkspaceHeaderUserMenu } from "@/components/layouts/DataWorkspaceHeaderUserMenu"
import { ModuleWorkspaceHeader } from "@/components/layouts-module/ModuleWorkspaceHeader"
import { OperarTicketEmptyState } from "@/components/layouts-module/OperarTicketEmptyState"
import {
  OperarMobileToolboxIcons,
  OperarMobileToolboxProvider,
  useRegisterOperarMobileToolbox,
  type OperarMobileToolboxItem,
} from "@/components/layouts-module/OperarMobileToolbox"
import { StatisticsSectionNav } from "@/components/statistics/StatisticsSectionNav"
import { PopSettingsSectionNav } from "@/components/settings/PopSettingsSectionNav"
import { EterIconButton } from "@/components/eter/EterIconButton"
import { RootsBanner } from "@/components/rootsy-banner"
import {
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  computeDataWorkspaceDateBounds,
  type DataWorkspaceDatePreset,
} from "@/lib/dataWorkspaceDateFilter"
import { POP_SETTINGS_SECTIONS } from "@/lib/popSettingsCatalog"
import { STATISTICS_SECTIONS } from "@/lib/statisticsCatalog"
import type { SaleCatalogViewPersisted } from "@/lib/saleCatalogPreference"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  MoreHorizontal,
  Package,
  Pencil,
  Plus,
  Receipt,
  Trash2,
  Users,
} from "lucide-react"
import { useMemo, useState, type ComponentType } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { HandbookAbsentNote } from "./HandbookComponentsPrimitives"

const noop = () => undefined

const SAMPLE_PRODUCT: SaleCatalogProduct = {
  id: "demo",
  nombre: "Artículo",
  descripcion: "Descripción",
  precio: 1200,
  categoria: "Categoría",
  imagen: "",
}

const SAMPLE_PURCHASE: PurchaseCatalogProduct = {
  id: "demo",
  nombre: "Artículo",
  descripcion: "Descripción",
  iva: 21,
  categoria: "Categoría",
  categoriaFiltro: "item:1",
  imagen: "",
  unitOfMeasure: "un",
  costs: [],
}

const SAMPLE_PERSON: EmployeeRow = {
  id: "demo",
  userId: "u1",
  firstName: "Nombre",
  lastName: "Apellido",
  jobTitle: "Rol",
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

function Field({ children }: { children: React.ReactNode }) {
  return <div className="max-w-sm">{children}</div>
}

function MobileToolboxRegister({ items }: { items: OperarMobileToolboxItem[] }) {
  useRegisterOperarMobileToolbox(items)
  return null
}

export function AbsentSpecimen({ note }: { note: string }) {
  return <HandbookAbsentNote>{note}</HandbookAbsentNote>
}

function ModuleWorkspaceHeaderSpecimen() {
  return (
    <div className="overflow-hidden rounded-xl">
      <ModuleWorkspaceHeader
        title="Módulo"
        popName="POP"
        userName="Persona"
        hasResolvedRole
        showFullscreen={false}
        headerVariant="dark"
      />
    </div>
  )
}

function HeaderIconButtonSpecimen() {
  return (
    <div className="flex flex-wrap gap-3">
      <DataWorkspaceHeaderIconButton label="Acción" headerVariant="default">
        <Plus />
      </DataWorkspaceHeaderIconButton>
      <div className="rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
        <DataWorkspaceHeaderIconButton label="Acción" headerVariant="dark">
          <Plus />
        </DataWorkspaceHeaderIconButton>
      </div>
    </div>
  )
}

function HeaderUserMenuSpecimen() {
  return (
    <div className="rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <DataWorkspaceHeaderUserMenu
        userName="Persona"
        isOnline
        headerVariant="dark"
        roleLabel="Rol"
      />
    </div>
  )
}

function HeaderMoreMenuSpecimen() {
  return (
    <div className="rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <DataWorkspaceHeaderMoreMenu
        headerVariant="dark"
        presentation="icons"
        actions={[{ label: "Acción", icon: Pencil, onClick: noop }]}
      />
    </div>
  )
}

function AvatarSpecimen() {
  return (
    <Avatar>
      <AvatarFallback>PE</AvatarFallback>
    </Avatar>
  )
}

function MenuSidebarSpecimen() {
  const [activePageId, setActivePageId] = useState("navegacion-final")
  return (
    <div className="h-80 overflow-hidden rounded-xl">
      <MenuSidebar
        collapseBelowLg={false}
        backHref={HANDBOOK_DESIGN_SYSTEM_BACK_HREF}
        backLabel="Volver"
        eyebrow="Sistema de diseño"
      >
        <HandbookDesignSystemNav
          activePageId={activePageId}
          onSelectPage={setActivePageId}
        />
      </MenuSidebar>
    </div>
  )
}

function SidebarSpecimen() {
  const [activeId, setActiveId] = useState("a")
  return (
    <div className="h-56 overflow-hidden rounded-xl">
      <DataWorkspaceSidebar
        activeId={activeId}
        onSelect={setActiveId}
        viewItems={[
          { id: "a", label: "Vista A", icon: Package },
          { id: "b", label: "Vista B", icon: Users },
        ]}
      />
    </div>
  )
}

function SaleCatalogSidebarNavSpecimen() {
  const [vista, setVista] = useState<SaleCatalogViewPersisted>({
    modo: "categoria",
    categoria: "A",
  })
  return (
    <div className="h-56 overflow-auto rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <SaleCatalogSidebarNav
        categories={[
          { id: "1", name: "A", sortOrder: 0 },
          { id: "2", name: "B", sortOrder: 1 },
        ]}
        vistaCatalogo={vista}
        onVistaChange={setVista}
      />
    </div>
  )
}

function SectionMenuSpecimen() {
  const [activeId, setActiveId] = useState("a")
  return (
    <div className="rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <DataWorkspaceSectionMenu
        headerVariant="dark"
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

function StatisticsNavSpecimen() {
  return (
    <div className="overflow-x-auto rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <StatisticsSectionNav
        sections={STATISTICS_SECTIONS.slice(0, 4)}
        activeSectionId="sales"
        getSectionHref={() => "#"}
      />
    </div>
  )
}

function PopSettingsNavSpecimen() {
  const [id, setId] = useState(POP_SETTINGS_SECTIONS[0]!.id)
  return (
    <div className="overflow-x-auto rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <PopSettingsSectionNav
        sections={POP_SETTINGS_SECTIONS}
        activeSectionId={id}
        onSectionSelect={setId}
      />
    </div>
  )
}

function MenuSectionNavigatorSpecimen() {
  const [index, setIndex] = useState(0)
  return (
    <MenuSectionNavigator
      sections={[
        { key: "a", title: "A" },
        { key: "b", title: "B" },
        { key: "c", title: "C" },
      ]}
      selectedIndex={index}
      onSelect={setIndex}
    />
  )
}

function TabsSpecimen() {
  return (
    <Tabs defaultValue="a">
      <TabsList>
        <TabsTrigger value="a">Uno</TabsTrigger>
        <TabsTrigger value="b">Dos</TabsTrigger>
      </TabsList>
      <TabsContent value="a" className="pt-3 text-sm">
        Panel
      </TabsContent>
    </Tabs>
  )
}

function PaginationSpecimen() {
  return (
    <DataWorkspaceListPaginationFooter
      listFetching={false}
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
      pageSizeLabelId="handbook-page-size"
    />
  )
}

function RootsButtonsSpecimen() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <RootsPrimaryButton>Primary</RootsPrimaryButton>
      <RootsDefaultButton>Default</RootsDefaultButton>
      <RootsSubtleButton>Subtle</RootsSubtleButton>
      <RootsDangerButton>Danger</RootsDangerButton>
      <RootsDangerSubtleButton>Danger subtle</RootsDangerSubtleButton>
      <RootsLinkButton>Link</RootsLinkButton>
      <RootsProgressButton loading>Progress</RootsProgressButton>
    </div>
  )
}

function UiButtonSpecimen() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  )
}

function RootsIconButtonSpecimen() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <RootsIconButton label="Agregar">
        <Plus />
      </RootsIconButton>
      <RootsIconButton label="Editar" intent="edit">
        <Pencil />
      </RootsIconButton>
      <RootsIconButton label="Eliminar" intent="destructive">
        <Trash2 />
      </RootsIconButton>
    </div>
  )
}

function EterIconButtonSpecimen() {
  return (
    <div className="flex flex-wrap gap-2 rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <EterIconButton label="Acción" intent="subtle">
        <Plus />
      </EterIconButton>
      <EterIconButton label="Acción" intent="primary">
        <Plus />
      </EterIconButton>
      <EterIconButton label="Acción" intent="danger">
        <Trash2 />
      </EterIconButton>
    </div>
  )
}

function TableIconActionSpecimen() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <DataWorkspaceTableIconAction label="Ver" icon={Package} variant="neutral" onClick={noop} />
      <DataWorkspaceTableIconAction label="Editar" icon={Pencil} variant="edit" onClick={noop} />
      <DataWorkspaceTableIconAction
        label="Eliminar"
        icon={Trash2}
        variant="destructive"
        onClick={noop}
      />
    </div>
  )
}

function RootsDropdownSpecimen() {
  return (
    <RootsDropdownMenu>
      <RootsDropdownTrigger asChild>
        <RootsIconButton label="Menú">
          <MoreHorizontal />
        </RootsIconButton>
      </RootsDropdownTrigger>
      <RootsDropdownContent>
        <RootsDropdownItem>Ítem</RootsDropdownItem>
        <RootsDropdownSeparator />
        <RootsDropdownItem variant="destructive">Destructivo</RootsDropdownItem>
      </RootsDropdownContent>
    </RootsDropdownMenu>
  )
}

function UiDropdownSpecimen() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menú</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Ítem</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function TooltipSpecimen() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <RootsIconButton label="Acción">
          <Pencil />
        </RootsIconButton>
      </TooltipTrigger>
      <TooltipContent>Nombre</TooltipContent>
    </Tooltip>
  )
}

function TextFieldSpecimen() {
  const [value, setValue] = useState("Valor")
  return (
    <Field>
      <RootsFormTextField label="Campo" value={value} onChange={(e) => setValue(e.target.value)} />
    </Field>
  )
}

function TextareaFieldSpecimen() {
  return (
    <Field>
      <RootsFormTextareaField label="Campo" defaultValue="Valor" />
    </Field>
  )
}

function SearchFieldSpecimen() {
  const [value, setValue] = useState("")
  return (
    <Field>
      <RootsFormSearchField
        label="Buscar"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </Field>
  )
}

function MoneyFieldSpecimen() {
  const [value, setValue] = useState("1200")
  return (
    <Field>
      <RootsFormMoneyField label="Monto" value={value} onChange={setValue} />
    </Field>
  )
}

function QuantityFieldSpecimen() {
  const [value, setValue] = useState("2")
  return (
    <Field>
      <RootsFormQuantityField label="Cantidad" value={value} onChange={setValue} />
    </Field>
  )
}

function IntegerFieldSpecimen() {
  const [value, setValue] = useState("4")
  return (
    <Field>
      <RootsFormIntegerField label="Número" value={value} onChange={setValue} />
    </Field>
  )
}

function PhoneFieldSpecimen() {
  return (
    <Field>
      <RootsFormPhoneField label="Teléfono" defaultValue="1111111111" />
    </Field>
  )
}

function TaxFieldSpecimen() {
  const [value, setValue] = useState("20111111112")
  return (
    <Field>
      <RootsFormTaxDocumentField label="CUIT" value={value} onChange={setValue} />
    </Field>
  )
}

function DiscountFieldSpecimen() {
  const [mode, setMode] = useState<"porcentaje" | "fijo">("porcentaje")
  const [value, setValue] = useState("10")
  return (
    <Field>
      <RootsFormDiscountField
        label="Descuento"
        mode={mode}
        onModeChange={setMode}
        value={value}
        onChange={setValue}
      />
    </Field>
  )
}

function ImageFieldSpecimen() {
  return (
    <Field>
      <RootsFormImageUploadField label="Imagen" onFileSelect={noop} />
    </Field>
  )
}

function UiInputSpecimen() {
  return <Input defaultValue="Valor" className="max-w-sm" />
}

function UiTextareaSpecimen() {
  return <Textarea defaultValue="Valor" className="max-w-sm" />
}

function UiLabelSpecimen() {
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Label htmlFor="handbook-label">Label</Label>
      <Input id="handbook-label" defaultValue="Valor" />
    </div>
  )
}

function SelectFieldSpecimen() {
  const [value, setValue] = useState("a")
  return (
    <Field>
      <RootsFormSelectField label="Lista" value={value} onValueChange={setValue}>
        <RootsFormSelectItem value="a">Opción A</RootsFormSelectItem>
        <RootsFormSelectItem value="b">Opción B</RootsFormSelectItem>
      </RootsFormSelectField>
    </Field>
  )
}

function UiSelectSpecimen() {
  return (
    <Select defaultValue="a">
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="a">Opción A</SelectItem>
        <SelectItem value="b">Opción B</SelectItem>
      </SelectContent>
    </Select>
  )
}

function CheckboxFieldSpecimen() {
  const [checked, setChecked] = useState(true)
  return (
    <RootsFormCheckboxField label="Opción" checked={checked} onCheckedChange={setChecked} />
  )
}

function CheckboxRowSpecimen() {
  const [checked, setChecked] = useState(false)
  return (
    <RootsFormCheckboxChoiceRow label="Opción" checked={checked} onCheckedChange={setChecked} />
  )
}

function UiCheckboxSpecimen() {
  return <Checkbox defaultChecked />
}

const SEGMENT_FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "operativo", label: "Operativo" },
  { value: "fiscal", label: "Fiscal" },
  { value: "gestion", label: "Gestión" },
  { value: "control", label: "Control" },
  { value: "config", label: "Configuración" },
] as const

function SegmentSpecimen() {
  const [value, setValue] = useState("all")
  return (
    <RootsFormSegmentField
      label="Ver reportes"
      aria-label="Filtrar reportes"
      layout="inline"
      className="[&>span:first-child]:sr-only"
      groupClassName="border-0"
      value={value}
      onValueChange={setValue}
      options={SEGMENT_FILTER_OPTIONS}
    />
  )
}

function SwitchSpecimen() {
  const [checked, setChecked] = useState(true)
  return (
    <RootsFormSwitchField label="Estado" checked={checked} onCheckedChange={setChecked} />
  )
}

function DateFieldSpecimen() {
  const [value, setValue] = useState("2026-08-26")
  return (
    <Field>
      <RootsFormDateField label="Fecha" value={value} onChange={setValue} />
    </Field>
  )
}

function TimeFieldSpecimen() {
  const [value, setValue] = useState("09:00")
  return (
    <Field>
      <RootsFormTimeField label="Hora" value={value} onChange={setValue} />
    </Field>
  )
}

function PeriodFilterSpecimen() {
  const [preset, setPreset] = useState<DataWorkspaceDatePreset>("this_month")
  const bounds = useMemo(
    () => computeDataWorkspaceDateBounds(preset, undefined),
    [preset],
  )
  return (
    <DataWorkspacePeriodFilter
      preset={preset}
      customRange={undefined}
      onPresetChange={setPreset}
      onCustomRangeChange={noop}
      bounds={bounds}
    />
  )
}

function UiDatePickerSpecimen() {
  const [value, setValue] = useState("2026-08-26")
  return <DatePicker value={value} onChange={setValue} light />
}

function FieldStatesSpecimen() {
  return (
    <div className="grid max-w-xl gap-4 sm:grid-cols-3">
      <RootsFormTextField label="Error" defaultValue="—" error="Mensaje" invalid />
      <RootsFormTextField label="Warning" defaultValue="—" warning="Mensaje" />
      <RootsFormTextField label="Success" defaultValue="—" success="Mensaje" />
    </div>
  )
}

function TablePrimitiveSpecimen() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
      <Table>
        <WorkspaceTableHeader>
          <WorkspaceTableHeaderRow>
            <WorkspaceTableHead>Columna</WorkspaceTableHead>
          </WorkspaceTableHeaderRow>
        </WorkspaceTableHeader>
        <TableBody>
          <WorkspaceTableBodyRow index={0}>
            <TableCell>Fila</TableCell>
          </WorkspaceTableBodyRow>
        </TableBody>
      </Table>
    </div>
  )
}

function TableHeaderSpecimen() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
      <Table>
        <WorkspaceTableHeader>
          <WorkspaceTableHeaderRow>
            <WorkspaceTableHead tone="nature">Columna</WorkspaceTableHead>
            <WorkspaceTableHead tone="nature" align="right">
              Monto
            </WorkspaceTableHead>
          </WorkspaceTableHeaderRow>
        </WorkspaceTableHeader>
      </Table>
    </div>
  )
}

function TableRowSpecimen() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
      <Table>
        <TableBody>
          <WorkspaceTableBodyRow index={0}>
            <TableCell>Idle</TableCell>
          </WorkspaceTableBodyRow>
          <WorkspaceTableBodyRow index={1} signal="warning">
            <TableCell>Warning</TableCell>
          </WorkspaceTableBodyRow>
          <WorkspaceTableBodyRow index={2} signal="danger">
            <TableCell>Danger</TableCell>
          </WorkspaceTableBodyRow>
        </TableBody>
      </Table>
    </div>
  )
}

function SortHeadSpecimen() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
      <Table>
        <WorkspaceTableHeader>
          <WorkspaceTableHeaderRow>
            <WorkspaceTableSortHead label="Columna" direction="asc" onSort={noop} />
          </WorkspaceTableHeaderRow>
        </WorkspaceTableHeader>
      </Table>
    </div>
  )
}

function TableMoneySpecimen() {
  return (
    <div className="flex gap-6">
      <DataWorkspaceTableMoney>$ 1.200</DataWorkspaceTableMoney>
      <DataWorkspaceTableMoney muted>$ 0</DataWorkspaceTableMoney>
    </div>
  )
}

function SaleCardSpecimen() {
  return (
    <div className="max-w-xs">
      <SaleCatalogProductCard product={SAMPLE_PRODUCT} variant="grid" onClick={noop} />
    </div>
  )
}

function PurchaseCardSpecimen() {
  return (
    <div className="max-w-xs">
      <PurchaseCatalogProductCard product={SAMPLE_PURCHASE} variant="grid" onClick={noop} />
    </div>
  )
}

function ServiceCardSpecimen() {
  return (
    <div className="max-w-xs">
      <ServiceOperateServiceCard
        service={{
          id: "demo",
          name: "Servicio",
          price: 5000,
          billingLabel: "Mensual",
          categoryId: null,
          categoryName: "Categoría",
          searchText: "servicio",
        }}
        variant="grid"
        onClick={noop}
      />
    </div>
  )
}

function CheckoutCardSpecimen() {
  return (
    <div className="max-w-sm">
      <CheckoutOptionCard title="Opción" subtitle="Meta" selected icon={Receipt} onClick={noop} />
    </div>
  )
}

function HrCardSpecimen() {
  return (
    <div className="max-w-sm">
      <HrPersonCard
        person={SAMPLE_PERSON}
        isOwner={false}
        canManagePeople={false}
        canManageInvites={false}
        clockBusy={false}
        detailHref="/handbook"
        onOpen={noop}
        onClock={noop}
        onInvite={noop}
        onLeave={noop}
      />
    </div>
  )
}

function HubCardSpecimen() {
  return (
    <div className="max-w-sm">
      <ReportHubCard
        title="Informe"
        description="Descripción"
        icon={BarChart3}
        onSelect={noop}
      />
    </div>
  )
}

function SortableListSpecimen() {
  const [items, setItems] = useState([
    { id: "1", label: "Ítem A" },
    { id: "2", label: "Ítem B" },
  ])
  return (
    <RootsSortableActionList
      items={items}
      onReorder={setItems}
      canReorder
      canEdit={false}
      canDelete={false}
      canToggleVisibility={false}
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

function FilterChipSpecimen() {
  return (
    <DataWorkspaceListFilterChip
      label="Filtro"
      onRemove={noop}
      removeAriaLabel="Quitar filtro"
    />
  )
}

function FiltersBarSpecimen() {
  return (
    <DataWorkspaceListActiveFiltersBar activeCount={1} onClearAll={noop}>
      <DataWorkspaceListFilterChip
        label="Filtro"
        onRemove={noop}
        removeAriaLabel="Quitar filtro"
      />
    </DataWorkspaceListActiveFiltersBar>
  )
}

function NaturePillSpecimen() {
  return (
    <div className="flex flex-wrap gap-2">
      <RootsNaturePill variant="savia">Savia</RootsNaturePill>
      <RootsNaturePill variant="bruma">Bruma</RootsNaturePill>
      <RootsNaturePill variant="warning">Aviso</RootsNaturePill>
      <RootsNaturePill variant="danger">Peligro</RootsNaturePill>
    </div>
  )
}

function StatusBadgeSpecimen() {
  return (
    <div className="flex flex-wrap gap-2">
      <WorkspaceTableStatusBadge status="activo">Activo</WorkspaceTableStatusBadge>
      <WorkspaceTableStatusBadge status="pendiente">Pendiente</WorkspaceTableStatusBadge>
      <WorkspaceTableStatusBadge status="inactivo">Inactivo</WorkspaceTableStatusBadge>
      <WorkspaceTableStatusBadge status="info">Info</WorkspaceTableStatusBadge>
    </div>
  )
}

function UiBadgeSpecimen() {
  return <Badge>Badge</Badge>
}

function StatValueSpecimen() {
  return (
    <div className="flex gap-8">
      <ReportStatValue>$ 0</ReportStatValue>
      <ReportStatValue loading>$ 0</ReportStatValue>
    </div>
  )
}

const chartConfig = {
  total: { label: "Serie", color: "var(--rootsy-savia-500)" },
} satisfies ChartConfig

function ChartSpecimen() {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-40 w-full">
      <BarChart
        data={[
          { x: "A", total: 4 },
          { x: "B", total: 9 },
          { x: "C", total: 6 },
        ]}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="x" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="total" fill="var(--color-total)" radius={6} />
      </BarChart>
    </ChartContainer>
  )
}

function StockSignalSpecimen() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
      <Table>
        <TableBody>
          <WorkspaceTableBodyRow index={0}>
            <TableCell className={cn("text-right font-numeric", workspaceTableNatureStockOkClass)}>
              12
            </TableCell>
          </WorkspaceTableBodyRow>
          <WorkspaceTableBodyRow index={1} signal="warning">
            <TableCell
              className={cn("text-right font-numeric", workspaceTableNatureStockWarningClass)}
            >
              3
            </TableCell>
          </WorkspaceTableBodyRow>
          <WorkspaceTableBodyRow index={2} signal="danger">
            <TableCell
              className={cn("text-right font-numeric", workspaceTableNatureStockDangerClass)}
            >
              0
            </TableCell>
          </WorkspaceTableBodyRow>
        </TableBody>
      </Table>
    </div>
  )
}

function ToastSpecimen() {
  return (
    <RootsPrimaryButton
      onClick={() => showRootsyToast({ title: "Listo", intent: "success" })}
    >
      Disparar toast
    </RootsPrimaryButton>
  )
}

function MensajeToastSpecimen() {
  return (
    <RootsPrimaryButton
      onClick={() => showRootsyMensajeToast({ title: "Aviso", message: "Mensaje" })}
    >
      Disparar mensaje
    </RootsPrimaryButton>
  )
}

function BannerSpecimen() {
  return (
    <div className="space-y-2">
      <RootsBanner intent="info" title="Info" message="Mensaje" />
      <RootsBanner intent="success" title="Success" message="Mensaje" />
      <RootsBanner intent="warning" title="Warning" message="Mensaje" />
      <RootsBanner intent="danger" title="Danger" message="Mensaje" />
    </div>
  )
}

function DialogContentSpecimen() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <RootsPrimaryButton>Abrir diálogo</RootsPrimaryButton>
      </DialogTrigger>
      <RootsDialogContent>
        <RootsDialogHeader title="Tarea" description="Cuerpo." />
        <RootsDialogBody>
          <RootsFormTextField label="Campo" defaultValue="Valor" />
        </RootsDialogBody>
        <RootsDialogDualActionFooter
          cancelLabel="Cancelar"
          confirmLabel="Confirmar"
          onCancel={noop}
          onConfirm={noop}
        />
      </RootsDialogContent>
    </Dialog>
  )
}

function UiDialogSpecimen() {
  return <DialogContentSpecimen />
}

function LightboxSpecimen() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RootsDefaultButton onClick={() => setOpen(true)}>Abrir lightbox</RootsDefaultButton>
      <RootsImageLightbox
        open={open}
        onOpenChange={setOpen}
        src="/rootsy/rootsy-alerta-amable.png"
        title="Imagen"
      />
    </>
  )
}

function ConfirmDialogSpecimen() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RootsDangerButton onClick={() => setOpen(true)}>Confirmar</RootsDangerButton>
      <RootsConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Confirmar?"
        description="Paso irreversible."
        confirmLabel="Confirmar"
        destructive
        onConfirm={() => setOpen(false)}
      />
    </>
  )
}

function AlertDialogRootsSpecimen() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <RootsDefaultButton onClick={() => setOpen(true)}>Abrir alert</RootsDefaultButton>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <RootsAlertDialogContent>
          <RootsAlertDialogPanel title="¿Confirmar?" description="Paso irreversible." />
          <RootsAlertDialogFooter
            cancelLabel="Cancelar"
            confirmLabel="Confirmar"
            destructive
            onCancel={() => setOpen(false)}
            onConfirm={() => setOpen(false)}
          />
        </RootsAlertDialogContent>
      </AlertDialog>
    </>
  )
}

function UiAlertDialogSpecimen() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">AlertDialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Confirmar?</AlertDialogTitle>
          <AlertDialogDescription>Paso irreversible.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>Confirmar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ErrorBannerSpecimen() {
  return <RootsDialogErrorBanner>No se pudo guardar.</RootsDialogErrorBanner>
}

function SpinnerSpecimen() {
  return <RootsSpinner />
}

function DialogLoadingSpecimen() {
  return (
    <div className="min-h-28">
      <RootsDialogLoadingState message="Cargando" />
    </div>
  )
}

function TableSkeletonSpecimen() {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
      <Table>
        <TableBody>
          <WorkspaceTableSkeletonRows
            rowCount={3}
            columns={[
              { kind: "text" },
              { kind: "money" },
              { kind: "actions", actionCount: 2 },
            ]}
          />
        </TableBody>
      </Table>
    </div>
  )
}

function ThinkingHaloSpecimen() {
  return (
    <div className="relative h-24">
      <RootsyThinkingHalo label="Pensando" />
    </div>
  )
}

function UiSpinnerSpecimen() {
  return <Spinner />
}

function RootsyEmptySpecimen() {
  return (
    <div className="mx-auto max-w-md">
      <RootsyEmptyState world="bruma" title="Vacío" description="No hay ítems." />
    </div>
  )
}

function DetailEmptySpecimen() {
  return (
    <DataWorkspaceDetailEmptyState
      icon={Package}
      title="Vacío"
      description="No hay ítems."
    />
  )
}

function TableEmptyMascotSpecimen() {
  return (
    <div className="relative flex h-40 items-end justify-end overflow-hidden rounded-xl bg-[var(--rootsy-bruma-50)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/empty-products-mascot.png"
        alt=""
        className="h-auto w-[min(200px,40vw)] object-contain object-right-bottom"
      />
    </div>
  )
}

function TicketEmptySpecimen() {
  return (
    <div className="h-64 overflow-hidden rounded-xl border border-[var(--color-borde)]">
      <OperarTicketEmptyState kind="order" />
    </div>
  )
}

function CatalogEmptySpecimen() {
  return (
    <div className="h-64 overflow-hidden rounded-xl border border-[var(--color-borde)]">
      <SaleCatalogEmptyMascot />
    </div>
  )
}

function PopoverSpecimen() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <RootsDefaultButton>Popover</RootsDefaultButton>
      </PopoverTrigger>
      <PopoverContent>
        <p className="rootsy-text-body">Contenido anclado.</p>
      </PopoverContent>
    </Popover>
  )
}

function SheetSpecimen() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <RootsDefaultButton>Sheet</RootsDefaultButton>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Panel</SheetTitle>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  )
}

function SaleToolboxSpecimen() {
  return (
    <SaleOperationToolbox
      clienteLabel="Cliente"
      clienteIvaLabel={null}
      comprobanteLabel="Ticket"
      comprobanteConfigurado
      pagoLabel="Pago"
      pagoConfigurado
      descuentoLabel="Sin descuento"
      hayDescuento={false}
      onClienteClick={noop}
      onComprobanteClick={noop}
      onPagoClick={noop}
      onDescuentoClick={noop}
    />
  )
}

function PurchaseToolboxSpecimen() {
  return (
    <PurchaseOperationToolbox
      proveedorLabel="Proveedor"
      proveedorIvaLabel={null}
      comprobanteLabel="Remito"
      comprobanteConfigurado
      pagoLabel="Pago"
      pagoConfigurado
      descuentoLabel="Sin descuento"
      hayDescuento={false}
      onProveedorClick={noop}
      onComprobanteClick={noop}
      onPagoClick={noop}
      onDescuentoClick={noop}
    />
  )
}

function ServiceToolboxSpecimen() {
  return (
    <ServiceOperateStepToolbox
      activeStep={1}
      onStepChange={noop}
      slots={SERVICE_OPERATE_STEP_LIST.map((meta) => ({
        step: meta.step,
        value: meta.label,
        configured: meta.step === 1,
      }))}
      descuentoLabel="Sin descuento"
      hayDescuento={false}
      onDescuentoClick={noop}
    />
  )
}

function MobileToolboxSpecimen() {
  const items: OperarMobileToolboxItem[] = [
    { id: "a", icon: Users, configured: true, ariaLabel: "A", onClick: noop },
    { id: "b", icon: Receipt, configured: false, ariaLabel: "B", onClick: noop },
  ]
  return (
    <div className="rounded-xl bg-[var(--rootsy-sombra-800)] p-3">
      <OperarMobileToolboxProvider>
        <MobileToolboxRegister items={items} />
        <OperarMobileToolboxIcons />
      </OperarMobileToolboxProvider>
    </div>
  )
}

export const CATALOG_SPECIMEN_BY_ID: Record<string, ComponentType> = {
  "module-workspace-header": ModuleWorkspaceHeaderSpecimen,
  "header-icon-button": HeaderIconButtonSpecimen,
  "header-user-menu": HeaderUserMenuSpecimen,
  "header-more-menu": HeaderMoreMenuSpecimen,
  "ui-avatar": AvatarSpecimen,
  "menu-sidebar": MenuSidebarSpecimen,
  "data-workspace-sidebar": SidebarSpecimen,
  "sale-catalog-sidebar-nav": SaleCatalogSidebarNavSpecimen,
  "section-menu": SectionMenuSpecimen,
  "statistics-section-nav": StatisticsNavSpecimen,
  "pop-settings-section-nav": PopSettingsNavSpecimen,
  "menu-section-navigator": MenuSectionNavigatorSpecimen,
  "ui-tabs": TabsSpecimen,
  "list-pagination-footer": PaginationSpecimen,
  "roots-buttons": RootsButtonsSpecimen,
  "ui-button": UiButtonSpecimen,
  "roots-icon-button": RootsIconButtonSpecimen,
  "eter-icon-button": EterIconButtonSpecimen,
  "table-icon-action": TableIconActionSpecimen,
  "roots-dropdown-menu": RootsDropdownSpecimen,
  "ui-dropdown-menu": UiDropdownSpecimen,
  "ui-tooltip": TooltipSpecimen,
  "form-text": TextFieldSpecimen,
  "form-textarea": TextareaFieldSpecimen,
  "form-search": SearchFieldSpecimen,
  "form-money": MoneyFieldSpecimen,
  "form-quantity": QuantityFieldSpecimen,
  "form-integer": IntegerFieldSpecimen,
  "form-phone": PhoneFieldSpecimen,
  "form-tax": TaxFieldSpecimen,
  "form-discount": DiscountFieldSpecimen,
  "form-image": ImageFieldSpecimen,
  "ui-input": UiInputSpecimen,
  "ui-textarea": UiTextareaSpecimen,
  "ui-label": UiLabelSpecimen,
  "form-select": SelectFieldSpecimen,
  "ui-select": UiSelectSpecimen,
  "form-checkbox": CheckboxFieldSpecimen,
  "form-checkbox-row": CheckboxRowSpecimen,
  "ui-checkbox": UiCheckboxSpecimen,
  "form-segment": SegmentSpecimen,
  "form-switch": SwitchSpecimen,
  "form-date": DateFieldSpecimen,
  "form-time": TimeFieldSpecimen,
  "period-filter": PeriodFilterSpecimen,
  "ui-date-picker": UiDatePickerSpecimen,
  "form-field-states": FieldStatesSpecimen,
  "ui-table": TablePrimitiveSpecimen,
  "workspace-table-header": TableHeaderSpecimen,
  "workspace-table-row": TableRowSpecimen,
  "workspace-table-sort": SortHeadSpecimen,
  "table-money": TableMoneySpecimen,
  "sale-product-card": SaleCardSpecimen,
  "purchase-product-card": PurchaseCardSpecimen,
  "service-card": ServiceCardSpecimen,
  "checkout-option-card": CheckoutCardSpecimen,
  "hr-person-card": HrCardSpecimen,
  "report-hub-card": HubCardSpecimen,
  "sortable-list": SortableListSpecimen,
  "filter-chip": FilterChipSpecimen,
  "active-filters-bar": FiltersBarSpecimen,
  "nature-pill": NaturePillSpecimen,
  "table-status-badge": StatusBadgeSpecimen,
  "ui-badge": UiBadgeSpecimen,
  "report-stat-value": StatValueSpecimen,
  "chart-container": ChartSpecimen,
  "stock-row-signal": StockSignalSpecimen,
  "show-rootsy-toast": ToastSpecimen,
  "show-mensaje-toast": MensajeToastSpecimen,
  "roots-banner": BannerSpecimen,
  "roots-dialog-content": DialogContentSpecimen,
  "ui-dialog": UiDialogSpecimen,
  "image-lightbox": LightboxSpecimen,
  "roots-confirm-dialog": ConfirmDialogSpecimen,
  "roots-alert-dialog": AlertDialogRootsSpecimen,
  "ui-alert-dialog": UiAlertDialogSpecimen,
  "dialog-error-banner": ErrorBannerSpecimen,
  "roots-spinner": SpinnerSpecimen,
  "dialog-loading": DialogLoadingSpecimen,
  "table-skeleton": TableSkeletonSpecimen,
  "thinking-halo": ThinkingHaloSpecimen,
  "ui-spinner": UiSpinnerSpecimen,
  "rootsy-empty": RootsyEmptySpecimen,
  "detail-empty": DetailEmptySpecimen,
  "table-empty-mascot": TableEmptyMascotSpecimen,
  "ticket-empty": TicketEmptySpecimen,
  "catalog-empty": CatalogEmptySpecimen,
  "ui-popover": PopoverSpecimen,
  "ui-sheet": SheetSpecimen,
  "sale-toolbox": SaleToolboxSpecimen,
  "purchase-toolbox": PurchaseToolboxSpecimen,
  "service-toolbox": ServiceToolboxSpecimen,
  "mobile-toolbox": MobileToolboxSpecimen,
}
