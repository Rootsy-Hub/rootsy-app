"use client"

import { MesaOpenForm } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenForm"
import type {
  MesaOpenSessionInput,
  MesaSession,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaStatusLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import {
  clientDialogBodyClass,
  clientDialogFooterClass,
  clientDialogHeaderClass,
  clientDialogSurface,
} from "@/app/[siteId]/[popId]/clients/ClientUpsertFormFields"
import { DataWorkspaceTableIconAction } from "@/components/data-workspace/DataWorkspaceListTablePrimitives"
import { saleOpDialogPrimaryBtn } from "@/components/sale-operation/saleOperationStyles"
import type { ChannelCloseMode } from "@/lib/channelCheckoutClose"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  Clock,
  Package,
  Pencil,
  UtensilsCrossed,
} from "lucide-react"
import { useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type Props = {
  table: MesaTable | null
  session: MesaSession | null
  sessionTables: MesaTable[]
  waiters: MesaWaiter[]
  mergeCandidates: MesaTable[]
  sessionError?: string | null
  onOpenSession: (input: MesaOpenSessionInput) => Promise<boolean> | boolean
  onUpdateSession: (
    sessionId: string,
    input: MesaOpenSessionInput,
  ) => Promise<boolean> | boolean
  onCloseSession: () => Promise<boolean> | boolean
  canCloseSession?: boolean
  closeSessionBlockReason?: string | null
  closeSessionMode?: ChannelCloseMode | null
  closeSessionLoading?: boolean
  clientLabel?: string | null
}

function sessionTitle(table: MesaTable | null, sessionTables: MesaTable[]): string {
  if (sessionTables.length > 1) {
    return sessionTables.map((t) => t.label).join(" + ")
  }
  if (table) return table.label
  return "—"
}

export function MesaSessionPanel({
  table,
  session,
  sessionTables,
  waiters,
  mergeCandidates,
  sessionError,
  onOpenSession,
  onUpdateSession,
  onCloseSession,
  canCloseSession = false,
  closeSessionBlockReason = null,
  closeSessionMode = null,
  closeSessionLoading = false,
  clientLabel,
}: Props) {
  const [editing, setEditing] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [closeBusy, setCloseBusy] = useState(false)

  const closeDialogTitle = useMemo(() => {
    if (sessionTables.length > 1) {
      return `Mesas ${sessionTables.map((t) => t.label).join(" + ")}`
    }
    return table ? `Mesa ${table.label}` : "esta mesa"
  }, [sessionTables, table])

  const confirmCloseSession = async () => {
    if (closeBusy || !canCloseSession) return
    setCloseBusy(true)
    try {
      const ok = await onCloseSession()
      if (ok) setCloseDialogOpen(false)
    } finally {
      setCloseBusy(false)
    }
  }

  const waiter = useMemo(
    () => waiters.find((w) => w.id === session?.waiterId),
    [waiters, session?.waiterId],
  )

  if (!table) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-500">
          <UtensilsCrossed className="size-8" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-700">
            Seleccioná una mesa
          </p>
          <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-slate-500">
            Elegí una mesa del plano para abrirla, editarla o tomar el pedido.
          </p>
        </div>
      </div>
    )
  }

  const isOpen = session != null && table.status !== "free"
  const title = sessionTitle(table, sessionTables)
  const closeButtonLabel =
    closeSessionMode === "release" ? "Liberar mesa" : "Cerrar mesa"

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {sessionError ? (
        <p className="border-b border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {sessionError}
        </p>
      ) : null}

      {!(isOpen && !editing) ? (
        <div className="border-b border-slate-200/90 bg-white px-3 py-4">
          <p className="text-lg font-bold text-slate-900">{title}</p>
          <p className="text-xs text-slate-500">{mesaStatusLabel(table.status)}</p>
        </div>
      ) : null}

      {isOpen && !editing ? (
        <>
          <div className="border-b border-slate-200/90 bg-white px-3 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-bold text-slate-900">{title}</p>
                <p className="text-xs text-slate-500">
                  {mesaStatusLabel(table.status)}
                  {session ? (
                    <>
                      {" · "}
                      <Clock
                        className="mr-0.5 inline size-3 -translate-y-px"
                        aria-hidden
                      />
                      {formatDistanceToNow(new Date(session.openedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </>
                  ) : null}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {sessionTables.length > 1 ? "Mesas unidas" : "Abierta"}
                </span>
                <DataWorkspaceTableIconAction
                  label="Editar mesa"
                  icon={Pencil}
                  variant="edit"
                  onClick={() => setEditing(true)}
                />
              </div>
            </div>

            <dl className="mt-4 grid gap-2 text-sm">
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Mozo
                </dt>
                <dd className="text-slate-800">{waiter?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Cliente
                </dt>
                <dd className="text-slate-800">
                  {clientLabel?.trim() || "Sin asignar"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase text-slate-500">
                  Comensales
                </dt>
                <dd className="text-slate-800">
                  {session?.guestCount ?? "Sin indicar"}
                </dd>
              </div>
              {sessionTables.length > 1 ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Mesas incluidas
                  </dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {sessionTables.map((t) => (
                      <span
                        key={t.id}
                        className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200/80"
                      >
                        {t.label}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
              {session?.note ? (
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Notas
                  </dt>
                  <dd className="text-slate-800">{session.note}</dd>
                </div>
              ) : null}
            </dl>
          </div>

          <div className="grid gap-0 border-b border-slate-200/90 bg-white">
            <Button
              type="button"
              variant="ghost"
              disabled={!canCloseSession || closeSessionLoading}
              title={closeSessionBlockReason ?? undefined}
              onClick={() => setCloseDialogOpen(true)}
              className={cn(
                "h-12 w-full rounded-none border-0",
                canCloseSession
                  ? "text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
                  : "cursor-not-allowed text-slate-400 opacity-70",
              )}
            >
              {closeSessionLoading ? "Cerrando…" : closeButtonLabel}
            </Button>
            {!canCloseSession && closeSessionBlockReason ? (
              <p className="border-t border-slate-200/90 px-3 py-2 text-xs leading-relaxed text-amber-800">
                {closeSessionBlockReason}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-b border-slate-200/90 bg-slate-50/80 px-3 py-2.5 text-xs text-slate-500">
            <Package className="size-4 shrink-0" aria-hidden />
            Usá la pestaña Pedido para cargar productos y cobrar.
          </div>
        </>
      ) : null}

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className={cn(clientDialogSurface, "sm:max-w-md")}
        >
          <DialogHeader className={clientDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              {closeSessionMode === "release"
                ? "¿Liberar mesa?"
                : "¿Cerrar mesa?"}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed">
              {closeSessionMode === "release"
                ? "No hay ítems ni cobros pendientes. La mesa quedará libre."
                : "El pedido está completamente cobrado. La mesa quedará libre."}
            </DialogDescription>
          </DialogHeader>
          <div className={clientDialogBodyClass}>
            <p className="text-sm text-muted-foreground">
              Vas a cerrar{" "}
              <strong className="text-foreground">{closeDialogTitle}</strong>.
            </p>
          </div>
          <DialogFooter className={clientDialogFooterClass}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCloseDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className={saleOpDialogPrimaryBtn}
              disabled={closeBusy || closeSessionLoading}
              onClick={() => void confirmCloseSession()}
            >
              {closeBusy || closeSessionLoading ? "Cerrando…" : closeButtonLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isOpen && table.status === "free" ? (
        <MesaOpenForm
          primaryTable={table}
          mergeCandidates={mergeCandidates}
          waiters={waiters}
          onSubmit={async (input) => {
            await onOpenSession(input)
          }}
        />
      ) : null}

      {isOpen && editing && session ? (
        <MesaOpenForm
          primaryTable={table}
          mergeCandidates={mergeCandidates}
          waiters={waiters}
          initial={{
            tableIds: session.tableIds,
            waiterId: session.waiterId,
            guestCount: session.guestCount,
            note: session.note,
          }}
          submitLabel="Guardar cambios"
          onSubmit={async (input) => {
            const ok = await onUpdateSession(session.id, input)
            if (ok) setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      ) : null}

      {!isOpen && table.status !== "free" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
          <p className="text-sm font-medium text-slate-700">
            Mesa {table.label} — {mesaStatusLabel(table.status)}
          </p>
          <p className="text-xs text-slate-500">
            {table.status === "reserved"
              ? "Esta mesa está reservada. Liberala desde administración."
              : "Seleccioná otra mesa o revisá el estado en el plano."}
          </p>
        </div>
      ) : null}
    </div>
  )
}
