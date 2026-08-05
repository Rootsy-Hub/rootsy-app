"use client"

import { useCallback, useEffect, useState } from "react"
import {
  listBackofficeSubscriptionCatalog,
  type BackofficeSubscriptionCatalog,
} from "@/app/backoffice/actions"
import { BackofficeBusinessTypesOverview } from "@/app/backoffice/components/BackofficeBusinessTypesOverview"
import {
  BackofficeEmptyState,
  BackofficeSection,
} from "@/app/backoffice/components/BackofficeSection"

export default function BackofficeBusinessTypesPage() {
  const [catalog, setCatalog] = useState<BackofficeSubscriptionCatalog | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCatalog(await listBackofficeSubscriptionCatalog())
    } catch {
      setError("No se pudieron cargar los planes de subscripción.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <BackofficeSection
      title="Planes de subscripción"
      description="Módulos generales, específicos, extras y planes por vertical."
      loading={loading}
      error={error}
      onRefresh={() => void load()}
    >
      {!catalog || catalog.businessTypes.filter((row) => row.isActive).length === 0 ? (
        <BackofficeEmptyState message="No hay tipos de POP activos." />
      ) : (
        <BackofficeBusinessTypesOverview catalog={catalog} />
      )}
    </BackofficeSection>
  )
}
