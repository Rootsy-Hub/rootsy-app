"use client"

import {
  deleteMesasFloorDecor,
  deleteMesasSalon,
  deleteMesasTable,
  getMesasLayout,
  upsertMesasFloorDecor,
  upsertMesasSalon,
  upsertMesasTable,
  type MesasFloorDecorRow,
  type MesasLayoutData,
  type MesasSalonRow,
  type MesasTableRow,
  type UpsertMesasFloorDecorInput,
  type UpsertMesasSalonInput,
  type UpsertMesasTableInput,
} from "@/app/[siteId]/[popId]/mesas/actions"
import type {
  MesaFloorDecorKind,
  MesaSalon,
  MesaTableShape,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { MESAS_FLOOR_PLAN_BG, MesaFloorDecorPreview } from "@/app/[siteId]/[popId]/mesas/components/MesaFloorDecorNode"
import { MesaTableShapeView } from "@/app/[siteId]/[popId]/mesas/components/MesaTableShapeView"
import {
  clientDialogBodyClass,
  clientDialogHeaderClass,
  clientDialogSurface,
} from "@/app/[siteId]/[popId]/clients/ClientUpsertFormFields"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { DataWorkspaceHeaderIconButton } from "@/components/layouts/DataWorkspaceHeaderIconButton"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  mesaShapeLabel,
  mesaShapeSizeOptions,
  mesaSizeDisplayLabel,
  mesaTableDimensions,
} from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import {
  LayoutGrid,
  Loader2,
  MapPin,
  Pencil,
  Shapes,
  Trash2,
  type LucideIcon,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const mesasDialogSurfaceClass = cn(
  clientDialogSurface,
  "flex w-full flex-col sm:max-w-xl max-h-[min(90vh,720px)]",
)
const mesasDialogSurfaceWideClass = cn(
  clientDialogSurface,
  "flex w-full flex-col sm:max-w-2xl max-h-[min(90vh,780px)]",
)
const mesasFormCardClass =
  "space-y-4 rounded-xl border border-border/70 bg-muted/15 p-4"
const mesasDialogListShellClass =
  "min-h-[12rem] max-h-[min(38vh,340px)] overflow-y-auto rounded-xl border border-border/70 bg-card"

function MesasDialogScrollBody({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className={cn(clientDialogBodyClass, "space-y-4")}>{children}</div>
    </div>
  )
}

function MesasDialogRowActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  disabled,
}: {
  editLabel: string
  deleteLabel: string
  onEdit: () => void
  onDelete: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <DataWorkspaceTableIconAction
        label={editLabel}
        icon={Pencil}
        variant="edit"
        disabled={disabled}
        onClick={onEdit}
      />
      <DataWorkspaceTableIconAction
        label={deleteLabel}
        icon={Trash2}
        variant="destructive"
        disabled={disabled}
        onClick={onDelete}
      />
    </div>
  )
}

function tableRowToForm(row: MesasTableRow): UpsertMesasTableInput {
  return {
    id: row.id,
    salonId: row.salonId,
    label: row.label,
    shape: row.shape,
    x: row.x,
    y: row.y,
    seats: row.seats,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  }
}

function decorRowToForm(row: MesasFloorDecorRow): UpsertMesasFloorDecorInput {
  return {
    id: row.id,
    salonId: row.salonId,
    kind: row.kind,
    x: row.x,
    y: row.y,
    width: row.width,
    height: row.height,
    label: row.label,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
  }
}
function MesasHeaderTooltipButton({
  label,
  icon: Icon,
  onClick,
}: {
  label: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <DataWorkspaceHeaderIconButton
          label={label}
          headerVariant="dark"
          onClick={onClick}
        >
          <Icon className="size-5" aria-hidden />
        </DataWorkspaceHeaderIconButton>
      </TooltipTrigger>
      <TooltipContent variant="dark" side="bottom" sideOffset={6}>
        {label}
      </TooltipContent>
    </Tooltip>
  )
}

function MesasDialogShellHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 space-y-1">
        <DialogTitle className="text-base font-semibold tracking-tight">
          {title}
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed">
          {description}
        </DialogDescription>
      </div>
    </div>
  )
}

function MesasDialogError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="mb-4 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  )
}

function MesasFormCard({
  title,
  children,
  footer,
}: {
  title: string
  children: ReactNode
  footer: ReactNode
}) {
  return (
    <section className={mesasFormCardClass}>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {children}
      <DialogFooter className="gap-2 px-0 pb-0 pt-1 sm:justify-start">
        {footer}
      </DialogFooter>
    </section>
  )
}

function MesasTableFormPreview({
  label,
  shape,
  seats,
}: {
  label: string
  shape: MesaTableShape
  seats: number
}) {
  const { width, height } = mesaTableDimensions(shape)
  const displayLabel = label.trim() || "—"

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Vista previa
      </p>
      <div
        className="relative flex min-h-[168px] items-center justify-center overflow-hidden rounded-xl border border-border/70"
        style={{ backgroundColor: MESAS_FLOOR_PLAN_BG }}
        aria-hidden
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <MesaTableShapeView
          label={displayLabel}
          shape={shape}
          status="free"
          seats={Math.max(1, seats)}
          selected={false}
        />
      </div>
      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        {mesaShapeLabel(shape)}
        <span className="mx-1.5 text-border">·</span>
        {width}×{height} px
      </p>
    </div>
  )
}

function MesasSalonFilterBar({
  label,
  value,
  onValueChange,
  salons,
  showAll = false,
  totalCount,
  filteredCount,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  salons: MesaSalon[]
  showAll?: boolean
  totalCount: number
  filteredCount: number
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/10 px-3 py-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        <Select value={value || "all"} onValueChange={onValueChange}>
          <SelectTrigger className="h-9 max-w-xs bg-background">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            {showAll ? <SelectItem value="all">Todos</SelectItem> : null}
            {salons.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs tabular-nums text-muted-foreground">
        {filteredCount} de {totalCount}
      </p>
    </div>
  )
}

function mapActiveLayoutSalons(rows: MesasSalonRow[]): MesaSalon[] {
  return rows
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
    .map((s) => ({
      id: s.id,
      name: s.name,
      sortOrder: s.sortOrder,
      isActive: s.isActive,
    }))
}

function resolveFormSalonId(
  filterSalonId: string,
  fallbackSalonId: string,
): string {
  if (filterSalonId && filterSalonId !== "all") return filterSalonId
  return fallbackSalonId
}

function applyLayoutSalons(data: MesasLayoutData): MesaSalon[] {
  return mapActiveLayoutSalons(data.salons)
}

const decorKindOptions: { value: MesaFloorDecorKind; label: string }[] = [
  { value: "entrance", label: "Ingreso / puerta" },
  { value: "bar", label: "Barra / mostrador" },
  { value: "wall_h", label: "Pared horizontal" },
  { value: "wall_v", label: "Pared vertical" },
  { value: "pillar", label: "Columna" },
  { value: "plant", label: "Planta" },
  { value: "planter", label: "Macetero" },
]

const shapeOptions: { value: MesaTableShape["kind"]; label: string }[] = [
  { value: "round", label: "Redonda" },
  { value: "square", label: "Cuadrada" },
  { value: "rect", label: "Rectangular" },
]

function defaultDecorSize(kind: MesaFloorDecorKind): {
  width: number
  height: number
} {
  switch (kind) {
    case "wall_h":
      return { width: 160, height: 8 }
    case "wall_v":
      return { width: 10, height: 160 }
    case "bar":
      return { width: 120, height: 44 }
    case "entrance":
      return { width: 120, height: 36 }
    case "pillar":
      return { width: 28, height: 28 }
    case "planter":
      return { width: 56, height: 56 }
    default:
      return { width: 40, height: 40 }
  }
}

function decorKindLabel(kind: MesaFloorDecorKind): string {
  return decorKindOptions.find((o) => o.value === kind)?.label ?? kind
}

function defaultSalonForm(sortOrder: number): UpsertMesasSalonInput {
  return { name: "", sortOrder, isActive: true }
}

function defaultTableForm(
  salonId: string,
  sortOrder: number,
): UpsertMesasTableInput {
  return {
    salonId,
    label: "",
    shape: { kind: "round", size: "m" },
    x: 64,
    y: 64,
    seats: 4,
    sortOrder,
    isActive: true,
  }
}

function defaultDecorForm(
  salonId: string,
  sortOrder: number,
): UpsertMesasFloorDecorInput {
  const kind: MesaFloorDecorKind = "entrance"
  const size = defaultDecorSize(kind)
  return {
    salonId,
    kind,
    x: 64,
    y: 64,
    width: size.width,
    height: size.height,
    label: "",
    sortOrder,
    isActive: true,
  }
}

type Props = {
  popId: string
  siteId: string
  salons: MesaSalon[]
  canUpdate: boolean
  onLayoutChanged: () => Promise<void>
  getLayoutData?: () => MesasLayoutData | null
}

export function MesasLayoutAdminButtons({
  popId,
  siteId,
  salons,
  canUpdate,
  onLayoutChanged,
  getLayoutData,
}: Props) {
  const [salonsOpen, setSalonsOpen] = useState(false)
  const [tablesOpen, setTablesOpen] = useState(false)
  const [decorsOpen, setDecorsOpen] = useState(false)

  if (!canUpdate) return null

  return (
    <>
      <MesasHeaderTooltipButton
        label="Salones"
        icon={MapPin}
        onClick={() => setSalonsOpen(true)}
      />
      <MesasHeaderTooltipButton
        label="Mesas"
        icon={LayoutGrid}
        onClick={() => setTablesOpen(true)}
      />
      <MesasHeaderTooltipButton
        label="Elementos del plano"
        icon={Shapes}
        onClick={() => setDecorsOpen(true)}
      />

      <MesasSalonsDialog
        open={salonsOpen}
        onOpenChange={setSalonsOpen}
        popId={popId}
        siteId={siteId}
        onLayoutChanged={onLayoutChanged}
      />
      <MesasTablesDialog
        open={tablesOpen}
        onOpenChange={setTablesOpen}
        popId={popId}
        siteId={siteId}
        salons={salons}
        getLayoutData={getLayoutData}
        onLayoutChanged={onLayoutChanged}
      />
      <MesasDecorsDialog
        open={decorsOpen}
        onOpenChange={setDecorsOpen}
        popId={popId}
        siteId={siteId}
        salons={salons}
        getLayoutData={getLayoutData}
        onLayoutChanged={onLayoutChanged}
      />
    </>
  )
}

function MesasSalonsDialog({
  open,
  onOpenChange,
  popId,
  siteId,
  onLayoutChanged,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  siteId: string
  onLayoutChanged: () => Promise<void>
}) {
  const [rows, setRows] = useState<MesasSalonRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<UpsertMesasSalonInput>(defaultSalonForm(0))
  const [saving, setSaving] = useState(false)

  const loadRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getMesasLayout(popId, siteId)
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setRows(res.data.salons)
    setForm(defaultSalonForm(res.data.salons.length))
  }, [popId, siteId])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  useEffect(() => {
    if (!open) {
      setError(null)
      setForm(defaultSalonForm(0))
      return
    }
    void loadRows()
  }, [open, loadRows])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await upsertMesasSalon(popId, siteId, form)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setForm(defaultSalonForm(rows.length + (form.id ? 0 : 1)))
    await loadRows()
    await onLayoutChanged()
  }

  const handleDelete = async (salon: MesasSalonRow) => {
    if (!window.confirm(`¿Eliminar el salón "${salon.name}"?`)) return
    setSaving(true)
    setError(null)
    const res = await deleteMesasSalon(popId, siteId, salon.id)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    if (form.id === salon.id) setForm(defaultSalonForm(rows.length - 1))
    await loadRows()
    await onLayoutChanged()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-rootsy-light-shell="true"
        showCloseButton={!saving}
        className={mesasDialogSurfaceClass}
      >
        <DialogHeader className={cn(clientDialogHeaderClass, "shrink-0")}>
          <MesasDialogShellHeader
            icon={MapPin}
            title="Salones"
            description="Sectores del local que aparecen como pestañas en el plano."
          />
        </DialogHeader>

        <MesasDialogScrollBody>
          <MesasDialogError message={error} />

          <section className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Salones existentes</p>
            <div className={mesasDialogListShellClass}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Nombre</TableHead>
                    <TableHead className="w-16">Ord.</TableHead>
                    <TableHead className="w-20">Estado</TableHead>
                    <TableHead className="w-24 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Cargando salones…
                        </span>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-8 text-center text-sm text-muted-foreground"
                      >
                        Todavía no hay salones. Creá el primero abajo.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.name}</TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {row.sortOrder}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                              row.isActive
                                ? "bg-emerald-500/10 text-emerald-700"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {row.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </TableCell>
                        <TableCell className="px-1 py-1.5 text-right">
                          <MesasDialogRowActions
                            editLabel={`Editar salón ${row.name}`}
                            deleteLabel={`Eliminar salón ${row.name}`}
                            disabled={saving}
                            onEdit={() =>
                              setForm({
                                id: row.id,
                                name: row.name,
                                sortOrder: row.sortOrder,
                                isActive: row.isActive,
                              })
                            }
                            onDelete={() => void handleDelete(row)}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <MesasFormCard
            title={form.id ? "Editar salón" : "Nuevo salón"}
            footer={
              <>
                {form.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={saving}
                    onClick={() => setForm(defaultSalonForm(rows.length))}
                  >
                    Cancelar edición
                  </Button>
                ) : null}
                <Button
                  type="button"
                  disabled={saving || !form.name.trim()}
                  className="gap-2"
                  onClick={() => void handleSave()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                      Guardando…
                    </>
                  ) : form.id ? (
                    "Guardar cambios"
                  ) : (
                    "Agregar salón"
                  )}
                </Button>
              </>
            }
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="mesas-salon-name">Nombre</Label>
                <Input
                  id="mesas-salon-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Interior, Patio, Frente…"
                  className="bg-background"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mesas-salon-order">Orden</Label>
                <Input
                  id="mesas-salon-order"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: Number.parseInt(e.target.value, 10) || 0,
                    }))
                  }
                  className="bg-background"
                />
              </div>
              <label className="flex items-center gap-2 pt-7 text-sm">
                <Checkbox
                  checked={form.isActive}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, isActive: checked === true }))
                  }
                />
                Activo
              </label>
            </div>
          </MesasFormCard>
        </MesasDialogScrollBody>
      </DialogContent>
    </Dialog>
  )
}

function MesasTablesDialog({
  open,
  onOpenChange,
  popId,
  siteId,
  salons,
  getLayoutData,
  onLayoutChanged,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  siteId: string
  salons: MesaSalon[]
  getLayoutData?: () => MesasLayoutData | null
  onLayoutChanged: () => Promise<void>
}) {
  const [rows, setRows] = useState<MesasTableRow[]>([])
  const [dialogSalons, setDialogSalons] = useState<MesaSalon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterSalonId, setFilterSalonId] = useState("all")
  const [form, setForm] = useState<UpsertMesasTableInput>(
    defaultTableForm("", 0),
  )
  const [saving, setSaving] = useState(false)

  const salonOptions = dialogSalons.length > 0 ? dialogSalons : salons

  const filteredRows = useMemo(() => {
    if (!filterSalonId || filterSalonId === "all") return rows
    return rows.filter((r) => r.salonId === filterSalonId)
  }, [rows, filterSalonId])

  const applyLayout = useCallback((data: MesasLayoutData) => {
    const activeSalons = applyLayoutSalons(data)
    const defaultSalonId = activeSalons[0]?.id ?? ""
    setDialogSalons(activeSalons)
    setRows(data.tables)
    setFilterSalonId("all")
    setForm((prev) =>
      prev.id ? prev : defaultTableForm(defaultSalonId, data.tables.length),
    )
  }, [])

  const loadRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getMesasLayout(popId, siteId)
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    applyLayout(res.data)
  }, [applyLayout, popId, siteId])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  useEffect(() => {
    if (!open) {
      setError(null)
      setFilterSalonId("all")
      setForm(defaultTableForm("", 0))
      return
    }

    setFilterSalonId("all")
    const snapshot = getLayoutData?.()
    if (snapshot) {
      applyLayout(snapshot)
      setLoading(false)
      setError(null)
    }
    void loadRows()
  }, [open, applyLayout, getLayoutData, loadRows])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await upsertMesasTable(popId, siteId, form)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setForm(defaultTableForm(form.salonId, rows.length + (form.id ? 0 : 1)))
    await loadRows()
    await onLayoutChanged()
  }

  const handleDelete = async (table: MesasTableRow) => {
    if (!window.confirm(`¿Eliminar la mesa "${table.label}"?`)) return
    setSaving(true)
    const res = await deleteMesasTable(popId, siteId, table.id)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    if (form.id === table.id) {
      setForm(
        defaultTableForm(
          resolveFormSalonId(filterSalonId, form.salonId || salonOptions[0]?.id || ""),
          rows.length - 1,
        ),
      )
    }
    await loadRows()
    await onLayoutChanged()
  }

  const shapeSizeOptions = useMemo(
    () => mesaShapeSizeOptions(form.shape.kind),
    [form.shape.kind],
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-rootsy-light-shell="true"
        showCloseButton={!saving}
        className={mesasDialogSurfaceWideClass}
      >
        <DialogHeader className={cn(clientDialogHeaderClass, "shrink-0")}>
          <MesasDialogShellHeader
            icon={LayoutGrid}
            title="Mesas"
            description="Número, forma y capacidad. La posición en el plano se ajusta con el lápiz de edición."
          />
        </DialogHeader>

        <MesasDialogScrollBody>
          <MesasDialogError message={error} />

          {salonOptions.length === 0 && !loading && rows.length === 0 ? (
            <p className="rounded-xl border border-border/70 bg-muted/15 px-4 py-6 text-sm leading-relaxed text-muted-foreground">
              Creá al menos un salón antes de agregar mesas.
            </p>
          ) : (
            <>
              <section className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">
                    Mesas existentes
                  </p>
                </div>
                <MesasSalonFilterBar
                  label="Filtrar salón"
                  value={filterSalonId}
                  onValueChange={setFilterSalonId}
                  salons={salonOptions}
                  showAll
                  totalCount={rows.length}
                  filteredCount={filteredRows.length}
                />
                <div className={mesasDialogListShellClass}>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Mesa</TableHead>
                        <TableHead>Salón</TableHead>
                        <TableHead>Forma</TableHead>
                        <TableHead className="w-16">As.</TableHead>
                        <TableHead className="w-24 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && rows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-sm text-muted-foreground"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="size-4 animate-spin" aria-hidden />
                              Cargando mesas…
                            </span>
                          </TableCell>
                        </TableRow>
                      ) : filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-8 text-center text-sm text-muted-foreground"
                          >
                            {rows.length === 0
                              ? "Todavía no hay mesas. Creá la primera abajo."
                              : "No hay mesas en este salón."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell className="font-medium">{row.label}</TableCell>
                            <TableCell>
                              {salonOptions.find((s) => s.id === row.salonId)?.name ??
                                "—"}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {row.shape.kind} / {mesaSizeDisplayLabel(row.shape.size)}
                            </TableCell>
                            <TableCell className="text-xs tabular-nums">
                              {row.seats}
                            </TableCell>
                            <TableCell className="px-1 py-1.5 text-right">
                              <MesasDialogRowActions
                                editLabel={`Editar mesa ${row.label}`}
                                deleteLabel={`Eliminar mesa ${row.label}`}
                                disabled={saving}
                                onEdit={() => setForm(tableRowToForm(row))}
                                onDelete={() => void handleDelete(row)}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>

              {salonOptions.length > 0 ? (
              <MesasFormCard
                title={form.id ? "Editar mesa" : "Nueva mesa"}
                footer={
                  <>
                    {form.id ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={saving}
                        onClick={() =>
                          setForm(
                            defaultTableForm(
                              resolveFormSalonId(
                                filterSalonId,
                                form.salonId || salonOptions[0]?.id || "",
                              ),
                              rows.length,
                            ),
                          )
                        }
                      >
                        Cancelar edición
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      disabled={saving || !form.salonId || !form.label.trim()}
                      className="gap-2"
                      onClick={() => void handleSave()}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Guardando…
                        </>
                      ) : form.id ? (
                        "Guardar cambios"
                      ) : (
                        "Agregar mesa"
                      )}
                    </Button>
                  </>
                }
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-start">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Salón</Label>
                    <Select
                      value={form.salonId}
                      onValueChange={(salonId) =>
                        setForm((f) => ({ ...f, salonId }))
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Elegir salón" />
                      </SelectTrigger>
                      <SelectContent>
                        {salonOptions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mesas-table-label">Número / nombre</Label>
                    <Input
                      id="mesas-table-label"
                      value={form.label}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, label: e.target.value }))
                      }
                      placeholder="6, P1, F2…"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Forma</Label>
                    <Select
                      value={form.shape.kind}
                      onValueChange={(kind) =>
                        setForm((f) => ({
                          ...f,
                          shape: {
                            kind: kind as MesaTableShape["kind"],
                            size:
                              kind === "round"
                                ? "m"
                                : kind === "square"
                                  ? "m"
                                  : "m",
                          } as MesaTableShape,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shapeOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tamaño</Label>
                    <Select
                      value={form.shape.size}
                      onValueChange={(size) =>
                        setForm((f) => ({
                          ...f,
                          shape: { ...f.shape, size } as MesaTableShape,
                        }))
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {shapeSizeOptions.map((size) => (
                          <SelectItem key={size} value={size}>
                            {mesaSizeDisplayLabel(size)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mesas-table-seats">Asientos</Label>
                    <Input
                      id="mesas-table-seats"
                      type="number"
                      min={1}
                      value={form.seats}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          seats: Number.parseInt(e.target.value, 10) || 1,
                        }))
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mesas-table-order">Orden</Label>
                    <Input
                      id="mesas-table-order"
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sortOrder: Number.parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="bg-background"
                    />
                  </div>
                  <label className="flex items-center gap-2 pt-7 text-sm">
                    <Checkbox
                      checked={form.isActive}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({ ...f, isActive: checked === true }))
                      }
                    />
                    Activa
                  </label>
                  </div>

                  <MesasTableFormPreview
                    label={form.label}
                    shape={form.shape}
                    seats={form.seats}
                  />
                </div>
              </MesasFormCard>
              ) : null}
            </>
          )}
        </MesasDialogScrollBody>
      </DialogContent>
    </Dialog>
  )
}

function MesasDecorsDialog({
  open,
  onOpenChange,
  popId,
  siteId,
  salons,
  getLayoutData,
  onLayoutChanged,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  popId: string
  siteId: string
  salons: MesaSalon[]
  getLayoutData?: () => MesasLayoutData | null
  onLayoutChanged: () => Promise<void>
}) {
  const [rows, setRows] = useState<MesasFloorDecorRow[]>([])
  const [dialogSalons, setDialogSalons] = useState<MesaSalon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterSalonId, setFilterSalonId] = useState("all")
  const [form, setForm] = useState<UpsertMesasFloorDecorInput>(
    defaultDecorForm("", 0),
  )
  const [saving, setSaving] = useState(false)

  const salonOptions = dialogSalons.length > 0 ? dialogSalons : salons

  const filteredRows = useMemo(() => {
    if (!filterSalonId || filterSalonId === "all") return rows
    return rows.filter((r) => r.salonId === filterSalonId)
  }, [rows, filterSalonId])

  const applyLayout = useCallback((data: MesasLayoutData) => {
    const activeSalons = applyLayoutSalons(data)
    const defaultSalonId = activeSalons[0]?.id ?? ""
    setDialogSalons(activeSalons)
    setRows(data.decors)
    setFilterSalonId("all")
    setForm((prev) =>
      prev.id ? prev : defaultDecorForm(defaultSalonId, data.decors.length),
    )
  }, [])

  const loadRows = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await getMesasLayout(popId, siteId)
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    applyLayout(res.data)
  }, [applyLayout, popId, siteId])

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next)
  }

  useEffect(() => {
    if (!open) {
      setError(null)
      setFilterSalonId("all")
      setForm(defaultDecorForm("", 0))
      return
    }

    setFilterSalonId("all")
    const snapshot = getLayoutData?.()
    if (snapshot) {
      applyLayout(snapshot)
      setLoading(false)
      setError(null)
    }
    void loadRows()
  }, [open, applyLayout, getLayoutData, loadRows])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    const res = await upsertMesasFloorDecor(popId, siteId, form)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setForm(defaultDecorForm(form.salonId, rows.length + (form.id ? 0 : 1)))
    await loadRows()
    await onLayoutChanged()
  }

  const handleDelete = async (decor: MesasFloorDecorRow) => {
    const label = decor.label || decorKindLabel(decor.kind)
    if (!window.confirm(`¿Eliminar "${label}"?`)) return
    setSaving(true)
    const res = await deleteMesasFloorDecor(popId, siteId, decor.id)
    setSaving(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    if (form.id === decor.id) {
      setForm(
        defaultDecorForm(
          resolveFormSalonId(filterSalonId, form.salonId || salonOptions[0]?.id || ""),
          rows.length - 1,
        ),
      )
    }
    await loadRows()
    await onLayoutChanged()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        data-rootsy-light-shell="true"
        showCloseButton={!saving}
        className={mesasDialogSurfaceWideClass}
      >
        <DialogHeader className={cn(clientDialogHeaderClass, "shrink-0")}>
          <MesasDialogShellHeader
            icon={Shapes}
            title="Elementos del plano"
            description='Paredes, barra, ingresos y decoración. El texto es libre (ej. "Salida emergencia", "Barra tragos").'
          />
        </DialogHeader>

        <MesasDialogScrollBody>
          <MesasDialogError message={error} />

          {salonOptions.length === 0 && !loading && rows.length === 0 ? (
            <p className="rounded-xl border border-border/70 bg-muted/15 px-4 py-6 text-sm leading-relaxed text-muted-foreground">
              Creá al menos un salón antes de agregar elementos.
            </p>
          ) : (
            <>
              <section className="space-y-3">
                <p className="text-sm font-semibold text-foreground">
                  Elementos existentes
                </p>
                <MesasSalonFilterBar
                  label="Filtrar salón"
                  value={filterSalonId}
                  onValueChange={setFilterSalonId}
                  salons={salonOptions}
                  showAll
                  totalCount={rows.length}
                  filteredCount={filteredRows.length}
                />
                <div className={mesasDialogListShellClass}>
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>Texto</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Salón</TableHead>
                        <TableHead className="w-24 text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading && rows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-8 text-center text-sm text-muted-foreground"
                          >
                            <span className="inline-flex items-center gap-2">
                              <Loader2 className="size-4 animate-spin" aria-hidden />
                              Cargando elementos…
                            </span>
                          </TableCell>
                        </TableRow>
                      ) : filteredRows.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="py-8 text-center text-sm text-muted-foreground"
                          >
                            {rows.length === 0
                              ? "Todavía no hay elementos. Creá el primero abajo."
                              : "No hay elementos en este salón."}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredRows.map((row) => {
                          const displayLabel = row.label || decorKindLabel(row.kind)
                          return (
                            <TableRow key={row.id}>
                              <TableCell
                                className={cn(
                                  "font-medium",
                                  !row.label && "text-muted-foreground",
                                )}
                              >
                                {row.label || "—"}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {decorKindLabel(row.kind)}
                              </TableCell>
                              <TableCell>
                                {salonOptions.find((s) => s.id === row.salonId)?.name ??
                                  "—"}
                              </TableCell>
                              <TableCell className="px-1 py-1.5 text-right">
                                <MesasDialogRowActions
                                  editLabel={`Editar ${displayLabel}`}
                                  deleteLabel={`Eliminar ${displayLabel}`}
                                  disabled={saving}
                                  onEdit={() => setForm(decorRowToForm(row))}
                                  onDelete={() => void handleDelete(row)}
                                />
                              </TableCell>
                            </TableRow>
                          )
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </section>

              {salonOptions.length > 0 ? (
              <MesasFormCard
                title={form.id ? "Editar elemento" : "Nuevo elemento"}
                footer={
                  <>
                    {form.id ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={saving}
                        onClick={() =>
                          setForm(
                            defaultDecorForm(
                              resolveFormSalonId(
                                filterSalonId,
                                form.salonId || salonOptions[0]?.id || "",
                              ),
                              rows.length,
                            ),
                          )
                        }
                      >
                        Cancelar edición
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      disabled={saving || !form.salonId}
                      className="gap-2"
                      onClick={() => void handleSave()}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="size-4 animate-spin" aria-hidden />
                          Guardando…
                        </>
                      ) : form.id ? (
                        "Guardar cambios"
                      ) : (
                        "Agregar elemento"
                      )}
                    </Button>
                  </>
                }
              >
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-start">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Salón</Label>
                    <Select
                      value={form.salonId}
                      onValueChange={(salonId) =>
                        setForm((f) => ({ ...f, salonId }))
                      }
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Elegir salón" />
                      </SelectTrigger>
                      <SelectContent>
                        {salonOptions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Tipo</Label>
                    <Select
                      value={form.kind}
                      onValueChange={(kind) => {
                        const k = kind as MesaFloorDecorKind
                        const size = defaultDecorSize(k)
                        setForm((f) => ({
                          ...f,
                          kind: k,
                          width: size.width,
                          height: size.height,
                        }))
                      }}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {decorKindOptions.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="mesas-decor-label">Texto visible</Label>
                    <Input
                      id="mesas-decor-label"
                      value={form.label}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, label: e.target.value }))
                      }
                      placeholder="Entrada principal, Barra postres, Salida emergencia…"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mesas-decor-w">Ancho (px)</Label>
                    <Input
                      id="mesas-decor-w"
                      type="number"
                      min={4}
                      value={form.width}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          width: Number.parseInt(e.target.value, 10) || 4,
                        }))
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mesas-decor-h">Alto (px)</Label>
                    <Input
                      id="mesas-decor-h"
                      type="number"
                      min={4}
                      value={form.height}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          height: Number.parseInt(e.target.value, 10) || 4,
                        }))
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="mesas-decor-order">Orden</Label>
                    <Input
                      id="mesas-decor-order"
                      type="number"
                      value={form.sortOrder}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          sortOrder: Number.parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="bg-background"
                    />
                  </div>
                  <label className="flex items-center gap-2 pt-7 text-sm">
                    <Checkbox
                      checked={form.isActive}
                      onCheckedChange={(checked) =>
                        setForm((f) => ({ ...f, isActive: checked === true }))
                      }
                    />
                    Activo
                  </label>
                  </div>

                  <MesaFloorDecorPreview
                    kind={form.kind}
                    label={form.label}
                    width={form.width}
                    height={form.height}
                    kindLabel={decorKindLabel(form.kind)}
                  />
                </div>
              </MesasFormCard>
              ) : null}
            </>
          )}
        </MesasDialogScrollBody>
      </DialogContent>
    </Dialog>
  )
}
