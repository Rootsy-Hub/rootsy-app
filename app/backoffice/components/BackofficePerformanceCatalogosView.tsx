import { BackofficePerformanceArticle } from "@/app/backoffice/components/BackofficePerformanceArticle"
import { BackofficePerformanceFlow } from "@/app/backoffice/components/BackofficePerformanceFlow"

const TARGET_FETCHES = 1
const VISITS = [1, 2, 3, 4] as const

export function BackofficePerformanceCatalogosView() {
  const strategyOk = VISITS[1] <= TARGET_FETCHES

  return (
    <BackofficePerformanceArticle
      title="Catálogos"
      subtitle="Lo que se abre para cobrar o comprar: artículos, categorías, promos y caja."
      topic="Catálogo es el payload de Vender, Comprar, Mesas y Mostrador. El sidecar ya dijo quién sos. Acá entra lo que se muestra para operar."
      strategy="Vender y Comprar piden el catálogo en el mount, sin React Query. Mesas y Mostrador sí lo piden por Query, pero con los defaults globales: staleTime 0 y refetch en cada mount. Volver del menú vuelve a pedir el catálogo."
      measure="Contamos cuántas veces se pide el catálogo al entrar a operar. Hoy es una vez por visita. Bien es una vez por sesión, si el catálogo no cambió. Si el número crece cada vez que volvés, no estamos bien."
      ok={strategyOk}
      verdict="Re-entrar a Vender, Comprar o Mesas vuelve a pedir el catálogo."
      chartCaption="Pedidos de catálogo al volver a entrar"
      chartHint={`El punto verde marca la meta: ${TARGET_FETCHES} pedido por sesión.`}
      samples={VISITS.map((visit) => ({
        label: visit === 1 ? "1 visita" : `${visit} visitas`,
        current: visit,
        target: TARGET_FETCHES,
      }))}
      diagram={
        <BackofficePerformanceFlow
          caption="Entrar a operar pide el catálogo. Salir y volver lo pide otra vez."
          lanes={[
            {
              blocks: [
                {
                  type: "step",
                  node: { label: "Entrar a Vender, Comprar o Mesas" },
                },
                {
                  type: "split",
                  note: "un pedido distinto por pantalla",
                  nodes: [
                    { label: "Vender", note: "useEffect" },
                    { label: "Comprar", note: "useEffect" },
                    { label: "Mesas", note: "Query stale" },
                  ],
                },
                { type: "step", node: { label: "Pintar productos" } },
                { type: "loop", label: "Volver al menú y entrar otra vez" },
              ],
            },
          ]}
        />
      }
    />
  )
}
