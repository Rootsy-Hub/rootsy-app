import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { buildChatRootsyPlannerPrompt } from "@/lib/chat/apiDocumentacion"
import {
  buildChatRootsyPlannerDomainCardsText,
  CHAT_ROOTSY_PLANNER_DOMAIN_CARDS,
  CHAT_ROOTSY_PLANNER_DOMAIN_RULE,
} from "@/lib/chat/plannerDomainCards"

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
    assert.match(prompt, /es de ESE paso/)
    assert.match(prompt, /una línea para el tablero/)
    assert.match(prompt, /"status":"ok"/)
    assert.match(prompt, /\$1\[0\]\.items\[\]\.id/)
    assert.match(prompt, /hasta 8 pasos/)
    assert.equal(
      prompt.includes(buildChatRootsyPlannerDomainCardsText()),
      true,
    )
  })
})
