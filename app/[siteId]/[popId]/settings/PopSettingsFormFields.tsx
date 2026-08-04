"use client"

import type { PopSettingsFormInput } from "@/app/[siteId]/[popId]/settings/actions"
import { PopSettingsImageUploadField } from "@/app/[siteId]/[popId]/settings/PopSettingsImageUploadField"
import {
  dataWorkspaceDetailCardClass,
} from "@/components/data-workspace/dataWorkspaceListStyles"
import { RootsIconButton, RootsSubtleButton } from "@/components/rootsy-button"
import {
  RootsFormDateField,
  RootsFormField,
  RootsFormPhoneField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTextField,
} from "@/components/rootsy-form"
import {
  rootsFormColumnClass,
  rootsFormFieldHintClass,
  rootsFormTextFieldClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form/rootsFormStyles"
import { Input } from "@/components/ui/input"
import type { usePadronAutofillRazonSocial } from "@/hooks/usePadronAutofillRazonSocial"
import {
  ARGENTINA_COUNTRY_CODE,
  ARGENTINA_COUNTRY_LABEL,
  ARGENTINA_PROVINCES,
  findArgentinaLocality,
  listArgentinaLocalities,
} from "@/lib/argentinaLocalities"
import { periodoAfipToYmdFirstDay } from "@/lib/afipDateParse"
import type { PadronActividadItem } from "@/lib/argentinaPadronLookup"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCw } from "lucide-react"
import { useMemo, type Dispatch, type ReactNode, type SetStateAction } from "react"

const ACTIVIDAD_SELECT_NONE = "__none__"
const PROVINCE_SELECT_NONE = "__province_none__"
const CITY_SELECT_NONE = "__city_none__"

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

function SettingsSectionCard({
  title,
  description,
  children,
  className,
  showHeaderDivider = true,
}: {
  title: string
  description?: ReactNode
  children: ReactNode
  className?: string
  showHeaderDivider?: boolean
}) {
  return (
    <article className={cn(dataWorkspaceDetailCardClass, className)}>
      <div
        className={cn(
          "flex flex-col gap-1 px-5 pt-4 pb-2 sm:px-6",
          showHeaderDivider && "border-b border-border/60 pb-3",
        )}
      >
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <div className={rootsFormFieldHintClass}>{description}</div>
        ) : null}
      </div>
      <div className="px-5 pb-5 pt-2 sm:px-6">{children}</div>
    </article>
  )
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
  const localityOptions = useMemo(
    () =>
      listArgentinaLocalities(form.state, form.city, form.postalCode).sort(
        (a, b) => a.name.localeCompare(b.name, "es"),
      ),
    [form.state, form.city, form.postalCode],
  )

  const matchedLocality = useMemo(
    () => findArgentinaLocality(form.state, form.city),
    [form.state, form.city],
  )

  const postalCodeLocked =
    Boolean(matchedLocality?.postalCode) &&
    form.postalCode === matchedLocality?.postalCode

  const provinceValue = form.state?.trim() || PROVINCE_SELECT_NONE
  const cityValue = form.city?.trim() || CITY_SELECT_NONE

  const imageFields = (
    <div className={rootsFormColumnClass}>
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
        previewCaption="Logo del negocio"
      />
      <PopSettingsImageUploadField
        id="pop-ticket-logo"
        popId={popId}
        kind="ticket-logo"
        label="Logo para tickets"
        hint="Blanco y negro, fondo blanco o transparente. Ideal para impresoras térmicas."
        emptyTitle="Agregar logo para tickets"
        emptySubtitle="Se convierte automáticamente a PNG B/N"
        value={form.invoiceLogoUrl ?? ""}
        onChange={(invoiceLogoUrl) =>
          setForm((f) => ({ ...f, invoiceLogoUrl }))
        }
        disabled={!canUpdate}
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
        previewCaption="Fondo del menú"
      />
    </div>
  )

  return (
    <div
      className={cn(
        "grid gap-6 lg:items-start",
        isOwner ? "lg:grid-cols-3" : "lg:grid-cols-2",
      )}
    >
        <SettingsSectionCard title="Datos del punto" showHeaderDivider={false}>
          <div className={rootsFormColumnClass}>
            <RootsFormTextField
              label="Nombre comercial"
              id="pop-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={!canUpdate}
              required
            />

            <RootsFormPhoneField
              id="pop-phone"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              disabled={!canUpdate}
            />

            <div className={rootsFormTwoColRowClass}>
              <RootsFormTextField
                label="País"
                id="pop-country"
                value={ARGENTINA_COUNTRY_LABEL}
                disabled
                readOnly
              />
              <RootsFormSelectField
                label="Provincia"
                id="pop-state"
                value={provinceValue}
                onValueChange={(value) => {
                  if (value === PROVINCE_SELECT_NONE) {
                    setForm((f) => ({
                      ...f,
                      country: ARGENTINA_COUNTRY_CODE,
                      state: "",
                      city: "",
                      postalCode: "",
                    }))
                    return
                  }
                  setForm((f) => ({
                    ...f,
                    country: ARGENTINA_COUNTRY_CODE,
                    state: value,
                    city: "",
                    postalCode: "",
                  }))
                }}
                disabled={!canUpdate}
                placeholder="Elegí una provincia"
              >
                <RootsFormSelectItem value={PROVINCE_SELECT_NONE}>
                  (sin seleccionar)
                </RootsFormSelectItem>
                {ARGENTINA_PROVINCES.map((province) => (
                  <RootsFormSelectItem key={province.name} value={province.name}>
                    {province.name}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectField>
            </div>

            <div className={rootsFormTwoColRowClass}>
              <RootsFormSelectField
                label="Ciudad"
                id="pop-city"
                value={cityValue}
                onValueChange={(value) => {
                  if (value === CITY_SELECT_NONE) {
                    setForm((f) => ({ ...f, city: "", postalCode: "" }))
                    return
                  }
                  const locality = findArgentinaLocality(form.state, value)
                  setForm((f) => ({
                    ...f,
                    city: value,
                    postalCode: locality?.postalCode ?? f.postalCode,
                  }))
                }}
                disabled={!canUpdate || !form.state?.trim()}
                placeholder={
                  form.state?.trim()
                    ? "Elegí una ciudad"
                    : "Seleccioná una provincia primero"
                }
              >
                <RootsFormSelectItem value={CITY_SELECT_NONE}>
                  (sin seleccionar)
                </RootsFormSelectItem>
                {localityOptions.map((locality) => (
                  <RootsFormSelectItem key={locality.name} value={locality.name}>
                    {locality.name}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectField>

              <RootsFormTextField
                label="Código postal"
                id="pop-cp"
                value={form.postalCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, postalCode: e.target.value }))
                }
                disabled={!canUpdate || postalCodeLocked}
              />
            </div>

            <RootsFormTextField
              label="Domicilio"
              id="pop-street"
              value={form.streetAddress}
              onChange={(e) =>
                setForm((f) => ({ ...f, streetAddress: e.target.value }))
              }
              disabled={!canUpdate}
            />
          </div>
        </SettingsSectionCard>

        {isOwner ? (
          <SettingsSectionCard
            title="Datos fiscales"
            showHeaderDivider={false}
            description="Estos datos se utilizan para facturar en este punto de venta."
          >
            <div className={rootsFormColumnClass}>
              <RootsFormField
                label="CUIT"
                htmlFor="pop-cuit"
                error={padron.error ?? undefined}
                hint={
                  padron.busy ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      Consultando padrón…
                    </span>
                  ) : undefined
                }
              >
                <div className="flex items-center gap-2">
                  <Input
                    id="pop-cuit"
                    value={form.fiscalCuit ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, fiscalCuit: e.target.value }))
                    }
                    disabled={!canUpdate}
                    placeholder="11 dígitos sin guiones"
                    className={cn(rootsFormTextFieldClass, "min-w-0 flex-1")}
                  />
                  <RootsIconButton
                    tone="secondary"
                    surface="light"
                    size="compact"
                    label="Sincronizar padrón"
                    disabled={!canUpdate || padronBusy}
                    onClick={onSyncPadron}
                    className="shrink-0"
                  >
                    {padronBusy ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <RefreshCw className="size-4" aria-hidden />
                    )}
                  </RootsIconButton>
                </div>
              </RootsFormField>

              <RootsFormTextField
                label="Razón social"
                id="pop-rs"
                value={form.fiscalRazonSocial ?? ""}
                disabled
                readOnly
              />

              <RootsFormSelectField
                label="Rubro"
                id="pop-actividad"
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
                placeholder="Elegí la actividad que usás para facturar"
              >
                <RootsFormSelectItem value={ACTIVIDAD_SELECT_NONE}>
                  (sin seleccionar)
                </RootsFormSelectItem>
                {actividadesPadronList.map((a) => (
                  <RootsFormSelectItem key={a.idActividad} value={a.idActividad}>
                    {a.descripcionActividad
                      ? `${a.descripcionActividad} (${a.idActividad})`
                      : a.idActividad}
                  </RootsFormSelectItem>
                ))}
              </RootsFormSelectField>

              <RootsFormDateField
                label="Inicio de actividad"
                id="pop-fiscal-inicio"
                value={form.fiscalInicioActividadesDate ?? ""}
                onChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    fiscalInicioActividadesDate: value,
                  }))
                }
                disabled={!canUpdate}
                hint="Cargá la fecha según tu constancia."
              />

              <RootsFormField label="Ingresos brutos" htmlFor="pop-fiscal-ib">
                <div className="flex items-center gap-2">
                  <Input
                    id="pop-fiscal-ib"
                    value={(form.fiscalIngresosBrutosText ?? "").replace(/\D/g, "")}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        fiscalIngresosBrutosText: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    disabled={!canUpdate}
                    inputMode="numeric"
                    placeholder="30715581759"
                    className={cn(rootsFormTextFieldClass, "min-w-0 flex-1")}
                  />
                  <RootsSubtleButton
                    type="button"
                    disabled={
                      !canUpdate ||
                      !(form.fiscalCuit ?? "").replace(/\D/g, "").length
                    }
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        fiscalIngresosBrutosText: (f.fiscalCuit ?? "").replace(
                          /\D/g,
                          "",
                        ),
                      }))
                    }
                    className="shrink-0"
                  >
                    Igual al CUIT
                  </RootsSubtleButton>
                </div>
              </RootsFormField>
            </div>
          </SettingsSectionCard>
        ) : null}

      <SettingsSectionCard
        title="Imágenes del POP"
        showHeaderDivider={false}
        className="min-w-0"
      >
        {imageFields}
      </SettingsSectionCard>
    </div>
  )
}
