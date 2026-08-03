"use client"

import type { PopSettingsFormInput } from "@/app/[siteId]/[popId]/settings/actions"
import { PopSettingsImageUploadField } from "@/app/[siteId]/[popId]/settings/PopSettingsImageUploadField"
import {
  popSettingsFormColumnClass,
  popSettingsFormDateFieldClass,
  popSettingsFormFieldStackClass,
  popSettingsFormSelectContentClass,
  popSettingsFormSelectItemClass,
  popSettingsFormSelectTriggerClass,
  popSettingsFormTextFieldClass,
  popSettingsFormTextareaClass,
  popSettingsFormTwoColRowClass,
} from "@/app/[siteId]/[popId]/settings/popSettingsConstants"
import {
  CheckoutFieldHint,
  CheckoutSectionLabel,
  CheckoutSectionPanel,
} from "@/components/checkout/CheckoutFormFields"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import { periodoAfipToYmdFirstDay } from "@/lib/afipDateParse"
import { formatLocaleDateTime } from "@/lib/popTimezone"
import type { PadronActividadItem } from "@/lib/argentinaPadronLookup"
import { Building2, ImageIcon, Loader2, RefreshCw } from "lucide-react"
import type { Dispatch, SetStateAction } from "react"

const ACTIVIDAD_SELECT_NONE = "__none__"

function formatCuitHyphenated(raw: string): string {
  const d = raw.replace(/\D/g, "")
  if (d.length !== 11) return raw.trim()
  return `${d.slice(0, 2)}-${d.slice(2, 10)}-${d.slice(10)}`
}

type FormState = PopSettingsFormInput & { fiscalPadronSyncedAt: string | null }

type Props = {
  popId: string
  form: FormState
  setForm: Dispatch<SetStateAction<FormState>>
  canUpdate: boolean
  isOwner: boolean
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
  padronBusy: boolean
  onSyncPadron: () => void
  actividadesPadronList: PadronActividadItem[]
}

export function PopSettingsFormFields({
  popId,
  form,
  setForm,
  canUpdate,
  isOwner,
  padron,
  padronBusy,
  onSyncPadron,
  actividadesPadronList,
}: Props) {
  return (
    <div className="space-y-6">
      <div
        className={`grid gap-6 lg:items-start ${isOwner ? "lg:grid-cols-2" : "grid-cols-1"}`}
      >
        <CheckoutSectionPanel className="bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Building2 className="size-4 text-primary" aria-hidden />
            Datos del punto
          </h2>
          <div className={`mt-5 ${popSettingsFormColumnClass}`}>
            <div className={popSettingsFormFieldStackClass}>
              <CheckoutSectionLabel>Nombre comercial</CheckoutSectionLabel>
              <input
                id="pop-name"
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                disabled={!canUpdate}
                className={popSettingsFormTextFieldClass}
                required
              />
            </div>

            <div className={popSettingsFormFieldStackClass}>
              <CheckoutSectionLabel>Teléfono</CheckoutSectionLabel>
              <input
                id="pop-phone"
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
                disabled={!canUpdate}
                className={popSettingsFormTextFieldClass}
              />
            </div>

            <div className={popSettingsFormTwoColRowClass}>
              <div className={popSettingsFormFieldStackClass}>
                <CheckoutSectionLabel>País</CheckoutSectionLabel>
                <input
                  id="pop-country"
                  value={form.country}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, country: e.target.value }))
                  }
                  disabled={!canUpdate}
                  placeholder="AR"
                  className={popSettingsFormTextFieldClass}
                />
                <CheckoutFieldHint>
                  Código ISO (ej. AR). Define la zona horaria para fechas y
                  horarios del local.
                </CheckoutFieldHint>
              </div>
              <div className={popSettingsFormFieldStackClass}>
                <CheckoutSectionLabel>Provincia / estado</CheckoutSectionLabel>
                <input
                  id="pop-state"
                  value={form.state}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, state: e.target.value }))
                  }
                  disabled={!canUpdate}
                  className={popSettingsFormTextFieldClass}
                />
              </div>
            </div>

            <div className={popSettingsFormFieldStackClass}>
              <CheckoutSectionLabel>Ciudad</CheckoutSectionLabel>
              <input
                id="pop-city"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                disabled={!canUpdate}
                className={popSettingsFormTextFieldClass}
              />
            </div>

            <div className={popSettingsFormFieldStackClass}>
              <CheckoutSectionLabel>Domicilio</CheckoutSectionLabel>
              <input
                id="pop-street"
                value={form.streetAddress}
                onChange={(e) =>
                  setForm((f) => ({ ...f, streetAddress: e.target.value }))
                }
                disabled={!canUpdate}
                className={popSettingsFormTextFieldClass}
              />
            </div>

            <div className={popSettingsFormFieldStackClass}>
              <CheckoutSectionLabel>Código postal</CheckoutSectionLabel>
              <input
                id="pop-cp"
                value={form.postalCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postalCode: e.target.value }))
                }
                disabled={!canUpdate}
                className={popSettingsFormTextFieldClass}
              />
            </div>
          </div>
        </CheckoutSectionPanel>

        {isOwner ? (
          <CheckoutSectionPanel className="bg-card p-5 shadow-sm">
            <h2 className="text-base font-semibold text-foreground">
              Fiscal (titular)
            </h2>
            <CheckoutFieldHint>
              CUIT y datos del emisor. Al escribir el CUIT o al sincronizar, el
              padrón trae razón social y la lista de actividades. El inicio de
              actividades y el texto de ingresos brutos los cargás vos (no vienen
              fiables desde ARCA por rubro). Guardá para persistir en el punto.
            </CheckoutFieldHint>
            <div className={`mt-5 ${popSettingsFormColumnClass}`}>
              <div className={popSettingsFormFieldStackClass}>
                <CheckoutSectionLabel>CUIT</CheckoutSectionLabel>
                <input
                  id="pop-cuit"
                  value={form.fiscalCuit ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, fiscalCuit: e.target.value }))
                  }
                  disabled={!canUpdate}
                  placeholder="11 dígitos sin guiones"
                  className={popSettingsFormTextFieldClass}
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
                <div className={`min-w-0 flex-1 ${popSettingsFormFieldStackClass}`}>
                  <CheckoutSectionLabel>Razón social</CheckoutSectionLabel>
                  <input
                    id="pop-rs"
                    value={form.fiscalRazonSocial ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fiscalRazonSocial: e.target.value,
                      }))
                    }
                    disabled={!canUpdate}
                    className={popSettingsFormTextFieldClass}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!canUpdate || padronBusy}
                  onClick={onSyncPadron}
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

              <div className={popSettingsFormFieldStackClass}>
                <CheckoutSectionLabel>Rubro / actividad (padrón)</CheckoutSectionLabel>
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
                      ...(fecha ? { fiscalInicioActividadesDate: fecha } : {}),
                    }))
                  }}
                  disabled={!canUpdate || actividadesPadronList.length === 0}
                >
                  <SelectTrigger className={popSettingsFormSelectTriggerClass}>
                    <SelectValue placeholder="Elegí la actividad que usás para facturar" />
                  </SelectTrigger>
                  <SelectContent className={popSettingsFormSelectContentClass}>
                    <SelectItem
                      value={ACTIVIDAD_SELECT_NONE}
                      className={popSettingsFormSelectItemClass}
                    >
                      (sin seleccionar)
                    </SelectItem>
                    {actividadesPadronList.map((a) => (
                      <SelectItem
                        key={a.idActividad}
                        value={a.idActividad}
                        className={popSettingsFormSelectItemClass}
                      >
                        {a.descripcionActividad
                          ? `${a.descripcionActividad} (${a.idActividad})`
                          : a.idActividad}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {actividadesPadronList.length === 0 ? (
                  <CheckoutFieldHint>
                    Sin actividades: cargá el CUIT y esperá la consulta al padrón,
                    o usá &quot;Sincronizar padrón&quot;.
                  </CheckoutFieldHint>
                ) : null}
              </div>

              <div className={popSettingsFormTwoColRowClass}>
                <div className={popSettingsFormFieldStackClass}>
                  <CheckoutSectionLabel>Inicio de actividades</CheckoutSectionLabel>
                  <CheckoutFieldHint>
                    Suele depender del rubro. ARCA suele mandar inicio explícito o
                    el período (YYYYMM) por actividad: usamos el primer día de ese
                    mes como referencia; si no alcanza, cargá la fecha según tu
                    constancia.
                  </CheckoutFieldHint>
                  <input
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
                    className={popSettingsFormDateFieldClass}
                  />
                </div>
              </div>

              <div className={popSettingsFormFieldStackClass}>
                <div className="flex flex-wrap items-end gap-2">
                  <div className="min-w-0 flex-1 space-y-2">
                    <CheckoutSectionLabel>
                      Ingresos brutos (texto libre)
                    </CheckoutSectionLabel>
                    <CheckoutFieldHint>
                      Número de inscripción por jurisdicción, situación o lo que
                      necesites en comprobantes. En muchos casos se repite el CUIT
                      con guiones.
                    </CheckoutFieldHint>
                    <textarea
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
                      className={popSettingsFormTextareaClass}
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

              {form.fiscalPadronSyncedAt ? (
                <CheckoutFieldHint>
                  Última sync:{" "}
                  {formatLocaleDateTime(form.fiscalPadronSyncedAt)}
                </CheckoutFieldHint>
              ) : null}
            </div>
          </CheckoutSectionPanel>
        ) : null}
      </div>

      <CheckoutSectionPanel className="bg-card p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <ImageIcon className="size-4 text-primary" aria-hidden />
          Imágenes del punto
        </h2>
        <CheckoutFieldHint>
          Las imágenes se suben al elegirlas; guardá el formulario para persistir
          los cambios. El logo de ticket se convierte a blanco y negro con fondo
          transparente para impresoras térmicas.
        </CheckoutFieldHint>
        <div className="mt-5 grid w-full min-w-0 gap-5 lg:grid-cols-3">
          <PopSettingsImageUploadField
            id="pop-logo"
            popId={popId}
            kind="logo"
            label="Logo del negocio"
            hint="Se muestra en el menú del POP y en la app."
            emptyTitle="Agregar logo del negocio"
            emptySubtitle="Cuadrado o circular · se optimiza a WebP"
            value={form.imageUrl ?? ""}
            onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))}
            disabled={!canUpdate}
            previewAspectClass="aspect-square max-w-[220px]"
            previewObjectFit="contain"
            previewCaption="Logo del negocio"
          />
          <PopSettingsImageUploadField
            id="pop-ticket-logo"
            popId={popId}
            kind="ticket-logo"
            label="Logo para tickets"
            hint="Blanco y negro, fondo blanco o transparente. Ideal para impresoras láser/térmicas de tickets."
            emptyTitle="Agregar logo para tickets"
            emptySubtitle="Se convierte automáticamente a PNG B/N"
            value={form.invoiceLogoUrl ?? ""}
            onChange={(invoiceLogoUrl) =>
              setForm((f) => ({ ...f, invoiceLogoUrl }))
            }
            disabled={!canUpdate}
            previewAspectClass="aspect-[3/2]"
            previewObjectFit="contain"
            previewCheckerboard
            previewCaption="Logo para tickets"
          />
          <PopSettingsImageUploadField
            id="pop-menu-bg"
            popId={popId}
            kind="menu-background"
            label="Fondo del menú"
            hint="Imagen de fondo de la pantalla principal del menú del POP."
            emptyTitle="Agregar fondo del menú"
            emptySubtitle="Horizontal · se optimiza a WebP"
            value={form.backgroundImageUrl ?? ""}
            onChange={(backgroundImageUrl) =>
              setForm((f) => ({ ...f, backgroundImageUrl }))
            }
            disabled={!canUpdate}
            previewAspectClass="aspect-video"
            previewObjectFit="cover"
            previewCaption="Fondo del menú"
          />
        </div>
      </CheckoutSectionPanel>
    </div>
  )
}
