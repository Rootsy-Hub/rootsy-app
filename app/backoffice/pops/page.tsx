"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getBackofficePopDetail,
  listBackofficePops,
  type BackofficePopDetail,
  type BackofficePopRow,
} from "@/app/backoffice/actions"
import { BackofficePopDetailView } from "@/app/backoffice/components/BackofficePopDetailView"
import {
  BackofficeEmptyState,
  BackofficeSection,
  BackofficeStatusBadge,
  formatBackofficeDate,
} from "@/app/backoffice/components/BackofficeSection"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

export default function BackofficePopsPage() {
  const [rows, setRows] = useState<BackofficePopRow[]>([])
  const [selectedPopId, setSelectedPopId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BackofficePopDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await listBackofficePops())
    } catch {
      setError("No se pudieron cargar los puntos de venta.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDetail = useCallback(async (popId: string) => {
    setDetailLoading(true)
    setDetailError(null)
    try {
      const result = await getBackofficePopDetail(popId)
      if (!result) {
        setDetailError("No se encontró el punto de venta.")
        setDetail(null)
        return
      }
      setDetail(result)
    } catch {
      setDetailError("No se pudieron cargar los detalles del POP.")
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selectedPopId) {
      setDetail(null)
      return
    }
    void loadDetail(selectedPopId)
  }, [selectedPopId, loadDetail])

  const handleRefresh = () => {
    void load()
    if (selectedPopId) void loadDetail(selectedPopId)
  }

  const showingDetail = Boolean(selectedPopId)

  return (
    <BackofficeSection
      title={showingDetail ? "Detalle del POP" : "Puntos de venta"}
      description={
        showingDetail
          ? "Subscripción, pagos e historial completo."
          : "Todos los POPs registrados en la plataforma."
      }
      loading={loading || (showingDetail && detailLoading && !detail)}
      error={error ?? detailError}
      onRefresh={handleRefresh}
    >
      {showingDetail && detail ? (
        <BackofficePopDetailView
          detail={detail}
          onBack={() => setSelectedPopId(null)}
        />
      ) : null}

      {!showingDetail && rows.length === 0 ? (
        <BackofficeEmptyState message="No hay puntos de venta registrados." />
      ) : null}

      {!showingDetail && rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>POP</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>Dueño</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Subscripción</TableHead>
              <TableHead>POP</TableHead>
              <TableHead>Creado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/40",
                )}
                onClick={() => setSelectedPopId(row.id)}
              >
                <TableCell>
                  <div className="font-medium">{row.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {row.id}
                  </div>
                </TableCell>
                <TableCell className="font-mono text-xs">{row.siteId}</TableCell>
                <TableCell>
                  <div>{row.ownerName}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {row.ownerUserId}
                  </div>
                </TableCell>
                <TableCell>{row.businessTypeName ?? "—"}</TableCell>
                <TableCell>{row.planName ?? "—"}</TableCell>
                <TableCell>{row.subscriptionStatus ?? "—"}</TableCell>
                <TableCell>
                  <BackofficeStatusBadge active={row.isActive} />
                </TableCell>
                <TableCell>{formatBackofficeDate(row.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </BackofficeSection>
  )
}
