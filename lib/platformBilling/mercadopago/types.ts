export type MercadoPagoCardToken = {
  id: string
  card_id?: string
  status?: string
  date_due?: string
  luhn_validation?: boolean
  live_mode?: boolean
  require_esc?: boolean
  card_number_length?: number
  date_created?: string
  last_four_digits?: string
  first_six_digits?: string
  security_code_length?: number
  expiration_month?: number
  expiration_year?: number
  cardholder?: {
    name?: string
    identification?: {
      type?: string
      number?: string
    }
  }
}

export type MercadoPagoPayment = {
  id: number | string
  status?: string
  status_detail?: string
  transaction_amount?: number
  currency_id?: string
  external_reference?: string
  date_approved?: string
  payer?: {
    id?: string | number
    email?: string
  }
  payment_method_id?: string
  metadata?: Record<string, unknown>
}

export type MercadoPagoWebhookPayload = {
  id?: number | string
  live_mode?: boolean
  type?: string
  action?: string
  date_created?: string
  data?: {
    id?: string | number
  }
}

export type SaveMercadoPagoCardInput = {
  organizationId: string
  cardTokenId: string
  mpPayerId?: string | null
  cardBrand?: string | null
  cardLast4?: string | null
  cardExpMonth?: number | null
  cardExpYear?: number | null
  metadata?: Record<string, unknown>
}
