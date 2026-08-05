"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getBackofficeUserDetail,
  listBackofficeUsers,
  type BackofficeUserDetail,
  type BackofficeUserRow,
} from "@/app/backoffice/actions"
import { BackofficeUserDetailView } from "@/app/backoffice/components/BackofficeUserDetailView"
import {
  BackofficeEmptyState,
  BackofficeSection,
  formatBackofficeDate,
} from "@/app/backoffice/components/BackofficeSection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

export default function BackofficeUsersPage() {
  const [rows, setRows] = useState<BackofficeUserRow[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [detail, setDetail] = useState<BackofficeUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await listBackofficeUsers())
    } catch {
      setError("No se pudieron cargar los usuarios.")
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDetail = useCallback(async (userId: string) => {
    setDetailLoading(true)
    setDetailError(null)
    try {
      const result = await getBackofficeUserDetail(userId)
      if (!result) {
        setDetailError("No se encontró el usuario.")
        setDetail(null)
        return
      }
      setDetail(result)
    } catch {
      setDetailError("No se pudieron cargar los detalles del usuario.")
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selectedUserId) {
      setDetail(null)
      return
    }
    void loadDetail(selectedUserId)
  }, [selectedUserId, loadDetail])

  const handleRefresh = () => {
    void load()
    if (selectedUserId) void loadDetail(selectedUserId)
  }

  const showingDetail = Boolean(selectedUserId)

  return (
    <BackofficeSection
      title={showingDetail ? "Detalle del usuario" : "Usuarios"}
      description={
        showingDetail
          ? "Perfil, POPs como titular y membresías."
          : "Perfiles registrados en la plataforma."
      }
      loading={loading || (showingDetail && detailLoading && !detail)}
      error={error ?? detailError}
      onRefresh={handleRefresh}
    >
      {showingDetail && detail ? (
        <BackofficeUserDetailView
          detail={detail}
          onBack={() => setSelectedUserId(null)}
        />
      ) : null}

      {!showingDetail && rows.length === 0 ? (
        <BackofficeEmptyState message="No hay usuarios registrados." />
      ) : null}

      {!showingDetail && rows.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>País</TableHead>
              <TableHead>Idioma</TableHead>
              <TableHead>Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className={cn(
                  "cursor-pointer transition-colors hover:bg-muted/40",
                )}
                onClick={() => setSelectedUserId(row.id)}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-border/70">
                      <AvatarImage src={row.imageUrl ?? undefined} alt="" />
                      <AvatarFallback className="text-xs">
                        {initials(row.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{row.fullName}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {row.id}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{row.email ?? "—"}</TableCell>
                <TableCell>{row.country ?? "—"}</TableCell>
                <TableCell>{row.language ?? "—"}</TableCell>
                <TableCell>{formatBackofficeDate(row.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : null}
    </BackofficeSection>
  )
}
