"use client"

import { ChatRootsyDestructiveConfirmDialog } from "@/app/[siteId]/[popId]/chat/ChatRootsyDestructiveConfirmDialog"
import {
  RootsySuccessAsset,
  RootsyThinkingAsset,
  RootsyWaitingAsset,
  RootsyWorkingAsset,
} from "@/app/[siteId]/[popId]/chat/ChatRootsyMascotAssets"
import "@/app/[siteId]/[popId]/chat/chatRootsyOperation.css"
import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { RootsFormCheckbox } from "@/components/rootsy-form"
import {
  chatRootsyApproveLabel,
  chatRootsyOffersAreDestructive,
  chatRootsyOperationHasUserDetails,
  chatRootsyRejectLabel,
  chatRootsyStepDetail,
  chatRootsyStepUserDetails,
  phaseLabel,
  type ChatRootsyOperationPhase,
  type ChatRootsyOperationStepView,
  type ChatRootsyOperationView,
} from "@/lib/chat/chatRootsyOperation"
import {
  chatRootsyOfferKey,
  type ChatRootsyPlannerChoice,
} from "@/lib/chat/chatRootsyPlannerStep"
import type { ChatRootsyOfferChange } from "@/lib/chat/chatRootsyOfferPreview"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { ArrowRight, Check, ChevronDown, Circle, X } from "lucide-react"
import {
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react"

type Props = {
  operation: ChatRootsyOperationView
  disabled?: boolean
  onApprove?: (hostId: string, keys: string[]) => void
  onReject?: (hostId: string) => void
  onPick?: (
    hostId: string,
    choiceTool: string,
    item: ChatRootsyToolItem,
  ) => void
}

const LIVE_PHASES = new Set<ChatRootsyOperationPhase>([
  "understanding",
  "preparing",
  "waiting",
  "executing",
])

function OperationMascot({ phase }: { phase: ChatRootsyOperationPhase }) {
  if (phase === "understanding") {
    return <RootsyThinkingAsset className="size-10" />
  }
  if (phase === "preparing" || phase === "executing") {
    return <RootsyWorkingAsset className="size-10" />
  }
  if (phase === "waiting") return <RootsyWaitingAsset className="size-10" />
  if (phase === "completed") return <RootsySuccessAsset className="size-10" />
  return <RootsyThinkingAsset className="size-10" />
}

function StepIcon({
  status,
}: {
  status: ChatRootsyOperationStepView["status"]
}) {
  if (status === "done") {
    return <Check className="size-3" aria-hidden />
  }
  if (status === "failed") {
    return <X className="size-3 text-rootsy-danger" aria-hidden />
  }
  if (status === "active") {
    return <span className="chat-rootsy-op-dot chat-rootsy-op-dot--live" />
  }
  return <Circle className="size-3 opacity-45" aria-hidden />
}

function TrailLink() {
  return (
    <svg
      className="chat-rootsy-op-trail__link"
      viewBox="0 0 14 28"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M7 0 C 2 7, 12 10, 7 14 C 3 19, 11 22, 7 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
    </svg>
  )
}

function isPriceChange(change: ChatRootsyOfferChange): boolean {
  return /precio|price|saleprice/i.test(change.field + (change.key ?? ""))
}

function OperationChangePlates({
  changes,
  subject,
}: {
  changes: ChatRootsyOfferChange[]
  subject?: string
}) {
  if (!changes.length) return null
  return (
    <div className="chat-rootsy-op-values mt-1.5">
      {changes.map((change) => (
        <div
          key={`${change.field}-${change.before}-${change.after}`}
          className="chat-rootsy-op-value"
          data-price={isPriceChange(change) ? "" : undefined}
        >
          {subject || changes.length > 1 ? (
            <span className="chat-rootsy-op-status min-w-0 flex-1 font-canopy text-[11px]">
              {subject && changes.length > 1
                ? `${subject} · ${change.field}`
                : (subject ?? change.field)}
            </span>
          ) : null}
          <span className="chat-rootsy-op-value__before font-canopy text-[11px] tabular-nums">
            {change.before}
          </span>
          <ArrowRight
            className="size-3 shrink-0 text-white/70"
            aria-hidden
          />
          <span className="chat-rootsy-op-value__after font-canopy text-[11px] tabular-nums">
            {change.after}
          </span>
        </div>
      ))}
    </div>
  )
}

function GlassButton({
  tone,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone: "approve" | "quiet" | "ghost" | "icon"
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn(
        "chat-rootsy-op-btn font-canopy",
        tone === "approve" && "chat-rootsy-op-btn--approve",
        tone === "quiet" && "chat-rootsy-op-btn--quiet",
        tone === "ghost" && "chat-rootsy-op-btn--ghost",
        tone === "icon" && "chat-rootsy-op-btn--icon",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export function ChatRootsyOperationCard({
  operation,
  disabled,
  onApprove,
  onReject,
  onPick,
}: Props) {
  const [expanded, setExpanded] = useState(
    () => operation.phase !== "completed" && operation.phase !== "stopped",
  )
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (operation.phase === "completed" || operation.phase === "stopped") {
      setExpanded(false)
      setDetailsOpen(false)
      return
    }
    setExpanded(true)
  }, [operation.phase])
  const pending = operation.pendingOffers
  const pendingKey = pending.map((offer) => chatRootsyOfferKey(offer)).join("\n")
  const [selected, setSelected] = useState<string[]>(() =>
    pending.map((offer) => chatRootsyOfferKey(offer)),
  )

  useEffect(() => {
    setSelected(pendingKey ? pendingKey.split("\n") : [])
  }, [pendingKey])

  const selectedOffers = useMemo(
    () =>
      pending.filter((offer) => selected.includes(chatRootsyOfferKey(offer))),
    [pending, selected],
  )
  const previewOffers = selectedOffers.filter(
    (offer) => offer.preview?.changes.length,
  )
  const live = LIVE_PHASES.has(operation.phase)
  const collapsed =
    !expanded &&
    (operation.phase === "completed" || operation.phase === "stopped")
  const hasProgress = operation.steps.some((step) => step.status === "done")
  const hasUserDetails = chatRootsyOperationHasUserDetails(operation)
  const hostId = operation.pendingHostId
  const approveLabel = chatRootsyApproveLabel(selectedOffers)
  const destructive = chatRootsyOffersAreDestructive(selectedOffers)

  const requestApprove = () => {
    if (!hostId || !selectedOffers.length) return
    if (destructive) {
      setDeleteOpen(true)
      return
    }
    onApprove?.(
      hostId,
      selectedOffers.map((offer) => chatRootsyOfferKey(offer)),
    )
  }

  return (
    <section
      className="chat-rootsy-op-card w-full max-w-[min(36rem,96%)]"
      data-phase={operation.phase}
      aria-labelledby={`${operation.id}-title`}
      aria-describedby={`${operation.id}-status`}
      aria-busy={live}
    >
      <div className="chat-rootsy-op-card__glass">
        <span className="chat-rootsy-op-card__sheen" aria-hidden />
        <header
          className={cn(
            "flex gap-3 pr-14 pl-3.5",
            collapsed ? "items-center py-3" : "items-start pb-2 pt-3",
          )}
        >
          <div className="min-w-0 flex-1">
            <h3
              id={`${operation.id}-title`}
              className={cn(
                "chat-rootsy-op-title min-w-0 font-canopy text-sm font-semibold",
                collapsed ? "truncate" : "text-pretty",
              )}
            >
              {operation.title}
            </h3>
            <p
              id={`${operation.id}-status`}
              className="chat-rootsy-op-status mt-0.5 font-canopy text-xs"
              aria-live="polite"
            >
              {operation.phase === "completed" ||
              operation.phase === "stopped" ||
              operation.phase === "error"
                ? operation.pasoLabel
                : `${phaseLabel(operation.phase)} · ${operation.pasoLabel}`}
            </p>
          </div>
          {operation.phase === "completed" || operation.phase === "stopped" ? (
            <GlassButton
              tone="icon"
              className="shrink-0"
              aria-label={expanded ? "Cerrar pasos" : "Ver pasos"}
              aria-expanded={expanded}
              onClick={() => setExpanded((open) => !open)}
            >
              <ChevronDown
                className={cn(
                  "size-3.5 transition-transform motion-reduce:transition-none",
                  expanded && "rotate-180",
                )}
              />
            </GlassButton>
          ) : null}
        </header>

        {!collapsed && !operation.steps.length ? (
          <div className="chat-rootsy-op-trail chat-rootsy-op-trail--idle" aria-hidden>
            <div className="chat-rootsy-op-trail__rail">
              <span className="chat-rootsy-op-trail__node">
                <span className="chat-rootsy-op-dot chat-rootsy-op-dot--live" />
              </span>
              <TrailLink />
            </div>
          </div>
        ) : null}

        {!collapsed && operation.steps.length ? (
          <ol className="chat-rootsy-op-trail">
            {operation.steps.map((step, index) => {
              const detail = chatRootsyStepDetail(step)
              const last = index === operation.steps.length - 1
              return (
                <li key={step.id}>
                  <div className="chat-rootsy-op-trail__rail">
                    <span className="chat-rootsy-op-trail__node">
                      <StepIcon status={step.status} />
                    </span>
                    {last ? null : <TrailLink />}
                  </div>
                  <div
                    className="chat-rootsy-op-plate px-3 py-2"
                    data-kind={step.kind}
                    data-status={step.status}
                  >
                    <p className="font-canopy text-sm text-white">
                      {step.title}
                    </p>
                    {detail.text ? (
                      <p className="chat-rootsy-op-status mt-0.5 font-canopy text-[11px] leading-4">
                        {detail.text}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        ) : null}

        {operation.error ? (
          <p
            className="chat-rootsy-op-alert mx-3.5 mt-3 px-3 py-2 font-canopy text-xs"
            role="alert"
          >
            {operation.error}
          </p>
        ) : null}

        {operation.phase === "waiting" && pending.length ? (
          <div className="px-3.5 pt-3">
            {previewOffers.length >= 2 ? (
              <div className="mb-2.5 space-y-1.5">
                {previewOffers.map((offer) =>
                  offer.preview ? (
                    <OperationChangePlates
                      key={chatRootsyOfferKey(offer)}
                      subject={offer.preview.subject}
                      changes={offer.preview.changes}
                    />
                  ) : null,
                )}
              </div>
            ) : null}
            <fieldset className="space-y-1.5" disabled={disabled}>
              <legend className="sr-only">Acciones para aprobar</legend>
              {pending.map((offer) => {
                const key = chatRootsyOfferKey(offer)
                const checked = selected.includes(key)
                return (
                  <label
                    key={key}
                    className="chat-rootsy-op-offer flex cursor-pointer items-start gap-2.5 px-2.5 py-2"
                    data-checked={checked}
                  >
                    <RootsFormCheckbox
                      checked={checked}
                      disabled={disabled}
                      className="mt-0.5 shrink-0"
                      aria-label={offer.action ?? offer.label}
                      onCheckedChange={(value) => {
                        setSelected((current) =>
                          value === true
                            ? current.includes(key)
                              ? current
                              : [...current, key]
                            : current.filter((item) => item !== key),
                        )
                      }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block font-canopy text-sm text-white">
                        {offer.preview?.subject && previewOffers.length >= 2
                          ? offer.preview.subject
                          : offer.action ?? offer.label}
                      </span>
                      {offer.preview && previewOffers.length < 2 ? (
                        <OperationChangePlates changes={offer.preview.changes} />
                      ) : null}
                    </span>
                  </label>
                )
              })}
            </fieldset>
            {pending.length > 1 ? (
              <GlassButton
                tone="ghost"
                className="mt-1 text-[11px]"
                disabled={disabled}
                onClick={() =>
                  setSelected(pending.map((offer) => chatRootsyOfferKey(offer)))
                }
              >
                Aprobar todas juntas
              </GlassButton>
            ) : null}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <GlassButton
                tone="approve"
                disabled={disabled || selectedOffers.length === 0}
                onClick={requestApprove}
              >
                {approveLabel}
              </GlassButton>
              <GlassButton
                tone="quiet"
                disabled={disabled}
                onClick={() => {
                  if (hostId) onReject?.(hostId)
                }}
              >
                {chatRootsyRejectLabel(hasProgress)}
              </GlassButton>
            </div>
          </div>
        ) : null}

        {operation.phase === "waiting" && operation.pendingChoices.length
          ? operation.pendingChoices.map((choice) => (
              <ChoiceActions
                key={`${operation.id}-${choice.tool}`}
                choice={choice}
                disabled={disabled}
                onPick={(item) => {
                  if (operation.choiceHostId) {
                    onPick?.(operation.choiceHostId, choice.tool, item)
                  }
                }}
                onReject={() => {
                  if (operation.choiceHostId) onReject?.(operation.choiceHostId)
                }}
              />
            ))
          : null}

        {!collapsed && hasUserDetails ? (
          <footer className="chat-rootsy-op-details mt-3">
            <button
              type="button"
              className="chat-rootsy-op-details__toggle flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left"
              aria-expanded={detailsOpen}
              onClick={() => setDetailsOpen((open) => !open)}
            >
              <span className="font-canopy text-xs font-medium">
                {detailsOpen ? "Ocultar detalles" : "Ver detalles"}
              </span>
              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 text-white/55 transition-transform motion-reduce:transition-none",
                  detailsOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            {detailsOpen ? (
              <div className="space-y-3 px-3.5 pb-3">
                {operation.steps.map((step) => {
                  const details = chatRootsyStepUserDetails(step)
                  if (!details.length) return null
                  return (
                    <div key={`${step.id}-details`}>
                      <p className="font-canopy text-xs font-semibold text-white">
                        {step.title}
                      </p>
                      <ul className="mt-1 space-y-1.5">
                        {details.map((item) => (
                          <li
                            key={item.id}
                            className="min-w-0 font-canopy text-sm text-white"
                          >
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="min-w-0">{item.label}</span>
                              {item.secondary ? (
                                <span className="chat-rootsy-op-status shrink-0 text-xs">
                                  {item.secondary}
                                </span>
                              ) : null}
                            </div>
                            {item.changes?.length ? (
                              <OperationChangePlates changes={item.changes} />
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            ) : null}
          </footer>
        ) : !collapsed ? (
          <div className="h-3" />
        ) : null}
      </div>

      <div className="chat-rootsy-op-asset" data-rootsy-asset-edge>
        <OperationMascot phase={operation.phase} />
      </div>

      <ChatRootsyDestructiveConfirmDialog
        open={deleteOpen}
        title="¿Eliminar estos registros?"
        description="Los datos se borran del negocio y no se pueden recuperar desde acá."
        items={selectedOffers.map(
          (offer) => offer.preview?.subject ?? offer.action ?? offer.label,
        )}
        busy={disabled}
        onOpenChange={setDeleteOpen}
        onConfirm={() => {
          if (!hostId) return
          setDeleteOpen(false)
          onApprove?.(
            hostId,
            selectedOffers.map((offer) => chatRootsyOfferKey(offer)),
          )
        }}
      />
    </section>
  )
}

function ChoiceActions({
  choice,
  disabled,
  onPick,
  onReject,
}: {
  choice: ChatRootsyPlannerChoice
  disabled?: boolean
  onPick: (item: ChatRootsyToolItem) => void
  onReject: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    choice.items.length === 1
      ? (choice.items[0]?.id ?? choice.items[0]?.name ?? null)
      : null,
  )
  const selected = choice.items.find(
    (item) => (item.id ?? item.name) === selectedId,
  )

  return (
    <div className="px-3.5 pt-3">
      <p className="chat-rootsy-op-status mb-2 font-canopy text-xs">
        Elegí un resultado para seguir.
      </p>
      <ul className="space-y-1.5" role="radiogroup" aria-label={choice.action}>
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
                className="chat-rootsy-op-choice flex w-full items-baseline justify-between gap-3 px-2.5 py-2 text-left font-canopy text-sm text-white"
                onClick={() => setSelectedId(item.id ?? item.name)}
              >
                <span className="min-w-0">{item.name}</span>
                {choiceSecondary(item) ? (
                  <span className="chat-rootsy-op-status shrink-0 text-xs">
                    {choiceSecondary(item)}
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <GlassButton
          tone="approve"
          disabled={disabled || !selected}
          onClick={() => {
            if (selected) onPick(selected)
          }}
        >
          Seguir con este
        </GlassButton>
        <GlassButton tone="quiet" disabled={disabled} onClick={onReject}>
          Rechazar paso
        </GlassButton>
      </div>
    </div>
  )
}

function choiceSecondary(item: ChatRootsyToolItem): string {
  if (item.sales != null) return formatReportMoneyAr(item.sales)
  if (item.balance != null) return formatReportMoneyAr(item.balance)
  return ""
}
