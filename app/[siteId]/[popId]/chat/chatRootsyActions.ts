"use server"

import { getPopAccessCache, getUserProfileCache } from "@/app/home/homeUserDataActions"
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
  canContinueChatRootsyPlanner,
  chatRootsyOfferKey,
  compactChatRootsyPlannerChoiceResponse,
  compactChatRootsyPlannerResponse,
  completeChatRootsyPlannerInforme,
  CHAT_ROOTSY_PLANNER_MAX_STEPS,
  isChatRootsyPlannerPickConfirm,
  preferChatRootsyPlannerAction,
  resolveChatRootsyPlannerPickConfirm,
  type ChatRootsyPlannerChoice,
  type ChatRootsyPlannerResultado,
  type ChatRootsyPlannerRun,
} from "@/lib/chat/chatRootsyPlannerStep"
import {
  extractChatRootsyPlannerSlot,
  instantiateChatRootsyPlanStep,
  queriesToPlannerProposalsShape,
  selectChatRootsyPlannerSlotRows,
  type ChatRootsyPlanOferta,
  type ChatRootsyPlannerSlot,
} from "@/lib/chat/chatRootsyPlannerPlan"
import {
  buildChatRootsyDevTrace,
  chatRootsyDevCall,
  chatRootsyDevJson,
  mergeChatRootsyDevTraces,
  type ChatRootsyDevCall,
  type ChatRootsyDevTrace,
} from "@/lib/chat/chatRootsyDevTrace"
import {
  buildChatRootsyBusinessCard,
  formatChatRootsyPersonPopMessage,
  type ChatRootsyBusinessCard,
} from "@/lib/chat/chatRootsyPersonPop"
import {
  CHAT_ROOTSY_FIRST_TURN_PROTOCOL,
  CHAT_ROOTSY_SYSTEM_PROMPT,
  requestChatRootsyFirstTurn,
  requestChatRootsyNarration,
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
  buildChatRootsyClarifyModelPayload,
  buildChatRootsyCloseModelPayload,
  CHAT_ROOTSY_CLOSE_PROMPT,
  CHAT_ROOTSY_CLARIFY_PROMPT,
  fallbackChatRootsyCloseReply,
  fallbackChatRootsyClarifyReply,
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
  OPENAI_PROMPT_ROOTSY_ENV,
  readOpenAiPromptId,
} from "@/lib/chat/openaiStoredPrompt"
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

function plannerDevCall(input: {
  sent?: string | null
  received?: string | null
  source?: string
  note?: string
  paso?: number
}): ChatRootsyDevCall {
  const paso = input.paso && input.paso > 0 ? input.paso : 1
  return chatRootsyDevCall({
    id: `call:planner:${paso}`,
    actor: "planner",
    phase: `Viaje ${paso}`,
    note: [input.source ? `Fuente: ${input.source}` : "", input.note ?? ""]
      .filter(Boolean)
      .join(" · ") || undefined,
    sent: input.sent,
    received: input.received,
  })
}

function rootsyDevCall(input: {
  id: string
  phase: string
  userMessage?: string
  sent?: string | null
  received?: string | null
  note?: string
}): ChatRootsyDevCall {
  return chatRootsyDevCall({
    id: input.id,
    actor: "rootsy",
    phase: input.phase,
    userMessage: input.userMessage,
    sent: input.sent,
    received: input.received,
    note: input.note,
  })
}

function chatRootsyModulesFromAccess(
  popAccess: PopAccessCache,
  siteId: string,
): Array<{ key: string; label: string }> {
  const seen = new Set<string>()
  const modules: Array<{ key: string; label: string }> = []
  for (const mod of buildMenuRootsyAllowedModuleIndex(popAccess, siteId).values()) {
    if (seen.has(mod.moduleKey)) continue
    seen.add(mod.moduleKey)
    modules.push({ key: mod.moduleKey, label: mod.label })
  }
  return modules
}

async function loadChatRootsyBusinessCard(
  popAccess: PopAccessCache,
  siteId: string,
): Promise<ChatRootsyBusinessCard> {
  const profile = await getUserProfileCache()
  return buildChatRootsyBusinessCard({
    firstName: profile.firstName,
    lastName: profile.lastName,
    roleName: popAccess.isOwner
      ? "Dueño"
      : popAccess.role?.displayName?.trim() ||
        popAccess.role?.name?.trim() ||
        "Miembro",
    isOwner: popAccess.isOwner,
    popName: popAccess.pop.name,
    businessType:
      popAccess.subscription.businessTypeDisplayName ||
      popAccess.subscription.businessTypeName ||
      "Negocio",
    modules: chatRootsyModulesFromAccess(popAccess, siteId),
  })
}

async function chatRootsyNarrationSystem(
  popAccess: PopAccessCache,
  siteId: string,
  extraPrompt: string,
): Promise<string> {
  const card = await loadChatRootsyBusinessCard(popAccess, siteId)
  return [
    CHAT_ROOTSY_SYSTEM_PROMPT,
    extraPrompt,
    "Tarjeta del negocio (JSON):",
    JSON.stringify(card),
  ].join("\n")
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
  sent: string
  received: string
}> {
  const fallback = fallbackChatRootsyCloseReply(input.brief)
  const personPop = await loadChatRootsyBusinessCard(input.popAccess, input.siteId)
  const closeHistory = [
    {
      role: "user" as const,
      body: formatChatRootsyPersonPopMessage(personPop),
    },
    { role: "user" as const, body: input.pedido || "Cerrá esta corrida." },
    {
      role: "user" as const,
      body: `Hechos ya confirmados (JSON):\n${chatRootsyDevJson(buildChatRootsyCloseModelPayload(input.brief))}`,
    },
  ]
  const systemForFallback = readOpenAiPromptId(OPENAI_PROMPT_ROOTSY_ENV)
    ? undefined
    : await chatRootsyNarrationSystem(
        input.popAccess,
        input.siteId,
        CHAT_ROOTSY_CLOSE_PROMPT,
      )
  const narration = await requestChatRootsyNarration(closeHistory, {
    systemForFallback,
  })
  const narrationText = readChatRootsyCloseReply(narration.text)
  return {
    reply: narrationText ?? fallback,
    narrationText,
    narrationError: narration.error,
    sent: narration.sent,
    received: narration.received,
  }
}

async function narrateChatRootsyClarify(input: {
  popAccess: PopAccessCache
  siteId: string
  pedido: string
  question: string
}): Promise<{
  reply: string
  narrationText: string | null
  narrationError?: string
  sent: string
  received: string
}> {
  const fallback = fallbackChatRootsyClarifyReply(input.question)
  const personPop = await loadChatRootsyBusinessCard(input.popAccess, input.siteId)
  const history = [
    {
      role: "user" as const,
      body: formatChatRootsyPersonPopMessage(personPop),
    },
    { role: "user" as const, body: input.pedido || "Necesito seguir con este pedido." },
    {
      role: "user" as const,
      body: chatRootsyDevJson(
        buildChatRootsyClarifyModelPayload({
          pedido: input.pedido,
          pregunta: input.question,
        }),
      ),
    },
  ]
  const systemForFallback = readOpenAiPromptId(OPENAI_PROMPT_ROOTSY_ENV)
    ? undefined
    : await chatRootsyNarrationSystem(
        input.popAccess,
        input.siteId,
        CHAT_ROOTSY_CLARIFY_PROMPT,
      )
  const narration = await requestChatRootsyNarration(history, {
    systemForFallback,
  })
  const narrationText = readChatRootsyCloseReply(narration.text)
  return {
    reply: narrationText ?? fallback,
    narrationText,
    narrationError: narration.error,
    sent: narration.sent,
    received: narration.received,
  }
}

function rootsyCloseDevCall(input: {
  phase: "Cierre" | "Aclaración"
  sent: string
  received?: string | null
  narrationText: string | null
  narrationError?: string
  reply: string
}): ChatRootsyDevCall {
  const id =
    input.phase === "Aclaración"
      ? "call:rootsy:aclaracion"
      : "call:rootsy:cierre"
  return rootsyDevCall({
    id,
    phase: input.phase,
    sent: input.sent,
    received: input.received || input.narrationText || input.reply,
    note: input.narrationText
      ? undefined
      : `Fallback. ${input.narrationError ?? ""}`.trim(),
  })
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

  const personPop = await loadChatRootsyBusinessCard(popAccess, siteId)
  const system = [
    CHAT_ROOTSY_SYSTEM_PROMPT,
    CHAT_ROOTSY_FIRST_TURN_PROTOCOL,
    "Tarjeta del negocio (JSON):",
    JSON.stringify(personPop),
  ]
    .filter(Boolean)
    .join("\n")

  const appliedActions = input.appliedActions ?? []
  const firstFetch = await requestChatRootsyFirstTurn(system, history, {
    sessionActions: appliedActions,
    personPop,
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
          rootsyDevCall({
            id: "call:rootsy:apertura",
            phase: "Apertura",
            userMessage: lastUser.body,
            sent: firstFetch.sent,
            received: firstFetch.received,
            note: `Fuente: ${firstFetch.source}. No hubo reply usable.`,
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
      rootsyDevCall({
        id: "call:rootsy:apertura",
        phase: "Apertura",
        userMessage: lastUser.body,
        sent: firstFetch.sent,
        received: firstFetch.received,
        note: needsPlanner
          ? "Hay data_request válido → sigue el Planificador."
          : rawDataRequest != null
            ? "data_request vino y se descartó. El Planificador no corre."
            : "data_request es null. El Planificador no corre.",
      }),
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
    paso: 1,
    resultados: input.plannerRun.resultados,
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
    [
      plannerDevCall({
        sent: plan.sent,
        received: plan.received,
        source: plannerSource,
        note: plannerNote,
        paso: 1,
      }),
    ],
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

  if (toolOffers.length) {
    return {
      success: true,
      reply: "",
      toolOffer: toolOffers[0],
      toolOffers,
      plannerRun,
      closeBrief,
      devTrace: plannerTrace,
    }
  }

  const pedido =
    input.plannerRun.message.trim() ||
    [...input.history].reverse().find((turn) => turn.role === "user")?.body ||
    ""

  if (plan.impossible) {
    const brief = buildChatRootsyCloseBrief({
      pedido,
      proposals: [],
      error:
        plan.clarifyingQuestion ||
        "Ese pedido no se puede hacer con las herramientas de este negocio.",
      informe: plan.informe,
    })
    const narration = await narrateChatRootsyClose({
      popAccess,
      siteId,
      pedido,
      brief,
    })
    return {
      success: true,
      reply: "",
      followUpReply: narration.reply,
      plannerRun,
      closeBrief: brief,
      executionError: brief.error,
      devTrace:
        mergeChatRootsyDevTraces([
          plannerTrace,
          buildChatRootsyDevTrace([
            rootsyCloseDevCall({
              phase: "Cierre",
              sent: narration.sent,
              received: narration.received,
              narrationText: narration.narrationText,
              narrationError: narration.narrationError,
              reply: narration.reply,
            }),
          ]),
        ]) ?? plannerTrace,
    }
  }

  if (plan.clarifyingQuestion) {
    const narration = await narrateChatRootsyClarify({
      popAccess,
      siteId,
      pedido,
      question: plan.clarifyingQuestion,
    })
    return {
      success: true,
      reply: "",
      followUpReply: narration.reply,
      devTrace:
        mergeChatRootsyDevTraces([
          plannerTrace,
          buildChatRootsyDevTrace([
            rootsyCloseDevCall({
              phase: "Aclaración",
              sent: narration.sent,
              received: narration.received,
              narrationText: narration.narrationText,
              narrationError: narration.narrationError,
              reply: narration.reply,
            }),
          ]),
        ]) ?? plannerTrace,
    }
  }

  if (closeBrief) {
    const narration = await narrateChatRootsyClose({
      popAccess,
      siteId,
      pedido,
      brief: closeBrief,
    })
    return {
      success: true,
      reply: "",
      followUpReply: narration.reply,
      plannerRun,
      closeBrief,
      devTrace:
        mergeChatRootsyDevTraces([
          plannerTrace,
          buildChatRootsyDevTrace([
            rootsyCloseDevCall({
              phase: "Cierre",
              sent: narration.sent,
              received: narration.received,
              narrationText: narration.narrationText,
              narrationError: narration.narrationError,
              reply: narration.reply,
            }),
          ]),
        ]) ?? plannerTrace,
    }
  }

  return {
    success: false,
    error: plannerAiError || "El Planificador no armó un plan usable.",
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

type PlannerNextStep = {
  toolOffers?: ChatRootsyToolOffer[]
  plannerRun?: ChatRootsyPlannerRun
  plannerChoices?: ChatRootsyPlannerChoice[]
  plannerSent?: string | null
  plannerReceived?: string | null
  plannerSource?: string
  clarifyingQuestion?: string
  impossible?: boolean
  done?: boolean
  note: string
}

async function planNextPlannerStep(input: {
  popId: string
  run: ChatRootsyPlannerRun
  resultados: ChatRootsyPlannerResultado[]
  slots?: ChatRootsyPlannerSlot[]
  toolContext?: ChatRootsyToolMatchContext
}): Promise<PlannerNextStep> {
  const slots = input.slots ?? input.run.slots ?? []
  const current: ChatRootsyPlannerRun = {
    ...input.run,
    resultados: input.resultados,
    slots,
  }
  if (!canContinueChatRootsyPlanner(input.run.paso)) {
    return {
      plannerRun: current,
      done: true,
      note: `Se llegó al máximo de ${CHAT_ROOTSY_PLANNER_MAX_STEPS} viajes.`,
    }
  }

  const nextPaso = input.run.paso + 1
  const snapshot = await loadPopPermissionsSnapshot(input.popId)
  const plan = await planChatRootsyTools({
    dataRequest: input.run.dataRequest,
    context: input.toolContext,
    permissionKeys: snapshot.keys,
    paso: nextPaso,
    resultados: input.resultados,
  })
  const plannerSource = plan.storedError
    ? `${plan.source} · ${plan.storedError}`
    : plan.source
  let toolOffers = buildChatRootsyToolOffers(plan.proposals, input.resultados)
  if (!toolOffers.length && plan.steps?.[0]) {
    const queries = instantiateChatRootsyPlanStep(plan.steps[0], slots)
    toolOffers = offersFromPlanOfertas(
      queries,
      input.resultados,
      plan.steps[0].confirm,
      plan.steps[0].action,
    )
  }
  const plannerRun: ChatRootsyPlannerRun = {
    ...current,
    paso: nextPaso,
    plan: [...(input.run.plan ?? []), ...(plan.steps ?? [])],
    informe: plan.informe ?? input.run.informe,
  }
  const wire = {
    plannerSent: plan.sent,
    plannerReceived: plan.received,
    plannerSource,
  }

  if (plan.impossible) {
    return {
      ...wire,
      plannerRun,
      impossible: true,
      note: plan.clarifyingQuestion
        ? `Impossible: ${plan.clarifyingQuestion}`
        : "Impossible.",
    }
  }
  if (plan.clarifyingQuestion) {
    return {
      ...wire,
      plannerRun,
      clarifyingQuestion: plan.clarifyingQuestion,
      note: `Aclaración: ${plan.clarifyingQuestion}`,
    }
  }
  if (plan.done || !toolOffers.length) {
    return {
      ...wire,
      plannerRun,
      done: true,
      note: plan.done ? "Planificador: done." : "Sin más ofertas.",
    }
  }
  return {
    ...wire,
    toolOffers,
    plannerRun,
    note: `Viaje ${nextPaso}. Ofertas: ${toolOffers.length}.`,
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
      devTrace: buildChatRootsyDevTrace([], { error: "Ninguna query pasó la validación." }),
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
          rootsyCloseDevCall({
            phase: "Cierre",
            sent: narration.sent,
            received: narration.received,
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
  let narrationSent = ""
  let narrationReceived = ""
  let narrationPhase: "Cierre" | "Aclaración" | null = null
  let closeBrief: ReturnType<typeof buildChatRootsyCloseBrief> | undefined
  const pedido =
    input.plannerRun?.message.trim() ||
    [...history].reverse().find((turn) => turn.role === "user")?.body ||
    ""
  if (next.clarifyingQuestion) {
    const narration = await narrateChatRootsyClarify({
      popAccess,
      siteId,
      pedido,
      question: next.clarifyingQuestion,
    })
    narrationPhase = "Aclaración"
    narrationText = narration.narrationText
    narrationError = narration.narrationError
    narrationSent = narration.sent
    narrationReceived = narration.received
    reply = narration.reply
  } else if (!plannerContinues) {
    const brief = buildChatRootsyCloseBrief({
      pedido,
      proposals: ordered,
      resultados: next.plannerRun?.resultados ?? input.plannerRun?.resultados,
      toolResults,
      previos: input.plannerRun?.aplicados,
      error: next.impossible
        ? next.note.replace(/^Impossible:\s*/, "") ||
          "Ese pedido no se puede hacer con las herramientas de este negocio."
        : undefined,
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
    narrationPhase = "Cierre"
    narrationText = narration.narrationText
    narrationError = narration.narrationError
    narrationSent = narration.sent
    narrationReceived = narration.received
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
    executionError: closeBrief?.error,
    devTrace: buildChatRootsyDevTrace(
      [
        ...(next.plannerSent
          ? [
              plannerDevCall({
                sent: next.plannerSent,
                received: next.plannerReceived,
                source: next.plannerSource,
                note: next.note,
                paso: next.plannerRun?.paso,
              }),
            ]
          : []),
        ...(narrationPhase
          ? [
              rootsyCloseDevCall({
                phase: narrationPhase,
                sent: narrationSent,
                received: narrationReceived,
                narrationText,
                narrationError,
                reply,
              }),
            ]
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
}): Promise<PlannerNextStep> {
  const run = input.plannerRun
  if (!run) {
    return { note: "Sin corrida del planificador." }
  }

  const byKey = new Map(
    input.toolResults.map((row) => [row.offerKey ?? row.tool, row]),
  )
  const resultados: ChatRootsyPlannerResultado[] = [...run.resultados]
  const slots: ChatRootsyPlannerSlot[] = [...(run.slots ?? [])]
  const plannerChoices: ChatRootsyPlannerChoice[] = []
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
    const confirm = resolveChatRootsyPlannerPickConfirm({
      confirm: proposal.confirm ?? currentStep?.confirm ?? "confirm",
      message: run.message,
      objective: run.dataRequest.objective,
      itemCount: result.items.length,
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
    } else {
      slots.push(
        extractChatRootsyPlannerSlot({
          paso: run.paso,
          oferta: index,
          tool: proposal.tool,
          method,
          path,
          action,
          demandas: ["id", "name"],
          items: result.items,
          payload: result.payload,
        }),
      )
    }
    if (isChatRootsyPlannerPickConfirm(confirm) && result.items.length) {
      plannerChoices.push({
        tool: proposal.tool,
        method,
        path,
        action,
        items: result.items,
        payload: result.payload,
        confirm,
      })
      continue
    }
    resultados.push({
      method,
      path,
      action,
      confirm,
      response: compactChatRootsyPlannerResponse(result.payload ?? result.items),
    })
  }

  if (plannerChoices.length) {
    return {
      plannerRun: { ...run, resultados, slots },
      plannerChoices,
      note:
        plannerChoices[0]?.confirm === "confirm_many"
          ? "Esperando que elijan uno, varios o todos (confirm_many)."
          : "Esperando que elijan un resultado (confirm_one).",
    }
  }

  return planNextPlannerStep({
    popId: input.popId,
    run,
    resultados,
    slots,
    toolContext: input.toolContext,
  })
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
  const next = await planNextPlannerStep({
    popId,
    run: input.plannerRun,
    resultados,
    slots,
  })

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
            next.plannerSent
              ? buildChatRootsyDevTrace([
                  plannerDevCall({
                    sent: next.plannerSent,
                    received: next.plannerReceived,
                    source: next.plannerSource,
                    note: next.note,
                    paso: next.plannerRun.paso,
                  }),
                ])
              : undefined,
            executed.devTrace,
          ]) ?? executed.devTrace,
      }
    }
  }

  if (next.clarifyingQuestion) {
    const narration = await narrateChatRootsyClarify({
      popAccess,
      siteId,
      pedido: input.plannerRun.message,
      question: next.clarifyingQuestion,
    })
    return {
      success: true,
      reply: "",
      followUpReply: narration.reply,
      plannerRun: next.plannerRun,
      devTrace:
        mergeChatRootsyDevTraces([
          next.plannerSent
            ? buildChatRootsyDevTrace([
                plannerDevCall({
                  sent: next.plannerSent,
                  received: next.plannerReceived,
                  source: next.plannerSource,
                  note: next.note,
                  paso: next.plannerRun?.paso,
                }),
              ])
            : undefined,
          buildChatRootsyDevTrace([
            rootsyCloseDevCall({
              phase: "Aclaración",
              sent: narration.sent,
              received: narration.received,
              narrationText: narration.narrationText,
              narrationError: narration.narrationError,
              reply: narration.reply,
            }),
          ]),
        ]) ?? undefined,
    }
  }

  if (!next.toolOffers?.length) {
    const pedido = input.plannerRun.message
    const brief = buildChatRootsyCloseBrief({
      pedido,
      proposals: [],
      resultados,
      previos: input.plannerRun.aplicados,
      error: next.impossible
        ? next.note.replace(/^Impossible:\s*/, "") ||
          "Ese pedido no se puede hacer con las herramientas de este negocio."
        : undefined,
      informe: completeChatRootsyPlannerInforme(
        next.plannerRun?.informe ?? input.plannerRun.informe,
        resultados,
      ),
    })
    const narration = await narrateChatRootsyClose({
      popAccess,
      siteId,
      pedido,
      brief,
    })
    return {
      success: true,
      reply: "",
      followUpReply: narration.reply,
      plannerRun: next.plannerRun,
      closeBrief: brief,
      executionError: brief.error,
      devTrace:
        mergeChatRootsyDevTraces([
          next.plannerSent
            ? buildChatRootsyDevTrace([
                plannerDevCall({
                  sent: next.plannerSent,
                  received: next.plannerReceived,
                  source: next.plannerSource,
                  note: next.note,
                  paso: next.plannerRun?.paso,
                }),
              ])
            : undefined,
          buildChatRootsyDevTrace([
            rootsyCloseDevCall({
              phase: "Cierre",
              sent: narration.sent,
              received: narration.received,
              narrationText: narration.narrationText,
              narrationError: narration.narrationError,
              reply: narration.reply,
            }),
          ]),
        ]) ?? undefined,
    }
  }

  return {
    success: true,
    reply: "",
    toolOffer: next.toolOffers[0],
    toolOffers: next.toolOffers,
    plannerRun: next.plannerRun,
    devTrace: next.plannerSent
      ? buildChatRootsyDevTrace([
          plannerDevCall({
            sent: next.plannerSent,
            received: next.plannerReceived,
            source: next.plannerSource,
            note: next.note,
            paso: next.plannerRun?.paso,
          }),
        ])
      : undefined,
  }
}
