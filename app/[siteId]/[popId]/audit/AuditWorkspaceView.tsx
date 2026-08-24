"use client"

import { DataWorkspaceBlocksSection } from "@/components/data-workspace/DataWorkspaceBlocksSection"
import {
  dataWorkspaceBlocksEmptyStateClass,
  dataWorkspaceBlocksPageContentClass,
  dataWorkspaceBlocksPageMainClass,
  workspaceTableBodyCellClass,
  workspaceTableHeaderCellClass,
  workspaceTableHeaderRowClass,
  workspaceTableRowBorderClass,
  workspaceTableRowHoverClass,
  workspaceTableSurfaceClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import {
  DataWorkspaceModuleLayout,
  dataWorkspaceModuleHeaderVariant,
} from "@/components/layouts-module/DataWorkspaceModuleLayout"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { useAfterHydration } from "@/hooks/useIsHydrated"
import { usePopMenuCache } from "@/hooks/usePopMenuCache"
import { hasPopAccessPermission } from "@/lib/popAccessPermissions"
import { POP_PERMS } from "@/lib/popPermissionConstants"
import {
  fetchPopAuditEvents,
  type AuditEventRow,
} from "@/lib/rootsyApi/auditClient"
import { cn } from "@/lib/utils"
import { useParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

const ACTION_LABEL: Record<string, string> = {
  create: "Alta",
  update: "Edición",
  delete: "Baja",
}

const SOURCE_LABEL: Record<string, string> = {
  user: "Persona",
  rootsy_ai: "Rootsy IA",
  system: "Sistema",
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)
}

export function AuditWorkspaceView() {
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined

  const { bootstrap, loading: bootstrapLoading, error: bootstrapError, hasPermission } =
    usePopWorkspace()
  const afterHydration = useAfterHydration()
  const menuCache = usePopMenuCache(popId ?? "")

  const canRead =
    afterHydration &&
    (hasPermission(POP_PERMS.AUDIT_READ.resource, POP_PERMS.AUDIT_READ.action) ||
      (menuCache.popAccess
        ? hasPopAccessPermission(
            menuCache.popAccess,
            POP_PERMS.AUDIT_READ.resource,
            POP_PERMS.AUDIT_READ.action,
          )
        : false))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<AuditEventRow[]>([])
  const [total, setTotal] = useState(0)

  const load = useCallback(async () => {
    if (!popId || !canRead) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    const res = await fetchPopAuditEvents(popId, { page: 1, pageSize: 50 })
    setLoading(false)
    if (!res.success) {
      setError(res.error)
      return
    }
    setEvents(res.events)
    setTotal(res.total)
  }, [canRead, popId])

  useEffect(() => {
    void load()
  }, [load])

  const popName = bootstrap?.popName ?? menuCache.popAccess?.pop.name ?? ""

  return (
    <DataWorkspaceModuleLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Auditoría"
      headerVariant={dataWorkspaceModuleHeaderVariant}
      loading={bootstrapLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-none"
      mainClassName={dataWorkspaceBlocksPageMainClass}
    >
      <div className={dataWorkspaceBlocksPageContentClass}>
        {bootstrapError ? (
          <RootsBanner
            intent="danger"
            layout="message"
            message={`Cabecera: ${bootstrapError}`}
          />
        ) : null}

        {!afterHydration || bootstrapLoading ? null : !canRead ? (
          <RootsBanner
            intent="danger"
            layout="message"
            message="No tenés permiso para ver la auditoría de este local."
          />
        ) : error ? (
          <RootsBanner intent="danger" layout="message" message={error} />
        ) : (
          <DataWorkspaceBlocksSection
            title="Movimientos"
            description="Rastro de altas, ediciones y bajas de los últimos 8 meses. No se puede borrar ni revertir desde acá."
          >
            {loading ? (
              <p className={dataWorkspaceBlocksEmptyStateClass}>Cargando…</p>
            ) : events.length === 0 ? (
              <p className={dataWorkspaceBlocksEmptyStateClass}>
                Todavía no hay movimientos auditados.
              </p>
            ) : (
              <div
                className={cn(
                  "overflow-hidden rounded-[1.375rem] border border-rootsy-bruma-200",
                  workspaceTableSurfaceClass,
                )}
              >
                <Table>
                  <TableHeader>
                    <TableRow className={workspaceTableHeaderRowClass}>
                      <TableHead className={workspaceTableHeaderCellClass}>
                        Cuándo
                      </TableHead>
                      <TableHead className={workspaceTableHeaderCellClass}>
                        Recurso
                      </TableHead>
                      <TableHead className={workspaceTableHeaderCellClass}>
                        Acción
                      </TableHead>
                      <TableHead className={workspaceTableHeaderCellClass}>
                        Origen
                      </TableHead>
                      <TableHead className={workspaceTableHeaderCellClass}>
                        Ruta
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow
                        key={event.id}
                        className={cn(
                          workspaceTableRowBorderClass,
                          workspaceTableRowHoverClass,
                        )}
                      >
                        <TableCell className={workspaceTableBodyCellClass}>
                          {formatWhen(event.occurred_at)}
                        </TableCell>
                        <TableCell className={workspaceTableBodyCellClass}>
                          {event.resource}
                        </TableCell>
                        <TableCell className={workspaceTableBodyCellClass}>
                          {ACTION_LABEL[event.action] ?? event.action}
                        </TableCell>
                        <TableCell className={workspaceTableBodyCellClass}>
                          {SOURCE_LABEL[event.execution_source] ??
                            event.execution_source}
                        </TableCell>
                        <TableCell className={workspaceTableBodyCellClass}>
                          {event.path}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {total > events.length ? (
                  <p className="px-4 py-3 font-canopy text-xs text-rootsy-bruma-500">
                    Mostrando {events.length} de {total}.
                  </p>
                ) : null}
              </div>
            )}
          </DataWorkspaceBlocksSection>
        )}
      </div>
    </DataWorkspaceModuleLayout>
  )
}
