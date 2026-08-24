"use client"

import { ChatRootsyDestructiveConfirmDialog } from "@/app/[siteId]/[popId]/chat/ChatRootsyDestructiveConfirmDialog"
import { ChatRootsyWriteConfirmDialog } from "@/app/[siteId]/[popId]/chat/ChatRootsyWriteConfirmDialog"
import { MundosHerramientasCrystal } from "@/app/library/mundos/MundosHerramientasCard"
import "@/app/[siteId]/[popId]/chat/chatRootsyOperation.css"
import type { ChatRootsyToolItem } from "@/app/[siteId]/[popId]/chat/chatTypes"
import { RootsFormCheckbox } from "@/components/rootsy-form"
import {
  chatRootsyApproveLabel,
  chatRootsyOffersAreDestructive,
  chatRootsyOffersAutoExecute,
  chatRootsyOperationHasUserDetails,
  chatRootsyRejectLabel,
  chatRootsyStepDetail,
  chatRootsyStepUserDetails,
  chatRootsyWriteConfirmCopy,
  taskPhaseTitle,
  taskStepProgress,
  type ChatRootsyOperationPhase,
  type ChatRootsyOperationStepKind,
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
import { ArrowRight, Check, ChevronDown, X } from "lucide-react"
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

function stepKindLabel(kind: ChatRootsyOperationStepKind): string {
  if (kind === "create") return "Alta"
  if (kind === "write") return "Actualización"
  if (kind === "delete") return "Eliminación"
  if (kind === "choose") return "Elección"
  return "Consulta"
}

function StepNode({
  status,
}: {
  status: ChatRootsyOperationStepView["status"]
}) {
  return (
    <span className="chat-rootsy-op-dash__node" data-status={status}>
      {status === "done" ? (
        <Check className="size-3" strokeWidth={2.6} aria-hidden />
      ) : status === "failed" ? (
        <X className="size-3" strokeWidth={2.6} aria-hidden />
      ) : (
        <span className="chat-rootsy-op-dash__pip" aria-hidden />
      )}
    </span>
  )
}

function StepInstrument({
  step,
  index,
}: {
  step: ChatRootsyOperationStepView
  index: number
}) {
  const detail = chatRootsyStepDetail(step)
  const delta = step.items.find((item) => item.changes?.length)?.changes?.[0]

  return (
    <div
      className="chat-rootsy-op-dash__instrument"
      data-kind={step.kind}
      data-status={step.status}
    >
      <div className="chat-rootsy-op-dash__chrome">
        <span>
          {String(index + 1).padStart(2, "0")} · {stepKindLabel(step.kind)}
        </span>
        {detail.text ? (
          <span className="chat-rootsy-op-dash__metric">{detail.text}</span>
        ) : null}
      </div>
      <p className="chat-rootsy-op-dash__subject">{step.title}</p>
      {delta ? (
        <p className="chat-rootsy-op-dash__delta">
          <span>{delta.before}</span>
          <ArrowRight className="size-3 shrink-0 opacity-70" aria-hidden />
          <span>{delta.after}</span>
        </p>
      ) : null}
    </div>
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
  tone: "approve" | "apply" | "danger" | "quiet" | "ghost" | "icon"
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={cn(
        "chat-rootsy-op-btn font-canopy",
        tone === "approve" && "chat-rootsy-op-btn--approve",
        tone === "apply" && "chat-rootsy-op-btn--apply",
        tone === "danger" && "chat-rootsy-op-btn--danger",
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
  const [writeOpen, setWriteOpen] = useState(false)

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
    setWriteOpen(false)
    setDeleteOpen(false)
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
  const informe = operation.informe
  const waitingOffers =
    (operation.phase === "waiting" || operation.phase === "error") &&
    pending.length > 0 &&
    !chatRootsyOffersAutoExecute(pending)
  const waitingChoices =
    (operation.phase === "waiting" || operation.phase === "error") &&
    operation.pendingChoices.length > 0
  const showDash =
    !collapsed &&
    Boolean(
      operation.steps.length ||
        operation.error ||
        waitingOffers ||
        waitingChoices ||
        hasUserDetails,
    )
  const hostId = operation.pendingHostId
  const approveLabel = chatRootsyApproveLabel(pending)
  const destructive = chatRootsyOffersAreDestructive(pending)
  const writeCopy = chatRootsyWriteConfirmCopy(selectedOffers)

  const requestApprove = () => {
    if (!hostId || !selectedOffers.length) return
    if (destructive) {
      setDeleteOpen(true)
      return
    }
    setWriteOpen(true)
  }

  const confirmSelected = () => {
    if (!hostId || !selectedOffers.length) return
    setDeleteOpen(false)
    setWriteOpen(false)
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
        {showDash ? (
          <div className="chat-rootsy-op-dash">
            {operation.steps.length ? (
              <ol
                className={cn(
                  "chat-rootsy-op-dash__list",
                  operation.steps.length > 1 && "chat-rootsy-op-dash__list--trail",
                )}
              >
                {operation.steps.map((step, index) => {
                  const last = index === operation.steps.length - 1
                  return (
                    <li key={step.id}>
                      {operation.steps.length > 1 ? (
                        <div className="chat-rootsy-op-dash__rail" aria-hidden>
                          <StepNode status={step.status} />
                          {last ? null : (
                            <span className="chat-rootsy-op-dash__stem" />
                          )}
                        </div>
                      ) : null}
                      <StepInstrument step={step} index={index} />
                    </li>
                  )
                })}
              </ol>
            ) : null}

            {operation.error ? (
              <p className="chat-rootsy-op-alert chat-rootsy-op-dash__slot" role="alert">
                {operation.error}
              </p>
            ) : null}

            {waitingOffers ? (
          <div className="chat-rootsy-op-dash__slot">
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
                tone={destructive ? "danger" : "apply"}
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

            {waitingChoices
              ? operation.pendingChoices.map((choice) => (
                  <div
                    className="chat-rootsy-op-dash__slot"
                    key={`${operation.id}-${choice.tool}`}
                  >
                    <ChoiceActions
                      choice={choice}
                      disabled={disabled}
                      embedded
                      onPick={(item) => {
                        if (operation.choiceHostId) {
                          onPick?.(operation.choiceHostId, choice.tool, item)
                        }
                      }}
                      onReject={() => {
                        if (operation.choiceHostId) {
                          onReject?.(operation.choiceHostId)
                        }
                      }}
                    />
                  </div>
                ))
              : null}

            {hasUserDetails ? (
          <footer className="chat-rootsy-op-details">
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
                {operation.error ? (
                  <p className="chat-rootsy-op-alert font-canopy text-sm" role="alert">
                    {operation.error}
                  </p>
                ) : null}
                {informe ? (
                  <div className="space-y-2">
                    {informe.respuesta.trim() ? (
                      <p className="font-canopy text-sm leading-relaxed">
                        {informe.respuesta.trim()}
                      </p>
                    ) : null}
                    {informe.acciones.length ? (
                      <div>
                        <p className="font-canopy text-xs font-semibold">
                          Qué se hizo
                        </p>
                        <ul className="mt-1 space-y-1">
                          {informe.acciones.map((accion, index) => (
                            <li
                              key={`${operation.id}-accion-${index}`}
                              className="font-canopy text-sm"
                            >
                              {accion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                ) : null}
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
            ) : null}
          </div>
        ) : !collapsed ? (
          <div className="h-3" />
        ) : null}
        </div>
        </div>
      </MundosHerramientasCrystal>

      <ChatRootsyWriteConfirmDialog
        open={writeOpen}
        title={writeCopy.title}
        description={writeCopy.description}
        confirmLabel={writeCopy.confirmLabel}
        busy={disabled}
        onOpenChange={setWriteOpen}
        onConfirm={confirmSelected}
      >
        <ul className="mt-2 space-y-3">
          {selectedOffers.map((offer) => (
            <li
              key={chatRootsyOfferKey(offer)}
              className="rounded-lg bg-[color-mix(in_srgb,var(--rootsy-bruma-100)_88%,transparent)] px-3 py-2"
            >
              <p className="font-canopy text-sm font-medium text-rootsy-bruma-900">
                {offer.preview?.subject ?? offer.action ?? offer.label}
              </p>
              {offer.preview?.changes.length ? (
                <ul className="mt-1.5 space-y-1">
                  {offer.preview.changes.map((change) => (
                    <li
                      key={`${change.field}-${change.before}-${change.after}`}
                      className="flex flex-wrap items-baseline gap-x-2 font-canopy text-sm text-rootsy-bruma-800"
                    >
                      <span>{change.field}</span>
                      <span className="text-rootsy-bruma-500 line-through">
                        {change.before}
                      </span>
                      <span aria-hidden>→</span>
                      <span className="font-semibold">{change.after}</span>
                    </li>
                  ))}
                </ul>
              ) : offer.action && offer.preview?.subject ? (
                <p className="mt-1 font-canopy text-sm text-rootsy-bruma-700">
                  {offer.action}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </ChatRootsyWriteConfirmDialog>

      <ChatRootsyDestructiveConfirmDialog
        open={deleteOpen}
        title={
          selectedOffers.length > 1
            ? "¿Eliminar estos registros?"
            : "¿Eliminar este registro?"
        }
        description="Los datos se borran del negocio y no se pueden recuperar desde acá. Escribí la frase para confirmar."
        items={selectedOffers.map(
          (offer) => offer.preview?.subject ?? offer.action ?? offer.label,
        )}
        busy={disabled}
        onOpenChange={setDeleteOpen}
        onConfirm={confirmSelected}
      />
    </section>
  )
}

function ChoiceActions({
  choice,
  disabled,
  embedded,
  onPick,
  onReject,
}: {
  choice: ChatRootsyPlannerChoice
  disabled?: boolean
  embedded?: boolean
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
    <div className={embedded ? undefined : "px-3.5 pt-3"}>
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
                className="chat-rootsy-op-choice flex w-full items-center gap-2.5 px-2.5 py-2 text-left font-canopy text-sm"
                onClick={() => setSelectedId(item.id ?? item.name)}
              >
                <span className="chat-rootsy-op-choice__mark" aria-hidden>
                  {checked ? (
                    <Check className="size-3" strokeWidth={2.6} />
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">{item.name}</span>
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
