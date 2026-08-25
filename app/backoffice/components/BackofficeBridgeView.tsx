"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  deleteBackofficePlatformBinding,
  getBackofficeBridgeContext,
  saveBackofficeRootsyPlatformPop,
  upsertBackofficePlatformBinding,
  type BackofficeBridgeContext,
  type BackofficePlatformServiceBindingRow,
} from "@/app/backoffice/bridgeActions"
import {
  BackofficeEmptyState,
  BackofficePanel,
  BackofficeSection,
  BackofficeStatusBadge,
  formatBackofficeMoney,
} from "@/app/backoffice/components/BackofficeSection"
import { FoundationSpecCard } from "@/app/library/libraryFoundationDocShared"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ALL_BUSINESS_TYPES = "__all__"
const NO_POP_SELECTED = "__none__"
const NO_SERVICE_SELECTED = "__none__"

function formatBillingPeriod(value: string): string {
  switch (value) {
    case "monthly":
      return "Mensual"
    case "yearly":
      return "Anual"
    case "hourly":
      return "Por hora"
    case "weekly":
      return "Semanal"
    case "custom":
      return "Personalizado"
    case "none":
      return "Sin período"
    default:
      return value || "—"
  }
}

export function BackofficeBridgeView() {
  const [context, setContext] = useState<BackofficeBridgeContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [savingPop, setSavingPop] = useState(false)

  const [selectedPopId, setSelectedPopId] = useState(NO_POP_SELECTED)
  const [planName, setPlanName] = useState("")
  const [businessTypeName, setBusinessTypeName] = useState(ALL_BUSINESS_TYPES)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  )
  const [serviceTypeId, setServiceTypeId] = useState(NO_SERVICE_SELECTED)
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await getBackofficeBridgeContext()
      setContext(next)
      setSelectedPopId(next.rootsyPopId ?? NO_POP_SELECTED)
    } catch {
      setError("No se pudo cargar el bridge Rootsy.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const resetForm = () => {
    setEditingId(null)
    setPlanName("")
    setBusinessTypeName(ALL_BUSINESS_TYPES)
    setBillingCycle("monthly")
    setServiceTypeId(NO_SERVICE_SELECTED)
    setNotes("")
    setFormError(null)
  }

  const startEdit = (row: BackofficePlatformServiceBindingRow) => {
    setEditingId(row.id)
    setPlanName(row.planName)
    setBusinessTypeName(row.businessTypeName ?? ALL_BUSINESS_TYPES)
    setBillingCycle(row.billingCycle)
    setServiceTypeId(row.serviceTypeId)
    setNotes(row.notes ?? "")
    setFormError(null)
  }

  const handleSavePop = async () => {
    if (selectedPopId === NO_POP_SELECTED) {
      setFormError("Elegí un POP Rootsy.")
      return
    }
    setSavingPop(true)
    setFormError(null)
    const result = await saveBackofficeRootsyPlatformPop(selectedPopId)
    setSavingPop(false)
    if (!result.success) {
      setFormError(result.error)
      return
    }
    await load()
  }

  const handleSave = async () => {
    if (!context?.rootsyPopConfigured) {
      setFormError("Configurá el POP Rootsy antes de crear bindings.")
      return
    }
    if (serviceTypeId === NO_SERVICE_SELECTED) {
      setFormError("Elegí un servicio.")
      return
    }

    setSaving(true)
    setFormError(null)
    const result = await upsertBackofficePlatformBinding({
      id: editingId,
      planName,
      businessTypeName:
        businessTypeName === ALL_BUSINESS_TYPES ? null : businessTypeName,
      billingCycle,
      serviceTypeId,
      notes,
      isActive: true,
    })
    setSaving(false)
    if (!result.success) {
      setFormError(result.error)
      return
    }
    resetForm()
    await load()
  }

  const handleDelete = async (bindingId: string) => {
    const result = await deleteBackofficePlatformBinding(bindingId)
    if (!result.success) {
      setFormError(result.error)
      return
    }
    if (editingId === bindingId) resetForm()
    await load()
  }

  const popWorkspaceHref =
    context?.rootsyPopId && context.rootsyPopSiteId
      ? `/${context.rootsyPopSiteId}/${context.rootsyPopId}/operations`
      : null

  const activeServices =
    context?.serviceOptions.filter((service) => service.isActive) ?? []

  return (
    <BackofficeSection title="Bridge Rootsy" loading={loading} error={error}>
      {context ? (
        <div className="space-y-6">
          <FoundationSpecCard className="space-y-4">
            <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-700)]">
              Conecta planes de plataforma con servicios del POP Rootsy. Al
              confirmar un pago SaaS, se crea una operación de servicios en ese
              POP (dual-write con el billing actual).
            </p>

            <div className="space-y-3">
              <Label htmlFor="bridge-pop-select">POP Rootsy</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <Select value={selectedPopId} onValueChange={setSelectedPopId}>
                  <SelectTrigger id="bridge-pop-select" className="sm:max-w-md">
                    <SelectValue placeholder="Elegí el POP interno de Rootsy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_POP_SELECTED} disabled>
                      Elegí un POP
                    </SelectItem>
                    {context.popOptions.map((pop) => (
                      <SelectItem key={pop.id} value={pop.id}>
                        {pop.name}
                        {!pop.isActive ? " (inactivo)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  onClick={() => void handleSavePop()}
                  disabled={savingPop || selectedPopId === NO_POP_SELECTED}
                >
                  {savingPop ? "Guardando…" : "Guardar POP"}
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                {context.rootsyPopConfigured ? (
                  <BackofficeStatusBadge active activeLabel="POP configurado" />
                ) : (
                  <BackofficeStatusBadge
                    active={false}
                    inactiveLabel="Sin POP"
                  />
                )}
                {context.rootsyPopSource === "database" ? (
                  <span className="text-[var(--rootsy-bruma-600)]">
                    Fuente: Uroboros
                  </span>
                ) : null}
                {context.rootsyPopSource === "env" ? (
                  <span className="text-[var(--rootsy-bruma-600)]">
                    Fuente: ROOTSY_POP_ID en entorno
                  </span>
                ) : null}
                {context.envFallbackPopId &&
                context.rootsyPopSource === "database" ? (
                  <span className="text-xs text-[var(--rootsy-bruma-500)]">
                    Env fallback disponible
                  </span>
                ) : null}
              </div>
              {context.rootsyPopName ? (
                <p className="text-sm text-[var(--rootsy-bruma-800)]">
                  Activo: {context.rootsyPopName}
                </p>
              ) : null}
            </div>

            {popWorkspaceHref ? (
              <Link
                href={popWorkspaceHref}
                className="text-sm font-medium text-[var(--rootsy-savia-600)] underline-offset-2 hover:underline"
              >
                Abrir Operaciones del POP Rootsy
              </Link>
            ) : null}
          </FoundationSpecCard>

          <BackofficePanel>
            <div className="space-y-4 p-4 sm:p-6">
              <h2 className="text-base font-semibold text-[var(--rootsy-bruma-900)]">
                {editingId ? "Editar binding" : "Nuevo binding"}
              </h2>
              {!context.rootsyPopConfigured ? (
                <p className="text-sm text-[var(--rootsy-bruma-600)]">
                  Elegí y guardá el POP Rootsy antes de crear bindings.
                </p>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="bridge-plan">Plan plataforma</Label>
                  <Select value={planName} onValueChange={setPlanName}>
                    <SelectTrigger id="bridge-plan">
                      <SelectValue placeholder="Elegí un plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {context.planOptions.map((plan) => (
                        <SelectItem key={plan.name} value={plan.name}>
                          {plan.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bridge-type">Rubro (opcional)</Label>
                  <Select
                    value={businessTypeName}
                    onValueChange={setBusinessTypeName}
                  >
                    <SelectTrigger id="bridge-type">
                      <SelectValue placeholder="Todos los rubros" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_BUSINESS_TYPES}>
                        Todos los rubros
                      </SelectItem>
                      {context.businessTypeOptions.map((type) => (
                        <SelectItem key={type.name} value={type.name}>
                          {type.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bridge-cycle">Ciclo</Label>
                  <Select
                    value={billingCycle}
                    onValueChange={(value) =>
                      setBillingCycle(value === "yearly" ? "yearly" : "monthly")
                    }
                  >
                    <SelectTrigger id="bridge-cycle">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="yearly">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bridge-service">Servicio del POP Rootsy</Label>
                  <Select
                    value={serviceTypeId}
                    onValueChange={setServiceTypeId}
                    disabled={!context.rootsyPopConfigured}
                  >
                    <SelectTrigger id="bridge-service">
                      <SelectValue placeholder="Elegí un servicio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_SERVICE_SELECTED} disabled>
                        Elegí un servicio
                      </SelectItem>
                      {activeServices.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} · {formatBillingPeriod(service.billingPeriod)} ·{" "}
                          {formatBackofficeMoney(service.defaultPrice)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="bridge-notes">Notas</Label>
                  <Input
                    id="bridge-notes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              {formError ? (
                <p className="text-sm text-destructive">{formError}</p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !context.rootsyPopConfigured}
                >
                  {saving ? "Guardando…" : editingId ? "Actualizar" : "Agregar"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                ) : null}
              </div>
            </div>
          </BackofficePanel>

          {context.bindings.length === 0 ? (
            <BackofficeEmptyState message="Todavía no hay bindings. Configurá el POP y agregá al menos uno." />
          ) : (
            <BackofficePanel>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Plan</th>
                      <th className="px-4 py-3 font-medium">Rubro</th>
                      <th className="px-4 py-3 font-medium">Ciclo</th>
                      <th className="px-4 py-3 font-medium">Servicio</th>
                      <th className="px-4 py-3 font-medium">Estado</th>
                      <th className="px-4 py-3 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {context.bindings.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-[var(--rootsy-bruma-100)]"
                      >
                        <td className="px-4 py-3">{row.planDisplayName}</td>
                        <td className="px-4 py-3">
                          {row.businessTypeDisplayName ?? "Todos"}
                        </td>
                        <td className="px-4 py-3">
                          {row.billingCycle === "yearly" ? "Anual" : "Mensual"}
                        </td>
                        <td className="px-4 py-3">
                          <div>{row.serviceTypeName ?? "—"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <BackofficeStatusBadge active={row.isActive} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(row)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => void handleDelete(row.id)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </BackofficePanel>
          )}
        </div>
      ) : null}
    </BackofficeSection>
  )
}
