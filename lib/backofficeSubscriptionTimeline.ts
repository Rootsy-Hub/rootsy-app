export type BackofficeExtraModule = {
  key: string
  label: string
  priceMonthly: number
}

export type BackofficeTimelineEntry = {
  id: string
  kind: "event" | "invoice"
  occurredAt: string
  title: string
  summary: string
  payload: Record<string, unknown>
}

const EVENT_TITLES: Record<string, string> = {
  pop_created: "POP creado",
  trial_started: "Prueba gratis iniciada",
  plan_changed: "Cambio de plan",
  extra_module_added: "Módulo extra agregado",
  extra_module_removed: "Módulo extra dado de baja",
  payment_received: "Pago registrado",
  subscription_canceled: "Subscripción cancelada",
}

function formatMoney(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return "—"
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(n)
}

function formatPeriod(start: unknown, end: unknown): string | null {
  if (typeof start !== "string" || typeof end !== "string") return null
  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("es-AR", { dateStyle: "short" }).format(
      new Date(iso),
    )
  return `${fmt(start)} → ${fmt(end)}`
}

function parseExtraModules(raw: unknown): BackofficeExtraModule[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (entry): entry is Record<string, unknown> =>
        typeof entry === "object" && entry != null,
    )
    .map((entry) => ({
      key: String(entry.key ?? ""),
      label: String(entry.label ?? entry.key ?? ""),
      priceMonthly: Number(entry.price_monthly ?? 0),
    }))
    .filter((entry) => entry.key.length > 0)
}

export function parseBackofficeExtraModules(raw: unknown): BackofficeExtraModule[] {
  return parseExtraModules(raw)
}

function summarizeEvent(eventType: string, payload: Record<string, unknown>): string {
  switch (eventType) {
    case "pop_created":
      return `${payload.business_type_display_name ?? payload.business_type_name ?? "Tipo"} · ${payload.owner_name ?? "Owner"}`
    case "trial_started":
      return [
        payload.plan_display_name ?? payload.plan_name,
        formatPeriod(payload.period_start, payload.period_end),
      ]
        .filter(Boolean)
        .join(" · ")
    case "plan_changed": {
      const from = payload.from_plan_display_name ?? payload.from_plan
      const to = payload.to_plan_display_name ?? payload.to_plan
      const extras = parseExtraModules(payload.extra_modules)
      const parts = [`${from} → ${to}`]
      if (extras.length > 0) {
        parts.push(
          `${extras.length} extra${extras.length === 1 ? "" : "s"} (${formatMoney(payload.total_price_monthly)}/mes)`,
        )
      }
      const period = formatPeriod(payload.period_start, payload.period_end)
      if (period) parts.push(period)
      const proration = payload.proration as Record<string, unknown> | undefined
      if (proration?.credit_amount != null) {
        parts.push(
          `Crédito prorrateo ${formatMoney(proration.credit_amount)} (${proration.days_remaining}/${proration.days_in_period} días)`,
        )
      }
      return parts.join(" · ")
    }
    case "extra_module_added":
      return String(payload.label ?? payload.key ?? "Módulo")
    case "extra_module_removed":
      return String(payload.label ?? payload.key ?? "Módulo")
    case "payment_received": {
      const lineItems = Array.isArray(payload.line_items) ? payload.line_items : []
      const extraCount = lineItems.filter((entry) => {
        if (typeof entry !== "object" || entry == null) return false
        const label = String((entry as Record<string, unknown>).label ?? "")
        return label.toLowerCase().includes("extra")
      }).length
      const parts = [
        formatMoney(payload.amount),
        payload.plan_display_name ? `Plan ${payload.plan_display_name}` : null,
        extraCount > 0
          ? `${extraCount} extra${extraCount === 1 ? "" : "s"}`
          : null,
        payload.payment_method === "manual"
          ? "Pago manual"
          : String(payload.payment_method ?? ""),
        payload.payment_reference ? `Ref. ${payload.payment_reference}` : null,
      ]
      if (payload.credit_amount != null) {
        parts.push(`Crédito ${formatMoney(payload.credit_amount)}`)
      }
      return parts.filter(Boolean).join(" · ")
    }
    default:
      return Object.keys(payload).length > 0 ? JSON.stringify(payload) : ""
  }
}

function summarizeInvoice(payload: Record<string, unknown>): string {
  const parts = [formatMoney(payload.amount)]
  if (payload.status === "paid" && payload.paidAt) {
    parts.push("Pagado")
  }
  if (payload.paymentMethod === "manual") {
    parts.push("Manual")
  }
  const proration = payload.proration as Record<string, unknown> | undefined
  if (proration?.credit_amount != null) {
    parts.push(`Crédito ${formatMoney(proration.credit_amount)}`)
  }
  const period = formatPeriod(payload.periodStart, payload.periodEnd)
  if (period) parts.push(period)
  return parts.filter(Boolean).join(" · ")
}

export function buildBackofficeTimeline(
  events: Array<{
    id: string
    eventType: string
    payload: Record<string, unknown>
    createdAt: string
  }>,
  invoices: Array<{
    id: string
    amount: number
    status: string
    paymentMethod: string
    paidAt: string | null
    periodStart: string
    periodEnd: string
    metadata: Record<string, unknown>
    createdAt: string
    planDisplayName: string
  }>,
): BackofficeTimelineEntry[] {
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]))

  const eventEntries: BackofficeTimelineEntry[] = events.map((event) => {
    let payload = event.payload

    if (event.eventType === "payment_received") {
      const invoiceId =
        typeof payload.invoice_id === "string" ? payload.invoice_id : null
      const invoice = invoiceId ? invoiceById.get(invoiceId) : undefined
      if (invoice) {
        payload = {
          ...payload,
          line_items: invoice.metadata.line_items ?? payload.line_items,
          proration: invoice.metadata.proration ?? payload.proration,
          gross_amount: invoice.metadata.gross_amount ?? payload.gross_amount,
          period_start: invoice.periodStart,
          period_end: invoice.periodEnd,
        }
      }
    }

    return {
      id: `event-${event.id}`,
      kind: "event",
      occurredAt: event.createdAt,
      title: EVENT_TITLES[event.eventType] ?? event.eventType,
      summary: summarizeEvent(event.eventType, payload),
      payload,
    }
  })

  const invoiceEntries: BackofficeTimelineEntry[] = invoices.map((invoice) => ({
    id: `invoice-${invoice.id}`,
    kind: "invoice",
    occurredAt: invoice.paidAt ?? invoice.createdAt,
    title: `Factura · ${invoice.planDisplayName}`,
    summary: summarizeInvoice({
      amount: invoice.amount,
      status: invoice.status,
      paidAt: invoice.paidAt,
      paymentMethod: invoice.paymentMethod,
      periodStart: invoice.periodStart,
      periodEnd: invoice.periodEnd,
      proration: invoice.metadata.proration,
    }),
    payload: {
      ...invoice.metadata,
      amount: invoice.amount,
      status: invoice.status,
      payment_method: invoice.paymentMethod,
      paid_at: invoice.paidAt,
      period_start: invoice.periodStart,
      period_end: invoice.periodEnd,
      plan_display_name: invoice.planDisplayName,
    },
  }))

  return [...eventEntries, ...invoiceEntries].sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  )
}
