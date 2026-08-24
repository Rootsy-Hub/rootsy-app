import type {
  ChatMessageRow,
  ChatRootsyToolItem,
  ChatRootsyToolOffer,
  ChatRootsyToolResult,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import { ROOTSY_CHAT_WELCOME } from "@/app/[siteId]/[popId]/chat/chatRootsy"
import {
  isChatRootsyWriteMethod,
  type ChatRootsyCloseHecho,
} from "@/lib/chat/chatRootsyCloseBrief"
import type {
  ChatRootsyOfferChange,
  ChatRootsyOfferPreview,
} from "@/lib/chat/chatRootsyOfferPreview"
import {
  chatRootsyOfferKey,
  type ChatRootsyPlannerChoice,
} from "@/lib/chat/chatRootsyPlannerStep"
import { chatRootsyQueryTitle } from "@/lib/chat/chatRootsyTools"
import { formatReportMoneyAr } from "@/lib/reportFormatters"

export type ChatRootsyOperationPhase =
  | "understanding"
  | "preparing"
  | "waiting"
  | "executing"
  | "completed"
  | "stopped"
  | "error"

export type ChatRootsyOperationStepStatus =
  | "done"
  | "active"
  | "pending"
  | "failed"

export type ChatRootsyOperationStepKind = "read" | "write" | "delete" | "choose"

export type ChatRootsyOperationLive = {
  sending: boolean
  mode: "idle" | "understand" | "execute" | "choose" | "prepare"
  hostId?: string
  error?: string | null
}

export type ChatRootsyOperationStepItemView = {
  id: string
  label: string
  secondary?: string
  changes?: ChatRootsyOfferChange[]
}

export type ChatRootsyOperationStepView = {
  id: string
  title: string
  summary: string
  status: ChatRootsyOperationStepStatus
  kind: ChatRootsyOperationStepKind
  items: ChatRootsyOperationStepItemView[]
  hostMessageId?: string
}

export type ChatRootsyOperationView = {
  id: string
  originMessageId: string
  anchorMessageId: string
  title: string
  phase: ChatRootsyOperationPhase
  paso: number
  pasoLabel: string
  steps: ChatRootsyOperationStepView[]
  pendingOffers: ChatRootsyToolOffer[]
  pendingHostId: string | null
  pendingChoices: ChatRootsyPlannerChoice[]
  choiceHostId: string | null
  error?: string
  memberIds: string[]
}

type OperationAtom = {
  id: string
  offerKey?: string
  hostMessageId: string
  title: string
  impact: string
  status: ChatRootsyOperationStepStatus
  kind: ChatRootsyOperationStepKind
  preview?: ChatRootsyOfferPreview
  foundItems?: ChatRootsyToolItem[]
  applied?: ChatRootsyCloseHecho
}

function offersOf(row: ChatMessageRow): ChatRootsyToolOffer[] {
  if (row.toolOffers?.length) return row.toolOffers
  return row.toolOffer ? [row.toolOffer] : []
}

function isUserRow(row: ChatMessageRow): boolean {
  return row.mine === true
}

function hasOperationSignal(row: ChatMessageRow): boolean {
  return Boolean(
    row.plannerRun ||
      row.plannerChoices?.length ||
      row.closeBrief ||
      row.toolResult ||
      offersOf(row).length,
  )
}

function kindFromMethod(method?: string): ChatRootsyOperationStepKind {
  const verb = (method ?? "GET").toUpperCase()
  if (verb === "DELETE") return "delete"
  if (isChatRootsyWriteMethod(verb)) return "write"
  return "read"
}

function impactForOffer(offer: ChatRootsyToolOffer): string {
  const kind = kindFromMethod(offer.method)
  if (kind === "delete") {
    return "Esta acción borra el registro y no se puede deshacer."
  }
  if (kind === "write") {
    return "Voy a actualizar estos datos en el negocio."
  }
  return ""
}

function shortenWriteTitle(
  title: string,
  preview?: ChatRootsyOfferPreview,
): string {
  if (!preview?.changes.length) return title
  const withoutAmount = title.replace(/\s+a\s+\$?\s*[\d.,]+$/i, "").trim()
  if (preview.subject && withoutAmount.toLowerCase().includes(preview.subject.toLowerCase())) {
    return withoutAmount
  }
  return withoutAmount || title
}

function itemSecondary(item: ChatRootsyToolItem): string | undefined {
  if (item.sales != null) return formatReportMoneyAr(item.sales)
  if (item.balance != null) return formatReportMoneyAr(item.balance)
  return undefined
}

function atomFromOffer(
  offer: ChatRootsyToolOffer,
  hostMessageId: string,
  status: ChatRootsyOperationStepStatus,
): OperationAtom {
  return {
    id: `${hostMessageId}:${chatRootsyOfferKey(offer)}`,
    offerKey: chatRootsyOfferKey(offer),
    hostMessageId,
    title: shortenWriteTitle(offer.action?.trim() || offer.label, offer.preview),
    impact: impactForOffer(offer),
    status,
    kind: kindFromMethod(offer.method),
    preview: offer.preview,
  }
}

function atomFromResult(
  result: ChatRootsyToolResult,
  hostMessageId: string,
): OperationAtom {
  return {
    id: `${hostMessageId}:result:${result.offerKey ?? result.tool}`,
    offerKey: result.offerKey,
    hostMessageId,
    title: result.title?.trim() || chatRootsyQueryTitle(result.tool),
    impact: result.applied
      ? "El cambio ya quedó en el negocio."
      : "Consulta hecha para armar el siguiente paso.",
    status: "done",
    kind: result.applied ? "write" : "read",
    foundItems: result.items,
    applied: result.applied,
  }
}

function applyResultToAtom(atom: OperationAtom, result: ChatRootsyToolResult): void {
  atom.status = "done"
  atom.foundItems = result.items.length ? result.items : atom.foundItems
  if (result.applied) atom.applied = result.applied
  if (result.applied) atom.kind = "write"
}

function titleFromPedido(body: string): string {
  return body.replace(/\s+/g, " ").trim()
}

export function phaseLabel(phase: ChatRootsyOperationPhase): string {
  if (phase === "understanding") return "Entendiendo la solicitud"
  if (phase === "preparing") return "Preparando el siguiente paso"
  if (phase === "waiting") return "Esperando aprobación"
  if (phase === "executing") return "Ejecutando"
  if (phase === "completed") return "Completada"
  if (phase === "error") return "Error"
  return "Detenida"
}

function stepCountLabel(paso: number): string {
  return paso <= 1 ? "1 paso" : `${paso} pasos`
}

function pasoLabel(
  phase: ChatRootsyOperationPhase,
  currentPaso: number,
  stepCount: number,
): string {
  if (phase === "understanding") return "Armando el pedido"
  if (phase === "preparing") return `Paso ${currentPaso} · explorando`
  if (phase === "waiting") return `Paso ${currentPaso} · por aprobar`
  if (phase === "executing") return `Paso ${currentPaso} · en curso`
  if (phase === "completed") return `Operación completada · ${stepCountLabel(stepCount)}`
  if (phase === "error") return `Operación con error · ${stepCountLabel(stepCount)}`
  return `Operación detenida · ${stepCountLabel(stepCount)}`
}

function collectClusters(messages: ChatMessageRow[]): ChatMessageRow[][] {
  const clusters: ChatMessageRow[][] = []
  let current: ChatMessageRow[] = []
  for (const row of messages) {
    if (row.id === ROOTSY_CHAT_WELCOME.id) continue
    if (isUserRow(row)) {
      if (current.length) clusters.push(current)
      current = [row]
      continue
    }
    if (!current.length) continue
    current.push(row)
  }
  if (current.length) clusters.push(current)
  return clusters
}

function uniqueFields(atoms: OperationAtom[]): string[] {
  const fields = new Set<string>()
  for (const atom of atoms) {
    for (const change of atom.preview?.changes ?? []) {
      if (change.field.trim()) fields.add(change.field)
    }
    for (const change of atom.applied?.cambios ?? []) {
      if (change.campo.trim()) fields.add(change.campo)
    }
  }
  return [...fields]
}

function subjectsOf(atoms: OperationAtom[]): string[] {
  const names: string[] = []
  const seen = new Set<string>()
  const push = (value: string | undefined) => {
    const name = value?.replace(/\s+/g, " ").trim()
    if (!name) return
    const key = name.toLowerCase()
    if (seen.has(key)) return
    seen.add(key)
    names.push(name)
  }
  for (const atom of atoms) {
    push(atom.applied?.sujeto)
    push(atom.preview?.subject)
    for (const item of atom.foundItems ?? []) push(item.name)
  }
  return names
}

function joinNames(names: string[]): string {
  if (names.length === 1) return names[0] ?? ""
  if (names.length === 2) return `${names[0]} y ${names[1]}`
  return `${names[0]}, ${names[1]} y ${names.length - 2} más`
}

function groupKind(atoms: OperationAtom[]): ChatRootsyOperationStepKind {
  if (atoms.some((atom) => atom.kind === "delete")) return "delete"
  if (atoms.some((atom) => atom.kind === "write")) return "write"
  if (atoms.some((atom) => atom.kind === "choose")) return "choose"
  return "read"
}

function groupStatus(atoms: OperationAtom[]): ChatRootsyOperationStepStatus {
  if (atoms.some((atom) => atom.status === "failed")) return "failed"
  if (atoms.some((atom) => atom.status === "active")) return "active"
  if (atoms.every((atom) => atom.status === "done")) return "done"
  if (atoms.some((atom) => atom.status === "pending")) return "pending"
  return "active"
}

function groupTitle(atoms: OperationAtom[], kind: ChatRootsyOperationStepKind): string {
  if (kind === "choose") return atoms.find((atom) => atom.kind === "choose")?.title ?? "Elegir un resultado"
  if (kind === "delete") {
    return atoms.length > 1 ? "Eliminar registros" : (atoms[0]?.title ?? "Eliminar")
  }
  if (kind === "write") {
    if (atoms.length === 1) return atoms[0]?.title ?? "Actualizar"
    const fields = uniqueFields(atoms)
    if (fields.length === 1 && /^precio$/i.test(fields[0] ?? "")) {
      return "Actualizar precios"
    }
    if (fields.length === 1) {
      return `Actualizar ${fields[0]?.toLowerCase()}`
    }
    return "Actualizar registros"
  }
  return atoms[0]?.title ?? "Consultar"
}

function groupSummary(atoms: OperationAtom[], kind: ChatRootsyOperationStepKind): string {
  if (kind === "choose") return "Elegí un resultado para seguir."
  if (kind === "delete") {
    return atoms[0]?.impact || (atoms.length > 1 ? `${atoms.length} registros` : "")
  }
  if (kind === "read") {
    const found = atoms.flatMap((atom) => atom.foundItems ?? [])
    if (found.length === 1) return `Encontré ${found[0]?.name}.`
    if (found.length > 1) return `Vi ${found.length} resultados.`
    if (atoms.some((atom) => atom.status === "done")) return "Consulta lista."
    return ""
  }
  const names = subjectsOf(atoms)
  if (names.length) return joinNames(names)
  return atoms.length > 1 ? `${atoms.length} registros` : "Cambio aplicado."
}

function changesFromAtom(atom: OperationAtom): ChatRootsyOfferChange[] {
  const source = atom.applied?.cambios?.length
    ? atom.applied.cambios.map((change) => ({
        field: change.campo,
        before: change.antes,
        after: change.despues,
      }))
    : (atom.preview?.changes ?? [])
  return source.map((change) => ({
    field: change.field,
    before: change.before,
    after: change.after,
  }))
}

function groupItems(atoms: OperationAtom[]): ChatRootsyOperationStepItemView[] {
  const items: ChatRootsyOperationStepItemView[] = []
  const seen = new Set<string>()
  const push = (item: ChatRootsyOperationStepItemView) => {
    const key = `${item.label.toLowerCase()}|${item.changes?.map((c) => c.field).join(",") ?? item.secondary ?? ""}`
    if (seen.has(key)) return
    seen.add(key)
    items.push(item)
  }

  for (const atom of atoms) {
    const changes = changesFromAtom(atom)
    const subject = atom.applied?.sujeto || atom.preview?.subject
    if (subject && changes.length) {
      push({
        id: `change:${subject}`,
        label: subject,
        changes,
      })
      continue
    }
    if (atom.foundItems?.length) {
      for (const found of atom.foundItems) {
        push({
          id: `found:${found.id ?? found.rank}:${found.name}`,
          label: found.name,
          secondary: itemSecondary(found),
        })
      }
      continue
    }
    if (atom.kind === "choose") {
      push({
        id: `choose:${atom.title}`,
        label: atom.title,
      })
    }
  }
  return items
}

function foldAtoms(atoms: OperationAtom[]): ChatRootsyOperationStepView[] {
  const groups = new Map<string, OperationAtom[]>()
  const order: string[] = []
  for (const atom of atoms) {
    const key = atom.hostMessageId
    const existing = groups.get(key)
    if (existing) {
      existing.push(atom)
      continue
    }
    groups.set(key, [atom])
    order.push(key)
  }

  return order.flatMap((key) => {
    const group = groups.get(key)
    if (!group?.length) return []
    if (group.every((atom) => atom.status === "pending")) return []
    const kind = groupKind(group)
    return [
      {
        id: key,
        title: groupTitle(group, kind),
        summary: groupSummary(group, kind),
        status: groupStatus(group),
        kind,
        items: groupItems(group),
        hostMessageId: key,
      },
    ]
  })
}

function collectAtoms(rest: ChatMessageRow[]): OperationAtom[] {
  const atoms: OperationAtom[] = []
  let lastOfferHostId: string | null = null

  for (const row of rest) {
    const rowOffers = offersOf(row)
    for (const offer of rowOffers) {
      const status: ChatRootsyOperationStepStatus =
        offer.status === "used" ? "done" : "pending"
      const key = chatRootsyOfferKey(offer)
      const existing = atoms.find((atom) => atom.offerKey === key)
      const next = atomFromOffer(offer, row.id, status)
      lastOfferHostId = row.id
      if (existing) {
        existing.title = next.title
        existing.impact = next.impact
        existing.status = next.status
        existing.kind = next.kind
        existing.preview = next.preview ?? existing.preview
        existing.hostMessageId = row.id
        continue
      }
      atoms.push(next)
    }
    if (row.toolResult) {
      const key = row.toolResult.offerKey
      const match = key
        ? atoms.find((atom) => atom.offerKey === key)
        : undefined
      if (match) {
        applyResultToAtom(match, row.toolResult)
      } else {
        atoms.push(
          atomFromResult(row.toolResult, lastOfferHostId ?? row.id),
        )
      }
    }
    if (row.plannerChoices?.length) {
      for (const choice of row.plannerChoices) {
        atoms.push({
          id: `${row.id}:choose:${choice.tool}`,
          hostMessageId: row.id,
          title: choice.action,
          impact: "Elegí un resultado para que pueda seguir.",
          status: "active",
          kind: "choose",
        })
      }
    }
  }
  return atoms
}

function buildOperationFromCluster(
  cluster: ChatMessageRow[],
  nextClusterStarts: boolean,
  live: ChatRootsyOperationLive | undefined,
): ChatRootsyOperationView | null {
  const origin = cluster[0]
  if (!origin || !isUserRow(origin)) return null

  const rest = cluster.slice(1)
  const hasSignal = rest.some(hasOperationSignal)
  if (!hasSignal) return null

  const anchor =
    rest.find((row) => row.body.trim() || offersOf(row).length || row.plannerRun) ??
    rest[0]
  if (!anchor) return null

  const memberIds = cluster.map((row) => row.id)
  let pendingOffers: ChatRootsyToolOffer[] = []
  let pendingHostId: string | null = null
  let pendingChoices: ChatRootsyPlannerChoice[] = []
  let choiceHostId: string | null = null
  let hasClose = false
  let pedidoPlanificador = ""
  let plannerPaso = 1

  for (const row of rest) {
    if (!pedidoPlanificador) {
      const objective = row.plannerRun?.dataRequest?.objective?.trim()
      if (objective) pedidoPlanificador = objective
    }
    if (row.plannerRun?.paso) plannerPaso = row.plannerRun.paso
    const rowOffers = offersOf(row)
    if (rowOffers.some((offer) => offer.status === "offered")) {
      pendingOffers = rowOffers.filter((offer) => offer.status === "offered")
      pendingHostId = row.id
    }
    if (row.plannerChoices?.length) {
      pendingChoices = row.plannerChoices
      choiceHostId = row.id
    }
    if (row.closeBrief) hasClose = true
  }

  const atoms = collectAtoms(rest)
  const steps = foldAtoms(atoms)

  const liveOnHost = Boolean(
    live?.hostId &&
      (live.hostId === pendingHostId ||
        live.hostId === choiceHostId ||
        live.hostId === origin.id ||
        memberIds.includes(live.hostId)),
  )
  const liveBusy = Boolean(live?.sending && liveOnHost)

  let phase: ChatRootsyOperationPhase = "waiting"
  if (liveBusy && live?.mode === "prepare") phase = "preparing"
  else if (liveBusy && live?.mode === "choose") phase = "preparing"
  else if (liveBusy && live?.mode === "execute") {
    phase = "executing"
  } else if (pendingOffers.length || pendingChoices.length) {
    phase = "waiting"
  } else if (hasClose) {
    phase = "completed"
  } else if (
    rest.some((row) => row.toolResult || offersOf(row).some((offer) => offer.status === "used")) &&
    !pendingOffers.length &&
    !pendingChoices.length &&
    nextClusterStarts
  ) {
    phase = "stopped"
  } else if (
    hasSignal &&
    !pendingOffers.length &&
    !pendingChoices.length &&
    !hasClose &&
    (nextClusterStarts || rest.some((row) => offersOf(row).length === 0 && !row.toolResult && !row.plannerChoices?.length && !row.closeBrief && row.plannerRun))
  ) {
    phase = rest.some((row) => row.toolResult) ? "completed" : "stopped"
  } else if (!pendingOffers.length && !pendingChoices.length && rest.some((row) => row.toolResult)) {
    phase = "completed"
  } else if (!pendingOffers.length && !pendingChoices.length) {
    phase = nextClusterStarts ? "stopped" : hasSignal ? "stopped" : "understanding"
  }

  if (live?.error && liveOnHost && !pendingOffers.length && !pendingChoices.length) {
    phase = "error"
  }
  if (liveBusy && live?.mode === "execute") {
    for (const step of steps) {
      if (step.hostMessageId === live.hostId && step.status !== "done") {
        step.status = "active"
      }
    }
    phase = "executing"
  }

  const visiblePlannerPaso =
    rest.map((row) => row.plannerRun?.paso ?? 0).reduce((max, n) => Math.max(max, n), 0) ||
    Math.max(1, steps.filter((step) => step.status === "done").length + (phase === "completed" ? 0 : 1))
  if (plannerPaso < visiblePlannerPaso) plannerPaso = visiblePlannerPaso

  return {
    id: origin.id,
    originMessageId: origin.id,
    anchorMessageId: anchor.id,
    title: titleFromPedido(pedidoPlanificador || origin.body),
    phase,
    paso: plannerPaso,
    pasoLabel: pasoLabel(phase, plannerPaso, steps.length),
    steps,
    pendingOffers,
    pendingHostId,
    pendingChoices,
    choiceHostId,
    error: live?.error && liveOnHost ? live.error : undefined,
    memberIds,
  }
}

export function deriveChatRootsyOperations(
  messages: ChatMessageRow[],
  live?: ChatRootsyOperationLive,
): ChatRootsyOperationView[] {
  const clusters = collectClusters(messages)
  const out: ChatRootsyOperationView[] = []
  for (let index = 0; index < clusters.length; index += 1) {
    const cluster = clusters[index]
    if (!cluster) continue
    const next = clusters[index + 1]
    const view = buildOperationFromCluster(cluster, Boolean(next), live)
    if (view) out.push(view)
  }
  return out
}

export function isChatRootsyOperationShell(row: ChatMessageRow): boolean {
  if (row.mine) return false
  if (row.toolResult) return true
  const offers = offersOf(row)
  if (!row.body.trim() && (offers.length || row.plannerChoices?.length)) return true
  return false
}

export function chatRootsyApproveLabel(offers: ChatRootsyToolOffer[]): string {
  const visible = offers.filter((offer) => offer.status === "offered")
  if (!visible.length) return "Aprobar"
  if (visible.every((offer) => kindFromMethod(offer.method) === "delete")) {
    return visible.length > 1 ? "Eliminar registros" : "Eliminar…"
  }
  if (visible.some((offer) => kindFromMethod(offer.method) !== "read")) {
    return visible.length > 1 ? "Aprobar actualizaciones" : "Aprobar actualización"
  }
  return visible.length > 1 ? "Aprobar consultas" : "Aprobar consulta"
}

export function chatRootsyRejectLabel(hasProgress: boolean): string {
  return hasProgress ? "Detener operación" : "Rechazar paso"
}

export function chatRootsyOffersAreDestructive(
  offers: ChatRootsyToolOffer[],
): boolean {
  return offers.some((offer) => kindFromMethod(offer.method) === "delete")
}

export function chatRootsyStepDetail(
  step: ChatRootsyOperationStepView,
): { preview: ChatRootsyOfferPreview | null; text: string | null } {
  return {
    preview: null,
    text: step.summary.trim() || null,
  }
}

export function chatRootsyStepUserDetails(
  step: ChatRootsyOperationStepView,
): ChatRootsyOperationStepItemView[] {
  return step.items
}

export function chatRootsyOperationHasUserDetails(
  operation: ChatRootsyOperationView,
): boolean {
  return operation.steps.some((step) => step.items.length > 0)
}
