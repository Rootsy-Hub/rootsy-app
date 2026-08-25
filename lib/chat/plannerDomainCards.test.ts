import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { buildChatRootsyPlannerPrompt } from "@/lib/chat/apiDocumentacion"
import {
  buildChatRootsyPlannerDomainCardsText,
  CHAT_ROOTSY_PLANNER_DOMAIN_CARDS,
  CHAT_ROOTSY_PLANNER_DOMAIN_RULE,
} from "@/lib/chat/plannerDomainCards"
import { CHAT_ROOTSY_PLANNER_REQUIRED_TEXT } from "@/lib/chat/plannerRequired.generated"

describe("fichas de dominio del planificador", () => {
  it("cubre todos los dominios del negocio", () => {
    const ids = CHAT_ROOTSY_PLANNER_DOMAIN_CARDS.map((card) => card.id)
    for (const id of [
      "articulos",
      "categorias",
      "listas",
      "clientes",
      "proveedores",
      "recetas",
      "promociones",
      "servicios",
      "rrhh",
      "cajas",
      "tesoreria",
      "inventario",
      "operaciones",
      "gastos",
      "corrientes",
      "cheques",
      "facturas",
      "ordenes",
      "presupuestos",
      "produccion",
      "totales",
      "reportes",
      "estadisticas",
      "ajustes",
      "impresoras",
      "comandas",
      "arca",
      "muelle",
      "catalogo-venta",
    ]) {
      assert.ok(ids.includes(id), `falta la ficha ${id}`)
    }
  })

  it("RRHH explica activo, userId y el PATCH de rol", () => {
    const hr = CHAT_ROOTSY_PLANNER_DOMAIN_CARDS.find((card) => card.id === "rrhh")
    assert.ok(hr)
    assert.match(hr!.invariant, /isActive=true/)
    assert.match(hr!.write, /members\/:memberUserId\/role/)
    assert.match(hr!.write, /roleId/)
    assert.match(hr!.row, /userId/)
  })

  it("entra en el prompt que se copia a ChatGPT", () => {
    const prompt = buildChatRootsyPlannerPrompt()
    assert.equal(prompt.includes(CHAT_ROOTSY_PLANNER_DOMAIN_RULE), true)
    assert.match(prompt, /FICHAS DE DOMINIO/)
    assert.match(prompt, /## RRHH/)
    assert.match(prompt, /## Artículos/)
    assert.match(prompt, /confirm_many/)
    assert.match(prompt, /confirm_one/)
    assert.match(prompt, /es de ESTE viaje/)
    assert.match(prompt, /una línea para el tablero/)
    assert.match(prompt, /"status":"ok"/)
    assert.match(prompt, /"status":"done"/)
    assert.match(prompt, /pasos_max/)
    assert.match(prompt, /resultados/)
    assert.match(prompt, /hasta 8 viajes/)
    assert.match(prompt, /clave a:\/r:\/p:/)
    assert.match(prompt, /OBLIGATORIOS/)
    assert.match(
      prompt,
      /POST \/inventory\/adjustments articleId quantityDelta note/,
    )
    assert.match(prompt, /GET \/inventory\/balance articleId/)
    assert.doesNotMatch(CHAT_ROOTSY_PLANNER_REQUIRED_TEXT, /inventory\/rows/)
    assert.equal(
      prompt.includes(buildChatRootsyPlannerDomainCardsText()),
      true,
    )
  })
})
