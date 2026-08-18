import { BackofficePerformanceArticle } from "@/app/backoffice/components/BackofficePerformanceArticle"
import { BackofficePerformanceFlow } from "@/app/backoffice/components/BackofficePerformanceFlow"

const GATES_HTML = 1
const GATES_OTHER = 2
const GATES_TARGET = 1

export function BackofficePerformancePagesView() {
  const strategyOk = GATES_HTML <= GATES_TARGET

  return (
    <BackofficePerformanceArticle
      title="Pages"
      subtitle="Cuánto tarda en verse algo útil al entrar a una ruta."
      topic="Page es el costo de entrar: JS del client, spinners en cascada y trabajo idle. No es qué datos pedimos. Es cuántas puertas hay que cruzar antes de ver contenido."
      strategy="La sesión llega del server. Home manda el saludo y los POPs en el HTML. Los listados piden la tabla en el server y hidratan las filas. Menú, Vender y Contabilidad siguen esperando persist y el load del client."
      measure="Contamos las esperas en cascada antes del contenido. Home y los listados ya están en 1. Menú, Vender y Contabilidad siguen en 2. Bien es 1."
      ok={strategyOk}
      verdict="Home y los listados ya mandan HTML con datos. Menú, Vender y Contabilidad todavía cruzan persist y load."
      chartCaption="Esperas antes del contenido"
      chartHint="El punto verde marca la meta: 1 espera."
      samples={[
        { label: "Home", current: GATES_HTML, target: GATES_TARGET },
        { label: "Listados", current: GATES_HTML, target: GATES_TARGET },
        { label: "Menú", current: GATES_OTHER, target: GATES_TARGET },
        { label: "Vender", current: GATES_OTHER, target: GATES_TARGET },
        { label: "Contabilidad", current: GATES_OTHER, target: GATES_TARGET },
      ]}
      diagram={
        <BackofficePerformanceFlow
          caption="Home y los listados llegan con datos en el HTML. Menú, Vender y Contabilidad todavía cruzan persist y el load del client."
          lanes={[
            {
              blocks: [
                { type: "step", node: { label: "Abrir Home o un listado" } },
                { type: "step", node: { label: "HTML con datos" } },
                { type: "step", node: { label: "Contenido" } },
              ],
            },
          ]}
        />
      }
    />
  )
}
