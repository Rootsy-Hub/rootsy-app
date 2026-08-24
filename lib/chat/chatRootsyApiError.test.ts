import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { humanizeChatRootsyApiError } from "@/lib/chat/chatRootsyApiError"

describe("humanizeChatRootsyApiError", () => {
  it("traduce el FK de artículos con movimientos", () => {
    const raw =
      'update or delete on table "articles" violates foreign key constraint "inventory_movements_article_id_fkey" on table "inventory_movements"'
    assert.equal(
      humanizeChatRootsyApiError(raw, { subject: "Huevo", method: "DELETE" }),
      "No se puede eliminar Huevo: tiene movimientos de stock.",
    )
    assert.equal(
      humanizeChatRootsyApiError(raw),
      "No se puede eliminar: ese artículo tiene movimientos de stock.",
    )
  })

  it("usa la tabla hija del constraint en otros dominios", () => {
    assert.equal(
      humanizeChatRootsyApiError(
        'update or delete on table "clients" violates foreign key constraint "sales_client_id_fkey"',
        { subject: "María", method: "DELETE" },
      ),
      "No se puede eliminar María: tiene ventas.",
    )
    assert.equal(
      humanizeChatRootsyApiError(
        'update or delete on table "suppliers" violates foreign key constraint "purchases_supplier_id_fkey" on table "purchases"',
        { method: "DELETE" },
      ),
      "No se puede eliminar: ese proveedor tiene compras.",
    )
    assert.equal(
      humanizeChatRootsyApiError(
        'update or delete on table "recipes" violates foreign key constraint "pop_manufacturing_runs_recipe_id_fkey" on table "pop_manufacturing_runs"',
        { subject: "Milanesa", method: "DELETE" },
      ),
      "No se puede eliminar Milanesa: tiene producciones.",
    )
  })

  it("no deja pasar SQL ni nombres de constraint", () => {
    const raw =
      'update or delete on table "clients" violates foreign key constraint "sales_client_id_fkey"'
    const human = humanizeChatRootsyApiError(raw, { method: "DELETE" })
    assert.equal(human.includes("sales_client_id_fkey"), false)
    assert.equal(human.includes("clients"), false)
  })

  it("traduce unique y alta con padre inexistente", () => {
    assert.equal(
      humanizeChatRootsyApiError(
        'duplicate key value violates unique constraint "articles_pop_id_name_key"',
      ),
      "Ya existe un artículo con esos datos.",
    )
    assert.equal(
      humanizeChatRootsyApiError(
        'insert or update on table "inventory_movements" violates foreign key constraint "inventory_movements_article_id_fkey"',
      ),
      "Ese dato apunta a un artículo que no existe.",
    )
  })

  it("usa el path si no hay SQL parseable", () => {
    assert.equal(
      humanizeChatRootsyApiError("Not Found", {
        method: "PATCH",
        path: "/v1/pops/:popId/clients/:clientId",
      }),
      "No encontré ese cliente.",
    )
  })

  it("deja frases de negocio que ya están en castellano", () => {
    assert.equal(
      humanizeChatRootsyApiError(
        "Escribí (Eliminar Huevo) para confirmar el borrado.",
      ),
      "Escribí (Eliminar Huevo) para confirmar el borrado.",
    )
  })
})
