"use client"

import {
  getPopSettingsPageData,
  syncPadronForPopFiscal,
  updatePopSettings,
  type PopSettingsFormInput,
} from "@/app/[siteId]/[popId]/settings/actions"
import { DataWorkspaceLayout } from "@/components/layouts/DataWorkspaceLayout"
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
import { Textarea } from "@/components/ui/textarea"
import withAuth from "@/hoc/withAuth"
import { usePopWorkspace } from "@/context/PopWorkspaceContext"
import { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { periodoAfipToYmdFirstDay } from "@/lib/afipDateParse"
import { parsePadronActividadesJson } from "@/lib/padronActividadesHelpers"
import { Building2, Loader2, RefreshCw } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react"

const ACTIVIDAD_SELECT_NONE = "__none__"

function formatCuitHyphenated(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (d.length !== 11) return raw.trim()
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

function SettingsPage() {
  const router = useRouter()
  const routerRef = useRef(router)
  routerRef.current = router
  const params = useParams()
  const siteId = typeof params?.siteId === "string" ? params.siteId : ""
  const popId = typeof params?.popId === "string" ? params.popId : undefined
  const {
    bootstrap,
    loading: bootstrapLoading,
    error: bootstrapError,
    refresh: refreshBootstrap,
  } = usePopWorkspace()

  const [isOwner, setIsOwner] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pageLoading = bootstrapLoading || loading
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [padronBusy, setPadronBusy] = useState(false)

  const [form, setForm] = useState<
    PopSettingsFormInput & { fiscalPadronSyncedAt: string | null }
  >({
    name: "",
    phone: "",
    country: "",
    state: "",
    city: "",
    streetAddress: "",
    postalCode: "",
    fiscalCuit: "",
    fiscalRazonSocial: "",
    fiscalInicioActividadesDate: "",
    fiscalIngresosBrutosText: "",
    fiscalPadronActividadesJson: "",
    fiscalActividadSeleccionadaId: "",
    fiscalPadronSyncedAt: null,
  })

  const padron = usePadronAutofillRazonSocial(popId, form.fiscalCuit ?? "", {
    enabled: Boolean(popId) && isOwner && canUpdate && !pageLoading,
    suppressClear: pageLoading,
  })

  const load = useCallback(async () => {
    if (!popId || !siteId) return
    const res = await getPopSettingsPageData(popId)
    if (!res.success) {
      setError(res.error || "Error")
      if (res.redirect) {
        setTimeout(() => routerRef.current.push(res.redirect!), 1200)
      }
      return
    }
    setIsOwner(res.isOwner)
    setCanUpdate(res.canUpdate)
    setForm({
      ...res.form,
      fiscalCuit: res.form.fiscalCuit ?? "",
      fiscalRazonSocial: res.form.fiscalRazonSocial ?? "",
      fiscalInicioActividadesDate: res.form.fiscalInicioActividadesDate ?? "",
      fiscalIngresosBrutosText: res.form.fiscalIngresosBrutosText ?? "",
      fiscalPadronActividadesJson: res.form.fiscalPadronActividadesJson ?? "",
      fiscalActividadSeleccionadaId: res.form.fiscalActividadSeleccionadaId ?? "",
    })
    setError(null)
  }, [popId, siteId])

  useEffect(() => {
    if (!popId || !siteId) {
      setLoading(false)
      setError("Punto de venta no encontrado")
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await load()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [load, popId, siteId])

  const popName = bootstrap?.popName ?? form.name

  const actividadesPadronList = useMemo(
    () => parsePadronActividadesJson(form.fiscalPadronActividadesJson),
    [form.fiscalPadronActividadesJson],
  )

  useEffect(() => {
    if (!isOwner || loading) return
    if (padron.busy) return
    const hasCuit = Boolean((form.fiscalCuit ?? "").trim())
    if (!hasCuit) {
      setForm((f) => ({
        ...f,
        fiscalRazonSocial: "",
        fiscalPadronActividadesJson: "",
        fiscalActividadSeleccionadaId: "",
        fiscalInicioActividadesDate: "",
        fiscalIngresosBrutosText: "",
      }))
      return
    }
    if (!padron.razonSocial.trim()) return
    const acts = padron.fiscalActividadesPadron ?? []
    const json = acts.length ? JSON.stringify(acts) : ""
    setForm((f) => {
      const sel = f.fiscalActividadSeleccionadaId?.trim() ?? ""
      const selStillValid =
        sel.length > 0 && acts.some((a) => a.idActividad === sel)
      return {
        ...f,
        fiscalRazonSocial: padron.razonSocial,
        fiscalPadronActividadesJson: json,
        ...(selStillValid ? {} : { fiscalActividadSeleccionadaId: "" }),
      }
    })
  }, [
    padron.razonSocial,
    padron.fiscalActividadesPadron,
    padron.busy,
    isOwner,
    loading,
    form.fiscalCuit,
  ])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!popId || !siteId || !canUpdate) return
    setSaving(true)
    setBanner(null)
    const res = await updatePopSettings(popId, {
      name: form.name,
      phone: form.phone,
      country: form.country,
      state: form.state,
      city: form.city,
      streetAddress: form.streetAddress,
      postalCode: form.postalCode,
      fiscalCuit: isOwner ? form.fiscalCuit : undefined,
      fiscalRazonSocial: isOwner ? form.fiscalRazonSocial : undefined,
      fiscalInicioActividadesDate: isOwner
        ? form.fiscalInicioActividadesDate
        : undefined,
      fiscalIngresosBrutosText: isOwner
        ? form.fiscalIngresosBrutosText
        : undefined,
      fiscalPadronActividadesJson: isOwner
        ? form.fiscalPadronActividadesJson
        : undefined,
      fiscalActividadSeleccionadaId: isOwner
        ? form.fiscalActividadSeleccionadaId
        : undefined,
    })
    setSaving(false)
    if (!res.success) {
      setBanner(res.error)
      return
    }
    setBanner("Cambios guardados.")
    await Promise.all([load(), refreshBootstrap()])
  }

  const onSyncPadron = async () => {
    if (!popId || !isOwner) return
    setPadronBusy(true)
    setBanner(null)
    const res = await syncPadronForPopFiscal(popId)
    setPadronBusy(false)
    if (!res.success) {
      setBanner(res.error)
      return
    }
    setForm((f) => {
      const acts = res.fiscalActividadesPadron ?? []
      const json = acts.length ? JSON.stringify(acts) : ""
      const sel = f.fiscalActividadSeleccionadaId?.trim() ?? ""
      const selStillValid =
        sel.length > 0 && acts.some((a) => a.idActividad === sel)
      return {
        ...f,
        fiscalRazonSocial: res.razonSocial,
        fiscalPadronActividadesJson: json,
        ...(selStillValid ? {} : { fiscalActividadSeleccionadaId: "" }),
        fiscalPadronSyncedAt: new Date().toISOString(),
      }
    })
    setBanner("Datos fiscales actualizados desde el padrón.")
  }

  if (!popId || !siteId) {
    return (
      <div className="rootsy-app-light min-h-screen bg-background p-10 text-foreground">
        <p className="text-sm">Punto de venta no encontrado</p>
      </div>
    )
  }

  return (
    <DataWorkspaceLayout
      siteId={siteId}
      popId={popId}
      popName={popName}
      title="Ajustes"
      pillLabel="Configuración"
      headerVariant="dark"
      loading={pageLoading}
      userName={bootstrap?.userFullName}
      userAvatarSrc={bootstrap?.userImageUrl ?? undefined}
      userRoleLabel={bootstrap?.roleLabel}
      contentFlush
      mainMaxWidthClass="max-w-6xl"
      mainClassName="min-h-0 overflow-y-auto"
    >
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {error || bootstrapError ? (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error ?? bootstrapError}
          </div>
        ) : null}

        {!pageLoading && !error && !bootstrapError ? (
          <form
            onSubmit={(e) => void submit(e)}
            className="space-y-8"
          >
            {banner ? (
              <p
                role="status"
                className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                {banner}
              </p>
            ) : null}

            <div
              className={`grid gap-6 lg:items-start ${isOwner ? "lg:grid-cols-2" : "grid-cols-1"}`}
            >
            <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <Building2 className="size-4 text-primary" aria-hidden />
                Datos del punto
              </h2>
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="pop-name">Nombre comercial</Label>
                  <Input
                    id="pop-name"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    disabled={!canUpdate}
                    className="bg-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pop-phone">Teléfono</Label>
                  <Input
                    id="pop-phone"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    disabled={!canUpdate}
                    className="bg-background"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="pop-country">País</Label>
                    <Input
                      id="pop-country"
                      value={form.country}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, country: e.target.value }))
                      }
                      disabled={!canUpdate}
                      placeholder="AR"
                      className="bg-background"
                    />
                    <p className="text-xs text-muted-foreground">
                      Código ISO (ej. AR). Define la zona horaria para fechas y
                      horarios del local.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pop-state">Provincia / estado</Label>
                    <Input
                      id="pop-state"
                      value={form.state}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, state: e.target.value }))
                      }
                      disabled={!canUpdate}
                      className="bg-background"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pop-city">Ciudad</Label>
                  <Input
                    id="pop-city"
                    value={form.city}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, city: e.target.value }))
                    }
                    disabled={!canUpdate}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pop-street">Domicilio</Label>
                  <Input
                    id="pop-street"
                    value={form.streetAddress}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, streetAddress: e.target.value }))
                    }
                    disabled={!canUpdate}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pop-cp">Código postal</Label>
                  <Input
                    id="pop-cp"
                    value={form.postalCode}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, postalCode: e.target.value }))
                    }
                    disabled={!canUpdate}
                    className="bg-background"
                  />
                </div>
              </div>
            </section>

            {isOwner ? (
              <section className="min-w-0 rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-base font-semibold text-foreground">
                  Fiscal (titular)
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  CUIT y datos del emisor. Al escribir el CUIT o al sincronizar, el
                  padrón trae razón social y la lista de actividades. El inicio de
                  actividades y el texto de ingresos brutos los cargás vos (no vienen
                  fiables desde ARCA por rubro). Guardá para persistir en el punto.
                </p>
                <div className="mt-5 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pop-cuit">CUIT</Label>
                    <Input
                      id="pop-cuit"
                      value={form.fiscalCuit ?? ""}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, fiscalCuit: e.target.value }))
                      }
                      disabled={!canUpdate}
                      placeholder="11 dígitos sin guiones"
                      className="bg-background font-mono"
                    />
                    {padron.busy ? (
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="size-3.5 animate-spin" aria-hidden />
                        Consultando padrón…
                      </p>
                    ) : padron.error ? (
                      <p className="text-xs text-destructive">{padron.error}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-2">
                      <Label htmlFor="pop-rs">Razón social</Label>
                      <Input
                        id="pop-rs"
                        value={form.fiscalRazonSocial ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            fiscalRazonSocial: e.target.value,
                          }))
                        }
                        disabled={!canUpdate}
                        className="bg-background"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!canUpdate || padronBusy}
                      onClick={() => void onSyncPadron()}
                      className="shrink-0"
                    >
                      {padronBusy ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : (
                        <RefreshCw className="size-4" aria-hidden />
                      )}
                      <span className="ml-2">Sincronizar padrón</span>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Rubro / actividad (padrón)</Label>
                    <Select
                      value={
                        form.fiscalActividadSeleccionadaId?.trim() ||
                        ACTIVIDAD_SELECT_NONE
                      }
                      onValueChange={(v) => {
                        const id = v === ACTIVIDAD_SELECT_NONE ? "" : v
                        const act = actividadesPadronList.find(
                          (a) => a.idActividad === id,
                        )
                        const fecha =
                          act?.inicioActividadesDate?.trim() ||
                          periodoAfipToYmdFirstDay(act?.periodo)
                        setForm((f) => ({
                          ...f,
                          fiscalActividadSeleccionadaId: id,
                          ...(fecha
                            ? { fiscalInicioActividadesDate: fecha }
                            : {}),
                        }))
                      }}
                      disabled={
                        !canUpdate || actividadesPadronList.length === 0
                      }
                    >
                      <SelectTrigger className="h-auto min-h-9 w-full max-w-full bg-background py-2 text-left">
                        <SelectValue placeholder="Elegí la actividad que usás para facturar" />
                      </SelectTrigger>
                      <SelectContent className="max-w-[min(100vw-2rem,36rem)]">
                        <SelectItem value={ACTIVIDAD_SELECT_NONE}>
                          (sin seleccionar)
                        </SelectItem>
                        {actividadesPadronList.map((a) => (
                          <SelectItem
                            key={a.idActividad}
                            value={a.idActividad}
                            className="whitespace-normal"
                          >
                            {a.descripcionActividad
                              ? `${a.descripcionActividad} (${a.idActividad})`
                              : a.idActividad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {actividadesPadronList.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        Sin actividades: cargá el CUIT y esperá la consulta al padrón,
                        o usá &quot;Sincronizar padrón&quot;.
                      </p>
                    ) : null}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="pop-fiscal-inicio">Inicio de actividades</Label>
                      <p className="text-xs text-muted-foreground">
                        Suele depender del rubro. ARCA suele mandar inicio explícito o
                        el período (YYYYMM) por actividad: usamos el primer día de ese
                        mes como referencia; si no alcanza, cargá la fecha según tu
                        constancia.
                      </p>
                      <Input
                        id="pop-fiscal-inicio"
                        type="date"
                        value={form.fiscalInicioActividadesDate ?? ""}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            fiscalInicioActividadesDate: e.target.value,
                          }))
                        }
                        disabled={!canUpdate}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <div className="flex flex-wrap items-end gap-2">
                        <div className="min-w-0 flex-1 space-y-2">
                          <Label htmlFor="pop-fiscal-ib">
                            Ingresos brutos (texto libre)
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Número de inscripción por jurisdicción, situación o lo que
                            necesites en comprobantes. En muchos casos se repite el CUIT
                            con guiones.
                          </p>
                          <Textarea
                            id="pop-fiscal-ib"
                            value={form.fiscalIngresosBrutosText ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({
                                ...f,
                                fiscalIngresosBrutosText: e.target.value,
                              }))
                            }
                            disabled={!canUpdate}
                            rows={3}
                            placeholder="Ej.: 20-12345678-9 o texto según tu provincia"
                            className="min-h-18 resize-y bg-background"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          disabled={
                            !canUpdate ||
                            !(form.fiscalCuit ?? "").replace(/\D/g, "").length
                          }
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              fiscalIngresosBrutosText: formatCuitHyphenated(
                                f.fiscalCuit ?? "",
                              ),
                            }))
                          }
                          className="shrink-0 self-end"
                        >
                          Igual al CUIT
                        </Button>
                      </div>
                    </div>
                  </div>
                  {form.fiscalPadronSyncedAt ? (
                    <p className="text-xs text-muted-foreground">
                      Última sync:{" "}
                      {new Date(form.fiscalPadronSyncedAt).toLocaleString("es-AR")}
                    </p>
                  ) : null}
                </div>
              </section>
            ) : null}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!canUpdate || saving}>
                {saving ? "Guardando…" : "Guardar"}
              </Button>
            </div>
          </form>
        ) : null}
      </div>
    </DataWorkspaceLayout>
  )
}

export default withAuth(SettingsPage)
