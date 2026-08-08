"use client"

import { useCallback, useEffect, useState } from "react"
import {
  listBackofficeOrganizations,
  type BackofficeOrganizationRow,
} from "@/app/backoffice/actions"
import {
  BackofficeEmptyState,
  BackofficePanel,
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

export default function BackofficeOrganizacionesPage() {
  const [rows, setRows] = useState<BackofficeOrganizationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRows(await listBackofficeOrganizations())
    } catch {
      setError("No se pudieron cargar las organizaciones.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <BackofficeSection title="Organizaciones" loading={loading} error={error}>
      {rows.length === 0 ? (
        <BackofficeEmptyState message="No hay organizaciones registradas." />
      ) : (
        <BackofficePanel>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organización</TableHead>
                <TableHead>POPs</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Trial</TableHead>
                <TableHead>MP payer</TableHead>
                <TableHead>Creada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <div className="font-medium">{row.name}</div>
                    <div className="font-mono text-[10px] text-[var(--rootsy-bruma-500)]">
                      {row.id}
                    </div>
                  </TableCell>
                  <TableCell>{row.popsCount}</TableCell>
                  <TableCell>{row.membersCount}</TableCell>
                  <TableCell>
                    <BackofficeStatusBadge
                      active={!row.trialConsumed}
                      activeLabel="Disponible"
                      inactiveLabel="Consumido"
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {row.mpPayerId ?? "—"}
                  </TableCell>
                  <TableCell>{formatBackofficeDate(row.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </BackofficePanel>
      )}
    </BackofficeSection>
  )
}
