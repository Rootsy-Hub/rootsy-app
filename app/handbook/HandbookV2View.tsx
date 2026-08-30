"use client"

import { getHandbookV2Page } from "@/app/handbook/handbookV2"
import {
  handbookDocChapterClass,
  libraryDocBodyClass,
  libraryDocPageDescriptionClass,
  libraryDocPageTitleClass,
  libraryDocSectionTitleClass,
  libraryDoPanelClass,
  libraryDontPanelClass,
  librarySpecCardClass,
} from "@/app/library/libraryColorTheme"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

type Props = {
  pageId: string
}

function Lead({ children }: { children: ReactNode }) {
  return <p className={cn(libraryDocPageDescriptionClass, "max-w-2xl text-base")}>{children}</p>
}

function Body({ children }: { children: ReactNode }) {
  return <p className={libraryDocBodyClass}>{children}</p>
}

function Chapter({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: ReactNode
}) {
  return (
    <section id={id} className={handbookDocChapterClass}>
      <h2 className={libraryDocSectionTitleClass}>{title}</h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function CardGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>
}

function SpecCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <article className={cn(librarySpecCardClass, "rounded-2xl p-4")}>
      <h3 className="rootsy-text-heading-xsmall text-[var(--color-texto)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-texto-muted)]">{children}</p>
    </article>
  )
}

function TokenSwatch({
  name,
  token,
  usage,
}: {
  name: string
  token: string
  usage: string
}) {
  return (
    <div className={cn(librarySpecCardClass, "overflow-hidden rounded-2xl")}>
      <div className="h-16" style={{ background: token }} />
      <div className="space-y-1 p-3">
        <p className="rootsy-text-heading-xsmall text-[var(--color-texto)]">{name}</p>
        <p className="font-canopy text-xs text-[var(--color-texto-muted)]">{usage}</p>
      </div>
    </div>
  )
}

function RuleTable({
  rows,
}: {
  rows: { token: string; value: string; use: string }[]
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--color-borde)]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[var(--color-elevada)] text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-texto-muted)]">
          <tr>
            <th className="px-4 py-3">Token / pieza</th>
            <th className="px-4 py-3">Valor</th>
            <th className="px-4 py-3">Uso</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.token} className="border-t border-[var(--color-borde)]">
              <td className="px-4 py-3 font-medium text-[var(--color-texto)]">{row.token}</td>
              <td className="px-4 py-3 text-[var(--color-texto-muted)]">{row.value}</td>
              <td className="px-4 py-3 text-[var(--color-texto-muted)]">{row.use}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PriorityList({
  items,
}: {
  items: { id: string; title: string; impact: string; why: string }[]
}) {
  return (
    <ol className="space-y-3">
      {items.map((item, index) => (
        <li key={item.id} className={cn(librarySpecCardClass, "rounded-2xl p-4")}>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--color-texto-muted)]">
            P{index + 1} · {item.impact}
          </p>
          <h3 className="mt-1 rootsy-text-heading-xsmall text-[var(--color-texto)]">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-texto-muted)]">
            {item.why}
          </p>
        </li>
      ))}
    </ol>
  )
}

function OverviewPage() {
  return (
    <>
      <header className="space-y-4">
        <p className="rootsy-text-label text-[var(--rootsy-savia-700)]">Design System v2</p>
        <h1 className={libraryDocPageTitleClass}>Un sistema que decide</h1>
        <Lead>
          El v1 documentaba atmósferas, propuestas y excepciones. El v2 documenta una receta.
          Parte de Vender — el pulso económico del producto — y se extiende al resto de Operar
          sin volver a ofrecer tres maneras de hacer lo mismo.
        </Lead>
      </header>

      <Chapter id="vision" title="Visión">
        <Body>
          Rootsy tiene que sentirse natural al primer contacto y capaz cuando el negocio lo pide.
          En Vender eso significa: encontrar rápido, revisar sin seriedad de más, cerrar con una
          sola acción. La calidad no se mide por cantidad de variantes. Se mide por certeza.
        </Body>
        <CardGrid>
          <SpecCard title="Oficio antes que catálogo">
            Una receta canónica por patrón. Las propuestas A/B/C del v1 quedan como archivo, no
            como ley.
          </SpecCard>
          <SpecCard title="Un rayo por superficie">
            Savia aparece poco. En Vender, el rayo es Vender. El resto lee, espera o se configura.
          </SpecCard>
          <SpecCard title="Dos orillas">
            Sombra para encontrar. Bruma para decidir. El split no es estética: es el mapa mental
            de la operación.
          </SpecCard>
          <SpecCard title="Cifra primero">
            El monto se lee antes que el adorno. Tipografía tabular, contraste de oficio, total
            visible en el umbral de cierre.
          </SpecCard>
        </CardGrid>
      </Chapter>

      <Chapter id="principios" title="Principios de diseño">
        <ol className={cn(libraryDocBodyClass, "list-decimal space-y-3 pl-5")}>
          <li>
            <strong>Naturalidad.</strong> Si hay que explicar el layout, está sobrecargado.
          </li>
          <li>
            <strong>Un rayo.</strong> Una acción savia por superficie. El resto no compite.
          </li>
          <li>
            <strong>Profundidad progresiva.</strong> Simple al entrar. Profundo si el negocio lo
            pide. Nada de mostrar todo a la vez.
          </li>
          <li>
            <strong>Naturaleza con trabajo.</strong> Si un detalle no ayuda a entender o a
            actuar, sobra. La marca no se decora: se habita.
          </li>
          <li>
            <strong>Contraste de oficio.</strong> Disabled no es un fantasma. El foco se ve. El
            texto muted sigue siendo texto.
          </li>
          <li>
            <strong>Voz al lado.</strong> Cercana, precisa, argentina. Nunca infantil ni
            corporativa. Habla cuando aporta el próximo movimiento.
          </li>
        </ol>
      </Chapter>
    </>
  )
}

function EsenciaPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Esencia de marca preservada</h1>
        <Lead>
          El handbook v1 acierta en lo que Rootsy es. El v2 no lo reescribe. Separa la esencia
          —que no se negocia— de las decisiones visuales que ya no disciplinan el producto.
        </Lead>
      </header>

      <Chapter id="preservar" title="Lo que no se toca">
        <CardGrid>
          <SpecCard title="«Tu negocio está en buenas patas»">
            Esencia. Compañero inteligente, no mascota decorativa ni asistente genérico.
          </SpecCard>
          <SpecCard title="Personalidad">
            Curioso, observador, ágil, cálido y preciso. Nunca infantil, caricaturesco, distante
            ni corporativo.
          </SpecCard>
          <SpecCard title="Atmósferas">
            Éter contiene el afuera. Sombra opera. Bruma lee. Savia marca el movimiento. Si un
            color no ordena, no entra.
          </SpecCard>
          <SpecCard title="Tipografía">
            Inter para UI y números. Nunito Sans para prosa. Jerarquía corta. Bold solo cuando
            el dato tiene que quedar.
          </SpecCard>
          <SpecCard title="Voz">
            Cercana, clara, natural. Habla cuando tiene algo útil. Primera persona, excepcional.
          </SpecCard>
          <SpecCard title="Split de oficio">
            Catálogo oscuro + ticket claro. Es el gesto más reconocible de Operar. Se conserva
            porque nombra el trabajo, no porque sea “el sistema”.
          </SpecCard>
        </CardGrid>
      </Chapter>

      <Chapter id="no-es-esencia" title="Lo que no es esencia">
        <Body>
          El v1 confundió territorio con receta. Estas piezas se pueden —y se deben— evolucionar
          sin perder a Rootsy:
        </Body>
        <ul className={cn(libraryDocBodyClass, "list-disc space-y-2 pl-5")}>
          <li>Tres propuestas de toolbox, card y ticket conviviendo como si todas fueran ley.</li>
          <li>Alturas mágicas (79px) tratadas como identidad.</li>
          <li>Savia en íconos configurados y en el CTA a la vez.</li>
          <li>Tokens sueltos: slate, zinc, rose, emerald, white/10.</li>
          <li>Disabled al 45% de opacidad.</li>
          <li>Empty states poéticos que no nombran el próximo movimiento.</li>
          <li>El docs/design-system.md de era PS5: profundidad de consola, no de oficio.</li>
        </ul>
      </Chapter>
    </>
  )
}

function EvolucionPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Qué evoluciona, y por qué</h1>
        <Lead>
          El v1 era un mapa generoso y un sistema indeciso. El v2 recorta para que Vender —y
          después el resto— se construya con menos duda.
        </Lead>
      </header>

      <Chapter id="decisiones" title="Decisiones que cambian">
        <RuleTable
          rows={[
            {
              token: "Receta única",
              value: "Una card, un ticket, un umbral",
              use: "El v1 ofrecía A/B/C. Eso no es un sistema: es un menú.",
            },
            {
              token: "Savia",
              value: "Solo el commit",
              use: "En Vender, Vender. Configurado se lee, no se pinta de rayo.",
            },
            {
              token: "Nombre de producto",
              value: "2 líneas en grilla",
              use: "Reconocer es el trabajo del catálogo. Una línea cortaba el oficio.",
            },
            {
              token: "Disabled",
              value: "Tinta muted, no fantasma",
              use: "opacity-45 falla contraste y parece un bug.",
            },
            {
              token: "Ahorro",
              value: "Sustantivo, no «Se ahorra»",
              use: "En el umbral se lee dato, no oración.",
            },
            {
              token: "Pedido vacío",
              value: "Espera + próximo paso",
              use: "La voz al lado nombra qué falta y qué hacer.",
            },
            {
              token: "Foco",
              value: "Anillo savia visible",
              use: "El teclado es un modo de cobro, no un extra.",
            },
            {
              token: "Tokens",
              value: "Familias Rootsy",
              use: "Slate, zinc y emerald no habitan este mundo.",
            },
          ]}
        />
      </Chapter>

      <Chapter id="vacios-v1" title="Vacíos y reglas obsoletas del v1">
        <Body>
          El handbook estratégico tiene capítulos vacíos (journeys, naming, changelog, métricas).
          El sistema de diseño v1 describe foundations y luego deja componentes como títulos sin
          criterio de uso. La librería y el docs/design-system.md no coinciden con el producto.
          El v2 no completa esos huecos con más prosa: los cierra con una receta aplicable.
        </Body>
        <div className={cn(libraryDontPanelClass, "rounded-2xl p-4")}>
          No se defiende una decisión visual porque “ya está en el sistema”. Si limita claridad,
          accesibilidad o conversión, evoluciona.
        </div>
      </Chapter>
    </>
  )
}

function FundamentosPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Fundamentos visuales</h1>
        <Lead>
          Mismo mundo que el handbook. Menos ruido. Cada fundamento tiene un trabajo en Vender
          y una regla para no romperlo.
        </Lead>
      </header>

      <Chapter id="color" title="Color">
        <div className="grid gap-3 sm:grid-cols-3">
          <TokenSwatch
            name="Sombra"
            token="var(--rootsy-sombra-700)"
            usage="Catálogo, rail, umbral. Encontrar."
          />
          <TokenSwatch
            name="Bruma"
            token="var(--rootsy-bruma-100)"
            usage="Ticket, lectura, decisión."
          />
          <TokenSwatch
            name="Savia"
            token="var(--rootsy-savia-500)"
            usage="Un commit. Ahorro. Foco."
          />
        </div>
        <Body>
          Éter sigue encabezando el afuera (menú, vacío). Lava es peligro. Sol es aviso, no
          dinero. Cielo informa. Savia no pinta superficies enteras.
        </Body>
      </Chapter>

      <Chapter id="tipografia" title="Tipografía">
        <RuleTable
          rows={[
            {
              token: "UI",
              value: "Inter · regular / semibold / bold",
              use: "Títulos, labels, botones, ticket.",
            },
            {
              token: "Lectura",
              value: "Nunito Sans · 16 / 1.5 / 65ch",
              use: "Handbook, ayuda, descripción de card.",
            },
            {
              token: "Cifra",
              value: "Inter tabular",
              use: "Precio, total, ahorro, cantidad.",
            },
            {
              token: "Label",
              value: "12px · semibold · tracking amplio",
              use: "CLIENTE, TOTAL, AHORRO. No para nombres.",
            },
          ]}
        />
        <Body>
          En catálogo el nombre es heading-xsmall, dos líneas. El precio es metric-small. En el
          umbral el total es metric. No se inventan tamaños sueltos.
        </Body>
      </Chapter>

      <Chapter id="espaciado-grid" title="Espaciado y grid">
        <Body>
          La escala de spacing del producto se mantiene. Vender usa una grilla de oficio, no de
          marketing: catálogo flexible + ticket 400px (10× space.500). El umbral de checkout
          cruza las dos orillas. El gap del catálogo es el mismo ritmo que el resto de Operar.
        </Body>
        <Body>
          La card canónica mide 208×auto: media 96, título de dos líneas, precio y stock. El
          virtualizador estima esa altura. No se vuelve a 192px para “entrar una más”.
        </Body>
      </Chapter>

      <Chapter id="iconos-borde" title="Iconografía, bordes, sombras, movimiento">
        <CardGrid>
          <SpecCard title="Íconos">
            Lucide, trazo 2. Tamaño 20 en oficio, 16 en meta. El ícono nombra; no decora el
            vacío.
          </SpecCard>
          <SpecCard title="Bordes">
            Hairline de la atmósfera: sombra-500 en cards, sombra-800 en umbral, bruma-200 en
            ticket. Un solo ancho. Sin doble línea.
          </SpecCard>
          <SpecCard title="Elevación">
            Bruma, no teatro. La card se levanta 2px al hover. El ticket no proyecta sombra de
            escenario. El umbral no flota: es piso.
          </SpecCard>
          <SpecCard title="Movimiento">
            150–200ms, ease-out. Press en el + de la card. Respeto a reduced-motion. Nada de
            partículas en el cobro.
          </SpecCard>
        </CardGrid>
      </Chapter>
    </>
  )
}

function TokensPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Tokens de diseño</h1>
        <Lead>
          El v2 no inventa una paleta nueva. Disciplina el uso. Si un valor no tiene token
          Rootsy, no entra a Vender.
        </Lead>
      </header>

      <Chapter id="atmósfera" title="Atmósfera · Sotobosque sombra">
        <RuleTable
          rows={[
            { token: "--color-fondo", value: "negro", use: "Lienzo de Operar." },
            { token: "--color-superficie", value: "sombra-800 / 700", use: "Canvas y card." },
            { token: "--color-borde", value: "sombra-500 / 700", use: "Card y costura." },
            { token: "--color-texto", value: "sombra-50", use: "Nombre, total, valor listo." },
            { token: "--color-texto-muted", value: "sombra-300 / 200", use: "Meta, stock, idle." },
          ]}
        />
      </Chapter>

      <Chapter id="funcionales" title="Funcionales">
        <RuleTable
          rows={[
            { token: "--color-accion", value: "savia-500", use: "Botón Vender." },
            { token: "--color-accion-hover", value: "savia-400 / 600", use: "Hover / press del rayo." },
            { token: "--color-foco", value: "savia-400", use: "Focus visible. No pinta el slot." },
            { token: "--color-exito", value: "savia-400", use: "Ahorro. Check de toast." },
            { token: "--color-atencion", value: "sol-500", use: "Caja cerrada. Sin stock." },
            { token: "--color-peligro", value: "lava-600", use: "Descartar. Error." },
          ]}
        />
      </Chapter>

      <Chapter id="tipo-espacio" title="Tipo, espacio, radio">
        <RuleTable
          rows={[
            { token: "heading-xsmall", value: "14 / 20 · bold", use: "Nombre de producto, valor de slot." },
            { token: "metric / metric-small", value: "28 / 16 tabular", use: "Total umbral / precio card." },
            { token: "label", value: "12 · semibold · uppercase", use: "AHORRO, TOTAL, CLIENTE." },
            { token: "space.200 / 400", value: "16 / 32", use: "Padding de umbral y clusters." },
            { token: "radius-xlarge", value: "16", use: "Card de catálogo." },
            { token: "radius-full", value: "999", use: "Botón Vender, + de card." },
          ]}
        />
      </Chapter>
    </>
  )
}

function ComponentesPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Componentes</h1>
        <Lead>
          Estos son los componentes de Vender v2. Variantes mínimas. Estados explícitos. Si hace
          falta una tercera variante, primero se cuestiona el problema.
        </Lead>
      </header>

      <Chapter id="card" title="Product card">
        <Body>
          Botón entero. Media 96, título 2 líneas, precio metric-small, stock a la derecha.
          El + savia es la única acción de la card: agregar. Hover levanta 2px y aclara el
          borde. Focus: anillo savia sobre sombra-700. Disabled por stock: cursor not-allowed,
          sin + , aria-label incluye “sin stock”.
        </Body>
        <div className={cn(libraryDoPanelClass, "rounded-2xl p-4")}>
          El nombre se lee. El precio se compara. El + confirma que se puede agregar.
        </div>
        <div className={cn(libraryDontPanelClass, "rounded-2xl p-4")}>
          No cortar el nombre a una línea para “entrar más cards”. No usar savia de ring
          permanente: el rayo se gasta.
        </div>
      </Chapter>

      <Chapter id="ticket" title="Ticket">
        <Body>
          Lienzo bruma-100. Título “Pedido” + conteo de ítems. Líneas en papel claro. Totales
          de desglose en el ticket; el total de cierre vive en el umbral. Vacío: “El pedido
          espera.” + “Escaneá o tocá un producto.”
        </Body>
      </Chapter>

      <Chapter id="checkout" title="Umbral de checkout">
        <Body>
          Tres slots — Cliente, Comprobante, Pago — más Descartar, Ahorro si existe, Total y
          Vender. Slots configurados se leen (sombra-50 / sombra-200). No se pintan de savia.
          Disabled: tinta sombra-500, cursor not-allowed, opacidad 1. aria-pressed marca el
          configurado. El CTA puede decir “Vender $1.200”: el verbo cierra, la cifra confirma.
        </Body>
      </Chapter>

      <Chapter id="busqueda" title="Búsqueda / escaneo">
        <Body>
          Placeholder: “Escanear o buscar…”. Focus savia-400. Es el atajo de mostrador. No
          compete con el CTA: es un campo, no un rayo.
        </Body>
      </Chapter>

      <Chapter id="banner" title="Banner de caja">
        <Body>
          Intent warning, tono dark. Título: “Necesitás una caja abierta”. Mensaje: “Abrí un
          turno en Cajas para poder cobrar.” Acción: “Ir a cajas”. Bloquea el oficio sin
          teatralizar.
        </Body>
      </Chapter>
    </>
  )
}

function PatronesPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Patrones de interacción y contenido</h1>
        <Lead>
          Vender es un loop: encontrar → agregar → revisar → configurar → cerrar. Cada paso
          tiene un lugar. Ninguno interrumpe al anterior con un modal si puede vivir en el
          umbral.
        </Lead>
      </header>

      <Chapter id="loop" title="Loop de cobro">
        <ol className={cn(libraryDocBodyClass, "list-decimal space-y-2 pl-5")}>
          <li>Encontrar en sombra: rail, escaneo, grilla.</li>
          <li>Agregar: la card es el hit. Feedback inmediato en el ticket.</li>
          <li>Revisar en bruma: cantidad, descuento, comentario.</li>
          <li>Configurar en el umbral: cliente, comprobante, pago.</li>
          <li>Cerrar: un rayo. Confirmación solo si hay riesgo (cuenta corriente, descuento alto).</li>
        </ol>
      </Chapter>

      <Chapter id="contenido" title="Contenido">
        <RuleTable
          rows={[
            { token: "CTA", value: "Vender / Vender $X", use: "Verbo de oficio. La cifra es opcional si el total ya se lee." },
            { token: "Ahorro", value: "Ahorro · $X", use: "Dato. No “Se ahorra”." },
            { token: "Vacío ticket", value: "El pedido espera.", use: "Más el paso: Escaneá o tocá un producto." },
            { token: "Vacío catálogo", value: "No hay productos.", use: "Activalos en Artículos. Rootsy no se disculpa." },
            { token: "Bloqueo", value: "Agregá productos al pedido.", use: "El title del CTA explica por qué no cierra." },
            { token: "Peligro", value: "¿Descartar la venta?", use: "Nombra la consecuencia. Sin eufemismo." },
          ]}
        />
      </Chapter>
    </>
  )
}

function AccesibilidadPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Criterios de accesibilidad</h1>
        <Lead>
          En un mostrador el teclado, el contraste y el foco no son “después”. Son parte del
          cobro. El v2 los trata como no negociables.
        </Lead>
      </header>

      <Chapter id="criterios" title="Reglas">
        <ul className={cn(libraryDocBodyClass, "list-disc space-y-2 pl-5")}>
          <li>Contraste de texto muted ≥ 4.5:1 sobre su atmósfera. sombra-200 sobre 600/700, no 300 al 82%.</li>
          <li>Disabled no usa opacity-45. Usa tinta muted y cursor not-allowed.</li>
          <li>Focus visible: anillo savia-400. Nunca ring-0 en controles operativos.</li>
          <li>La card anuncia nombre + precio. Si no hay stock, lo dice.</li>
          <li>Slots de checkout: aria-label completo, aria-pressed si está configurado.</li>
          <li>El total del umbral es aria-live polite.</li>
          <li>Táctil: hit de card entero, CTA large, slots a altura de umbral.</li>
          <li>prefers-reduced-motion: sin lift, sin scale, sin zoom de foto.</li>
        </ul>
      </Chapter>
    </>
  )
}

function VenderPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Aplicación en Vender</h1>
        <Lead>
          Vender es la pantalla fuente del v2. La estructura funcional se conservó: catálogo,
          ticket, umbral, diálogos. Lo que cambió es la jerarquía, el rayo, la lectura y la voz.
        </Lead>
      </header>

      <Chapter id="anatomia" title="Anatomía">
        <RuleTable
          rows={[
            { token: "Shell", value: "DataWorkspaceOperationsLayout", use: "Header, rail, título Vender." },
            { token: "Catálogo", value: "Sombra 700 · cards 600", use: "Encontrar y agregar." },
            { token: "Ticket", value: "Bruma 100", use: "Revisar el pedido. Desglose, no cierre." },
            { token: "Umbral", value: "Negro → savia 975", use: "Configurar y cerrar. Un rayo." },
            { token: "Banner", value: "Warning dark", use: "Sin caja no hay cobro." },
          ]}
        />
      </Chapter>

      <Chapter id="por-que" title="Por qué cada decisión">
        <CardGrid>
          <SpecCard title="Card 208 / 2 líneas">
            El nombre es el reconocimiento. Cortarlo a una línea era una decisión de densidad
            que le ganaba al oficio.
          </SpecCard>
          <SpecCard title="Savia solo en Vender">
            Los slots configurados en savia diluían el CTA. Ahora se leen. El ojo va al cierre.
          </SpecCard>
          <SpecCard title="Ahorro">
            En el umbral se escanea. Un sustantivo + cifra entra más rápido que una oración.
          </SpecCard>
          <SpecCard title="Pedido + N ítems">
            Confirma que el ticket tiene cuerpo sin forzar a contar líneas.
          </SpecCard>
          <SpecCard title="Empty con paso">
            “El pedido espera” solo era atmósfera. El paso concreto cierra la conversación con
            el catálogo.
          </SpecCard>
          <SpecCard title="Foco y disabled">
            Un cajero con teclado y un supervisor con lupa tienen que poder cobrar. El v1 los
            dejaba a medias.
          </SpecCard>
        </CardGrid>
      </Chapter>
    </>
  )
}

function MejorasPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Mejoras implementadas</h1>
        <Lead>
          Priorizadas por impacto en el usuario, el negocio y la marca. Todas viven en la
          pantalla Vender y en el sistema que la sostiene.
        </Lead>
      </header>

      <Chapter id="lista" title="Lista priorizada">
        <PriorityList
          items={[
            {
              id: "rayo",
              title: "Un rayo: savia reservada al commit",
              impact: "Conversión · marca",
              why: "Los íconos configurados ya no compiten con Vender. El cierre es el único movimiento verde.",
            },
            {
              id: "card",
              title: "Card de catálogo reconocible",
              impact: "Usuario · velocidad",
              why: "Título de dos líneas, media 96, hover y foco visibles, aria-label con precio. Encontrar es más barato.",
            },
            {
              id: "a11y",
              title: "Disabled y foco de oficio",
              impact: "Accesibilidad · confianza",
              why: "Se termina el fantasma al 45%. El teclado tiene anillo. El stock se lee.",
            },
            {
              id: "copy",
              title: "Microcopy que nombra el próximo paso",
              impact: "Contenido · conversión",
              why: "Ahorro, empty del ticket, banner de caja, placeholder de escaneo. Menos poesía suelta, más oficio.",
            },
            {
              id: "ticket",
              title: "Ticket que confirma el cuerpo",
              impact: "Usuario",
              why: "Conteo de ítems y meta en bruma, no en slate. El pedido se siente papel, no leftover.",
            },
            {
              id: "sistema",
              title: "Una receta, documentada aparte",
              impact: "Marca · escala",
              why: "El v1 no se sobrescribe. El v2 existe en /handbook/v2 y se puede extender sin reabrir el menú A/B/C.",
            },
          ]}
        />
      </Chapter>
    </>
  )
}

function ExtensionPage() {
  return (
    <>
      <header className="space-y-4">
        <h1 className={libraryDocPageTitleClass}>Extender el sistema</h1>
        <Lead>
          Vender es la fuente. Comprar, Mesas, Mostrador y Vender servicio heredan la receta,
          no una copia decorada.
        </Lead>
      </header>

      <Chapter id="operar" title="Resto de Operar">
        <Body>
          Misma grilla, mismas orillas, mismo umbral. Cambia el verbo: Pagar, Enviar, Cerrar
          mesa. El rayo sigue siendo uno. El ticket puede sumar contexto (mesa, canal) a la
          derecha del título, como ya hace el panel. No se reabre el menú de propuestas.
        </Body>
      </Chapter>

      <Chapter id="lectura" title="Pantallas de lectura">
        <Body>
          Tablas, ABM y estadísticas viven en bruma. No importar sombra porque “se ve premium”.
          Savia solo en el submit. Éter para el afuera (home, menú).
        </Body>
      </Chapter>

      <Chapter id="deuda" title="Deuda que el v2 deja explícita">
        <ul className={cn(libraryDocBodyClass, "list-disc space-y-2 pl-5")}>
          <li>Retirar leftover slate/emerald en variantes no-operar de la toolbar y el total pos.</li>
          <li>Unificar diálogos de checkout a tokens bruma, no zinc.</li>
          <li>Matar las propuestas A/B/C en la librería o moverlas a archivo.</li>
          <li>Completar journeys y naming en el handbook de marca — son huecos de producto, no de UI.</li>
          <li>Medir: tiempo a primer ítem, tiempo a Vender, errores de caja cerrada, uso de teclado.</li>
        </ul>
      </Chapter>

      <Chapter id="como-usar" title="Cómo usar este sistema">
        <ol className={cn(libraryDocBodyClass, "list-decimal space-y-2 pl-5")}>
          <li>Partir de Vender, no de un specimen suelto.</li>
          <li>Si el patrón ya existe, se reutiliza. Si no, se documenta aquí antes de copiarlo.</li>
          <li>Una acción savia por superficie.</li>
          <li>Tokens Rootsy. Nada de hex ni Tailwind de otra era.</li>
          <li>El handbook v1 sigue siendo la fuente de esencia. Este v2 es la fuente de receta.</li>
        </ol>
      </Chapter>
    </>
  )
}

const PAGES: Record<string, () => ReactNode> = {
  overview: OverviewPage,
  esencia: EsenciaPage,
  evolucion: EvolucionPage,
  fundamentos: FundamentosPage,
  tokens: TokensPage,
  componentes: ComponentesPage,
  patrones: PatronesPage,
  accesibilidad: AccesibilidadPage,
  vender: VenderPage,
  mejoras: MejorasPage,
  extension: ExtensionPage,
}

export function HandbookV2View({ pageId }: Props) {
  const page = getHandbookV2Page(pageId)
  const Page = PAGES[pageId] ?? OverviewPage

  return (
    <article className="space-y-2">
      {page && !PAGES[pageId] ? (
        <h1 className={libraryDocPageTitleClass}>{page.label}</h1>
      ) : null}
      <Page />
    </article>
  )
}
