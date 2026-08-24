"use client"

import type {
  ChatRootsyToolItem,
  ChatRootsyToolOffer,
  ChatRootsyToolResult,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import { RootsPrimaryButton, RootsSubtleButton } from "@/components/rootsy-button"
import {
  chatRootsyOfferKey,
  type ChatRootsyPlannerChoice,
} from "@/lib/chat/chatRootsyPlannerStep"
import { RootsFormCheckbox } from "@/components/rootsy-form/RootsFormCheckbox"
import { chatRootsyQueryTitle } from "@/lib/chat/chatRootsyTools"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

type OfferProps = {
  offer: ChatRootsyToolOffer
  disabled?: boolean
  onConfirm: () => void
}

export function ChatRootsyToolOfferCard({
  offer,
  disabled,
  onConfirm,
}: OfferProps) {
  return (
    <ChatRootsyToolOffersCard
      offers={[offer]}
      disabled={disabled}
      onConfirm={() => onConfirm()}
    />
  )
}

type OffersProps = {
  offers: ChatRootsyToolOffer[]
  disabled?: boolean
  onConfirm: (tools: string[]) => void
  onCancel?: () => void
}

export function ChatRootsyToolOffersCard({
  offers,
  disabled,
  onConfirm,
  onCancel,
}: OffersProps) {
  const visible = offers.filter((offer) => offer.status === "offered")
  const visibleKey = visible.map((offer) => chatRootsyOfferKey(offer)).join("\n")
  const [selected, setSelected] = useState<string[]>(() =>
    visible.map((offer) => chatRootsyOfferKey(offer)),
  )

  useEffect(() => {
    setSelected(visibleKey ? visibleKey.split("\n") : [])
  }, [visibleKey])

  const selectedOrdered = useMemo(
    () =>
      visible
        .filter((offer) => selected.includes(chatRootsyOfferKey(offer)))
        .map((offer) => chatRootsyOfferKey(offer)),
    [selected, visible],
  )

  if (!visible.length) return null

  const hasWrite = visible.some(
    (offer) => offer.method && offer.method !== "GET",
  )
  const previewOffers = visible.filter((offer) => offer.preview?.changes.length)
  const showCompareTable = previewOffers.length >= 2

  const toggle = (tool: string, checked: boolean) => {
    setSelected((current) => {
      if (checked) {
        return current.includes(tool) ? current : [...current, tool]
      }
      return current.filter((row) => row !== tool)
    })
  }

  return (
    <div className="mt-1 w-full rounded-[1.125rem] border border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-3">
      <p className="mb-2 font-canopy text-xs leading-4 text-[var(--rootsy-bruma-500)]">
        ¿Me das permiso para hacer esto? Podés dejar todas o sacar las que no
        quieras.
      </p>
      {showCompareTable ? (
        <ChatRootsyCompareTable offers={previewOffers} />
      ) : null}
      <ul className="space-y-1">
        {visible.map((offer) => {
          const key = chatRootsyOfferKey(offer)
          const preview = offer.preview
          return (
          <li key={key}>
            <label className="flex cursor-pointer items-start gap-2.5 py-1">
              <RootsFormCheckbox
                checked={selected.includes(key)}
                disabled={disabled}
                className="mt-0.5 shrink-0"
                aria-label={offer.label}
                onCheckedChange={(value) => toggle(key, value === true)}
              />
              <span className="min-w-0 flex-1">
                <span className="block font-canopy text-sm text-[var(--rootsy-bruma-900)]">
                  {preview?.subject && showCompareTable
                    ? preview.subject
                    : offer.label}
                </span>
                {preview && !showCompareTable ? (
                  <ChatRootsyChangeRows changes={preview.changes} />
                ) : offer.hint &&
                  !/\/v1\/|^(GET|POST|PATCH|PUT|DELETE)\s/i.test(offer.hint) ? (
                  <span className="block font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-500)]">
                    {offer.hint}
                  </span>
                ) : null}
              </span>
            </label>
          </li>
          )
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RootsPrimaryButton
          type="button"
          size="compact"
          disabled={disabled || selectedOrdered.length === 0}
          onClick={() => onConfirm(selectedOrdered)}
        >
          {hasWrite ? "Confirmar" : "Permitir"}
        </RootsPrimaryButton>
        {onCancel ? (
          <RootsSubtleButton
            type="button"
            size="compact"
            disabled={disabled}
            onClick={onCancel}
          >
            Anular
          </RootsSubtleButton>
        ) : null}
      </div>
    </div>
  )
}

type ChoiceProps = {
  choice: ChatRootsyPlannerChoice
  disabled?: boolean
  onPick: (item: ChatRootsyToolItem) => void
  onCancel?: () => void
}

export function ChatRootsyChooseOneCard({
  choice,
  disabled,
  onPick,
  onCancel,
}: ChoiceProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    choice.items.length === 1 ? choice.items[0]?.id ?? choice.items[0]?.name ?? null : null,
  )

  const selected = choice.items.find(
    (item) => (item.id ?? item.name) === selectedId,
  )

  return (
    <div className="mt-1 w-full rounded-[1.125rem] border border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-3">
      <p className="mb-2 font-canopy text-xs leading-4 text-[var(--rootsy-bruma-500)]">
        ¿Cuál querés usar?
      </p>
      {choice.items.length === 0 ? (
        <p className="font-canopy text-sm text-[var(--rootsy-bruma-600)]">
          No encontré resultados para elegir.
        </p>
      ) : (
        <ul className="space-y-1" role="radiogroup" aria-label="Elegir un resultado">
          {choice.items.map((item) => {
            const key = item.id ?? `${item.rank}-${item.name}`
            const checked = selectedId === (item.id ?? item.name)
            return (
              <li key={key}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  disabled={disabled}
                  className={cn(
                    "flex w-full items-baseline justify-between gap-3 rounded-lg px-2.5 py-2 text-left font-canopy text-sm",
                    checked
                      ? "bg-[var(--rootsy-savia-50)] text-[var(--rootsy-bruma-900)]"
                      : "text-[var(--rootsy-bruma-900)] hover:bg-[var(--rootsy-bruma-50)]",
                  )}
                  onClick={() => setSelectedId(item.id ?? item.name)}
                >
                  <span className="min-w-0">{item.name}</span>
                  {itemSecondary(item) ? (
                    <span className="shrink-0 text-xs text-[var(--rootsy-bruma-500)]">
                      {itemSecondary(item)}
                    </span>
                  ) : null}
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <RootsPrimaryButton
          type="button"
          size="compact"
          disabled={disabled || !selected}
          onClick={() => {
            if (selected) onPick(selected)
          }}
        >
          Seguir con este
        </RootsPrimaryButton>
        {onCancel ? (
          <RootsSubtleButton
            type="button"
            size="compact"
            disabled={disabled}
            onClick={onCancel}
          >
            Anular
          </RootsSubtleButton>
        ) : null}
      </div>
    </div>
  )
}

export function ChatRootsyChangeRows({
  changes,
}: {
  changes: NonNullable<ChatRootsyToolOffer["preview"]>["changes"]
}) {
  return (
    <span className="mt-0.5 block space-y-0.5">
      {changes.map((change) => (
        <span
          key={`${change.field}-${change.before}-${change.after}`}
          className="flex items-center gap-1.5 font-canopy text-[11px] leading-4 text-[var(--rootsy-bruma-600)]"
        >
          {changes.length > 1 ? (
            <span className="shrink-0 text-[var(--rootsy-bruma-500)]">
              {change.field}
            </span>
          ) : null}
          <span className="tabular-nums line-through decoration-[var(--rootsy-bruma-300)]">
            {change.before}
          </span>
          <ArrowRight
            className="size-3 shrink-0 text-[var(--rootsy-savia-700)]"
            aria-hidden
          />
          <span className="tabular-nums font-medium text-[var(--rootsy-savia-800)]">
            {change.after}
          </span>
        </span>
      ))}
    </span>
  )
}

export function ChatRootsyCompareTable({
  offers,
}: {
  offers: ChatRootsyToolOffer[]
}) {
  return (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-[var(--rootsy-bruma-200)] bg-[var(--rootsy-bruma-50)]">
      <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 border-b border-[var(--rootsy-bruma-200)] px-2.5 py-1.5 font-canopy text-[10px] font-semibold uppercase tracking-wide text-[var(--rootsy-bruma-500)]">
        <span>Qué</span>
        <span className="text-right">Ahora</span>
        <span className="w-3" />
        <span>Después</span>
      </div>
      <ul>
        {offers.flatMap((offer) =>
          (offer.preview?.changes ?? []).map((change) => (
            <li
              key={`${chatRootsyOfferKey(offer)}-${change.field}`}
              className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1 border-t border-[var(--rootsy-bruma-100)] px-2.5 py-1.5 font-canopy text-xs text-[var(--rootsy-bruma-800)] first:border-t-0"
            >
              <span className="min-w-0 truncate">
                {offer.preview?.subject}
                {offer.preview && offer.preview.changes.length > 1
                  ? ` · ${change.field}`
                  : ""}
              </span>
              <span className="text-right tabular-nums text-[var(--rootsy-bruma-500)]">
                {change.before}
              </span>
              <ArrowRight
                className="size-3 shrink-0 text-[var(--rootsy-savia-700)]"
                aria-hidden
              />
              <span className="tabular-nums font-medium text-[var(--rootsy-savia-800)]">
                {change.after}
              </span>
            </li>
          )),
        )}
      </ul>
    </div>
  )
}

function itemSecondary(item: ChatRootsyToolItem): string {
  if (item.balance != null || item.overdueAmount != null) {
    const balance =
      item.balance != null ? formatReportMoneyAr(item.balance) : null
    const overdue =
      item.overdueAmount != null && item.overdueAmount > 0
        ? `vencido ${formatReportMoneyAr(item.overdueAmount)}`
        : null
    return [balance, overdue].filter(Boolean).join(" · ")
  }
  if (item.marginPercent != null || item.profit != null) {
    const margin =
      item.marginPercent != null
        ? `${item.marginPercent.toLocaleString("es-AR", {
            maximumFractionDigits: 1,
          })}%`
        : null
    const profit =
      item.profit != null ? formatReportMoneyAr(item.profit) : null
    return [margin, profit].filter(Boolean).join(" · ")
  }
  const share =
    item.sharePercent != null
      ? `${item.sharePercent.toLocaleString("es-AR", {
          maximumFractionDigits: 1,
        })}%`
      : null
  const sales = item.sales != null ? formatReportMoneyAr(item.sales) : null
  return [share, sales].filter(Boolean).join(" · ")
}

type ResultProps = {
  result: ChatRootsyToolResult
}

export function ChatRootsyToolResultCard({ result }: ResultProps) {
  const title = result.title?.trim() || chatRootsyQueryTitle(result.tool)

  return (
    <div className="w-full rounded-[1.125rem] border border-[var(--rootsy-bruma-200)] bg-white px-3.5 py-3">
      <p className="font-canopy text-xs font-semibold text-[var(--rootsy-savia-800)]">
        {title} · {result.periodLabel}
      </p>
      {result.items.length === 0 ? (
        <p className="mt-2 font-canopy text-sm text-[var(--rootsy-bruma-600)]">
          {result.payload !== undefined
            ? "Datos listos para leer."
            : "No hay datos en este período."}
        </p>
      ) : (
        <ol className="mt-2 space-y-1.5">
          {result.items.map((item) => (
            <li
              key={`${item.rank}-${item.id ?? item.name}`}
              className="flex items-baseline justify-between gap-3 font-canopy text-sm text-[var(--rootsy-bruma-900)]"
            >
              <span className="min-w-0">
                <span className="mr-1.5 text-[var(--rootsy-bruma-500)]">
                  {item.rank}.
                </span>
                {item.name}
              </span>
              <span className="shrink-0 text-xs text-[var(--rootsy-bruma-500)]">
                {itemSecondary(item)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
