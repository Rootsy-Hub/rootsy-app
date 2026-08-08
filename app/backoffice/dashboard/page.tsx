"use client"

import { useCallback, useEffect, useState } from "react"
import {
  getBackofficeDashboardStats,
  type BackofficeDashboardStats,
} from "@/app/backoffice/actions"
import {
  BackofficeEmptyState,
  BackofficePanel,
  BackofficeSection,
} from "@/app/backoffice/components/BackofficeSection"
import { FoundationSpecCard } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"
import { Building2, CreditCard, Store, Users } from "lucide-react"
import Link from "next/link"

function StatCard({
  label,
  value,
  href,
  icon: Icon,
}: {
  label: string
  value: number
  href: string
  icon: typeof Users
}) {
  return (
    <Link href={href} className="group block h-full">
      <FoundationSpecCard className="h-full transition-shadow hover:shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
              {label}
            </p>
            <p className="mt-2 font-canopy text-3xl font-semibold tabular-nums text-[var(--rootsy-bruma-900)]">
              {value.toLocaleString("es-AR")}
            </p>
          </div>
          <div className="flex size-11 items-center justify-center rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)] text-[var(--rootsy-savia-600)] transition-colors group-hover:bg-[color-mix(in_srgb,var(--rootsy-savia-500)_10%,white)]">
            <Icon className="size-5" aria-hidden />
          </div>
        </div>
      </FoundationSpecCard>
    </Link>
  )
}

export default function BackofficeDashboardPage() {
  const [stats, setStats] = useState<BackofficeDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStats(await getBackofficeDashboardStats())
    } catch {
      setError("No se pudieron cargar las métricas del dashboard.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <BackofficeSection
      eyebrow="Resumen"
      title="Dashboard"
      description="Vista general de usuarios, organizaciones, puntos de venta y subscripciones activas."
      loading={loading}
      error={error}
      onRefresh={() => void load()}
    >
      {!stats ? (
        <BackofficeEmptyState message="Sin datos disponibles." />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Usuarios"
              value={stats.usersCount}
              href="/backoffice/usuarios"
              icon={Users}
            />
            <StatCard
              label="Organizaciones"
              value={stats.organizationsCount}
              href="/backoffice/organizaciones"
              icon={Building2}
            />
            <StatCard
              label="Puntos de venta"
              value={stats.popsCount}
              href="/backoffice/pops"
              icon={Store}
            />
            <StatCard
              label="Subscripciones activas"
              value={stats.activeSubscriptionsCount}
              href="/backoffice/pops"
              icon={CreditCard}
            />
          </div>

          <BackofficePanel className="p-6 sm:p-8">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
                  Trials en curso
                </p>
                <p className="mt-2 font-canopy text-2xl font-semibold text-[var(--rootsy-bruma-900)]">
                  {stats.trialSubscriptionsCount.toLocaleString("es-AR")}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--rootsy-bruma-500)]">
                  Accesos rápidos
                </p>
                <ul className="mt-3 space-y-2 text-sm">
                  <li>
                    <Link
                      href="/backoffice/planes"
                      className="font-medium text-[var(--rootsy-savia-600)] hover:underline"
                    >
                      Ver catálogo de planes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/backoffice/pops"
                      className="font-medium text-[var(--rootsy-savia-600)] hover:underline"
                    >
                      Explorar POPs
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </BackofficePanel>
        </div>
      )}
    </BackofficeSection>
  )
}
