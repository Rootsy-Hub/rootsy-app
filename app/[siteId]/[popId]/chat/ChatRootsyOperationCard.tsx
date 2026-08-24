"use client"

import { ChatRootsyDestructiveConfirmDialog } from "@/app/[siteId]/[popId]/chat/ChatRootsyDestructiveConfirmDialog"
import { MundosHerramientasCrystal } from "@/app/library/mundos/MundosHerramientasCard"
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
  taskPhaseTitle,
  taskStepProgress,
  type ChatRootsyOperationPhase,
  type ChatRootsyOperationView,
} from "@/lib/chat/chatRootsyOperation"
import {
  chatRootsyOfferKey,
  type ChatRootsyPlannerChoice,
} from "@/lib/chat/chatRootsyPlannerStep"
import type { ChatRootsyOfferChange } from "@/lib/chat/chatRootsyOfferPreview"
import { formatReportMoneyAr } from "@/lib/reportFormatters"
import { cn } from "@/lib/utils"
import { ArrowRight, ChevronDown, X } from "lucide-react"
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
            className="size-3 shrink-0 opacity-70"
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

function OperationHeading({
  operation,
  collapsed,
  titleAs,
}: {
  operation: ChatRootsyOperationView
  collapsed: boolean
  titleAs: "h3" | "span"
}) {
  const Title = titleAs

  return (
    <span className="min-w-0 flex-1">
      <span
        id={`${operation.id}-status`}
        className="chat-rootsy-op-kicker"
        aria-live="polite"
      >
        {taskPhaseTitle(operation.phase)}
      </span>
      <Title
        id={`${operation.id}-title`}
        className={cn(
          "chat-rootsy-op-title mt-0.5 mb-0 block min-w-0 font-canopy text-sm font-semibold",
          collapsed ? "truncate" : "text-pretty",
        )}
      >
        {operation.title}
      </Title>
    </span>
  )
}

const RING_SIZE = 62
const RING_STROKE = 5
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2
const RING_CENTER = RING_SIZE / 2

function TaskProgressRing({
  operation,
}: {
  operation: ChatRootsyOperationView
}) {
  const { tone, current, total, ratio } = taskStepProgress(operation)
  const progress = Math.max(0, Math.min(1, ratio))
  const label =
    tone === "ok" ? "OK" : tone === "error" ? null : `${current}/${total}`
  const announced =
    tone === "ok"
      ? "Tarea finalizada"
      : tone === "error"
        ? "Tarea con error"
        : `Paso ${current} de ${total}`

  return (
    <span
      className="chat-rootsy-op-ring"
      data-tone={tone}
      aria-label={announced}
    >
      <svg
        className="chat-rootsy-op-ring__arc"
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        aria-hidden
      >
        <circle
          className="chat-rootsy-op-ring__track"
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={RING_STROKE}
        />
        <circle
          className="chat-rootsy-op-ring__bar"
          cx={RING_CENTER}
          cy={RING_CENTER}
          r={RING_RADIUS}
          fill="none"
          strokeWidth={RING_STROKE}
          pathLength={1}
          strokeDasharray={`${progress} 1`}
          transform={`rotate(-90 ${RING_CENTER} ${RING_CENTER})`}
        />
      </svg>
      <span className="chat-rootsy-op-ring__label">
        {tone === "error" ? <X className="size-4" strokeWidth={2.6} /> : label}
      </span>
    </span>
  )
}

function HeaderRow({
  operation,
  collapsed,
  canToggle,
  expanded,
  titleAs,
}: {
  operation: ChatRootsyOperationView
  collapsed: boolean
  canToggle: boolean
  expanded: boolean
  titleAs: "h3" | "span"
}) {
  return (
    <>
      {canToggle ? (
        <ChevronDown
          className={cn(
            "chat-rootsy-op-chevron size-4 shrink-0",
            collapsed ? "" : "mt-1",
            expanded && "rotate-180",
          )}
          aria-hidden
        />
      ) : null}
      <OperationHeading
        operation={operation}
        collapsed={collapsed}
        titleAs={titleAs}
      />
      <TaskProgressRing operation={operation} />
    </>
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
  const canToggle =
    operation.phase === "completed" || operation.phase === "stopped"
  const collapsed = canToggle && !expanded
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
      <MundosHerramientasCrystal
        className="chat-rootsy-op-card__crystal"
        surface="flat"
      >
        <div className="chat-rootsy-op-card__body">
        <header>
          {canToggle ? (
            <button
              type="button"
              className={cn(
                "chat-rootsy-op-toggle flex w-full gap-2.5 px-3.5 text-left",
                collapsed ? "items-center py-3" : "items-start pb-2 pt-3",
              )}
              aria-expanded={expanded}
              aria-controls={`${operation.id}-content`}
              onClick={() => setExpanded((open) => !open)}
            >
              <HeaderRow
                operation={operation}
                collapsed={collapsed}
                canToggle
                expanded={expanded}
                titleAs="span"
              />
            </button>
          ) : (
            <div
              className={cn(
                "flex gap-2.5 px-3.5",
                collapsed ? "items-center py-3" : "items-start pb-2 pt-3",
              )}
            >
              <HeaderRow
                operation={operation}
                collapsed={collapsed}
                canToggle={false}
                expanded={expanded}
                titleAs="h3"
              />
            </div>
          )}
        </header>
        <div id={`${operation.id}-content`}>

        {!collapsed && operation.steps.length ? (
          <ol className="chat-rootsy-op-steps">
            {operation.steps.map((step) => {
              const detail = chatRootsyStepDetail(step)
              return (
                <li key={step.id}>
                  <div
                    className="chat-rootsy-op-plate px-3 py-2"
                    data-kind={step.kind}
                    data-status={step.status}
                  >
                    <p className="font-canopy text-sm">
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
                      <span className="block font-canopy text-sm">
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
                  "size-3.5 shrink-0 opacity-60 transition-transform motion-reduce:transition-none",
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
                      <p className="font-canopy text-xs font-semibold">
                        {step.title}
                      </p>
                      <ul className="mt-1 space-y-1.5">
                        {details.map((item) => (
                          <li
                            key={item.id}
                            className="min-w-0 font-canopy text-sm"
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
        </div>
      </MundosHerramientasCrystal>

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
                className="chat-rootsy-op-choice flex w-full items-baseline justify-between gap-3 px-2.5 py-2 text-left font-canopy text-sm"
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
