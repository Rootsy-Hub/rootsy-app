import assert from "node:assert/strict"
import { describe, it } from "node:test"
import type { ChatMessageRow } from "@/app/[siteId]/[popId]/chat/chatTypes"
import {
  chatRootsyApproveLabel,
  chatRootsyOffersAutoExecute,
  chatRootsyOperationHasUserDetails,
  chatRootsyStepDetail,
  chatRootsyStepUserDetails,
  chatRootsyWriteConfirmCopy,
  deriveChatRootsyOperations,
  isChatRootsyOperationShell,
  taskPhaseTitle,
  taskStepProgress,
} from "@/lib/chat/chatRootsyOperation"

function row(partial: Partial<ChatMessageRow> & Pick<ChatMessageRow, "id" | "mine">): ChatMessageRow {
  return {
    authorUserId: partial.mine ? "me" : "rootsy",
    authorName: partial.mine ? "Vos" : "Rootsy",
    body: "",
    createdAt: "2026-08-23T16:00:00.000Z",
    ...partial,
  }
}

describe("operación en vivo del chat Rootsy", () => {
  it("no abre la operación hasta que Rootsy pide una tarea", () => {
    const user = row({
      id: "u1",
      mine: true,
      body: "Aumentá 50% el precio de las aguas",
    })
    assert.equal(
      deriveChatRootsyOperations([user], {
        sending: true,
        mode: "understand",
        hostId: "u1",
      }).length,
      0,
    )
    assert.equal(
      deriveChatRootsyOperations([
        user,
        row({
          id: "a1",
          mine: false,
          body: "Estoy por acá, mirando el parque.",
        }),
      ]).length,
      0,
    )
  })

  it("espera aprobación y absorbe el resultado de la consulta", () => {
    const messages = [
      row({
        id: "u1",
        mine: true,
        body: "Aumentá 50% el precio de las aguas",
      }),
      row({
        id: "a1",
        mine: false,
        body: "Dale, lo dejo listo.",
        plannerRun: {
          message: "Aumentá 50%",
          dataRequest: { objective: "aumentar aguas 50%" },
          paso: 1,
          resultados: [],
        },
        toolOffers: [
          {
            tool: "get_articles",
            label: "Buscar aguas",
            status: "offered",
            method: "GET",
            path: "/v1/pops/:popId/articles",
            action: "Buscar artículos que coincidan con agua",
          },
        ],
      }),
    ]
    const waiting = deriveChatRootsyOperations(messages)
    assert.equal(waiting[0]?.phase, "executing")
    assert.equal(waiting[0]?.anchorMessageId, "a1")
    assert.equal(waiting[0]?.title, "aumentar aguas 50%")
    assert.equal(waiting[0]?.pendingOffers.length, 1)
    assert.equal(chatRootsyOffersAutoExecute(waiting[0]!.pendingOffers), true)

    const after = deriveChatRootsyOperations([
      ...messages.map((item) =>
        item.id === "a1"
          ? {
              ...item,
              toolOffers: item.toolOffers?.map((offer) => ({
                ...offer,
                status: "used" as const,
              })),
            }
          : item,
      ),
      row({
        id: "t1",
        mine: false,
        toolResult: {
          tool: "get_articles",
          periodLabel: "Ahora",
          title: "Buscar artículos que coincidan con agua",
          offerKey: "GET|/v1/pops/:popId/articles|{}|{}",
          items: [{ rank: 1, name: "Agua mineral", id: "art-1" }],
        },
      }),
      row({
        id: "a2",
        mine: false,
        body: "",
        plannerRun: {
          message: "Aumentá 50%",
          dataRequest: { objective: "aumentar aguas 50%" },
          paso: 2,
          resultados: [],
        },
        toolOffers: [
          {
            tool: "patch_articles_articleId",
            label: "Actualizar Agua mineral",
            status: "offered",
            method: "PATCH",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-1" },
            body: { salePrice: 3750 },
            action: "Actualizar el precio de Agua mineral a $3750",
            preview: {
              subject: "Agua mineral",
              changes: [
                { field: "Precio", before: "$2.500", after: "$3.750" },
              ],
            },
          },
        ],
      }),
    ])
    assert.equal(after[0]?.phase, "waiting")
    assert.equal(after[0]?.pendingHostId, "a2")
    assert.ok(after[0]?.steps.some((step) => step.status === "done"))
    assert.equal(
      chatRootsyApproveLabel(after[0]!.pendingOffers),
      "Actualizar…",
    )
    assert.equal(isChatRootsyOperationShell(messages[1]!), false)
    assert.equal(
      isChatRootsyOperationShell(
        row({
          id: "t1",
          mine: false,
          toolResult: {
            tool: "get_articles",
            periodLabel: "Ahora",
            items: [],
          },
        }),
      ),
      true,
    )
  })

  it("cierra la operación cuando hay hechos aplicados", () => {
    const ops = deriveChatRootsyOperations([
      row({ id: "u1", mine: true, body: "Aumentá las aguas" }),
      row({
        id: "a1",
        mine: false,
        body: "Listo, ya quedaron actualizadas.",
        plannerRun: {
          message: "Aumentá las aguas",
          dataRequest: { objective: "aumentar 50% el precio de las aguas" },
          paso: 2,
          resultados: [],
        },
        closeBrief: {
          pedido: "Aumentá las aguas",
          estado: "aplicado",
          hechos: [
            {
              accion: "Actualizar",
              sujeto: "Agua mineral",
              cambios: [
                { campo: "Precio", antes: "$2.500", despues: "$3.750" },
              ],
            },
          ],
        },
      }),
    ])
    assert.equal(ops[0]?.phase, "completed")
    assert.equal(ops[0]?.anchorMessageId, "a1")
    assert.equal(ops[0]?.title, "aumentar 50% el precio de las aguas")
    assert.match(ops[0]?.pasoLabel ?? "", /Tarea completada/)
  })

  it("un paso de escritura resume el objetivo y deja el cambio para los detalles", () => {
    const detail = chatRootsyStepDetail({
      id: "s1",
      title: "Actualizar el precio de Coca Cola",
      summary: "Coca Cola",
      status: "done",
      kind: "write",
      items: [
        {
          id: "s1:change",
          label: "Coca Cola",
          changes: [{ field: "Precio", before: "$4.400", after: "$4.840" }],
        },
      ],
    })
    assert.equal(detail.preview, null)
    assert.equal(detail.text, "Coca Cola")
    assert.equal(chatRootsyStepUserDetails({
      id: "s1",
      title: "Actualizar el precio de Coca Cola",
      summary: "Coca Cola",
      status: "done",
      kind: "write",
      items: [
        {
          id: "s1:change",
          label: "Coca Cola",
          changes: [{ field: "Precio", before: "$4.400", after: "$4.840" }],
        },
      ],
    })[0]?.label, "Coca Cola")
  })

  it("agrupa las consultas del mismo paso del planificador en un objetivo", () => {
    const ops = deriveChatRootsyOperations([
      row({ id: "u1", mine: true, body: "Bajá 20% las cocas" }),
      row({
        id: "a1",
        mine: false,
        body: "Lo dejo listo.",
        plannerRun: {
          message: "Bajá 20% las cocas",
          dataRequest: { objective: "bajar 20% el precio de las cocas" },
          paso: 1,
          resultados: [],
        },
        toolOffers: [
          {
            tool: "get_articles",
            label: "Buscar cocas",
            status: "used",
            method: "GET",
            path: "/v1/pops/:popId/articles",
            action: "Buscar las cocas del local",
          },
        ],
      }),
      row({
        id: "t1",
        mine: false,
        toolResult: {
          tool: "get_articles",
          periodLabel: "Ahora",
          title: "Buscar las cocas del local",
          offerKey: "GET|/v1/pops/:popId/articles|{}|{}",
          items: [
            { rank: 1, name: "Coca Cola", id: "art-1" },
            { rank: 2, name: "Coca-Cola 2.25 L", id: "art-2" },
            { rank: 3, name: "Coca Cola 1.5 L", id: "art-3" },
          ],
        },
      }),
      row({
        id: "a2",
        mine: false,
        plannerRun: {
          message: "Bajá 20% las cocas",
          dataRequest: { objective: "bajar 20% el precio de las cocas" },
          paso: 2,
          resultados: [],
        },
        toolOffers: [
          {
            tool: "patch_articles_articleId",
            label: "Actualizar Coca Cola",
            status: "used",
            method: "PATCH",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-1" },
            body: { salePrice: 4000 },
            action: "Actualizar el precio de Coca Cola a $4000",
            preview: {
              subject: "Coca Cola",
              changes: [{ field: "Precio", before: "$4.840", after: "$4.000" }],
            },
          },
          {
            tool: "patch_articles_articleId",
            label: "Actualizar Coca-Cola 2.25 L",
            status: "used",
            method: "PATCH",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-2" },
            body: { salePrice: 3200 },
            action: "Actualizar el precio de Coca-Cola 2.25 L a $3200",
            preview: {
              subject: "Coca-Cola 2.25 L",
              changes: [{ field: "Precio", before: "$3.872", after: "$3.200" }],
            },
          },
        ],
      }),
      row({
        id: "t2",
        mine: false,
        toolResult: {
          tool: "patch_articles_articleId",
          periodLabel: "Ahora",
          title: "Actualizar el precio de Coca Cola a $4000",
          offerKey: "PATCH|/v1/pops/:popId/articles/:articleId|{\"articleId\":\"art-1\"}|{\"salePrice\":4000}",
          items: [],
          applied: {
            accion: "Actualizar",
            sujeto: "Coca Cola",
            cambios: [{ campo: "Precio", antes: "$4.840", despues: "$4.000" }],
          },
        },
      }),
      row({
        id: "t3",
        mine: false,
        toolResult: {
          tool: "patch_articles_articleId",
          periodLabel: "Ahora",
          title: "Actualizar el precio de Coca-Cola 2.25 L a $3200",
          offerKey: "PATCH|/v1/pops/:popId/articles/:articleId|{\"articleId\":\"art-2\"}|{\"salePrice\":3200}",
          items: [],
          applied: {
            accion: "Actualizar",
            sujeto: "Coca-Cola 2.25 L",
            cambios: [{ campo: "Precio", antes: "$3.872", despues: "$3.200" }],
          },
        },
      }),
      row({
        id: "close",
        mine: false,
        closeBrief: {
          pedido: "Bajá 20% las cocas",
          estado: "aplicado",
          hechos: [
            {
              accion: "Actualizar",
              sujeto: "Coca Cola",
              cambios: [{ campo: "Precio", antes: "$4.840", despues: "$4.000" }],
            },
            {
              accion: "Actualizar",
              sujeto: "Coca-Cola 2.25 L",
              cambios: [{ campo: "Precio", antes: "$3.872", despues: "$3.200" }],
            },
          ],
        },
      }),
    ])
    assert.equal(ops[0]?.phase, "completed")
    assert.equal(ops[0]?.steps.length, 2)
    assert.equal(ops[0]?.steps[0]?.title, "Buscar las cocas del local")
    assert.equal(ops[0]?.steps[0]?.summary, "Vi 3 resultados.")
    assert.equal(ops[0]?.steps[1]?.title, "Actualizar precios")
    assert.equal(ops[0]?.steps[1]?.summary, "Coca Cola y Coca-Cola 2.25 L")
    assert.match(ops[0]?.pasoLabel ?? "", /2 pasos/)
    assert.equal(chatRootsyOperationHasUserDetails(ops[0]!), true)
    const searchDetails = chatRootsyStepUserDetails(ops[0]!.steps[0]!)
    assert.equal(searchDetails.length, 3)
    assert.equal(searchDetails[0]?.label, "Coca Cola")
    const writeDetails = chatRootsyStepUserDetails(ops[0]!.steps[1]!)
    assert.equal(writeDetails.length, 2)
    assert.equal(writeDetails[0]?.changes?.[0]?.after, "$4.000")
    const dumped = JSON.stringify(ops[0]?.steps)
    assert.equal(/\/v1\/|\bGET\b|\bPATCH\b|salePrice/.test(dumped), false)
  })

  it("pone el informe del planificador en los detalles de la tarea", () => {
    const ops = deriveChatRootsyOperations([
      row({ id: "u1", mine: true, body: "qué puede hacer Mozos" }),
      row({
        id: "a1",
        mine: false,
        body: "Lo miro.",
        plannerRun: {
          message: "qué puede hacer Mozos",
          dataRequest: { objective: "permisos del rol Mozos" },
          paso: 2,
          resultados: [],
        },
      }),
      row({
        id: "close",
        mine: false,
        closeBrief: {
          pedido: "qué puede hacer Mozos",
          estado: "consultado",
          hechos: [],
          informe: {
            respuesta: "El rol Mozos no tiene permiso para eliminar artículos.",
            acciones: ["Listé los roles", "Leí la matriz de inventario"],
          },
        },
      }),
    ])
    assert.equal(
      ops[0]?.informe?.respuesta,
      "El rol Mozos no tiene permiso para eliminar artículos.",
    )
    assert.deepEqual(ops[0]?.informe?.acciones, [
      "Listé los roles",
      "Leí la matriz de inventario",
    ])
    assert.equal(chatRootsyOperationHasUserDetails(ops[0]!), true)
  })

  it("las lecturas se autoejecutan y las escrituras piden modal", () => {
    assert.equal(
      chatRootsyOffersAutoExecute([
        {
          tool: "get_articles",
          label: "Buscar",
          status: "offered",
          method: "GET",
        },
      ]),
      true,
    )
    assert.equal(
      chatRootsyOffersAutoExecute([
        {
          tool: "patch_articles_articleId",
          label: "Actualizar",
          status: "offered",
          method: "PATCH",
        },
      ]),
      false,
    )
    assert.equal(
      chatRootsyApproveLabel([
        {
          tool: "post_articles",
          label: "Crear",
          status: "offered",
          method: "POST",
        },
      ]),
      "Crear…",
    )
    assert.equal(
      chatRootsyApproveLabel([
        {
          tool: "delete_articles_articleId",
          label: "Eliminar",
          status: "offered",
          method: "DELETE",
        },
      ]),
      "Eliminar…",
    )
    assert.equal(
      chatRootsyWriteConfirmCopy([
        {
          tool: "post_articles",
          label: "Crear agua",
          status: "offered",
          method: "POST",
        },
      ]).confirmLabel,
      "Crear",
    )
  })

  it("marca detenida si el usuario mandó otro pedido sin cerrar", () => {
    const ops = deriveChatRootsyOperations([
      row({ id: "u1", mine: true, body: "Aumentá las aguas" }),
      row({
        id: "a1",
        mine: false,
        body: "Lo preparo.",
        plannerRun: {
          message: "Aumentá las aguas",
          dataRequest: { objective: "aumentar aguas" },
          paso: 1,
          resultados: [],
        },
      }),
      row({ id: "u2", mine: true, body: "mejor no" }),
    ])
    assert.equal(ops[0]?.phase, "stopped")
  })

  it("el encabezado de la card nombra la fase y el anillo de pasos", () => {
    assert.equal(taskPhaseTitle("waiting"), "Esperando confirmación")
    assert.equal(taskPhaseTitle("executing"), "Tarea en proceso")
    assert.equal(taskPhaseTitle("completed"), "Tarea finalizada")
    assert.equal(taskPhaseTitle("error"), "Tarea con error")
    assert.deepEqual(
      taskStepProgress({
        phase: "waiting",
        paso: 1,
        steps: [{ status: "active" }],
      }),
      { tone: "progress", current: 1, total: 1, ratio: 0 },
    )
    assert.deepEqual(
      taskStepProgress({
        phase: "waiting",
        paso: 2,
        steps: [{ status: "done" }, { status: "active" }],
      }),
      { tone: "progress", current: 1, total: 2, ratio: 0.5 },
    )
    assert.deepEqual(
      taskStepProgress({
        phase: "completed",
        paso: 2,
        steps: [{ status: "done" }, { status: "done" }],
      }),
      { tone: "ok", current: 2, total: 2, ratio: 1 },
    )
    assert.equal(
      taskStepProgress({
        phase: "error",
        paso: 1,
        steps: [{ status: "failed" }],
      }).tone,
      "error",
    )
  })

  it("un DELETE fallido no se vuelve OK al recargar", () => {
    const messages = [
      row({ id: "u1", mine: true, body: "Borrá el artículo ejemplo" }),
      row({
        id: "a1",
        mine: false,
        body: "Lo busco.",
        plannerRun: {
          message: "Borrá el artículo ejemplo",
          dataRequest: { objective: "borrar artículo ejemplo" },
          paso: 1,
          resultados: [],
        },
      }),
      row({
        id: "t1",
        mine: false,
        body: "Buscar artículos",
        toolResult: {
          tool: "get_articles",
          periodLabel: "Consulta",
          items: [
            { rank: 1, name: "[Ejemplo] Artículo de muestra", id: "art-1" },
          ],
        },
      }),
      row({
        id: "d1",
        mine: false,
        body: "",
        toolError:
          "Escribí (Eliminar [Ejemplo] Artículo de muestra) para confirmar el borrado.",
        toolOffers: [
          {
            tool: "delete_articles_articleId",
            label: "Eliminar",
            status: "offered",
            method: "DELETE",
            path: "/v1/pops/:popId/articles/:articleId",
            filters: { articleId: "art-1" },
          },
        ],
      }),
    ]
    const ops = deriveChatRootsyOperations(messages)
    assert.equal(ops[0]?.phase, "error")
    assert.match(ops[0]?.error ?? "", /Eliminar/)
    assert.equal(ops[0]?.pendingOffers.length, 1)
    assert.equal(chatRootsyOperationHasUserDetails(ops[0]!), true)
  })
})
