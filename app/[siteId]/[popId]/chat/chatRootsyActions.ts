"use server"

import { getPopAccessCache } from "@/app/home/homeUserDataActions"
import {
  ROOTSY_AI_HISTORY_BODY,
  ROOTSY_AI_HISTORY_TURNS,
  type ChatRootsyHistoryTurn,
} from "@/app/[siteId]/[popId]/chat/chatRootsy"
import type {
  ChatRootsyToolOffer,
  ChatRootsyToolResult,
} from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  chatRootsyOfferKey,
  compactChatRootsyPlannerChoiceResponse,
  compactChatRootsyPlannerResponse,
  completeChatRootsyPlannerInforme,
  CHAT_ROOTSY_PLANNER_MAX_STEPS,
  preferChatRootsyPlannerAction,
  type ChatRootsyPlannerChoice,
  type ChatRootsyPlannerResultado,
  type ChatRootsyPlannerRun,
} from "@/lib/chat/chatRootsyPlannerStep"
import {
  advanceChatRootsyPlannerRun,
  extractChatRootsyPlannerSlot,
  queriesToPlannerProposalsShape,
  selectChatRootsyPlannerSlotRows,
  type ChatRootsyPlanOferta,
  type ChatRootsyPlannerSlot,
} from "@/lib/chat/chatRootsyPlannerPlan"
import {
  buildChatRootsyDevTrace,
  chatRootsyDevJson,
  chatRootsyDevStep,
  mergeChatRootsyDevTraces,
  type ChatRootsyDevStep,
  type ChatRootsyDevTrace,
} from "@/lib/chat/chatRootsyDevTrace"
import {
  buildChatRootsyBusinessCard,
  CHAT_ROOTSY_FIRST_TURN_PROTOCOL,
  CHAT_ROOTSY_SYSTEM_PROMPT,
  requestChatRootsyFirstTurn,
  requestChatRootsyReplyDetailed,
} from "@/lib/chat/chatRootsyAi"
import {
  logChatRootsyDataRequest,
  peekChatRootsyFirstTurnJson,
  shouldCallChatRootsyPlanner,
} from "@/lib/chat/chatRootsyDataRequest"
import { resolveChatRootsyPlannerRequest } from "@/lib/chat/chatRootsyApiQuery"
import { runChatRootsyTool } from "@/lib/chat/chatRootsyToolRunner"
import {
  buildChatRootsyCloseBrief,
  buildChatRootsyCloseModelPayload,
  CHAT_ROOTSY_CLOSE_PROMPT,
  fallbackChatRootsyCloseReply,
  hechoFromWriteProposal,
  isChatRootsyWriteMethod,
  mergeChatRootsyHechos,
  readChatRootsyCloseReply,
  type ChatRootsyCloseBrief,
  type ChatRootsyCloseHecho,
} from "@/lib/chat/chatRootsyCloseBrief"
import {
  buildChatRootsyToolOffers,
  getChatRootsyToolDefinition,
  sourceItemsForTool,
  type ChatRootsyToolMatchContext,
} from "@/lib/chat/chatRootsyTools"
import {
  CHAT_ROOTSY_PLANNER_MAX_CALLS,
  orderChatRootsyProposals,
  validateChatRootsyPlannerCall,
} from "@/lib/chat/tools/chatRootsyToolPlanner"
import { planChatRootsyTools } from "@/lib/chat/tools/chatRootsyToolPlannerRequest"
import {
  permissionRefFromTool,
  validateChatRootsyProposal,
  type ChatRootsyToolProposal,
} from "@/lib/chat/tools/chatRootsyToolSelect"
import { buildMenuRootsyAllowedModuleIndex } from "@/lib/menu/menuRootsyContext"
import { loadPopPermissionsSnapshot } from "@/lib/popPermissionsServer"
import { validatePopAccess } from "@/lib/popHelpers"
import { requirePopAction } from "@/lib/requirePopAction"
import { siteIdsMatchClientRoute } from "@/lib/popRoutes"
import { humanizeChatRootsyApiError } from "@/lib/chat/chatRootsyApiError"
import { chatRootsyOffersAutoExecute } from "@/lib/chat/chatRootsyOperation"
import type { PopAccessCache } from "@/app/home/homeUserDataTypes"

function plannerRoundSteps(input: {
  paso: number
  sent?: string | null
  raw?: string | null
  source?: string
  note?: string
  offers?: unknown
  skipped?: boolean
}): ChatRootsyDevStep[] {
  if (input.skipped && !input.sent && !input.raw) {
    return [
      chatRootsyDevStep({
        lane: "planner",
        title: `Paso ${input.paso} · no llamado`,
        note: input.note ?? "El Planificador no corre en este turno.",
      }),
    ]
  }
  return [
    chatRootsyDevStep({
      lane: "planner",
      title: `Paso ${input.paso} · input`,
      note: input.note,
      body: input.sent ?? "(no se envió)",
    }),
    chatRootsyDevStep({
      lane: "planner",
      title: `Paso ${input.paso} · crudo`,
      note: input.source ? `Fuente: ${input.source}` : undefined,
      body: input.raw ?? "(no hubo respuesta)",
    }),
    chatRootsyDevStep({
      lane: "planner",
      title: `Paso ${input.paso} · ofertas`,
      body: input.offers ?? [],
    }),
  ]
}

async function narrateChatRootsyClose(input: {
  popAccess: PopAccessCache
  siteId: string
  pedido: string
  brief: ChatRootsyCloseBrief
}): Promise<{
  reply: string
  narrationText: string | null
  narrationError?: string
}> {
  const fallback = fallbackChatRootsyCloseReply(input.brief)
  const seen = new Set<string>()
  const modules: Array<{ key: string; label: string }> = []
  for (const mod of buildMenuRootsyAllowedModuleIndex(
    input.popAccess,
    input.siteId,
  ).values()) {
    if (seen.has(mod.moduleKey)) continue
    seen.add(mod.moduleKey)
    modules.push({ key: mod.moduleKey, label: mod.label })
  }
  const system = [
    CHAT_ROOTSY_SYSTEM_PROMPT,
    CHAT_ROOTSY_CLOSE_PROMPT,
    "Tarjeta del negocio (JSON):",
    JSON.stringify(
      buildChatRootsyBusinessCard({
        popName: input.popAccess.pop.name,
        businessType:
          input.popAccess.subscription.businessTypeDisplayName ||
          input.popAccess.subscription.businessTypeName ||
          "Negocio",
        roleName: input.popAccess.isOwner
          ? "Dueño"
          : input.popAccess.role?.displayName?.trim() ||
            input.popAccess.role?.name?.trim() ||
            "Miembro",
        isOwner: input.popAccess.isOwner,
        modules,
      }),
    ),
  ].join("\n")
  const closeHistory = [
    { role: "user" as const, body: input.pedido || "Cerrá esta corrida." },
    {
      role: "user" as const,
      body: `Hechos ya confirmados (JSON):\n${chatRootsyDevJson(buildChatRootsyCloseModelPayload(input.brief))}`,
    },
  ]
  const narration = await requestChatRootsyReplyDetailed(system, closeHistory, {
    sanitizeReply: false,
  })
  const narrationText = readChatRootsyCloseReply(narration.text)
  return {
    reply: narrationText ?? fallback,
    narrationText,
    narrationError: narration.error,
  }
}

function closeNarrationDevSteps(input: {
  closeBrief?: ChatRootsyCloseBrief
  narrationText: string | null
  narrationError?: string
  reply: string
}): ChatRootsyDevStep[] {
  return [
    chatRootsyDevStep({
      lane: "close",
      title: "Informe para Rootsy",
      note: input.narrationText
        ? input.closeBrief?.estado === "no_aplicado"
          ? "Cierre fallido. Rootsy narra el rechazo."
          : input.closeBrief?.informe?.respuesta
            ? "Cierre con informe del Planificador. Rootsy narra eso."
            : "Cierre con hechos. Rootsy solo narra esto."
        : `Fallback. ${input.narrationError ?? ""}`.trim(),
      body: input.closeBrief,
    }),
    chatRootsyDevStep({
      lane: "rootsy",
      title: "Cierre · crudo",
      note: input.narrationText
        ? "Reply de cierre."
        : "La IA no narró. Se usó el fallback.",
      body: input.narrationText ?? input.reply,
    }),
  ]
}

export type SendRootsyChatResult =
  | {
      success: true
      reply: string
      followUpReply?: string
      needsPlanner?: boolean
      toolOffer?: ChatRootsyToolOffer
      toolOffers?: ChatRootsyToolOffer[]
      toolResults?: ChatRootsyToolResult[]
      plannerRun?: ChatRootsyPlannerRun
      plannerChoices?: ChatRootsyPlannerChoice[]
      closeBrief?: ChatRootsyCloseBrief
      executionError?: string
      devTrace?: ChatRootsyDevTrace
    }
  | { success: false; error: string; devTrace?: ChatRootsyDevTrace }

export async function sendRootsyChatMessage(input: {
  popId: string
  siteId: string
  history: ChatRootsyHistoryTurn[]
  toolContext?: ChatRootsyToolMatchContext
  appliedActions?: ChatRootsyCloseHecho[]
}): Promise<SendRootsyChatResult> {
  const popId = input.popId.trim()
  const siteId = input.siteId.trim()
  if (!popId || !siteId) {
    return { success: false, error: "Parámetros inválidos" }
  }

  const history = input.history
    .filter(
      (turn) =>
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.body === "string" &&
        turn.body.trim().length > 0,
    )
    .map((turn) => ({
      role: turn.role,
      body: turn.body.trim().slice(0, ROOTSY_AI_HISTORY_BODY),
    }))
    .slice(-ROOTSY_AI_HISTORY_TURNS)

  if (history.length === 0 || history[history.length - 1]?.role !== "user") {
    return { success: false, error: "Escribí un mensaje para Rootsy." }
  }

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }

  if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
    return { success: false, error: "Sitio inválido para este negocio" }
  }

  const lastUser = history[history.length - 1]
  if (!lastUser) {
    return { success: false, error: "Escribí un mensaje para Rootsy." }
  }

  const seen = new Set<string>()
  const modules: Array<{ key: string; label: string }> = []
  for (const mod of buildMenuRootsyAllowedModuleIndex(popAccess, siteId).values()) {
    if (seen.has(mod.moduleKey)) continue
    seen.add(mod.moduleKey)
    modules.push({ key: mod.moduleKey, label: mod.label })
  }

  const system = [
    CHAT_ROOTSY_SYSTEM_PROMPT,
    CHAT_ROOTSY_FIRST_TURN_PROTOCOL,
    "Tarjeta del negocio (JSON):",
    JSON.stringify(
      buildChatRootsyBusinessCard({
        popName: popAccess.pop.name,
        businessType:
          popAccess.subscription.businessTypeDisplayName ||
          popAccess.subscription.businessTypeName ||
          "Negocio",
        roleName: popAccess.isOwner
          ? "Dueño"
          : popAccess.role?.displayName?.trim() ||
            popAccess.role?.name?.trim() ||
            "Miembro",
        isOwner: popAccess.isOwner,
        modules,
      }),
    ),
  ]
    .filter(Boolean)
    .join("\n")

  const appliedActions = input.appliedActions ?? []
  const firstFetch = await requestChatRootsyFirstTurn(system, history, {
    sessionActions: appliedActions,
  })
  const firstTurn = firstFetch.turn
  if (!firstTurn?.reply) {
    const realError =
      firstFetch.error ?? "La IA no devolvió un reply usable."
    return {
      success: false,
      error: "Rootsy no pudo responder ahora. Probá de nuevo en un momento.",
      devTrace: buildChatRootsyDevTrace(
        [
          chatRootsyDevStep({
            lane: "rootsy",
            title: "Apertura · crudo",
            note: `Fuente: ${firstFetch.source}. No hubo reply usable.`,
            body: firstFetch.raw ?? "(vacío)",
          }),
        ],
        { error: realError },
      ),
    }
  }

  logChatRootsyDataRequest(firstTurn.data_request)
  const peeked = firstFetch.raw
    ? peekChatRootsyFirstTurnJson(firstFetch.raw)
    : null
  const rawDataRequest =
    peeked && typeof peeked === "object" && peeked !== null
      ? (peeked as { data_request?: unknown }).data_request
      : undefined

  const needsPlanner = shouldCallChatRootsyPlanner(firstTurn)
  const plannerRun: ChatRootsyPlannerRun | undefined = firstTurn.data_request
    ? {
        message: lastUser.body,
        dataRequest: firstTurn.data_request,
        ...(firstTurn.task_title ? { taskTitle: firstTurn.task_title } : {}),
        paso: 1,
        slots: [],
        resultados: [],
        accionesSesion: appliedActions,
      }
    : undefined

  return {
    success: true,
    reply: firstTurn.reply,
    needsPlanner,
    plannerRun,
    devTrace: buildChatRootsyDevTrace([
      chatRootsyDevStep({
        lane: "rootsy",
        title: "Apertura · contexto",
        note:
          appliedActions.length > 0
            ? `Se inyectaron ${appliedActions.length} acciones de sesión.`
            : "Sin acciones_sesion.",
        body: {
          pedido: lastUser.body,
          acciones_sesion: appliedActions,
        },
      }),
      chatRootsyDevStep({
        lane: "rootsy",
        title: "Apertura · crudo",
        note: `Fuente: ${firstFetch.source}`,
        body: firstFetch.raw ?? "(vacío)",
      }),
      chatRootsyDevStep({
        lane: "rootsy",
        title: "Apertura · parseado",
        note: needsPlanner
          ? "Hay data_request válido → el globo se muestra y sigue el Planificador."
          : rawDataRequest != null
            ? "data_request vino y se descartó en la validación."
            : "data_request es null. El Planificador no corre.",
        body: {
          reply: firstTurn.reply,
          data_request: firstTurn.data_request,
          data_request_crudo: rawDataRequest ?? null,
        },
      }),
      ...(!needsPlanner
        ? plannerRoundSteps({
            paso: 1,
            skipped: true,
            note:
              rawDataRequest != null
                ? "Rootsy mandó data_request, pero no pasó la validación. El planificador no corre."
                : "No se llamó: data_request quedó null, así que el planificador no corre.",
          })
        : []),
    ]),
  }
}

export async function startRootsyPlannerRun(input: {
  popId: string
  siteId: string
  history: ChatRootsyHistoryTurn[]
  toolContext?: ChatRootsyToolMatchContext
  plannerRun: ChatRootsyPlannerRun
}): Promise<SendRootsyChatResult> {
  const popId = input.popId.trim()
  const siteId = input.siteId.trim()
  if (!popId || !siteId) {
    return { success: false, error: "Parámetros inválidos" }
  }
  if (!input.plannerRun.dataRequest) {
    return { success: false, error: "No hay pedido para el Planificador." }
  }

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }
  if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
    return { success: false, error: "Sitio inválido para este negocio" }
  }

  const snapshot = await loadPopPermissionsSnapshot(popId)
  const plan = await planChatRootsyTools({
    dataRequest: input.plannerRun.dataRequest,
    context: input.toolContext,
    permissionKeys: snapshot.keys,
  })
  const toolOffers = buildChatRootsyToolOffers(plan.proposals)
  const plannerSource = plan.storedError
    ? `${plan.source} · ${plan.storedError}`
    : plan.source
  const plannerNote = plan.clarifyingQuestion
    ? `Aclaración: ${plan.clarifyingQuestion}. Descartadas: ${plan.discarded}. Ofertas: ${toolOffers.length}.`
    : `Descartadas: ${plan.discarded}. Ofertas armadas: ${toolOffers.length}.`
  const plannerAiError =
    plan.storedError && !plan.raw
      ? `Planificador: ${plan.storedError}`
      : undefined
  if (plan.clarifyingQuestion) {
    console.info("[rootsy-planner]", {
      clarifying: true,
      discarded: plan.discarded,
    })
  }
  if (toolOffers.length) {
    console.info("[rootsy-tool]", {
      tools: toolOffers.map((row) => row.tool),
      outcome: "offered",
    })
  }

  const plannerRun: ChatRootsyPlannerRun = {
    ...input.plannerRun,
    paso: 1,
    plan: plan.steps,
    informe: plan.informe,
  }
  const closeBrief =
    Boolean(plan.done) && !toolOffers.length && plan.informe
      ? buildChatRootsyCloseBrief({
          pedido: input.plannerRun.message,
          proposals: [],
          informe: plan.informe,
        })
      : undefined
  const plannerTrace = buildChatRootsyDevTrace(
    plannerRoundSteps({
      paso: 1,
      sent: plan.sent,
      raw: plan.raw,
      source: plannerSource,
      note: plannerNote,
      offers: toolOffers,
    }),
    { error: plannerAiError },
  )

  if (toolOffers.length && chatRootsyOffersAutoExecute(toolOffers)) {
    const executed = await runRootsyChatTools({
      popId,
      siteId,
      history: input.history,
      plannerRun,
      queries: queriesFromOffers(toolOffers),
      recent: input.toolContext?.recent,
    })
    if (executed.success) {
      return {
        success: true,
        reply: "",
        followUpReply: executed.reply.trim() || undefined,
        toolResults: executed.toolResults,
        toolOffers: executed.toolOffers,
        plannerRun: executed.plannerRun ?? plannerRun,
        plannerChoices: executed.plannerChoices,
        closeBrief: executed.closeBrief ?? closeBrief,
        executionError: executed.executionError,
        devTrace:
          mergeChatRootsyDevTraces([plannerTrace, executed.devTrace]) ??
          undefined,
      }
    }
  }

  return {
    success: true,
    reply: "",
    toolOffer: toolOffers[0],
    toolOffers: toolOffers.length ? toolOffers : undefined,
    plannerRun,
    closeBrief,
    devTrace: plannerTrace,
  }
}

export async function runRootsyChatTool(input: {
  popId: string
  siteId: string
  tool: string
  history: ChatRootsyHistoryTurn[]
  sourceItems?: ChatRootsyToolMatchContext["recent"][number]["items"]
  filters?: Record<string, string | number | boolean>
}): Promise<
  | { success: true; reply: string; toolResult: ChatRootsyToolResult }
  | { success: false; error: string }
> {
  const toolName = input.tool.trim()
  const tool = getChatRootsyToolDefinition(toolName)
  const recent = input.sourceItems?.length
    ? (tool?.requiresRecent ?? [toolName]).map((dep) => ({
        tool: dep,
        items: input.sourceItems!,
      }))
    : []
  const res = await runRootsyChatTools({
    popId: input.popId,
    siteId: input.siteId,
    history: input.history,
    queries: [{ tool: input.tool, filters: input.filters }],
    recent,
  })
  if (!res.success) return res
  if (res.executionError) {
    return { success: false, error: res.executionError }
  }
  const toolResult = res.toolResults[0]
  if (!toolResult) {
    return { success: false, error: "Parámetros inválidos" }
  }
  return { success: true, reply: res.reply, toolResult }
}

type RootsyToolQuery = {
  tool: string
  filters?: Record<string, string | number | boolean>
  method?: string
  path?: string
  body?: Record<string, unknown>
  action?: string
  subject?: string
  confirm?: ChatRootsyToolOffer["confirm"]
  offerKey?: string
}

function offersFromPlanOfertas(
  queries: ChatRootsyPlanOferta[],
  resultados?: ChatRootsyPlannerResultado[],
  confirm?: ChatRootsyToolOffer["confirm"],
  stepAction?: string,
): ChatRootsyToolOffer[] {
  const proposals: ChatRootsyToolProposal[] = []
  for (const query of queriesToPlannerProposalsShape(queries, confirm)) {
    const proposal = validateChatRootsyPlannerCall({
      path: query.path,
      method: query.method,
      filters: query.filters,
      body: query.body,
    })
    if (!proposal) continue
    const next = {
      ...proposal,
      action: preferChatRootsyPlannerAction(
        query.action,
        stepAction,
        query.method,
      ),
      confirm: query.confirm,
    }
    proposals.push({
      ...next,
      offerKey: chatRootsyOfferKey(next),
    })
  }
  return buildChatRootsyToolOffers(proposals, resultados)
}

function applyPlanAdvance(input: {
  popId?: string
  run: ChatRootsyPlannerRun
  afterPick?: boolean
}): {
  toolOffers?: ChatRootsyToolOffer[]
  plannerRun: ChatRootsyPlannerRun
  plannerChoices?: ChatRootsyPlannerChoice[]
  note: string
} {
  const advanced = advanceChatRootsyPlannerRun({
    run: input.run,
    afterPick: input.afterPick,
  })
  if (advanced.kind === "pick") {
    return {
      plannerRun: advanced.run,
      plannerChoices: [advanced.choice],
      note:
        advanced.choice.confirm === "confirm_many"
          ? "Esperando que elijan uno, varios o todos (confirm_many)."
          : "Esperando que elijan un resultado (confirm_one).",
    }
  }
  if (advanced.kind === "offers") {
    const step = advanced.run.plan?.find((row) => row.paso === advanced.run.paso)
    const toolOffers = offersFromPlanOfertas(
      advanced.queries,
      advanced.run.resultados,
      step?.confirm,
      step?.action,
    )
    return {
      toolOffers,
      plannerRun: advanced.run,
      note: `Paso ${advanced.run.paso}. Ofertas: ${toolOffers.length}.`,
    }
  }
  return {
    plannerRun: advanced.run,
    note: "Plan completo.",
  }
}

function queriesFromOffers(offers: ChatRootsyToolOffer[]): RootsyToolQuery[] {
  return offers.map((offer) => ({
    tool: offer.tool,
    filters: offer.filters,
    method: offer.method,
    path: offer.path,
    body: offer.body,
    action: offer.action ?? offer.label,
    subject: offer.preview?.subject,
    confirm: offer.confirm,
    offerKey: offer.offerKey ?? chatRootsyOfferKey(offer),
  }))
}

export async function runRootsyChatTools(input: {
  popId: string
  siteId: string
  history: ChatRootsyHistoryTurn[]
  queries: RootsyToolQuery[]
  recent?: ChatRootsyToolMatchContext["recent"]
  plannerRun?: ChatRootsyPlannerRun
  readChain?: number
}): Promise<
  | {
      success: true
      reply: string
      toolResults: ChatRootsyToolResult[]
      toolOffers?: ChatRootsyToolOffer[]
      plannerRun?: ChatRootsyPlannerRun
      plannerChoices?: ChatRootsyPlannerChoice[]
      closeBrief?: ChatRootsyCloseBrief
      executionError?: string
      devTrace?: ChatRootsyDevTrace
    }
  | { success: false; error: string; devTrace?: ChatRootsyDevTrace }
> {
  const popId = input.popId.trim()
  const siteId = input.siteId.trim()
  if (!popId || !siteId || input.queries.length === 0) {
    return { success: false, error: "Parámetros inválidos" }
  }

  const history = input.history
    .filter(
      (turn) =>
        (turn.role === "user" || turn.role === "assistant") &&
        typeof turn.body === "string" &&
        turn.body.trim().length > 0,
    )
    .map((turn) => ({
      role: turn.role,
      body: turn.body.trim().slice(0, ROOTSY_AI_HISTORY_BODY),
    }))
    .slice(-ROOTSY_AI_HISTORY_TURNS)

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }

  if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
    return { success: false, error: "Sitio inválido para este negocio" }
  }

  const proposals: ChatRootsyToolProposal[] = []
  for (const query of input.queries.slice(0, CHAT_ROOTSY_PLANNER_MAX_CALLS)) {
    const proposal = validateChatRootsyProposal({
      tool: query.tool.trim(),
      filters: query.filters ?? {},
      method: query.method,
      path: query.path,
      body: query.body,
    })
    if (proposal) {
      const next = {
        ...proposal,
        action: query.action,
        confirm: query.confirm,
        subject: query.subject,
      }
      proposals.push({
        ...next,
        offerKey: query.offerKey ?? chatRootsyOfferKey(next),
      })
    }
  }
  if (!proposals.length) {
    return {
      success: false,
      error: "Parámetros inválidos",
      devTrace: buildChatRootsyDevTrace([
        chatRootsyDevStep({
          lane: "api",
          title: "Consultas · inválidas",
          note: "Ninguna query pasó la validación.",
          body: input.queries,
        }),
      ]),
    }
  }

  const ordered = orderChatRootsyProposals(proposals)
  const recent: ChatRootsyToolMatchContext["recent"] = [
    ...(input.recent ?? []),
  ]
  const toolResults: ChatRootsyToolResult[] = []
  const runLog: unknown[] = []
  let lastError = "No se pudieron consultar esos datos."

  for (const proposal of ordered) {
    const apiRequest = resolveChatRootsyPlannerRequest({
      id: proposal.tool,
      path: proposal.path,
      method: proposal.method,
    })
    if (!apiRequest.ok) {
      const permission = permissionRefFromTool(proposal.tool)
      if (!permission) {
        lastError = "Sin permiso."
        runLog.push({ id: proposal.tool, ok: false, error: lastError })
        continue
      }
      const permitted = await requirePopAction(popId, permission)
      if (!permitted.ok) {
        lastError = permitted.error || "Sin permiso."
        runLog.push({ id: proposal.tool, ok: false, error: lastError })
        continue
      }
    }

    const executed = await runChatRootsyTool(
      popId,
      proposal,
      sourceItemsForTool(proposal.tool, { recent }),
      {
        resultados: input.plannerRun?.resultados,
        recent,
      },
    )
    if (!executed.ok) {
      console.info("[rootsy-tool]", {
        tool: proposal.tool,
        outcome: "fetch_failed",
      })
      lastError = executed.error
      runLog.push({
        id: proposal.tool,
        filters: proposal.filters,
        ok: false,
        error: executed.error,
      })
      continue
    }
    runLog.push({
      id: proposal.tool,
      filters: proposal.filters,
      ok: true,
      items: executed.result.items.length,
    })
    toolResults.push({
      ...executed.result,
      title: proposal.action,
      offerKey: proposal.offerKey,
      applied: isChatRootsyWriteMethod(proposal.method)
        ? hechoFromWriteProposal(proposal, input.plannerRun?.resultados)
        : undefined,
    })
    if (executed.result.items.length) {
      recent.push({
        tool: executed.result.tool,
        items: executed.result.items.map((item) => ({
          id: item.id,
          name: item.name,
        })),
      })
    }
  }

  if (!toolResults.length) {
    const subject =
      ordered[0]
        ? hechoFromWriteProposal(ordered[0], input.plannerRun?.resultados)
            .sujeto
        : undefined
    const human = humanizeChatRootsyApiError(lastError, {
      subject,
      method: ordered[0]?.method,
      path: ordered[0]?.path,
      tool: ordered[0]?.tool,
    })
    const pedido =
      input.plannerRun?.message.trim() ||
      [...history].reverse().find((turn) => turn.role === "user")?.body ||
      ""
    const closeBrief = buildChatRootsyCloseBrief({
      pedido,
      proposals: ordered,
      resultados: input.plannerRun?.resultados,
      error: human,
    })
    const narration = await narrateChatRootsyClose({
      popAccess,
      siteId,
      pedido,
      brief: closeBrief,
    })
    return {
      success: true as const,
      reply: narration.reply,
      toolResults: [],
      plannerRun: input.plannerRun,
      closeBrief,
      executionError: human,
      devTrace: buildChatRootsyDevTrace(
        [
          chatRootsyDevStep({
            lane: "api",
            title: `Paso ${input.plannerRun?.paso ?? "?"} · consultas`,
            note: lastError,
            body: runLog,
          }),
          ...closeNarrationDevSteps({
            closeBrief,
            narrationText: narration.narrationText,
            narrationError: narration.narrationError,
            reply: narration.reply,
          }),
        ],
        { error: lastError },
      ),
    }
  }

  const next = await continuePlannerAfterResults({
    popId,
    plannerRun: input.plannerRun,
    proposals: ordered,
    toolResults,
    toolContext: { recent },
  })

  const plannerContinues = Boolean(
    next.toolOffers?.length || next.plannerChoices?.length,
  )
  let reply = ""
  let narrationText: string | null = null
  let narrationError: string | undefined
  let closeBrief: ReturnType<typeof buildChatRootsyCloseBrief> | undefined
  if (!plannerContinues) {
    const pedido =
      input.plannerRun?.message.trim() ||
      [...history].reverse().find((turn) => turn.role === "user")?.body ||
      ""
    const brief = buildChatRootsyCloseBrief({
      pedido,
      proposals: ordered,
      resultados: input.plannerRun?.resultados,
      toolResults,
      previos: input.plannerRun?.aplicados,
      informe: completeChatRootsyPlannerInforme(
        next.plannerRun?.informe ?? input.plannerRun?.informe,
        next.plannerRun?.resultados ?? input.plannerRun?.resultados ?? [],
      ),
    })
    closeBrief = brief
    const narration = await narrateChatRootsyClose({
      popAccess,
      siteId,
      pedido,
      brief,
    })
    narrationText = narration.narrationText
    narrationError = narration.narrationError
    reply = narration.reply
  }

  console.info("[rootsy-tool]", {
    tools: toolResults.map((row) => row.tool),
    outcome: "ok",
  })
  const plannerRun = next.plannerRun
    ? {
        ...next.plannerRun,
        aplicados: mergeChatRootsyHechos(
          input.plannerRun?.aplicados,
          toolResults
            .map((row) => row.applied)
            .filter((hecho): hecho is ChatRootsyCloseHecho => Boolean(hecho)),
        ),
      }
    : next.plannerRun
  const result = {
    success: true as const,
    reply,
    toolResults,
    toolOffers: next.toolOffers,
    plannerRun,
    plannerChoices: next.plannerChoices,
    closeBrief,
    devTrace: buildChatRootsyDevTrace(
      [
        chatRootsyDevStep({
          lane: "api",
          title: `Paso ${input.plannerRun?.paso ?? "?"} · consultas`,
          note: `${toolResults.length} respuesta(s) de la API.`,
          body: {
            runLog,
            resultados: next.plannerRun?.resultados ?? [],
          },
        }),
        ...(next.plannerChoices?.length
          ? [
              chatRootsyDevStep({
                lane: "choice",
                title:
                  next.plannerChoices.some((row) => row.confirm === "confirm_many")
                    ? "confirm_many · esperando elección"
                    : "confirm_one · esperando elección",
                note: next.note,
                body: next.plannerChoices,
              }),
            ]
          : plannerContinues || next.plannerSent
            ? plannerRoundSteps({
                paso: next.plannerRun?.paso ?? (input.plannerRun?.paso ?? 1) + 1,
                sent: next.plannerSent,
                raw: next.plannerRaw,
                source: next.plannerSource,
                note: next.note,
                offers: next.toolOffers ?? [],
              })
            : []),
        ...(!plannerContinues
          ? closeNarrationDevSteps({
              closeBrief,
              narrationText,
              narrationError,
              reply,
            })
          : []),
      ],
      {
        error:
          !plannerContinues && !narrationText && narrationError
            ? `Rootsy final: ${narrationError}`
            : undefined,
      },
    ),
  }

  const nextReads = next.toolOffers ?? []
  if (
    nextReads.length &&
    !next.plannerChoices?.length &&
    chatRootsyOffersAutoExecute(nextReads) &&
    (input.readChain ?? 0) < CHAT_ROOTSY_PLANNER_MAX_STEPS - 1
  ) {
    const chained = await runRootsyChatTools({
      popId,
      siteId,
      history: input.history,
      queries: queriesFromOffers(nextReads),
      recent,
      plannerRun,
      readChain: (input.readChain ?? 0) + 1,
    })
    if (!chained.success) return chained
    return {
      ...chained,
      toolResults: [...toolResults, ...chained.toolResults],
      devTrace:
        mergeChatRootsyDevTraces([result.devTrace, chained.devTrace]) ??
        undefined,
    }
  }

  return result
}

async function continuePlannerAfterResults(input: {
  popId: string
  plannerRun?: ChatRootsyPlannerRun
  proposals: ChatRootsyToolProposal[]
  toolResults: ChatRootsyToolResult[]
  toolContext?: ChatRootsyToolMatchContext
}): Promise<{
  toolOffers?: ChatRootsyToolOffer[]
  plannerRun?: ChatRootsyPlannerRun
  plannerChoices?: ChatRootsyPlannerChoice[]
  plannerSent?: string | null
  plannerRaw?: string | null
  plannerSource?: string
  note: string
}> {
  const run = input.plannerRun
  if (!run) {
    return { note: "Sin corrida del planificador." }
  }

  const byKey = new Map(
    input.toolResults.map((row) => [row.offerKey ?? row.tool, row]),
  )
  const resultados: ChatRootsyPlannerResultado[] = [...run.resultados]
  const slots: ChatRootsyPlannerSlot[] = [...(run.slots ?? [])]
  const currentStep =
    run.plan?.find((row) => row.paso === run.paso) ??
    run.plan?.[Math.max(0, run.paso - 1)]

  for (const [index, proposal] of input.proposals.entries()) {
    const result =
      byKey.get(proposal.offerKey ?? chatRootsyOfferKey(proposal)) ??
      input.toolResults.find((row) => row.tool === proposal.tool)
    if (!result) continue
    const method = proposal.method ?? "GET"
    const path = proposal.path ?? ""
    const action = proposal.action ?? result.title ?? "Continuar con esta acción"
    const confirm = proposal.confirm ?? "confirm"
    resultados.push({
      method,
      path,
      action,
      confirm,
      response: compactChatRootsyPlannerResponse(result.payload ?? result.items),
    })
    if (currentStep) {
      slots.push(
        extractChatRootsyPlannerSlot({
          paso: currentStep.paso,
          oferta: index,
          tool: proposal.tool,
          method,
          path,
          action,
          demandas: currentStep.demandas,
          items: result.items,
          payload: result.payload,
        }),
      )
    }
  }

  if (run.plan?.length) {
    return applyPlanAdvance({
      run: { ...run, resultados, slots },
    })
  }

  return {
    plannerRun: { ...run, resultados, slots },
    note: "Plan completo.",
  }
}

export async function continueRootsyPlannerRun(input: {
  popId: string
  siteId: string
  plannerRun: ChatRootsyPlannerRun
  choice: ChatRootsyPlannerChoice
  items: Array<{ id?: string; name: string; sales?: number; balance?: number }>
}): Promise<SendRootsyChatResult> {
  const popId = input.popId.trim()
  const siteId = input.siteId.trim()
  if (!popId || !siteId) {
    return { success: false, error: "Parámetros inválidos" }
  }
  const items = input.items.filter((item) => item.id?.trim() || item.name.trim())
  if (!items.length) {
    return { success: false, error: "Elegí al menos un resultado" }
  }

  const access = await validatePopAccess(popId)
  if (!access.hasAccess || !access.isActive) {
    return { success: false, error: access.error || "Sin acceso" }
  }

  const popAccess = await getPopAccessCache(popId)
  if (!popAccess?.canEnter) {
    return { success: false, error: "No se pudo cargar el acceso al negocio" }
  }
  if (!siteIdsMatchClientRoute(siteId, popAccess.pop.siteId)) {
    return { success: false, error: "Sitio inválido para este negocio" }
  }

  const confirm = input.choice.confirm ?? "confirm_one"
  const resultados: ChatRootsyPlannerResultado[] = [
    ...input.plannerRun.resultados,
    {
      method: input.choice.method,
      path: input.choice.path,
      action: input.choice.action,
      confirm,
      response: compactChatRootsyPlannerChoiceResponse(input.choice, items),
    },
  ]
  const slots = (input.plannerRun.slots ?? []).map((slot) =>
    slot.tool === input.choice.tool ||
    (slot.method === input.choice.method && slot.path === input.choice.path)
      ? selectChatRootsyPlannerSlotRows(slot, items)
      : slot,
  )
  const run: ChatRootsyPlannerRun = {
    ...input.plannerRun,
    resultados,
    slots,
  }
  const next = applyPlanAdvance({ run, afterPick: true })

  if (
    next.toolOffers?.length &&
    chatRootsyOffersAutoExecute(next.toolOffers) &&
    next.plannerRun
  ) {
    const executed = await runRootsyChatTools({
      popId,
      siteId,
      history: [
        {
          role: "user",
          body: input.plannerRun.message,
        },
      ],
      plannerRun: next.plannerRun,
      queries: queriesFromOffers(next.toolOffers),
    })
    if (executed.success) {
      return {
        success: true,
        reply: executed.reply,
        followUpReply: executed.reply.trim() || undefined,
        toolResults: executed.toolResults,
        toolOffers: executed.toolOffers,
        plannerRun: executed.plannerRun ?? next.plannerRun,
        plannerChoices: executed.plannerChoices,
        closeBrief: executed.closeBrief,
        executionError: executed.executionError,
        devTrace:
          mergeChatRootsyDevTraces([
            buildChatRootsyDevTrace([
              chatRootsyDevStep({
                lane: "choice",
                title: "Ítem elegido",
                note: input.choice.action,
                body: {
                  elegidos: items,
                  resultados,
                },
              }),
            ]),
            executed.devTrace,
          ]) ?? undefined,
      }
    }
  }

  const reply = next.toolOffers?.length
    ? ""
    : next.note.startsWith("Aclaración")
      ? next.note.replace(/^Aclaración:\s*/, "")
      : "Listo, con eso ya puedo cerrar."

  return {
    success: true,
    reply,
    toolOffer: next.toolOffers?.[0],
    toolOffers: next.toolOffers,
    plannerRun: next.plannerRun,
    devTrace: buildChatRootsyDevTrace([
      chatRootsyDevStep({
        lane: "choice",
        title: "Ítem elegido",
        note: input.choice.action,
        body: {
          elegidos: items,
          resultados,
        },
      }),
      ...plannerRoundSteps({
        paso: next.plannerRun?.paso ?? input.plannerRun.paso + 1,
        sent: null,
        raw: null,
        source: "plan-local",
        note: next.note,
        offers: next.toolOffers ?? [],
      }),
    ]),
  }
}
