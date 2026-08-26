"use client"

import "@/components/data-workspace/dataWorkspaceTableInfinite.css"

/**
 * Bloque anterior de carga infinita: frase “Estoy trayendo más…” con tinta
 * viva y tres puntos. El listado ahora usa el halo de Rootsy en el piso;
 * este bloque queda acá para volver a montarlo si hace falta.
 */
export function DataWorkspaceTableInfiniteThinkingCopy({
  copy,
}: {
  copy: string
}) {
  return (
    <div className="data-workspace-table-infinite__stage">
      <p
        className="data-workspace-table-infinite__copy"
        aria-live="polite"
        aria-atomic="true"
      >
        <span
          className="data-workspace-table-infinite__phrase"
          data-text={copy}
        >
          {copy}
        </span>
        <span className="data-workspace-table-infinite__dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </p>
    </div>
  )
}
