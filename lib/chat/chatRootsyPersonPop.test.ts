import assert from "node:assert/strict"
import { describe, it } from "node:test"
import {
  compactChatRootsyPersonPopContext,
  formatChatRootsyPersonPopMessage,
  insertChatRootsyContextNotes,
} from "@/lib/chat/chatRootsyPersonPop"

const card = {
  firstName: "Arian",
  lastName: "Fernandez",
  roleName: "Dueño",
  isOwner: true,
  popName: "Café Raíces",
  businessType: "Bar/Restaurantes",
  modules: [{ key: "articles", label: "Artículos" }],
}

describe("contexto persona y pop para Rootsy", () => {
  it("arma nombre, apellido, rol, pop y tipo de negocio", () => {
    assert.deepEqual(compactChatRootsyPersonPopContext(card), {
      nombre: "Arian",
      apellido: "Fernandez",
      rol: "Dueño",
      pop: "Café Raíces",
      tipo_negocio: "Bar/Restaurantes",
    })
  })

  it("inyecta el contexto antes del mensaje de la persona", () => {
    const history = insertChatRootsyContextNotes(
      [
        { role: "user", body: "hola" },
        { role: "assistant", body: "Hola, ¿cómo estás?" },
        { role: "user", body: "subí el precio de las aguas" },
      ],
      [formatChatRootsyPersonPopMessage(card), "Acciones ya aplicadas."],
    )
    assert.equal(history.at(-1)?.body, "subí el precio de las aguas")
    assert.match(history.at(-3)?.body ?? "", /"nombre":"Arian"/)
    assert.match(history.at(-3)?.body ?? "", /"pop":"Café Raíces"/)
    assert.equal(history.at(-2)?.body, "Acciones ya aplicadas.")
  })
})
