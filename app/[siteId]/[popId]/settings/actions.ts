export type PopSettingsFormInput = {
  name: string
  phone: string
  country: string
  state: string
  city: string
  streetAddress: string
  postalCode: string
  imageUrl?: string | null
  invoiceLogoUrl?: string | null
  backgroundImageUrl?: string | null
  fiscalCuit?: string | null
  fiscalRazonSocial?: string | null
  /** YYYY-MM-DD */
  fiscalInicioActividadesDate?: string | null
  fiscalIngresosBrutosText?: string | null
  /** JSON stringificado de PadronActividadItem[] */
  fiscalPadronActividadesJson?: string | null
  fiscalActividadSeleccionadaId?: string | null
  /** HH:mm — cierre del día operativo (default 00:00). */
  operationalDayCloseTime?: string | null
}

export type PopSettingsBusinessInput = Pick<
  PopSettingsFormInput,
  | "name"
  | "phone"
  | "country"
  | "state"
  | "city"
  | "streetAddress"
  | "postalCode"
  | "operationalDayCloseTime"
>

export type PopSettingsFiscalInput = Pick<
  PopSettingsFormInput,
  | "fiscalCuit"
  | "fiscalRazonSocial"
  | "fiscalInicioActividadesDate"
  | "fiscalIngresosBrutosText"
  | "fiscalPadronActividadesJson"
  | "fiscalActividadSeleccionadaId"
>

export type PopSettingsImagesInput = Pick<
  PopSettingsFormInput,
  "imageUrl" | "invoiceLogoUrl" | "backgroundImageUrl"
>

export type PopSettingsPageForm = PopSettingsFormInput & {
  fiscalPadronSyncedAt: string | null
}
