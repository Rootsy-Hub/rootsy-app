"use client"

import { MesaOpenForm } from "@/app/[siteId]/[popId]/mesas/components/MesaOpenForm"
import type {
  MesaOpenSessionInput,
  MesaSession,
  MesaTable,
  MesaWaiter,
} from "@/app/[siteId]/[popId]/mesas/mesasTypes"
import { mesaStatusLabel } from "@/app/[siteId]/[popId]/mesas/mesasTableStyles"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import {
  Clock,
  Pencil,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react"
import { useMemo, useState } from "react"

type Props = {
  table: MesaTable | null
  session: MesaSession | null
  sessionTables: MesaTable[]
  waiters: MesaWaiter[]
  mergeCandidates: MesaTable[]
  onOpenSession: (input: MesaOpenSessionInput) => void
  onUpdateSession: (sessionId: string, input: MesaOpenSessionInput) => void
  onCloseSession: (sessionId: string) => void
  onTakeOrder: () => void
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
  onOpenSession,
  onUpdateSession,
  onCloseSession,
  onTakeOrder,
  clientLabel,
}: Props) {
  const [editing, setEditing] = useState(false)

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="shrink-0 border-b border-slate-200/90 bg-white px-4 py-3.5 sm:px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              {sessionTables.length > 1 ? "Mesas unidas" : "Mesa"}
            </p>
            <h2 className="mt-0.5 truncate text-2xl font-bold tabular-nums text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {mesaStatusLabel(table.status)}
              {session ? (
                <>
                  {" · "}
                  <Clock className="mr-0.5 inline size-3 -translate-y-px" aria-hidden />
                  {formatDistanceToNow(new Date(session.openedAt), {
                    addSuffix: true,
                    locale: es,
                  })}
                </>
              ) : null}
            </p>
          </div>
        </div>

        {isOpen && !editing ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              onClick={onTakeOrder}
            >
              <ShoppingBag className="size-3.5" aria-hidden />
              Tomar pedido
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 gap-1.5"
              onClick={() => setEditing(true)}
            >
              <Pencil className="size-3.5" aria-hidden />
              Editar
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-9 text-slate-500 hover:text-rose-600"
              onClick={() => session && onCloseSession(session.id)}
            >
              Cerrar mesa
            </Button>
          </div>
        ) : null}
      </header>

      {isOpen && !editing ? (
        <div className="game-scroll min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
          <dl className="grid gap-3 rounded-xl border border-slate-200/90 bg-white p-4 text-sm shadow-sm">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Mozo
              </dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {waiter?.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Cliente
              </dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {clientLabel?.trim() || "Sin asignar"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Comensales
              </dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                {session?.guestCount ?? "Sin indicar"}
              </dd>
            </div>
            {sessionTables.length > 1 ? (
              <div>
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Notas
                </dt>
                <dd className="mt-0.5 text-slate-600">{session.note}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {!isOpen && table.status === "free" ? (
        <MesaOpenForm
          primaryTable={table}
          mergeCandidates={mergeCandidates}
          waiters={waiters}
          onSubmit={onOpenSession}
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
          onSubmit={(input) => {
            onUpdateSession(session.id, input)
            setEditing(false)
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
