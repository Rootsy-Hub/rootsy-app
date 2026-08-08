"use client"

import { useCallback, useEffect, useState } from "react"
import {
  BACKOFFICE_POPS_PAGE_SIZE_OPTIONS,
  DEFAULT_BACKOFFICE_POPS_PAGE_SIZE,
} from "@/app/backoffice/backofficePopsConstants"
import {
  deactivateBackofficePop,
  getBackofficePopDetail,
  listBackofficePopsPage,
  type BackofficePopDetail,
  type BackofficePopRow,
  type BackofficePopsPageResult,
} from "@/app/backoffice/actions"
import { BackofficePopDeleteDialog } from "@/app/backoffice/components/BackofficePopDeleteDialog"
import { BackofficePopDetailView } from "@/app/backoffice/components/BackofficePopDetailView"
import { BackofficePopsTable } from "@/app/backoffice/components/BackofficePopsTable"
import {
  BackofficeEmptyState,
  BackofficePanel,
  BackofficeSection,
} from "@/app/backoffice/components/BackofficeSection"

export default function BackofficePopsPage() {
  const [listResult, setListResult] = useState<BackofficePopsPageResult | null>(
    null,
  )
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_BACKOFFICE_POPS_PAGE_SIZE)
  const [listFetching, setListFetching] = useState(true)
  const [selectedPopId, setSelectedPopId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BackofficePopDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BackofficePopRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const loadList = useCallback(async () => {
    setListFetching(true)
    setError(null)
    try {
      const result = await listBackofficePopsPage({ page, pageSize })
      setListResult(result)
      if (result.page !== page) {
        setPage(result.page)
      }
    } catch {
      setError("No se pudieron cargar los puntos de venta.")
      setListResult(null)
    } finally {
      setListFetching(false)
    }
  }, [page, pageSize])

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
    void loadList()
  }, [loadList])

  useEffect(() => {
    if (!selectedPopId) {
      setDetail(null)
      return
    }
    void loadDetail(selectedPopId)
  }, [selectedPopId, loadDetail])

  const handleRefresh = () => {
    void loadList()
    if (selectedPopId) void loadDetail(selectedPopId)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleteBusy(true)
    setDeleteError(null)
    const result = await deactivateBackofficePop(deleteTarget.id)
    setDeleteBusy(false)
    if (!result.success) {
      setDeleteError(result.error)
      return
    }
    setDeleteTarget(null)
    void loadList()
  }

  const showingDetail = Boolean(selectedPopId)
  const rows = listResult?.rows ?? []
  const totalCount = listResult?.totalCount ?? 0
  const totalPages = listResult?.totalPages ?? 1
  const initialLoading = listFetching && listResult == null

  return (
    <>
      <BackofficeSection
        eyebrow="Operaciones"
        title={showingDetail ? "Detalle del POP" : "Puntos de venta"}
        description={
          showingDetail
            ? "Subscripción, pagos e historial completo."
            : "Todos los POPs registrados en la plataforma."
        }
        loading={initialLoading || (showingDetail && detailLoading && !detail)}
        error={error ?? detailError}
        onRefresh={handleRefresh}
      >
        {showingDetail && detail ? (
          <BackofficePopDetailView
            detail={detail}
            onBack={() => setSelectedPopId(null)}
          />
        ) : null}

        {!showingDetail && !listFetching && rows.length === 0 ? (
          <BackofficeEmptyState message="No hay puntos de venta registrados." />
        ) : null}

        {!showingDetail && (rows.length > 0 || listFetching) ? (
          <BackofficePanel>
            <BackofficePopsTable
              rows={rows}
              listFetching={listFetching}
              totalCount={totalCount}
              page={page}
              pageSize={pageSize}
              totalPages={totalPages}
              pageSizeOptions={BACKOFFICE_POPS_PAGE_SIZE_OPTIONS}
              onPageChange={setPage}
              onPageSizeChange={(nextPageSize) => {
                setPageSize(nextPageSize)
                setPage(1)
              }}
              onViewDetails={setSelectedPopId}
              onEdit={(row) => setSelectedPopId(row.id)}
              onDelete={setDeleteTarget}
            />
          </BackofficePanel>
        ) : null}
      </BackofficeSection>

      <BackofficePopDeleteDialog
        open={deleteTarget != null}
        popName={deleteTarget?.name ?? ""}
        busy={deleteBusy}
        error={deleteError}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </>
  )
}
