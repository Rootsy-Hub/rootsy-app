"use client"

import type { BackofficePopDetail } from "@/app/backoffice/actions"
import {
  BackofficeStatusBadge,
  formatBackofficeDate,
  formatBackofficeMoney,
} from "@/app/backoffice/components/BackofficeSection"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  Receipt,
  Sparkles,
  Store,
  User,
} from "lucide-react"
import type { ReactNode } from "react"

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase()
}

function InfoRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground sm:text-right">{children}</dd>
    </div>
  )
}

function TimelinePayloadDetails({
  payload,
}: {
  payload: Record<string, unknown>
}) {
  const lineItems = Array.isArray(payload.line_items) ? payload.line_items : null
  const proration =
    payload.proration && typeof payload.proration === "object"
      ? (payload.proration as Record<string, unknown>)
      : null
  const extras = Array.isArray(payload.extra_modules)
    ? payload.extra_modules
    : null

  if (!lineItems && !proration && !extras) return null

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs">
      {extras ? (
        <div>
          <p className="font-semibold text-muted-foreground">Extras</p>
          <ul className="mt-1 space-y-1">
            {extras.map((entry, index) => {
              if (typeof entry !== "object" || entry == null) return null
              const mod = entry as Record<string, unknown>
              return (
                <li key={String(mod.key ?? index)}>
                  {String(mod.label ?? mod.key)} ·{" "}
                  {formatBackofficeMoney(Number(mod.price_monthly ?? 0))}/mes
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
      {lineItems ? (
        <div>
          <p className="font-semibold text-muted-foreground">Detalle del pago</p>
          <ul className="mt-1 space-y-1">
            {lineItems.map((entry, index) => {
              if (typeof entry !== "object" || entry == null) return null
              const line = entry as Record<string, unknown>
              return (
                <li key={index} className="flex justify-between gap-4">
                  <span>{String(line.label ?? "Ítem")}</span>
                  <span>{formatBackofficeMoney(Number(line.amount ?? 0))}</span>
                </li>
              )
            })}
            {!proration ? (
              <li className="flex justify-between gap-4 border-t border-border/50 pt-2 font-semibold">
                <span>Total</span>
                <span>
                  {formatBackofficeMoney(Number(payload.amount ?? 0))}
                </span>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
      {proration ? (
        <div>
          <p className="font-semibold text-muted-foreground">Prorrateo</p>
          <ul className="mt-1 space-y-1">
            {payload.gross_amount != null ? (
              <li className="flex justify-between gap-4">
                <span>Subtotal</span>
                <span>{formatBackofficeMoney(Number(payload.gross_amount))}</span>
              </li>
            ) : null}
            <li className="flex justify-between gap-4 text-emerald-700">
              <span>
                Crédito ({String(proration.days_remaining ?? "—")}/
                {String(proration.days_in_period ?? "—")} días)
              </span>
              <span>
                −{formatBackofficeMoney(Number(proration.credit_amount ?? 0))}
              </span>
            </li>
            <li className="flex justify-between gap-4 border-t border-border/50 pt-2 font-semibold">
              <span>Total cobrado</span>
              <span>{formatBackofficeMoney(Number(payload.amount ?? 0))}</span>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export function BackofficePopDetailView({
  detail,
  onBack,
}: {
  detail: BackofficePopDetail
  onBack: () => void
}) {
  const sub = detail.subscription

  return (
    <div className="space-y-8">
      <div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-4 gap-2 px-0 hover:bg-transparent"
          onClick={onBack}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Volver a la lista
        </Button>

        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="size-16 rounded-2xl border border-border/80">
            <AvatarImage src={detail.imageUrl ?? undefined} alt="" />
            <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
              {initials(detail.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{detail.name}</h2>
              <BackofficeStatusBadge active={detail.isActive} />
            </div>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {detail.id}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Site {detail.siteId}
            </p>
          </div>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="space-y-4 rounded-2xl border border-border/80 bg-card/40 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <User className="size-4 text-primary" aria-hidden />
            Titular
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="size-11 border border-border/70">
              <AvatarImage src={detail.owner.imageUrl ?? undefined} alt="" />
              <AvatarFallback>{initials(detail.owner.name)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{detail.owner.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">
                {detail.owner.id}
              </p>
            </div>
          </div>
          <dl className="space-y-3 border-t border-border/60 pt-4">
            <InfoRow label="Creación del POP">
              {formatBackofficeDate(detail.createdAt)}
            </InfoRow>
          </dl>
        </article>

        <article className="space-y-4 rounded-2xl border border-border/80 bg-card/40 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CreditCard className="size-4 text-primary" aria-hidden />
            Subscripción activa
          </div>
          {!sub ? (
            <p className="text-sm text-muted-foreground">Sin subscripción.</p>
          ) : (
            <dl className="space-y-3">
              <InfoRow label="Tipo de comercio">
                {sub.businessTypeDisplayName}
              </InfoRow>
              <InfoRow label="Plan">{sub.planDisplayName}</InfoRow>
              <InfoRow label="Estado">
                <span className="capitalize">{sub.status}</span>
              </InfoRow>
              <InfoRow label="Período actual">
                {sub.periodStart && sub.periodEnd
                  ? `${formatBackofficeDate(sub.periodStart)} → ${formatBackofficeDate(sub.periodEnd)}`
                  : "—"}
              </InfoRow>
              <InfoRow label="Precio del período">
                {formatBackofficeMoney(sub.priceMonthly)}/mes
              </InfoRow>
              <InfoRow label="Módulos extra">
                {sub.extraModules.length === 0 ? (
                  "Ninguno"
                ) : (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {sub.extraModules.map((mod) => (
                      <span
                        key={mod.key}
                        className="inline-flex items-center gap-1 rounded-md border border-border/70 bg-muted/30 px-2 py-0.5 text-xs"
                      >
                        <Sparkles className="size-3 text-primary" aria-hidden />
                        {mod.label} · {formatBackofficeMoney(mod.priceMonthly)}
                      </span>
                    ))}
                  </div>
                )}
              </InfoRow>
              <InfoRow label="Último pago">
                {sub.lastPayment ? (
                  <span>
                    {formatBackofficeMoney(sub.lastPayment.amount)} ·{" "}
                    {formatBackofficeDate(sub.lastPayment.paidAt)} ·{" "}
                    {sub.lastPayment.paymentMethod === "manual"
                      ? "Manual"
                      : sub.lastPayment.paymentMethod}
                    {sub.lastPayment.paymentReference
                      ? ` · ${sub.lastPayment.paymentReference}`
                      : ""}
                  </span>
                ) : (
                  "—"
                )}
              </InfoRow>
            </dl>
          )}
        </article>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Historial</h3>
          <p className="text-sm text-muted-foreground">
            Altas, cambios de plan, extras, pagos y facturas del POP.
          </p>
        </div>

        {detail.timeline.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center text-sm text-muted-foreground">
            Sin eventos registrados todavía.
          </p>
        ) : (
          <ol className="relative space-y-0 border-l border-border/70 pl-6">
            {detail.timeline.map((entry, index) => {
              const Icon =
                entry.kind === "invoice"
                  ? Receipt
                  : entry.title.includes("Pago")
                    ? CreditCard
                    : entry.title.includes("POP")
                      ? Store
                      : Calendar
              return (
                <li key={entry.id} className="relative pb-8 last:pb-0">
                  <span
                    className={cn(
                      "absolute -left-[1.84rem] flex size-7 items-center justify-center rounded-full border bg-background",
                      entry.kind === "invoice"
                        ? "border-emerald-500/40 text-emerald-700"
                        : "border-primary/30 text-primary",
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden />
                  </span>
                  <div className="rounded-xl border border-border/70 bg-card/30 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{entry.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {entry.summary}
                        </p>
                      </div>
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {formatBackofficeDate(entry.occurredAt)}
                      </time>
                    </div>
                    <TimelinePayloadDetails payload={entry.payload} />
                  </div>
                  {index === detail.timeline.length - 1 ? null : null}
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
