"use client"

import {
  BackofficeSection,
} from "@/app/backoffice/components/BackofficeSection"
import { FoundationBrumaStage } from "@/app/[siteId]/[popId]/library/libraryFoundationDocShared"

export default function BackofficeClientesPage() {
  return (
    <BackofficeSection
      eyebrow="Próximamente"
      title="Clientes"
      description="Vista agregada de clientes finales de la plataforma entre todos los puntos de venta."
      loading={false}
      error={null}
      onRefresh={() => undefined}
    >
      <FoundationBrumaStage
        caption="Roadmap · analytics cross-POP"
        className="space-y-4"
      >
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--rootsy-bruma-700)]">
          Acá vas a poder auditar clientes compartidos, actividad comercial
          agregada y métricas de retención a nivel plataforma. Por ahora podés
          consultar clientes dentro de cada POP desde el workspace operativo.
        </p>
      </FoundationBrumaStage>
    </BackofficeSection>
  )
}
