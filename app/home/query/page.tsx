import Link from "next/link"

export const metadata = {
  title: "Inicio — Consultas y cache | Rootsy",
  description:
    "Cómo cargamos datos del inicio con React Query y Supabase.",
}

export default function HomeQueryDocsPage() {
  return (
    <div className="min-h-screen bg-[#070a09] text-zinc-100">
      <header className="border-b border-white/10 bg-black/20 px-6 py-4">
        <Link
          href="/home"
          className="text-sm text-emerald-300/90 underline-offset-2 hover:underline"
        >
          ← Volver al inicio
        </Link>
      </header>

      <main className="mx-auto max-w-2xl space-y-8 px-6 py-10 text-sm leading-relaxed text-zinc-300">
        <div>
          <h1 className="text-2xl font-bold text-white">Consultas del inicio</h1>
          <p className="mt-2">
            Al entrar al inicio pedimos un perfil global, la lista de POPs
            accesibles y, por cada POP, un bloque de acceso completo en React
            Query (cache 24 h).
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            1. Perfil — <code className="text-emerald-300">_user-profile</code>
          </h2>
          <p>
            <strong className="text-zinc-100">Tabla:</strong>{" "}
            <code>users</code> filtrada por el id del usuario autenticado.
          </p>
          <p>
            <strong className="text-zinc-100">Campos en cache:</strong>{" "}
            <code>first_name</code>, <code>last_name</code>,{" "}
            <code>image_url</code>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            2. Índice de POPs —{" "}
            <code className="text-emerald-300">_user-pop-ids</code>
          </h2>
          <p>
            Reemplaza las caches anteriores <code>user-pops-owner</code> y{" "}
            <code>user-pops</code>. Devuelve solo los ids accesibles:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              POPs donde <code>owner_user_id</code> = usuario (
              <code>pops</code>).
            </li>
            <li>
              POPs con rol activo (<code>user_pop_roles</code> con{" "}
              <code>is_active = true</code>).
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            3. Acceso por POP —{" "}
            <code className="text-emerald-300">_pop-access</code> +{" "}
            <code>popId</code>
          </h2>
          <p>
            Por cada id del punto 2 se consulta el acceso completo (owner y
            miembros). Una sola cache por POP.
          </p>
          <p>
            <strong className="text-zinc-100">Contenido:</strong>
          </p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              <strong className="text-zinc-100">Datos del POP:</strong>{" "}
              <code>id</code>, <code>name</code>, <code>image_url</code>,{" "}
              <code>background_image_url</code>, <code>site_id</code>,{" "}
              <code>street_address</code>, <code>is_active</code>.
            </li>
            <li>
              <strong className="text-zinc-100">Estado de subscripción:</strong>{" "}
              RPC <code>get_pop_subscription_info</code> →{" "}
              <code>isActive</code>, <code>status</code>, plan, trial, período.
              Define <code>canEnter</code> (POP activo + subscripción vigente).
            </li>
            <li>
              <strong className="text-zinc-100">Datos fiscales:</strong>{" "}
              <code>fiscal_cuit</code>, condición IVA del emisor (
              <code>fiscal.hasValidCuit</code>,{" "}
              <code>fiscal.emisorIvaCondition</code>).
            </li>
            <li>
              <strong className="text-zinc-100">Tipo de negocio:</strong>{" "}
              <code>businessTypeName</code> y{" "}
              <code>businessTypeDisplayName</code> dentro de{" "}
              <code>subscription</code> (RPC{" "}
              <code>get_pop_subscription_info</code>).
            </li>
            <li>
              <strong className="text-zinc-100">Módulos habilitados:</strong>{" "}
              generales + específicos del tipo + extras contratados (o todos si
              el plan incluye <code>all_modules</code>). Desde{" "}
              <code>rootsySubscriptionCatalog</code> +{" "}
              <code>_pop_subscriptions.extra_modules</code>.
            </li>
            <li>
              <strong className="text-zinc-100">Límites:</strong> usuarios,
              artículos y operaciones/mes del plan × tipo.
            </li>
            <li>
              <strong className="text-zinc-100">isOwner:</strong> si el usuario
              es titular del POP.
            </li>
            <li>
              <strong className="text-zinc-100">Rol y permisos:</strong> si no
              es owner, trae el rol activo (<code>roles</code>) y, por cada
              módulo habilitado con pantalla en el POP, los permisos{" "}
              <code>read/create/update/delete</code> según{" "}
              <code>permission_grants</code>. El owner tiene acceso completo en
              todos los módulos habilitados.
            </li>
          </ol>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Pantalla del inicio
          </h2>
          <p>
            Con <code>_user-pop-ids</code> + N consultas{" "}
            <code>_pop-access</code> armamos la grilla. Solo se puede entrar al
            POP si <code>canEnter</code> es true; si es owner y la subscripción
            está inactiva, puede ir a activarla.
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
          <p>
            <strong className="text-zinc-200">Código:</strong>{" "}
            <code>homeUserDataActions.ts</code>,{" "}
            <code>popAccessResolve.ts</code>,{" "}
            <code>hooks/useHomePageData.ts</code>
          </p>
          <p>
            <strong className="text-zinc-200">TTL cache:</strong> 24 h (
            <code>oneDayQueryOptions</code>). Las claves con prefijo{" "}
            <code>_</code> se persisten en <code>localStorage</code> para
            sobrevivir recargas de página.
          </p>
        </section>
      </main>
    </div>
  )
}
