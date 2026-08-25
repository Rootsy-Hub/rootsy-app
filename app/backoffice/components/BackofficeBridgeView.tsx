"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  deleteBackofficePlatformBinding,
  getBackofficeBridgeContext,
  upsertBackofficePlatformBinding,
  type BackofficeBridgeContext,
  type BackofficePlatformServiceBindingRow,
} from "@/app/backoffice/bridgeActions"
import {
  BackofficeEmptyState,
  BackofficePanel,
  BackofficeSection,
  BackofficeStatusBadge,
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

export function BackofficeBridgeView() {
  const [context, setContext] = useState<BackofficeBridgeContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [planName, setPlanName] = useState("")
  const [businessTypeName, setBusinessTypeName] = useState(ALL_BUSINESS_TYPES)
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  )
  const [serviceTypeId, setServiceTypeId] = useState("")
  const [notes, setNotes] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setContext(await getBackofficeBridgeContext())
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
    setServiceTypeId("")
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

  const handleSave = async () => {
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

  return (
    <BackofficeSection title="Bridge Rootsy" loading={loading} error={error}>
      {context ? (
        <div className="space-y-6">
          <FoundationSpecCard className="space-y-3">
            <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-700)]">
              Conecta planes de plataforma con servicios del POP Rootsy. Al
              confirmar un pago SaaS, se crea una operación de servicios en ese
              POP (dual-write con el billing actual).
            </p>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-[var(--rootsy-bruma-600)]">
                  ROOTSY_POP_ID
                </dt>
                <dd className="font-mono text-xs text-[var(--rootsy-bruma-900)]">
                  {context.rootsyPopId ?? "— no configurado —"}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-[var(--rootsy-bruma-600)]">
                  POP
                </dt>
                <dd className="text-[var(--rootsy-bruma-900)]">
                  {context.rootsyPopName ?? "—"}
                  {context.rootsyPopConfigured ? (
                    <span className="ml-2">
                      <BackofficeStatusBadge active activeLabel="Configurado" />
                    </span>
                  ) : (
                    <span className="ml-2">
                      <BackofficeStatusBadge
                        active={false}
                        inactiveLabel="Falta env"
                      />
                    </span>
                  )}
                </dd>
              </div>
            </dl>
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
                  <Label htmlFor="bridge-service">service_type_id</Label>
                  <Input
                    id="bridge-service"
                    value={serviceTypeId}
                    onChange={(event) => setServiceTypeId(event.target.value)}
                    placeholder="UUID del servicio en el POP Rootsy"
                    className="font-mono text-xs"
                  />
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
                <Button type="button" onClick={() => void handleSave()} disabled={saving}>
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
            <BackofficeEmptyState message="Todavía no hay bindings. Agregá al menos uno para el plan de prueba." />
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
                          <div className="font-mono text-[11px] text-[var(--rootsy-bruma-500)]">
                            {row.serviceTypeId}
                          </div>
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
