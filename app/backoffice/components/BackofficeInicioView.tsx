import { FoundationSpecCard } from "@/app/library/libraryFoundationDocShared"
import { dataWorkspaceBlocksSectionTitleClass } from "@/components/data-workspace/dataWorkspaceListStyles"

const ROOTSY_ITEMS = [
  "Cuentas y tesorería",
  "Reportes y estadísticas",
  "Stock de artículos",
  "Cobros y facturación",
  "Suscripciones y planes (como servicios del tenant Rootsy)",
] as const

const UROBOROS_ITEMS = [
  "Usuarios del sistema (globales, no vinculados al RRHH de un tenant)",
  "Puntos de venta (entidades de plataforma, no visibles en la operación de un POP)",
  "Organizaciones y relaciones que el tenant Rootsy no puede administrar solo",
] as const

export function BackofficeInicioView() {
  return (
    <section className="mx-auto max-w-3xl space-y-8 pb-4">
      <FoundationSpecCard className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-700)] sm:text-base">
          Uroboros es el backoffice de Rootsy. En gran medida operamos sobre el
          propio Rootsy: la plataforma multitenant se consume a sí misma mediante
          un tenant dedicado para gestionar suscripciones, cobros y la operación
          interna de la plataforma.
        </p>
        <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-700)] sm:text-base">
          Encima de esa capa, Uroboros expone lo que solo con el tenant Rootsy no
          podemos ver ni administrar: entidades y relaciones propias de la
          plataforma, transversales a cualquier punto de venta.
        </p>
      </FoundationSpecCard>

      <div className="grid gap-4 md:grid-cols-2">
        <FoundationSpecCard className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--rootsy-savia-600)]">
              Capa Rootsy
            </p>
            <h2 className={dataWorkspaceBlocksSectionTitleClass}>
              Consumido del sistema
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-600)]">
            Operación del negocio y del tenant Rootsy. Todo queda en el propio
            Rootsy — no lo duplicamos en Uroboros.
          </p>
          <ul className="space-y-2 text-sm text-[var(--rootsy-bruma-800)]">
            {ROOTSY_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--rootsy-savia-500)]"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FoundationSpecCard>

        <FoundationSpecCard className="space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--rootsy-bruma-500)]">
              Capa Uroboros
            </p>
            <h2 className={dataWorkspaceBlocksSectionTitleClass}>
              Específico de plataforma
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-[var(--rootsy-bruma-600)]">
            Administración transversal del sistema. Datos y vistas que no
            pertenecen a la operación diaria de un tenant o punto de venta.
          </p>
          <ul className="space-y-2 text-sm text-[var(--rootsy-bruma-800)]">
            {UROBOROS_ITEMS.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--rootsy-bruma-400)]"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </FoundationSpecCard>
      </div>
    </section>
  )
}
