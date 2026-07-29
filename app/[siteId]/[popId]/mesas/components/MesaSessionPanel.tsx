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
import {
  ChannelDataActions,
  ChannelDataEmptyState,
  ChannelDataErrorBanner,
  ChannelDataField,
  ChannelDataFields,
  ChannelDataHeader,
  ChannelDataHint,
  ChannelDataPanel,
  ChannelDataPrimaryAction,
  ChannelDataSection,
  ChannelDataStatusBadge,
  ChannelDataWarningBanner,
} from "@/components/sale-operation/ChannelOperationDataPanel"
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
import { Clock, Package, Pencil, UtensilsCrossed } from "lucide-react"
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
      <ChannelDataEmptyState
        icon={UtensilsCrossed}
        title="Seleccioná una mesa"
        description="Elegí una mesa del plano para abrirla, editarla o tomar el pedido."
      />
    )
  }

  const isOpen = session != null && table.status !== "free"
  const title = sessionTitle(table, sessionTables)
  const closeButtonLabel = "Liberar mesa"

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      {isOpen && !editing ? (
        <ChannelDataPanel>
          {sessionError ? (
            <ChannelDataErrorBanner>{sessionError}</ChannelDataErrorBanner>
          ) : null}

          <ChannelDataSection>
            <ChannelDataHeader
              title={title}
              meta={
                <>
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
                </>
              }
              badge={
                <ChannelDataStatusBadge>
                  {sessionTables.length > 1 ? "Mesas unidas" : "Abierta"}
                </ChannelDataStatusBadge>
              }
              actions={
                <DataWorkspaceTableIconAction
                  label="Editar mesa"
                  icon={Pencil}
                  variant="edit"
                  onClick={() => setEditing(true)}
                />
              }
            />

            <ChannelDataFields>
              <ChannelDataField label="Mozo">{waiter?.name ?? "—"}</ChannelDataField>
              <ChannelDataField label="Cliente">
                {clientLabel?.trim() || "Sin asignar"}
              </ChannelDataField>
              <ChannelDataField label="Comensales">
                {session?.guestCount ?? "Sin indicar"}
              </ChannelDataField>
              {sessionTables.length > 1 ? (
                <ChannelDataField label="Mesas incluidas">
                  <span className="mt-1 flex flex-wrap gap-1.5">
                    {sessionTables.map((t) => (
                      <span
                        key={t.id}
                        className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/15"
                      >
                        {t.label}
                      </span>
                    ))}
                  </span>
                </ChannelDataField>
              ) : null}
              {session?.note ? (
                <ChannelDataField label="Notas">{session.note}</ChannelDataField>
              ) : null}
            </ChannelDataFields>
          </ChannelDataSection>

          <ChannelDataActions>
            <ChannelDataPrimaryAction
              disabled={!canCloseSession || closeSessionLoading}
              title={closeSessionBlockReason ?? undefined}
              onClick={() => setCloseDialogOpen(true)}
              className={cn(
                !canCloseSession &&
                  "cursor-not-allowed bg-muted text-muted-foreground opacity-70 hover:bg-muted",
              )}
            >
              {closeSessionLoading ? "Liberando…" : closeButtonLabel}
            </ChannelDataPrimaryAction>
            {!canCloseSession && closeSessionBlockReason ? (
              <ChannelDataWarningBanner>{closeSessionBlockReason}</ChannelDataWarningBanner>
            ) : null}
          </ChannelDataActions>

          <ChannelDataHint icon={Package}>
            Usá la pestaña Pedido para cargar productos y cobrar.
          </ChannelDataHint>
        </ChannelDataPanel>
      ) : (
        <>
          {sessionError ? (
            <div className="shrink-0 px-3 pt-3 sm:px-3.5">
              <ChannelDataErrorBanner>{sessionError}</ChannelDataErrorBanner>
            </div>
          ) : null}

          {!(isOpen && !editing) ? (
            <div className="shrink-0 px-3 pt-3 sm:px-3.5">
              <ChannelDataSection>
                <ChannelDataHeader
                  title={title}
                  meta={mesaStatusLabel(table.status)}
                />
              </ChannelDataSection>
            </div>
          ) : null}
        </>
      )}

      <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <DialogContent
          data-rootsy-light-shell="true"
          showCloseButton
          className={cn(clientDialogSurface, "sm:max-w-md")}
        >
          <DialogHeader className={clientDialogHeaderClass}>
            <DialogTitle className="text-base font-semibold tracking-tight">
              ¿Liberar mesa?
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
              {closeBusy || closeSessionLoading ? "Liberando…" : closeButtonLabel}
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
        <ChannelDataEmptyState
          icon={UtensilsCrossed}
          title={`Mesa ${table.label} — ${mesaStatusLabel(table.status)}`}
          description={
            table.status === "reserved"
              ? "Esta mesa está reservada. Liberala desde administración."
              : "Seleccioná otra mesa o revisá el estado en el plano."
          }
        />
      ) : null}
    </div>
  )
}
