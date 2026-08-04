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
            Al entrar al inicio, con usuario logueado, pedimos tres bloques de
            datos al servidor y los guardamos en React Query (cache 24 h).
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            1. Perfil — <code className="text-emerald-300">user-profile</code>
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
            2. POPs propios —{" "}
            <code className="text-emerald-300">user-pops-owner</code>
          </h2>
          <p>
            <strong className="text-zinc-100">Tabla:</strong>{" "}
            <code>pops</code> donde <code>owner_user_id</code> = usuario.
          </p>
          <p>
            <strong className="text-zinc-100">Campos en cache:</strong>{" "}
            <code>id</code>, <code>name</code>, <code>image_url</code>,{" "}
            <code>is_active</code>, <code>business_type_id</code>,{" "}
            <code>subscription_id</code>, <code>site_id</code>,{" "}
            <code>street_address</code>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            3. POPs con rol — <code className="text-emerald-300">user-pops</code>
          </h2>
          <p>
            <strong className="text-zinc-100">Tabla:</strong>{" "}
            <code>user_pop_roles</code> con <code>user_id</code> = usuario e{" "}
            <code>is_active = true</code>.
          </p>
          <p>En la misma consulta (join) traemos:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              El POP (<code>pops</code>) con los mismos campos que en el punto
              2.
            </li>
            <li>
              El rol (<code>roles</code>) validando que{" "}
              <code>roles.pop_id</code> coincida con el POP (o sea rol de
              sistema): <code>name</code>, <code>display_name</code>,{" "}
              <code>permission_grants</code>.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-white">
            Pantalla del inicio
          </h2>
          <p>
            Con esos tres caches unimos POPs propios y POPs con rol para la
            grilla. Por cada POP pedimos aparte la suscripción (
            <code className="text-emerald-300">pop-subscription</code>).
          </p>
        </section>

        <section className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-zinc-400">
          <p>
            <strong className="text-zinc-200">Código:</strong>{" "}
            <code>homeUserDataActions.ts</code>,{" "}
            <code>hooks/useHomePageData.ts</code>
          </p>
          <p>
            <strong className="text-zinc-200">TTL cache:</strong> 24 h (
            <code>oneDayQueryOptions</code>)
          </p>
        </section>
      </main>
    </div>
  )
}
