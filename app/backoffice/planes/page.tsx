"use client"

import { useCallback, useEffect, useState } from "react"
import {
  listBackofficeSubscriptionCatalog,
  type BackofficeSubscriptionCatalog,
} from "@/app/backoffice/actions"
import { BackofficePlansLandingView } from "@/app/backoffice/components/BackofficePlansLandingView"
import {
  BackofficeEmptyState,
  BackofficeSection,
} from "@/app/backoffice/components/BackofficeSection"

export default function BackofficePlanesPage() {
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
      eyebrow="Catálogo"
      title="Planes"
      description="Vista previa del bloque de precios para la landing pública de Rootsy."
      loading={loading}
      error={error}
      onRefresh={() => void load()}
    >
      {!catalog || catalog.businessTypes.filter((row) => row.isActive).length === 0 ? (
        <BackofficeEmptyState message="No hay tipos de POP activos." />
      ) : (
        <BackofficePlansLandingView catalog={catalog} />
      )}
    </BackofficeSection>
  )
}
