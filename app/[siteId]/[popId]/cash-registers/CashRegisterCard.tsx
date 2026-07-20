"use client"

import type { CashRegisterRow } from "@/app/[siteId]/[popId]/cash-registers/actions"
import { dataWorkspaceShellCard } from "@/components/data-workspace/dataWorkspaceListStyles"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DoorClosed,
  DoorOpen,
  FileText,
  MinusCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react"

const fmt = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

type Props = {
  row: CashRegisterRow
  canCreate: boolean
  canUpdate: boolean
  canDelete: boolean
  onSummary: () => void
  onEdit: () => void
  onDelete: () => void
  onOpen: () => void
  onClose: () => void
  onDeposit: () => void
  onWithdraw: () => void
}

export function CashRegisterCard({
  row,
  canCreate,
  canUpdate,
  canDelete,
  onSummary,
  onEdit,
  onDelete,
  onOpen,
  onClose,
  onDeposit,
  onWithdraw,
}: Props) {
  const isOpen = Boolean(row.openSessionId)
  const totals = row.openSessionTotals

  return (
    <article className={cn(dataWorkspaceShellCard, "flex flex-col p-5")}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">
            {row.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Orden {row.sortOrder}
            {!row.isActive ? " · Inactiva" : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={onSummary}
            aria-label="Ver resumen de caja"
            title="Resumen"
          >
            <FileText className="size-4" />
          </Button>
          {canUpdate ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9"
              onClick={onEdit}
              aria-label="Editar caja"
            >
              <Pencil className="size-4" />
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-9 text-destructive"
              onClick={onDelete}
              aria-label="Eliminar caja"
            >
              <Trash2 className="size-4" />
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-4">
        <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
          Sesión
        </span>
        <Badge
          variant="outline"
          className={cn(
            "font-normal",
            isOpen
              ? "border-emerald-200/90 bg-emerald-50/90 text-emerald-700"
              : "text-muted-foreground",
          )}
        >
          {isOpen ? "Turno abierto" : "Sin turno"}
        </Badge>
      </div>

      {isOpen ? (
        <div className="space-y-4">
          {totals ? (
            <>
              <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-4">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Efectivo teórico en cajón
                </p>
                <p className="mt-2 font-mono text-3xl font-bold tabular-nums tracking-tight text-foreground">
                  {fmt.format(totals.efectivoTeoricoEnCajon)}
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Apertura + ventas en efectivo + ingresos al cajón − retiros
                </p>
                <div className="mt-3 grid gap-2 border-t border-border/50 pt-3 font-mono text-[11px] text-muted-foreground sm:grid-cols-2">
                  <div>
                    Apertura{" "}
                    <span className="text-foreground">
                      {fmt.format(totals.openingCash)}
                    </span>
                  </div>
                  <div>
                    + Ventas efectivo{" "}
                    <span className="text-emerald-700">
                      {fmt.format(totals.ventasEfectivo)}
                    </span>
                  </div>
                  <div>
                    + Ingresos cajón{" "}
                    <span className="text-emerald-700">
                      {fmt.format(totals.ingresosCajon)}
                    </span>
                  </div>
                  <div>
                    − Retiros{" "}
                    <span className="text-rose-700">
                      {fmt.format(totals.egresosCajon)}
                    </span>
                  </div>
                </div>
              </div>

              {totals.totalCobradoTurno != null ? (
                <>
                  <div className="rounded-xl border border-border/70 bg-muted/10 px-4 py-4">
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                      Total cobrado en el turno
                    </p>
                    <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">
                      {fmt.format(totals.totalCobradoTurno)}
                    </p>
                  </div>
                  {totals.cobrosPorMedio && totals.cobrosPorMedio.length > 0 ? (
                    <div className="rounded-xl border border-border/60 px-3 py-3">
                      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                        Cobros por medio de pago
                      </p>
                      <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto text-xs">
                        {totals.cobrosPorMedio.map((item, idx) => (
                          <li
                            key={`${item.name}-${idx}`}
                            className="flex items-baseline justify-between gap-2 border-b border-border/40 pb-1.5 last:border-0"
                          >
                            <span className="min-w-0 truncate text-muted-foreground">
                              {item.name}
                            </span>
                            <span className="shrink-0 font-mono tabular-nums text-foreground">
                              {fmt.format(item.total)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </>
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-muted/15 px-3 py-2 text-xs text-muted-foreground">
                  Sin permiso de lectura de ventas: el efectivo teórico sigue
                  disponible para el arqueo.
                </p>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-border/70 bg-muted/15 px-4 py-4">
              <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Saldo en cajón
              </p>
              <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-foreground">
                {row.cashBalance != null ? fmt.format(row.cashBalance) : "—"}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {canCreate ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={onDeposit}
                >
                  <Plus className="size-3.5" />
                  Ingreso
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={onWithdraw}
                >
                  <MinusCircle className="size-3.5" />
                  Retiro
                </Button>
              </>
            ) : null}
            {canUpdate ? (
              <Button type="button" size="sm" className="gap-1" onClick={onClose}>
                <DoorClosed className="size-3.5" />
                Cerrar caja
              </Button>
            ) : null}
          </div>
        </div>
      ) : canCreate && row.isActive ? (
        <Button
          type="button"
          size="sm"
          className="w-full gap-2 py-6"
          onClick={onOpen}
        >
          <DoorOpen className="size-4" />
          Abrir turno
        </Button>
      ) : (
        <p className="text-sm text-muted-foreground">
          {row.isActive
            ? "Sin turno abierto."
            : "Caja inactiva. Activá la caja para operar."}
        </p>
      )}
    </article>
  )
}
