"use client"

import { BackofficePerformanceArticle } from "@/app/backoffice/components/BackofficePerformanceArticle"
import { BackofficePerformanceFlow } from "@/app/backoffice/components/BackofficePerformanceFlow"
import { getUserPopIdsCache } from "@/app/home/homeUserDataActions"
import { useQueryPersistReady } from "@/components/providers/QueryProvider"
import { useAuth } from "@/context/AuthContextSupabase"
import { userPopIdsQueryKey } from "@/lib/queryKeys"
import { oneDayQueryOptions } from "@/lib/queryStaleTimes"
import { useQuery } from "@tanstack/react-query"

const HOME_FIXED_REQUESTS = 2
const HOME_TARGET_REQUESTS = 3
const COST_SAMPLES = [1, 2, 4, 8] as const

function homeRequestCount(_popCount: number) {
  return HOME_FIXED_REQUESTS
}

function useSidecarHomeMeasure() {
  const { user } = useAuth()
  const persistReady = useQueryPersistReady()
  const userId = user?.id ?? ""

  const popIdsQuery = useQuery({
    queryKey: userPopIdsQueryKey(userId),
    queryFn: getUserPopIdsCache,
    enabled: persistReady && Boolean(userId),
    ...oneDayQueryOptions,
  })

  const popCount = popIdsQuery.data?.length ?? 0

  return {
    ready: persistReady && popIdsQuery.isSuccess,
    popCount,
    current: homeRequestCount(popCount),
    target: HOME_TARGET_REQUESTS,
  }
}

export function BackofficePerformanceSidecarView() {
  const measure = useSidecarHomeMeasure()
  const strategyOk = homeRequestCount(2) <= HOME_TARGET_REQUESTS

  return (
    <BackofficePerformanceArticle
      title="Sidecar"
      subtitle="El contexto mínimo para saber quién sos, a qué POPs entrás y si esos POPs se pueden usar."
      topic="Sidecar no es un módulo. Es lo que viaja — o se vuelve a pedir — en cada request de un tenant: la sesión, el perfil, el acceso a cada POP con sus permisos, y si ese POP está activo con la suscripción vigente."
      strategy="Home prefetcha perfil y el batch de access en el layout. El client hidrata; el persist no pisa esas keys. En el navegador el sidecar vive 24 horas. Cada action, en el server, sigue rearmando la sesión y el acceso."
      measure={`Contamos las idas al server que hace Home para armar el sidecar. Hoy son ${HOME_FIXED_REQUESTS}: perfil y un batch con todos los POPs. Bien es ${HOME_TARGET_REQUESTS} o menos, aunque tengas muchos POPs. Si el número crece con cada POP, no estamos bien.`}
      ok={strategyOk}
      verdict="Home no escala con la cantidad de POPs."
      chartCaption="Requests de Home según POPs"
      chartHint={`El punto verde marca la meta: ${HOME_TARGET_REQUESTS} requests.`}
      samples={COST_SAMPLES.map((popCount) => ({
        label: popCount === 1 ? "1 POP" : `${popCount} POPs`,
        current: homeRequestCount(popCount),
        target: HOME_TARGET_REQUESTS,
      }))}
      diagram={
        <BackofficePerformanceFlow
          caption="Home hidrata el sidecar desde el server. Cada action, en el server, empieza de cero."
          lanes={[
            {
              title: "Cliente · Home",
              blocks: [
                { type: "step", node: { label: "Prefetch en el layout" } },
                {
                  type: "split",
                  note: "al mismo tiempo",
                  nodes: [
                    { label: "Perfil" },
                    { label: "Access de todos los POPs" },
                  ],
                },
                { type: "step", node: { label: "Hidrata el client" } },
                { type: "step", node: { label: "Cache 24 h", note: "localStorage" } },
              ],
            },
            {
              title: "Server · cada action",
              blocks: [
                { type: "step", node: { label: "Click" } },
                { type: "step", node: { label: "Auth de nuevo" } },
                { type: "step", node: { label: "Access + ¿activo?" } },
                { type: "step", node: { label: "Query" } },
              ],
            },
          ]}
        />
      }
    >
      {measure.ready ? (
        <>
          En esta sesión hay {measure.popCount}{" "}
          {measure.popCount === 1 ? "POP" : "POPs"}. Home arma el sidecar en{" "}
          {measure.current} requests. La meta es {measure.target}.
        </>
      ) : (
        <>Estamos leyendo los POPs de esta sesión para aplicar la misma cuenta.</>
      )}
    </BackofficePerformanceArticle>
  )
}
