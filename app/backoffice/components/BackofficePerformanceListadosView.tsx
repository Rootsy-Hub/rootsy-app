import { BackofficePerformanceArticle } from "@/app/backoffice/components/BackofficePerformanceArticle"
import { BackofficePerformanceFlow } from "@/app/backoffice/components/BackofficePerformanceFlow"

const LISTADO_SAMPLES = [
  { label: "Clientes", current: 0 },
  { label: "Artículos", current: 1 },
  { label: "Operaciones", current: 1 },
  { label: "Facturas", current: 1 },
  { label: "Cheques", current: 1 },
] as const

export function BackofficePerformanceListadosView() {
  const strategyOk = LISTADO_SAMPLES.every((sample) => sample.current === 0)

  return (
    <BackofficePerformanceArticle
      title="Listados"
      subtitle="Las tablas paginadas del workspace: artículos, operaciones, cheques, facturas, clientes."
      topic="Listado es la tabla que se pide al entrar a un módulo. Misma forma, muchas pages. El win es chico y repetible: si la tabla ya está en sesión, no se vuelve a pedir."
      strategy="Solo clientes usa React Query con cache de sesión. El resto carga con useEffect al entrar o al cambiar filtros. Salís y volvés: se pide todo de nuevo."
      measure="Contamos los pedidos extra al volver a un listado. Cero es bien: la tabla sigue en sesión. Uno es el patrón de hoy, salvo clientes. Si casi todos piden de nuevo, no estamos bien."
      ok={strategyOk}
      verdict="Salvo clientes, volver a un listado pide la tabla de nuevo."
      chartCaption="Pedidos extra al volver a entrar"
      chartHint="El punto verde marca la meta: 0 pedidos extra."
      samples={LISTADO_SAMPLES.map((sample) => ({
        ...sample,
        target: 0,
      }))}
      diagram={
        <BackofficePerformanceFlow
          caption="Clientes conserva la tabla en sesión. El resto la pide cada vez que entrás."
          lanes={[
            {
              title: "Clientes",
              blocks: [
                { type: "step", node: { label: "Entrar" } },
                { type: "step", node: { label: "React Query", note: "cache de sesión" } },
                { type: "step", node: { label: "Tabla" } },
                { type: "step", node: { label: "Volver", note: "sin pedido extra" } },
              ],
            },
            {
              title: "El resto",
              blocks: [
                { type: "step", node: { label: "Entrar" } },
                { type: "step", node: { label: "useEffect" } },
                { type: "step", node: { label: "Pedir tabla" } },
                { type: "loop", label: "Salir y volver" },
              ],
            },
          ]}
        />
      }
    />
  )
}
