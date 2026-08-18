import { BackofficePerformanceArticle } from "@/app/backoffice/components/BackofficePerformanceArticle"
import { BackofficePerformanceFlow } from "@/app/backoffice/components/BackofficePerformanceFlow"

const TOWER_REQUESTS = 2
const TARGET_PER_ACTION = 1
const CLICKS = [1, 2, 4, 8] as const

export function BackofficePerformanceActionsView() {
  const strategyOk = TOWER_REQUESTS <= TARGET_PER_ACTION

  return (
    <BackofficePerformanceArticle
      title="Actions"
      subtitle="El costo de cada click: lo que el server vuelve a armar antes de leer o escribir."
      topic="Cada server action es un POST. Antes de la query de negocio, casi todas rearman la misma torre: sesión, acceso al POP y, si hace falta, permisos. El sidecar del cliente no se reusa."
      strategy="requirePopAction junta auth, access y permiso. Access y permisos van en paralelo. cache() de React solo vale dentro del mismo request, así que tres actions siguen siendo tres torres si no reusás el helper."
      measure="Contamos las idas a la base que paga la torre de acceso, por action. Hoy son 2 en serie. Bien es 1. Si cada click paga las dos, no estamos bien."
      ok={strategyOk}
      verdict="La torre de acceso se paga completa en cada action."
      chartCaption="Idas a la base según clicks"
      chartHint="El punto verde marca la meta: 1 ida por action."
      samples={CLICKS.map((clicks) => ({
        label: clicks === 1 ? "1 click" : `${clicks} clicks`,
        current: clicks * TOWER_REQUESTS,
        target: clicks * TARGET_PER_ACTION,
      }))}
      diagram={
        <BackofficePerformanceFlow
          caption="Antes de la query de negocio, cada action rearma la torre de acceso."
          lanes={[
            {
              blocks: [
                { type: "step", node: { label: "Click" } },
                { type: "step", node: { label: "POST action" } },
                { type: "step", node: { label: "Auth" } },
                { type: "step", node: { label: "¿Tiene acceso?" } },
                { type: "step", node: { label: "¿POP activo?" } },
                { type: "step", node: { label: "Query de negocio" } },
              ],
            },
          ]}
        />
      }
    />
  )
}
