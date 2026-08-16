"use client"

import type { SettingsFormState } from "@/app/[siteId]/[popId]/settings/popSettingsSnapshots"
import { PopSettingsImageUploadField } from "@/app/[siteId]/[popId]/settings/PopSettingsImageUploadField"
import {
  statisticsSectionPageSubtitleClass,
  statisticsSectionPageTitleClass,
} from "@/components/statistics/statisticsWorkspaceStyles"
import { RootsPrimaryButton } from "@/components/rootsy-button"
import { RootsBanner } from "@/components/rootsy-banner"
import {
  RootsFormDateField,
  RootsFormPhoneField,
  RootsFormSelectField,
  RootsFormSelectItem,
  RootsFormTaxDocumentField,
  RootsFormTextField,
  RootsFormTimeField,
} from "@/components/rootsy-form"
import {
  rootsFormColumnClass,
  rootsFormTwoColRowClass,
} from "@/components/rootsy-form/rootsFormStyles"
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
import { formatPadronErrorForUser } from "@/lib/padronUserFacingError"
import {
  popSettingsSectionById,
  type PopSettingsSectionId,
} from "@/lib/popSettingsCatalog"
import { DEFAULT_OPERATIONAL_DAY_CLOSE_TIME } from "@/lib/popOperationalDay"
import {
  useMemo,
  type Dispatch,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
} from "react"

const ACTIVIDAD_SELECT_NONE = "__none__"
const PROVINCE_SELECT_NONE = "__province_none__"
const CITY_SELECT_NONE = "__city_none__"

type SectionBanner = {
  message: string
  intent: "success" | "danger"
}

type Props = {
  popId: string
  form: SettingsFormState
  setForm: Dispatch<SetStateAction<SettingsFormState>>
  canUpdate: boolean
  activeSectionId: PopSettingsSectionId
  padron: ReturnType<typeof usePadronAutofillRazonSocial>
  actividadesPadronList: PadronActividadItem[]
  saving: boolean
  isDirty: boolean
  banner: SectionBanner | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function SettingsSectionForm({
  children,
  canUpdate,
  saving,
  isDirty,
  banner,
  onSubmit,
}: {
  children: ReactNode
  canUpdate: boolean
  saving: boolean
  isDirty: boolean
  banner: SectionBanner | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {banner ? (
        <RootsBanner intent={banner.intent} layout="message" message={banner.message} />
      ) : null}
      {children}
      <div className="flex justify-end border-t border-[var(--rootsy-bruma-200)] pt-5">
        <RootsPrimaryButton
          type="submit"
          disabled={!canUpdate || saving || !isDirty}
        >
          {saving ? "Guardando…" : "Guardar"}
        </RootsPrimaryButton>
      </div>
    </form>
  )
}

export function PopSettingsFormFields({
  popId,
  form,
  setForm,
  canUpdate,
  activeSectionId,
  padron,
  actividadesPadronList,
  saving,
  isDirty,
  banner,
  onSubmit,
}: Props) {
  const section = popSettingsSectionById(activeSectionId)

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

  const fiscalCuitDigits = (form.fiscalCuit ?? "").replace(/\D/g, "")

  const handlePadronLookup = () => {
    void padron.lookup(form.fiscalCuit ?? "")
  }

  if (!section) return null

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-1.5">
        <h2 className={statisticsSectionPageTitleClass}>{section.label}</h2>
        <p className={statisticsSectionPageSubtitleClass}>{section.description}</p>
      </header>

      {activeSectionId === "business" ? (
        <SettingsSectionForm
          canUpdate={canUpdate}
          saving={saving}
          isDirty={isDirty}
          banner={banner}
          onSubmit={onSubmit}
        >
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

          <RootsFormTimeField
            label="Hora de cierre del día operativo"
            id="pop-operational-day-close"
            value={form.operationalDayCloseTime ?? DEFAULT_OPERATIONAL_DAY_CLOSE_TIME}
            fallbackValue={DEFAULT_OPERATIONAL_DAY_CLOSE_TIME}
            onChange={(operationalDayCloseTime) =>
              setForm((f) => ({ ...f, operationalDayCloseTime }))
            }
            disabled={!canUpdate}
            hint="Define la hora en que cierra el día operativo. Ej.: con 08:00, lo vendido entre las 08:00 y las 07:59 del día siguiente pertenece al mismo día operativo; una venta a las 03:00 del martes se imputa al lunes."
          />
          </div>
        </SettingsSectionForm>
      ) : null}

      {activeSectionId === "fiscal" ? (
        <SettingsSectionForm
          canUpdate={canUpdate}
          saving={saving}
          isDirty={isDirty}
          banner={banner}
          onSubmit={onSubmit}
        >
          <div className={rootsFormColumnClass}>
          <RootsFormTaxDocumentField
            label="CUIT"
            id="pop-cuit"
            value={form.fiscalCuit ?? ""}
            onChange={(fiscalCuit) => {
              const prevDigits = (form.fiscalCuit ?? "").replace(/\D/g, "")
              const nextDigits = fiscalCuit.replace(/\D/g, "")
              if (prevDigits === nextDigits) {
                setForm((f) => ({ ...f, fiscalCuit }))
                return
              }
              setForm((f) => ({
                ...f,
                fiscalCuit,
                fiscalRazonSocial: "",
                fiscalPadronActividadesJson: "",
                fiscalActividadSeleccionadaId: "",
                fiscalInicioActividadesDate: "",
              }))
            }}
            valueMode="cuit_only"
            placeholder="30-12345678-9"
            disabled={!canUpdate}
            error={
              padron.error ? formatPadronErrorForUser(padron.error) : undefined
            }
            action={{
              label: "Consultar ARCA",
              loadingLabel: "Consultando",
              onClick: handlePadronLookup,
              disabled: !padron.canLookup,
              loading: padron.busy,
            }}
          />

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
              form.fiscalActividadSeleccionadaId?.trim() || ACTIVIDAD_SELECT_NONE
            }
            onValueChange={(v) => {
              const id = v === ACTIVIDAD_SELECT_NONE ? "" : v
              const act = actividadesPadronList.find((a) => a.idActividad === id)
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

          <RootsFormTaxDocumentField
            label="Ingresos brutos"
            id="pop-fiscal-ib"
            value={form.fiscalIngresosBrutosText ?? ""}
            onChange={(fiscalIngresosBrutosText) =>
              setForm((f) => ({ ...f, fiscalIngresosBrutosText }))
            }
            valueMode="digits_only"
            placeholder="30715581759"
            disabled={!canUpdate}
            action={{
              label: "Igual al CUIT",
              onClick: () =>
                setForm((f) => ({
                  ...f,
                  fiscalIngresosBrutosText: fiscalCuitDigits,
                })),
              disabled: !canUpdate || !fiscalCuitDigits.length,
            }}
          />
          </div>
        </SettingsSectionForm>
      ) : null}

      {activeSectionId === "images" ? (
        <SettingsSectionForm
          canUpdate={canUpdate}
          saving={saving}
          isDirty={isDirty}
          banner={banner}
          onSubmit={onSubmit}
        >
          <div className={rootsFormColumnClass}>
          <PopSettingsImageUploadField
            id="pop-logo"
            popId={popId}
            kind="logo"
        label="Logo del negocio"
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
            hint="Imagen de fondo de la pantalla principal del menú."
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
        </SettingsSectionForm>
      ) : null}
    </div>
  )
}
