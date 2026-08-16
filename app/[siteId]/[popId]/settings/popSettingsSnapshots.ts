import type { PopSettingsFormInput } from "@/app/[siteId]/[popId]/settings/actions"
import { resolveArgentinaCountryCode } from "@/lib/argentinaLocalities"
import {
  normalizeOperationalDayCloseTime,
} from "@/lib/popOperationalDay"
import type { PopSettingsSectionId } from "@/lib/popSettingsCatalog"

export type SettingsFormState = PopSettingsFormInput & {
  fiscalPadronSyncedAt: string | null
}

export function businessSettingsSnapshot(form: SettingsFormState): string {
  return JSON.stringify({
    name: form.name.trim(),
    phone: form.phone.trim(),
    country: resolveArgentinaCountryCode(form.country),
    state: form.state.trim(),
    city: form.city.trim(),
    streetAddress: form.streetAddress.trim(),
    postalCode: form.postalCode.trim(),
    operationalDayCloseTime: normalizeOperationalDayCloseTime(
      form.operationalDayCloseTime,
    ),
  })
}

export function fiscalSettingsSnapshot(form: SettingsFormState): string {
  return JSON.stringify({
    fiscalCuit: (form.fiscalCuit ?? "").trim(),
    fiscalRazonSocial: (form.fiscalRazonSocial ?? "").trim(),
    fiscalInicioActividadesDate: (form.fiscalInicioActividadesDate ?? "").trim(),
    fiscalIngresosBrutosText: (form.fiscalIngresosBrutosText ?? "").replace(
      /\D/g,
      "",
    ),
    fiscalPadronActividadesJson: form.fiscalPadronActividadesJson ?? "",
    fiscalActividadSeleccionadaId: (
      form.fiscalActividadSeleccionadaId ?? ""
    ).trim(),
  })
}

export function imagesSettingsSnapshot(form: SettingsFormState): string {
  return JSON.stringify({
    imageUrl: form.imageUrl ?? "",
    invoiceLogoUrl: form.invoiceLogoUrl ?? "",
    backgroundImageUrl: form.backgroundImageUrl ?? "",
  })
}

export function settingsSectionSnapshot(
  sectionId: PopSettingsSectionId,
  form: SettingsFormState,
): string {
  switch (sectionId) {
    case "business":
      return businessSettingsSnapshot(form)
    case "fiscal":
      return fiscalSettingsSnapshot(form)
    case "images":
      return imagesSettingsSnapshot(form)
  }
}

export function isSettingsSectionDirty(
  sectionId: PopSettingsSectionId,
  form: SettingsFormState,
  savedSnapshot: string | null,
): boolean {
  if (savedSnapshot === null) return false
  return settingsSectionSnapshot(sectionId, form) !== savedSnapshot
}
