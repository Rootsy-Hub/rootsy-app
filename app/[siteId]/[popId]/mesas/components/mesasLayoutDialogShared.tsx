"use client"

import type { MesaSalon } from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { RootsIconButton } from "@/components/rootsy-button"
import {
  RootsPrimaryButton,
  RootsProgressButton,
  RootsSubtleButton,
} from "@/components/rootsy-button"
import { RootsConfirmDialog } from "@/components/rootsy-dialog"
import {
  RootsFormSelectField,
  RootsFormSelectItem,
} from "@/components/rootsy-form"
import { rootsFormUiLabelClass } from "@/components/rootsy-form/rootsFormUiStyles"
import {
  TableCell,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { Loader2, Pencil, Trash2, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

/** Lista scrollable sobre body sunken del modal. */
export const mesasLayoutDialogListShellClass = cn(
  "min-h-[12rem] max-h-[min(38vh,340px)] overflow-y-auto rounded-xl",
  "border border-[var(--rootsy-bruma-200)] bg-white",
  // Tabla light — el shell modal hereda bruma-900 pero TableHead fuerza text-foreground (blanco en POS).
  "[&_[data-slot=table-head]]:text-[var(--rootsy-bruma-600)]",
  "[&_[data-slot=table-head]]:text-xs [&_[data-slot=table-head]]:font-semibold",
  "[&_[data-slot=table-head]]:uppercase [&_[data-slot=table-head]]:tracking-wide",
  "[&_[data-slot=table-cell]]:text-[var(--rootsy-bruma-900)]",
  "[&_[data-slot=table-row]:hover]:bg-[var(--rootsy-bruma-50)]",
)

/** Tarjeta de formulario sobre body sunken. */
export const mesasLayoutDialogFormSectionClass = cn(
  "space-y-4 rounded-xl border border-[var(--rootsy-bruma-200)] bg-white p-4",
)

/** Grid de campos del formulario — 2 columnas dentro de la tarjeta del modal. */
export const mesasLayoutDialogFormFieldsClass = "grid grid-cols-2 gap-3"

export const mesasLayoutDialogFormFieldFullClass = "col-span-2"

export const mesasLayoutDialogSectionTitleClass =
  "font-canopy text-sm font-semibold text-[var(--rootsy-bruma-900)]"

export const mesasLayoutDialogEmptyHintClass = cn(
  "rounded-xl border border-[var(--rootsy-bruma-200)] bg-white px-4 py-6",
  "font-canopy text-sm leading-relaxed text-[var(--rootsy-bruma-500)]",
)

export function MesasLayoutDialogListSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <p className={mesasLayoutDialogSectionTitleClass}>{title}</p>
      <div className={mesasLayoutDialogListShellClass}>{children}</div>
    </section>
  )
}

export function MesasLayoutDialogFormSection({
  title,
  children,
  footer,
  className,
}: {
  title: string
  children: ReactNode
  footer: ReactNode
  className?: string
}) {
  return (
    <section className={cn(mesasLayoutDialogFormSectionClass, className)}>
      <p className={mesasLayoutDialogSectionTitleClass}>{title}</p>
      {children}
      <div className="flex flex-wrap items-center gap-2 pt-1">{footer}</div>
    </section>
  )
}

export function MesasLayoutDialogListColumn({
  title,
  children,
  footer,
  className,
}: {
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}) {
  return (
    <section className={cn(mesasLayoutDialogFormSectionClass, className)}>
      <p className={mesasLayoutDialogSectionTitleClass}>{title}</p>
      {children}
      {footer ? <div className="pt-1">{footer}</div> : null}
    </section>
  )
}

/** Formulario a la izquierda, listado a la derecha (siempre 2 columnas en el modal). */
export const mesasLayoutDialogTwoColumnClass = cn(
  "grid w-full grid-cols-2 items-start gap-5",
)

export const mesasLayoutDialogTwoColumnWideFormClass = cn(
  "grid w-full grid-cols-2 items-start gap-5",
)

export const mesasLayoutDialogFormColumnClass = "min-w-0 self-start"

export const mesasLayoutDialogListPanelClass = cn(
  "flex w-full min-w-0 flex-col",
)

/** Área scroll del listado sortable dentro de la tarjeta del modal. */
export const mesasLayoutDialogSortableListScrollClass = cn(
  "w-full min-h-[14rem] max-h-[min(52vh,460px)] overflow-y-auto rounded-lg",
  "border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] p-2",
)

/** Shell amplio para modales admin de mesas (2 columnas). */
export const mesasLayoutDialogContentClass = cn(
  "h-auto max-h-[min(90vh,780px)] sm:max-w-[min(92vw,56rem)]",
)

export function MesasLayoutDialogTwoColumnLayout({
  form,
  list,
  wideForm = false,
  className,
}: {
  form: ReactNode
  list: ReactNode
  wideForm?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        wideForm
          ? mesasLayoutDialogTwoColumnWideFormClass
          : mesasLayoutDialogTwoColumnClass,
        className,
      )}
    >
      <div className={mesasLayoutDialogFormColumnClass}>{form}</div>
      <div className={mesasLayoutDialogListPanelClass}>{list}</div>
    </div>
  )
}

export function MesasLayoutDialogFormActions({
  editing,
  saving,
  canSave,
  onCancelEdit,
  onSave,
  saveLabel = "Guardar cambios",
  createLabel = "Agregar",
}: {
  editing: boolean
  saving: boolean
  canSave: boolean
  onCancelEdit?: () => void
  onSave: () => void
  saveLabel?: string
  createLabel?: string
}) {
  return (
    <>
      {editing && onCancelEdit ? (
        <RootsSubtleButton type="button" disabled={saving} onClick={onCancelEdit}>
          Cancelar edición
        </RootsSubtleButton>
      ) : null}
      {saving ? (
        <RootsProgressButton
          type="button"
          loading
          loadingLabel="Guardando…"
          disabled
          className="shrink-0"
        >
          {editing ? saveLabel : createLabel}
        </RootsProgressButton>
      ) : (
        <RootsPrimaryButton
          type="button"
          disabled={!canSave}
          onClick={onSave}
          className="shrink-0"
        >
          {editing ? saveLabel : createLabel}
        </RootsPrimaryButton>
      )}
    </>
  )
}

export function MesasLayoutDialogRowActions({
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
            <RootsIconButton
        type="button"
        label={editLabel}
        tone="action"
        intent="edit"
        size="compact"
        disabled={disabled}
        onClick={onEdit}
      >
        <Pencil />
      </RootsIconButton>
            <RootsIconButton
        type="button"
        label={deleteLabel}
        tone="action"
        intent="destructive"
        size="compact"
        disabled={disabled}
        onClick={onDelete}
      >
        <Trash2 />
      </RootsIconButton>
    </div>
  )
}

export function MesasLayoutDialogStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
        active
          ? "bg-[color-mix(in_srgb,var(--rootsy-savia-400)_12%,var(--rootsy-bruma-50))] text-[var(--rootsy-savia-800)] ring-1 ring-[color-mix(in_srgb,var(--rootsy-savia-500)_22%,transparent)]"
          : "bg-[var(--rootsy-bruma-100)] text-[var(--rootsy-bruma-500)] ring-1 ring-[var(--rootsy-bruma-200)]",
      )}
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  )
}

export function MesasLayoutDialogSalonFilterBar({
  label,
  value,
  onValueChange,
  salons,
  showAll = false,
  totalCount,
  filteredCount,
  disabled = false,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  salons: MesaSalon[]
  showAll?: boolean
  totalCount: number
  filteredCount: number
  disabled?: boolean
}) {
  return (
    <div className="space-y-2 rounded-xl border border-[var(--rootsy-bruma-200)] bg-white px-3 py-2.5">
      <div className="flex items-center justify-between gap-3">
        <span className={rootsFormUiLabelClass}>{label}</span>
        <p className="shrink-0 font-canopy text-xs tabular-nums text-[var(--rootsy-bruma-500)]">
          {filteredCount} de {totalCount}
        </p>
      </div>
      <RootsFormSelectField
        label={label}
        value={value || "all"}
        disabled={disabled}
        onValueChange={onValueChange}
        className="[&>label]:sr-only"
      >
        {showAll ? <RootsFormSelectItem value="all">Todos</RootsFormSelectItem> : null}
        {salons.map((s) => (
          <RootsFormSelectItem key={s.id} value={s.id}>
            {s.name}
          </RootsFormSelectItem>
        ))}
      </RootsFormSelectField>
    </div>
  )
}

export function MesasLayoutDialogLoadingRow({
  colSpan,
  message,
}: {
  colSpan: number
  message: string
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-8 text-center font-canopy text-sm text-[var(--rootsy-bruma-500)]"
      >
        <span className="inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {message}
        </span>
      </TableCell>
    </TableRow>
  )
}

export function MesasLayoutDialogEmptyRow({
  colSpan,
  message,
}: {
  colSpan: number
  message: string
}) {
  return (
    <TableRow>
      <TableCell
        colSpan={colSpan}
        className="py-8 text-center font-canopy text-sm text-[var(--rootsy-bruma-500)]"
      >
        {message}
      </TableCell>
    </TableRow>
  )
}

export function MesasLayoutDeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Eliminar",
  busy = false,
  error,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  busy?: boolean
  error?: string | null
  onConfirm: () => void
}) {
  return (
    <RootsConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      busyConfirmLabel="Eliminando…"
      busy={busy}
      error={error}
      destructive
      onConfirm={onConfirm}
    />
  )
}

export function MesasLayoutDialogHeaderIcon({
  icon: Icon,
}: {
  icon: LucideIcon
}) {
  return (
    <div
      className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--rootsy-savia-500)_22%,transparent)] bg-[color-mix(in_srgb,var(--rootsy-savia-400)_10%,var(--rootsy-bruma-50))] text-[var(--rootsy-savia-700)]"
      aria-hidden
    >
      <Icon className="size-5" />
    </div>
  )
}
